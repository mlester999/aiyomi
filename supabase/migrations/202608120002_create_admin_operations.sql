-- Phase 2 environment-locked admin operations and bounded waitlist RPCs.
-- This migration depends on 202608120001_create_admin_authorization.sql.
-- Apply and validate only against a deliberately confirmed hosted Development
-- or Staging project. Never use Production as the first validation target.

create type public.deployment_environment as enum (
  'development',
  'staging',
  'production'
);

create type public.feature_flag_key as enum ('waitlist_enabled');

create type public.application_setting_key as enum (
  'support_url',
  'privacy_url',
  'terms_url'
);

create table public.admin_environment (
  singleton boolean primary key default true,
  environment public.deployment_environment not null,
  configured_at timestamptz not null default now(),

  constraint admin_environment_singleton check (singleton)
);

create table private.admin_super_admin_guard (
  singleton boolean primary key default true,
  touched_at timestamptz not null default now(),

  constraint admin_super_admin_guard_singleton check (singleton)
);

insert into private.admin_super_admin_guard (singleton) values (true);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key public.feature_flag_key not null,
  description text not null,
  enabled boolean not null default false,
  environment public.deployment_environment not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_members (id) on delete set null,

  constraint feature_flags_environment_key_unique unique (environment, key),
  constraint feature_flags_description_valid check (
    description = btrim(description)
    and char_length(description) between 1 and 240
  ),
  constraint feature_flags_metadata_valid check (
    jsonb_typeof(metadata) = 'object'
    and pg_column_size(metadata) <= 8192
  ),
  constraint feature_flags_timestamps_valid check (updated_at >= created_at)
);

create table public.application_settings (
  id uuid primary key default gen_random_uuid(),
  key public.application_setting_key not null,
  value text not null,
  environment public.deployment_environment not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_members (id) on delete set null,

  constraint application_settings_environment_key_unique unique (environment, key),
  constraint application_settings_value_valid check (
    value = btrim(value)
    and char_length(value) between 8 and 500
    and value !~ '[[:space:]?#]'
    and value !~ '://[.-]'
    and value !~ '\.\.'
    and (
      value ~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?(/[A-Za-z0-9._~:/%+@=-]*)?$'
      or (
        environment = 'development'
        and value ~ '^http://(localhost|127\.0\.0\.1)(:[0-9]{1,5})?(/[A-Za-z0-9._~:/%+@=-]*)?$'
      )
    )
  ),
  constraint application_settings_timestamps_valid check (updated_at >= created_at)
);

create index feature_flags_environment_updated_at_idx
  on public.feature_flags (environment, updated_at desc);

create index application_settings_environment_updated_at_idx
  on public.application_settings (environment, updated_at desc);

create index waitlist_signups_confirmation_sent_at_idx
  on public.waitlist_signups (confirmation_sent_at desc)
  where confirmation_sent_at is not null;

create index waitlist_signups_converted_at_idx
  on public.waitlist_signups (converted_at desc)
  where converted_at is not null;

create or replace function private.set_admin_operation_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_feature_flags_updated_at
before update on public.feature_flags
for each row execute function private.set_admin_operation_updated_at();

create trigger set_application_settings_updated_at
before update on public.application_settings
for each row execute function private.set_admin_operation_updated_at();

create or replace function private.prevent_admin_environment_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'The configured admin environment is immutable.'
    using errcode = '55000';
end;
$$;

create trigger prevent_admin_environment_change
before update or delete on public.admin_environment
for each row execute function private.prevent_admin_environment_change();

create trigger prevent_admin_environment_truncate
before truncate on public.admin_environment
for each statement execute function private.prevent_admin_environment_change();

create or replace function private.prevent_admin_member_truncate()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Admin memberships cannot be truncated.'
    using errcode = '42501';
end;
$$;

create trigger prevent_admin_member_truncate
before truncate on public.admin_members
for each statement execute function private.prevent_admin_member_truncate();

create or replace function private.protect_last_active_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requires_guard boolean := false;
  v_other_active_super_admins bigint;
begin
  if tg_op = 'DELETE' then
    v_requires_guard := old.role = 'super_admin' and old.status = 'active';
  else
    v_requires_guard := old.role = 'super_admin'
      and old.status = 'active'
      and (new.role <> 'super_admin' or new.status <> 'active');
  end if;

  if v_requires_guard then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('aiyomi.admin_members.super_admin_guard', 0)
    );

    update private.admin_super_admin_guard as guard
    set touched_at = pg_catalog.clock_timestamp()
    where guard.singleton;

    select count(*)
    into v_other_active_super_admins
    from public.admin_members as member
    where member.id <> old.id
      and member.role = 'super_admin'
      and member.status = 'active';

    if v_other_active_super_admins = 0 then
      raise exception
        'The final active Super Admin cannot be removed, suspended, or demoted.'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger protect_last_active_super_admin
before update or delete on public.admin_members
for each row execute function private.protect_last_active_super_admin();

create or replace function private.current_admin_environment()
returns public.deployment_environment
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_environment public.deployment_environment;
begin
  select configured.environment
  into v_environment
  from public.admin_environment as configured
  where configured.singleton;

  if not found then
    raise exception 'The admin environment has not been configured.'
      using errcode = '55000';
  end if;

  return v_environment;
end;
$$;

create or replace function private.escape_like_pattern(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select replace(
    replace(
      replace(p_value, E'\\', E'\\\\'),
      '%',
      E'\\%'
    ),
    '_',
    E'\\_'
  );
$$;

create or replace function private.csv_safe_text(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_value is null then null
    when p_value ~ '^[[:space:]]*[=+@-]' then '''' || p_value
    else p_value
  end;
$$;

insert into public.feature_flags (
  key,
  description,
  enabled,
  environment
)
select
  'waitlist_enabled',
  'Controls whether the public waitlist accepts new signups.',
  true,
  environments.environment
from unnest(enum_range(null::public.deployment_environment))
  as environments(environment);

alter table public.admin_environment enable row level security;
alter table public.admin_environment force row level security;
alter table public.feature_flags enable row level security;
alter table public.feature_flags force row level security;
alter table public.application_settings enable row level security;
alter table public.application_settings force row level security;

revoke all on table public.admin_environment from public, anon, authenticated;
revoke all on table public.feature_flags from public, anon, authenticated;
revoke all on table public.application_settings from public, anon, authenticated;
revoke all on table private.admin_super_admin_guard
  from public, anon, authenticated, service_role;

comment on table public.admin_environment is
  'Owner-configured immutable singleton that identifies this hosted project environment.';
comment on table public.feature_flags is
  'Allowlisted environment-scoped operational feature flags. Metadata must never contain secrets.';
comment on table public.application_settings is
  'Allowlisted environment-scoped public URL settings. Provider secrets are prohibited.';

create or replace function public.is_waitlist_enabled()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    (
      select flag.enabled
      from public.admin_environment as configured
      join public.feature_flags as flag
        on flag.environment = configured.environment
       and flag.key = 'waitlist_enabled'
      where configured.singleton
      limit 1
    ),
    false
  );
$$;

create or replace function public.admin_get_current_member(
  p_expected_environment public.deployment_environment
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_environment public.deployment_environment;
begin
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  return public.admin_get_current_member();
end;
$$;

create or replace function public.admin_get_dashboard(p_days integer default 30)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_today date := (now() at time zone 'UTC')::date;
  v_total_leads bigint;
  v_joined_today bigint;
  v_joined_7_days bigint;
  v_joined_30_days bigint;
  v_confirmation_sent bigint;
  v_referral_signups bigint;
  v_converted_users bigint;
  v_daily_signups jsonb;
  v_platform_distribution jsonb;
  v_source_distribution jsonb;
begin
  v_member := private.require_admin_permission(
    'dashboard.read'::public.admin_permission
  );

  if p_days is null or p_days not between 1 and 90 then
    raise exception 'Dashboard window must be between 1 and 90 days.'
      using errcode = '22023';
  end if;

  select
    count(*),
    count(*) filter (
      where signup.created_at >= (v_today::timestamp at time zone 'UTC')
    ),
    count(*) filter (
      where signup.created_at >= ((v_today - 6)::timestamp at time zone 'UTC')
    ),
    count(*) filter (
      where signup.created_at >= ((v_today - 29)::timestamp at time zone 'UTC')
    ),
    count(*) filter (where signup.confirmation_sent_at is not null),
    count(*) filter (where signup.referred_by is not null),
    count(*) filter (where signup.converted_user_id is not null)
  into
    v_total_leads,
    v_joined_today,
    v_joined_7_days,
    v_joined_30_days,
    v_confirmation_sent,
    v_referral_signups,
    v_converted_users
  from public.waitlist_signups as signup;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('date', days.day, 'count', coalesce(counts.count, 0))
      order by days.day
    ),
    '[]'::jsonb
  )
  into v_daily_signups
  from (
    select series.day::date as day
    from pg_catalog.generate_series(
      v_today - (p_days - 1),
      v_today,
      interval '1 day'
    ) as series(day)
  ) as days
  left join (
    select
      (signup.created_at at time zone 'UTC')::date as day,
      count(*) as count
    from public.waitlist_signups as signup
    where signup.created_at >= (
      (v_today - (p_days - 1))::timestamp at time zone 'UTC'
    )
      and signup.created_at < ((v_today + 1)::timestamp at time zone 'UTC')
    group by (signup.created_at at time zone 'UTC')::date
  ) as counts on counts.day = days.day;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', platforms.platform::text,
        'count', coalesce(counts.count, 0),
        'percentage', case
          when v_total_leads = 0 then 0
          else round(coalesce(counts.count, 0) * 100.0 / v_total_leads, 2)
        end
      )
      order by platforms.platform::text
    ),
    '[]'::jsonb
  )
  into v_platform_distribution
  from unnest(enum_range(null::public.waitlist_platform_interest))
    as platforms(platform)
  left join (
    select signup.platform_interest as platform, count(*) as count
    from public.waitlist_signups as signup
    group by signup.platform_interest
  ) as counts on counts.platform = platforms.platform;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', sources.source::text,
        'count', coalesce(counts.count, 0),
        'percentage', case
          when v_total_leads = 0 then 0
          else round(coalesce(counts.count, 0) * 100.0 / v_total_leads, 2)
        end
      )
      order by sources.source::text
    ),
    '[]'::jsonb
  )
  into v_source_distribution
  from unnest(enum_range(null::public.waitlist_signup_source))
    as sources(source)
  left join (
    select signup.source, count(*) as count
    from public.waitlist_signups as signup
    group by signup.source
  ) as counts on counts.source = sources.source;

  return jsonb_build_object(
    'generated_at', now(),
    'window_days', p_days,
    'metrics', jsonb_build_object(
      'total_leads', v_total_leads,
      'joined_today', v_joined_today,
      'joined_7_days', v_joined_7_days,
      'joined_30_days', v_joined_30_days,
      'confirmation_sent', v_confirmation_sent,
      'referral_signups', v_referral_signups,
      'converted_users', v_converted_users
    ),
    'daily_signups', v_daily_signups,
    'platform_distribution', v_platform_distribution,
    'source_distribution', v_source_distribution
  );
end;
$$;

create or replace function public.admin_list_waitlist(
  p_search text default null,
  p_status public.waitlist_signup_status default null,
  p_platform public.waitlist_platform_interest default null,
  p_source public.waitlist_signup_source default null,
  p_campaign text default null,
  p_email_status text default null,
  p_converted boolean default null,
  p_date_from date default null,
  p_date_to date default null,
  p_sort text default 'newest',
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  email text,
  first_name text,
  platform_interest public.waitlist_platform_interest,
  status public.waitlist_signup_status,
  source public.waitlist_signup_source,
  utm_source text,
  utm_campaign text,
  referral_code text,
  referred_by_code text,
  email_status text,
  converted boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_search text;
  v_campaign text;
begin
  v_member := private.require_admin_permission(
    'waitlist.read'::public.admin_permission
  );

  if p_search is not null then
    v_search := btrim(p_search);
    if char_length(v_search) not between 1 and 120 then
      raise exception 'Search must be between 1 and 120 characters.'
        using errcode = '22023';
    end if;
    v_search := private.escape_like_pattern(v_search);
  end if;

  if p_campaign is not null then
    v_campaign := btrim(p_campaign);
    if char_length(v_campaign) not between 1 and 100 then
      raise exception 'Campaign must be between 1 and 100 characters.'
        using errcode = '22023';
    end if;
  end if;

  if v_member.role = 'support' and v_campaign is not null then
    raise exception 'Support access does not include campaign filtering.'
      using errcode = '42501';
  end if;

  if p_email_status is not null
    and p_email_status not in ('sent', 'not_sent')
  then
    raise exception 'Email status must be sent or not_sent.'
      using errcode = '22023';
  end if;

  if p_sort is null
    or p_sort not in ('newest', 'oldest', 'email', 'status', 'source')
  then
    raise exception 'Invalid waitlist sort.' using errcode = '22023';
  end if;

  if p_page is null or p_page not between 1 and 100000 then
    raise exception 'Page must be between 1 and 100000.'
      using errcode = '22023';
  end if;

  if p_page_size is null or p_page_size not in (25, 50, 100) then
    raise exception 'Page size must be 25, 50, or 100.'
      using errcode = '22023';
  end if;

  if p_date_from is not null
    and p_date_to is not null
    and p_date_from > p_date_to
  then
    raise exception 'Start date must not be after end date.'
      using errcode = '22023';
  end if;

  if p_date_from is not null
    and p_date_to is not null
    and p_date_to - p_date_from > 366
  then
    raise exception 'Date range cannot exceed 366 days.'
      using errcode = '22023';
  end if;

  return query
  select
    signup.id,
    signup.email,
    signup.first_name,
    signup.platform_interest,
    signup.status,
    signup.source,
    case when v_member.role = 'support' then null else signup.utm_source end,
    case when v_member.role = 'support' then null else signup.utm_campaign end,
    case when v_member.role = 'support' then null else signup.referral_code end,
    case when v_member.role = 'support' then null else referrer.referral_code end,
    case
      when signup.confirmation_sent_at is null then 'not_sent'
      else 'sent'
    end,
    signup.converted_user_id is not null,
    signup.created_at,
    signup.updated_at,
    count(*) over ()
  from public.waitlist_signups as signup
  left join public.waitlist_signups as referrer on referrer.id = signup.referred_by
  where (
      v_search is null
      or signup.email ilike '%' || v_search || '%' escape E'\\'
      or signup.first_name ilike '%' || v_search || '%' escape E'\\'
      or (
        v_member.role <> 'support'
        and signup.referral_code ilike '%' || v_search || '%' escape E'\\'
      )
    )
    and (p_status is null or signup.status = p_status)
    and (p_platform is null or signup.platform_interest = p_platform)
    and (p_source is null or signup.source = p_source)
    and (
      v_campaign is null
      or lower(signup.utm_campaign) = lower(v_campaign)
    )
    and (
      p_email_status is null
      or (p_email_status = 'sent' and signup.confirmation_sent_at is not null)
      or (p_email_status = 'not_sent' and signup.confirmation_sent_at is null)
    )
    and (
      p_converted is null
      or (signup.converted_user_id is not null) = p_converted
    )
    and (
      p_date_from is null
      or signup.created_at >= (p_date_from::timestamp at time zone 'UTC')
    )
    and (
      p_date_to is null
      or signup.created_at < ((p_date_to + 1)::timestamp at time zone 'UTC')
    )
  order by
    case when p_sort = 'newest' then signup.created_at end desc,
    case when p_sort = 'oldest' then signup.created_at end asc,
    case when p_sort = 'email' then signup.email end asc,
    case when p_sort = 'status' then signup.status end asc,
    case when p_sort = 'source' then signup.source end asc,
    signup.id desc
  limit p_page_size
  offset (p_page - 1) * p_page_size;
end;
$$;

create or replace function public.admin_get_waitlist_lead(p_signup_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_signup public.waitlist_signups%rowtype;
  v_referrer public.waitlist_signups%rowtype;
  v_referral_count bigint;
  v_is_support boolean;
begin
  v_member := private.require_admin_permission(
    'waitlist.read'::public.admin_permission
  );

  if p_signup_id is null then
    raise exception 'Signup ID is required.' using errcode = '22023';
  end if;

  select signup.*
  into v_signup
  from public.waitlist_signups as signup
  where signup.id = p_signup_id;

  if not found then
    return null;
  end if;

  if v_signup.referred_by is not null then
    select referrer.*
    into v_referrer
    from public.waitlist_signups as referrer
    where referrer.id = v_signup.referred_by;
  end if;

  select count(*)
  into v_referral_count
  from public.waitlist_signups as referred
  where referred.referred_by = v_signup.id;

  v_is_support := v_member.role = 'support';

  return jsonb_build_object(
    'lead', jsonb_build_object(
      'id', v_signup.id,
      'email', v_signup.email,
      'first_name', v_signup.first_name,
      'platform_interest', v_signup.platform_interest,
      'status', v_signup.status,
      'created_at', v_signup.created_at,
      'updated_at', v_signup.updated_at
    ),
    'lifecycle', jsonb_build_object(
      'status', v_signup.status,
      'created_at', v_signup.created_at,
      'updated_at', v_signup.updated_at
    ),
    'email', jsonb_build_object(
      'status', case
        when v_signup.confirmation_sent_at is null then 'not_sent'
        else 'sent'
      end,
      'confirmation_sent_at', v_signup.confirmation_sent_at
    ),
    'attribution', case
      when v_is_support then '{}'::jsonb
      else jsonb_build_object(
        'source', v_signup.source,
        'utm_source', v_signup.utm_source,
        'utm_medium', v_signup.utm_medium,
        'utm_campaign', v_signup.utm_campaign,
        'utm_content', v_signup.utm_content,
        'utm_term', v_signup.utm_term,
        'locale', v_signup.locale
      )
    end,
    'referral', case
      when v_is_support then '{}'::jsonb
      else jsonb_build_object(
        'referral_code', v_signup.referral_code,
        'referred_by', case
          when v_signup.referred_by is null then null
          else jsonb_build_object(
            'id', v_referrer.id,
            'email', v_referrer.email,
            'first_name', v_referrer.first_name,
            'referral_code', v_referrer.referral_code,
            'status', v_referrer.status
          )
        end,
        'referral_count', v_referral_count
      )
    end,
    'consent', case
      when v_is_support then '{}'::jsonb
      else jsonb_build_object(
        'marketing_consent', v_signup.marketing_consent,
        'consent_at', v_signup.consent_at
      )
    end,
    'conversion', case
      when v_is_support then jsonb_build_object(
        'converted', v_signup.converted_user_id is not null
      )
      else jsonb_build_object(
        'converted', v_signup.converted_user_id is not null,
        'converted_user_id', v_signup.converted_user_id,
        'converted_at', v_signup.converted_at
      )
    end,
    'access', jsonb_build_object(
      'role', v_member.role,
      'redacted', v_is_support,
      'redacted_sections', case
        when v_is_support then jsonb_build_array(
          'attribution',
          'referral',
          'consent',
          'conversion_details'
        )
        else '[]'::jsonb
      end
    )
  );
end;
$$;

create or replace function public.admin_update_waitlist_status(
  p_signup_id uuid,
  p_status public.waitlist_signup_status,
  p_expected_environment public.deployment_environment,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
  v_signup public.waitlist_signups%rowtype;
  v_previous_status public.waitlist_signup_status;
  v_audit_id uuid;
begin
  v_member := private.require_admin_permission(
    'waitlist.status.write'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_signup_id is null or p_status is null then
    raise exception 'Signup ID and status are required.' using errcode = '22023';
  end if;

  if p_status = 'converted' then
    raise exception
      'Admin status updates cannot create a converted waitlist record.'
      using errcode = '22023';
  end if;

  select signup.*
  into v_signup
  from public.waitlist_signups as signup
  where signup.id = p_signup_id
  for update;

  if not found then
    raise exception 'Waitlist signup not found.' using errcode = 'P0002';
  end if;

  if v_signup.status = 'converted'
    or v_signup.converted_user_id is not null
    or v_signup.converted_at is not null
  then
    raise exception
      'A converted waitlist record cannot be changed through admin status updates.'
      using errcode = '23514';
  end if;

  if v_member.role = 'support' and p_status <> 'unsubscribed' then
    raise exception 'Support may only apply the unsubscribed status.'
      using errcode = '42501';
  end if;

  v_previous_status := v_signup.status;

  if v_previous_status = p_status then
    return jsonb_build_object(
      'id', v_signup.id,
      'previous_status', v_previous_status,
      'status', v_signup.status,
      'changed', false,
      'updated_at', v_signup.updated_at,
      'audit_id', null
    );
  end if;

  if v_previous_status not in ('pending', 'confirmed', 'invited', 'unsubscribed')
    or p_status not in ('pending', 'confirmed', 'invited', 'unsubscribed')
  then
    raise exception 'The requested waitlist status transition is not allowed.'
      using errcode = '23514';
  end if;

  update public.waitlist_signups as signup
  set status = p_status
  where signup.id = p_signup_id
  returning signup.* into v_signup;

  v_audit_id := private.write_admin_audit(
    v_member,
    'waitlist.status_changed',
    'waitlist_signup',
    v_signup.id::text,
    jsonb_build_object(
      'previous_status', v_previous_status,
      'new_status', v_signup.status,
      'environment', v_environment
    ),
    p_request_id
  );

  return jsonb_build_object(
    'id', v_signup.id,
    'previous_status', v_previous_status,
    'status', v_signup.status,
    'changed', true,
    'updated_at', v_signup.updated_at,
    'audit_id', v_audit_id
  );
end;
$$;

create or replace function public.admin_get_waitlist_analytics(
  p_date_from date default null,
  p_date_to date default null
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_date_from date := coalesce(p_date_from, (now() at time zone 'UTC')::date - 29);
  v_date_to date := coalesce(p_date_to, (now() at time zone 'UTC')::date);
  v_total_leads bigint;
  v_converted_users bigint;
  v_confirmation_sent bigint;
  v_referred_signups bigint;
  v_daily_signups jsonb;
  v_platform_distribution jsonb;
  v_source_distribution jsonb;
  v_campaigns jsonb;
  v_locales jsonb;
  v_email_status_distribution jsonb;
begin
  v_member := private.require_admin_permission(
    'analytics.read'::public.admin_permission
  );

  if v_date_from > v_date_to then
    raise exception 'Start date must not be after end date.'
      using errcode = '22023';
  end if;

  if v_date_to - v_date_from > 366 then
    raise exception 'Analytics date range cannot exceed 366 days.'
      using errcode = '22023';
  end if;

  select
    count(*),
    count(*) filter (where signup.converted_user_id is not null),
    count(*) filter (where signup.confirmation_sent_at is not null),
    count(*) filter (where signup.referred_by is not null)
  into
    v_total_leads,
    v_converted_users,
    v_confirmation_sent,
    v_referred_signups
  from public.waitlist_signups as signup
  where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
    and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC');

  select coalesce(
    jsonb_agg(
      jsonb_build_object('date', days.day, 'count', coalesce(counts.count, 0))
      order by days.day
    ),
    '[]'::jsonb
  )
  into v_daily_signups
  from (
    select series.day::date as day
    from pg_catalog.generate_series(
      v_date_from,
      v_date_to,
      interval '1 day'
    ) as series(day)
  ) as days
  left join (
    select
      (signup.created_at at time zone 'UTC')::date as day,
      count(*) as count
    from public.waitlist_signups as signup
    where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
    group by (signup.created_at at time zone 'UTC')::date
  ) as counts on counts.day = days.day;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', platforms.platform::text,
        'count', coalesce(counts.count, 0),
        'converted', coalesce(counts.converted, 0),
        'percentage', case
          when v_total_leads = 0 then 0
          else round(coalesce(counts.count, 0) * 100.0 / v_total_leads, 2)
        end,
        'conversion_rate', case
          when coalesce(counts.count, 0) = 0 then 0
          else round(coalesce(counts.converted, 0) * 100.0 / counts.count, 2)
        end
      )
      order by platforms.platform::text
    ),
    '[]'::jsonb
  )
  into v_platform_distribution
  from unnest(enum_range(null::public.waitlist_platform_interest))
    as platforms(platform)
  left join (
    select
      signup.platform_interest as platform,
      count(*) as count,
      count(*) filter (where signup.converted_user_id is not null) as converted
    from public.waitlist_signups as signup
    where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
    group by signup.platform_interest
  ) as counts on counts.platform = platforms.platform;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', sources.source::text,
        'count', coalesce(counts.count, 0),
        'converted', coalesce(counts.converted, 0),
        'percentage', case
          when v_total_leads = 0 then 0
          else round(coalesce(counts.count, 0) * 100.0 / v_total_leads, 2)
        end,
        'conversion_rate', case
          when coalesce(counts.count, 0) = 0 then 0
          else round(coalesce(counts.converted, 0) * 100.0 / counts.count, 2)
        end
      )
      order by sources.source::text
    ),
    '[]'::jsonb
  )
  into v_source_distribution
  from unnest(enum_range(null::public.waitlist_signup_source))
    as sources(source)
  left join (
    select
      signup.source,
      count(*) as count,
      count(*) filter (where signup.converted_user_id is not null) as converted
    from public.waitlist_signups as signup
    where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
    group by signup.source
  ) as counts on counts.source = sources.source;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', campaign.key,
        'count', campaign.count,
        'converted', campaign.converted,
        'percentage', case
          when v_total_leads = 0 then 0
          else round(campaign.count * 100.0 / v_total_leads, 2)
        end,
        'conversion_rate', case
          when campaign.count = 0 then 0
          else round(campaign.converted * 100.0 / campaign.count, 2)
        end
      )
      order by campaign.count desc, campaign.key
    ),
    '[]'::jsonb
  )
  into v_campaigns
  from (
    select
      coalesce(signup.utm_campaign, 'unattributed') as key,
      count(*) as count,
      count(*) filter (where signup.converted_user_id is not null) as converted
    from public.waitlist_signups as signup
    where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
    group by coalesce(signup.utm_campaign, 'unattributed')
    order by count(*) desc, coalesce(signup.utm_campaign, 'unattributed')
    limit 50
  ) as campaign;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', locale.key,
        'count', locale.count,
        'percentage', case
          when v_total_leads = 0 then 0
          else round(locale.count * 100.0 / v_total_leads, 2)
        end
      )
      order by locale.count desc, locale.key
    ),
    '[]'::jsonb
  )
  into v_locales
  from (
    select coalesce(signup.locale, 'unknown') as key, count(*) as count
    from public.waitlist_signups as signup
    where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
    group by coalesce(signup.locale, 'unknown')
    order by count(*) desc, coalesce(signup.locale, 'unknown')
    limit 50
  ) as locale;

  select jsonb_build_array(
    jsonb_build_object(
      'key', 'sent',
      'count', v_confirmation_sent,
      'percentage', case
        when v_total_leads = 0 then 0
        else round(v_confirmation_sent * 100.0 / v_total_leads, 2)
      end
    ),
    jsonb_build_object(
      'key', 'not_sent',
      'count', v_total_leads - v_confirmation_sent,
      'percentage', case
        when v_total_leads = 0 then 0
        else round((v_total_leads - v_confirmation_sent) * 100.0 / v_total_leads, 2)
      end
    )
  )
  into v_email_status_distribution;

  return jsonb_build_object(
    'generated_at', now(),
    'date_from', v_date_from,
    'date_to', v_date_to,
    'summary', jsonb_build_object(
      'total_leads', v_total_leads,
      'converted_users', v_converted_users,
      'conversion_rate', case
        when v_total_leads = 0 then 0
        else round(v_converted_users * 100.0 / v_total_leads, 2)
      end,
      'confirmation_sent', v_confirmation_sent,
      'referred_signups', v_referred_signups
    ),
    'daily_signups', v_daily_signups,
    'platform_distribution', v_platform_distribution,
    'source_distribution', v_source_distribution,
    'campaigns', v_campaigns,
    'locales', v_locales,
    'email_status_distribution', v_email_status_distribution
  );
end;
$$;

create or replace function public.admin_get_referral_analytics(
  p_date_from date default null,
  p_date_to date default null,
  p_limit integer default 25,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_date_from date := coalesce(p_date_from, (now() at time zone 'UTC')::date - 29);
  v_date_to date := coalesce(p_date_to, (now() at time zone 'UTC')::date);
  v_total_leads bigint;
  v_total_referred bigint;
  v_active_referrers bigint;
  v_converted_referrals bigint;
  v_top_referrers jsonb;
begin
  v_member := private.require_admin_permission(
    'referrals.read'::public.admin_permission
  );

  if v_date_from > v_date_to or v_date_to - v_date_from > 366 then
    raise exception 'Referral date range must be ordered and no more than 366 days.'
      using errcode = '22023';
  end if;

  if p_limit is null or p_limit not between 1 and 100 then
    raise exception 'Referral limit must be between 1 and 100.'
      using errcode = '22023';
  end if;

  if p_offset is null or p_offset not between 0 and 100000 then
    raise exception 'Referral offset must be between 0 and 100000.'
      using errcode = '22023';
  end if;

  select
    count(*),
    count(*) filter (where signup.referred_by is not null),
    count(distinct signup.referred_by) filter (where signup.referred_by is not null),
    count(*) filter (
      where signup.referred_by is not null
        and signup.converted_user_id is not null
    )
  into
    v_total_leads,
    v_total_referred,
    v_active_referrers,
    v_converted_referrals
  from public.waitlist_signups as signup
  where signup.created_at >= (v_date_from::timestamp at time zone 'UTC')
    and signup.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC');

  select coalesce(jsonb_agg(to_jsonb(ranked) order by ranked.referrals desc, ranked.created_at), '[]'::jsonb)
  into v_top_referrers
  from (
    select
      referrer.id,
      'Referral ' || referrer.referral_code as label,
      referrer.referral_code,
      count(referred.id) as referrals,
      count(referred.id) filter (
        where referred.converted_user_id is not null
      ) as converted_referrals,
      referrer.created_at,
      referrer.status
    from public.waitlist_signups as referred
    join public.waitlist_signups as referrer on referrer.id = referred.referred_by
    where referred.created_at >= (v_date_from::timestamp at time zone 'UTC')
      and referred.created_at < ((v_date_to + 1)::timestamp at time zone 'UTC')
      and referrer.referral_code is not null
    group by
      referrer.id,
      referrer.first_name,
      referrer.referral_code,
      referrer.created_at,
      referrer.status
    order by count(referred.id) desc, referrer.created_at, referrer.id
    limit p_limit
    offset p_offset
  ) as ranked;

  return jsonb_build_object(
    'generated_at', now(),
    'date_from', v_date_from,
    'date_to', v_date_to,
    'metrics', jsonb_build_object(
      'total_referred', v_total_referred,
      'referral_share', case
        when v_total_leads = 0 then 0
        else round(v_total_referred * 100.0 / v_total_leads, 2)
      end,
      'active_referrers', v_active_referrers,
      'converted_referrals', v_converted_referrals
    ),
    'top_referrers', v_top_referrers,
    'pagination', jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'total', v_active_referrers
    )
  );
end;
$$;

create or replace function public.admin_export_waitlist(
  p_expected_environment public.deployment_environment,
  p_search text default null,
  p_status public.waitlist_signup_status default null,
  p_platform public.waitlist_platform_interest default null,
  p_source public.waitlist_signup_source default null,
  p_campaign text default null,
  p_email_status text default null,
  p_converted boolean default null,
  p_date_from date default null,
  p_date_to date default null,
  p_limit integer default 5000,
  p_request_id uuid default gen_random_uuid()
)
returns table (
  id text,
  email text,
  first_name text,
  platform_interest text,
  status text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  referred_by_code text,
  locale text,
  marketing_consent boolean,
  consent_at timestamptz,
  confirmation_send_requested boolean,
  confirmation_sent_at timestamptz,
  converted boolean,
  converted_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
  v_search text;
  v_campaign text;
  v_rows bigint;
begin
  v_member := private.require_admin_permission(
    'waitlist.export'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_search is not null then
    v_search := btrim(p_search);
    if char_length(v_search) not between 1 and 120 then
      raise exception 'Search must be between 1 and 120 characters.'
        using errcode = '22023';
    end if;
    v_search := private.escape_like_pattern(v_search);
  end if;

  if p_campaign is not null then
    v_campaign := btrim(p_campaign);
    if char_length(v_campaign) not between 1 and 100 then
      raise exception 'Campaign must be between 1 and 100 characters.'
        using errcode = '22023';
    end if;
  end if;

  if p_email_status is not null
    and p_email_status not in ('sent', 'not_sent')
  then
    raise exception 'Email status must be sent or not_sent.'
      using errcode = '22023';
  end if;

  if p_limit is null or p_limit not between 1 and 5000 then
    raise exception 'Export limit must be between 1 and 5000.'
      using errcode = '22023';
  end if;

  if p_date_from is not null
    and p_date_to is not null
    and (p_date_from > p_date_to or p_date_to - p_date_from > 366)
  then
    raise exception 'Export date range must be ordered and no more than 366 days.'
      using errcode = '22023';
  end if;

  return query
  select
    signup.id::text,
    private.csv_safe_text(signup.email),
    private.csv_safe_text(signup.first_name),
    signup.platform_interest::text,
    signup.status::text,
    signup.source::text,
    private.csv_safe_text(signup.utm_source),
    private.csv_safe_text(signup.utm_medium),
    private.csv_safe_text(signup.utm_campaign),
    private.csv_safe_text(signup.utm_content),
    private.csv_safe_text(signup.utm_term),
    private.csv_safe_text(signup.referral_code),
    private.csv_safe_text(referrer.referral_code),
    private.csv_safe_text(signup.locale),
    signup.marketing_consent,
    signup.consent_at,
    signup.confirmation_sent_at is not null,
    signup.confirmation_sent_at,
    signup.converted_user_id is not null,
    signup.converted_at,
    signup.created_at,
    signup.updated_at
  from public.waitlist_signups as signup
  left join public.waitlist_signups as referrer on referrer.id = signup.referred_by
  where (
      v_search is null
      or signup.email ilike '%' || v_search || '%' escape E'\\'
      or signup.first_name ilike '%' || v_search || '%' escape E'\\'
      or signup.referral_code ilike '%' || v_search || '%' escape E'\\'
    )
    and (p_status is null or signup.status = p_status)
    and (p_platform is null or signup.platform_interest = p_platform)
    and (p_source is null or signup.source = p_source)
    and (
      v_campaign is null
      or lower(signup.utm_campaign) = lower(v_campaign)
    )
    and (
      p_email_status is null
      or (p_email_status = 'sent' and signup.confirmation_sent_at is not null)
      or (p_email_status = 'not_sent' and signup.confirmation_sent_at is null)
    )
    and (
      p_converted is null
      or (signup.converted_user_id is not null) = p_converted
    )
    and (
      p_date_from is null
      or signup.created_at >= (p_date_from::timestamp at time zone 'UTC')
    )
    and (
      p_date_to is null
      or signup.created_at < ((p_date_to + 1)::timestamp at time zone 'UTC')
    )
  order by signup.created_at desc, signup.id desc
  limit p_limit;

  get diagnostics v_rows = row_count;

  perform private.write_admin_audit(
    v_member,
    'waitlist.exported',
    'waitlist_export',
    p_request_id::text,
    jsonb_build_object(
      'status', p_status,
      'platform', p_platform,
      'source', p_source,
      'campaign_applied', p_campaign is not null,
      'search_applied', p_search is not null,
      'email_status', p_email_status,
      'converted', p_converted,
      'date_from', p_date_from,
      'date_to', p_date_to,
      'requested_limit', p_limit,
      'row_count', v_rows,
      'export_type', 'csv',
      'environment', v_environment
    ),
    p_request_id
  );
end;
$$;

create or replace function public.admin_list_audit_logs(
  p_actor_member_id uuid default null,
  p_action text default null,
  p_target_type text default null,
  p_target_id text default null,
  p_date_from date default null,
  p_date_to date default null,
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  actor_member_id uuid,
  actor_user_id uuid,
  actor_email text,
  actor_display_name text,
  actor_role public.admin_member_role,
  action text,
  target_type text,
  target_id text,
  metadata jsonb,
  request_id uuid,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_action text;
  v_target_type text;
  v_target_id text;
begin
  v_member := private.require_admin_permission(
    'audit.read'::public.admin_permission
  );

  if p_action is not null then
    v_action := btrim(p_action);
    if char_length(v_action) not between 1 and 100
      or v_action !~ '^[a-z][a-z0-9_.]*$'
    then
      raise exception 'Invalid audit action filter.' using errcode = '22023';
    end if;
  end if;

  if p_target_type is not null then
    v_target_type := btrim(p_target_type);
    if char_length(v_target_type) not between 1 and 60
      or v_target_type !~ '^[a-z][a-z0-9_]*$'
    then
      raise exception 'Invalid audit target type filter.' using errcode = '22023';
    end if;
  end if;

  if p_target_id is not null then
    v_target_id := btrim(p_target_id);
    if char_length(v_target_id) not between 1 and 160 then
      raise exception 'Invalid audit target ID filter.' using errcode = '22023';
    end if;
  end if;

  if p_page is null or p_page not between 1 and 100000 then
    raise exception 'Page must be between 1 and 100000.' using errcode = '22023';
  end if;

  if p_page_size is null or p_page_size not in (25, 50, 100) then
    raise exception 'Page size must be 25, 50, or 100.' using errcode = '22023';
  end if;

  if p_date_from is not null
    and p_date_to is not null
    and (p_date_from > p_date_to or p_date_to - p_date_from > 366)
  then
    raise exception 'Audit date range must be ordered and no more than 366 days.'
      using errcode = '22023';
  end if;

  return query
  select
    audit.id,
    audit.actor_admin_member_id,
    audit.actor_user_id,
    auth_user.email::text,
    actor.display_name,
    audit.actor_role,
    audit.action,
    audit.target_type,
    audit.target_id,
    audit.metadata,
    audit.request_id,
    audit.created_at,
    count(*) over ()
  from public.admin_audit_logs as audit
  left join public.admin_members as actor on actor.id = audit.actor_admin_member_id
  left join auth.users as auth_user on auth_user.id = audit.actor_user_id
  where (p_actor_member_id is null or audit.actor_admin_member_id = p_actor_member_id)
    and (v_action is null or audit.action = v_action)
    and (v_target_type is null or audit.target_type = v_target_type)
    and (v_target_id is null or audit.target_id = v_target_id)
    and (
      p_date_from is null
      or audit.created_at >= (p_date_from::timestamp at time zone 'UTC')
    )
    and (
      p_date_to is null
      or audit.created_at < ((p_date_to + 1)::timestamp at time zone 'UTC')
    )
  order by audit.created_at desc, audit.id desc
  limit p_page_size
  offset (p_page - 1) * p_page_size;
end;
$$;

create or replace function public.admin_list_members(
  p_search text default null,
  p_role public.admin_member_role default null,
  p_status public.admin_member_status default null,
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  role public.admin_member_role,
  status public.admin_member_status,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  last_modified_by uuid,
  total_count bigint
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_search text;
begin
  v_member := private.require_admin_permission(
    'admins.read'::public.admin_permission
  );

  if p_search is not null then
    v_search := btrim(p_search);
    if char_length(v_search) not between 1 and 120 then
      raise exception 'Search must be between 1 and 120 characters.'
        using errcode = '22023';
    end if;
    v_search := private.escape_like_pattern(v_search);
  end if;

  if p_page is null or p_page not between 1 and 100000 then
    raise exception 'Page must be between 1 and 100000.' using errcode = '22023';
  end if;

  if p_page_size is null or p_page_size not in (25, 50, 100) then
    raise exception 'Page size must be 25, 50, or 100.' using errcode = '22023';
  end if;

  return query
  select
    member.id,
    member.user_id,
    auth_user.email::text,
    member.display_name,
    member.role,
    member.status,
    member.created_at,
    member.updated_at,
    member.created_by,
    member.last_modified_by,
    count(*) over ()
  from public.admin_members as member
  join auth.users as auth_user on auth_user.id = member.user_id
  where (
      v_search is null
      or auth_user.email ilike '%' || v_search || '%' escape E'\\'
      or member.display_name ilike '%' || v_search || '%' escape E'\\'
    )
    and (p_role is null or member.role = p_role)
    and (p_status is null or member.status = p_status)
  order by member.created_at desc, member.id desc
  limit p_page_size
  offset (p_page - 1) * p_page_size;
end;
$$;

create or replace function public.admin_create_member(
  p_user_id uuid,
  p_role public.admin_member_role,
  p_expected_environment public.deployment_environment,
  p_status public.admin_member_status default 'active',
  p_display_name text default null,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.admin_members;
  v_environment public.deployment_environment;
  v_member public.admin_members%rowtype;
  v_email text;
  v_email_confirmed_at timestamptz;
  v_display_name text;
  v_audit_id uuid;
begin
  v_actor := private.require_admin_permission(
    'admins.write'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_user_id is null or p_role is null or p_status is null then
    raise exception 'User, role, and status are required.' using errcode = '22023';
  end if;

  if p_display_name is not null then
    v_display_name := btrim(p_display_name);
    if char_length(v_display_name) not between 1 and 100 then
      raise exception 'Display name must be between 1 and 100 characters.'
        using errcode = '22023';
    end if;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('aiyomi.admin_members.super_admin_guard', 0)
  );

  select auth_user.email::text, auth_user.email_confirmed_at
  into v_email, v_email_confirmed_at
  from auth.users as auth_user
  where auth_user.id = p_user_id;

  if not found or v_email is null then
    raise exception 'The selected Auth user does not exist.' using errcode = 'P0002';
  end if;

  if v_email_confirmed_at is null then
    raise exception 'The selected Auth user must have a verified email address.'
      using errcode = '23514';
  end if;

  insert into public.admin_members (
    user_id,
    role,
    status,
    display_name,
    created_by,
    last_modified_by
  ) values (
    p_user_id,
    p_role,
    p_status,
    v_display_name,
    v_actor.user_id,
    v_actor.user_id
  )
  returning * into v_member;

  v_audit_id := private.write_admin_audit(
    v_actor,
    'admin_member.created',
    'admin_member',
    v_member.id::text,
    jsonb_build_object(
      'user_id', v_member.user_id,
      'role', v_member.role,
      'status', v_member.status,
      'environment', v_environment
    ),
    p_request_id
  );

  return jsonb_build_object(
    'id', v_member.id,
    'user_id', v_member.user_id,
    'email', v_email,
    'display_name', v_member.display_name,
    'role', v_member.role,
    'status', v_member.status,
    'created_at', v_member.created_at,
    'updated_at', v_member.updated_at,
    'audit_id', v_audit_id
  );
exception
  when unique_violation then
    raise exception 'This Auth user already has an admin membership.'
      using errcode = '23505';
end;
$$;

create or replace function public.admin_update_member(
  p_member_id uuid,
  p_role public.admin_member_role,
  p_status public.admin_member_status,
  p_expected_environment public.deployment_environment,
  p_display_name text default null,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.admin_members;
  v_environment public.deployment_environment;
  v_previous public.admin_members%rowtype;
  v_updated public.admin_members%rowtype;
  v_email text;
  v_display_name text;
  v_changed boolean;
  v_audit_id uuid;
begin
  v_actor := private.require_admin_permission(
    'admins.write'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_member_id is null or p_role is null or p_status is null then
    raise exception 'Member, role, and status are required.' using errcode = '22023';
  end if;

  if p_display_name is not null then
    v_display_name := btrim(p_display_name);
    if char_length(v_display_name) not between 1 and 100 then
      raise exception 'Display name must be between 1 and 100 characters.'
        using errcode = '22023';
    end if;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('aiyomi.admin_members.super_admin_guard', 0)
  );

  select member.*
  into v_previous
  from public.admin_members as member
  where member.id = p_member_id
  for update;

  if not found then
    raise exception 'Admin member not found.' using errcode = 'P0002';
  end if;

  v_changed := v_previous.role is distinct from p_role
    or v_previous.status is distinct from p_status
    or v_previous.display_name is distinct from v_display_name;

  if v_changed then
    update public.admin_members as member
    set
      role = p_role,
      status = p_status,
      display_name = v_display_name,
      last_modified_by = v_actor.user_id
    where member.id = p_member_id
    returning member.* into v_updated;

    if v_previous.role is distinct from v_updated.role then
      v_audit_id := private.write_admin_audit(
        v_actor,
        'admin.role_updated',
        'admin_member',
        v_updated.id::text,
        jsonb_build_object(
          'previous_role', v_previous.role,
          'new_role', v_updated.role,
          'display_name_changed',
            v_previous.display_name is distinct from v_updated.display_name,
          'environment', v_environment
        ),
        p_request_id
      );
    end if;

    if v_previous.status is distinct from v_updated.status then
      v_audit_id := private.write_admin_audit(
        v_actor,
        case
          when v_updated.status = 'suspended' then 'admin.suspended'
          else 'admin.reactivated'
        end,
        'admin_member',
        v_updated.id::text,
        jsonb_build_object(
          'previous_status', v_previous.status,
          'new_status', v_updated.status,
          'display_name_changed',
            v_previous.display_name is distinct from v_updated.display_name,
          'environment', v_environment
        ),
        p_request_id
      );
    end if;

    if v_previous.display_name is distinct from v_updated.display_name
      and v_previous.role is not distinct from v_updated.role
      and v_previous.status is not distinct from v_updated.status
    then
      v_audit_id := private.write_admin_audit(
        v_actor,
        'admin.profile_updated',
        'admin_member',
        v_updated.id::text,
        jsonb_build_object(
          'display_name_changed', true,
          'environment', v_environment
        ),
        p_request_id
      );
    end if;
  else
    v_updated := v_previous;
  end if;

  select auth_user.email::text
  into v_email
  from auth.users as auth_user
  where auth_user.id = v_updated.user_id;

  return jsonb_build_object(
    'id', v_updated.id,
    'user_id', v_updated.user_id,
    'email', v_email,
    'display_name', v_updated.display_name,
    'role', v_updated.role,
    'status', v_updated.status,
    'created_at', v_updated.created_at,
    'updated_at', v_updated.updated_at,
    'changed', v_changed,
    'audit_id', v_audit_id
  );
end;
$$;

create or replace function public.admin_list_feature_flags()
returns table (
  id uuid,
  key public.feature_flag_key,
  description text,
  enabled boolean,
  environment public.deployment_environment,
  metadata jsonb,
  updated_at timestamptz,
  updated_by uuid,
  updated_by_email text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
begin
  v_member := private.require_admin_permission(
    'feature_flags.read'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  return query
  select
    flag.id,
    flag.key,
    flag.description,
    flag.enabled,
    flag.environment,
    flag.metadata,
    flag.updated_at,
    flag.updated_by,
    updater.email::text
  from public.feature_flags as flag
  left join public.admin_members as updater_member on updater_member.id = flag.updated_by
  left join auth.users as updater on updater.id = updater_member.user_id
  where flag.environment = v_environment
  order by flag.key;
end;
$$;

create or replace function public.admin_update_feature_flag(
  p_key public.feature_flag_key,
  p_enabled boolean,
  p_expected_environment public.deployment_environment,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
  v_previous public.feature_flags%rowtype;
  v_updated public.feature_flags%rowtype;
  v_audit_id uuid;
begin
  v_member := private.require_admin_permission(
    'feature_flags.write'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_key is null or p_enabled is null then
    raise exception 'Feature flag key and value are required.'
      using errcode = '22023';
  end if;

  select flag.*
  into v_previous
  from public.feature_flags as flag
  where flag.environment = v_environment
    and flag.key = p_key
  for update;

  if not found then
    raise exception 'Feature flag not found for the configured environment.'
      using errcode = 'P0002';
  end if;

  if v_previous.enabled is distinct from p_enabled then
    update public.feature_flags as flag
    set
      enabled = p_enabled,
      updated_by = v_member.id
    where flag.id = v_previous.id
      and flag.environment = v_environment
    returning flag.* into v_updated;

    v_audit_id := private.write_admin_audit(
      v_member,
      'feature_flag.updated',
      'feature_flag',
      v_updated.id::text,
      jsonb_build_object(
        'key', v_updated.key,
        'environment', v_environment,
        'previous_enabled', v_previous.enabled,
        'new_enabled', v_updated.enabled
      ),
      p_request_id
    );
  else
    v_updated := v_previous;
  end if;

  return jsonb_build_object(
    'id', v_updated.id,
    'key', v_updated.key,
    'description', v_updated.description,
    'enabled', v_updated.enabled,
    'environment', v_updated.environment,
    'metadata', v_updated.metadata,
    'updated_at', v_updated.updated_at,
    'changed', v_previous.enabled is distinct from p_enabled,
    'audit_id', v_audit_id
  );
end;
$$;

create or replace function public.admin_list_application_settings()
returns table (
  id uuid,
  key public.application_setting_key,
  value text,
  environment public.deployment_environment,
  updated_at timestamptz,
  updated_by uuid,
  updated_by_email text
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
begin
  v_member := private.require_admin_permission(
    'settings.read'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  return query
  select
    setting.id,
    setting.key,
    setting.value,
    setting.environment,
    setting.updated_at,
    setting.updated_by,
    updater.email::text
  from public.application_settings as setting
  left join public.admin_members as updater_member on updater_member.id = setting.updated_by
  left join auth.users as updater on updater.id = updater_member.user_id
  where setting.environment = v_environment
  order by setting.key;
end;
$$;

create or replace function public.admin_update_application_setting(
  p_key public.application_setting_key,
  p_value text,
  p_expected_environment public.deployment_environment,
  p_request_id uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member public.admin_members;
  v_environment public.deployment_environment;
  v_previous public.application_settings%rowtype;
  v_updated public.application_settings%rowtype;
  v_value text;
  v_changed boolean;
  v_audit_id uuid;
begin
  v_member := private.require_admin_permission(
    'settings.write'::public.admin_permission
  );
  v_environment := private.current_admin_environment();

  if p_expected_environment is null or p_expected_environment <> v_environment then
    raise exception 'The deployment environment does not match this hosted project.'
      using errcode = '55000';
  end if;

  if p_key is null or p_value is null then
    raise exception 'Setting key and value are required.' using errcode = '22023';
  end if;

  v_value := btrim(p_value);

  if char_length(v_value) not between 8 and 500
    or v_value ~ '[[:space:]?#]'
    or v_value ~ '://[.-]'
    or v_value ~ '\.\.'
    or not (
      v_value ~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?(/[A-Za-z0-9._~:/%+@=-]*)?$'
      or (
        v_environment = 'development'
        and v_value ~ '^http://(localhost|127\.0\.0\.1)(:[0-9]{1,5})?(/[A-Za-z0-9._~:/%+@=-]*)?$'
      )
    )
  then
    raise exception 'Setting value must be an approved public URL.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'aiyomi.application_setting.' || v_environment::text || '.' || p_key::text,
      0
    )
  );

  select setting.*
  into v_previous
  from public.application_settings as setting
  where setting.environment = v_environment
    and setting.key = p_key
  for update;

  v_changed := not found or v_previous.value is distinct from v_value;

  if v_changed then
    insert into public.application_settings (
      key,
      value,
      environment,
      updated_by
    ) values (
      p_key,
      v_value,
      v_environment,
      v_member.id
    )
    on conflict (environment, key) do update
    set
      value = excluded.value,
      updated_by = excluded.updated_by
    returning * into v_updated;

    v_audit_id := private.write_admin_audit(
      v_member,
      'application_setting.updated',
      'application_setting',
      v_updated.id::text,
      jsonb_build_object(
        'key', v_updated.key,
        'environment', v_environment,
        'previous_value', v_previous.value,
        'new_value', v_updated.value
      ),
      p_request_id
    );
  else
    v_updated := v_previous;
  end if;

  return jsonb_build_object(
    'id', v_updated.id,
    'key', v_updated.key,
    'value', v_updated.value,
    'environment', v_updated.environment,
    'updated_at', v_updated.updated_at,
    'changed', v_changed,
    'audit_id', v_audit_id
  );
end;
$$;

revoke execute on all functions in schema private
  from public, anon, authenticated;

revoke all on function public.is_waitlist_enabled()
  from public, anon, authenticated;
grant execute on function public.is_waitlist_enabled()
  to anon, authenticated, service_role;

revoke all on function public.admin_get_current_member()
  from public, anon, authenticated;
revoke all on function public.admin_get_current_member(
  public.deployment_environment
) from public, anon, authenticated;
grant execute on function public.admin_get_current_member(
  public.deployment_environment
) to authenticated;

revoke all on function public.admin_get_dashboard(integer)
  from public, anon, authenticated;
grant execute on function public.admin_get_dashboard(integer)
  to authenticated;

revoke all on function public.admin_list_waitlist(
  text,
  public.waitlist_signup_status,
  public.waitlist_platform_interest,
  public.waitlist_signup_source,
  text,
  text,
  boolean,
  date,
  date,
  text,
  integer,
  integer
) from public, anon, authenticated;
grant execute on function public.admin_list_waitlist(
  text,
  public.waitlist_signup_status,
  public.waitlist_platform_interest,
  public.waitlist_signup_source,
  text,
  text,
  boolean,
  date,
  date,
  text,
  integer,
  integer
) to authenticated;

revoke all on function public.admin_get_waitlist_lead(uuid)
  from public, anon, authenticated;
grant execute on function public.admin_get_waitlist_lead(uuid)
  to authenticated;

revoke all on function public.admin_update_waitlist_status(
  uuid,
  public.waitlist_signup_status,
  public.deployment_environment,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_update_waitlist_status(
  uuid,
  public.waitlist_signup_status,
  public.deployment_environment,
  uuid
) to authenticated;

revoke all on function public.admin_get_waitlist_analytics(date, date)
  from public, anon, authenticated;
grant execute on function public.admin_get_waitlist_analytics(date, date)
  to authenticated;

revoke all on function public.admin_get_referral_analytics(
  date,
  date,
  integer,
  integer
) from public, anon, authenticated;
grant execute on function public.admin_get_referral_analytics(
  date,
  date,
  integer,
  integer
) to authenticated;

revoke all on function public.admin_export_waitlist(
  public.deployment_environment,
  text,
  public.waitlist_signup_status,
  public.waitlist_platform_interest,
  public.waitlist_signup_source,
  text,
  text,
  boolean,
  date,
  date,
  integer,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_export_waitlist(
  public.deployment_environment,
  text,
  public.waitlist_signup_status,
  public.waitlist_platform_interest,
  public.waitlist_signup_source,
  text,
  text,
  boolean,
  date,
  date,
  integer,
  uuid
) to authenticated;

revoke all on function public.admin_list_audit_logs(
  uuid,
  text,
  text,
  text,
  date,
  date,
  integer,
  integer
) from public, anon, authenticated;
grant execute on function public.admin_list_audit_logs(
  uuid,
  text,
  text,
  text,
  date,
  date,
  integer,
  integer
) to authenticated;

revoke all on function public.admin_list_members(
  text,
  public.admin_member_role,
  public.admin_member_status,
  integer,
  integer
) from public, anon, authenticated;
grant execute on function public.admin_list_members(
  text,
  public.admin_member_role,
  public.admin_member_status,
  integer,
  integer
) to authenticated;

revoke all on function public.admin_create_member(
  uuid,
  public.admin_member_role,
  public.deployment_environment,
  public.admin_member_status,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_create_member(
  uuid,
  public.admin_member_role,
  public.deployment_environment,
  public.admin_member_status,
  text,
  uuid
) to authenticated;

revoke all on function public.admin_update_member(
  uuid,
  public.admin_member_role,
  public.admin_member_status,
  public.deployment_environment,
  text,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_update_member(
  uuid,
  public.admin_member_role,
  public.admin_member_status,
  public.deployment_environment,
  text,
  uuid
) to authenticated;

revoke all on function public.admin_list_feature_flags()
  from public, anon, authenticated;
grant execute on function public.admin_list_feature_flags()
  to authenticated;

revoke all on function public.admin_update_feature_flag(
  public.feature_flag_key,
  boolean,
  public.deployment_environment,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_update_feature_flag(
  public.feature_flag_key,
  boolean,
  public.deployment_environment,
  uuid
) to authenticated;

revoke all on function public.admin_list_application_settings()
  from public, anon, authenticated;
grant execute on function public.admin_list_application_settings()
  to authenticated;

revoke all on function public.admin_update_application_setting(
  public.application_setting_key,
  text,
  public.deployment_environment,
  uuid
) from public, anon, authenticated;
grant execute on function public.admin_update_application_setting(
  public.application_setting_key,
  text,
  public.deployment_environment,
  uuid
) to authenticated;

comment on function public.is_waitlist_enabled() is
  'Fail-closed anonymous read of the configured environment waitlist flag.';
comment on function public.admin_update_waitlist_status(
  uuid,
  public.waitlist_signup_status,
  public.deployment_environment,
  uuid
) is
  'Caller-authorized lifecycle update that cannot fabricate conversion and audits changes atomically.';
comment on function public.admin_export_waitlist(
  public.deployment_environment,
  text,
  public.waitlist_signup_status,
  public.waitlist_platform_interest,
  public.waitlist_signup_source,
  text,
  text,
  boolean,
  date,
  date,
  integer,
  uuid
) is 'Bounded caller-authorized waitlist export with formula-safe text and an atomic audit event.';
