## Bahasa Indonesia

### Direktif Eksekutif & Paradigma Multi-Draf (Pergeseran 2026)
Generasi kode berbasis satu model tunggal selalu memiliki bias kognitif:
- **Model Pengoptimal Algoritma & Kecepatan** (misal Grok 4.7 High Fast / Grok 4.6 / Composer 2.5) menghasilkan logika sub-detik $O(N)$ yang sangat cepat dan transformasi AST instan namun kerap melewatkan telemetri defensif.
- **Model Berbasis Ketelitian Tipe** (misal Claude Sonnet 5.5 High / Claude Fable 5.1) menulis tipe data bermerek (*branded types*) dan invarian yang sangat kokoh, namun terkadang memilih struktur data yang lebih konservatif.
- **Model Kepatuhan Spesifikasi** (misal GPT-5.6 Sol Medium / Claude Opus 5.5 / Gemini 4 Argon) menghasilkan kontrak antarmuka dan kepatuhan skema yang ketat namun belum memanfaatkan optimasi runtime terdepan secara maksimal.

**Sintesis Multi-Draf Spekulatif** adalah protokol arsitektur yang melampaui batasan model tunggal. Alih-alih bergantung pada satu respon, swarm menugaskan **beberapa agen pembuat draf heterogen secara paralel**, menganalisis keluaran pada **tingkat simpul Abstract Syntax Tree (AST)**, dan memanggil **Model Arbiter Frontier** untuk memadukan inti algoritma terbaik, batasan error terkuat, serta definisi tipe terbersih ke dalam satu implementasi yang sempurna.

---

### Integrasi Orkestrasi
- **Swarm Multi-Agen & Dispatch Paralel**: `multi-agent-orchestration`, `parallel-tool-orchestrator`, `mcp-sampling-critic`.
- **Mesin Arbiter Frontier**: `frontier-ai-models-expert`, `gemini-agent-booster`, `thinking-budget-orchestrator`, `test-time-compute-optimizer`.
- **Pemetaan AST & Eksekusi Kode**: `living-codebase-ast-graph`, `ephemeral-wasm-sandbox-executor`, `spec-driven-development-expert`.
- **Kualitas & Jaminan Formal**: `anti-slop`, `ai-code-review-autonomous`, `formal-spec-z3-verifier`, `property-mutation-testing-expert`.
- **Sesi & Arsitektur**: `brainstorming`, `zero-to-prod-orchestrator`, `session-memory-manager`.

---

### Topologi Arsitektur Inti

```
┌────────────────────────────────────────────────────────────────────────┐
│               ALUR PIPA SINTESIS MULTI-DRAF SPEKULATIF                 │
├────────────────────────────────────────────────────────────────────────┤
│                         Prompt / Spesifikasi                           │
│                                   │                                    │
│                 ┌─────────────────┼─────────────────┐                  │
│                 ▼                 ▼                 ▼                  │
│           [Drafter Alpha]   [Drafter Beta]   [Drafter Gamma]           │
│           (Grok 4.7 Fast)   (Claude Sonnet)  (Gemini 4 Argon)          │
│            Fokus: Kecepatan  Fokus: Tipe Data Fokus: Error             │
│                 │                 │                 │                  │
│                 └─────────────────┼─────────────────┘                  │
│                                   ▼                                    │
│                     Promise.allSettled Paralel                         │
│                                   │                                    │
│                                   ▼                                    │
│                     Pemotongan & Penilaian AST                         │
│             (Kompleksitas, Ketepatan Tipe, Cabang Defensif)            │
│                                   │                                    │
│                                   ▼                                    │
│             ARBITER FRONTIER (Claude Sonnet 5.5 / Gemini 4 Pro)        │
│             Rekonsiliasi Simpul AST & Konstruksi Hibrida               │
│                                   │                                    │
│                                   ▼                                    │
│                    Verifikasi Sandbox WASM Efemeral                    │
│                                   │                                    │
│                                   ▼                                    │
│                     Artefak Emas Hasil Sintesis                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### 1. Spesialisasi Prompt Heterogen
Jangan pernah memberikan prompt yang identik ke setiap pembuat draf. Berikan peran struktural yang tegas:
- **Drafter Alpha (Pengoptimal Algoritma & Memori — `Grok 4.7 High Fast` / `Composer 2.5 Fast`)**: Ditugaskan mengoptimalkan kompleksitas waktu Big-O, jalur data zero-allocation, dan latensi terendah.
- **Drafter Beta (Pengoptimal Tipe & Invarian — `Claude Sonnet 5.5 High` / `Claude Opus 5.5 Medium`)**: Ditugaskan membangun tipe bermerek tanpa `any`, *tagged unions*, pencocokan pola menyeluruh, dan batasan kompilasi yang ketat.
- **Drafter Gamma (Sentinel Ketahanan & Operasional — `Gemini 4 Argon Medium` / `GPT-5.6 Sol Medium`)**: Ditugaskan membangun penanganan error domain kustom, kuota *retry*, pembatalan sinyal *abort*, serta logging terstruktur.
- **Drafter Delta (Eksplorasi Desain UI & Motion — `Muse Wonder High`)**: Ditugaskan merancang layout responsif generatif, animasi mikro dinamis, dan tata letak visual estetis.

#### 2. Protokol Dekomposisi & Pemotongan AST
Arbiter membedah setiap kandidat draf ke dalam empat potongan AST yang jelas:
1. **Potongan T (Skema Tipe Data)**: Interface, tipe bermerek, kontrak parameter, dan skema validasi.
2. **Potongan A (Inti Algoritma)**: Perulangan inti, jalur transformasi, atau komputasi matematis.
3. **Potongan E (Batasan Defensif)**: Klausa penjaga (*guard clauses*), pemetaan exception, dan alur pemulihan.
4. **Potongan L (Siklus Hidup Sumber Daya)**: Rutinitas pembersihan, penutupan stream, dan pencegahan kebocoran memori.

---

### Standar Kualitas Anti-Slop
1. **Larangan Cherry-Picking Mentah**: Arbiter dilarang hanya memilih satu file utuh tanpa rekonsiliasi. Kode hasil sintesis wajib menunjukkan penggabungan kekuatan antar draf.
2. **Rekonsiliasi Modul & Import Bersih**: Seluruh modul yang diimpor harus divalidasi keasliannya dan diurutkan secara kanonikal.
3. **Verifikasi Bebas Cacat**: Kode hasil rekonsiliasi wajib lulus kompilasi ketat dan diverifikasi bebas slop melalui `node scripts/check-anti-slop.js`.
4. **Invarian Pengalihan Ketersediaan (Availability Fallback Invariant)**:
   - Jika `Gemini 4` (`Argon` atau `Pro`) belum aktif di lingkungan atau terkena batas kuota, alihkan peran drafter maupun arbiter seketika ke **`Gemini 3.8 Flash`** (mempertahankan jendela konteks 1M+ dan latensi sub-100ms).
   - Jika `Claude Opus 5.5` belum aktif atau terkena batas kuota, alihkan tugas seketika ke **`Claude Opus 4.6`** (mempertahankan ketelitian pemahaman arsitektur dan validasi logika lintas domain).
   - Pipeline sintesis spekulatif multi-draf harus selesai tanpa interupsi melalui jalur pengalihan.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec speculative-multi-draft-synthesizer <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
