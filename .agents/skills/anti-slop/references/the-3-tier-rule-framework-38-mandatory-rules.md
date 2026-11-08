## The 3-Tier Rule Framework (38 Mandatory Rules)

All 38 rules are organized into three distinct tiers with clear enforcement semantics:
1. **Hard Gate** (Tier 1): Absolute bans and mandatory requirements. Zero exceptions.
2. **Purpose-Gate** (Tier 2): Technique allowed ONLY when serving a stated hierarchy/identity purpose with written rationale. Includes strict dose caps.
3. **Quality Locks** (Tier 3): Craftsmanship and resilience standards.

```
┌────────────────────────────────────────────────────────────────────────┐
│             SOVEREIGN UNIFIED ANTI-SLOP RULE MATRIX                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
┌───▼───────────────────────────┐ ┌─▼───────────────────────────┐ ┌─▼───────────────────────────┐
│     TIER 1: HARD GATE         │ │   TIER 2: PURPOSE-GATE      │ │  TIER 3: QUALITY LOCKS      │
│  (Absolute - Zero Exception)  │ │ (Purpose & Written Reason)  │ │   (Craftsmanship & Invar)   │
├───────────────────────────────┤ ├─────────────────────────────┤ ├─────────────────────────────┤
│ R-02 Copywriting (Em Dash)    │ │ R-01 Color & Gradients      │ │ C-1 Intentionality          │
│ R-03 Mobile Responsiveness    │ │ R-04 Icons Relevance        │ │ C-2 Functional Completeness │
│ R-17 Real Data & Numbers      │ │ R-06 Typography Purpose     │ │ C-3 Content-Driven Comp.    │
│ R-18 Honest Testimonials      │ │ R-07 Background Texture     │ │ C-4 System Resilience       │
│ R-23 Clarification & Assets   │ │ R-08 Spacing Rhythm         │ │ C-5 Evidence Over Claims    │
│ R-24 Real Navigation Dests    │ │ R-09 Layout Diversity       │ └─────────────────────────────┘
│ R-25 WCAG AA Color Contrast   │ │ R-10 Glassmorphism Cap (1-2)│
│ R-26 Functional Interactive   │ │ R-11 Deliberate Radii       │
│ R-27 Mandatory 3 UI States    │ │ R-12 Grounded Shadows       │
│ R-28 Product-Specific FAQ     │ │ R-13 Focus Glow Cap (1-2)   │
│ R-32 Keyboard Accessibility   │ │ R-14 Purposeful Motion      │
│ R-33 No Script File-Patching  │ │ R-15 Action-Driven CTAs     │
│ R-34 All Shipped Themes Work  │ │ R-16 Buzzword Elimination   │
│ R-35 Click-Through Evidence   │ │ R-19 Contextual Visuals     │
│ R-36 No Fabricated Claims     │ │ R-20 Functional Decors Only │
│ R-37 Design Direction & Dials │ │ R-21 Authentic Demos        │
│ R-38 Honest Placeholders      │ │ R-22 Dark Mode Rationale    │
│                               │ │ R-29 No AI Capsule Badges   │
│                               │ │ R-30 No Redundant Eyebrows  │
│                               │ │ R-31 No Banner Comments     │
└───────────────────────────────┘ └─────────────────────────────┘
```

---

### Tier 1: Hard Gate Rules (Absolute Zero-Tolerance)

Breaking any rule in this tier causes an automatic **FAIL** at the Delivery Gate.

#### R-02 — Copywriting: Em Dash Ban
- **FORBIDDEN**: The em dash character (`—`) in any AI-generated prose, marketing copy, or UI text.
- **Allowed Alternatives**: Comma (`,`), period (`.`), colon (`:`), semicolon (`;`), or parentheses `()`.
- **Rationale**: The em dash is the single most over-represented syntactic tell of synthetic text generation.
- **Carve-out**: Documentation formatting (e.g. `R-02 — Title`) is exempt; UI content and body prose are strictly subject to this ban.

#### R-03 — Mobile Responsiveness: Continuous Reflow
- **REQUIRED**: Mobile layout must be a dedicated, deliberate layout, never the desktop version shrunk down.
- Zero horizontal overflow (`overflow-x: hidden` used as a band-aid for broken layouts is forbidden).
- No text escaping container boundaries; no colliding cards or off-screen clipping.
- Minimum interactive touch target: **44x44px** (`min-h-[44px] min-w-[44px]`).
- Fluid viewport units: use `100dvh` instead of `100vh` to avoid mobile browser address bar jumps.
- Breakpoints must be placed where content breaks, not matched to arbitrary device marketing specs.

#### R-17 — Data & Numbers Authenticity
- **FORBIDDEN**: Hallucinated statistics, percentages, or metrics (`10,000+ users`, `99.9% uptime`, `500M queries`).
- If real verified data is unavailable, display **no numbers at all** or use an honest placeholder (`[REAL METRIC]`). Empty is infinitely better than deceptive.

#### R-18 — Testimonials & Social Proof
- **FORBIDDEN**: AI avatars, fictional customer names, invented job titles, or generated reviews.
- Do not generate a testimonials section unless provided with verified real customer quotes.

#### R-23 — Clarification & Honest Visual Placeholders
- **REQUIRED**: Never invent final logos, team avatars, or brand mascots on assumption.
- Confirm with user before generating brand assets. If rapid prototyping without feedback, use honest text markers: `[LOGO]`, initials avatar, or geometric placeholders. Disguising assumptions as final deliverables is forbidden.

#### R-24 — Navigation Integrity
- **FORBIDDEN**: Navbar items pointing to non-existent sections, dead anchors (`#`), or unbuilt routes.
- Every nav link must navigate to an existing, accessible route or section. Label unbuilt features explicitly as "Coming Soon".

#### R-25 — Color Contrast (WCAG 2.2 AA)
- **REQUIRED**: All text must meet WCAG AA contrast against its actual background:
  - Normal text (<18px): **minimum 4.5:1 ratio**.
  - Large text (≥18px bold or ≥24px regular): **minimum 3:1 ratio**.
- **FORBIDDEN**: Light grey text on white/light grey, dark grey on black without computation, or white text across variable photo/gradient backgrounds without a protective solid scrim.
- Contrast verification must be computed via `scripts/contrast-check.py` or mathematical formula; eyeball claims of AA compliance are rejected.

#### R-26 — Interactive Elements Completeness
- Every button, dropdown trigger, link, and toggle must possess authentic behavior or be eliminated:
  - Links navigate to real destinations.
  - Modals open, trap focus, and close with `Escape`.
  - Forms validate inputs and display authentic submission feedback.
  - Menus and accordions toggle state.
- **FORBIDDEN**: Dead buttons (`onClick={() => {}}`), empty hrefs, or static div look-alikes.

#### R-27 — Mandatory 3 UI States Contract
- **REQUIRED**: Every data-driven view or component must explicitly implement:
  1. **Empty State**: Friendly contextual illustration/icon + 1-sentence explanation + primary action CTA.
  2. **Loading State**: Geometry-matching pulsing skeleton matching the target shape (no full-page jarring spinners).
  3. **Error State**: Actionable recovery message + retry button.

#### R-28 — Product-Specific FAQ
- **FORBIDDEN**: Template FAQ questions (*"Is my data secure?"*, *"Can I cancel anytime?"*) that lack specific domain relevance.
- If domain-specific questions cannot be answered truthfully, omit the FAQ section entirely.

#### R-32 — Keyboard Accessibility & Focus Indicator
- **REQUIRED**: Full keyboard navigability (`Tab` / `Shift+Tab`) following visual order.
- Actionable elements must trigger on `Enter` or `Space`.
- **FORBIDDEN**: Removing focus outline (`outline: none`, `focus:outline-none`) without providing an explicit high-contrast focus ring (`focus-visible:ring-2 focus-visible:ring-offset-2`).

#### R-33 — Prohibition of Script File-Patching
- **FORBIDDEN**: Adding features (e.g. dark mode, theme toggles) via external Python/Node helper scripts that perform regex or string replacement on `.css`/`.tsx` files.
- All styles and logic must be implemented cleanly in the source code files.

#### R-34 — All Shipped Themes Must Be 100% Functional
- If a theme switcher is provided, both Light and Dark modes must be fully styled, tested, and contrast-compliant. Shipping an unstyled or broken secondary mode is a Hard Gate failure.

#### R-35 — Verification & Click-Through Evidence
- **REQUIRED**: Build and execute the code before declaring completion.
- Inspect the terminal and browser console for runtime errors or warnings.
- Perform a manual click-through pass of every interactive element and record evidence in the Delivery Gate report.

#### R-36 — Zero Fabricated Compliance & Performance Claims
- **FORBIDDEN**: Fabricating compliance badges (*SOC 2 Type II Certified*, *ISO 27001*, *HIPAA Compliant*) or unverified performance claims (*300% faster*, *10x acceleration*) without authentic proof.

#### R-37 — Design Direction & Honest Default Dials
- Every UI must be anchored in `DESIGN.md` or explicit brand guidelines.
- If building without direction, you must explicitly declare the output as a *"Draft without direction"* and set the honest dials to **ENERGY 1 / RHYTHM 1 / MOTION 1**. Falling into a sterile default while pretending to have design direction is forbidden.

#### R-38 — Real Content or Honest Placeholder
- Every feature, card, and metric must represent genuine domain facts OR carry an explicit placeholder badge (`[REAL DATA]`). Never write semi-realistic placeholder fiction that deceives the viewer.

---

### Tier 2: Purpose-Gate Rules (Technique Allowed, Purpose Required)

Techniques in this tier are permitted **only when they serve a documented hierarchy or identity goal**, backed by written rationale in the code or design document.

- **R-01 — Color & Gradients**: Generic blue-purple, blue-cyan, or rainbow gradients are forbidden as defaults. Gradients are permitted only as functional hierarchy dividers with written rationale. Exactly ONE focal accent color per view.
- **R-04 — Icons**: Sparkle, star, orb, bot, and diamond icons are forbidden as default feature glyphs. Icons must possess authentic semantic connection to the feature.
- **R-06 — Typography**: Monospace terminal aesthetics and shouting wide-tracked uppercase labels (`HOW IT WORKS`) are forbidden as generic tech costumes. Type must enhance legibility and reflect brand character.
- **R-07 — Background**: Dot grids, blueprint grids, and graph paper textures are forbidden as cheap tech shortcuts. Use authentic brand textures or clean solid surfaces.
- **R-08 — Spacing Rhythm**: Uniform spacing across all sections is forbidden. Spacing must express intentional rhythm and visual breathing room.
- **R-09 — Layout**: Formulaic AI landing pages (Hero -> 3 feature cards -> 3 steps -> Bento grid -> Pricing -> FAQ) are forbidden. Layouts must reflect user task flows.
- **R-10 — Glassmorphism Dose Cap**: Frosted glass (`backdrop-blur`) is strictly capped at **maximum 1-2 elements per page** (e.g., sticky top navigation only).
- **R-11 — Deliberate Border Radius**: Indiscriminate pill-shape addiction (`rounded-full` on cards, inputs, and standard rectangular buttons) is forbidden. Follow the structured 3-tier radius scale (6-8px inputs/buttons, 12-16px cards, `rounded-full` only for avatars and status chips).
- **R-12 — Grounded Shadows**: Floating zero-gravity colored drop shadows (`shadow-2xl shadow-indigo-500/50`) are forbidden. Use crisp 1px borders paired with subtle directional elevation (`shadow-xs` / `shadow-sm`).
- **R-13 — Focus Glow Dose Cap**: Neon glow borders and radiating cards are capped at **maximum 1-2 focus elements** on the entire page.
- **R-14 — Purposeful Motion**: Perpetual floating loops and multi-stacked entrance animations on scroll (fade + slide + scale + bounce) are forbidden. Transitions must be snappy (150-250ms), purposeful, and honor `prefers-reduced-motion`.
- **R-15 — Action-Driven CTAs**: Generic CTAs (*Get Started*, *Learn More*, *Try Now*) are replaced with specific, outcome-oriented copy (*Create free account*, *Read API reference*, *Import repository*).
- **R-16 — Buzzword Elimination**: AI buzzwords (*unlock the power*, *seamless*, *robust*, *elevate*, *revolutionary*, *game-changer*, *next-level*, *delve*) are strictly eliminated in favor of concrete facts.
- **R-19 — Contextual Visuals**: Generic Undraw/Storyset/3D clay blob characters are forbidden. Use real interface screenshots, concrete diagrams, or code previews.
- **R-20 — Non-Functional Decorations**: Colored vertical accent stripes on card edges, trailing decorative button arrows (`→`), and floating ambient shapes are forbidden.
- **R-21 — Authentic Demos**: Marketing a tool without displaying the actual interface or executable product is forbidden.
- **R-22 — Dark Mode Rationale**: Dark mode is a conscious brand decision, not an automatic default chosen because it looks "developer-focused".
- **R-29 — Capsule Badges**: Pill badges containing "AI Powered", "Beta", or "New" with glowing dots are forbidden unless representing a verified functional runtime status.
- **R-30 — Redundant Eyebrows**: Pill badges parked directly above an H1 heading that merely repeat the category already stated in the headline are forbidden.
- **R-31 — Decorative Code Separators**: Banner comments, box-drawing separators (`// =======================`), and ALL CAPS workflow banners are forbidden in code comments.

---

### Tier 3: Quality Locks & Craftsmanship (C-1 to C-5)

- **C-1 — Intentionality**: Every visual, architectural, and copy decision has a reason that can be articulated. Defaulting because "the LLM suggested it" is rejected.
- **C-2 — Functional Completeness**: Every control works completely. No partial stubs or non-responsive interactions.
- **C-3 — Content-Driven Composition**: Every section exists because the product content requires it, not to satisfy a page template.
- **C-4 — Resilience**: The UI holds up in all 3 states (empty, loading, error), all themes, all responsive breakpoints (320px to 4K), and under keyboard-only navigation.
- **C-5 — Evidence Over Claims**: Anything presented as fact (numbers, testimonials, security) is verified or removed.

---
