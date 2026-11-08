## Specialized Domain Sub-Disciplines

### Sub-Discipline 1: Code Comments Hygiene
- **Scope Guardrail**: This filter modifies only comments; never touch executable code, identifiers, formatting, or logic.
- **Eliminate AI Comment Slop**:
  - ❌ Decorative box banners (`// =====================`, `/* ----- ROUTES ----- */`).
  - ❌ Restating the obvious (`// Increment count` above `count++`, `// User class` above `class User`).
  - ❌ Workflow step narration (`// Step 1: Validate`, `// Step 2: Query DB`, `// Finally return`).
  - ❌ Empty labels (`// Business logic`, `// Helper function`, `// Important note`).
  - ❌ Vague placeholders (`// TODO: Improve this later`, `// Add more validations`).
  - ❌ Signature echoing in JSDoc/docstrings (`@param price The price`, `@returns The total`).
  - ❌ Decorative emojis in comments (`// ✅ Validated`, `// 🚀 Performance boost`).
  - ❌ End-of-block markers (`} // end if`, `# end function`).
- **Preserve Real Engineering Value**:
  - ✅ Comments explaining **WHY** (domain invariants, security boundaries, race condition workarounds, upstream vendor bug workarounds).
  - ✅ Actionable TODOs with clear scope and context: `// TODO(auth): migrate to session tokens when v2 endpoint ships`.

---

### Sub-Discipline 2: Copywriting & Prose Sanitation
- **Eliminate AI Vocabulary & Hype Bingo**:
  - Replace inflated verbs (*unlock, elevate, empower, delve, showcase, revolutionize*) with concrete human actions (*use, build, see, manage*).
  - Eliminate significance inflation (*"marking a pivotal moment", "ushering in a new era"*).
  - Eliminate unsourced social proof (*"Trusted by thousands of developers"* without named logos).
  - Eliminate weasel attributions (*"Experts say", "Industry observers note"*).
  - Strict ban on em dashes (`—`) in all copy (R-02).
- **Before / After Matrix**:
  - 🔴 *Before*: "Unlock the power of next-generation AI to seamlessly elevate your workflow — revolutionizing team productivity."
  - 🟢 *After*: "Automate ticket triage and sync status updates across your engineering team in real time."

---

### Sub-Discipline 3: Human & Accessibility Engineering
- **WCAG 2.2 AA Contrast Enforcement**:
  - Minimum 4.5:1 for body text; minimum 3:1 for large text (≥18px).
  - Interactive element borders and focus rings must meet minimum 3:1 contrast against adjacent background.
- **Automated Contrast Check**: Run `python scripts/contrast-check.py "#HEX1" "#HEX2"`.
- **Keyboard Navigation & Trap Prevention**:
  - All interactive elements must be accessible via keyboard (`Tab`, `Enter`, `Space`, `Escape`).
  - Never trap focus in dialogs without an `Escape` key handler and clear close button.
  - Interactive elements must declare clear `focus-visible` ring indicators.

---

### Sub-Discipline 4: Mobile & Responsive Layout Ergonomics
- **Continuous Viewport Reflow**: Layouts must look intentional from 320px to 2560px.
- **Fluid Typography**: Use CSS `clamp()` (`clamp(1.5rem, 4vw + 1rem, 3rem)`) instead of static pixel jumps.
- **Touch Target Law**: All interactive elements must measure at least **44x44px** in physical touch area.
- **Dynamic Viewport Height**: Always use `100dvh` (or `min-h-dvh`) instead of `100vh` to prevent mobile address bar overlap.

---
