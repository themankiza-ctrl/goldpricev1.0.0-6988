## Bahasa Indonesia

### Integrasi Orkestrasi
Terhubung dan mengorkestrasi skill domain yang relevan:
- **`modern-web-guidance`**: Menegakkan paradigma navigasi aksesibel terstandarisasi, kontrol form native, dan input web modern.
- **`apple-ecosystem-expert`**: Implementasi langsung standar iOS 18+, iPadOS 18+, macOS 15 Sequoia, Dynamic Island, dan Safari WebKit.
- **`visual-ui-auditor`**: Mengaudit hierarki visual hasil render terhadap prinsip HIG, letter-spacing optik, dan border 1px.
- **`design-system-architect`**: Mengimplementasikan skala squircle kontinu Apple, material permukaan, dan token tipografi semantik.
- **`tailwind-expert`**: Memetakan tracking huruf optik HIG, skala Dynamic Type, dan safe area ke utilitas Tailwind v4.
- **`ui-ux-pro-max`**: Kecerdasan desain lintas pola baca F/Z, distribusi warna 60-30-10, dan aturan target sentuh.
- **`anti-slop`**: Melenyapkan avatar palsu, gradien generik ungu-sian, dan tombol div-soup non-semantik.
- **`brainstorming`**, **`zero-to-prod-orchestrator`**, **`session-memory-manager`**: Orkestrasi siklus hidup proyek secara terpadu.

### Deskripsi
Panduan rekayasa dan desain otoritatif mendalam untuk **Apple Human Interface Guidelines (HIG)** (`https://developer.apple.com/design/human-interface-guidelines`) di seluruh platform iOS 18+, iPadOS 18+, macOS 15 Sequoia, visionOS 2+, watchOS 11+, dan tvOS 18+. Mencakup triad inti (Hierarchy, Harmony, Consistency), 3 Tema Desain Apple (Clarity, Deference, Depth), 6 Prinsip Desain Fondasional, Warna Semantik & Elevasi Dark Mode, Material & Liquid Glass, Tipografi SF & Dynamic Type, Navigasi & Modalitas, SF Symbols 6, serta sintesis perbandingan dengan Google Material Design 3 (M3).

### Kondisi Pemicu
- Meninjau atau mengkritik desain antarmuka terhadap standar Apple HIG atau Material 3.
- Mengambil keputusan arsitektural tentang skala tipografi, penggunaan warna semantik, atau hierarki tata letak.
- Merancang aplikasi lintas platform (iOS, iPadOS, macOS, visionOS, Android, web) yang mempertahankan konvensi native.
- Mengimplementasikan presentasi Dynamic Island, Live Activities, atau toolbar floating glass.
- Mengevaluasi apakah antarmuka terasa "premium native" atau "amatir generik".
- Menegakkan batas minimum target sentuh (44×44pt di iOS, 60×60pt di visionOS, 28×28pt di macOS).

---

### 3 Tema Desain Inti Apple HIG

Bahasa desain Apple berakar pada tiga tema utama yang melandasi setiap interaksi:

#### 1. Kejelasan (Clarity)
- **Keterbacaan Prima**: Teks terbaca jelas di semua ukuran dengan leading dan tracking optik yang proporsional.
- **Ikon yang Terang**: Ikon dan simbol visual dirancang presisi, lugas, dan seimbang.
- **Dekorasi yang Fungsional**: Ornamen dan aksen visual bersifat halus dan murni melayani fungsionalitas.
- **Didorong oleh Konten**: Ruang negatif, warna, font, dan kontrol menonjolkan konten penting dan mengomunikasikan status interaksi.

#### 2. Penghormatan pada Konten (Deference)
- **Konten adalah yang Utama**: Antarmuka tidak pernah bersaing dengan konten pengguna. Gerakan fluida dan arsitektur visual yang jernih membantu pengguna memahami dan berinteraksi tanpa distraksi.
- **Kanvas Luas & Bersih**: Konten mengisi layar dari tepi ke tepi. Efek translusensi dan blur memberikan petunjuk konteks tanpa menutupi konten.
- **Menghilangkan Bezel & Shadow Tebal**: Singkirkan border tebal kaku, drop shadow hitam pekat, dan gradien mencolok.

#### 3. Kedalaman Visual & Spasial (Depth)
- **Lapisan Visual yang Hidup**: Lapisan bertingkat dan fisika gerakan yang realistis menghadirkan vitalitas dan kepuasan interaksi.
- **Petunjuk Sentuhan & Spasial**: Sentuhan, hover pointer, dan konvergensi spasial membentuk model fisik yang intuitif.
- **Material Berkonteks**: Efek kaca translusen dan vibransi mencerminkan posisi pengguna dalam hierarki navigasi.

---

### 6 Prinsip Desain Fondasional Apple

1. **Integritas Estetika (Aesthetic Integrity)**: Tampilan visual dan perilaku menyatu selaras dengan fungsi aplikasi. Aplikasi produktivitas mengutamakan kontrol subtil agar pengguna fokus bekerja; aplikasi media dan game menghadirkan pengalaman grafis yang imersif.
2. **Konsistensi (Consistency)**: Kepatuhan pada standar sistem, ikon familiar, gaya teks terstandarisasi, dan perilaku komponen yang dapat diprediksi. Pengguna memanfaatkan pengalaman platform yang sudah mereka miliki.
3. **Manipulasi Langsung (Direct Manipulation)**: Berinteraksi langsung dengan objek di layar (mencubit untuk zoom, menyeret list, memutar gambar, atau gaze + pinch di visionOS) alih-alih melalui kontrol terpisah.
4. **Umpan Balik (Feedback)**: Konfirmasi instan atas aksi pengguna melalui mikro-animasi visual, suara sistem, dan haptik sensorik (impact, notifikasi, seleksi).
5. **Metafora (Metaphors)**: Memanfaatkan konsep fisik dunia nyata (lembar sheet, kartu bertumpuk, halaman buku, audio spasial, jendela desktop) agar interaksi digital terasa alami.
6. **Kendali Pengguna (User Control)**: Pengguna — bukan sistem atau AI otomatis — memegang kendali mutlak. Pastikan keputusan dapat dibatalkan (undo/cancel), dan cegah kejutan aksi destruktif tanpa konfirmasi.

---

### Fondasi: Warna Semantik, Material, Tipografi & Tata Letak

#### 1. Warna Semantik & Elevasi Dark Mode
Apple HIG menerapkan token warna semantik yang secara dinamis beradaptasi antara Mode Terang dan Mode Gelap:
- **Tingkatan Teks (Label)**:
  - `label`: Hitam pekat di Mode Terang, Putih 100% di Mode Gelap.
  - `secondaryLabel`: Opasitas 60% untuk subjudul dan informasi pendukung.
  - `tertiaryLabel`: Opasitas 30% untuk placeholder dan teks pembantu.
  - `quaternaryLabel`: Opasitas 18% untuk watermark dan pemisah dekoratif.
- **Elevasi Sumbu-Z Mode Gelap**:
  Pada Mode Gelap, semakin tinggi elevasi elemen di sumbu Z, semakin terang warna latar belakangnya (L0 Kanvas: `#000000` -> L1 Kartu: `#1C1C1E` -> L2 Popover/Modal: `#2C2C2E` -> L3 Floating: `#3A3A3C`). Hal ini menciptakan kedalaman alami tanpa bayangan hitam pekat.

#### 2. Material & Liquid Glass
Antarmuka Apple modern membangun kedalaman melalui material tembus pandang dinamis:
- **Ultra Thin & Thin Material**: Overlay navigasi dan bilah pencarian halus.
- **Regular Material**: Kontainer default sheet modal, floating tab bar, dan segmented card.
- **Thick & Ultra Thick Material**: Kontrol elevasi tinggi dan widget dengan latar belakang kontras tinggi.
- **Formula CSS Liquid Glass**: `backdrop-filter: blur(20px) saturate(180%)` dengan border translusen 1px (`rgba(255, 255, 255, 0.2)`).

#### 3. Tipografi San Francisco & Skala Dynamic Type Apple
Keluarga font SF menggunakan ukuran optik: **SF Pro Text** untuk ukuran `< 20pt` (tracking lebih renggang, x-height lebih tinggi) dan **SF Pro Display** untuk ukuran `≥ 20pt` (tracking lebih rapat, proporsi elegan).

- **Large Title**: 34pt / Leading 41pt (Judul besar yang menciut saat di-scroll).
- **Title 1**: 28pt / Leading 34pt.
- **Title 2**: 22pt / Leading 28pt.
- **Title 3**: 20pt / Leading 25pt.
- **Headline**: 17pt / Leading 22pt (Semibold, penekanan teks tubuh).
- **Body**: 17pt / Leading 22pt (Regular, teks konten utama).
- **Callout**: 16pt / Leading 21pt.
- **Subheadline**: 15pt / Leading 20pt.
- **Footnote**: 13pt / Leading 18pt.
- **Caption 1 & 2**: 12pt / 11pt.
- **Invarian Angka Tabular**: Wajib menggunakan `font-variant-numeric: tabular-nums` (SwiftUI `.monospacedDigit()`) pada seluruh nilai metrik, timer, kurs, dan harga agar angka tidak berguncang secara horizontal.

#### 4. Target Sentuh & Kelengkungan Sudut Squircle
- **Batas Minimum Target Sentuh**:
  - **iOS & iPadOS**: Minimal **44×44pt** (meskipun ukuran visual tombol lebih kecil, area tap wajib diperluas).
  - **visionOS**: Minimal **60×60pt** area interaksi dengan bounds visual 44pt.
  - **macOS**: Minimal **28×28pt** target kursor mouse (20pt untuk toolbar mikro).
  - **watchOS**: Minimal **38×38pt** area sentuh selebar baris.
- **Squircle Kontinu (Superellipse)**:
  Apple tidak menggunakan busur lingkaran standar, melainkan kurva superellipse kontinu ($n \approx 4$) yang menghindari patahan visual di titik pertemuan garis lurus dan busur (`corner-shape: squircle` / SwiftUI `.clipShape(.rect(cornerRadius: 18, style: .continuous))`).

---

### Pola Navigasi & Arsitektur Komponen

#### 1. Arsitektur Navigasi
- **Navigasi Hierarkis (`NavigationStack`)**:
  - Tumpukan drill-down satu kolom.
  - Bilah navigasi atas otomatis memuat tombol kembali dengan judul layar sebelumnya.
  - Gestur geser dari tepi kiri (edge swipe) wajib berfungsi mulus tanpa interupsi.
- **Navigasi Sejajar / Peer (`TabView`)**:
  - 3 hingga 5 tab utama di bagian bawah layar.
  - Berubah menjadi kapsul kaca melayang di iOS 18/visionOS, atau bertransformasi menjadi sidebar di iPadOS 18 dan macOS.
- **Split View (`NavigationSplitView`)**:
  - 2 kolom (Sidebar + Detail) atau 3 kolom (Sidebar + Daftar Konten + Detail).
  - Mendukung sidebar yang dapat disembunyikan/ditampilkan dengan ikon sistem standar.

#### 2. Modalitas & Detents
- **Sheet Modal (`.sheet`)**:
  - Presentasi kontekstual yang mempertahankan latar belakang.
  - Detents standar: `.medium` (setengah layar) dan `.large` (layar penuh).
  - Dilengkapi indikator grabber yang jelas dan dapat ditutup dengan gestur tarik ke bawah.
- **Full Screen Cover (`.fullScreenCover`)**:
  - Dikhususkan untuk alur yang memerlukan penyelesaian atau pembatalan eksplisit (misal: scanner dokumen, kamera, checkout pembayaran).
- **Dialog Konfirmasi (Action Sheet)**:
  - Menu aksi kontekstual yang muncul dari bawah atau titik tap.
  - Aksi destruktif diwarnai merah dengan konfirmasi kedua wajib.

#### 3. Presentasi Dynamic Island (iOS 18+)
Dynamic Island beradaptasi dalam 4 status presentasi:
1. **Compact**: Sisi kiri (Leading) memuat ikon entitas, sisi kanan (Trailing) memuat metrik real-time.
2. **Minimal**: Tampil saat beberapa Live Activities berjalan bersamaan (lingkaran terpisah di samping pil utama).
3. **Expanded**: Terbuka saat ditekan lama, membagi area menjadi leading, trailing, center, dan aksi bawah.
4. **Lock Screen & StandBy**: Menampilkan banner kartu kontras tinggi di layar kunci.

#### 4. Sistem Tombol & Peran Sistem
- **Filled (`.borderedProminent`)**: Tepat SATU tombol utama per layar (`bg-apple-system-blue text-white`).
- **Tinted (`.bordered`)**: Tombol aksi sekunder dengan latar belakang berona lembut dan teks berwarna aksen.
- **Gray (`.bordered` neutral)**: Tombol utilitas netral untuk filter atau aksi pendukung.
- **Plain (`.borderless`)**: Tombol teks murni atau ikon di dalam tabel dan toolbar.
- **Peran Destruktif**: Berwarna merah sistem (`--apple-system-red`) untuk operasi penghapusan permanen.

#### 5. SF Symbols 6
Lebih dari 6.000 simbol vektor dengan 9 bobot dan 3 skala:
- **Mode Render**: `Monochrome`, `Hierarchical` (gradasi opasitas satu warna), `Palette` (warna berbeda per layer), dan `Multicolor` (warna semantik bawaan sistem).
- **Animasi Simbol**: `Bounce`, `Scale`, `Pulse`, `Variable Color`, `Replace`, `Breathe`, `Disappear`.

---

### Sintesis Komparatif: Apple HIG vs Google Material Design 3 (M3)

| Dimensi | Apple Human Interface Guidelines (HIG) | Google Material Design 3 (M3) |
| :--- | :--- | :--- |
| **Filosofi Inti** | Content-First, Deference, Kejelasan, Kedalaman | Ekspresif, Adaptif, Personalisasi Dinamis (Material You) |
| **Elevasi & Kedalaman** | Material Translusen, Liquid Glass, Pencerahan Sumbu-Z Dark Mode | Tingkatan Tonal Surface Container Berbasis Algoritma |
| **Sistem Warna** | Pasangan Warna Semantik (Light/Dark) + Tint Sistem | Ruang Perseptual HCT (Hue, Chroma, Tone) dari Warna Seed |
| **Tipografi** | SF Pro (Ukuran optik Text & Display) + New York | Roboto & Roboto Flex (Sumbu variabel: weight, width, optical size) |
| **Ikonografi** | SF Symbols 6 (Hierarkis, Palet, Animasi Variabel) | Material Symbols (Sumbu variabel: Weight, Fill, Grade, Opsz) |
| **Target Sentuh Minimal** | 44×44pt (iOS) / 60×60pt (visionOS) / 28×28pt (macOS) | Disarankan 48×48dp (Batas fisik minimal 24×24dp) |
| **Kelengkungan Sudut** | Continuous Squircle / Superellipse ($n \approx 4$) | Skala Radius Geometris Eksplisit (0, 4, 8, 12, 16, 28, 9999px) |
| **Navigasi Utama** | Bottom Tab Bar (iOS) / Morphing Sidebar (iPadOS) | Navigation Bar (Bawah 80dp) / Navigation Rail (Sisi 80dp) |

---

### 20 Checklist Audit Kepatuhan Apple HIG

- [ ] 1. **Hukum Single Primary CTA**: Tepat satu tombol primer filled per layar. Aksi sekunder menggunakan tinted, gray, atau plain.
- [ ] 2. **Dimensi Target Sentuh**: Seluruh elemen interaktif memiliki area sentuh minimal `44×44pt` di iOS/iPadOS dan `28×28pt` di macOS.
- [ ] 3. **Kepatuhan Dynamic Type**: Elemen teks merespons perubahan ukuran font sistem tanpa terpotong atau tumpang tindih.
- [ ] 4. **Angka Tabular**: Seluruh metrik, harga, counter, dan timer menerapkan `font-variant-numeric: tabular-nums`.
- [ ] 5. **Proteksi Safe Area Inset**: Header atas dan navigasi bawah memperhitungkan `env(safe-area-inset-top)` dan `env(safe-area-inset-bottom)`.
- [ ] 6. **Elevasi Permukaan Dark Mode**: Permukaan sumbu Z yang lebih tinggi menjadi lebih terang pada Mode Gelap (`#000000` -> `#1C1C1E` -> `#2C2C2E`).
- [ ] 7. **Kontras Teks WCAG AA**: Teks tubuh memenuhi rasio kontras ≥ 4.5:1; judul besar dan kontrol interaktif ≥ 3.0:1.
- [ ] 8. **Diferensiasi Tanpa Warna Tunggal**: Status, peringatan, dan badge menyertakan ikon atau label teks, tidak semata-mata mengandalkan warna.
- [ ] 9. **Kurva Pegas Interaktif**: Animasi menggunakan fisika pegas interaktif yang dapat diinterupsi (`response: 0.35s`, `dampingRatio: 0.82`).
- [ ] 10. **Alternatif Reduce Motion**: Mengakomodasi preferensi `prefers-reduced-motion` dengan mengganti slide spasial menjadi transisi fade halus.
- [ ] 11. **Liquid Glass & Translusensi**: Bilah navigasi melayang menerapkan `backdrop-filter: blur(20px) saturate(180%)`.
- [ ] 12. **Sudut Squircle Kontinu**: Kartu, dialog, dan tombol menerapkan kelengkungan superellipse kontinu tanpa sudut patah.
- [ ] 13. **Gestur Navigasi Hierarkis**: Gestur geser dari tepi kiri untuk kembali (swipe back) tidak pernah diblokir atau diinterupsi.
- [ ] 14. **Detent Sheet & Grabber**: Sheet modal bawah menyediakan detent `.medium` dan `.large` dengan pegangan grabber yang jelas.
- [ ] 15. **Umpan Balik Haptik Sensorik**: Aksi penting memicu haptik yang sesuai (impact saat tap tombol, notifikasi sukses/gagal).
- [ ] 16. **Ergonomi Dynamic Island**: Live Activities menyediakan tata letak compact leading/trailing, minimal, dan expanded.
- [ ] 17. **Adaptasi Pointer iPadOS**: Kontrol interaktif bereaksi terhadap hover kursor dengan sorotan background atau efek magnetik.
- [ ] 18. **Integrasi SF Symbols**: Ikon menggunakan SF Symbols dengan bobot, skala, dan mode rendering semantik yang konsisten.
- [ ] 19. **Keamanan Aksi Destruktif**: Operasi penghapusan permanen berwarna merah sistem dan mewajibkan dialog konfirmasi sekunder.
- [ ] 20. **Standar Kerapian Anti-Slop**: Nol gradien ungu-sian AI klise, nol tombol pill tanpa style, dan kontrak interaktif 5-state lengkap.

---

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Muse Wonder High`, `Composer 2.5 Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec hig <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_visual_audit`, `vibes_ast_query`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Target sentuh minimal 44×44pt, border tegas 1px, radius squircle kontinu, `tabular-nums`, kontrak interaktif 5-state; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
