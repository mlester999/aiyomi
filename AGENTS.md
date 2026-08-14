# Aiyomi agent guide

Aiyomi is a mobile-first AI Life Companion for a general audience.

- Read the relevant files in `docs/` before major product or architecture changes.
- Keep the experience cozy, cartoonized, calm, accessible, and premium.
- Never use em dashes in user-facing copy.
- Real-life progress drives virtual progress. Rest and recovery are legitimate.
- Keep private life private by default. Social features are opt-in.
- Never create pay-to-win competition or purchasable Growth Points.
- Use hosted Supabase only. Do not require Docker or local Supabase containers.
- Never use a production project for development or validation.
- Before any remote Supabase mutation, prove the linked target is Development or Staging. Stop if the environment cannot be confirmed.
- Keep Supabase service credentials, Resend keys, and future AI provider keys server-side.
- Admin access requires an authenticated user plus an explicit active admin membership. Never add public admin signup or automatic first-admin behavior.
- Authorize every protected admin read, mutation, and export on the server and at the database boundary. Client-side hiding is only UX.
- Audit privileged admin mutations and exports without recording secrets, tokens, passwords, or full exported data.
- Keep platform-specific UI inside its app. Share contracts, schemas, domain logic, and tokens.
- Treat `apps/mobile` as the primary consumer product. Never seed fake user tasks, progress, scores, streaks, or achievements.
- Keep onboarding resumable from persisted server state. Do not route to Today before controlled completion succeeds.
- Keep AI suggestions under user control. Phase 3 does not authorize the Daily Life Engine or full AI Companion behavior.
- Keep notifications optional and contextual. Never request native notification permission immediately at first launch.
- Keep consumer authentication separate from admin authorization. A consumer session never grants admin membership or permissions.
- Put only public client configuration in the mobile bundle. Never include service, email, provider, database, or OAuth secrets.
- Validate OAuth, deep links, secure sessions, and notifications in a Development Build where native behavior matters. Expo Go and web rendering are not substitutes.
- Validate changes before reporting completion. Never silently ignore a failing check.
- Do not implement future roadmap phases without explicit scope.
