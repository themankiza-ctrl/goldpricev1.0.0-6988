## Automated Tooling & Scripts

The skill includes built-in automated verification tools in `scripts/`:

1. **AST & Pattern Scanner**:
   ```bash
   node "scripts/check-anti-slop.js" --summary
   node "scripts/check-anti-slop.js" --strict
   ```
2. **WCAG Contrast Checker**:
   ```bash
   python "scripts/contrast-check.py" "#FFFFFF" "#0F172A"
   ```

---

### Production Code Blueprints

#### 1. Zero-Dependency Programmatic WCAG 2.2 AA Contrast Verifier (TypeScript)
Never eyeball contrast ratios or hallucinate compliance. Compute unrounded luminance and ratio deterministically:

```typescript
// src/quality/wcag-contrast-verifier.ts
export interface ContrastVerdict {
  foreground: string;
  background: string;
  ratio: number;
  normalText: { threshold: 4.5; pass: boolean };
  largeText: { threshold: 3.0; pass: boolean };
}

function parseHexChannel(hex: string, start: number): number {
  return parseInt(hex.slice(start, start + 2), 16) / 255;
}

function linearizeChannel(val: number): number {
  return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
}

export function computeRelativeLuminance(hexColor: string): number {
  let clean = hexColor.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error(`[WCAG] Invalid hex color format: ${hexColor}`);
  }

  const r = linearizeChannel(parseHexChannel(clean, 0));
  const g = linearizeChannel(parseHexChannel(clean, 2));
  const b = linearizeChannel(parseHexChannel(clean, 4));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function evaluateWcagContrast(foreground: string, background: string): ContrastVerdict {
  const lumA = computeRelativeLuminance(foreground);
  const lumB = computeRelativeLuminance(background);

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  const rawRatio = (lighter + 0.05) / (darker + 0.05);

  return {
    foreground,
    background,
    ratio: Math.round(rawRatio * 100) / 100,
    normalText: { threshold: 4.5, pass: rawRatio >= 4.5 },
    largeText: { threshold: 3.0, pass: rawRatio >= 3.0 },
  };
}
```

#### 2. MCP Stdio Tool Adapter for Anti-Slop Contrast Checker (TypeScript)
Expose programmatic contrast auditing to all MCP clients (Claude, Cursor, Codex, Antigravity):

```typescript
// src/mcp/contrast-mcp-tool.ts
import { evaluateWcagContrast, ContrastVerdict } from '../quality/wcag-contrast-verifier';

export interface McpToolResponse {
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

export function handleMcpCheckContrast(args: { foreground: string; background: string }): McpToolResponse {
  try {
    const verdict = evaluateWcagContrast(args.foreground, args.background);
    const textOutput = [
      `WCAG 2.2 Contrast Ratio: ${verdict.ratio}:1`,
      `Normal Text (<18px, 4.5:1): ${verdict.normalText.pass ? 'PASS' : 'FAIL'}`,
      `Large Text (>=18px bold / 24px, 3.0:1): ${verdict.largeText.pass ? 'PASS' : 'FAIL'}`,
    ].join('\n');

    return {
      content: [{ type: 'text', text: textOutput }],
      isError: !verdict.normalText.pass && !verdict.largeText.pass,
    };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Contrast check error: ${(err as Error).message}` }],
      isError: true,
    };
  }
}
```

---
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | High Fast / High (`Grok 4.7 High Fast`, `Claude Sonnet 5.5 High`, `Gemini 4 Pro`) |
| **Availability Fallback** | `Gemini 4 Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6`; `Grok 4.7` -> `Grok 4.6 High Fast` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec anti-slop <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_critic_validate`, `vibes_self_heal`, `vibes_eval_sandbox`, `vibes_verify_invariants` |
| **NFR & Anti-Slop Invariants** | Zero OWASP Top 10 vectors, 0 hardcoded secrets, >= 90% branch coverage on domain logic, 0 Anti-Slop violations; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
