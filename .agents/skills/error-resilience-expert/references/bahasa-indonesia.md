## Bahasa Indonesia

### Integrasi Orkestrasi
- **Orkestrator Hulu**: Beroperasi di bawah arahan `brainstorming` dan `zero-to-prod-orchestrator` (Fase 6 - Hardening Produksi & Ketahanan) untuk memastikan arsitektur aplikasi yang toleran terhadap kegagalan.
- **Skill Hilir & Kerja Sama**:
  - `logging-error-tracking-expert` — Integrasi Sentry/BugSnag dan logging error terstruktur.
  - `data-telemetry-expert` — Menyalurkan tingkat error dan anomali latensi ke circuit breaker.
  - `js-backend-expert` — Middleware penanganan error API dan pemformatan RFC 9457 Problem Details.
  - `senior-frontend` — Error Boundary React 19, fallback suspense, dan UI state yang resilien.
  - `database-orm-expert` — Strategi retry transaksi, deadlock, dan kebijakan rollback.
  - `async-queue-temporal-expert` — Dead letter queue, backoff retry, dan pemulihan saga terdistribusi.
  - `production-ready-hardener` — Verifikasi mode kegagalan pra-peluncuran dan uji chaos.
  - `session-memory-manager` — Menyimpan log pemulihan kegagalan dan checkpoint status resilien.

### Deskripsi
Panduan tingkat produksi untuk membangun aplikasi yang tahan banting — gagal secara anggun, pulih otomatis, dan memberikan umpan balik error yang dapat ditindaklanjuti kepada pengguna maupun developer. Mencakup **React Error Boundaries**, **penanganan error Next.js** (`error.tsx`, `global-error.tsx`, `not-found.tsx`), **standar respons error API** (RFC 9457 Problem Details), **pola retry** dengan exponential backoff, **pola circuit breaker**, **dead letter queues**, dan integrasi **Sentry/BugSnag**.

### Kondisi Pemicu
Aktifkan skill ini ketika:
- Menyiapkan penanganan error untuk aplikasi React/Next.js.
- Mengimplementasikan logika retry untuk panggilan API yang tidak stabil atau layanan pihak ketiga.
- Merancang pola circuit breaker untuk panggilan antar-microservice.
- Membangun UI fallback untuk kondisi layanan terdegradasi.
- Mengintegrasikan alat pelacak error (Sentry, BugSnag, LogRocket).
- Menangani kegagalan transaksi pada operasi database.
- Merancang dead letter queue untuk job asinkron yang gagal.

### Konsep Inti

#### Filosofi Penanganan Error

| Prinsip | Deskripsi |
|---|---|
| **Gagal Cepat** | Deteksi dan laporkan error sedini mungkin; jangan biarkan state invalid menyebar |
| **Gagal dengan Anggun** | Tampilkan UI fallback yang berguna, bukan layar kosong atau stack trace mentah |
| **Retry dengan Cerdas** | Gunakan exponential backoff + jitter; jangan retry operasi non-idempoten secara membabi buta |
| **Isolasi Kegagalan** | Komponen yang gagal tidak boleh menghancurkan seluruh halaman |
| **Lacak Semuanya** | Setiap error yang tidak tertangani harus sampai ke sistem monitoring |

### Protokol Chaos Engineering & Injeksi Kegagalan Otomatis
1. **Injeksi Kekacauan (Chaos Injection)**: Uji ketahanan dengan sengaja memutuskan koneksi database, menyuntikkan latensi jaringan (Toxiproxy), atau membuang paket request ke API eksternal.
2. **Observasi Kegagalan**: Periksa apakah UI macet, layar menjadi putih kosong, atau connection pool bocor saat dependensi bermasalah.
3. **Hardening Ketahanan Otomatis**:
   - Terapkan Circuit Breaker pada panggilan API eksternal yang rentan.
   - Tambahkan retry dengan exponential backoff dan random jitter.
   - Terapkan degradasi anggun (*graceful degradation*): sajikan data cache atau UI fallback alternatif.
4. **Verifikasi Ketahanan**: Ulangi simulasi gangguan hingga sistem bertahan tanpa crash fatal dan seluruh error tercatat di Sentry.

### Kesalahan Umum yang Harus Dihindari

| Anti-Pola | Masalah | Pendekatan yang Benar |
|---|---|---|
| Menangkap error diam-diam (`catch (e) {}`) | Error menghilang, bug tersembunyi | Selalu log atau lempar ulang dengan konteks |
| Retry operasi non-idempoten | Charge ganda, insert duplikat | Hanya retry operasi baca dan write idempoten |
| Tidak ada timeout pada panggilan eksternal | Thread/pool koneksi habis | Pasang `AbortSignal.timeout()` pada semua panggilan fetch |
| Pesan generik "Terjadi kesalahan" untuk semua error | Pengguna tidak bisa menyelesaikan sendiri | Tampilkan pesan yang actionable (retry, hubungi support, periksa input) |

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec error-resilience-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
