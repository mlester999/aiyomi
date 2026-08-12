# Aiyomi

Your AI companion for better days.

This repository contains the Phase 0 product and monorepo foundation plus the Phase 1A public landing page and waitlist.

## Workspace

- `apps/web`: public Next.js landing page and secure waitlist endpoint
- `apps/admin`: bounded Next.js admin shell foundation
- `apps/mobile`: Expo Router and React Native foundation
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

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, and `docs/ROADMAP.md` before extending the product.
