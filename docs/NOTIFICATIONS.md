# Aiyomi Notifications

## 1. Phase 3 scope

Phase 3 provides notification education, optional native permission, private
preferences, quiet hours, local Development testing, and multi-device Expo push
token registration. It does not send real planning, Focus, growth, or social
campaigns.

Notification orchestration based on real tasks and routines belongs to Phase 4.
Remote delivery infrastructure, production copy review, and social
notifications remain deferred.

## 2. Permission experience

Never show the operating-system prompt at first launch. First explain what
helpful reminders could do and make the secondary choice easy to find.

Only a direct user action requests native permission. `Maybe later`, denied,
previously denied, or unavailable states continue onboarding normally. The app
must not shame, repeatedly interrupt, or imply that permission is required.

Canonical stored permission states are `undetermined`, `granted`, `denied`, and
`unavailable`. Web rendering maps to unavailable and is not native permission
validation.

## 3. Preference model

Initial private preferences are grouped as follows:

| Category | Preference keys |
| --- | --- |
| Planning | morning plan, upcoming activity, schedule adjustments |
| Focus | focus reminder, break finished |
| Growth | daily reflection, weekly recap, streak reminder, achievements |
| Social | reserved, with no active Phase 3 preferences |

Quiet hours store a start, end, enabled state, and IANA timezone. Overnight
windows such as 22:00 to 07:00 are valid. Companion personality supplies the
initial nudge level, but Phase 3 does not implement aggressive or autonomous
nudging.

Preferences are product data, not evidence that a remote notification was
scheduled or delivered.

## 4. Device registration

Each installation receives a random local installation UUID. It is used only
to manage device registrations and is not an invasive fingerprint.

One user may have multiple device rows. A row records user, installation,
platform, optional Expo push token, enabled state, permission status, and last
seen time. Denied, undetermined, unavailable, emulator, or unconfigured EAS
installations may persist with a null token and `enabled = false`.

A token is requested only when permission is granted, the app is on a physical
device, and the EAS project ID is configured. Token refresh events update the
same user and installation pair. Android uses the `helpful-reminders` channel.

Push tokens are private operational data. RLS restricts users to their own rows,
and the broad admin UI has no token browser. Never send tokens, installation
IDs, or permission-linked identities to analytics.

## 5. Development test

Development Builds may expose a guarded action that schedules one local test
notification after five seconds. It is disabled outside Development and on
web. This proves only local scheduling and display on the tested device.

It does not prove Expo push delivery, APNs, FCM, background orchestration, or a
future server send path.

## 6. Owner actions

Before push-token or remote-delivery claims:

1. Connect the intended EAS project and set its public project ID.
2. Confirm final iOS and Android application identifiers.
3. Configure APNs credentials for the intended iOS build environment.
4. Configure the approved FCM project and Android credentials.
5. Build and install Development Builds on physical iOS and Android devices.
6. Validate fresh grant, denial, previously denied, settings re-enable, token
   refresh, duplicate registration, preference disable, quiet hours, and local
   test behavior.
7. Separately validate any future remote send path before claiming delivery.

Credentials belong in owner-controlled provider or EAS stores, never in the
repository or an `EXPO_PUBLIC_` variable.

## 7. Validation boundary

Unit tests may prove permission normalization and token-registration decisions.
Hosted Development tests may prove preference and device-row RLS. Only a
physical Development Build can prove native prompts and token acquisition.

Every final report must separate credential-free, hosted, native local, and
remote delivery results. Unknown or unavailable provider state is an owner
action, not a passing test.

