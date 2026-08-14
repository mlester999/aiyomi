-- Phase 2 secure admin identity, role authorization, and append-only audit log.
-- Apply only to a deliberately confirmed hosted Development or Staging project.

create type public.admin_member_role as enum (
  'super_admin',
  'admin',
  'analyst',
  'support'
);

create type public.admin_member_status as enum ('active', 'suspended');

create type public.admin_permission as enum (
  'dashboard.read',
  'waitlist.read',
  'waitlist.status.write',
  'waitlist.export',
  'analytics.read',
  'referrals.read',
  'audit.read',
  'admins.read',
  'admins.write',
  'feature_flags.read',
  'feature_flags.write',
  'settings.read',
  'settings.write'
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete restrict,
  role public.admin_member_role not null,
  status public.admin_member_status not null default 'active',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  last_modified_by uuid references auth.users (id) on delete set null,

  constraint admin_members_display_name_valid check (
    display_name is null
    or (
      display_name = btrim(display_name)
      and char_length(display_name) between 1 and 100
    )
  ),
  constraint admin_members_timestamps_valid check (updated_at >= created_at)
);

create index admin_members_role_status_idx
  on public.admin_members (role, status);

create index admin_members_status_updated_at_idx
  on public.admin_members (status, updated_at desc);

create table public.admin_role_permissions (
  role public.admin_member_role not null,
  permission public.admin_permission not null,
  primary key (role, permission)
);

create index admin_role_permissions_permission_role_idx
  on public.admin_role_permissions (permission, role);

insert into public.admin_role_permissions (role, permission)
select 'super_admin'::public.admin_member_role, permission
from unnest(enum_range(null::public.admin_permission)) as permission;

insert into public.admin_role_permissions (role, permission) values
  ('admin', 'dashboard.read'),
  ('admin', 'waitlist.read'),
  ('admin', 'waitlist.status.write'),
  ('admin', 'waitlist.export'),
  ('admin', 'analytics.read'),
  ('admin', 'referrals.read'),
  ('admin', 'audit.read'),
  ('admin', 'admins.read'),
  ('admin', 'feature_flags.read'),
  ('admin', 'feature_flags.write'),
  ('admin', 'settings.read'),
  ('analyst', 'dashboard.read'),
  ('analyst', 'analytics.read'),
  ('analyst', 'referrals.read'),
  ('support', 'waitlist.read'),
  ('support', 'waitlist.status.write');

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_admin_member_id uuid references public.admin_members (id) on delete set null,
  actor_role public.admin_member_role,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  request_id uuid,
  created_at timestamptz not null default now(),

  constraint admin_audit_logs_action_valid check (
    action ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
    and char_length(action) between 3 and 100
  ),
  constraint admin_audit_logs_target_type_valid check (
    target_type ~ '^[a-z][a-z0-9_]*$'
    and char_length(target_type) between 2 and 60
  ),
  constraint admin_audit_logs_target_id_valid check (
    target_id is null or char_length(target_id) between 1 and 160
  ),
  constraint admin_audit_logs_metadata_valid check (
    jsonb_typeof(metadata) = 'object'
    and pg_column_size(metadata) <= 8192
  )
);

create index admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc, id desc);

create index admin_audit_logs_actor_created_at_idx
  on public.admin_audit_logs (actor_user_id, created_at desc);

create index admin_audit_logs_action_created_at_idx
  on public.admin_audit_logs (action, created_at desc);

create index admin_audit_logs_target_created_at_idx
  on public.admin_audit_logs (target_type, target_id, created_at desc);

create index admin_audit_logs_request_id_idx
  on public.admin_audit_logs (request_id)
  where request_id is not null;

create or replace function private.set_admin_member_updated_at()
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

create trigger set_admin_member_updated_at
before update on public.admin_members
for each row execute function private.set_admin_member_updated_at();

create or replace function private.prevent_admin_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Admin audit logs are append-only.' using errcode = '42501';
end;
$$;

create trigger prevent_admin_audit_update_or_delete
before update or delete on public.admin_audit_logs
for each row execute function private.prevent_admin_audit_mutation();

create trigger prevent_admin_audit_truncate
before truncate on public.admin_audit_logs
for each statement execute function private.prevent_admin_audit_mutation();

create or replace function private.require_admin_permission(
  p_permission public.admin_permission
)
returns public.admin_members
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_member public.admin_members;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select member.*
  into v_member
  from public.admin_members as member
  join public.admin_role_permissions as role_permission
    on role_permission.role = member.role
   and role_permission.permission = p_permission
  where member.user_id = auth.uid()
    and member.status = 'active'
  limit 1;

  if v_member.id is null then
    raise exception 'Admin permission denied.' using errcode = '42501';
  end if;

  return v_member;
end;
$$;

create or replace function private.write_admin_audit(
  p_member public.admin_members,
  p_action text,
  p_target_type text,
  p_target_id text,
  p_metadata jsonb,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.admin_audit_logs (
    actor_user_id,
    actor_admin_member_id,
    actor_role,
    action,
    target_type,
    target_id,
    metadata,
    request_id
  ) values (
    p_member.user_id,
    p_member.id,
    p_member.role,
    p_action,
    p_target_type,
    p_target_id,
    coalesce(p_metadata, '{}'::jsonb),
    p_request_id
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.admin_get_current_member()
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', member.id,
    'userId', member.user_id,
    'email', auth_user.email,
    'displayName', member.display_name,
    'role', member.role,
    'status', member.status,
    'permissions', coalesce(
      (
        select jsonb_agg(role_permission.permission order by role_permission.permission)
        from public.admin_role_permissions as role_permission
        where role_permission.role = member.role
      ),
      '[]'::jsonb
    )
  )
  from public.admin_members as member
  join auth.users as auth_user on auth_user.id = member.user_id
  where member.user_id = auth.uid()
    and member.status = 'active'
  limit 1;
$$;

alter table public.admin_members enable row level security;
alter table public.admin_members force row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_role_permissions force row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.admin_audit_logs force row level security;

revoke all on table public.admin_members from anon, authenticated;
revoke all on table public.admin_role_permissions from anon, authenticated;
revoke all on table public.admin_audit_logs from anon, authenticated;
grant all on table public.admin_members to service_role;
grant select on table public.admin_role_permissions to service_role;
grant select, insert on table public.admin_audit_logs to service_role;

revoke all on function private.set_admin_member_updated_at() from public, anon, authenticated;
revoke all on function private.prevent_admin_audit_mutation() from public, anon, authenticated;
revoke all on function private.require_admin_permission(public.admin_permission) from public, anon, authenticated;
revoke all on function private.write_admin_audit(public.admin_members, text, text, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.admin_get_current_member() from public, anon;
grant execute on function public.admin_get_current_member() to authenticated;

comment on table public.admin_members is
  'Explicit admin authorization memberships. Supabase authentication alone never grants admin access.';
comment on table public.admin_role_permissions is
  'Migration-controlled Phase 2 role matrix. It is not mutable through the admin UI.';
comment on table public.admin_audit_logs is
  'Append-only operational audit events for privileged admin actions.';
comment on function public.admin_get_current_member() is
  'Returns only the caller active admin membership and effective permissions.';
