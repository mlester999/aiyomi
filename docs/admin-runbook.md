# Aiyomi Admin Owner Runbook

## 1. Purpose

This runbook covers owner-controlled setup and validation for the Phase 2 admin
portal. It does not authorize a Production migration, create an automatic Super
Admin, or replace a reviewed deployment procedure.

The repository uses hosted Supabase only. Do not run Docker, local Supabase
containers, or `supabase start`.

## 2. Environment register

Maintain an owner-controlled register outside the repository with one row for
each environment:

| Environment | Supabase project | Admin origin | Data rule |
| --- | --- | --- | --- |
| Development | Dedicated hosted Development project | Local and approved previews | Synthetic or approved non-production data |
| Staging | Dedicated hosted Staging project | Staging origin | Non-production release validation data |
| Production | Dedicated hosted Production project | Production origin | Real operational data |

Do not store project secrets in this register if it is shared broadly. Project
references are identifiers, not credentials, but they should still be handled
as internal operational information.

Before every remote schema or data mutation, record the intended environment
and independently confirm all of the following:

- the current Supabase CLI link or selected Dashboard project matches the
  intended project reference
- the project name and organization match the environment register
- the admin origin and Auth redirect allowlist belong to the same environment
- the target is Development or Staging for Phase 2 validation
- no Production credential is present in the local shell or ignored env file

If any item cannot be proven, stop before the mutating command.

## 3. Local setup

1. Copy variable names from `apps/admin/.env.example` into an ignored
   `apps/admin/.env.local` file.
2. Use only the hosted Development project URL and publishable key.
3. Set `AIYOMI_ENVIRONMENT=development`. This server-only label must match the
   hosted project's immutable admin environment configuration.
4. Configure the local admin origin as `http://localhost:3001` in the hosted
   Development Auth redirect allowlist.
5. Do not add a Supabase secret or service-role key unless a separately approved
   server-only operation genuinely requires it.
6. Never copy Production variables into the local file for convenience.

Public variables are intentionally browser-readable and are not authorization.
The publishable key is safe only when grants, RLS, membership checks, and RPC
authorization are correct.

## 4. Credential-free repository validation

The normal CI and local validation path must work without real hosted secrets:

```bash
pnpm install --frozen-lockfile
pnpm peers check
pnpm lint
pnpm typecheck --force
pnpm test --force
NEXT_TELEMETRY_DISABLED=1 \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001 \
pnpm build --force
```

These commands validate code structure. They do not prove hosted authentication,
RLS, migration state, redirect configuration, or email-provider behavior.

## 5. Applying forward-only migrations

Only an owner or explicitly authorized operator may apply migrations.

1. Review every unapplied file in `supabase/migrations`.
2. Confirm the linked project using the environment register and Supabase
   Dashboard. Do not rely on terminal history or memory.
3. Confirm the target is hosted Development or Staging.
4. Inspect the planned migration list from the repository root:

   ```bash
   supabase db push --dry-run
   ```

5. Apply the forward-only migrations only after the dry run matches the reviewed
   files and the owner has authorized the confirmed non-production target:

   ```bash
   supabase db push
   ```

6. Record the target environment, migration identifiers, operator, time, and
   result without recording credentials.
7. Regenerate database types from that same non-production linked project and
   review the diff:

   ```bash
   supabase gen types typescript --linked --schema public \
     > packages/database/src/index.ts
   ```

8. Run the full typecheck, tests, and builds again.

Do not edit an already applied migration. Add a new corrective migration. Do
not use Production as the first target for a migration or validation query.

## 6. Configure the hosted project environment

After the Phase 2 migration applies, configure the protected environment singleton
once through the trusted SQL editor for the confirmed project. Use the value
that matches the environment register:

```sql
insert into public.admin_environment (singleton, environment)
values (true, 'development');
```

Use `staging` only in the separately confirmed Staging project. Do not configure
Production during Phase 2 development. The row is intentionally immutable so a
runtime request cannot relabel one hosted project as another. If the wrong value
is inserted, stop and use a reviewed corrective migration or owner recovery
procedure. Do not disable the protection trigger for convenience.

Set the deployment's `AIYOMI_ENVIRONMENT` to the same value. The application
must fail closed when the server configuration and hosted project disagree.

## 7. First Super Admin bootstrap

There is no public admin signup and no automatic first-admin rule. Bootstrap is
an explicit trusted owner operation.

1. In the hosted Development Supabase Dashboard, create or identify the owner's
   Auth user. Require a verified owner-controlled email.
2. Copy the Auth user's UUID from the trusted Dashboard. Verify the email and
   UUID together before continuing.
3. In the SQL editor for the same confirmed Development project, insert one
   active `super_admin` membership using placeholders replaced in the trusted
   editor:

```sql
begin;

select id, email, created_at
from auth.users
where id = '<OWNER_AUTH_USER_UUID>'::uuid;

insert into public.admin_members (
  user_id,
  role,
  status,
  display_name
) values (
  '<OWNER_AUTH_USER_UUID>'::uuid,
  'super_admin',
  'active',
  'Owner'
);

commit;
```

4. Confirm exactly one active membership exists for that UUID.
5. Sign in through the Development admin origin and verify the displayed email,
   role, and environment before any operational action.
6. Confirm an authenticated non-admin is denied and a suspended test admin is
   denied before treating the bootstrap as validated.

Never bootstrap by hardcoded email, email domain, environment-only identity,
client-side role, or "first login wins." Do not place the owner UUID or email in
source control.

## 8. Ongoing membership operations

After the initial bootstrap, use the authorized admin membership workflow where
implemented. Every creation, role change, suspension, and reactivation must be
server-authorized and audited.

Before a Super Admin membership is suspended or demoted:

1. Count active Super Admin memberships in trusted server or database code.
2. Reject the action when it would leave zero active Super Admins.
3. Reject self-suspension when the actor is the final active Super Admin.
4. Require the target role to be one of the migration-controlled values.
5. Confirm the audit event records actor, target, previous role/status, new
   role/status, request ID where available, and trusted timestamp.

The admin UI must not expose a general Auth-user creation API or a service-role
key. A future invitation workflow requires separate owner approval, Super Admin
authorization, safe redirect configuration, and auditing.

## 9. Lost access or suspected compromise

1. Use the Supabase Dashboard to revoke the affected Auth sessions.
2. Suspend the compromised admin membership through an authorized second Super
   Admin or a documented owner-controlled trusted database operation.
3. Confirm at least one known-good active Super Admin remains before changing
   the membership.
4. Rotate any credential that may have been exposed and update only the correct
   environment's secret store.
5. Preserve relevant privacy-safe audit and provider logs.
6. Review audit events for exports, membership changes, feature flags, settings,
   and waitlist mutations.
7. Record containment and recovery actions outside the application audit log if
   the application itself was unavailable.

Do not create a hidden bypass account, weaken RLS, or add a hardcoded emergency
email. Lost-factor recovery for any future MFA policy requires its own reviewed
owner procedure.

## 10. Hosted Development validation matrix

Use synthetic identities and approved non-production waitlist rows only.

| Scenario | Expected result |
| --- | --- |
| No session | Redirect to login; no privileged data in the response |
| Authenticated non-admin | Access denied |
| Suspended member | Access denied |
| Active Support | Limited waitlist access and only approved status actions |
| Active Analyst | Dashboard and reporting; no mutation or export |
| Active Admin | Approved operations; no Super Admin membership mutation |
| Active Super Admin | All Phase 2 permissions subject to final-Super-Admin protection |
| Direct table/API attempt without permission | Denied by grants, RLS, or RPC authorization |
| Filtered export | Bounded, formula-safe CSV and one audit event |
| Waitlist status update | Allowed transition and one audit event |
| Feature-flag change | Current environment only and one audit event |
| Setting change | Non-secret value only and one audit event |

Also verify login, logout, password recovery, expired sessions, back-button
behavior, request caching, responsive layouts, keyboard operation, focus states,
security headers, and browser console output.

Record only environment, scenario, outcome, time, and safe identifiers. Do not
paste cookies, authorization headers, keys, passwords, full lead data, or CSV
contents into test records.

## 11. Deployment separation

Use distinct Vercel projects or protected environment-variable scopes so each
admin deployment resolves to exactly one matching Supabase environment:

- local and approved preview deployments use hosted Development or an isolated
  preview project
- Staging deployments use hosted Staging
- Production deployments use hosted Production only after separate owner
  approval

For the admin Vercel project, set the project Root Directory to `apps/admin` so
Vercel uses `apps/admin/vercel.json`. The repository-root `vercel.json` remains
the public web deployment configuration. Enable Vercel's option to include
source files outside the Root Directory because the admin deliberately reuses
the approved logo asset from `apps/web/public`.

The public waitlist now checks the database-backed `waitlist_enabled` flag on
every submission and fails closed when the flag RPC is unavailable. Apply both
Phase 2 migrations, configure the immutable `admin_environment` row, and verify
`is_waitlist_enabled()` in the same non-production project before deploying the
updated public web app. Otherwise new waitlist submissions will return a safe
temporary-unavailable response.

Each environment has independent Supabase URL, publishable key, optional
server-only credentials, Auth redirect allowlist, admin origin, and explicit
environment label. Preview deployments must not inherit Production secrets.

Recommended promotion order for additive changes:

1. Apply and validate migrations in Development.
2. Regenerate and review database types.
3. Validate the credential-free repository build.
4. Deploy and smoke-test the Development admin.
5. Repeat the migration and smoke-test process in Staging with non-production
   data.
6. Stop for owner approval before any Production migration or deployment.

## 12. Production readiness checkpoint

Before Production, the owner must explicitly approve:

- session lifetime, inactivity, password, and optional MFA policies
- permitted administrators and the initial Production bootstrap identity
- audit retention and access
- CSV export purpose, permission, row limit, storage, and deletion behavior
- feature-flag and setting ownership
- Production Auth redirect allowlist and security headers
- backup, recovery, rollback, monitoring, and incident ownership

Phase 2 development validation never targets Production. A successful
Development or Staging result is not permission to promote automatically.
