# Aiyomi

Your AI companion for better days.

This repository contains the accepted public and admin foundations plus the
active Phase 3 Aiyomi consumer mobile foundation.

## Workspace

- `apps/web`: public Next.js landing page and secure waitlist endpoint
- `apps/admin`: secure Next.js operations portal for the waitlist, analytics, referrals, audit history, memberships, flags, and approved settings
- `apps/mobile`: Phase 3 Expo Router app for first run, consumer auth, onboarding, notifications, and the empty app shell
- `packages`: shared types, schemas, domain logic, database contracts, configuration, design tokens, analytics, and testing helpers
- `supabase`: hosted Supabase configuration and forward-only migrations
- `docs`: durable product and technical documentation

## Local development

Use Node.js 22 or newer and pnpm 11 or newer.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

The landing page remains viewable without hosted credentials. Waitlist writes require a dedicated non-production hosted Supabase project.

For mobile setup and validation boundaries, see `docs/MOBILE.md`. Native Auth
and notification behavior requires an installed Development Build and
owner-configured non-production providers.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @aiyomi/mobile validate:config
pnpm --filter @aiyomi/mobile validate:export
```

See `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md` before extending the product.
