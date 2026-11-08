## The Liveliness Toolkit: Dials, Levers & Design Read

A filter can remove slop, but it cannot add energy. Removing slop leaves a void, and language models fill that void with their most generic output (the sterile default). Liveliness must be **added** deliberately through positive requirements, not bans.

### Three Dials (Discrete Enforceable 1 to 3 Scale)

Every design must declare three dials explicitly, derived from `DESIGN.md` or the Design Read, and hold them from the first section to the last:

| Dial | 1 (Calm) | 2 (Balanced) | 3 (Bold) | What it answers |
| :--- | :--- | :--- | :--- | :--- |
| **ENERGY** | Linear, GOV.UK (Monochrome, quiet surfaces, restrained single accent, high whitespace) | Stripe, Vercel (Controlled dual-tone, crisp contrast, focused focal moments) | Awwwards, agency portfolio (High-chroma accents, rich tonal depth, dramatic typographic scale) | How hard does this design say hello? |
| **RHYTHM** | Uniform grid, predictable reading flow | Consistent grid with intentional composition breaks | Asymmetric, mixed editorial layouts, syncopated modular grids | How much do sections change from each other? |
| **MOTION** | Hover states only, instant utilitarian transitions (100ms) | Scroll-reveal, tactile press scales (`scale-[0.98]`, 150-250ms) | Parallax, sticky pin choreography, fluid spring physics | How much motion is present, and why? |

*Why 3 levels and not 10? A human reviewer and an AI agent can reliably verify binary checkable conditions: "is this section uniform or varied?" They cannot reliably judge "is this a 6 or a 7?". Three discrete levels make liveliness strictly enforceable.*

### The 5 Visual Levers (Transforming Dials into Decisions)
1. **One Focal Point per Screen**: Exactly one element is clearly the most important on every screen; all other elements defer to it.
2. **Hierarchical Contrast**: Size, weight, and color are differentiated on purpose to guide reading gravity, never randomized.
3. **Whitespace as Structure**: Empty space is used actively to separate and establish section cadence, not left over as accidental voids.
4. **One Deliberate Accent**: Exactly one accent color or gesture used sparingly at key moments. Zero accents is sterile; an accent everywhere is slop.
5. **Identity Motif**: One specific, repeated pattern, gesture, or typographic voice that makes the interface unmistakably belong to the product.

### Design Read Protocol (Mandatory Before Generation)
Before generating any UI component or page layout, declare the one-line Design Read:

> `Reading this as: <page kind> for <audience>, in a <visual language> style, dial <ENERGY/RHYTHM/MOTION>.`

*Example*: `"Reading this as: B2B SaaS analytics dashboard for engineering leads, in a Linear-style high-density language, dial ENERGY 2 / RHYTHM 2 / MOTION 1."*
- **Direction Exists (`DESIGN.md` or user brief)**: Infer the dials from it and proceed.
- **Direction Is Ambiguous**: Ask exactly ONE decisive question with concrete options (e.g., *"Should this feel closer to Linear-clean (Calm) or Stripe-vibrant (Balanced)?"*).
- **Direction Is Absent & Cannot Ask**: Label output as *"draft without direction"* and set the honest default dials: **ENERGY 1 / RHYTHM 1 / MOTION 1** (R-37).

---

### The 4 Proven Design Archetypes

Every interface must anchor itself in one coherent archetype to maintain stylistic unity:

#### 1. Archetype A: High-Precision Developer Tooling (Linear, Raycast, Vercel)
- **Palette**: Deep matte charcoal/zinc (`bg-neutral-950` / `bg-neutral-900`), crisp 1px borders (`border-neutral-800`), high contrast text.
- **Geometry**: Compact 6-8px radii (`rounded-md` / `rounded-lg`), tight padding, monospace metadata chips (`font-mono text-xs`).
- **Tactile Feel**: Keyboard shortcut pills (`<kbd>⌘K</kbd>`), instant hover highlights, subtle active press feedback (`active:scale-[0.99]`).
- **Dials Baseline**: ENERGY 2 | RHYTHM 3 | MOTION 2.

#### 2. Archetype B: Refined SaaS & FinTech (Stripe, Ramp, Mercury)
- **Palette**: Pure white or deep obsidian canvas, single deliberate conversion hue (emerald, indigo, or cobalt), 10% opacity badge fills.
- **Geometry**: 8-12px radii, tabular numerals on all amounts (`tabular-nums`), strict 4px/8px baseline rhythm.
- **Tactile Feel**: Pristine typography contrast (bold geometric display headers with neutral body), authentic ledger models.
- **Dials Baseline**: ENERGY 3 | RHYTHM 3 | MOTION 2.

#### 3. Archetype C: Human Interface & Modern Editorial (Apple HIG, Notion, Arc)
- **Palette**: Warm neutrals (stone, warm zinc, slate), natural breathing room, soft borders.
- **Geometry**: Generous padding, relaxed line-height (`leading-relaxed`), clean SVG iconography with consistent 1.5px/2px stroke weight.
- **Tactile Feel**: Physical tactile button feedback (`active:scale-[0.98] transition-transform duration-75`).
- **Dials Baseline**: ENERGY 3 | RHYTHM 4 | MOTION 3.

#### 4. Archetype D: High-Density Analytics & Operations (Datadog, Cloudflare)
- **Palette**: Neutral dark canvas, high-contrast semantic indicators (green/amber/red), color-blind safe palettes.
- **Geometry**: Ultra-compact padding (`px-3 py-1.5`), split panes, explicit filter toolbars, zero decorative fluff.
- **Tactile Feel**: High-contrast sparklines, multi-level breadcrumbs, tabular data grid alignment.
- **Dials Baseline**: ENERGY 2 | RHYTHM 2 | MOTION 1.

---
