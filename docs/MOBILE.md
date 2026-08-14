# Aiyomi Mobile

## 1. Phase 3 boundary

`apps/mobile` is the primary consumer product. Phase 3 establishes the real
first-run experience, consumer authentication, resumable personalization,
notification foundations, and an empty first Today screen.

Phase 3 does not create tasks, routines, goals, projects, AI planning, Focus,
Day Score, rewards, social features, billing, or a virtual economy. New users
must never receive fake tasks, progress, scores, streaks, or achievements.

Repository implementation is not the same as Phase 3 acceptance. Hosted
Development validation, configured native authentication, notification
credentials, and representative device QA remain separate release gates.

## 2. Application architecture

The mobile app uses React Native, Expo SDK 56, TypeScript, and Expo Router.
Platform UI stays inside `apps/mobile`. Shared packages contain only portable
types, schemas, domain rules, analytics contracts, and primitive tokens.

The root provider resolves one launch state:

```text
BOOTSTRAPPING
SIGNED_OUT_NEW
SIGNED_OUT_RETURNING
AUTHENTICATED_ONBOARDING_INCOMPLETE
AUTHENTICATED_ONBOARDING_COMPLETE
```

Those states route respectively to the bootstrap screen, pre-auth story, auth
welcome, resumable onboarding, or Today. Screens do not independently invent
session routing decisions.

Route groups separate the concerns:

- `intro`: four short pre-auth product explanations
- `auth`: signup, login, verification, recovery, update, and callback states
- `onboarding`: progressive personalization and completion transitions
- `(tabs)`: Today, Companion, Progress, and Me foundations
- `settings`: Phase 3 profile, companion, notification, privacy, and account views

Essential Companion and onboarding art is stored under `apps/mobile/assets`.
Do not fetch required launch art from remote URLs.

## 3. Local and secure state

Native Supabase sessions use an Expo Secure Store adapter, PKCE, refresh-token
rotation, and foreground-aware automatic refresh. Local non-secret storage may
hold the intro flag, optional pre-auth intent, installation UUID, and limited
profile or Companion cache.

The web build uses AsyncStorage and exists for deterministic rendering and
visual validation. It is not evidence that native secure storage, OAuth, deep
links, or notifications work.

Offline behavior in Phase 3 is deliberately narrow. A cached profile can keep
the shell recognizable, and the app reports an offline state. Offline writes,
conflict resolution, and a cached Daily Life Engine belong to Phase 4.

## 4. Public configuration

Copy `apps/mobile/.env.example` to a local ignored environment file and supply
only public client values:

- `EXPO_PUBLIC_AIYOMI_ENVIRONMENT`
- `EXPO_PUBLIC_SUPABASE_PROJECT_REF`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- public site, privacy, terms, support, and future store URLs
- `EXPO_PUBLIC_EAS_PROJECT_ID` after owner EAS setup

The mobile bundle must never contain a service-role or secret Supabase key,
database password, Resend key, Google client secret, APNs credential, FCM
service credential, or future AI provider secret.

Development is locked to the confirmed `aiyomi-dev` project reference, and
Production is locked to the confirmed Aiyomi Production project reference. The
configured URL and explicit project reference must agree. Staging and
Production require separate owner-confirmed project references, OAuth settings,
credentials, and build channels. A local label alone never proves the remote
environment.

Before any hosted mutation, verify both the linked project identity and the
hosted environment record. Stop if Development or Staging cannot be proven.

## 5. Development Build and EAS

`apps/mobile/eas.json` defines development, preview, and production profiles.
The development profile creates an internal Development Build. Preview targets
Staging. A production profile is configuration only and is not permission to
publish or target Production.

Owner setup is required before native builds:

1. Confirm final iOS bundle and Android package identifiers.
2. Run `eas login` with the owner-controlled Expo account.
3. Connect the intended EAS project and record its project ID.
4. Configure environment-specific public variables in EAS.
5. Create and install Development Builds on representative devices.
6. Configure Google OAuth, APNs, and FCM as documented in `AUTH.md` and
   `NOTIFICATIONS.md`.

Expo Go may be used only for compatible UI checks. It is not the Phase 3 native
validation target.

## 6. Credential-free validation

Ordinary CI and local deterministic validation require no hosted credentials:

```bash
pnpm --filter @aiyomi/mobile typecheck
pnpm --filter @aiyomi/mobile test
pnpm --filter @aiyomi/mobile validate:config
pnpm --filter @aiyomi/mobile validate:export
```

The web export catches route, module, and asset bundling failures. It does not
compile a native binary or validate provider behavior.

Native validation must report the exact device, OS, build profile, environment,
and scenarios tested. Screenshots rendered from Expo Web must be labeled as web
renderings and cannot replace native keyboard, safe-area, permission, or tablet
QA.

## 7. Experience and performance rules

- Keep bootstrap work minimal and show immediate loading feedback.
- Never block first render on non-critical analytics.
- Load only the assets needed for the current screen.
- Preserve safe areas, keyboard access, Dynamic Type, screen-reader labels,
  reduced motion, and at least 44 by 44 point touch targets.
- Keep haptics optional and never make sound or vibration the only state cue.
- Show a subtle environment indicator in Development, never technical details
  in Production.
- Stop after Phase 3 acceptance. Phase 4 requires a new explicit scope.
