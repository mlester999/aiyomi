-- Phase 3 private notification preferences and multi-device push-token storage.
-- This migration depends on 202608140001_create_consumer_foundation.sql.

create type public.mobile_device_platform as enum (
  'ios',
  'android'
);

create type public.notification_permission_status as enum (
  'undetermined',
  'granted',
  'denied',
  'unavailable'
);

create or replace function private.set_device_push_token_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = now();
  else
    new.created_at = old.created_at;
  end if;

  new.updated_at = now();

  if new.last_seen_at < new.created_at then
    new.last_seen_at = new.created_at;
  end if;

  return new;
end;
$$;

create table public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  morning_plan boolean not null default false,
  upcoming_activity boolean not null default false,
  schedule_adjustments boolean not null default false,
  focus_reminder boolean not null default false,
  break_finished boolean not null default false,
  daily_reflection boolean not null default false,
  weekly_recap boolean not null default false,
  streak_reminder boolean not null default false,
  achievements boolean not null default false,
  quiet_hours_enabled boolean not null default true,
  quiet_start time without time zone not null default time '22:00',
  quiet_end time without time zone not null default time '07:00',
  timezone public.iana_timezone_name,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notification_preferences_quiet_hours_valid check (
    quiet_start <> quiet_end
  ),
  constraint notification_preferences_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  installation_id text not null,
  platform public.mobile_device_platform not null,
  expo_push_token text,
  enabled boolean not null default false,
  permission_status public.notification_permission_status not null
    default 'undetermined',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint device_push_tokens_token_valid check (
    expo_push_token is null
    or (
      expo_push_token = btrim(expo_push_token)
      and char_length(expo_push_token) between 16 and 512
      and expo_push_token !~ '[[:space:][:cntrl:]]'
    )
  ),
  constraint device_push_tokens_installation_id_valid check (
    installation_id = btrim(installation_id)
    and char_length(installation_id) between 1 and 128
    and installation_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'
  ),
  constraint device_push_tokens_permission_enabled_valid check (
    not enabled
    or (
      permission_status = 'granted'
      and expo_push_token is not null
    )
  ),
  constraint device_push_tokens_last_seen_valid check (
    last_seen_at >= created_at
  ),
  constraint device_push_tokens_timestamps_valid check (
    updated_at >= created_at
  ),
  constraint device_push_tokens_installation_unique unique (
    user_id,
    installation_id
  )
);

create unique index device_push_tokens_token_key
  on public.device_push_tokens (expo_push_token)
  where expo_push_token is not null;

create index device_push_tokens_user_enabled_idx
  on public.device_push_tokens (user_id, enabled, last_seen_at desc);

create trigger set_notification_preferences_updated_at
before insert or update on public.notification_preferences
for each row execute function private.set_phase3_updated_at();

create trigger set_device_push_tokens_updated_at
before insert or update on public.device_push_tokens
for each row execute function private.set_device_push_token_timestamps();

alter table public.notification_preferences enable row level security;
alter table public.notification_preferences force row level security;
alter table public.device_push_tokens enable row level security;
alter table public.device_push_tokens force row level security;

revoke all on table public.notification_preferences
  from public, anon, authenticated;
grant select, insert, update, delete on table public.notification_preferences
  to authenticated;
grant all on table public.notification_preferences to service_role;

revoke all on table public.device_push_tokens
  from public, anon, authenticated;
grant select, insert, update, delete on table public.device_push_tokens
  to authenticated;
grant all on table public.device_push_tokens to service_role;

create policy notification_preferences_own_rows
on public.notification_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy device_push_tokens_own_rows
on public.device_push_tokens
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on function private.set_device_push_token_timestamps()
  from public, anon, authenticated;

comment on table public.notification_preferences is
  'Private account-level notification choices and local-time quiet hours.';
comment on table public.device_push_tokens is
  'Private multi-device Expo push tokens. Tokens are excluded from analytics and broad admin access.';
