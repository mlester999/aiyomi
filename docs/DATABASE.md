# Aiyomi Database

## 1. Database principles

Aiyomi uses PostgreSQL in hosted Supabase. The database is a durable source of truth, not a mirror of transient UI state.

Rules:

- use separate hosted Development, Staging, and Production projects
- never use Production for development or validation
- represent all schema changes as forward-only migrations
- normalize and constrain data at trust boundaries
- use server timestamps for authoritative events
- document RLS for every table exposed through Supabase APIs
- collect only data needed for a defined product purpose
- distinguish user intent, actual occurrence, and inferred patterns
- make sensitive records private by default
- preserve auditability without retaining unnecessary personal content

The waitlist schema is the accepted Phase 1A source of truth. Phase 2 adds only
the admin authorization, audit, feature-flag, settings, and bounded waitlist
operation structures required by the active admin scope. Future consumer
domains below remain conceptual boundaries, not authorization to create those
tables now.

## 2. Phase 1A table: `waitlist_signups`

### Purpose

`waitlist_signups` stores public launch interest and attribution. Supabase is the source of truth even when Resend is unavailable.

### Field contract

| Field | Suggested type | Nullability and rules | Purpose |
| --- | --- | --- | --- |
| `id` | `uuid` | primary key, server default | stable internal identity |
| `email` | `text` or case-insensitive equivalent | required, unique after normalization | contact and future verified conversion match |
| `first_name` | `text` | optional, trimmed, bounded length | optional personalization |
| `platform_interest` | constrained text or enum | required: `ios`, `android`, `both` | preferred launch platform |
| `status` | constrained text or enum | required with initial status | lifecycle such as waiting, invited, converted, unsubscribed, suppressed |
| `source` | constrained text | required safe default, bounded | high-level acquisition source |
| `utm_source` | `text` | optional, normalized, bounded | campaign attribution |
| `utm_medium` | `text` | optional, normalized, bounded | campaign attribution |
| `utm_campaign` | `text` | optional, normalized, bounded | campaign attribution |
| `utm_content` | `text` | optional, normalized, bounded | campaign attribution |
| `utm_term` | `text` | optional, normalized, bounded | campaign attribution |
| `referral_code` | normalized text | optional, bounded, indexable | code attributable to this signup if issued |
| `referred_by` | `uuid` | optional self-reference with safe delete behavior | referring waitlist record |
| `locale` | bounded text | optional | locale observed or chosen at signup |
| `marketing_consent` | `boolean` | required, safe default | recorded marketing permission state |
| `consent_at` | `timestamptz` | required only when consent is true | evidence of permission timing |
| `resend_contact_id` | `text` | optional, unique where present | external audience synchronization reference |
| `confirmation_sent_at` | `timestamptz` | optional | confirmation send acceptance time; delivery remains unknown |
| `converted_user_id` | `uuid` | optional, future reference to Auth user | verified waitlist conversion |
| `converted_at` | `timestamptz` | optional, paired with converted user | conversion time |
| `created_at` | `timestamptz` | required, server default | authoritative creation time |
| `updated_at` | `timestamptz` | required, server maintained | latest material update time |

The concrete migration is authoritative for exact SQL names and constraints. Application types and validation must remain aligned with it.

### Invariants

- Normalize email by trimming surrounding whitespace and applying a consistent lowercase policy before lookup and insert.
- Enforce one record per normalized email at the database layer. Application checks alone are race-prone.
- Treat duplicate submission as idempotent success. Never reveal the existing record or its status.
- Constrain `platform_interest` to iOS, Android, or Both using canonical stored values.
- Bound first name, locale, source, UTM, and referral values to prevent storage abuse and unsafe downstream content.
- `consent_at` must be present when `marketing_consent` is true and absent or deliberately interpreted when false.
- `converted_user_id` and `converted_at` should be set together.
- `referred_by` must not reference the record itself.
- Server-controlled lifecycle, provider, conversion, and timestamp fields are not accepted from the public form.

### Suggested indexes

- unique index on normalized `email`
- unique partial index on `referral_code` where not null, if codes are issued
- index on `created_at` for recent signup reporting
- index on `platform_interest`
- index on `status`
- index on `source` and selected campaign fields only where reporting needs justify them
- index on `referred_by`
- unique or ordinary index on `converted_user_id` based on the final conversion rule

Avoid indexing every attribution field without an observed query need.

## 3. Public write path and RLS

The preferred Phase 1A path is a same-origin server endpoint that validates input and performs the database operation with a narrowly held server credential if required. The browser should not insert directly into `waitlist_signups`.

RLS posture:

- enable RLS when the table is exposed through Supabase APIs
- grant no anonymous read, update, or delete access
- do not create a broad anonymous select policy
- avoid direct anonymous insert if the server endpoint can own anti-spam and normalization
- constrain server access to the smallest operational surface possible
- future admin reads require authenticated roles plus explicit application authorization

A Supabase service-role key bypasses RLS and must never be sent to a browser, mobile app, analytics system, email template, or log.

## 4. Idempotent signup behavior

Conceptual server operation:

1. Validate and normalize the request.
2. Apply anti-spam and throttling checks.
3. Attempt an insert protected by the database uniqueness constraint, or use a carefully bounded conflict strategy.
4. Treat unique conflict as the same public success response.
5. Avoid overwriting trusted consent, conversion, referral, or provider fields from a repeated anonymous request.
6. Synchronize Resend only after the database result is known.
7. Record provider success without making provider availability the source of truth.

If duplicate metadata updates are later desired, define exactly which fields may change and how consent evidence is preserved. Do not silently let a public duplicate request rewrite acquisition attribution or conversion state.

## 5. Attribution and referrals

UTM values are optional, bounded, and treated as untrusted input. Keep their original marketing meaning while normalizing whitespace and rejecting unreasonable values. Analytics reporting should aggregate them without exposing an email address.

Future referral flow:

`ref code in URL -> validated code -> new signup -> referred_by references referrer`

Referral rules should eventually prevent self-referral, cyclic relationships, brute-force enumeration, and rewards from unverified or abusive signups. The public API must not disclose whether a referral code maps to a particular person.

Potential early-supporter rewards such as a Founder badge, cosmetic, Companion item, or achievement are future product decisions. Do not award competitive Growth Points for referral purchases or signups.

## 6. Waitlist conversion

When future mobile authentication exists, conversion may occur only after a trusted provider verifies the account email.

Conceptual flow:

1. A person creates or signs into a Supabase Auth account.
2. Email ownership is verified through email verification or a trusted Google identity.
3. A trusted server process normalizes the verified email using the same policy as the waitlist.
4. At most one matching waitlist record is associated with the Auth user.
5. The process sets `converted_user_id` and `converted_at` idempotently.
6. A repeat event returns the existing result without creating a second conversion.

Never match an unverified user-supplied email. Account deletion, email changes, and restored accounts need explicit future policies before conversion is implemented.

## 7. Phase 2 admin operational model

### Authentication and membership

Supabase Auth owns credentials and sessions. `admin_members` owns Aiyomi admin
authorization. The two are deliberately separate because future consumer users
will also exist in `auth.users`.

An admin membership contains a unique Auth user reference, constrained role,
active or suspended status, optional display name, trusted timestamps, and
actor references for creation and modification. Authentication without an
active membership grants no admin access.

The initial roles are:

- `super_admin`
- `admin`
- `analyst`
- `support`

The role-to-permission matrix is seeded and changed through reviewed migrations,
not a generic Phase 2 UI. `ADMIN.md` records the baseline matrix. The first
Super Admin is inserted only through the owner-controlled process in
`admin-runbook.md`. Never assign the role based on email domain, an environment
variable, or first login.

### Authorization functions and grants

The preferred Phase 2 database surface is a set of bounded RPC functions. A
function exposed to the `authenticated` role must derive identity from
`auth.uid()`, require an active membership and exact permission, validate all
inputs, and return only the required fields. Security-definer functions use an
empty `search_path`, fully qualified object names, and explicit function grants.

Do not grant broad authenticated select or update access to waitlist or admin
tables merely because the application checks a role. Normal admin calls use the
publishable key plus user session. RLS, grants, and RPC authorization deny
future authenticated consumer users. A service-role client is reserved for a
narrow server operation that genuinely cannot use caller-scoped authorization.

### Waitlist reads and metrics

Phase 2 supports privileged, server-paginated operations over the existing
waitlist table:

- total, today, 7-day, 30-day, confirmation-requested, referral, and conversion
  counts
- bounded signup trends and platform, source, campaign, and conversion
  aggregates
- allowlisted search, filters, sort order, date range, and page size
- minimal lead-list rows and a permission-checked lead detail result
- referral aggregates based only on stored referral relationships

Queries must not fetch the entire waitlist for client-side filtering. Indexes
should follow the actual search, filter, ordering, and aggregate plans. Avoid
N+1 lookups and redundant exact counts. Conversion remains zero when no stored
conversion exists.

### Waitlist mutations and export

Lifecycle mutations accept only existing constrained status values and enforce
allowed transitions. The database function writes the status change and its
audit event in one transaction. Phase 2 does not expose normal permanent
waitlist deletion.

Filtered export is an independently authorized operation. It reuses the bounded
filter schema, has a hard row limit, returns an allowlisted field set, and writes
one audit event containing the safe filter summary and row count. CSV bytes and
full lead payloads are not stored in the audit table.

### Append-only audit log

`admin_audit_logs` records actor identity, effective membership and role,
machine-readable action, target type and identifier, bounded JSON metadata,
optional request ID, and server timestamp. Normal application roles cannot
update, delete, or truncate audit rows. Audit events cover waitlist changes and
exports, feature-flag and setting mutations, and membership changes.

Audit metadata must not contain passwords, cookies, access or refresh tokens,
authorization headers, provider keys, complete exports, or unnecessary contact
data. Retention and privileged access must be approved before Production.

### Feature flags and settings

Feature flags use a constrained key and explicit Development, Staging, or
Production environment. Mutations are authorized and audited. The trusted
server's `AIYOMI_ENVIRONMENT` value must match the hosted project's immutable
environment singleton; a caller cannot select Production while operating a
Development session.

Phase 2 settings are limited to approved non-secret operational values. Every
setting has a strict value schema, environment boundary where relevant, an
authorized mutation, and an audit event. Provider credentials and other secrets
remain in deployment secret stores, never settings rows.

## 8. Future domain boundaries

These domains guide later consumer schema design and remain outside Phase 2
without explicit future scope.

### Identity and preferences

Profiles, timezone, day preferences, Life Areas, notification settings, accessibility preferences, audio controls, privacy choices, and Companion configuration belong to the user. Auth identity and public profile identity should remain separate so social participation stays optional.

### Planning

Goals, projects, tasks, routines, and habits have distinct identities. Scheduling should reference them without turning every scheduled item into the same record type. Recurrence definitions and actual routine occurrences must be separate.

### Actual activity

Sessions and Focus Sessions capture occurrences, timestamps, durations, interruptions, outcomes, and optional ratings. Planned duration remains separate from actual duration. Corrections should preserve provenance.

### Reflection and Day Score

Reflections are sensitive private records. Future score versions must preserve inputs, algorithm version, contextual dimensions, explanations, and corrections so results are reproducible. Day Score is not a competitive ranking input by default.

### Life Model and memory

User statements, observed events, derived features, hypotheses, and saved Companion memories are different data classes. Each needs source, confidence, time window, model or rule version, consent category, and deletion behavior. A derived pattern must not overwrite raw history or present itself as fact.

### Rewards and competition

XP, spendable currency, Growth Points, achievements, quests, inventory, and competitive events are separate ledgers or event streams. Never use a mutable client total as the source of truth. Competitive award events need trusted timestamps, idempotency keys, reason codes, caps, and review status.

### Social

Friend relationships, challenges, shared Focus rooms, public profile fields, and share artifacts must use explicit visibility. They must not inherit access from private planning, reflection, or Life Model tables.

## 9. Server-authoritative competitive data

When competition is scoped, database design must resist fake tasks, one-second spam, timer farming, unattended timers, fake accounts, multiple accounts, device clock manipulation, fabricated completions, impossible timing, duplicate rewards, and bots.

Potential controls include:

- append-only or tamper-evident award events
- server timestamps and idempotency keys
- bounded daily competitive contribution
- diminishing returns
- normalized Growth Points rather than lifetime XP
- account-age and risk signals
- a separate Trust Score and suspicious activity flags
- deterministic validation before any AI classification
- review queues for meaningful real-world rewards

Top global users must be reviewable before significant rewards are distributed. Money cannot purchase Growth Points or rank.

## 10. Retention, deletion, and privacy

Before a future data class reaches production, document:

- why it is collected
- whether it is required or optional
- who can read or change it
- how long it is kept
- which derived records depend on it
- how export, correction, memory reset, account deletion, and legal retention work
- whether backups and provider copies have delayed deletion

Users should eventually be able to view and remove saved Companion memories, disable memory categories, reset memory, control visibility, delete their data, and delete their account. Deleting raw private data must trigger a defined strategy for dependent Life Model features and cached AI context.

## 11. Migration and recovery procedure

For every schema change:

1. Create a new forward-only migration.
2. Review constraints, indexes, defaults, grants, RLS, and rollback implications.
3. Apply and validate against a dedicated hosted Development project.
4. Generate or verify database types.
5. Run application validation and relevant tests.
6. Promote to Staging and verify with non-production data.
7. Confirm the target project before any Production action.
8. Monitor the change and apply a new corrective migration if needed.

Never edit an already applied migration to hide drift. Never use a Production project as the first validation target.

Admin bootstrap and environment promotion require the separate owner checks in
`admin-runbook.md`. Credential-free CI does not apply migrations or prove RLS.
Hosted authorization tests run only after the selected Development or Staging
project has been independently confirmed.

## 12. Open decisions

- exact status vocabulary and suppression handling for the waitlist
- normalized email storage implementation and compatibility with future Auth matching
- retention period for non-converted and unsubscribed waitlist records
- whether referral codes are issued at signup or during a later campaign
- audit-log and export retention periods
- exact Phase 2 setting allowlist
- Production admin session and MFA policy
- job mechanism for retrying email synchronization
- future regional residency and backup requirements
