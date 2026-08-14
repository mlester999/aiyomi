# Aiyomi Onboarding

## 1. Purpose

Onboarding should feel like Aiyomi is learning enough to be useful, not like a
long productivity questionnaire. It must be warm, short, accessible,
progressive, resumable, and honest about what the product can do today.

Private life questions begin only after authentication. No answer is converted
into a task, routine, habit, goal, session, score, or diagnosis.

## 2. Pre-auth introduction

New signed-out users see four short screens:

1. Meet Aiyomi.
2. Plan around real life.
3. Focus and grow together.
4. Learn what works over time.

The story may be skipped. A lightweight optional intent can record one bounded
category such as getting organized or focusing better. Locally persisted state
contains only `has_seen_intro` and the optional category. It is not treated as
proof of identity or as a formal user goal.

Returning signed-out users go directly to the auth welcome screen while keeping
an explicit way to revisit the introduction.

## 3. Authenticated flow and resume

The database stores `not_started`, `in_progress`, or `completed` plus one
current persisted step. The client maps the twelve durable step identifiers
into eight short pages:

| Page | Information saved |
| --- | --- |
| Preferred name | chosen name, IANA timezone, locale |
| Companion | Mori, Lumi, or Piko selection |
| Companion details | chosen Companion name and Gentle, Balanced, or Coach |
| Life Areas | active catalog choices and optional custom names |
| Normal day | wake, sleep, timezone, and one or more typical life roles |
| Fixed commitments | optional weekly unavailable times |
| Personalization | improvement focus, optional obstacles, and optional energy baseline |
| Notifications | preferences, quiet hours, education, and optional permission request |

Values save progressively. Closing the app or losing a session must not restart
onboarding. On return, the root launch resolver uses the server-backed profile
step and resumes the corresponding page. Back navigation preserves saved
values.

## 4. Required and optional information

Completion requires:

- preferred name and timezone
- one active Companion and a valid chosen name
- one active or custom Life Area
- wake and sleep time with timezone
- one active life role
- the primary improvement focus
- notification preferences with a timezone

Fixed commitments, obstacles, energy baseline, pre-auth intent, and native
notification permission are optional. Declining notifications never blocks
completion.

Wake and sleep times are local wall-clock preferences. An end time earlier than
a start time is valid for an overnight schedule. Timezone is stored as an IANA
name, not only an offset.

## 5. Atomic completion

`complete_mobile_onboarding()` is the only completion transition. It derives
the user from `auth.uid()`, locks the caller's profile, checks the required
records, ensures notification timezone state, and then writes `completed` and a
trusted server timestamp. It is idempotent.

The client must not route to Today until that operation succeeds. A failed
required write leaves onboarding resumable and exposes a retry path.

## 6. First product state

After completion, a short preparation state may explain that preferences are
being organized. The personalized welcome then routes to Today.

Today starts empty and invites the person to build a first real day. Companion,
Progress, and Me may show Phase 3 foundations, but must not imply that future AI,
Focus, scoring, reward, or planning systems already exist.

## 7. Privacy, analytics, and accessibility

The improvement focus, custom obstacles, schedules, commitments, name, and
other onboarding answers are private product data. Analytics may record only
bounded events such as step completion, selected counts, and whether a custom
category was used. It must never receive email, names, free text, schedule
contents, or notification tokens.

Every page needs a visible progress indicator, Back and Continue behavior,
clear optional labels, immediate pending feedback, keyboard-safe scrolling,
screen-reader names, logical focus order, and error text associated with its
input. No page may use shame, urgency, or a fake reward to force completion.

