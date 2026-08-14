# Aiyomi Admin

## 1. Phase 2 status and scope

Phase 2 is the active implementation phase. Phase 0, Phase 1A, and Phase 1A.1
are accepted. Phase 3 and later product work remain out of scope until the
owner explicitly approves a new phase.

The admin application is an internal operational surface for the capabilities
that exist today. Phase 2 covers:

- admin email and password authentication with password recovery
- explicit active admin membership and role authorization
- protected dashboard, waitlist, analytics, referral, audit, admin-member,
  feature-flag, and settings routes
- real waitlist reporting, bounded lifecycle changes, and filtered export
- append-only audit records for privileged actions
- environment-aware operations against hosted Supabase

There is no public admin registration. A Supabase Auth identity alone never
grants admin access. Phase 2 does not authorize mobile authentication, consumer
profiles, AI, planning, Focus, Day Score, rewards, social features, billing, or
other later-phase product systems.

## 2. Security model

Admin access is granted only when all of these conditions hold:

1. Supabase Auth validates the session.
2. The Auth user has a corresponding `admin_members` record.
3. The membership status is `active`.
4. The membership role contains the permission required by the operation.
5. The database function or RLS boundary independently permits the operation.

Navigation and client-side controls may reflect permissions for usability, but
they are never authorization boundaries. Every protected page, server action,
route handler, export, and privileged database call must authorize on the
server.

The normal admin request path uses the Supabase publishable key together with
the signed user session so database authorization remains in force. A Supabase
secret or service-role key bypasses RLS. It is allowed only in a narrow,
`server-only` adapter for an operation that cannot be performed with the
caller-scoped client. It must never be used as the general admin repository or
sent to a browser.

## 3. Session architecture

The Next.js admin app uses cookie-backed Supabase SSR sessions:

```text
Browser request
  -> Next.js 16 proxy refreshes or validates the Supabase session cookie
  -> protected layout performs the coarse authenticated-admin gate
  -> server data-access function checks the exact permission
  -> caller-scoped Supabase client invokes a bounded query or RPC
  -> PostgreSQL repeats authorization and returns a minimal result
  -> Server Component renders a narrow DTO
```

Durable rules:

- use `@supabase/ssr` and create a new server client for each request
- never retain a user-scoped Supabase client in module-global state
- use Next.js 16 `proxy.ts` for session refresh, not as the final authorization
  layer
- preserve every cookie and cache-control header produced during token refresh
- keep authenticated routes dynamic and private; never use ISR for them
- do not manually copy tokens to local storage
- use fixed, validated same-origin destinations after login and recovery
- handle logout, invalid sessions, suspended membership, and insufficient
  permission without rendering privileged data first

The root layout contains document-level concerns. Public authentication routes
and protected operational routes use separate route groups so the protected
shell and its data are never rendered around the login or recovery experience.

## 4. Server and client responsibilities

Server Components own authenticated reads, aggregates, filters, sorting, and
pagination. Server Actions or same-origin route handlers own mutations. Client
Components are limited to interaction state such as menus, disclosures, filter
controls, and confirmation dialogs. They receive only the fields necessary for
the current view.

Privileged mutations must:

- use POST-based same-origin flows, never GET
- validate a strict, bounded schema
- authorize the exact permission at execution time
- enforce allowed state transitions in trusted server or database code
- write the business change and audit event atomically where practical
- return a safe error without SQL, Auth, or provider internals
- carry a request identifier for correlation when the operation supports one

Raw database rows, role tables, access tokens, refresh tokens, provider IDs
without operational purpose, and secrets do not belong in client props.

## 5. Role and permission matrix

The forward-only Phase 2 authorization migration is the source of truth. Its
baseline role model is:

| Capability | Super Admin | Admin | Analyst | Support |
| --- | --- | --- | --- | --- |
| Dashboard | Read | Read | Read | No access by default |
| Waitlist lead data | Read and update | Read and update | Reporting only | Limited read and approved status actions |
| Waitlist export | Yes | Yes | No | No |
| Analytics and referrals | Read | Read | Read | No access by default |
| Audit logs | Read | Read | No | No |
| Admin members | Read and manage | Read | No | No |
| Feature flags | Read and update | Read and update | No | No |
| Settings | Read and update | Read | No | No |

The migration-controlled permission identifiers include:

- `dashboard.read`
- `waitlist.read`
- `waitlist.status.write`
- `waitlist.export`
- `analytics.read`
- `referrals.read`
- `audit.read`
- `admins.read`
- `admins.write`
- `feature_flags.read`
- `feature_flags.write`
- `settings.read`
- `settings.write`

Role-to-permission mappings are not ordinary UI-editable data in Phase 2. A
membership role may be changed only through the authorized membership workflow.
Only a Super Admin may grant privileged roles or modify another membership.
The final active Super Admin cannot be suspended or demoted through a normal
workflow. An Admin cannot promote themselves or anyone else to Super Admin.

## 6. Database and RPC boundaries

Phase 2 introduces explicit admin membership, a migration-controlled role
matrix, append-only audit records, environment-aware feature flags, and the
minimum approved settings foundation. All are protected by grants, RLS, or
bounded security-definer functions as appropriate.

Database functions exposed to `authenticated` callers must:

- derive identity from `auth.uid()`, never from a caller-supplied user ID
- verify active membership and the exact required permission
- use `security definer` only where necessary and set an empty `search_path`
- fully qualify referenced objects
- validate bounded inputs and allowed transitions
- return only the columns needed by the application
- revoke default function execution from `public` and `anon`
- avoid accepting arbitrary table names, column names, sort expressions, or SQL

Direct browser writes to admin operational tables are prohibited. Direct
access by a future authenticated consumer must remain denied. Server-side
application authorization complements database authorization and does not
justify weakening RLS.

## 7. Waitlist operations

Admin waitlist reads use real hosted data and server-side search, filters,
sorting, and pagination. The browser does not download the full lead table.
Search and filter parameters are allowlisted and length-bounded. Sort fields
map to known database expressions. Page sizes and export sizes have hard caps.

Lead views distinguish known facts from unavailable provider information. A
stored `confirmation_sent_at` proves only the state represented by the existing
email integration. It must not be presented as delivered unless delivery
tracking actually supports that claim.

Status changes accept only the existing constrained lifecycle values and must
create an audit event. Phase 2 does not add casual permanent deletion to the
normal waitlist workflow.

CSV export requires its own `waitlist.export` check even when the button is
hidden. It must revalidate filters, enforce a row limit, escape CSV correctly,
neutralize spreadsheet formulas beginning with `=`, `+`, `-`, or `@`, return
private no-store responses, and audit the actor, filter summary, row count, and
export type. The audit record never stores the generated CSV.

## 8. Audit records

`admin_audit_logs` is append-only operational history. Normal application
roles may insert through authorized functions and read only when they have
`audit.read`. They cannot update, delete, or truncate audit entries.

Audit at minimum:

- waitlist status changes and exports
- feature-flag and application-setting changes
- membership creation, role changes, suspension, and reactivation

Store the actor, effective role, stable machine-readable action, target,
request ID where available, trusted timestamp, and bounded metadata. Never
store passwords, cookies, tokens, keys, authorization headers, full exports, or
unbounded lead payloads.

## 9. Feature flags and settings

Feature flags are operational controls, not a general experimentation platform.
Every flag belongs to one explicit environment. A Development session cannot
mutate a Staging or Production flag through a caller-selected environment.
Updates require `feature_flags.write` and an audit event.

Settings in Phase 2 are limited to approved, non-secret operational values.
Secret values and provider credentials stay in deployment secret stores, not
database settings or audit metadata. Every mutable setting requires strict
validation, `settings.write`, and an audit record with safe previous and new
values.

## 10. Environment and deployment boundaries

Development, Staging, and Production use distinct hosted Supabase projects,
Auth users, API keys, redirect allowlists, and Vercel variables. Local admin
development connects only to hosted Development using an ignored local env
file. Preview deployments use Development or an explicitly isolated preview
project. Staging uses Staging. Production credentials never enter local files,
preview deployments, or the credential-free CI validation job.

The environment label shown in the admin UI comes from the server-only
`AIYOMI_ENVIRONMENT` configuration and must match the hosted project's immutable
admin environment record. It is not inferred from the hostname. Missing,
invalid, or mismatched runtime configuration fails closed when an auth or data
operation begins. A normal build can still complete without hosted credentials.

CI runs deterministic unit checks and production builds without real Supabase
or provider credentials. Hosted integration validation is a separate,
owner-authorized activity against a proven Development or Staging project. See
[the admin owner runbook](admin-runbook.md).

## 11. Production hardening decisions

Before any Production admin launch, the owner must review session lifetime,
inactivity timeout, password policy, leaked-password protection where
available, Auth rate limits, and whether TOTP MFA is mandatory. MFA is strongly
recommended for administrative access, but its enrollment, recovery, and
enforcement policy must be implemented and tested before it can be claimed.

The owner must also confirm audit retention, export purpose and retention,
incident access, backup and recovery procedures, and security header behavior
on the deployed origin.

## 12. Validation boundary

Phase 2 is not complete solely because code builds. Acceptance requires unit
tests, application authorization tests, database/RLS tests against confirmed
hosted Development, browser tests for authentication and protected routes,
responsive and accessibility validation, security-header inspection, and a
credential-free repository build. Production must not be used for Phase 2
development validation.
