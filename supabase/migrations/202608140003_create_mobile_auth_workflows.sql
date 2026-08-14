-- Phase 3 trusted profile creation, verified waitlist conversion, and onboarding completion.
-- This migration depends on the Phase 3 consumer and notification foundations.

create or replace function private.convert_verified_waitlist_for_user(
  p_user_id uuid,
  p_email text,
  p_email_confirmed_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is null
    or p_email is null
    or p_email_confirmed_at is null
  then
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'aiyomi.waitlist_conversion.' || p_user_id::text,
      0
    )
  );

  update public.waitlist_signups as signup
  set
    converted_user_id = p_user_id,
    converted_at = coalesce(signup.converted_at, now()),
    status = case
      when signup.status = 'unsubscribed' then signup.status
      else 'converted'::public.waitlist_signup_status
    end
  where signup.email = lower(btrim(p_email))
    and (
      signup.converted_user_id = p_user_id
      or (
        signup.converted_user_id is null
        and not exists (
          select 1
          from public.waitlist_signups as existing_conversion
          where existing_conversion.converted_user_id = p_user_id
            and existing_conversion.id <> signup.id
        )
      )
    );
end;
$$;

create or replace function private.create_mobile_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function private.convert_waitlist_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.convert_verified_waitlist_for_user(
    new.id,
    new.email::text,
    new.email_confirmed_at
  );

  return new;
end;
$$;

create trigger create_mobile_profile_after_auth_user_insert
after insert on auth.users
for each row execute function private.create_mobile_profile_for_auth_user();

create trigger convert_waitlist_after_verified_auth_user_insert
after insert on auth.users
for each row execute function private.convert_waitlist_for_auth_user();

create trigger convert_waitlist_after_auth_user_verification
after update of email, email_confirmed_at on auth.users
for each row execute function private.convert_waitlist_for_auth_user();

create or replace function public.ensure_mobile_profile()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_email_confirmed_at timestamptz;
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select auth_user.email::text, auth_user.email_confirmed_at
  into v_email, v_email_confirmed_at
  from auth.users as auth_user
  where auth_user.id = v_user_id;

  perform private.convert_verified_waitlist_for_user(
    v_user_id,
    v_email,
    v_email_confirmed_at
  );

  select profile.*
  into v_profile
  from public.profiles as profile
  where profile.id = v_user_id;

  return jsonb_build_object(
    'id', v_profile.id,
    'first_name', v_profile.first_name,
    'timezone', v_profile.timezone,
    'locale', v_profile.locale,
    'onboarding_status', v_profile.onboarding_status,
    'onboarding_step', v_profile.onboarding_step,
    'onboarding_completed_at', v_profile.onboarding_completed_at,
    'created_at', v_profile.created_at,
    'updated_at', v_profile.updated_at
  );
end;
$$;

create or replace function public.complete_mobile_onboarding()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  insert into public.profiles (id)
  values (v_user_id)
  on conflict (id) do nothing;

  select profile.*
  into v_profile
  from public.profiles as profile
  where profile.id = v_user_id
  for update;

  if v_profile.onboarding_status = 'completed' then
    return jsonb_build_object(
      'id', v_profile.id,
      'onboarding_status', v_profile.onboarding_status,
      'onboarding_step', v_profile.onboarding_step,
      'onboarding_completed_at', v_profile.onboarding_completed_at,
      'changed', false
    );
  end if;

  if v_profile.first_name is null or v_profile.timezone is null then
    raise exception 'Name and timezone are required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.user_companions as user_companion
    join public.companion_definitions as companion
      on companion.id = user_companion.companion_definition_id
     and companion.active
    where user_companion.user_id = v_user_id
  ) then
    raise exception 'An active companion selection is required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.user_life_areas as user_life_area
    left join public.life_area_definitions as life_area
      on life_area.id = user_life_area.life_area_definition_id
    where user_life_area.user_id = v_user_id
      and (
        user_life_area.custom_name is not null
        or life_area.active
      )
  ) then
    raise exception 'At least one active or custom Life Area is required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.user_schedule_preferences as schedule
    where schedule.user_id = v_user_id
  ) then
    raise exception 'Wake time, sleep time, and timezone are required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.user_life_roles as user_life_role
    join public.life_role_definitions as life_role
      on life_role.id = user_life_role.life_role_definition_id
     and life_role.active
    where user_life_role.user_id = v_user_id
  ) then
    raise exception 'At least one active life role is required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.onboarding_intentions as intention
    where intention.user_id = v_user_id
  ) then
    raise exception 'An improvement focus is required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  insert into public.notification_preferences as existing_preference (
    user_id,
    timezone
  )
  values (v_user_id, v_profile.timezone)
  on conflict (user_id) do update
  set timezone = coalesce(
    existing_preference.timezone,
    excluded.timezone
  );

  if not exists (
    select 1
    from public.notification_preferences as preference
    where preference.user_id = v_user_id
      and preference.timezone is not null
  ) then
    raise exception 'A notification timezone is required before onboarding can be completed.'
      using errcode = '23514';
  end if;

  update public.profiles as profile
  set
    onboarding_status = 'completed',
    onboarding_step = null,
    onboarding_completed_at = now()
  where profile.id = v_user_id
  returning profile.* into v_profile;

  return jsonb_build_object(
    'id', v_profile.id,
    'onboarding_status', v_profile.onboarding_status,
    'onboarding_step', v_profile.onboarding_step,
    'onboarding_completed_at', v_profile.onboarding_completed_at,
    'changed', true
  );
end;
$$;

revoke all on function private.convert_verified_waitlist_for_user(
  uuid,
  text,
  timestamptz
) from public, anon, authenticated;
revoke all on function private.create_mobile_profile_for_auth_user()
  from public, anon, authenticated;
revoke all on function private.convert_waitlist_for_auth_user()
  from public, anon, authenticated;

revoke all on function public.ensure_mobile_profile()
  from public, anon, authenticated;
grant execute on function public.ensure_mobile_profile() to authenticated;

revoke all on function public.complete_mobile_onboarding()
  from public, anon, authenticated;
grant execute on function public.complete_mobile_onboarding() to authenticated;

comment on function public.ensure_mobile_profile() is
  'Caller-scoped idempotent repair for the authenticated user profile, notification defaults, and verified waitlist conversion.';
comment on function public.complete_mobile_onboarding() is
  'Caller-scoped atomic completion gate that validates required Phase 3 personalization records.';
