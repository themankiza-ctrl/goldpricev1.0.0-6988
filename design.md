# Golden Feather Pricing Engine — Design System

Inspiration: "Nova / Fluid Money" fintech reference — a saturated yellow hero block clipped with a large bottom-right radius, sitting on near-black sections, oversized display headlines with a muted "ghost" second line, and soft dark rounded cards with tiny icon chips.

## Color

```
--gf-gold:        #F5C518   /* primary — hero block, CTAs, live values */
--gf-gold-soft:   #FFDE5C   /* highlight / hover */
--gf-gold-deep:   #C99A0B   /* pressed, borders on gold surfaces */
--gf-black:       #0A0A0A   /* page background */
--gf-panel:       #131313   /* cards, tables */
--gf-panel-2:     #1B1B1B   /* nested rows, inputs */
--gf-line:        #262626   /* hairlines */
--gf-text:        #F7F7F5   /* primary text on dark */
--gf-muted:       #8A8A85   /* secondary text */
--gf-ink:         #0A0A0A   /* text on gold */
--gf-buy:         #7FD1A0   /* otkup / positive */
--gf-sell:        #F5C518   /* prodaja */
--gf-warn:        #E8994A   /* stale feed, requote hold */
--gf-danger:      #E2564D   /* feed down, errors */
```

Rules: gold is for money and action only — never for decoration or large blocks of body text. Buy side is always the muted green, sell side always gold, so the two never get confused at a glance.

## Typography

- **Display:** `Bricolage Grotesque` (700/800) — hero, section headers, big prices. Tight tracking (`-0.03em`), line-height 0.95 on multi-line headlines.
- **Body/UI:** `Plus Jakarta Sans` (400/500/600).
- **Numeric:** `JetBrains Mono` (500) — every price, spot value, percentage and timestamp. Tabular figures so digits don't jitter on live refresh (`font-variant-numeric: tabular-nums`).

Hero pattern from the reference: solid line 1 in ink, line 2 at ~35% opacity ("ghost line").

## Layout

- Max width 1200px, 24px gutters.
- Hero: full-bleed gold block, `border-bottom-right-radius: 96px`, black page showing beneath.
- Cards: `--radius: 22px`, 1px `--gf-line` border, no drop shadows — separation comes from the panel fill.
- Icon chips: 40px rounded square, `--gf-panel-2` fill, gold 18px lucide icon.
- Density: the price table is intentionally dense (44px rows, mono figures); everything around it is airy.

## Motion

One orchestrated page load: hero headline words stagger up 12px/300ms, then the spot ticker fades, then table rows cascade at 20ms intervals. Live value changes flash the cell background gold at 8% for 600ms — the only recurring animation. No hover parallax, no scroll-jacking.

## UX patterns

- **Feed status is always visible** — a pill in the header: `LIVE` (gold dot, pulsing), `STALE` (orange, shows age), `DOWN` (red, prices frozen and labelled as such). Never render a price without its status.
- **Sell and buy are always adjacent**, sell first, with the spread shown as a small mono percentage between them.
- **EUR/RSD toggle** is a segmented control, persisted to localStorage.
- Every applied markup is explainable: hovering the sell price shows the breakdown (base margin + weekend + volatility).
- Admin is the same dark shell, no separate theme — just denser and with inputs.
