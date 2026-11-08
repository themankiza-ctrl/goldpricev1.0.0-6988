## Bahasa Indonesia

### Integrasi Orkestrasi
- **Pembayaran & Routing Multi-Gateway**: `payment-gateway-expert`, `saas-billing`, `agentic-m2m-settlement`, `agentic-micro-economy-architect`
- **AI Agentic Commerce & MCP**: `doku-mcp-server`, `mcp-server-architect`, `ai-llm-integration-expert`
- **Database & Idempotensi Atomik**: `database-orm-expert`, `saas-multi-tenant`
- **Keamanan & Kriptografi Pasca-Kuantum**: `post-quantum-crypto-migrator`, `zero-trust-secret-vault`, `autonomous-red-teamer`
- **Pemrosesan Asinkron & Observabilitas**: `async-queue-temporal-expert`, `data-telemetry-expert`
- **Siklus Hidup & Tata Kelola**: `brainstorming`, `zero-to-prod-orchestrator`, `session-memory-manager`, `anti-slop`

### Deskripsi
Panduan ahli untuk mengintegrasikan DOKU Payment Gateway berdasarkan dokumentasi resmi [DOKU Developers Portal](https://developers.doku.com/).
DOKU menyediakan 2 model integrasi utama:
1. **DOKU Checkout** (`/checkout/v1/payment`): Halaman pembayaran hosted atau modal pop-up overlay (`jokul-checkout-1.0.0.js`). Cara termudah dan tercepat untuk menerima seluruh metode pembayaran (Virtual Account, Kartu Kredit, QRIS, E-Wallet, Indomaret/Alfamart, Paylater, Direct Debit) dalam satu kali integrasi. Menggunakan tanda tangan **Non-SNAP HMAC-SHA256** dengan komponen `Digest`.
2. **Direct API**:
   - **Standar SNAP BI (Host-to-Host)**: Standar Bank Indonesia untuk integrasi perbankan langsung (B2B Access Token via RSA Asimetrik, transaksi via **HMAC-SHA512** untuk Direct VA, Direct QRIS, dan Direct Debit).
   - **Direct API Non-SNAP**: Endpoint khusus untuk Kartu Kredit (`/credit-card/v1/payment-page`) dengan 3DS kustom dan OVO Push Payment (`/ovo-emoney/v1/payment`) langsung ke ponsel pengguna.

---

### Perbandingan Model Integrasi (Checkout vs Direct API)

| Kebutuhan | Rekomendasi Solusi | Alasan |
|---|---|---|
| **E-commerce, SaaS, Starter** | **DOKU Checkout** | 1 API mengaktifkan semua kanal pembayaran sekaligus tanpa membangun UI per bank. |
| **In-App Native Banking UI** | **Direct API SNAP BI** | Memungkinkan merchant menampilkan nomor Virtual Account atau QRIS langsung di dalam aplikasi tanpa redirect. |
| **Non-PCI DSS Card Form** | **Credit Card Payment Page** | Halaman pembayaran kartu dengan 3DS aman tanpa beban audit sertifikasi PCI DSS. |
| **Push Payment E-Wallet** | **OVO Push Payment** | Langsung memicu prompt bayar di aplikasi OVO pelanggan menggunakan nomor ponsel (timeout 70 detik). |

---

### 🚨 Simulator Sandbox DOKU
- **URL Simulator**: `https://sandbox.doku.com/gtw-config-v2/simulator`
- **QRIS Simulator**: `https://sandbox.doku.com/qris-simulator/`
Gunakan simulator resmi di atas untuk menguji transaksi Virtual Account dan QRIS dalam mode Sandbox sebelum deployment ke produksi.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | High Fast / High (`Grok 4.7 High Fast`, `Claude Sonnet 5.5 High`, `Gemini 4 Pro`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6`; `Grok 4.7` -> `Grok 4.6 High Fast` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec doku-payment-gateway <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_critic_validate`, `vibes_self_heal`, `vibes_eval_sandbox`, `vibes_verify_invariants` |
| **Invarian NFR & Anti-Slop** | Nol celah OWASP Top 10, 0 kredensial hardcoded, cakupan pengujian >= 90% pada logika domain, 0 pelanggaran Anti-Slop; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
