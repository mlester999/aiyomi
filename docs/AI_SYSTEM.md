# Aiyomi AI System

## 1. Role of AI

Aiyomi's AI helps users understand, plan, organize, focus, adapt, reflect, and learn. It is an assistant inside a user-controlled product, not an autonomous manager of a person's life.

AI may:

- turn unstructured input into an editable draft
- suggest realistic priorities and time blocks
- propose a Minimum version when a Target is not realistic
- recommend one useful next action
- explain schedule conflicts and tradeoffs
- summarize user-approved activity and reflection data
- identify tentative behavioral patterns with appropriate evidence
- adapt communication to a user-selected Companion mode

AI must not silently change commitments, claim certainty it does not have, diagnose a condition, pretend consciousness, or expose private context.

The complete AI backend and Life Model are not implemented in Phase 1A. Marketing previews must describe future intent without unsupported claims.

## 2. User-control contract

Every AI capability should use one of these control levels:

| Level | Behavior | Example |
| --- | --- | --- |
| Inform | Show context without changing state | identify a schedule conflict |
| Draft | Produce editable structured content | organize a brain dump |
| Recommend | Offer an action with a reason | suggest the Minimum workout |
| Confirmed action | Apply a clearly presented user approval | reschedule an accepted task |

The default maximum is Recommend. Confirmed actions require an explicit interface that shows what will change. Future background automation must be separately scoped, reversible where practical, and configurable.

Users need a non-AI path for core records. A provider outage must not prevent viewing a cached Today plan, running a timer, or recording an outcome where the architecture can reasonably support it.

## 3. Companion identity and behavior

The Companion is a visual and conversational interface to Aiyomi's intelligence across planning, scheduling, chat, Focus, check-ins, streaks, reflections, Day Score, quests, achievements, rewards, social sharing, and the virtual room and garden.

It must state or imply truthfully that it is an AI product experience. It must not claim to be human, alive, conscious, sentient, lonely, harmed by absence, or dependent on the user.

Conceptual modes:

- **Gentle:** calm encouragement, fewer proactive prompts, softer accountability
- **Balanced:** supportive language, moderate assistance, ordinary accountability
- **Coach:** more direct, more proactive, and willing to highlight repeated avoidance

Mode selection affects frequency, directness, suggested actions, and notification behavior. It does not change safety rules, privacy, factual standards, or the need for approval.

## 4. Provider-independent architecture

Apps call Aiyomi capabilities, not provider SDKs. A trusted server-side gateway owns external AI calls.

```text
web, admin, or mobile
  -> authenticated Aiyomi capability endpoint
  -> policy and permission checks
  -> minimal context assembler
  -> prompt and schema registry
  -> provider and model router
  -> model call with timeout and bounded retries
  -> structured-output validation
  -> deterministic safety and domain checks
  -> user-facing draft or recommendation
  -> privacy-safe usage and cost record
```

The gateway should support:

- server-only provider credentials
- capability-based routing
- configurable providers and models
- prompt identifiers and versions
- structured response schemas
- timeouts, cancellation, and bounded retries
- token, latency, failure, and cost accounting
- feature flags and gradual rollout
- safe fallbacks that do not invent successful output
- testing with deterministic fixtures or provider mocks

Prompts should not be scattered through UI components. Provider-specific response types should be converted at the gateway boundary.

## 5. Context minimization

For each capability, assemble only the context needed for the current request. A brain-dump organizer does not automatically need reflection history. A focus-timer label does not need mood history. Administrative analytics must not expose raw Companion context.

The context assembler should record categories used, not raw private content in general logs. Sensitive content must not be sent to analytics. Provider retention and training settings must be reviewed before production use, and users must receive an accurate privacy explanation.

## 6. Structured AI capabilities

### Brain Dump

Input: user text, optionally plus approved planning context.

Output: an editable list of proposed tasks or other domain records, priority group, estimated effort when justified, possible time block, parse confidence, and unresolved questions.

Rules:

- preserve the original text until the user confirms the transformation
- never invent deadlines, recurrence, or commitments
- flag uncertainty rather than silently choosing consequential details
- validate output against domain schemas
- let the user remove, merge, split, or recategorize items

### Natural-language Quick Capture

Input such as "Dentist Thursday at 2" may produce a draft event. Dates must be interpreted using the user's timezone and an explicit current date. Ambiguous dates or recurrence require confirmation.

### Plan assistance

Use fixed commitments, user priorities, available time, user-provided energy, current day context, and user-enabled Life Model patterns. Suggestions should state what they move or reduce and why. Never optimize solely for the number of completed tasks.

### What should I do now?

Return one recommendation, a concise reason, a realistic duration or Minimum version, and alternatives. Check known fixed commitments and available time. When context is stale or incomplete, say so.

### Reflection and insight

Summaries must separate recorded facts from interpretation. Insights should include the relevant time window and avoid causal or medical claims. A short history should not become a stable personality claim.

## 7. Life Model

The Life Model is a future personalized system that may learn patterns such as:

- typical wake and sleep times
- strong and weak focus periods
- realistic daily capacity and average effective focus duration
- preferred work, study, exercise, or personal activity windows
- frequently postponed activities and recurring conflicts
- routines that tend to work or fail
- energy, mood, and procrastination patterns
- planning realism
- weekday and weekend differences
- focus compared with completion
- good-day and difficult-day patterns
- intention compared with actual behavior

### Data classes

Do not collapse these into one memory store:

1. **User-stated preference:** something the user explicitly chose or said
2. **Observed event:** a task, session, timing, check-in, or outcome with provenance
3. **Derived feature:** a calculation such as average focus duration over a time window
4. **Hypothesis:** a probabilistic interpretation such as a stronger focus window
5. **Companion memory:** an approved or product-defined item retained for future interaction

Each derived item should carry source category, time window, confidence or evidence count, algorithm or model version, last evaluated time, sensitivity category, and deletion behavior.

### Boundaries

- The Life Model describes observed patterns. It does not define the user.
- Inferences must remain distinguishable from user-provided facts.
- Important recommendations need a useful explanation.
- Users must eventually be able to view, remove, disable categories of, and reset Companion memories.
- The model must account for changing circumstances and decay stale evidence.
- It must not infer protected or highly sensitive traits merely because inference is technically possible.
- It must not diagnose ADHD, depression, sleep disorders, or other conditions.
- It must not feed public profiles, global rankings, or share cards by default.
- Raw provider prompts and outputs are not automatically permanent memories.

### Quality safeguards

Require sufficient evidence before surfacing a pattern. Compare time windows appropriately, handle timezone shifts, distinguish routine absence from missing data, and allow correction. Evaluate recommendations by usefulness, calibration, user acceptance, and downstream outcomes, not only model fluency.

## 8. Day Score and AI

The Day Score algorithm is a future product system, not a free-form model opinion. Deterministic, versioned domain logic should own score computation. AI may explain a score using validated inputs, but it must not invent or directly set the score.

Potential dimensions are Execution, Focus, Consistency, Priorities, Balance, Growth, and Planning Realism. Rest and day context must be first-class inputs. Day Score must not equal raw completion rate and must not directly determine global rank.

Every score version should be reproducible from its stored inputs and algorithm version. Explanations should avoid moral language.

## 9. Safety boundaries

Aiyomi may be warm and supportive but is not a doctor, therapist, lawyer, financial advisor, crisis service, or conscious person.

The system must:

- avoid diagnosis and individualized professional claims
- avoid guaranteeing outcomes
- avoid manipulative emotional dependency
- avoid guilt, coercion, threats, or claims that absence harms the Companion
- provide an appropriate safe response and encourage qualified or emergency help when high-risk content requires it
- avoid using a Companion personality mode to bypass safety behavior
- keep crisis and safety copy accurate for the user's locale when such functionality is scoped

Detailed high-risk response policies, escalation resources, and evaluation suites must be approved before conversational Companion launch.

## 10. Privacy, consent, and memory control

AI features should disclose what categories of data they use in understandable terms. Optional calendar, health, voice, mood, reflection, and memory access requires appropriate permission.

Users should eventually be able to:

- inspect saved Companion memories
- delete individual memories
- disable memory categories
- reset all Companion memory
- correct important factual context
- control social visibility
- delete data and delete the account

Memory deletion must define effects on derived features, caches, provider logs, backups, and future recommendations. Private content remains private by default.

## 11. Security

- AI provider keys stay server-side.
- Clients never select unrestricted provider parameters or arbitrary system prompts.
- Inputs and structured outputs are bounded and validated.
- Tool or action permissions are capability-specific and user-specific.
- Retrieved or user-provided text is untrusted and cannot override system policy.
- Provider errors, prompt content, and internal safety classifications are not returned raw.
- Usage logs avoid full private prompts unless a reviewed, time-bounded debugging need explicitly permits them.
- Rate limits, spend limits, and per-capability quotas protect availability and cost.
- Any future write tool uses idempotency, authorization, validation, confirmation, and audit metadata.

## 12. Competitive and reward use

AI may later help classify task quality or flag suspicious activity, but it must not be the only anti-abuse control or final authority for meaningful prizes. Begin with server-authoritative events and deterministic rules.

Potential competition protections include server timestamps, caps, diminishing returns, Trust Score, account-age signals, device or risk signals where appropriate, suspicious activity flags, and manual review. Top global users should be reviewable before significant rewards.

AI must not generate Growth Points from self-reported text alone. Growth Points, rank, and competitive advantage cannot be purchased.

## 13. Evaluation before release

Each capability needs a versioned evaluation set containing ordinary, ambiguous, adversarial, multilingual, safety-sensitive, and privacy-sensitive examples as appropriate.

Evaluate:

- schema validity and deterministic rule compliance
- factual grounding in supplied context
- preservation of user intent
- clarity of uncertainty
- planning realism and conflict handling
- respect for rest and Minimum, Target, Stretch
- refusal and safety quality
- privacy leakage
- accessibility and copy style
- latency, failure rate, token usage, and cost
- differences across Companion modes without safety drift

Human review is required for new high-impact capabilities. Do not log evaluation fixtures containing real user data.

## 14. Observability and administration

Future authorized admin capabilities may manage provider definitions, model routing, prompt versions, AI usage, costs, feature flags, and audit logs. Secret values should be write-only or managed through deployment secrets, never shown in full.

Operational records should use request identifiers and include capability, prompt version, routed provider and model, latency, token counts, estimated cost, structured outcome, and error category. Raw personal content should not be the default operational record.

## 15. Deferred decisions

- initial AI provider and model set
- prompt registry storage and approval workflow
- exact memory categories and retention windows
- user-facing explanation and correction interfaces
- safety escalation policy and launch locales
- cost budgets and plan-specific AI limits
- evaluation thresholds for each capability
- job infrastructure for long-running analysis
- voice data handling and deletion

These must be decided in the scoped phases for AI Companion and Life Model, not implemented during Phase 1A.

