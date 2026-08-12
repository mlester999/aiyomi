# Aiyomi Security and Privacy

## 1. Security posture

Aiyomi handles private details about daily life. Security and privacy must shape system boundaries from the beginning, even while Phase 1A collects only waitlist data.

Core rules:

- keep private life private by default
- collect the minimum data needed for a stated purpose
- keep all service, email, and future AI credentials server-side
- use separate hosted Development, Staging, and Production environments
- never target Production for development or validation
- validate and authorize on the server
- use database constraints and RLS as defense in depth
- trust server time for critical future events
- return safe user-facing errors and keep internals out of responses
- design deletion, correction, consent, and auditability before sensitive features launch

## 2. Current data and trust boundaries

### Browser

The public browser is untrusted. It may submit email, optional first name, preferred platform, hidden honeypot data, UTM values, locale, consent state, and referral attribution. Client validation improves usability but provides no security guarantee.

### Next.js server

The same-origin server endpoint is the Phase 1A trust boundary. It validates, normalizes, throttles, checks anti-spam signals, performs the hosted Supabase operation, calls the email adapter if configured, and returns a generic result.

### Hosted Supabase

Supabase PostgreSQL is the waitlist source of truth. Database constraints enforce invariants and uniqueness. RLS and grants prevent anonymous reads and unintended writes.

### Resend

Resend receives only the contact and delivery data needed for the configured waitlist message or audience synchronization. It is not the authoritative waitlist database. Its API key stays server-side.

### Future AI and integrations

AI, calendar, health, voice, and social providers are separate trust boundaries. Each requires minimal scope, explicit permission where appropriate, server-held credentials, purpose limitation, provider review, revocation, and deletion behavior before launch.

## 3. Secret management

Never expose or commit:

- Supabase service-role or server database credentials
- Resend API keys
- future AI provider keys
- OAuth client secrets
- webhook signing secrets
- administrative session secrets

The browser and mobile app may receive only deliberately public values such as a Supabase URL and publishable or anonymous key. Those keys are safe only when RLS, grants, and endpoint design are correct.

Requirements:

- keep real secrets in environment-specific deployment secret stores
- maintain `.env.example` files with names, not values
- validate variables at server startup or request boundaries
- never log secret values or full authorization headers
- rotate credentials after suspected exposure and record the response
- use different credentials across Development, Staging, and Production
- do not make optional email configuration a hidden dependency of database validation

## 4. Hosted environment isolation

Use dedicated hosted Supabase projects for Development, Staging, and Production. Production is not a shared test database.

Before applying a migration or running a mutating validation:

1. Identify the intended environment.
2. Confirm the linked Supabase project reference.
3. Confirm the data is non-production for Development or Staging work.
4. Apply only reviewed forward-only migrations.
5. Record validation against the named environment without printing secrets.

Preview deployments must not inherit Production service credentials. OAuth callbacks, allowed origins, email senders, and redirect URLs must be environment-specific.

## 5. Phase 1A waitlist controls

### Input validation

- Parse on the server with a strict schema.
- Reject unknown or oversized payloads.
- Normalize email consistently before lookup and insert.
- Constrain platform values to iOS, Android, or Both.
- Trim and bound optional first name.
- Bound source, UTM, locale, and referral fields.
- Do not accept status, provider IDs, conversion fields, or timestamps from the public client.
- Escape content appropriately at every output context, including email templates and admin views.

### Anti-spam

Initial controls include:

- a hidden honeypot that ordinary users and assistive technology do not need to complete
- duplicate prevention through a database uniqueness rule
- basic rate limiting or throttling using appropriate request signals
- bounded body size and field lengths
- constrained attribution values
- safe errors and observability

IP address and user-agent data are personal or risk data in many contexts. If used for throttling, minimize, hash or truncate where appropriate, set a short retention period, and document the purpose. Do not treat a single shared IP as proof of abuse.

Stronger production options may include managed bot protection, challenge escalation only for suspicious traffic, provider-level rate limits, anomaly monitoring, durable distributed throttling, and suppression lists. These are deferred until traffic and risk justify them.

### Duplicate privacy

New and existing normalized emails receive the same friendly success response. The endpoint must not reveal record existence, consent state, referral history, invitation state, conversion state, Resend status, or internal identifiers.

### Database protections

- enforce normalized email uniqueness at the database layer
- enable RLS when exposed through Supabase APIs
- provide no anonymous select, update, or delete policy
- prefer a trusted server endpoint over direct anonymous table inserts
- use trusted server defaults for timestamps and status
- prevent self-referral and invalid foreign references
- make provider synchronization idempotent where possible

### Email protections

- send through one server-side email abstraction
- verify the sending domain and configure SPF, DKIM, and other provider-recommended DNS records
- keep templates safe from HTML injection
- avoid sensitive content in subjects or previews
- treat database acceptance and email delivery as separate outcomes
- retry only idempotent provider operations with limits
- define unsubscribe and consent behavior before marketing campaigns

## 6. Authentication and account security

Future mobile authentication supports email and password, Google Sign-In, email verification, and password reset through Supabase Auth.

Before release:

- use verified redirect URLs and platform deep links
- prevent open redirects
- require verified email ownership for waitlist conversion
- apply rate and abuse controls to signup, login, reset, verification, and OAuth callbacks
- protect sessions with platform-appropriate secure storage
- revoke sessions after sensitive account events as appropriate
- distinguish authentication from application authorization
- provide account deletion and recovery behavior consistent with privacy commitments

Google conversion matching must use a trusted verified provider email, never a client-asserted address.

## 7. Authorization and RLS

Every user-owned future table requires an explicit ownership rule. Common policy intent is that an authenticated user can access only their own private records, with carefully bounded sharing tables for explicit social use.

Admin access requires:

- authenticated identity
- explicit server-side role or permission check
- database access consistent with that role
- audited sensitive actions
- least-privilege views or queries
- protected exports

Do not rely on hidden routes, client role flags, or possession of a public Supabase key. Service credentials bypass RLS and therefore belong only in tightly controlled server modules.

## 8. Privacy classification

Suggested classes:

| Class | Examples | Default treatment |
| --- | --- | --- |
| Public configuration | product name, approved public URLs | safe to publish after review |
| Contact | waitlist email, first name | restricted operational access |
| Private life | tasks, goals, projects, schedules, routines, habits | user-only by default |
| Sensitive reflection | mood, energy, reflection, Companion memories | strict purpose and access limits |
| Derived personal | Life Model features, postponement patterns, inferred capacity | private, explainable, controllable |
| Socially shared | selected profile fields and approved share artifacts | only the exact user-approved subset |
| Security and risk | abuse flags, Trust Score, IP-derived throttling signals | restricted, retained only as needed |
| Administrative | audit records, role assignments, provider configuration | privileged and auditable |

Analytics must never receive email, first name, task text, brain dumps, reflection text, Companion memories, or unrestricted free-form personal content.

## 9. Life Model and AI privacy

Before the Life Model launches:

- distinguish user facts, observations, derived features, hypotheses, and memories
- define permission and sensitivity categories
- record provenance, time window, confidence, and model or rule version
- allow the user to view, remove, disable categories of, and reset memories
- define correction and deletion propagation to derived data and caches
- review provider data retention and training terms
- minimize context sent to each AI request
- prohibit private context from social, sharing, advertising, or competition by default
- avoid inference of protected or highly sensitive traits without a legitimate, approved need

Provider prompts and outputs are not automatically permanent memory. Operational logs should avoid storing full private prompts by default.

## 10. Social and sharing safety

Social features are opt-in. Private task names, schedules, mood, reflections, private goals, Companion memories, and Life Model data must never become visible through a public profile, friend relationship, leaderboard, Focus room, or sharing card by default.

Future sharing requires:

- a generated preview
- explicit confirmation
- a clear list of included information
- no hidden metadata containing private content
- revocation or deletion behavior for hosted artifacts
- reporting, blocking, moderation, and privacy controls before broad community launch

Friend access must not grant access to the underlying private planning records.

## 11. Competitive anti-abuse

Future competitive systems should use a dedicated normalized metric such as Growth Points, not permanent lifetime XP or Day Score. Growth Points cannot be purchased.

Threats include:

- fake or trivial tasks
- one-second task spam
- timer farming or unattended timers
- fabricated completions
- impossible activity timing
- duplicate reward events
- fake and multiple accounts
- manipulated device clocks
- automated bot activity
- referral abuse
- collusion and prize fraud

Controls may include:

- server-authoritative events and timestamps
- stable idempotency keys
- daily competitive caps and diminishing returns
- deterministic duration and sequence checks
- account-age and verification signals
- risk and device signals only where proportionate and lawful
- Trust Score and suspicious activity flags
- AI task-quality classification as a secondary signal, not sole authority
- reviewable award ledgers
- manual review before significant real-world prizes
- documented appeals and correction for consequential enforcement

Never trust a client timestamp or mutable client total for critical competitive outcomes. Never expose anti-abuse thresholds in a way that makes evasion trivial.

## 12. Common web threats

The web and admin applications must address:

- cross-site scripting through correct output encoding and limited HTML injection
- cross-site request forgery for authenticated state-changing routes
- SQL injection through parameterized database interfaces
- server-side request forgery in future URL-fetching capabilities
- open redirects in authentication and CTA destinations
- clickjacking where relevant through response headers
- dependency and supply-chain risk through lockfiles, review, and automated checks
- denial of service through bounded inputs, timeouts, rate limits, and provider budgets
- cache leakage through careful private response caching rules
- insecure direct object reference through authorization and RLS

Use a practical Content Security Policy and security headers suitable for Next.js and required providers. Adding a header without validating the deployed behavior is not completion.

## 13. Error handling and logging

Public errors should be useful but generic. Do not return SQL messages, constraint names, stack traces, provider bodies, secret fragments, internal user IDs, or whether an email exists.

Logs should:

- use correlation identifiers
- record category, result, latency, and safe operational metadata
- redact authorization, secrets, email, and sensitive text
- use access controls and a defined retention period
- distinguish security events from ordinary application errors
- avoid becoming a shadow store of private life data

Alerting should focus on actionable patterns such as unusual signup volume, repeated provider failure, authorization denials, migration problems, and unexpected cost growth.

## 14. Dependency and CI security

- Commit and review the pnpm lockfile.
- Use reproducible installs in CI.
- Run lint, typecheck, tests, and production builds without Production secrets.
- Review dependency updates and avoid unnecessary packages.
- Keep build logs free of environment values.
- Use protected deployment environments for sensitive credentials.
- Scan for committed secrets and respond to findings rather than merely deleting the file from the latest commit.
- Treat generated artifacts and third-party scripts as part of the supply chain.

## 15. Incident response minimum

Before production launch, establish:

1. an owner and contact path for security reports
2. severity and triage criteria
3. secret rotation procedures
4. log preservation and privacy-safe investigation procedures
5. containment and rollback paths
6. user and regulatory notification decision paths
7. post-incident review and corrective actions

Do not promise a response time or legal process until operations can meet it.

## 16. Security review gates by phase

- **Waitlist:** endpoint validation, normalization, throttling, duplicate privacy, RLS, secret boundary, email domain and consent handling
- **Admin:** authentication, role authorization, audit logs, export controls, session protection
- **Mobile Auth:** redirect and deep-link review, secure token storage, verification, deletion
- **Daily Life Engine:** user ownership, offline conflict integrity, private defaults
- **AI and Life Model:** context minimization, memory consent, deletion, provider review, safety evaluations
- **Focus and Day Score:** trusted event provenance and explainable calculations
- **Gamification:** server-authoritative reward ledgers and economic abuse review
- **Social and Leaderboards:** visibility model, moderation, blocking, Trust Score, competition and prize review
- **Billing and Integrations:** webhook verification, entitlement integrity, OAuth scopes, token encryption and revocation
- **Launch:** penetration testing proportionate to risk, incident readiness, backup recovery, privacy and legal review

## 17. Deferred decisions

- production rate-limit and bot-protection provider
- log, alerting, and security monitoring vendors
- retention schedule by data category and launch region
- admin role hierarchy
- encryption needs beyond provider-managed storage and transport
- competitive review and appeal process
- vulnerability disclosure process
- AI provider and integration risk assessments

Deferred does not mean optional. Each decision is required before the dependent feature reaches production.

