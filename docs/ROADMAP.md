# Aiyomi Roadmap

## 1. Roadmap rules

This roadmap sequences Aiyomi from product foundation to production launch. It is not permission to implement a future phase. Work begins only with explicit owner scope and ends with validation appropriate to that phase.

Every phase must preserve the Product Constitution:

- general audience
- user control over AI
- real-life progress drives virtual progress
- rest and recovery are legitimate
- private by default and social by choice
- no purchasable Growth Points or competitive advantage
- accessible, cozy, cartoonized, mobile-first experience
- no manipulative engagement
- no user-facing em dash characters

Roadmap labels describe intended order. Each phase should produce a bounded implementation plan, migrations, tests, security review, documentation updates, and an owner report before the next phase starts.

## Phase 0: Product + Monorepo Foundation

### Outcome

A durable product and engineering foundation with shared language, repository structure, validation, and environment rules.

### Scope

- product constitution, specification, daily journey, architecture, database, AI, design, security, and roadmap documentation
- pnpm, Turborepo, and TypeScript monorepo
- app boundaries for web, admin, and mobile
- focused shared packages for types, schemas, domain logic, database contracts, configuration, design tokens, analytics, and testing where justified
- root contributor and agent guidance
- baseline lint, typecheck, tests, builds, and CI
- hosted Supabase-only workflow with Development, Staging, and Production isolation
- safe environment examples without secrets

### Exit criteria

- repository commands are reproducible
- app and package boundaries are documented and structurally valid
- CI does not require Production secrets
- documentation records current scope and future boundaries
- no development validation points at Production

### Non-goals

Complete product features, billing, AI runtime, full admin, and full mobile screens.

## Phase 1: Brand + Landing Page + Waitlist

Phase 1A is the current implementation target together with Phase 0.

### Outcome

A polished public consumer landing page that communicates Aiyomi quickly and collects real launch interest safely.

### Scope

- centralized Aiyomi name, tagline, URLs, store destinations, social handles, and support metadata
- cozy, premium, responsive visual identity with original replaceable Companion concepts
- visual previews of Today, Brain Dump, Focus, Life Model insights, intent versus reality, Day Score, progress, rewards, room and garden, community, and privacy-safe sharing
- clear coming-soon status for iOS and Android without fake store links or social proof
- secure waitlist with email, optional first name, and iOS, Android, or Both platform interest
- bounded UTM and referral attribution
- honeypot, server validation, email normalization, duplicate prevention, throttling strategy, and safe responses
- hosted Supabase `waitlist_signups` migration and RLS decision
- Resend-ready service abstraction and accessible confirmation email
- vendor-neutral landing analytics without sensitive free-form content
- validation at 360, 390, 768, 1024, and 1440 pixel widths

### Exit criteria

- landing page renders as a premium consumer mobile-product site
- navigation, waitlist, loading, success, error, and duplicate flows work
- Supabase remains source of truth when optional email is unavailable
- responsive layouts have no accidental horizontal scroll
- performance, accessibility, SEO, and reduced motion receive explicit validation
- no secrets, fake availability, fake ratings, or user-facing em dash characters

### Non-goals

Complete mobile functionality, full AI, final Day Score, full virtual world, mini-games, subscriptions, leaderboards, or a large admin dashboard.

## Phase 2: Admin Foundation

### Outcome

An authenticated, authorized, auditable operational surface for the features that exist, beginning with the waitlist.

### Scope

- admin authentication and explicit role authorization
- dashboard shell, route protection, error states, and audit foundation
- waitlist overview for total leads, today, this week, platform, source, campaign, conversion, and referral performance
- authorized waitlist table for email, optional first name, platform, attribution, date, invited state, and conversion state
- safe filters and narrowly authorized exports if owner-approved
- invitation status workflow and Resend operational visibility
- referral-code issuance or inspection only if explicitly included
- settings and feature flag foundations needed for current operations

### Exit criteria

- navigation hiding is not used as authorization
- privileged reads and actions are server-authorized and audited
- RLS and service credentials are reviewed
- exports and personal-data access have clear permissions
- admin remains operational software, visually distinct from the consumer app

### Non-goals

Full user support tooling, AI provider control, subscriptions, Companion content management, competitive review, or analytics unrelated to implemented product surfaces.

## Phase 3: Mobile Foundation + Authentication + Onboarding

### Outcome

A real Expo mobile application with secure identity and a lightweight, accessible getting-to-know-you flow.

### Scope

- Expo Router navigation and platform-specific mobile design foundation
- Supabase Auth email and password, Google Sign-In, email verification, and password reset
- secure session storage, deep links, error recovery, and account basics
- 2 to 4 minute onboarding for first name, timezone, schedule preferences, Life Areas, priorities, desired improvement, distractions, and accountability mode
- no pre-created tasks, routines, habits, or sessions
- the question: "If this app could improve one thing about your life right now, what would it be?"
- permission and privacy explanations
- verified waitlist conversion matching to `converted_user_id` and `converted_at`, including trusted Google email matching
- initial cached app shell and offline-state conventions

### Exit criteria

- authentication and verification paths work on supported platforms
- conversion is idempotent and requires verified email ownership
- onboarding can be skipped where optional and completed accessibly
- timezone and privacy defaults are correct
- account and session security is validated

### Non-goals

Complete planning, AI recommendations, Life Model, Focus, Day Score, or social experience.

## Phase 4: Daily Life Engine

### Outcome

Users can model a realistic day with correct domain distinctions and preserve intent compared with actual outcomes.

### Scope

- Goals, Projects, Tasks, Routines, Habits, Sessions, and Life Areas as distinct concepts
- Today timeline and current, upcoming, priority, routine, progress, and quick-capture states
- Minimum, Target, and Stretch commitments
- recurrence and occurrence handling
- manual planning, rescheduling, partial outcomes, skips, cancellations, and corrections
- natural-language capture foundation without autonomous changes
- day contexts including Rest, Recovery, Sick, Vacation, and Light Day
- notifications and timezone behavior
- offline-aware cache, queued writes, stable identifiers, and conflict handling for scoped actions
- optional calendar architecture preparation without full integration unless separately scoped

### Exit criteria

- planned and actual data remain distinguishable
- users can make and revise a plan without AI
- offline and timezone tests cover important transitions
- private ownership and RLS are validated
- changed plans and partial progress do not become false failures

### Non-goals

Full AI planning, comprehensive Life Model, Focus analytics, Day Score, rewards, or community.

## Phase 5: AI Companion + Life Model

### Outcome

A personalized, honest, user-controlled Companion that organizes input and makes explainable recommendations from permissioned data.

### Scope

- provider-independent server-side AI gateway
- provider and model routing, prompt versioning, structured output, usage and cost records, timeouts, and safe fallback behavior
- original nameable Companion choices and Gentle, Balanced, and Coach behavior modes
- AI Brain Dump and natural-language Quick Capture drafts
- plan suggestions and dynamic rescheduling with user approval
- contextual "What should I do now?" recommendations
- explicit separation of user facts, observed events, derived features, hypotheses, and Companion memories
- early Life Model signals for realistic capacity, focus windows, postponement, routine outcomes, and intent-versus-reality patterns
- memory view, deletion, category controls, and reset behavior
- safety evaluation and boundaries for professional advice, crisis content, consciousness claims, and dependency

### Exit criteria

- no provider secret reaches a client
- model output is schema-validated and cannot silently change plans
- recommendations show useful reasons and uncertainty
- memory controls and deletion propagation work
- safety, privacy, latency, cost, and quality evaluations meet owner-approved thresholds

### Non-goals

Full voice conversation, autonomous life management, clinical inference, rewards economy, or social AI memory.

## Phase 6: Focus System

### Outcome

Users can focus with their Companion and record credible planned and actual focus effort.

### Scope

- 25/5, 50/10, 90-minute Deep Work, and custom focus and break durations
- attachment to a Task, Routine, Project, or Goal
- pause, resume, break, interruption, abandonment, and completion states
- optional Distracted, Okay, Focused, and Deep Focus rating
- focus history and initial analytics
- Companion focus states and restrained animation
- independently controlled focus sound, background music, sound effects, and haptics where scoped
- reliable local timer and offline reconciliation
- trusted server event provenance for reward-eligible activity
- use of focus patterns in user-approved recommendations and the Life Model

### Exit criteria

- timers survive app backgrounding, clock changes, and expected connectivity loss
- actual focus is not inferred from completion alone
- audio and haptics are optional and accessible state is not sound-dependent
- farming controls and event idempotency are validated before rewards use focus data

### Non-goals

Global competition, complete Day Score, endless focus rewards, or full shared Focus rooms.

## Phase 7: Reflection + Day Score

### Outcome

Users can close a day compassionately, compare intent with reality, and understand an explainable contextual Day Score.

### Scope

- optional end-of-day reflection and data correction
- planned versus actual timing, duration, outcomes, partial work, and context
- versioned Day Score across appropriate dimensions such as Execution, Focus, Consistency, Priorities, Balance, Growth, and Planning Realism
- explicit treatment of Minimum, Target, Stretch and Rest, Recovery, Sick, Vacation, and Light Days
- plain-language factor explanations and score history
- weekly recap and pattern insights with evidence windows
- user feedback, correction, recalculation, and evaluation
- privacy protection for reflections and derived patterns

### Exit criteria

- score is reproducible from versioned deterministic inputs
- score is not raw completion rate and does not reward overload
- valid rest is not treated as failure
- explanations avoid moral and medical language
- Day Score is not directly used for global rank

### Non-goals

A clinical wellbeing score, a universal judgment of a person's worth, or a purchasable competitive metric.

## Phase 8: Gamification + Companion World

### Outcome

Meaningful real-life progress produces a satisfying, bounded virtual progression loop.

### Scope

- XP, Levels, Streaks, Streak Shields, daily and weekly Quests, Achievements, and rewards
- one primary spendable virtual currency at launch with reviewed economy rules
- Companion progression and cosmetics
- cozy room and garden progression with furniture, plants, decorations, outfits, themes, collectibles, and focus items
- Life Area-inspired visual unlocks where appropriate
- seasonal event foundation
- short optional earned or attempt-limited mini-games only if explicitly included near the end of the phase
- server-authoritative reward ledger, idempotency, caps, diminishing returns, and abuse flags
- compassionate streak and recovery behavior

### Exit criteria

- rewards reflect meaningful behavior rather than task spam or app time
- economy is auditable and cannot create or duplicate value from clients
- no loot-box, gambling, pay-to-win, or manipulative dependency pattern
- Growth Points and rank remain unpurchasable
- world art and progression remain accessible and performant

### Non-goals

Global leaderboards, purchasable competition, endless mini-games, or rewards that punish legitimate rest.

## Phase 9: Friends + Social + Leaderboards

### Outcome

Users who opt in can encourage one another and participate in privacy-safe, abuse-resistant social experiences.

### Scope

- usernames, friend requests, friends list, blocking, reporting, and privacy-safe profiles
- friend challenges, encouragement, Focus Together, and shared Focus rooms
- privacy-safe sharing cards using the native mobile share sheet
- optional friend and global leaderboards across weekly, monthly, seasonal, or league windows
- dedicated normalized Growth Points instead of lifetime XP or Day Score
- server-authoritative events, caps, diminishing returns, Trust Score, account-age and proportionate risk signals
- suspicious-activity review, moderation, appeals, and manual review for significant prizes
- privacy previews and explicit sharing confirmation

### Exit criteria

- all social features are optional
- private tasks, schedules, moods, reflections, goals, memories, and Life Model signals remain hidden by default
- blocking and reporting work before public discovery
- competitive abuse scenarios are tested
- money cannot buy Growth Points, rank, or competitive advantage
- top users are reviewable before meaningful rewards

### Non-goals

A feed that requires exposing daily life, competition as the primary product purpose, or pay-to-win systems.

## Phase 10: SaaS + Advanced Integrations

### Outcome

Sustainable plans and optional integrations expand utility without weakening privacy or competition fairness.

### Scope

- Free, Plus, and Pro plans with owner-approved limits
- subscriptions, entitlements, invoicing or receipt handling, cancellation, restoration, and webhook verification
- paid capabilities such as additional AI usage, deeper Life Model, advanced insights and scheduling, customization, cosmetics, and focus analytics
- Google Calendar, Apple Calendar, and Outlook Calendar where platform support permits
- Apple Health and Android Health Connect for optional permissioned steps, exercise, or sleep data
- voice input through speech-to-text before full conversational voice
- integration token protection, minimal scopes, revocation, synchronization, and deletion
- AI provider cost, quota, and plan controls in authorized admin

### Exit criteria

- entitlements are server-authoritative and resilient to replay
- cancellation and restoration are clear
- integrations are optional and least-privilege
- provider and health data retention is documented
- paid plans never sell Growth Points, rank, or competitive advantage

### Non-goals

Monetizing private data, forced integrations, or full voice conversation without a separate safety and privacy scope.

## Phase 11: Production Launch + Growth

### Outcome

Aiyomi is operationally, legally, technically, and experientially ready for a measured public launch and responsible growth.

### Scope

- production readiness review across web, admin, mobile, Supabase, email, AI, billing, and integrations in actual launch scope
- App Store and Google Play listings with real URLs, approved screenshots, privacy disclosures, and release builds
- accessibility, performance, reliability, security, backup recovery, moderation, and incident exercises
- production monitoring, alerts, support, audit, data retention, deletion, and disaster recovery
- legal review for privacy, terms, consent, marketing, competition, and launch regions
- waitlist invitation and conversion campaign
- bounded referral launch for early supporters, with reviewed Founder badge, cosmetic, Companion item, or achievement rewards
- truthful SEO, lifecycle email, analytics, experiments, and launch communication
- capacity, AI cost, database, email, and abuse monitoring

### Exit criteria

- real store listings replace coming-soon placeholders
- Production configuration and migrations are independently verified
- support, incident, moderation, and deletion workflows have owners
- launch claims use real evidence and no invented users, ratings, awards, reviews, or downloads
- waitlist conversion and referral attribution are observable and privacy-safe
- rollback and recovery paths are exercised

### Non-goals

Unbounded growth at the expense of reliability, privacy, accessibility, safety, or wellbeing.

## 2. Cross-phase dependencies

| Capability | Must exist first |
| --- | --- |
| Waitlist admin | Phase 1 source-of-truth data and Phase 2 authorization |
| Waitlist conversion | Phase 1 normalized records and Phase 3 verified identity |
| AI scheduling | Phase 4 domain records and Phase 5 gateway and consent |
| Life Model focus patterns | Phase 5 model boundaries and Phase 6 credible sessions |
| Day Score | Phase 4 intent and outcomes, Phase 6 focus, Phase 7 versioned algorithm |
| Virtual rewards | Phase 4 meaningful events and Phase 8 authoritative ledger |
| Leaderboards | Phase 8 credible reward signals and Phase 9 anti-abuse and privacy |
| Paid AI limits | Phase 5 usage accounting and Phase 10 entitlements |
| Referral rewards | Phase 1 attribution, Phase 2 operations, Phase 8 reward integrity, and explicit launch scope |

## 3. Phase completion standard

A phase is complete only when:

- its bounded user outcomes are implemented
- relevant lint, typecheck, tests, and builds pass
- data migrations are validated against dedicated hosted non-production Supabase
- accessibility, privacy, security, failure, and responsive behavior are tested in proportion to risk
- provider and owner actions are documented honestly
- deferred items and known limitations are explicit
- no failing check is silently ignored
- the next phase has not been implemented without scope

## 4. Current boundary

The authorized work is **Phase 0 plus Phase 1A**. Admin and mobile receive foundations only. Phase 2 through Phase 11 are documentation and planning context until the owner explicitly scopes them.

