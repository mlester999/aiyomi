-- Forward-only Phase 1A waitlist schema for a linked hosted non-production project.

create type public.waitlist_platform_interest as enum ('ios', 'android', 'both');
create type public.waitlist_signup_status as enum (
  'pending',
  'confirmed',
  'invited',
  'converted',
  'unsubscribed'
);
create type public.waitlist_signup_source as enum (
  'landing_page',
  'direct',
  'referral',
  'organic',
  'social',
  'other'
);

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  platform_interest public.waitlist_platform_interest not null,
  status public.waitlist_signup_status not null default 'pending',
  source public.waitlist_signup_source not null default 'landing_page',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  referred_by uuid references public.waitlist_signups (id) on delete set null,
  locale text,
  marketing_consent boolean not null default false,
  consent_at timestamptz,
  resend_contact_id text,
  confirmation_sent_at timestamptz,
  converted_user_id uuid references auth.users (id) on delete cascade,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint waitlist_email_normalized check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint waitlist_first_name_valid check (
    first_name is null
    or (
      first_name = btrim(first_name)
      and char_length(first_name) between 1 and 80
    )
  ),
  constraint waitlist_utm_source_valid check (
    utm_source is null
    or (
      char_length(utm_source) between 1 and 100
      and utm_source ~ '^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$'
    )
  ),
  constraint waitlist_utm_medium_valid check (
    utm_medium is null
    or (
      char_length(utm_medium) between 1 and 100
      and utm_medium ~ '^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$'
    )
  ),
  constraint waitlist_utm_campaign_valid check (
    utm_campaign is null
    or (
      char_length(utm_campaign) between 1 and 100
      and utm_campaign ~ '^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$'
    )
  ),
  constraint waitlist_utm_content_valid check (
    utm_content is null
    or (
      char_length(utm_content) between 1 and 100
      and utm_content ~ '^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$'
    )
  ),
  constraint waitlist_utm_term_valid check (
    utm_term is null
    or (
      char_length(utm_term) between 1 and 100
      and utm_term ~ '^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$'
    )
  ),
  constraint waitlist_referral_code_valid check (
    referral_code is null
    or referral_code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'
  ),
  constraint waitlist_not_self_referred check (
    referred_by is null or referred_by <> id
  ),
  constraint waitlist_locale_valid check (
    locale is null
    or (
      char_length(locale) between 2 and 35
      and locale ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
    )
  ),
  constraint waitlist_consent_timestamp_valid check (
    (marketing_consent and consent_at is not null)
    or (not marketing_consent and consent_at is null)
  ),
  constraint waitlist_resend_contact_id_valid check (
    resend_contact_id is null
    or char_length(resend_contact_id) between 1 and 128
  ),
  constraint waitlist_conversion_valid check (
    (converted_user_id is null and converted_at is null)
    or (converted_user_id is not null and converted_at is not null)
  ),
  constraint waitlist_converted_status_valid check (
    status <> 'converted'
    or (converted_user_id is not null and converted_at is not null)
  ),
  constraint waitlist_timestamps_valid check (updated_at >= created_at)
);

create unique index waitlist_signups_referral_code_key
  on public.waitlist_signups (referral_code)
  where referral_code is not null;

create unique index waitlist_signups_resend_contact_id_key
  on public.waitlist_signups (resend_contact_id)
  where resend_contact_id is not null;

create unique index waitlist_signups_converted_user_id_key
  on public.waitlist_signups (converted_user_id)
  where converted_user_id is not null;

create index waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

create index waitlist_signups_status_created_at_idx
  on public.waitlist_signups (status, created_at desc);

create index waitlist_signups_platform_interest_idx
  on public.waitlist_signups (platform_interest);

create index waitlist_signups_source_idx
  on public.waitlist_signups (source);

create index waitlist_signups_utm_campaign_idx
  on public.waitlist_signups (utm_campaign)
  where utm_campaign is not null;

create index waitlist_signups_referred_by_idx
  on public.waitlist_signups (referred_by)
  where referred_by is not null;

create or replace function public.set_waitlist_signup_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_waitlist_signup_updated_at
before update on public.waitlist_signups
for each row execute function public.set_waitlist_signup_updated_at();

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_signups force row level security;

revoke all on table public.waitlist_signups from anon, authenticated;
grant all on table public.waitlist_signups to service_role;
revoke all on function public.set_waitlist_signup_updated_at() from public;
grant execute on function public.set_waitlist_signup_updated_at() to service_role;

comment on table public.waitlist_signups is
  'Private waitlist leads written only by trusted server-side code.';
comment on column public.waitlist_signups.referred_by is
  'Resolved signup ID for a valid inbound referral code.';
comment on column public.waitlist_signups.referral_code is
  'Optional code assigned to this signup for future referral sharing.';
