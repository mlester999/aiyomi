# Aiyomi Architecture

## 1. Scope and goals

Aiyomi uses one TypeScript monorepo for the public web experience, future admin application, future mobile application, shared contracts, and hosted Supabase assets. The architecture should support the current landing page and waitlist without prematurely implementing future roadmap phases.

Goals:

- keep mobile, web, and admin product surfaces independently evolvable
- share contracts and domain meaning without forcing a universal cross-platform UI
- keep secrets and provider access on trusted server surfaces
- use hosted Supabase for database, authentication, storage, realtime, and edge capabilities where appropriate
- preserve a path to offline-aware mobile behavior
- make AI providers replaceable through a server-side gateway
- keep deployments testable without production credentials
- favor direct, understandable modules over speculative abstractions

## 2. Locked technology choices

| Concern | Choice |
| --- | --- |
| Repository | GitHub monorepo |
| Package manager | pnpm |
| Task orchestration | Turborepo |
| Language | TypeScript |
| Public web | Next.js, Tailwind CSS, Vercel |
| Admin | Next.js, Vercel |
| Mobile | React Native, Expo, TypeScript, Expo Router, future EAS builds |
| Backend | Hosted Supabase with PostgreSQL, Auth, RLS, Storage, Realtime and Edge Functions where useful |
| Email | Resend behind a server-side service abstraction |
| Validation | Shared Zod schemas where appropriate |
| Future AI | Provider-independent, server-side AI gateway |

No Docker, local Supabase containers, or `supabase start` command is required. A dedicated Express, Fastify, or NestJS API is not justified in the current phase.

## 3. Repository boundaries

```text
/
├── apps/
│   ├── web/             public marketing site and secure waitlist endpoint
│   ├── admin/           bounded admin foundation
│   └── mobile/          Expo and Expo Router foundation
├── packages/
│   ├── types/           shared TypeScript types
│   ├── schemas/         validation and transport schemas
│   ├── domain/          platform-neutral domain behavior
│   ├── database/        database-facing types and helpers
│   ├── config/          product and environment-independent configuration
│   ├── design-tokens/   shared visual primitives, not shared UI components
│   ├── analytics/       vendor-neutral event contracts
│   └── testing/         shared test helpers
├── supabase/
│   ├── migrations/      forward-only SQL migrations
│   ├── functions/       future hosted Edge Functions
│   └── config.toml      CLI project configuration only
└── docs/                durable product and technical decisions
```

Packages should exist only when they contain a real shared concern. Circular dependencies are prohibited. A suggested dependency direction is:

```text
types <- schemas <- domain
  ^          ^         ^
  └──────── app adapters and server modules

config, design-tokens, analytics, and testing remain focused leaf utilities.
database depends on contracts, never on an app.
```

Apps may depend on packages. Shared packages must not depend on an app or import platform-specific code.

## 4. Platform-specific UI

Web, admin, and mobile must keep their UI implementations inside their respective apps. They have different accessibility APIs, navigation models, performance constraints, and interaction patterns.

Appropriate shared material includes:

- TypeScript types and enums
- Zod schemas
- domain rules and calculations that do not reference a UI runtime
- API contracts
- generated database types
- analytics event names and property schemas
- product configuration
- primitive design tokens such as color, space, type, radius, and motion values
- test factories and helpers

Do not build one universal button, form, modal, or screen component package across Next.js and React Native. Visual parity should come from common principles and tokens, not a forced runtime abstraction.

## 5. Application responsibilities

### `apps/web`

Current responsibilities:

- render the public consumer landing page
- communicate future capabilities without implying availability
- capture email, optional first name, platform interest, UTM attribution, and referral attribution
- submit through a same-origin server endpoint
- run server-side validation, anti-spam checks, database operations, and optional email operations
- publish public SEO and vendor-neutral analytics events without sensitive content

Browser code may use only public configuration. It never receives Supabase service credentials or the Resend API key.

### `apps/admin`

Current responsibility is a valid, clean foundation only. Full admin functionality is deferred.

Future routes may include dashboard, users, waitlist, analytics, referrals, subscriptions, AI provider configuration, models, prompts, usage, costs, Companions, cosmetics, achievements, quests, rewards, competitions, leaderboards, abuse flags, email, feature flags, settings, and audit logs.

All future admin data access requires authenticated server-side authorization. Hiding a route in navigation is not authorization.

### `apps/mobile`

Current responsibility is a valid Expo, React Native, TypeScript, and Expo Router foundation. Complete authentication, onboarding, daily planning, Companion, AI, Focus, reflection, rewards, and social screens are deferred to their roadmap phases.

Future mobile architecture should support local identifiers, cached Today data, an uninterrupted local timer, queued mutations, asset caching, and reconciliation after connectivity returns. AI calls remain online operations.

## 6. Current waitlist request path

```text
Browser form
  -> same-origin server endpoint
  -> parse and validate bounded input
  -> honeypot and throttle checks
  -> normalize email and attribution
  -> hosted Supabase transaction or idempotent insert
  -> optional Resend audience synchronization
  -> optional confirmation message
  -> generic success response
```

Supabase is the source of truth. A Resend failure must not discard a valid database signup. It should be logged safely and remain retryable. A duplicate normalized email returns a friendly success response without confirming whether a particular record already existed.

The endpoint must not return raw database, Resend, validation internals, or stack traces.

## 7. Hosted Supabase environments

Use three separate hosted projects or equivalent isolated environments:

| Environment | Purpose | Data rule |
| --- | --- | --- |
| Development | local developer and preview validation | synthetic or approved non-production data only |
| Staging | release candidate validation and integration testing | non-production data only |
| Production | real customer traffic | never used for development validation |

Each environment must have distinct project references, API keys, database credentials, OAuth configuration, redirect URLs, and deployment variables. Production secrets must not be copied into local `.env` files for convenience.

The Supabase CLI may be used for:

- linking to an explicitly identified non-production hosted project
- applying forward-only migrations
- inspecting a remote schema
- generating types
- validating migrations and RLS against development or staging

Before a mutating command, verify the linked project reference and environment. Do not make CI depend on a developer's local link state.

## 8. Schema and migration discipline

- Every schema change is represented by a forward-only migration in `supabase/migrations`.
- Applied migrations are immutable. Corrections use a new migration.
- Destructive changes require an explicit rollout and recovery plan.
- Tables containing user data require an RLS decision before exposure through Supabase APIs.
- Generated database types should be reproducible and updated after schema changes.
- Application deployments must tolerate safe migration ordering when a rolling deployment is possible.
- Critical timestamps and competitive records use trusted server time, not client time.

See `DATABASE.md` for the current waitlist model and future conceptual domains.

## 9. Authentication and authorization path

Future mobile authentication uses Supabase Auth with email and password, Google Sign-In, email verification, and password reset.

Authorization layers are distinct:

1. **Authentication:** who is making the request
2. **Database RLS:** which rows that identity can access
3. **Application authorization:** which actions and administrative roles are permitted
4. **Provider authorization:** which server component can use external credentials

Service credentials may bypass RLS and therefore remain limited to tightly scoped server modules. Client applications use publishable or anonymous keys plus RLS, never a service-role key.

## 10. Server-side integrations

External services use narrow adapters with typed results and explicit failure behavior.

### Email

An email service abstraction owns Resend calls, sender configuration, audience synchronization, templates, and delivery errors. UI and domain modules must not call Resend directly.

### Future AI

A server-side AI gateway owns provider credentials, model routing, prompt versioning, structured-output validation, safety controls, token and cost accounting, retries, timeouts, and audit metadata. Apps consume Aiyomi capabilities, not provider-specific APIs.

### Future calendars and health

Integrations require explicit permission, minimal scopes, revocation, token protection, and clear source attribution. Raw provider data should not be duplicated unless the product needs it and retention is documented.

## 11. Configuration and secrets

Configuration is separated into:

- **public:** Supabase URL, publishable or anonymous key, public site URL, admin URL, approved brand metadata, and later real store URLs
- **server-only:** Supabase service credentials if genuinely required, Resend API key, sender settings, future AI keys, webhook secrets, and integration credentials
- **build-independent product config:** product name, tagline, official handles, support address, feature availability, and legal destinations

Environment variables must be validated at the process boundary. Missing optional Resend configuration should disable email cleanly while keeping database waitlist testing possible. Missing required database configuration should fail explicitly on the server, not fall back to production or pretend success.

Real secrets are never committed, logged, bundled, or returned to a client.

## 12. Analytics

Analytics uses vendor-neutral event contracts so a provider can be connected later. Phase 1A events may include:

- `landing_viewed`
- `hero_waitlist_clicked`
- `waitlist_started`
- `platform_selected`
- `waitlist_completed`
- `waitlist_failed`
- `feature_section_viewed`
- `companion_section_viewed`
- `final_cta_clicked`

Properties must be enumerated and bounded. Do not send email, first name, brain dumps, task text, reflections, or other sensitive free-form content to analytics.

## 13. Reliability and observability

Server operations should produce structured, privacy-safe logs with a request or correlation identifier. Log categories may include validation rejected, throttled, database unavailable, database accepted, email sync failed, and email accepted. Do not log raw secrets or complete sensitive payloads.

Provider calls need timeouts. Retriable background work should be idempotent. User-facing success must reflect the source-of-truth result, not an optional downstream provider result.

Future production observability should define ownership, alert thresholds, retention, and access before collecting detailed data.

## 14. Deployment and validation

- Vercel hosts web and admin with environment-specific variables.
- EAS is reserved for future mobile builds.
- Supabase remains a separately managed hosted service per environment.
- Basic CI must run installation, lint, typecheck, relevant tests, and production web and admin builds without production secrets.
- Preview deployments must use development or isolated preview configuration, never production service credentials.
- Release validation must identify the target Supabase project before migrations or end-to-end writes.

## 15. Architectural decision record

### Decisions in force

- one monorepo with platform-specific apps and shared contracts
- hosted Supabase only
- Supabase and Next.js server capabilities before a dedicated API server
- forward-only database migrations
- Supabase as waitlist source of truth and Resend as delivery and audience service
- server-side provider secrets
- provider-independent future AI gateway
- offline-aware future mobile contracts, without implementing sync in Phase 1A

### Deferred decisions

- final sync engine and conflict-resolution strategy
- job queue and scheduled workflow provider
- production observability vendor
- AI provider and model routing policy
- admin role model and support tooling
- storage buckets and retention policies
- realtime use cases
- regional data residency and launch-region requirements

These decisions should be made when a scoped phase provides evidence, not in anticipation alone.

