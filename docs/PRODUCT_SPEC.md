# Aiyomi Product Specification

## 1. Product definition

Aiyomi means **AI + You + Me**. It is a mobile-first AI Life Companion for everyday people across different lifestyles, careers, responsibilities, routines, goals, and stages of life.

Positioning:

> Aiyomi  
> Your AI companion for better days.

Supporting phrase:

> Plan. Focus. Grow. Together.

Aiyomi helps a person understand what matters today, plan realistically, act with focus, adapt when life changes, reflect without guilt, learn useful patterns, and grow alongside a personalized visual companion.

The long-term product loop is:

`UNDERSTAND -> PLAN -> DO -> FOCUS -> ADAPT -> REFLECT -> LEARN -> GROW -> REWARD -> BETTER TOMORROW`

The defining principle is: **Real-life progress drives virtual progress.**

## 2. Audience and jobs to be done

Aiyomi is for a general audience. It must not assume the user is a developer, freelancer, student, business owner, employee, or focused exclusively on productivity.

Core jobs include:

- make sense of today's commitments and priorities
- turn unstructured thoughts into a realistic plan
- manage goals, projects, tasks, routines, and habits without conflating them
- focus for an appropriate amount of time and record what actually happened
- adjust a plan when time, energy, or circumstances change
- understand intent compared with reality
- reflect on whether a day was meaningful in context
- learn personal patterns without making medical claims
- make sustainable progress with a supportive companion

Life Areas are user-defined contexts, not career personas. Suggested defaults include Work, Learning, School, Business, Health, Fitness, Family, Relationships, Finance, Creative, Personal, Household, Wellbeing, and Custom.

## 3. What Aiyomi is not

Aiyomi is not defined by any single component. It is not merely a to-do list, habit tracker, timer, calendar, chatbot, journal, virtual pet, RPG productivity app, ADHD-only tool, or work-only tool. Each may contribute to the full experience, but the differentiator is a system that gradually learns what actually works for a person and uses that understanding to help them.

It is also not a medical, therapeutic, legal, or financial service. The Companion must not claim consciousness or create emotional dependency.

## 4. Product stage and scope

### Current implementation scope: Phase 3

The current bounded outcome is:

- a production-quality pnpm, Turborepo, and TypeScript monorepo foundation
- the cozy, responsive public Aiyomi landing page
- a secure hosted Supabase-backed waitlist
- a Resend-ready confirmation email integration
- an accepted authenticated and authorized Phase 2 admin foundation
- the Phase 3 Expo consumer foundation with first-run routing, authentication,
  resumable personalization, optional notifications, and an empty Today shell
- shared contracts, schemas, domain logic, configuration, tokens, analytics definitions, and testing helpers where justified
- durable documentation for future phases

The landing page may preview future product concepts, but previews are not claims that those features are available.

### Explicitly out of scope now

Do not implement the Phase 4 Daily Life Engine, AI Companion backend, Life
Model, Focus engine, Day Score algorithm, virtual world, mini-games, billing,
subscriptions, social graph, leaderboards, or competitive rewards in Phase 3.

## 5. Durable domain model

The following concepts must remain distinct in product language, data contracts, AI prompts, and analytics:

| Concept | Definition | Typical end condition |
| --- | --- | --- |
| Goal | A long-term desired outcome that gives direction | achieved, changed, paused, or retired |
| Project | A finite, multi-step body of work that contributes to an outcome | completed, canceled, or archived |
| Task | A one-time actionable unit | completed, skipped, canceled, or rescheduled |
| Routine | A recurring activity with a schedule or recurrence rule | occurrence completed or routine paused/ended |
| Habit | A repeated behavior that may not need a strict schedule | tracked over time, paused, or retired |
| Session | An actual occurrence at a specific date or time | completed, interrupted, abandoned, or corrected |
| Focus Session | Measured focus effort attached to a meaningful task, routine, project, or goal | completed, interrupted, abandoned, or corrected |

A scheduled intention is not the same as an actual session. A task completion is not proof of focused time. A recurring routine is not a habit merely because it repeats. These distinctions are required for honest intent-versus-reality analysis.

## 6. Commitment sizing: Minimum, Target, Stretch

Future commitments may define three meaningful success levels:

- **Minimum:** the smallest worthwhile version that preserves continuity on a constrained day
- **Target:** the realistic intended version under normal conditions
- **Stretch:** an optional larger version when capacity permits

Example for exercise:

| Level | Commitment |
| --- | --- |
| Minimum | 10 minutes |
| Target | 30 minutes |
| Stretch | 60 minutes |

Minimum is not a consolation prize. The Companion may recommend it when the target is unrealistic. Stretch must never become an expectation or silently inflate a plan. This model supports consistency without all-or-nothing behavior.

## 7. Core future capabilities

### Planning and capture

- a Today view with commitments, priorities, routines, current activity, upcoming activity, focus entry, and quick capture
- natural-language Quick Capture for Tell Aiyomi, Quick Task, Brain Dump, Routine, Goal, and Event
- AI Brain Dump organization into useful priority groups such as Must Do, Should Do, and Flexible
- suggested time blocks that respect current commitments and realistic capacity
- contextual **What should I do now?** recommendations based on time, available duration, priorities, deadlines, energy, recent activity, and user-approved data
- dynamic rescheduling with an explanation and user approval

### Focus

- common patterns such as 25/5, 50/10, and 90-minute Deep Work
- custom focus and break durations
- attachment to a task, routine, project, or goal
- planned and actual focused time
- pauses, breaks, interruptions, abandoned sessions, and completed sessions
- an optional self-rating: Distracted, Okay, Focused, or Deep Focus
- history and analytics that can improve reflections, recommendations, Day Score, and the Life Model

### Reflection and learning

- compassionate day closing and optional reflection
- planned versus actual comparisons
- patterns across time, day, activity, capacity, and follow-through
- useful weekly insights that favor explanation over raw metrics
- explicit support for Rest Day, Recovery Day, Sick Day, Vacation, and Light Day contexts

### Companion

Users will eventually choose from multiple original mascot directions, name and customize a companion, select a support style, unlock cosmetics, and grow a cozy room and garden through real-life consistency.

Conceptual behavior modes are:

- **Gentle:** calm, encouraging, fewer proactive nudges, softer accountability
- **Balanced:** supportive, moderate proactive assistance, normal accountability
- **Coach:** direct, more proactive, notices repeated avoidance, encourages follow-through

Modes must affect behavior and notification strategy, not only wording. They may never override safety, consent, or the user's control.

### Rewards and world

Future systems may include XP, levels, streaks, Streak Shields, daily and weekly quests, achievements, cosmetics, one primary spendable currency at launch, a cozy room and garden, seasonal events, and short optional mini-games. Rewards must reflect meaningful real-life behavior. Mini-games must not become endless distractions.

Potential world changes can reflect Life Areas, such as books for Learning, plants for Wellbeing, or creative items for Creative. Concept art is illustrative until production assets are approved.

### Social and sharing

Future opt-in features may include usernames, friends, privacy-safe profiles, challenges, shared focus, encouragement, and optional leaderboards. Privacy-safe sharing cards may celebrate Day Score, streaks, focus milestones, weekly recaps, achievements, level-ups, Companion progress, world progress, or reviewed competitive placements.

Private task names, detailed schedules, moods, reflections, private goals, Companion memories, and sensitive Life Model signals must not be shared by default.

## 8. Intent versus reality

Aiyomi must represent both what the user intended and what occurred. For example, a planned 60-minute study session that lasted 47 focused minutes is useful context, not a failed checkbox. The system should distinguish:

- planned duration from actual duration
- planned timing from actual timing
- completion from partial progress
- interruption from abandonment
- deliberate rescheduling from avoidance
- a constrained day from an overloaded plan

The aim is more realistic future support, not surveillance or judgment.

## 9. Day Score

Day Score is a future signature summary, such as `84, Strong Day`. It is not implemented in Phase 1A and no complete formula should be presented as final yet.

Potential dimensions include Execution, Focus, Consistency, Priorities, Balance, Growth, and Planning Realism. The eventual score should consider:

- meaningful priorities and outcomes
- planned and actual focus
- consistency relative to the person's patterns
- planning realism
- Minimum, Target, and Stretch outcomes
- day context, including rest and recovery
- intended versus actual behavior
- appropriate balance across the life context the user chose to track

Guardrails:

- never compute it as completed tasks divided by total tasks
- compare the user primarily with their own intentions and patterns
- do not treat more activity as automatically better
- do not penalize valid rest, illness, vacation, or a deliberately light plan
- show understandable contributing factors and allow correction of bad input
- do not use Day Score directly as a global leaderboard metric
- do not present a low score as a moral judgment or clinical finding

## 10. The Life Model

The future Life Model is a personalized, permission-aware set of observed patterns and user-stated preferences. It may learn typical wake and sleep times, stronger and weaker focus periods, realistic capacity, average effective focus duration, recurring conflicts, postponement patterns, schedule preferences, routine success, energy and mood patterns, planning realism, weekday and weekend differences, and the gap between intention and outcome.

The Life Model is not implemented in Phase 1A. Its durable boundaries are:

- it is descriptive and probabilistic, not a definitive statement about a person
- it may only use data collected for disclosed purposes and within user permissions
- inference must be distinguishable from user-provided fact
- consequential recommendations should provide a useful reason
- users must eventually be able to view, remove, disable categories of, and reset saved Companion memories
- sensitive signals must not appear in public profiles, competitive metrics, or sharing cards by default
- it must not diagnose health or mental health conditions
- it must not infer protected or highly sensitive traits merely because it can
- retention, deletion, and correction behavior must be defined before production use

## 11. Authentication and onboarding

Phase 3 mobile authentication supports email and password, Google Sign-In,
email verification, and password reset. First-time users complete a lightweight,
resumable onboarding without pre-created tasks, sessions, habits, or routines.

Potential onboarding topics include first name, timezone, typical wake and sleep times, schedule flexibility, fixed commitments, Life Areas, current priorities, desired improvements, common distractions, and accountability style. The critical question is:

> If this app could improve one thing about your life right now, what would it be?

Every answer must have a clear purpose. Skipping optional questions should remain possible.

## 12. Voice, integrations, sound, and offline behavior

- Voice input through speech-to-text precedes a full conversational voice companion on the roadmap.
- Calendar integrations may later include Google Calendar, Apple Calendar, and Outlook Calendar.
- Optional health integrations may later include Apple Health and Android Health Connect for permissioned data such as steps, exercise, and sleep.
- Mobile audio may later include separate controls for background music, sound effects, focus sounds, and haptics. Audio is never forced.
- Useful offline behavior should eventually include a cached Today plan, timer operation, task marks, quick notes, and cached visual or audio assets. AI features require connectivity.

All integrations are optional and permission-based.

## 13. Monetization

Future Free, Plus, and Pro plans may differentiate AI usage, Life Model depth, advanced insights and scheduling, integrations, customization, cosmetics, and focus analytics. Billing is out of scope for the current phase.

Never sell Growth Points, rank, competitive advantage, or the appearance of real-life achievement. Paid cosmetics must not alter competitive outcomes.

## 14. Phase 1A public experience

The landing page must communicate within about 10 seconds that Aiyomi is a cozy AI Life Companion that helps people plan better days, focus on what matters, grow consistently, and understand how they actually live.

It should use visual storytelling and realistic future mobile previews for:

- the hero and waitlist
- multiple Companion choices
- Today
- AI Brain Dump
- Focus
- learning and Life Model insights
- intent versus reality
- Day Score
- progress and weekly insights
- meaningful gamification
- cozy room and garden
- community and privacy-safe sharing
- real-life principles, including rest and Minimum, Target, Stretch

It must state that Aiyomi is coming soon to iOS and Android. It must not use fake store links, store badges, ratings, reviews, download counts, awards, users, or availability claims.

### Waitlist contract

Required fields are email and preferred platform (`iOS`, `Android`, or `Both`). First name is optional. Attribution may include constrained UTM fields and a validated referral code.

The flow is:

`landing page -> secure server endpoint -> validation -> anti-spam checks -> hosted Supabase -> optional Resend sync -> optional confirmation email -> safe success response`

Supabase is the source of truth. Resend handles delivery and audience synchronization. Duplicate normalized emails return the same friendly success state and never reveal record details.

Suggested success copy:

> You're in 🌱  
> We'll let you know when your companion is ready.

## 15. Future operational surfaces

The admin app is only a foundation in the current phase. Future areas may cover users, waitlist, analytics, referrals, subscriptions, AI providers and models, prompts, AI usage and costs, Companions, cosmetics, achievements, quests, rewards, competitions, leaderboards, abuse flags, email, feature flags, settings, and audit logs.

A future waitlist overview may show totals, recent leads, platform interest, source, conversion, and referral performance. The table may show email, first name, platform, source, campaign, created date, invited status, and converted user. Access must be authorized, audited, and restricted to appropriate roles.

When mobile signup exists, a verified authentication email may associate a waitlist record with `converted_user_id` and `converted_at`. Google sign-in conversion must match only a verified provider email. Referral support may later issue a code and store the referring waitlist record. Possible rewards include a Founder badge, cosmetic, Companion item, or early adopter achievement. Complex referral gamification is deferred.

## 16. Success principles

Initial success is not maximum screen time. Product measures should eventually emphasize:

- successful creation of a realistic, user-approved plan
- meaningful focus and follow-through
- recovery after plans change
- useful reflections and recommendations
- sustained use without guilt or compulsion
- trust, privacy control, accessibility, and user correction

Analytics must never include sensitive free-form content. Public marketing must not invent social proof.

## 17. Product assumptions requiring later owner decisions

- Final production mascot set, names, art, and animation direction require owner approval.
- The Day Score formula and labels require research, calibration, explainability testing, and explicit approval.
- Life Model memory categories, retention periods, and consent surfaces require privacy and safety review before implementation.
- Pricing, plan limits, virtual currency economics, competitive normalization, and real-world rewards remain undecided.
- Final legal URLs, social handles, store URLs, support email, sending domain, and launch markets must stay configuration-backed until confirmed.
