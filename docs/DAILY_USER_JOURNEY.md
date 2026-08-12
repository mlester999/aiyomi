# Aiyomi Daily User Journey

## Purpose

This document describes the intended future daily experience and its product boundaries. It guides the mobile roadmap, AI behavior, data design, notifications, and landing page previews. Except for public previews, this journey is not implemented in Phase 1A.

## Journey principles

- The user remains in control at every stage.
- Every step is optional unless essential to fulfill an explicit request.
- Aiyomi asks for the least input needed to be useful.
- A changed plan is information, not failure.
- Rest, recovery, illness, vacation, and light days are valid day shapes.
- Recommendations should produce one understandable next step, not a wall of advice.
- Aiyomi should reduce cognitive load and app time, not create busywork.
- Private content stays private unless the user intentionally shares an eligible summary.

## Daily flow at a glance

`ARRIVE -> CHECK IN -> UNDERSTAND -> PLAN -> APPROVE -> DO -> FOCUS -> ADAPT -> CLOSE -> REFLECT -> LEARN -> REWARD -> PREPARE`

The user may enter or leave this loop at any point. Missing a morning check-in must not block the rest of the day. Closing the day must not be required to preserve progress.

## Before the day

### Inputs available to Aiyomi

With permission, Aiyomi may have access to:

- user-created goals, projects, tasks, routines, and habits
- fixed commitments and user-approved calendar information
- unfinished or rescheduled intentions
- recent focus sessions and reflections
- explicit availability, timezone, preferred hours, mood, or energy
- relevant Life Model patterns when that system is implemented and enabled

Aiyomi must separate user-provided facts, imported events, recorded outcomes, and inferred patterns. Missing information should lower confidence rather than invite invention.

### Quiet preparation

The system may prepare a draft, but it must not silently rewrite commitments or publish calendar changes. A draft should preserve the source of each item and identify conflicts or uncertainty.

## Morning: understand and plan

### 1. Welcome

The Companion offers a brief greeting suitable to the selected Gentle, Balanced, or Coach mode. The greeting should be warm without pretending to be a person or demanding engagement.

### 2. Optional check-in

The user may share mood, energy, available capacity, or a day context such as:

- Regular Day
- Light Day
- Rest Day
- Recovery Day
- Sick Day
- Vacation

Skipping the check-in preserves a usable experience. Mood and energy are private data, not social or competitive data.

### 3. Review commitments

The Today view brings together fixed commitments, priorities, routines, due tasks, and anything the user deliberately carried forward. It should distinguish fixed time, flexible time, and unscheduled work.

### 4. Reality check

Aiyomi may identify:

- more intended work than available time
- overlapping commitments
- an activity placed in a repeatedly difficult time window
- insufficient breaks or recovery
- an important priority with no realistic space
- a target that may be better expressed as Minimum, Target, and Stretch

Recommendations must be framed as options with reasons. A typical suggestion could be: "You have 40 flexible minutes before lunch. The 20-minute minimum workout may fit better today."

### 5. Approve the plan

The user accepts, edits, rejects, or postpones each meaningful adjustment. Approval must show what changes, including time, duration, priority, and affected commitments. The approved plan becomes today's intent baseline, with revisions retained as part of the timeline rather than overwritten history.

### Morning success state

The user knows what matters, what is realistic, and what can change. Success is clarity, not the number of items scheduled.

## During the day: do and focus

### Today as the home surface

The future Today experience should make these actions easy:

- see the current and next commitment
- start a task, routine occurrence, or Focus Session
- mark an outcome or partial progress
- capture a thought without a long form
- ask "What should I do now?"
- update energy or availability
- reschedule with context
- see a calm progress summary

### Quick Capture

The global add action may offer Tell Aiyomi, Quick Task, Brain Dump, Routine, Goal, and Event. Natural language is favored. For example, "Dentist Thursday at 2" can become a structured draft.

Before saving an AI-parsed draft, the interface should surface consequential details such as date, time, recurrence, reminder, and destination. If parsing confidence is low, ask one focused question or save the original text as an unstructured note.

### AI Brain Dump

The user can enter messy thoughts such as:

> study biology, buy groceries, call mom, gym, finish assignment

Aiyomi may propose:

- **Must Do:** Study Biology, Finish Assignment
- **Should Do:** Gym
- **Flexible:** Groceries, Call Mom

Suggested times are drafts. The user can change categories, split items, remove items, or approve the plan. The original text should remain available until the transformation is confirmed.

### What should I do now?

When asked, Aiyomi recommends one clear next action. Future inputs may include current time, available duration, deadlines, priority, schedule, energy, focus history, recent activity, missed intentions, and linked goals.

A useful answer contains:

1. the recommendation
2. a compact reason
3. an achievable version, often the Minimum
4. a start action
5. an easy way to choose something else

The system must not suggest an activity that conflicts with a fixed event or known safety constraint. It must communicate when its context is incomplete.

### Focus together

The user selects a preset such as 25/5, 50/10, or 90-minute Deep Work, or chooses custom focus and break durations. A Focus Session may link to a task, routine, project, or goal.

The Companion can appear to focus alongside the user. Future ambient audio, sound effects, and haptics remain separately controllable and are never forced.

The session records state transitions such as started, paused, resumed, break started, interrupted, abandoned, and completed. Server time should protect future competitive events, while the mobile experience remains resilient to temporary loss of connectivity.

After a session, the user may optionally rate it as Distracted, Okay, Focused, or Deep Focus. A skipped rating must not reduce rewards or score.

## When plans change: adapt

Life interruptions are expected. Aiyomi should make replanning fast and compassionate.

### Common triggers

- an activity takes longer or less time than expected
- a fixed event moves
- energy drops
- a task becomes blocked
- an urgent responsibility appears
- the user chooses rest or recovery
- a Focus Session is interrupted

### Adaptation pattern

1. Acknowledge the change without judgment.
2. Preserve what actually happened.
3. Recalculate only the affected portion of the plan.
4. Offer a small set of clear options, such as reschedule, choose Minimum, replace, delegate, or release.
5. Explain conflicts and tradeoffs.
6. Apply only the user's approved change.

Repeated postponement may become a private pattern for future reflection, but one postponement is not evidence of avoidance. Coach mode may be more direct, but it remains respectful and optional.

## Evening: close and reflect

### 1. Reconstruct intent versus reality

The close-day view compares the latest approved intent with recorded outcomes. It may show:

| Activity | Planned | Actual | Context |
| --- | ---: | ---: | --- |
| Study | 60 min | 47 min | interrupted once |
| Exercise | 45 min | 20 min | Minimum met |
| Read | 30 min | 30 min | completed |

The system should make corrections easy. Passive timer data, imported calendar events, and user confirmation are different evidence sources.

### 2. Reflect

Reflection is short and optional. Prompts should respond to the day instead of asking every question every night. Examples include:

- What felt meaningful today?
- What made the plan easier or harder?
- Is there anything you want Aiyomi to remember?
- What should tomorrow protect?

Free-form reflections are sensitive. They must not enter analytics, public profiles, leaderboards, or sharing cards.

### 3. Explain Day Score

When Day Score is implemented, it summarizes the day in context. It may consider Execution, Focus, Consistency, Priorities, Balance, Growth, and Planning Realism. It must not be completed tasks divided by total tasks.

The score should:

- compare the user mainly with their own approved intent and patterns
- recognize a meaningful Minimum outcome
- understand explicit rest and recovery context
- avoid rewarding overload or raw app activity
- show contributing factors in plain language
- allow the user to correct inaccurate source data
- never become a direct global ranking measure

The landing page's example score is a concept preview, not a final algorithm.

### 4. Reward meaningful progress

Future XP, quests, achievements, cosmetics, and room or garden growth may respond to verified meaningful behavior. No reward should encourage fake tasks, timer farming, guilt, or endless app use. Rest and recovery can support appropriate forms of continuity without pretending they are productive tasks.

### 5. Prepare tomorrow

Aiyomi may suggest one or two tomorrow adjustments, such as a different time for a frequently postponed activity or a more realistic Target. These remain suggestions until approved.

## Weekly learning loop

A weekly recap may show useful trends such as focused time, Strong Days, routine consistency, and progress, followed by a small number of observations. For example, mornings may have been more consistent than evenings.

Insights must distinguish observation from interpretation. A pattern should require sufficient evidence, include its relevant time window, and avoid medical or psychological diagnosis. The user must be able to dismiss an insight and eventually control whether its underlying memory persists.

## Notifications and proactive support

Notifications should be permission-based, configurable, and sensitive to Companion mode. The system should prefer fewer high-value prompts over frequent nudges.

Never use:

- guilt about an unfinished task or broken streak
- fake urgency
- claims that the Companion is lonely, harmed, or emotionally dependent
- notification copy that exposes sensitive activity on a lock screen without consent
- pressure to return solely to preserve virtual progress

Quiet hours, timezone changes, and day context must be respected. Notification behavior should degrade safely when the Life Model has limited evidence.

## Offline and failure states

The future mobile architecture should keep the cached Today plan, local timer, task marks, quick notes, and selected media useful when practical. AI features should clearly indicate that connectivity is needed.

Offline actions should be queued with stable identifiers and reconciled without silently duplicating outcomes. Conflicts that alter the user's intent or recorded reality require a visible resolution path. The app should never manufacture an AI answer when the service is unavailable.

## Social boundaries in the daily journey

The daily loop is private. Social participation is an optional layer after the personal experience.

Eligible share cards should use a preview and explicit confirmation. They may contain selected summaries such as a focus milestone, achievement, streak, weekly recap, or Companion progress. They must exclude private task descriptions, schedule details, mood, reflection text, private goals, Companion memories, and sensitive Life Model signals by default.

## Journey quality checks

A future daily experience is ready for release only when it demonstrates:

- completion without a morning or evening ritual
- clear distinction between planned and actual data
- user approval for AI plan changes
- functional Minimum, Target, Stretch behavior
- compassionate handling of interrupted, light, recovery, and rest days
- accessible touch targets, labels, focus states, contrast, and reduced motion
- safe private defaults and deliberate sharing
- timezone and offline-aware behavior
- no false claims of certainty, consciousness, or professional advice
- no user-facing em dash characters

