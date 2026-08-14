# Aiyomi Mobile Authentication

## 1. Trust boundary

Phase 3 consumer identity uses Supabase Auth with email and password, Google
OAuth, verification, password recovery, session refresh, and logout. The mobile
app uses only the hosted project's public URL and publishable key.

Consumer authentication never grants admin access. Admin authorization still
requires a separate active `admin_members` record and an exact permission at
the server and database boundary.

## 2. Session architecture

The Supabase client uses PKCE, persistent sessions, automatic refresh, and a
platform storage adapter. Native access and refresh tokens are stored through
Expo Secure Store. The web adapter exists for development rendering and is not
equivalent native security validation.

On app bootstrap:

1. Resolve local intro state and the current Auth session.
2. Refresh or reject an invalid session through Supabase.
3. Idempotently ensure the caller's profile and notification defaults.
4. Load the caller's RLS-protected profile.
5. Route from session and onboarding state.

Signing out clears the local session and private profile or Companion cache.
Raw tokens, provider responses, passwords, and authorization headers must never
enter logs, analytics, navigation parameters, or user-facing errors.

## 3. Email flows

Signup accepts a normalized email and a password that meets the configured
project policy. The UI validates confirmation and shows immediate pending
feedback. It does not claim success before Supabase returns.

When verification is required, signup routes to a check-email state. Resend
verification is explicit. The app treats an Auth account as verified only when
Supabase reports verified ownership.

Password recovery sends a fixed callback destination, consumes a trusted
recovery link, allows a new password, and returns to the app. Login and reset
copy stays generic enough to avoid exposing whether an account exists.

## 4. Deep links

The canonical mobile callback is:

```text
aiyomi://auth/callback
```

The parser accepts only that scheme and path, one PKCE code or an allowlisted
Supabase OTP type, and an explicit recovery marker where needed. Malformed or
untrusted links fail closed. Do not add a user-controlled post-auth redirect.

The owner must add every environment-specific callback to the corresponding
Supabase Auth redirect allowlist. Email templates and provider settings must
use the same environment, scheme, and build identifiers.

## 5. Google Sign-In

Google authentication opens the provider session from a Development Build and
returns through the Aiyomi callback. The application bundle contains no Google
client secret.

Owner configuration is required separately for Development and Staging:

1. Configure the Google provider in the intended hosted Supabase project.
2. Create the required Google OAuth client IDs for web, iOS, and Android.
3. Register the confirmed iOS bundle identifier and Android package/signing
   fingerprints.
4. Add the Supabase provider callback in Google Cloud.
5. Add `aiyomi://auth/callback` and any required development callback variants
   to the Supabase redirect allowlist.
6. Test account selection, cancellation, success, expired state, and logout in
   installed Development Builds on both supported platforms.

Do not claim Google Sign-In is validated until those credentials and native
flows have actually been tested.

## 6. Profile creation and waitlist conversion

An Auth-user trigger creates the base profile idempotently. The authenticated
`ensure_mobile_profile()` function repairs missing profile or notification
defaults and retries verified waitlist conversion.

Conversion reads the verified email from `auth.users`, normalizes it with the
waitlist policy, and associates at most one matching record. It never accepts
an email from the mobile client. Repeated verification or profile repair is
idempotent. An unsubscribed waitlist status remains unsubscribed while its real
conversion fields are recorded.

The existing waitlist foreign key currently cascades when an Auth user is
deleted. Account deletion is therefore deferred until the owner approves the
retention, conversion-history, and privacy behavior and a reviewed server-side
workflow implements it.

## 7. Hosted and native validation

Credential-free tests cover input validation, callback parsing, routing, and
error mapping. They do not prove provider configuration or RLS.

Hosted Development validation requires controlled users and must cover signup,
verification, wrong password, login, reset, refresh, expiry, logout, profile
creation, verified conversion, unverified non-conversion, cross-user denial,
and consumer denial from admin RPCs. Record the project and environment without
printing identities or secrets.

Native validation must use installed Development Builds for Google OAuth,
email callbacks, password recovery, secure session restoration, foreground and
background refresh, and external email-app return behavior.

