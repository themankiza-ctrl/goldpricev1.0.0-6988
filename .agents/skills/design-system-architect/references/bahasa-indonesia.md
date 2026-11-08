## Bahasa Indonesia

### Integrasi Orkestrasi
Terhubung dan mengorkestrasi skill domain yang relevan:
- **`modern-web-guidance`**: Mencari dan menegakkan standar terbaik platform web 2026 sebelum membangun primitif UI.
- **`modern-css-native-expert`**: Pemosisi jangkar CSS native, `@starting-style`, dan transisi top-layer.
- **`tailwind-expert`**: Menerjemahkan token desain ke dalam variabel CSS-first `@theme`.
- **`ui-ux-pro-max`**: Kecerdasan desain, pola pindai F/Z, pelapisan warna 60-30-10, dan skala tipografi.
- **`visual-ui-auditor`**: Audit vision multimodal otomatis dan verifikasi rubrik 20-poin.
- **`anti-slop`**: Menghilangkan klise visual AI (Pilar 7), adiksi tombol lonjong (pill button), dan status palsu.
- **`brainstorming`**, **`zero-to-prod-orchestrator`**, **`session-memory-manager`**: Orkestrasi siklus hidup proyek secara berkelanjutan.

### Deskripsi
Panduan ahli untuk membangun dan memelihara design system UI yang skalabel. Mencakup design token dengan OKLCH dan `@theme` Tailwind v4, primitif komponen headless (Radix UI, **Base UI 1.x**), **registry shadcn/ui** untuk distribusi library komponen, CVA untuk varian type-safe, dan kepatuhan aksesibilitas WCAG 2.2.

### Kondisi Pemicu
- Membangun library komponen UI bersama dari awal.
- Menyiapkan design token (warna, tipografi, spacing) dengan Tailwind v4.
- Menerapkan prinsip Material Design 3 (M3) (https://m3.material.io/).
- Menggunakan primitif headless (Radix UI, Base UI 1.x) dengan styling kustom.
- Mendistribusikan komponen via format **registry shadcn/ui**.
- Mengaudit library komponen untuk kepatuhan aksesibilitas WCAG 2.2.
- Menegakkan standar kualitas `anti-slop` pada primitif komponen dan token visual.

### Kontrak Desain Komponen Anti-Slop
- **Nol Primitif Div-Soup**: Bangun komponen secara eksklusif menggunakan primitif headless aksesibel (Radix UI, Base UI 1.x) dengan HTML5 semantik (`<button>`, `<dialog>`, `<nav>`, `<input>`).
- **Kontrak Hierarki Visual & Pelapisan Permukaan**: Tegakkan tingkatan surface container yang tegas (Kanvas L0, Kartu L1, Terangkat L2, Overlay L3) dengan border solid 1px tajam (`border-border`) dan micro-shadow terarah (`shadow-xs`). Dilarang keras bayangan hitam buram 30px dan lingkaran neon mengambang tanpa dasar fisik.
- **Hukum Aksi Utama Tunggal**: Preset komponen wajib membatasi hanya satu varian CTA utama per tampilan; aksi sekunder dan tersier wajib menggunakan varian outline, tonal, atau ghost.
- **Tipografi Optik & Angka Tabular**: Judul harus default menggunakan tracking rapat (`tracking-tight`), eyebrow menggunakan tracking renggang (`tracking-wider`), dan semua komponen angka/metrik/harga wajib menerapkan `tabular-nums`.
- **Wajib 5 Status Komponen**: Setiap primitif komponen wajib mengekspor status: default, hover/active, cincin fokus keyboard `focus-visible:ring-2`, status loading/skeleton, dan status disabled/error.
- **Token Kontras Terjamin**: Semua token warna semantik wajib lolos rasio kontras WCAG 2.2 AA (≥ 4.5:1 teks, ≥ 3:1 komponen antarmuka) di mode terang maupun gelap.
- **Kepatuhan Skala Ketat**: Dilarang menggunakan nilai piksel sembarangan (`p-[13px]`); tegakkan token `@theme` yang terpadu.

### Fondasi Design Token (Tailwind v4 + OKLCH)
Definisikan semua token di CSS menggunakan direktif `@theme`. Gunakan warna OKLCH untuk tampilan P3 wide-gamut. Definisikan token semantik (`--color-primary`, `--color-surface`, `--color-border`) yang secara otomatis beradaptasi antara mode terang/gelap melalui `@variant dark`.

### Arsitektur Lengkap Material Design 3 (M3) (https://m3.material.io/)
Ketika menerapkan atau mengacu pada **Google Material Design 3 (Material You)**, tegakkan 8 pilar fondasi dan sistem token berikut:

#### 1. Arsitektur Token 3 Tingkat
M3 mengorganisasi token desain ke dalam tiga hierarki:
- **Reference Tokens (`md.ref.*`)**: Blok pembangun primitif yang menyimpan nilai mentah (misal `md.ref.palette.primary40: #6750A4`).
- **System Tokens (`md.sys.*`)**: Keputusan desain berbasis konteks yang beradaptasi otomatis antara tema terang/gelap (misal `md.sys.color.primary`, `md.sys.elevation.level2`, `md.sys.shape.corner-large`).
- **Component Tokens (`md.comp.*`)**: Atribut styling spesifik komponen (misal `md.comp.filled-button.container.color: var(--md-sys-color-primary)`).

#### 2. Ruang Warna HCT Algoritmik & Warna Dinamis
M3 menggantikan pencocokan warna RGB/HSL dengan **ruang warna HCT (Hue, Chroma, Tone)** yang perseptual seragam. Tone (0 hingga 100) menentukan luminansi absolut dan menjamin kepatuhan kontras WCAG secara matematis pada semua rona:
- Selisih $\Delta \text{Tone} \ge 40$ menjamin kontras $\ge 3:1$ (teks besar/grafis UI).
- Selisih $\Delta \text{Tone} \ge 50$ menjamin kontras $\ge 4.5:1$ (teks isi standar).

Ekstraksi warna dinamis dari seed color via `@material/material-color-utilities`:
```typescript
import { argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';

// Buat 5 palet tonal inti dari satu warna seed brand
const theme = themeFromSourceColor(argbFromHex('#6750A4'));
// Skema menghasilkan peran lengkap untuk mode terang dan gelap:
// theme.schemes.light.primary, theme.schemes.dark.primary
```

#### 3. 25+ Peran Warna & Tingkatan Surface Container
Dilarang menggunakan hex warna statis. Petakan elemen ke peran warna semantik M3:
- **Warna Aksen & Wadah**:
  - `primary` / `on-primary` (Tombol aksi utama/CTA kontras tinggi)
  - `primary-container` / `on-primary-container` (Wadah berbobot visual sedang-tinggi)
  - `secondary` / `on-secondary` (Filter chip, elemen aksen sekunder)
  - `secondary-container` / `on-secondary-container` (Indikator pil navigasi aktif)
  - `tertiary` / `on-tertiary` (Aksen kontras penyeimbang yang kreatif)
  - `tertiary-container` / `on-tertiary-container` (Callout, banner kontekstual)
  - `error` / `on-error` & `error-container` / `on-error-container` (Peringatan & error validasi)
- **Hierarki Surface Container Modern (Elevasi Tanpa Bayangan Tebal)**:
  M3 modern merekomendasikan **Surface Container Tiers** tonal alih-alih drop shadow tebal:
  - `surface-dim` (Tone 87 L / Tone 6 D): Latar belakang terdalam
  - `surface` (Tone 98 L / Tone 6 D): Permukaan dasar aplikasi
  - `surface-bright` (Tone 98 L / Tone 24 D): Permukaan kontras tinggi di mode gelap
  - `surface-container-lowest` (Tone 100 L / Tone 4 D): Wadah terendah pada kanvas gelap
  - `surface-container-low` (Tone 96 L / Tone 10 D): Kartu bersarang, pengelompokan list
  - `surface-container` (Tone 94 L / Tone 12 D): Wadah kartu default, dialog, bottom sheet
  - `surface-container-high` (Tone 92 L / Tone 17 D): Search bar melayang, menu popup
  - `surface-container-highest` (Tone 90 L / Tone 22 D): Overlay modal tingkat atas
- **Garis Batas (Borders & Outlines)**:
  - `outline`: Batas kontras tinggi (field teks, tombol unselected).
  - `outline-variant`: Pemisah halus (garis batas kartu, pemisah baris tabel).

#### 4. Tingkat Elevasi & Surface Tinting (Tingkat 0–5)
Elevasi menyampaikan kedalaman sumbu Z menggunakan **surface tinting** (warna primer yang ditumpangkan di atas surface) dipadukan dengan bayangan difus ambient:
- **Tingkat 0 (0dp)**: Permukaan datar, tint 0%, tanpa bayangan.
- **Tingkat 1 (1dp)**: Kartu resting, search bar, tint 5%, `box-shadow: 0 1px 3px rgba(0,0,0,0.12)`.
- **Tingkat 2 (3dp)**: Kartu saat di-hover, menu kecil, tint 8%, `box-shadow: 0 2px 6px rgba(0,0,0,0.15)`.
- **Tingkat 3 (6dp)**: Floating Action Button (FAB), tint 11%, `box-shadow: 0 4px 12px rgba(0,0,0,0.18)`.
- **Tingkat 4 (8dp)**: FAB saat ditekan/aktif, tint 12%, `box-shadow: 0 6px 16px rgba(0,0,0,0.20)`.
- **Tingkat 5 (12dp)**: Dialog modal, date/time picker, tint 14%, `box-shadow: 0 8px 24px rgba(0,0,0,0.24)`.

#### 5. Skala Tipografi (15 Baseline + 15 Emphasized)
M3 mendefinisikan 5 peran tipe dengan ukuran Large, Medium, Small serta tracking presisi:
- `display-large` (57px/64px -0.25 tracking) | `display-medium` (45px/52px) | `display-small` (36px/44px)
- `headline-large` (32px/40px) | `headline-medium` (28px/36px) | `headline-small` (24px/32px)
- `title-large` (22px/28px) | `title-medium` (16px/24px 0.15 tracking) | `title-small` (14px/20px 0.1 tracking)
- `body-large` (16px/24px 0.5 tracking) | `body-medium` (14px/20px 0.25 tracking) | `body-small` (12px/16px 0.4 tracking)
- `label-large` (14px/20px 0.1 tracking, weight 500) | `label-medium` (12px/16px 0.5 tracking) | `label-small` (11px/16px 0.5 tracking)

#### 6. Skala Bentuk & Radius Sudut
- `corner-none`: 0px (Gambar full-bleed, divider)
- `corner-extra-small`: 4px (Text field container, snackbar)
- `corner-small`: 8px (Chip, tooltip)
- `corner-medium`: 12px (Kartu, dialog kecil)
- `corner-large`: 16px (Navigation drawer, modal bottom sheet, FAB standar)
- `corner-extra-large`: 28px (Dialog modal penuh, date/time picker)
- `corner-full`: 9999px (Tombol bentuk pil, badge, search bar aktif)

#### 7. Kelas Ukuran Jendela Adaptif (Window Size Classes)
M3 membagi adaptasi tata letak berdasarkan lebar jendela:
- **Compact (< 600dp)**: Layar portrait ponsel. Navigation Bar (bawah 80dp), margin 16dp, tata letak 4-kolom.
- **Medium (600–839dp)**: Tablet & ponsel lipat. Navigation Rail (sisi 80dp), margin 24dp, tata letak 8-kolom.
- **Expanded (≥ 840dp)**: Desktop & tablet lanskap. Navigation Drawer permanen (280–360dp), margin 24dp, tata letak 12-kolom dengan multi-pane list-detail.

### Arsitektur Komponen
Gunakan pola Headless + Styled: primitif headless (Base UI/Radix) untuk aksesibilitas, gaya melalui Tailwind + CVA (class-variance-authority) untuk varian type-safe.

**Container Queries (`@container`)**: DILARANG keras menggunakan `@media` query (misal `md:`, `lg:`) untuk layout di dalam sebuah komponen. Gunakan **Container Queries (`@md:`, `@lg:`)** agar komponen dapat menyesuaikan diri dengan lebar pembungkusnya, bukan lebar layar secara keseluruhan. Ini membuat komponen Anda 100% *reusable*.

### Registry shadcn/ui — Komponen yang Dapat Didistribusikan (2026)
shadcn/ui v2 memperkenalkan sistem registry — distribusikan komponen Anda sebagai library yang dapat dibagikan sehingga orang lain dapat menginstalnya dengan `npx shadcn add [url] [komponen]`.

### Base UI 1.x — Primitif Aksesibilitas Tanpa Gaya
Base UI (dari tim MUI) adalah alternatif Radix UI untuk 2026 dengan dukungan native React 19. Sepenuhnya tanpa gaya — terapkan className/Tailwind apapun.

### Katalog 4 Pilar Komponen UI
1. **Input Controls (Tombol, Input, Select)**: Definisikan status visual (`default`, `hover`, `active`, `focus`, `disabled`, `error`). Tampilkan validasi inline on-blur (`aria-invalid`, `aria-describedby` via React Hook Form + Zod). Target sentuh minimal 44x44px.
2. **Navigasi (Navbar, Tab, Command Palette)**: Sediakan menu perintah `⌘K` dengan `cmdk`. Layout responsif (navigasi bawah di mobile, rail di tablet, sidebar penuh di desktop). Transisi halaman halus via `<Link viewTransition>` di Next.js 15.
3. **Informasi & Feedback (Toast, Skeleton, Empty State)**: Gunakan **Sonner** untuk toast (maksimal 3 bersamaan). Gunakan Skeleton sesuai tata letak untuk mencegah CLS dibanding spinner.
4. **Wadah & Layout (Card, Modal, Sheet)**: Dialog/Modal dengan penguncian scroll dan focus trapping otomatis (Base UI/Radix). Gunakan bottom sheet di mobile dan side sheet di desktop.

### Checklist Aksesibilitas WCAG 2.2
- Semua elemen interaktif memiliki indikator fokus yang terlihat.
- Kontras warna ≥ 4.5:1 (teks), ≥ 3:1 (komponen UI).
- Semua input form memiliki elemen `<label>` terkait.
- Navigasi keyboard berfungsi untuk semua interaksi.
- Modal menjebak fokus dan memulihkannya saat ditutup.
- Target sentuh ≥ 24×24px (persyaratan baru WCAG 2.2).
