## Orchestration & Integration

This skill serves as the foundational quality, craftsmanship, and anti-slop gate across the entire vibes-plug swarm architecture. It actively connects to and hardens:

| Skill | Relationship & Integration Flow |
| :--- | :--- |
| `modern-web-guidance` | Queries and enforces modern web platform best practices before generating UI code. |
| `senior-frontend` | Sanitizes React 19 / Next.js 15 components from generic AI templates and unhandled states. |
| `tailwind-expert` | Enforces CSS-first styling, eliminates excessive pill buttons, and prevents stacked neon glows. |
| `design-system-architect` | Validates 5-state interactive contracts, accessible tokens, and solid borders. |
| `modern-css-native-expert` | Enforces native CSS anchor positioning and top-layer `@starting-style` transitions. |
| `ui-ux-pro-max` | Audits visual hierarchy, 60-30-10 color balance, and F/Z reading patterns. |
| `visual-ui-auditor` | Evaluates rendered screenshots and AST against the 20-point visual quality rubric. |
| `autonomous-tdd-debugger` | Enforces 100% complete implementations on the first try without test skips or fake mocks. |
| `production-ready-hardener` | Acts as the final delivery quality gate before any release or production deployment. |
| `zero-tech-debt-auditor` | Scans and eradicates syntax narration comments, dead code, and speculative abstractions. |
| `coderabbit` | Powers the autonomous PR review and code inspection engine. |

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | High Fast / High (`Grok 4.7 High Fast`, `Claude Sonnet 5.5 High`, `Gemini 4 Pro`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6`; `Grok 4.7` -> `Grok 4.6 High Fast` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec anti-slop <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_critic_validate`, `vibes_self_heal`, `vibes_eval_sandbox`, `vibes_verify_invariants` |
| **Invarian NFR & Anti-Slop** | Nol celah OWASP Top 10, 0 kredensial hardcoded, cakupan pengujian >= 90% pada logika domain, 0 pelanggaran Anti-Slop; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
