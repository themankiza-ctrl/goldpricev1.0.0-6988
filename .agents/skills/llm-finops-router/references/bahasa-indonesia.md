## Bahasa Indonesia

### Integrasi Orkestrasi
- **Hulu & Orkestrasi**: `zero-to-prod-orchestrator` (Integrasi AI Fase 4), `brainstorming`, `session-memory-manager`.
- **Routing Model & Kaskade**: `adaptive-model-cascade` (pemilihan model berbasis skor kompleksitas), `thinking-budget-orchestrator` (envelope token penalaran), `test-time-compute-optimizer` (skala biaya komputasi).
- **Caching Prompt & Konteks**: `kv-cache-prefix-optimizer` (maksimasi hit KV-cache), `context-window-engineer` (akuntansi biaya token per zona).
- **Observabilitas & Infrastruktur**: `llm-observability-expert` (trace Langfuse + dashboard biaya), `cloud-hosting-expert` (deployment gateway di Vercel, Cloudflare, AWS), `vercel-ai-sdk-expert` (routing streaming & tool-call di edge), `multi-agent-orchestration` (anggaran per-agen).

---

### Tujuan

Mengoptimalkan biaya operasional, keandalan, dan latensi arsitektur LLM multi-model menggunakan routing dinamis, rantai fallback penyedia, semantic caching, dan analitik FinOps real-time. Target: **pengurangan pengeluaran LLM bulanan 40–70%** tanpa menurunkan kualitas output.

---

### 1. LiteLLM v1.x — Panduan Konfigurasi Mendalam

LiteLLM menyediakan antarmuka standar kompatibel OpenAI untuk 100+ penyedia LLM dengan fallback bawaan, retry, dan manajemen anggaran.

**File konfigurasi utama:** `litellm_config.yaml`

Konsep kunci:
- **`model_name`** (virtual name): nama yang dipakai klien — bisa didefinisikan lebih dari sekali untuk fallback otomatis
- **`litellm_params.model`**: nama model nyata di penyedia
- **`router_settings.routing_strategy`**: `least-busy`, `latency-based-routing`, atau `cost-based-routing`
- **Virtual Keys**: kunci API virtual dengan batas anggaran per pengguna (`max_budget: 5.00` per hari)
- **Semantic Cache**: Redis-backed, similarity threshold 0.92 — kueri serupa dikembalikan dari cache

Lihat konfigurasi lengkap di [Seksi English](#english).

---

### 2. Portkey AI Gateway

Portkey bertindak sebagai middleware di atas penyedia LLM, memberikan:
- **Semantic Caching**: mengembalikan respons cached untuk kueri dengan kemiripan >92%, hemat 30–50% token
- **Fallback Strategy**: jika Anthropic gagal, otomatis turun ke Gemini
- **Load Balance / Canary**: kirim 80% traffic ke model stabil, 20% ke model baru untuk A/B test
- **Retry Logic**: retry otomatis pada status 429/500/502/503 hingga 3 kali
- **Observability Hooks**: setiap panggilan dicatat dengan metadata pengguna dan lingkungan

---

### 3. RouteLLM (Stanford)

RouteLLM melatih classifier biner untuk memutuskan apakah kueri memerlukan model kuat atau model lemah. Hasil benchmark: **pengurangan panggilan model kuat 40–85%** sambil mempertahankan kualitas.

- **Router `mf`** (matrix-factorization): tercepat, direkomendasikan untuk produksi
- **Threshold `0.11875`**: dikalibrasi untuk 50% tingkat panggilan model kuat pada MMLU benchmark
- Gunakan format `router-mf-{threshold}` sebagai nama model

---

### 4. Formula Biaya & Penegakan Anggaran

**Formula dasar:**

```
biaya = (input_token / 1_000_000 × harga_input)
      + (output_token / 1_000_000 × harga_output)
      + (cached_input_token / 1_000_000 × harga_cached)
```

**Strategi penegakan anggaran:**
1. Estimasi biaya sebelum memanggil LLM berdasarkan panjang prompt
2. Periksa saldo anggaran harian dari Redis
3. Jika saldo hampir habis → cascade ke model lebih murah, BUKAN tolak permintaan
4. Kirim alert Slack ketika pengeluaran mencapai 85% dari batas harian

---

### 5. Monitoring & Alert Biaya

**Langfuse** digunakan untuk:
- Melacak biaya per generasi (`total_cost` dalam metadata observasi)
- Dashboard penggunaan token per pengguna, per model
- Deteksi anomali pengeluaran (lonjakan tak terduga)

**Redis Cost Counter** (via Upstash):
- Key format: `llm:spend:YYYY-MM-DD`
- Increment atomic menggunakan `INCRBYFLOAT`
- Alert Slack otomatis saat 85% dari `LLM_DAILY_BUDGET_USD` terlampaui

---

### 6. Scorer Kompleksitas

Sistem scoring berbasis pola regex:
- **Pattern complexity tinggi**: `reasoning`, `code generation`, `analyze`, `plan`, `math` → tambah +0.2 skor
- **Pattern complexity rendah**: `translate`, `summarize`, `classify`, `extract` → kurangi -0.2 skor
- **Prompt panjang >2000 karakter**: tambah +0.1 skor
- **Threshold routing**: score ≥ 0.5 → reasoning tier; score < 0.5 → fast tier

Contoh implementasi TypeScript dan Python yang lengkap tersedia di [seksi English](#english).

---

### Anti-Slop Checklist FinOps

- [ ] Tidak ada penolakan hard saat anggaran penuh — selalu cascade ke model lebih murah
- [ ] Setiap panggilan LLM direkam dengan `user_id`, `model`, `cost_usd`, `input_tokens`, `output_tokens`
- [ ] Semantic cache aktif di gateway (Portkey atau LiteLLM Redis)
- [ ] Alert Slack dikonfigurasi pada 85% batas harian
- [ ] Virtual keys digunakan untuk isolasi anggaran per agen/tim
- [ ] Complexity scorer diuji pada setidaknya 50 prompt representatif sebelum deploy

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec llm-finops-router <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
