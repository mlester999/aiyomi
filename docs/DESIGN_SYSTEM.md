# Aiyomi Design System

## 1. Design intent

Aiyomi should feel like a premium consumer mobile companion that makes daily life calmer and more understandable.

The visual character is:

- cozy
- cartoonized
- soft
- warm
- playful
- friendly
- premium
- calm
- gently gamified
- emotionally comfortable

The target balance is **playful, not childish; cute, not unserious; cartoonized, but premium**.

Aiyomi must not resemble enterprise SaaS, a developer tool, a crypto dashboard, a generic AI startup, a corporate productivity dashboard, or products such as Jira, ClickUp, or Notion. Decorative styling must never make content harder to read or interactions harder to understand.

## 2. Brand foundation

Name:

> Aiyomi

Meaning:

> AI + You + Me

Primary positioning:

> Your AI companion for better days.

Supporting phrase:

> Plan. Focus. Grow. Together.

The product name, tagline, public URLs, support address, social handles, store URLs, and brand metadata remain centralized in configuration. Do not invent handles or app-store destinations. Until real listings exist, use **Coming soon to iOS and Android** without official store badges.

## 3. Experience principles

### Calm before density

Show the next useful decision and provide progressive detail. Avoid dashboards full of equally weighted cards, constant counters, and decorative status noise.

### Warmth without manipulation

The Companion may encourage, celebrate, and gently redirect. It must not guilt the user, fake urgency, claim loneliness, or pressure return visits.

### Real life before app activity

Celebration should follow meaningful action, reflection, rest, or recovery. Do not reward unnecessary taps, artificial task splitting, or extended screen time.

### User control stays visible

AI drafts and recommendations must look different from confirmed user commitments. Changes need clear accept, edit, and decline paths.

### Accessibility is visual quality

Pastel surfaces do not justify low contrast. Semantic structure, readable type, touch-friendly controls, motion preferences, keyboard access, and robust states are part of the design system.

## 4. Color system

The palette uses warm neutrals with pastel sky blue, mint, lavender, peach, muted yellow, and soft teal. Exact production values should be tested in context before being treated as stable tokens.

Suggested semantic families:

| Role | Direction | Use |
| --- | --- | --- |
| Canvas | warm off-white | primary page and screen background |
| Surface | cream and light warm neutral | cards, sheets, phone surfaces |
| Text strong | deep charcoal with a warm cast | headings and primary text |
| Text muted | readable warm gray | secondary text and metadata |
| Sky | pastel sky blue | primary brand accent and calm informational states |
| Mint | soft mint | growth and supportive success |
| Lavender | soft lavender | reflection, imagination, and Companion moments |
| Peach | warm peach | encouragement and human warmth |
| Sun | muted yellow | achievements and gentle highlights |
| Teal | soft dark teal | accessible accents and selected controls |
| Danger | restrained warm red | destructive actions and critical errors |

Rules:

- Define colors by semantic role, not by component name.
- Use a dark enough foreground for text and icons on every pastel background.
- Never communicate status by color alone.
- Reserve intense saturation for small moments of emphasis.
- Validate hover, pressed, selected, disabled, error, and focus states independently.
- Support system contrast needs where possible without losing brand character.

## 5. Typography

Typography should feel friendly and rounded while remaining highly legible. Use a restrained type family set and optimized font loading.

### Roles

- **Display:** compact marketing statements and major milestones
- **Heading:** screen and section organization
- **Body:** instructions, reflections, explanations, and longer reading
- **Label:** controls and compact metadata
- **Metric:** timers, Day Score, focused time, and progress summaries

Guidance:

- Use responsive sizing rather than shrinking desktop display text directly.
- Keep body copy at a comfortable mobile size and line height.
- Use sentence case for most interface labels.
- Avoid all-caps paragraphs and low-contrast microcopy.
- Use tabular numbers for timers and changing metrics when supported.
- Do not rely on font weight alone to distinguish interactive controls.

## 6. Shape, elevation, and spacing

Aiyomi uses rounded cards, buttons, pills, phone frames, illustrations, and soft environmental forms. Rounded does not mean every element needs a capsule shape.

### Radius

- small radius for compact controls and internal tags
- medium radius for inputs and ordinary cards
- large radius for feature cards, sheets, and phone previews
- full radius for avatars, status dots, and intentional pills

### Elevation

Use soft, broad shadows with low opacity. Elevation should clarify layering, not make every card float. Combine shadow with surface contrast and borders so the hierarchy survives high-contrast and reduced-transparency contexts.

### Spacing

Use a consistent base scale with generous whitespace. Cluster related content more closely than unrelated content. On mobile, protect thumb reach and avoid edge-to-edge density around interactive elements.

## 7. Core component behavior

Platform-specific components live in their app. These rules define shared behavior, not a universal component package.

### Buttons

- One visually dominant primary action per decision area.
- Secondary actions remain clearly interactive without competing with the primary.
- Destructive actions use explicit labels and confirmation proportional to risk.
- Loading preserves the control's size and prevents duplicate submission.
- Disabled states are not the only way to explain an unavailable action.
- Touch targets should be at least 44 by 44 CSS pixels or equivalent platform guidance.

### Links

Links must be distinguishable from body text and have visible keyboard focus. Do not make unavailable social or legal placeholders interactive.

### Inputs

- Use persistent accessible labels, not placeholder-only labels.
- Explain format or constraints before the error where useful.
- Keep entered data after recoverable errors.
- Associate help and error text programmatically.
- Announce submission errors and success to assistive technology.
- Use appropriate mobile input modes and autocomplete attributes.

### Cards

Cards represent one coherent idea or action group. Avoid placing every line in its own card. Interactive cards require clear states and semantics; decorative cards must not look clickable.

### Navigation

The public navbar remains compact with a working mobile menu. Mobile app navigation should follow Expo and platform conventions. Admin navigation may be denser but remains accessible and visually separate from the consumer experience.

## 8. Companion and illustration system

All Companions and environment art must be original. Potential directions include a star creature, fox, cat, bear, friendly robot, cloud creature, tiny dragon, or plant creature. No direction is final until owner approval.

### Companion requirements

- Support a family of multiple recognizable mascots, not a single implied choice.
- Remain readable at small sizes and expressive without text.
- Use consistent silhouette, eye, highlight, line, and shading rules.
- Provide accessible alt text when the illustration conveys content.
- Use empty alt text when the art is purely decorative.
- Do not block important copy, controls, or form fields.
- Avoid expressions that use guilt, distress, or dependency to drive engagement.

Placeholder SVGs should be clean, original, and easy to replace. Production art needs a source-of-truth asset inventory with ownership, export sizes, motion variants, and fallback states.

### World direction

The preferred initial world is a cozy room and garden. Visual progression may add furniture, plants, decorations, Companion accessories, outfits, themes, garden upgrades, collectibles, or focus items. Marketing art is concept art and must not imply final unlocks.

## 9. Product visualization patterns

### Today

Favor a calm timeline, clear current state, a small number of priorities, and quick access to capture or focus. Keep the Companion supportive and secondary to the user's plan.

### Brain Dump

Show the transformation from messy input to an editable structured proposal. Clearly label AI suggestions and avoid implying that the AI's first categorization is final.

### Focus

The timer is the primary visual. The linked activity, pause or stop actions, break context, and offline state must remain legible. Companion animation and ambience must be optional and restrained.

### Intent versus reality

Use side-by-side or stacked comparison with neutral language. Partial outcomes should be visible without red failure treatment.

### Day Score

Show the score with a contextual label and explanatory dimensions. Avoid casino-like animation, harsh rankings, or a single red or green judgment. The landing-page preview is conceptual.

### Progress and rewards

Use small, satisfying transitions and concrete explanations. Do not use slot-machine patterns, loot-box imagery, flashing urgency, or ambiguous currencies.

## 10. Motion

Motion should explain hierarchy, establish continuity, and give the Companion life. It should not compete with reading or delay action.

Use:

- gentle entrance transitions
- restrained parallax or float where it remains performant
- direct state transitions for forms
- subtle Companion reactions
- clear progress transitions

Avoid:

- continuous large movement around reading areas
- animation that causes layout shift
- mandatory animated backgrounds
- rapid flashing
- long celebration sequences
- motion used to hide loading or unavailable functionality

Honor `prefers-reduced-motion` on web and platform accessibility settings on mobile. Reduced motion should preserve meaning without simply removing feedback.

## 11. Sound and haptics

Future mobile sound may include cozy home, focus, reflection, seasonal, and mini-game music plus effects for taps, completion, Focus events, XP, levels, streaks, achievements, rewards, and Companion reactions.

Users must independently control background music, music volume, sound effects, effects volume, focus sounds, and haptics. Never force audio. Critical state must be available visually and, where relevant, through accessible announcements rather than sound alone.

## 12. Content design

Voice is warm, concise, respectful, concrete, and nonjudgmental. Address what happened and what can help next.

Prefer:

- "Your afternoon changed. Want to move this or choose the 10-minute minimum?"
- "You focused for 47 minutes. That still moved the work forward."
- "Rest is part of a sustainable plan."

Avoid:

- guilt about missed work
- absolute claims such as "Aiyomi knows you better than anyone"
- medical or psychological labels
- productivity language that devalues family, wellbeing, or recovery
- claims that the Companion has human feelings or needs
- fake availability, ratings, users, reviews, awards, or urgency

Never use the em dash character in user-facing copy. This rule covers web, mobile, admin, email, notification, marketing, empty, error, success, and accessibility copy.

## 13. Accessibility requirements

Every product surface requires:

- semantic HTML or correct native accessibility roles
- logical heading and reading order
- complete keyboard operation on web
- visible focus states
- strong readable contrast
- touch-friendly targets
- meaningful labels and alt text
- responsive typography and zoom support
- error and success announcements
- reduced-motion support
- no information conveyed only by color, motion, sound, or haptic feedback
- tested focus management for menus, dialogs, and route changes

Pastel colors must be measured in their actual component states. Placeholder text is not a label. Hover is not a mobile interaction strategy.

## 14. Responsive public web

Validate representative widths at 360, 390, 768, 1024, and 1440 pixels.

Requirements:

- no accidental horizontal scroll
- deliberate mobile composition rather than a shrunken desktop page
- readable line lengths and text sizes
- stable phone-mockup scaling
- Companion art that never obscures content
- working compact navigation and mobile menu
- an easy-to-use waitlist at every size
- restrained asset and animation cost
- no layout shift from images or fonts

Use optimized images and fonts, minimize unnecessary client-side code, and lazy-load appropriate below-the-fold media.

## 15. Phase 1A waitlist states

The waitlist must visibly support:

- idle
- focused input
- platform selected
- validation guidance
- submitting
- success
- safe recoverable error
- throttled or retry-later behavior without blame

The success state is friendly and idempotent for both new and duplicate normalized email submissions:

> You're in 🌱  
> We'll let you know when your companion is ready.

Do not reveal whether an address already existed.

## 16. Design review checklist

- Does this feel like a consumer companion rather than enterprise software?
- Is the primary action obvious without artificial urgency?
- Can a user understand AI suggestions and retain control?
- Are rest, partial progress, and changed plans represented without shame?
- Are all states usable with keyboard, assistive technology, reduced motion, and touch?
- Is contrast sufficient on every pastel surface?
- Is private information absent from social and marketing examples?
- Are illustrations original and replaceable?
- Are store availability and social proof claims truthful?
- Is all user-facing copy free of em dash characters?

## 17. Phase 1A.1 companion identity

The public landing page treats the Companion as an active participant across planning, focus, adaptation, reflection, reward, and the virtual world. Mori, Lumi, and Piko must remain distinguishable by silhouette, posture, face language, signature detail, and palette rather than color alone.

Expressive display typography is reserved for the hero and major emotional chapters. Feature headings use a cleaner rounded hierarchy so Aiyomi stays playful without reading as a children's application.

Companion and environment concepts remain modular and replaceable. Their current inventory, generation path, optimization, and placeholder status are documented in `docs/LANDING_ASSETS.md`.
