## Bahasa Indonesia

### Integrasi Orkestrasi
- **`modern-web-guidance`**: Standar HTML5/CSS, API browser modern, dan pedoman aksesibilitas.
- **`design-system-architect`**: Dokumentasi komponen dan referensi design token dengan Storybook.
- **`ui-ux-pro-max`**: Hierarki tipografi dokumentasi, tema sintaksis, dan UX pencarian.
- **`visual-ui-auditor`**: Audit visual multimodal untuk preview komponen dokumentasi dan Storybook.
- **`anti-slop`**: Dokumentasi teknis anti-slop, bebas buzzword pemasaran, contoh kode konkret.
- **`openapi-swagger-codegen-expert`**: Otomatisasi halaman referensi API dari spesifikasi OpenAPI 3.1.
- **`astro-framework-expert`**: Astro Starlight sebagai platform situs dokumentasi lengkap.
- **`seo`**: SEO dokumentasi — canonical URL, sitemap.xml, structured data, dan GEO.
- **`ci-cd-devops-architect`**: Pipeline deployment otomatis ke Vercel, Cloudflare Pages, GitHub Pages.
- **`senior-frontend`**: Komponen MDX kustom, playground interaktif, dan UI dokumentasi berbasis React.
- **`global-a11y-i18n-expert`**: Dokumentasi multi-bahasa i18n dan situs dokumentasi sesuai WCAG.

### Deskripsi
Panduan ahli untuk membangun situs dokumentasi teknis tingkat produksi dan library komponen. Mencakup **Mintlify** (docs SaaS AI-native), **Docusaurus 3** (React/OSS), **Storybook 8** (playground komponen), **VitePress 2** (berbasis Vue), dan **Astro Starlight** (konten berat dengan i18n). Termasuk panduan generasi referensi API, strategi versioning, integrasi pencarian, pengujian visual Chromatic, dan workflow CI/CD deployment.

### Kondisi Pemicu
- Membuat situs dokumentasi untuk API, library, atau produk SaaS.
- Menyiapkan Storybook untuk dokumentasi komponen dan regresi visual.
- Memilih framework dokumentasi untuk proyek open-source.
- Menghasilkan halaman referensi API dari spesifikasi OpenAPI.
- Migrasi dari dokumentasi lama (GitBook, Confluence) ke situs statis modern.
- Menambahkan versioning, pencarian, atau i18n ke situs dokumentasi yang sudah ada.

---

### Matriks Pemilihan Framework

| Framework      | Stack        | Pencarian AI | Versioning | i18n | Terbaik Untuk                      |
|----------------|--------------|--------------|------------|------|------------------------------------|
| Mintlify       | React / MDX  | ✅ AI Native  | ✅          | ✅   | Docs API SaaS, produk komersial    |
| Docusaurus 3   | React / MDX  | ✅ Algolia    | ✅          | ✅   | Proyek open-source                 |
| Storybook 8    | Semua stack  | ❌            | ❌          | ❌   | Playground library komponen UI     |
| VitePress 2    | Vue / MD     | ✅ Bawaan     | ❌          | ✅   | Ekosistem Vue / docs library       |
| Astro Starlight| Astro / MDX  | ✅ Pagefind   | ✅          | ✅   | Docs konten berat multi-bahasa     |

**Aturan Keputusan:**
- Produk SaaS → **Mintlify** (zero-config, pencarian AI, playground API)
- Library OSS → **Docusaurus** (versioning + Algolia + plugin komunitas)
- Library komponen → **Storybook** (visual testing + interaksi + Chromatic)
- Proyek Vue → **VitePress** (integrasi Vue native, sangat cepat)
- Konten berat / i18n-first → **Astro Starlight** (Pagefind, routing i18n)

---

### 1. Mintlify — Ringkasan Konfigurasi

File `mint.json` mengontrol seluruh navigasi, branding, dan integrasi API playground. Field `"openapi"` menunjuk ke spesifikasi OpenAPI dan secara otomatis menghasilkan halaman referensi interaktif — tidak perlu authoring MDX tambahan untuk setiap endpoint.

```bash
npm install -g mintlify
mintlify dev        # pratinjau lokal di http://localhost:3000
mintlify scrape     # hasilkan halaman dari field openapi di mint.json
```

**Komponen MDX bawaan:** `<Note>`, `<Warning>`, `<Tip>`, `<Info>`, `<CodeGroup>`, `<Accordion>`, `<Card>`, `<CardGroup>`, `<Steps>`, `<Tabs>` — langsung digunakan dalam file `.mdx` tanpa import.

---

### 2. Docusaurus 3 — Ringkasan

Docusaurus adalah pilihan terbaik untuk proyek open-source karena mendukung:
- **Versioning**: `npm run docusaurus docs:version 2.0.0` membuat snapshot beku dari `/docs` saat ini.
- **Algolia DocSearch**: Gratis untuk proyek OSS — daftar di `https://docsearch.algolia.com/apply`.
- **Plugin MDX**: `remark-math` + `rehype-katex` untuk LaTeX, `rehype-mermaid` untuk diagram.
- **Plugin OpenAPI**: `docusaurus-plugin-openapi-docs` menghasilkan halaman referensi dari spec YAML.

---

### 3. Storybook 8 — Ringkasan

Storybook adalah standar industri untuk mendokumentasikan dan menguji komponen UI secara visual.

**Fitur Utama:**
- **Autodocs**: Tambahkan `tags: ['autodocs']` ke meta story — halaman dokumentasi otomatis dihasilkan dari props TypeScript.
- **Interaction Testing**: Gunakan `play()` dengan `@storybook/test` untuk mensimulasikan interaksi pengguna dan memverifikasi perilaku komponen.
- **Chromatic**: Layanan visual regression testing — tangkap perubahan UI yang tidak disengaja di setiap PR.
- **Addon Aksesibilitas**: `@storybook/addon-a11y` menjalankan audit axe-core pada setiap story.

---

### 4. VitePress 2 — Ringkasan

VitePress adalah pilihan ideal untuk ekosistem Vue atau proyek library TypeScript yang membutuhkan dokumentasi cepat.

- File konfigurasi: `docs/.vitepress/config.mts` (TypeScript penuh)
- Pencarian lokal bawaan — tidak perlu Algolia untuk proyek kecil/menengah
- Integrasi komponen Vue langsung dalam halaman Markdown
- Dukungan i18n multi-bahasa melalui konfigurasi `locales`

---

### 5. Astro Starlight — Ringkasan

Starlight dibangun di atas Astro dan merupakan pilihan terbaik untuk dokumentasi konten berat dengan i18n.

- **Pagefind**: Pencarian statis client-side — dihasilkan saat build, ukuran bundle ~8KB JS.
- **i18n**: Dukung banyak bahasa dengan routing otomatis (`/id/`, `/ja/`, dll.)
- **Sidebar otomatis**: `autogenerate: { directory: 'guides' }` membuat sidebar dari struktur folder.
- **Edit di GitHub**: Link "Edit halaman ini" otomatis dihasilkan dari konfigurasi `editLink`.

---

### 6. Arsitektur Konten — Praktik Terbaik

**Strategi Versioning:**
- Gunakan `docusaurus docs:version` untuk snapshot rilis beku.
- Gunakan **Changesets** (`@changesets/cli`) untuk otomatisasi changelog dan bumping versi package.
- Sertakan badge versi semver di halaman utama docs.

**Otomatisasi Changelog:**
```bash
npx changeset add       # tambahkan changeset setelah setiap PR
npx changeset version   # bump versi + update CHANGELOG.md
npx changeset publish   # publish ke npm
```

**Referensi API via `openapi-typescript`:**
```bash
npx openapi-typescript https://api.acme.com/openapi.json -o src/types/api.d.ts
```
Hasilkan tipe TypeScript penuh dari spesifikasi OpenAPI — gunakan bersama `openapi-fetch` untuk client API yang fully type-safe.

---

### 7. Deployment

| Platform         | Perintah Build                | Output Dir              | Catatan                          |
|------------------|-------------------------------|-------------------------|----------------------------------|
| Vercel           | `npm run build`               | `build` / `dist`        | Zero-config untuk Docusaurus      |
| Cloudflare Pages | `npm run build`               | `build` / `dist`        | Konfigurasi via dashboard         |
| GitHub Pages     | `npm run build`               | `build`                 | Gunakan workflow Actions di atas  |
| Netlify          | `npm run build`               | `build`                 | Tambahkan `netlify.toml`          |

**Mintlify** di-deploy melalui platform Mintlify sendiri — hubungkan repo GitHub di dashboard `mintlify.com` dan setiap push ke `main` otomatis men-deploy.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec documentation-site-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
