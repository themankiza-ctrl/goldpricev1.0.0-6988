## 8. 16-Point 3D Visual Anti-Slop & Quality Checklist

Evaluate every 3D scene against this checklist before completion:

- [ ] **1. Silhouette Clarity**: Does the hero object read distinctly by silhouette alone without color?
- [ ] **2. Plausible Construction**: Do parts connect with realistic thickness, joints, and recesses rather than floating?
- [ ] **3. Join Continuity**: Are skin junctions smooth and mechanical joints cleanly articulated without accidental seams?
- [ ] **4. Viewing-Scale Detail**: Is detail budgeted for the actual camera viewing scale without meaningless micro-noise?
- [ ] **5. Distinct Material Response**: Do materials exhibit varied, physically accurate PBR responses (metal, tissue, stone)?
- [ ] **6. Purposeful Lighting**: Is lighting arranged to reveal form without blown-out highlights or crushed shadows?
- [ ] **7. Effects Earned**: Are bloom, fog, and depth-of-field used purposefully without hiding modeling flaws?
- [ ] **8. Guided Composition**: Does the camera framing, depth, and contrast guide focus to the hero element?
- [ ] **9. Legible Scale**: Are physical dimensions, scale bars, or units clear to the viewer?
- [ ] **10. Appropriate Projection**: Is the camera projection (perspective vs. orthographic) suited to the subject?
- [ ] **11. Intentional Repetition**: Is instancing (`InstancedMesh`) used for repetitive assets without accidental visual jitter?
- [ ] **12. Meaningful Motion**: Is animation purposeful, respecting `prefers-reduced-motion`, with stillness used when appropriate?
- [ ] **13. Spatial Clearance**: Do moving objects avoid clipping through floors, roofs, or surrounding obstacles?
- [ ] **14. Collider Fidelity**: Do collision envelopes enclose actual geometry (including overhangs and wings)?
- [ ] **15. Truthful Controls**: Do sliders, toggles, and resets accurately change the modeled state and restore initial values?
- [ ] **16. Grounded Scientific Claims**: Are anatomical, chemical, or physical models grounded in verified references?

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec web-3d-graphics-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | P99 API Gateway Latency < 85ms, OpenAPI 3.1 / TypeSpec strict schema parity, RFC 9457 Problem Details error contracts, Idempotency-Key enforcement; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
