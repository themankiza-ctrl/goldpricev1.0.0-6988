## Bahasa Indonesia

### Integrasi Orkestrasi
- **Swarm Agen & State Multi-Agen**: `multi-agent-orchestration`, `pydantic-ai-expert`, `speculative-multi-draft-synthesizer`
- **Konteks Jangka Pendek & Checkpoint**: `session-memory-manager`, `context-window-engineer`, `kv-cache-prefix-optimizer`
- **Penyimpanan Vektor & Retrieval Episodik**: `vector-db-rag-expert`, `graph-rag-knowledge-expert`, `database-orm-expert`
- **Inferensi & Perutean LLM**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `llm-finops-router`
- **Siklus Hidup & Tata Kelola**: `zero-to-prod-orchestrator`, `anti-slop`, `compliance-gdpr-privacy-expert`

---

### Tujuan

Merancang dan mengimplementasikan sistem memori multi-tier yang persisten untuk agen AI otonom yang melampaui context window sederhana. Memungkinkan agen untuk **mengingat pengguna lintas sesi**, memanggil keputusan masa lalu, mempertahankan knowledge graph, dan beroperasi dengan kontinuitas episodik menyerupai manusia — sambil tetap dalam batas anggaran token.

---

### Arsitektur Tier Memori

| Tier | Nama | Durasi | Teknologi | Kapasitas |
|------|------|---------|-----------|-----------|
| 0 | In-Context Working Memory | Sesi saat ini | Array messages LLM | ≤ 128K token |
| 1 | Session Memory | Jam hingga hari | Zep v2 session + entity graph | Tak terbatas (ringkasan) |
| 2 | Episodic Memory | Minggu hingga bulan | Mem0 + pgvector HNSW | Jutaan memori |
| 3 | Semantic / Procedural | Permanen | pgvector RAG + tabel KB terstruktur | Basis pengetahuan domain |

---

### 1. Mem0 v2 — Memori Episodik Lintas Sesi

Mem0 menyediakan lapisan memori terkelola yang mengekstrak dan menyimpan entitas, preferensi, dan fakta dari percakapan, sehingga dapat dicari lintas sesi.

**Konsep kunci:**
- `Memory.add(messages, user_id)`: ekstrak dan simpan memori dari percakapan — Mem0 secara otomatis mengidentifikasi entitas (nama, preferensi, kendala proyek)
- `Memory.search(query, user_id, limit)`: pencarian vektor-kemiripan atas memori episodik pengguna — kembalikan daftar berperingkat fakta yang relevan
- **Multi-user isolation**: setiap memori terikat pada `user_id` — tidak ada kebocoran antar pengguna
- **Entity extraction**: Mem0 menggunakan LLM untuk mengekstrak entitas terstruktur (nama, preferensi, batasan) dari percakapan mentah

**Dukungan backend:** Mem0 Cloud (API), atau self-hosted dengan pgvector, Qdrant, Pinecone, atau Chroma.

Lihat implementasi lengkap Python dan TypeScript di [seksi English](#english).

---

### 2. Letta/MemGPT — Manajemen Memori In-Context Tak Terbatas

Letta memungkinkan LLM mengelola memori sendiri melalui tool calls eksplisit ke blok memori:
- **`core_memory_append`**: tambahkan fakta baru ke blok memori inti (persona, human profile)
- **`core_memory_replace`**: perbarui fakta yang sudah ada di memori inti
- **`archival_memory_insert`**: simpan informasi ke penyimpanan arsip jangka panjang (vektor)
- **`archival_memory_search`**: cari arsip menggunakan pencarian semantik

**Pola penggunaan:**
1. Buat agen persisten dengan `client.agents.create()` — simpan `agent_id`
2. Gunakan `agent_id` yang sama di semua sesi masa depan — agen ingat konteks sebelumnya
3. Agen secara proaktif mengelola memorinya sendiri melalui tool calls saat konteks penuh

---

### 3. Zep v2 — Memori Temporal & Knowledge Graph Pengguna

Zep menyediakan layanan memori cepat dengan kesadaran temporal, ekstraksi entitas, dan konstruksi knowledge graph pengguna.

**Fitur utama:**
- **Temporal memory**: setiap fakta dicap waktu — agen dapat mempertanyakan "apa yang pengguna katakan minggu lalu tentang X?"
- **Entity graph**: Zep secara otomatis membangun graf pengetahuan entitas dari percakapan (orang, tempat, preferensi, keputusan)
- **`graph.add()`**: injeksikan data terstruktur (JSON profil pengguna) ke grafik — Zep mengekstrak entitas dan relasi
- **`graph.search(scope="edges")`**: cari relasi di knowledge graph menggunakan hybrid search (vektor + kata kunci) + RRF reranking
- **Session summary**: Zep secara otomatis merangkum sesi panjang menjadi ringkasan yang dapat diinjeksikan ke konteks agen

---

### 4. pgvector + HNSW — Penyimpanan Episodik Jangka Panjang

Untuk penyimpanan Tier 2/3, gunakan PostgreSQL dengan pgvector dan indeks HNSW untuk pencarian kemiripan sub-milidetik atas jutaan embedding memori.

**Mengapa HNSW daripada IVFFlat?**
- HNSW: recall@10 = 99%+, latensi stabil tanpa perlu `VACUUM`
- IVFFlat: recall@10 = 95%, memerlukan pemilihan `nlist` yang tepat dan `VACUUM` rutin

**Parameter HNSW yang direkomendasikan:**
- `m = 16`: koneksi per lapisan — keseimbangan antara performa recall dan penggunaan memori
- `ef_construction = 64`: kualitas indeks saat build — nilai lebih tinggi = recall lebih baik, build lebih lambat
- `ef_search = 40` (opsional via `SET hnsw.ef_search = 40`): kualitas pencarian saat query

---

### 5. Template Injeksi Memori ke RAG Pipeline

**Alur retrieval memori optimal:**

```
Query pengguna
    ↓
[Parallel Recall]
    ├── pgvector HNSW search (Tier 2 episodic)
    └── Mem0 semantic search (cross-session)
    ↓
[Merge & Rerank by similarity score]
    ↓
[Filter: min_similarity = 0.70, top_k = 8]
    ↓
[Inject ke system prompt sebagai "Relevant Memories" block]
    ↓
LLM call → response
    ↓
[Store turn to Mem0 + pgvector async]
```

---

### Anti-Slop Checklist Memori

- [ ] `user_id` selalu unik dan konsisten antar sesi — gunakan UUID deterministik (mis. `uuid5(NAMESPACE_DNS, email)`)
- [ ] Minimal similarity threshold 0.70 untuk menghindari injeksi memori tidak relevan
- [ ] Memori yang disimpan tidak melebihi `expires_at` — implementasikan TTL untuk memori sementara
- [ ] Zep session dibuat sebelum `memory.add()` dipanggil — validasi idempoten
- [ ] Letta `agent_id` disimpan di database untuk reuse lintas sesi
- [ ] Purge memori pengguna tersedia untuk kepatuhan GDPR/PDPA
- [ ] Semua operasi memori async — tidak memblokir response agen
- [ ] Indeks HNSW di-`REINDEX` setelah lebih dari 10% baris dihapus

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec agentic-memory-architect <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
