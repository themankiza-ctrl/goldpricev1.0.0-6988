## Bahasa Indonesia

### Integrasi Orkestrasi
- **Pengujian & Jaminan Kualitas**: `autonomous-tdd-debugger`, `e2e-testing-expert`, `property-mutation-testing-expert`, `formal-spec-z3-verifier`, `ai-code-review-autonomous`, `coderabbit`, `zero-tech-debt-auditor`
- **Keamanan & Red Teaming**: `autonomous-red-teamer`, `prompt-injection-firewall`, `zero-trust-secret-vault`, `supabase-security-expert`, `firebase-security-expert`
- **Frontend & Design System**: `senior-frontend`, `tailwind-expert`, `design-system-architect`, `modern-css-native-expert`, `ui-ux-pro-max`, `global-a11y-i18n-expert`
- **Backend & Integritas Data**: `js-backend-expert`, `database-orm-expert`, `api-design-expert`, `spec-driven-development-expert`, `authentication-identity-expert`
- **DevOps, CI/CD & Observabilitas**: `ci-cd-devops-architect`, `github-actions-expert`, `cloud-hosting-expert`, `data-telemetry-expert`, `logging-error-tracking-expert`, `self-healing-cloud-orchestrator`
- **Performa & SEO**: `performance-web-vitals`, `seo`, `app-analyzer-optimizer`
- **Siklus Hidup & Tata Kelola**: `brainstorming`, `zero-to-prod-orchestrator`, `prd-architect`, `session-memory-manager`, `anti-slop`

### Deskripsi
**Production-Ready Hardener** adalah skill orkestrator utama yang menggabungkan dan mendelegasikan ke semua skill vibes-plug yang relevan untuk memastikan aplikasi Anda kokoh, aman, berperforma tinggi, dan siap produksi sebelum deployment. Skill ini berfungsi sebagai checklist pra-produksi komprehensif yang tidak meninggalkan celah — dari polish frontend hingga ketahanan backend, dari keamanan data hingga observability.

Skill ini TIDAK menggantikan skill individual — ia **mengoordinasikan** mereka ke dalam alur kerja audit-dan-pengerasan yang terstruktur dan bertahap.

### Peta Skill yang Diorkestrasi

| Fase | Skill yang Digunakan | Fokus Utama |
|------|---------------------|-------------|
| 1. Arsitektur & Kualitas Kode | `scalability-clean-code`, `fullstack-expert`, `app-analyzer-optimizer`, `monorepo-architect`, `dependency-upgrade-migrator`, `anti-slop`, `typescript-expert` | SOLID, DRY, Clean Architecture, RFC 9457 errors, pembersihan AI slop, strict TS |
| 2. Pengerasan Frontend | `senior-frontend`, `design-system-architect`, `tailwind-expert`, `form-validation-expert`, `state-management-expert`, `ui-ux-pro-max`, `hig`, `tanstack-query-expert`, `global-a11y-i18n-expert` | React 19, Error Boundaries, validasi Zod + RHF, a11y, state management, UI primitives |
| 3. Pengerasan Backend | `js-backend-expert`, `go-programming-expert`, `python-programming-expert`, `rust-programming-expert`, `database-orm-expert`, `cron-scheduler-expert`, `async-queue-temporal-expert`, `email-notification-expert`, `file-upload-media-expert`, `mcp-server-architect`, `multi-agent-orchestration`, `ai-llm-integration-expert` | Database migration, ORM, connection pooling, durable background jobs, transactional email, MCP tools, FinOps |
| 4. Pengerasan Keamanan | `supabase-security-expert`, `firebase-security-expert`, `authentication-identity-expert`, `zero-trust-secret-vault`, `rate-limit-abuse-prevention`, `secure-fuzz-testing`, `fullstack-expert` | RLS, RBAC, OAuth2, Turnstile bot protection, Upstash rate limit, secret vault, fuzzing, XSS/CSRF |
| 5. Testing & QA | `e2e-testing-expert`, `browser-automation-expert`, `coderabbit`, `secure-fuzz-testing`, `error-resilience-expert`, `logging-error-tracking-expert` | E2E (Playwright), visual testing, Unit (Vitest), circuit breaker, Sentry & Pino logging |
| 6. Performa & SEO | `seo`, `seo-geo`, `seo-aeo-landing-page-writer`, `performance-web-vitals`, `app-analyzer-optimizer` | Core Web Vitals (LCP, INP, CLS), bundle, CDN, sitemap, llms.txt & AEO |
| 7. DevOps & Observability | `ci-cd-devops-architect`, `cloud-hosting-expert`, `data-telemetry-expert`, `session-memory-manager`, `prd-architect` | Docker, CI/CD pipeline, OpenTelemetry, PostHog, Vercel/Cloudflare, state checkpoint & CHANGELOG |

### Protokol Eksekusi

Ketika skill ini dipicu, jalankan **7 fase pengerasan berurutan**. Setiap fase menghasilkan temuan dan rekomendasi. Di akhir, compile sebuah **Laporan Kesiapan Produksi**.

---

#### FASE 1: Audit Arsitektur & Kualitas Kode
- [ ] Struktur proyek mengikuti clean architecture
- [ ] Prinsip SOLID diterapkan konsisten
- [ ] Pelanggaran DRY diidentifikasi dan di-refactor
- [ ] Kontrak API menggunakan desain spec-first (OpenAPI/GraphQL)
- [ ] Error handling terstruktur dan konsisten (RFC 9457)
- [ ] TypeScript strict mode aktif (`strict: true`), tanpa tipe `any` (`typescript-expert`)
- [ ] Validasi input di semua batas API (Zod, Pydantic)
- [ ] Tidak ada hardcoded value — semua konfigurasi via environment variable
- [ ] Audit Anti-Slop Berdaulat Lolos — validasi wajib via `node scripts/check-anti-slop.js --strict` untuk menjamin 0 placeholder, 0 stub, 0 komentar sintaksis, dan 0 sampah debug (`anti-slop`)
- [ ] Audit dependensi — semua paket up-to-date, tanpa CVE (`dependency-upgrade-migrator`)

#### FASE 2: Pengerasan Frontend
- [ ] Server Components secara default
- [ ] Suspense boundary dengan loading state bermakna
- [ ] Error boundary di setiap segmen halaman
- [ ] Validasi formulir ketat dengan React Hook Form + Zod (`form-validation-expert`)
- [ ] Tidak ada hydration mismatch
- [ ] Aksesibilitas (a11y) & i18n — WCAG 2.2, ARIA, navigasi keyboard (`global-a11y-i18n-expert`)
- [ ] Desain responsif — berfungsi sempurna di mobile, tablet, desktop (`tailwind-expert`)
- [ ] Optimasi gambar dengan `next/image`, WebP/AVIF, lazy loading
- [ ] Analisis bundle — tanpa library besar yang tidak perlu
- [ ] Meta tags lengkap di setiap halaman
- [ ] Strategi state management (`state-management-expert`) dan caching yang tepat

#### FASE 3: Pengerasan Backend
- [ ] Semua perubahan schema via database migration (Prisma 6 / Drizzle ORM)
- [ ] Connection pooling dikonfigurasi (`database-orm-expert`)
- [ ] Index yang tepat pada kolom yang sering di-query
- [ ] Pencegahan N+1 query
- [ ] API rate limiting & idempotency keys aktif
- [ ] Durable background jobs & cron queues (`async-queue-temporal-expert`)
- [ ] Email transaksional & upload media presigned (`email-notification-expert`, `file-upload-media-expert`)
- [ ] Skema MCP Server guarded & optimasi prompt caching (`llm-finops-router`)
- [ ] Graceful shutdown dengan penanganan SIGTERM
- [ ] Health check endpoint (`/healthz`, `/readyz`)

#### FASE 4: Pengerasan Keamanan
- [ ] Autentikasi OAuth 2.0 / OIDC (`authentication-identity-expert`)
- [ ] Otorisasi RBAC/ABAC pada semua route dilindungi
- [ ] RLS aktif di SEMUA tabel publik (Supabase/PostgreSQL) (`supabase-security-expert`)
- [ ] Firebase Security Rules ketat
- [ ] CORS dengan allow-list eksplisit (bukan `*`)
- [ ] CSP headers dikonfigurasi
- [ ] HTTPS dipaksakan dengan HSTS
- [ ] Semua secret di environment variable / secret manager (`zero-trust-secret-vault`)
- [ ] Rate limiting & proteksi bot Turnstile (`rate-limit-abuse-prevention`)
- [ ] `.gitignore` mencakup `.env` dan file sensitif
- [ ] Pencegahan SQL injection, XSS, CSRF
- [ ] Validasi file upload (content-type, size limit)
- [ ] Verifikasi tanda tangan webhook & audit logging

#### FASE 5: Testing & Quality Assurance
- [ ] Unit test (≥80% coverage)
- [ ] Integration test dengan database real
- [ ] E2E test untuk alur kritis (Playwright) (`e2e-testing-expert`)
- [ ] Visual regression testing (`browser-automation-expert`)
- [ ] Fuzz testing pada parser dan validator (`secure-fuzz-testing`)
- [ ] Error resilience (circuit breaker & retry logic) (`error-resilience-expert`)
- [ ] Structured logging (Pino) & error tracking (Sentry) (`logging-error-tracking-expert`)
- [ ] Code review automation (CodeRabbit) (`coderabbit`)
- [ ] Type checking dan linting di CI tanpa error

#### FASE 6: Optimasi Performa & SEO
- [ ] Core Web Vitals memenuhi target (LCP < 2.5s, INP < 200ms, CLS < 0.1) (`performance-web-vitals`)
- [ ] Bundle size dioptimasi
- [ ] CDN untuk aset statis
- [ ] Caching multi-tier (Browser → CDN → Redis → Database)
- [ ] SEO meta tags lengkap (`seo`)
- [ ] Structured data (Schema.org) & XML Sitemap
- [ ] Kesiapan AI search & AEO (`seo-geo`, `seo-aeo-landing-page-writer`, `llms.txt`)

#### FASE 7: DevOps & Kesiapan Deployment
- [ ] Docker multi-stage build, non-root user, HEALTHCHECK
- [ ] CI/CD pipeline otomatis (lint → test → build → deploy) (`ci-cd-devops-architect`)
- [ ] Edge & Cloud Deployment (Vercel/Cloudflare Workers) (`cloud-hosting-expert`)
- [ ] Zero-downtime deployment & strategi rollback yang teruji
- [ ] Telemetri & observability (OpenTelemetry, PostHog, Sentry) (`data-telemetry-expert`)
- [ ] Structured logging format JSON
- [ ] SLI/SLO terdefinisi & backup database otomatis
- [ ] Session state checkpoint disimpan (`session-memory-manager`)
- [ ] Dokumentasi terkini (`CHANGELOG.md`, `BLUEPRINT.md`, `README`) (`prd-architect`)

---

### Scanner Kesiapan Otomatis
Script scanner Python otomatis tersedia di [production_readiness_scanner.py](file:///c:/Users/roedy/.gemini/config/plugins/vibes-plug/skills/production-ready-hardener/scripts/production_readiness_scanner.py) untuk menjalankan seluruh fase pemeriksaan secara otomatis. Scanner ini mendeteksi stack teknologi (Vite, React 19, Supabase, Vitest, Playwright, ESLint) serta mem-parsing file log error lokal (`tsc_errors.txt`, `eslint_output.txt`, dll) untuk mengkalkulasi skor kesiapan rilis dan menyusun laporan markdown interaktif (`PRODUCTION_READINESS_REPORT.md`).

**Cara Penggunaan:**
```bash
# Jalankan pemeriksaan checklist statis dasar pada proyek
python scripts/production_readiness_scanner.py /path/to/project

# Jalankan diagnostik aktif termasuk typecheck tsc, linter eslint, unit test, dan bundle build
python scripts/production_readiness_scanner.py /path/to/project --run-tsc --run-lint --run-tests --run-build
```

---

### Metodologi Penilaian

Setiap fase dinilai 0-100 berdasarkan penyelesaian checklist:
- **95-100**: Siap produksi ✅
- **80-94**: Perlu perbaikan minor ⚠️
- **60-79**: Ada masalah signifikan 🟡
- **Di bawah 60**: Belum siap produksi 🔴

**Skor Keseluruhan** = Rata-rata berbobot:
- Arsitektur (10%) + Frontend (15%) + Backend (15%) + **Keamanan (25%)** + Testing (15%) + Performa (10%) + DevOps (10%)

> **Catatan:** Keamanan diberi bobot tertinggi karena pelanggaran data dan kerentanan adalah masalah produksi yang paling merusak.

### Kondisi Pemicu
Aktif setiap kali pengguna meminta untuk:
1. Mempersiapkan aplikasi untuk deployment produksi.
2. Menjalankan review kesiapan produksi, checklist pra-peluncuran, atau audit pengerasan.
3. Memastikan aplikasi aman, berperforma tinggi, dan kokoh sebelum go-live.
4. Melakukan audit kualitas komprehensif di seluruh frontend, backend, dan infrastruktur.

### Referensi Dokumentasi
- [Production Readiness Checklist](file:///c:/Users/roedy/.gemini/config/plugins/vibes-plug/skills/production-ready-hardener/references/production_checklist.md)
- [Security Hardening Guide](file:///c:/Users/roedy/.gemini/config/plugins/vibes-plug/skills/production-ready-hardener/references/security_hardening_guide.md)
- [Performance Optimization Guide](file:///c:/Users/roedy/.gemini/config/plugins/vibes-plug/skills/production-ready-hardener/references/performance_optimization.md)

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | High Fast / High (`Grok 4.7 High Fast`, `Claude Sonnet 5.5 High`, `Gemini 4 Pro`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6`; `Grok 4.7` -> `Grok 4.6 High Fast` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec production-ready-hardener <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_critic_validate`, `vibes_self_heal`, `vibes_eval_sandbox`, `vibes_verify_invariants` |
| **Invarian NFR & Anti-Slop** | Nol celah OWASP Top 10, 0 kredensial hardcoded, cakupan pengujian >= 90% pada logika domain, 0 pelanggaran Anti-Slop; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
