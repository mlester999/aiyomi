-- Phase 3 private consumer profile, onboarding, and personalization foundation.
-- Apply only to a deliberately confirmed hosted Development or Staging project.

create type public.mobile_onboarding_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.mobile_onboarding_step as enum (
  'preferred_name',
  'companion_selection',
  'companion_name',
  'companion_personality',
  'life_areas',
  'normal_day',
  'life_roles',
  'fixed_commitments',
  'improvement_focus',
  'obstacles',
  'energy_baseline',
  'notification_setup'
);

create type public.companion_personality as enum (
  'gentle',
  'balanced',
  'coach'
);

create type public.pre_auth_intent as enum (
  'get_organized',
  'build_routines',
  'focus_better',
  'reach_a_goal',
  'balance_my_life',
  'something_else'
);

create type public.energy_baseline as enum (
  'morning',
  'afternoon',
  'evening',
  'varies',
  'not_sure'
);

create domain public.iana_timezone_name as text
check (
  value = btrim(value)
  and char_length(value) between 3 and 100
  and value ~ '^[A-Za-z][A-Za-z0-9._+-]*(/[A-Za-z0-9._+-]+)*$'
);

create or replace function private.set_phase3_updated_at()
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
  return new;
end;
$$;

create or replace function private.normalize_fixed_commitment_days()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.days_of_week is null
    or cardinality(new.days_of_week) not between 1 and 7
    or exists (
      select 1
      from unnest(new.days_of_week) as selected(day)
      where selected.day is null
        or selected.day not between 0 and 6
    )
  then
    raise exception 'Commitment days must contain values from 0 through 6.'
      using errcode = '22023';
  end if;

  select array_agg(normalized.day order by normalized.day)
  into new.days_of_week
  from (
    select distinct selected.day
    from unnest(new.days_of_week) as selected(day)
  ) as normalized;

  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  timezone public.iana_timezone_name,
  locale text,
  onboarding_status public.mobile_onboarding_status not null default 'not_started',
  onboarding_step public.mobile_onboarding_step,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_first_name_valid check (
    first_name is null
    or (
      first_name = btrim(first_name)
      and char_length(first_name) between 1 and 80
    )
  ),
  constraint profiles_locale_valid check (
    locale is null
    or (
      locale = btrim(locale)
      and char_length(locale) between 2 and 35
      and locale ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
    )
  ),
  constraint profiles_onboarding_state_valid check (
    (
      onboarding_status = 'not_started'
      and onboarding_step is null
      and onboarding_completed_at is null
    )
    or (
      onboarding_status = 'in_progress'
      and onboarding_step is not null
      and onboarding_completed_at is null
    )
    or (
      onboarding_status = 'completed'
      and onboarding_step is null
      and onboarding_completed_at is not null
    )
  ),
  constraint profiles_timestamps_valid check (updated_at >= created_at)
);

create table public.companion_definitions (
  id uuid primary key,
  key text not null unique,
  name text not null,
  description text not null,
  asset_key text not null unique,
  active boolean not null default true,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint companion_definitions_key_valid check (
    key ~ '^[a-z][a-z0-9_]{1,39}$'
  ),
  constraint companion_definitions_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 40
  ),
  constraint companion_definitions_description_valid check (
    description = btrim(description)
    and char_length(description) between 1 and 160
  ),
  constraint companion_definitions_asset_key_valid check (
    asset_key ~ '^[a-z0-9][a-z0-9/_-]{0,99}$'
  ),
  constraint companion_definitions_sort_order_valid check (
    sort_order between 0 and 1000
  ),
  constraint companion_definitions_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.user_companions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  companion_definition_id uuid not null
    references public.companion_definitions (id) on delete restrict,
  custom_name text not null,
  personality public.companion_personality not null default 'balanced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_companions_custom_name_valid check (
    custom_name = btrim(custom_name)
    and char_length(custom_name) between 1 and 40
  ),
  constraint user_companions_timestamps_valid check (updated_at >= created_at)
);

create table public.life_area_definitions (
  id uuid primary key,
  key text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint life_area_definitions_key_valid check (
    key ~ '^[a-z][a-z0-9_]{1,39}$'
  ),
  constraint life_area_definitions_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 60
  ),
  constraint life_area_definitions_sort_order_valid check (
    sort_order between 0 and 1000
  ),
  constraint life_area_definitions_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.user_life_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  life_area_definition_id uuid
    references public.life_area_definitions (id) on delete restrict,
  custom_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_life_areas_source_valid check (
    (
      life_area_definition_id is not null
      and custom_name is null
    )
    or (
      life_area_definition_id is null
      and custom_name is not null
    )
  ),
  constraint user_life_areas_custom_name_valid check (
    custom_name is null
    or (
      custom_name = btrim(custom_name)
      and char_length(custom_name) between 1 and 40
    )
  ),
  constraint user_life_areas_timestamps_valid check (updated_at >= created_at)
);

create table public.life_role_definitions (
  id uuid primary key,
  key text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint life_role_definitions_key_valid check (
    key ~ '^[a-z][a-z0-9_]{1,39}$'
  ),
  constraint life_role_definitions_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 80
  ),
  constraint life_role_definitions_sort_order_valid check (
    sort_order between 0 and 1000
  ),
  constraint life_role_definitions_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.user_life_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  life_role_definition_id uuid not null
    references public.life_role_definitions (id) on delete restrict,
  created_at timestamptz not null default now(),

  primary key (user_id, life_role_definition_id)
);

create table public.user_schedule_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  wake_time time without time zone not null,
  sleep_time time without time zone not null,
  timezone public.iana_timezone_name not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_schedule_preferences_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.fixed_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  days_of_week smallint[] not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  timezone public.iana_timezone_name not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fixed_commitments_title_valid check (
    title = btrim(title)
    and char_length(title) between 1 and 80
  ),
  constraint fixed_commitments_days_valid check (
    cardinality(days_of_week) between 1 and 7
    and days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  constraint fixed_commitments_times_valid check (start_time <> end_time),
  constraint fixed_commitments_timestamps_valid check (updated_at >= created_at)
);

create table public.onboarding_intentions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pre_auth_intent public.pre_auth_intent,
  improvement_focus text not null,
  energy_baseline public.energy_baseline,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint onboarding_intentions_focus_valid check (
    improvement_focus = btrim(improvement_focus)
    and char_length(improvement_focus) between 1 and 500
  ),
  constraint onboarding_intentions_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.obstacle_definitions (
  id uuid primary key,
  key text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint obstacle_definitions_key_valid check (
    key ~ '^[a-z][a-z0-9_]{1,49}$'
  ),
  constraint obstacle_definitions_name_valid check (
    name = btrim(name)
    and char_length(name) between 1 and 80
  ),
  constraint obstacle_definitions_sort_order_valid check (
    sort_order between 0 and 1000
  ),
  constraint obstacle_definitions_timestamps_valid check (
    updated_at >= created_at
  )
);

create table public.user_obstacles (
  user_id uuid not null references auth.users (id) on delete cascade,
  obstacle_key text not null
    references public.obstacle_definitions (key) on delete restrict,
  custom_label text,
  created_at timestamptz not null default now(),

  primary key (user_id, obstacle_key),

  constraint user_obstacles_custom_label_valid check (
    custom_label is null
    or (
      obstacle_key = 'something_else'
      and custom_label = btrim(custom_label)
      and char_length(custom_label) between 1 and 120
    )
  )
);

create unique index companion_definitions_active_sort_order_key
  on public.companion_definitions (sort_order)
  where active;

create index user_companions_definition_idx
  on public.user_companions (companion_definition_id);

create unique index life_area_definitions_active_sort_order_key
  on public.life_area_definitions (sort_order)
  where active;

create unique index user_life_areas_definition_key
  on public.user_life_areas (user_id, life_area_definition_id)
  where life_area_definition_id is not null;

create unique index user_life_areas_custom_name_key
  on public.user_life_areas (user_id, lower(custom_name))
  where custom_name is not null;

create index user_life_areas_user_created_at_idx
  on public.user_life_areas (user_id, created_at);

create unique index life_role_definitions_active_sort_order_key
  on public.life_role_definitions (sort_order)
  where active;

create index user_life_roles_definition_idx
  on public.user_life_roles (life_role_definition_id);

create index fixed_commitments_user_active_idx
  on public.fixed_commitments (user_id, active, created_at);

create unique index obstacle_definitions_active_sort_order_key
  on public.obstacle_definitions (sort_order)
  where active;

create index user_obstacles_key_idx
  on public.user_obstacles (obstacle_key);

insert into public.companion_definitions (
  id,
  key,
  name,
  description,
  asset_key,
  sort_order
) values
  (
    '10000000-0000-4000-8000-000000000001',
    'mori',
    'Mori',
    'A calm and thoughtful meadow companion.',
    'mori',
    10
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'lumi',
    'Lumi',
    'A warm and curious starlight companion.',
    'lumi',
    20
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'piko',
    'Piko',
    'A bright and motivating sunrise companion.',
    'piko',
    30
  );

insert into public.life_area_definitions (id, key, name, sort_order) values
  ('20000000-0000-4000-8000-000000000001', 'work', 'Work', 10),
  ('20000000-0000-4000-8000-000000000002', 'learning', 'Learning', 20),
  ('20000000-0000-4000-8000-000000000003', 'school', 'School', 30),
  ('20000000-0000-4000-8000-000000000004', 'business', 'Business', 40),
  ('20000000-0000-4000-8000-000000000005', 'health', 'Health', 50),
  ('20000000-0000-4000-8000-000000000006', 'fitness', 'Fitness', 60),
  ('20000000-0000-4000-8000-000000000007', 'family', 'Family', 70),
  ('20000000-0000-4000-8000-000000000008', 'relationships', 'Relationships', 80),
  ('20000000-0000-4000-8000-000000000009', 'finance', 'Finance', 90),
  ('20000000-0000-4000-8000-000000000010', 'creative', 'Creative', 100),
  ('20000000-0000-4000-8000-000000000011', 'personal', 'Personal', 110),
  ('20000000-0000-4000-8000-000000000012', 'household', 'Household', 120),
  ('20000000-0000-4000-8000-000000000013', 'wellbeing', 'Wellbeing', 130);

insert into public.life_role_definitions (id, key, name, sort_order) values
  ('30000000-0000-4000-8000-000000000001', 'student', 'Student', 10),
  ('30000000-0000-4000-8000-000000000002', 'employed', 'Employed', 20),
  ('30000000-0000-4000-8000-000000000003', 'self_employed', 'Self-employed', 30),
  ('30000000-0000-4000-8000-000000000004', 'business_owner', 'Business owner', 40),
  ('30000000-0000-4000-8000-000000000005', 'parent_caregiver', 'Parent or caregiver', 50),
  ('30000000-0000-4000-8000-000000000006', 'flexible_schedule', 'Flexible schedule', 60),
  ('30000000-0000-4000-8000-000000000007', 'other', 'Other', 70);

insert into public.obstacle_definitions (id, key, name, sort_order) values
  ('40000000-0000-4000-8000-000000000001', 'procrastination', 'Procrastination', 10),
  ('40000000-0000-4000-8000-000000000002', 'social_media', 'Social media', 20),
  ('40000000-0000-4000-8000-000000000003', 'poor_planning', 'Poor planning', 30),
  ('40000000-0000-4000-8000-000000000004', 'low_energy', 'Low energy', 40),
  ('40000000-0000-4000-8000-000000000005', 'too_many_responsibilities', 'Too many responsibilities', 50),
  ('40000000-0000-4000-8000-000000000006', 'distractions', 'Distractions', 60),
  ('40000000-0000-4000-8000-000000000007', 'motivation', 'Motivation', 70),
  ('40000000-0000-4000-8000-000000000008', 'overcommitting', 'Overcommitting', 80),
  ('40000000-0000-4000-8000-000000000009', 'inconsistent_routine', 'Inconsistent routine', 90),
  ('40000000-0000-4000-8000-000000000010', 'not_sure_where_to_start', 'Not sure where to start', 100),
  ('40000000-0000-4000-8000-000000000011', 'something_else', 'Something else', 110);

create trigger set_profiles_updated_at
before insert or update on public.profiles
for each row execute function private.set_phase3_updated_at();

create trigger set_companion_definitions_updated_at
before insert or update on public.companion_definitions
for each row execute function private.set_phase3_updated_at();

create trigger set_user_companions_updated_at
before insert or update on public.user_companions
for each row execute function private.set_phase3_updated_at();

create trigger set_life_area_definitions_updated_at
before insert or update on public.life_area_definitions
for each row execute function private.set_phase3_updated_at();

create trigger set_user_life_areas_updated_at
before insert or update on public.user_life_areas
for each row execute function private.set_phase3_updated_at();

create trigger set_life_role_definitions_updated_at
before insert or update on public.life_role_definitions
for each row execute function private.set_phase3_updated_at();

create trigger set_user_schedule_preferences_updated_at
before insert or update on public.user_schedule_preferences
for each row execute function private.set_phase3_updated_at();

create trigger normalize_fixed_commitment_days
before insert or update of days_of_week on public.fixed_commitments
for each row execute function private.normalize_fixed_commitment_days();

create trigger set_fixed_commitments_updated_at
before insert or update on public.fixed_commitments
for each row execute function private.set_phase3_updated_at();

create trigger set_onboarding_intentions_updated_at
before insert or update on public.onboarding_intentions
for each row execute function private.set_phase3_updated_at();

create trigger set_obstacle_definitions_updated_at
before insert or update on public.obstacle_definitions
for each row execute function private.set_phase3_updated_at();

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.companion_definitions enable row level security;
alter table public.companion_definitions force row level security;
alter table public.user_companions enable row level security;
alter table public.user_companions force row level security;
alter table public.life_area_definitions enable row level security;
alter table public.life_area_definitions force row level security;
alter table public.user_life_areas enable row level security;
alter table public.user_life_areas force row level security;
alter table public.life_role_definitions enable row level security;
alter table public.life_role_definitions force row level security;
alter table public.user_life_roles enable row level security;
alter table public.user_life_roles force row level security;
alter table public.user_schedule_preferences enable row level security;
alter table public.user_schedule_preferences force row level security;
alter table public.fixed_commitments enable row level security;
alter table public.fixed_commitments force row level security;
alter table public.onboarding_intentions enable row level security;
alter table public.onboarding_intentions force row level security;
alter table public.obstacle_definitions enable row level security;
alter table public.obstacle_definitions force row level security;
alter table public.user_obstacles enable row level security;
alter table public.user_obstacles force row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (
  first_name,
  timezone,
  locale,
  onboarding_status,
  onboarding_step
) on public.profiles to authenticated;
grant all on table public.profiles to service_role;

revoke all on table public.companion_definitions from public, anon, authenticated;
grant select on table public.companion_definitions to authenticated;
grant all on table public.companion_definitions to service_role;

revoke all on table public.user_companions from public, anon, authenticated;
grant select, insert, update, delete on table public.user_companions to authenticated;
grant all on table public.user_companions to service_role;

revoke all on table public.life_area_definitions from public, anon, authenticated;
grant select on table public.life_area_definitions to authenticated;
grant all on table public.life_area_definitions to service_role;

revoke all on table public.user_life_areas from public, anon, authenticated;
grant select, insert, update, delete on table public.user_life_areas to authenticated;
grant all on table public.user_life_areas to service_role;

revoke all on table public.life_role_definitions from public, anon, authenticated;
grant select on table public.life_role_definitions to authenticated;
grant all on table public.life_role_definitions to service_role;

revoke all on table public.user_life_roles from public, anon, authenticated;
grant select, delete on table public.user_life_roles to authenticated;
grant insert (user_id, life_role_definition_id)
  on public.user_life_roles to authenticated;
grant all on table public.user_life_roles to service_role;

revoke all on table public.user_schedule_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.user_schedule_preferences to authenticated;
grant all on table public.user_schedule_preferences to service_role;

revoke all on table public.fixed_commitments from public, anon, authenticated;
grant select, insert, update, delete on table public.fixed_commitments to authenticated;
grant all on table public.fixed_commitments to service_role;

revoke all on table public.onboarding_intentions from public, anon, authenticated;
grant select, insert, update, delete on table public.onboarding_intentions to authenticated;
grant all on table public.onboarding_intentions to service_role;

revoke all on table public.obstacle_definitions from public, anon, authenticated;
grant select on table public.obstacle_definitions to authenticated;
grant all on table public.obstacle_definitions to service_role;

revoke all on table public.user_obstacles from public, anon, authenticated;
grant select, delete on table public.user_obstacles to authenticated;
grant insert (user_id, obstacle_key, custom_label)
  on public.user_obstacles to authenticated;
grant update (custom_label)
  on public.user_obstacles to authenticated;
grant all on table public.user_obstacles to service_role;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy companion_definitions_read_active
on public.companion_definitions
for select
to authenticated
using (active);

create policy user_companions_own_rows
on public.user_companions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy life_area_definitions_read_active
on public.life_area_definitions
for select
to authenticated
using (active);

create policy user_life_areas_own_rows
on public.user_life_areas
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy life_role_definitions_read_active
on public.life_role_definitions
for select
to authenticated
using (active);

create policy user_life_roles_own_rows
on public.user_life_roles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy user_schedule_preferences_own_rows
on public.user_schedule_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy fixed_commitments_own_rows
on public.fixed_commitments
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy onboarding_intentions_own_rows
on public.onboarding_intentions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy obstacle_definitions_read_active
on public.obstacle_definitions
for select
to authenticated
using (active);

create policy user_obstacles_own_rows
on public.user_obstacles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on function private.set_phase3_updated_at()
  from public, anon, authenticated;
revoke all on function private.normalize_fixed_commitment_days()
  from public, anon, authenticated;

comment on table public.profiles is
  'Private consumer profile and resumable mobile onboarding state.';
comment on table public.companion_definitions is
  'Server-controlled catalog of active Aiyomi companion identities.';
comment on table public.user_companions is
  'Private user companion selection, chosen name, and support personality.';
comment on table public.user_life_areas is
  'Private selected or custom Life Areas owned by one authenticated user.';
comment on table public.fixed_commitments is
  'Private lightweight weekly unavailability used for future planning.';
comment on table public.onboarding_intentions is
  'Private self-reported improvement focus, not a formal goal or diagnosis.';
