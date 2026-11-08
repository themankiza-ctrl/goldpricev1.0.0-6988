## Bahasa Indonesia

### Arahan Eksekutif & Kondisi Pemicu
**Sovereign Anti-Slop Directive** adalah standar tanpa toleransi yang mengatur seluruh tindakan agen AI di dalam ekosistem vibes-plug. AI slop menurunkan kepercayaan developer, menghabiskan token context, menggelembungkan codebase, dan memicu bug di produksi.

Anti-slop adalah **filter, bukan style guide**: filter ini tidak mendikte warna, font, atau layout Anda—arah kreatif tetap sepenuhnya milik Anda. Menghapus slop membersihkan kebiasaan klise AI, sementara **Liveliness Toolkit** memastikan produk akhir memiliki jiwa, karakter, dan ketegasan visual yang hidup, bukan menjadi tampilan yang steril.

**Kondisi Pemicu Universal:**
- **Setiap Pembuatan & Modifikasi Kode**: Setiap fungsi, komponen, atau file yang dibuat atau diubah agen.
- **Pekerjaan UI & Frontend**: Desain antarmuka, tata letak halaman, komponen, kartu, dashboard, dan gaya responsif.
- **Copywriting & Teks**: Judul, CTA, teks produk, dokumentasi, pesan commit, dan ringkasan PR.
- **Komentar Kode**: Komentar penjelasan, anotasi inline, dan docstring.
- **Quality Gates & Audit PR**: Review kode (`coderabbit`), pengujian mandiri (`autonomous-tdd-debugger`), dan hardening pra-rilis (`production-ready-hardener`).

---

### Protokol Dua Mode Operasi (Two Usage Modes)
1. **Mode 1: DURING (Pencegahan Real-Time Saat Bekerja)**:
   - Agen menerapkan 38 aturan secara aktif saat menulis kode, copy, dan UI.
   - Mencegah slop masuk ke codebase sejak awal.
   - Ditutup dengan laporan wajib **Delivery Gate**.
2. **Mode 2: AFTER (Audit & Remediasi Pasca Proyek Selesai)**:
   - Mengaudit proyek yang sudah ada tanpa mengubah file secara prematur.
   - Menghasilkan laporan audit bernomor: `anti-slop/audit-001-YYYY-MM-DD.md`.
   - Setiap temuan diberi nomor urut, pasal pelanggaran (`R-XX`), dan prioritas (Hard Gate = `HIGH`, Purpose-Gate = `MEDIUM`, Quality Lock = `LOW`).
   - Agen **wajib menunggu persetujuan manusia** atas nomor temuan yang ingin diperbaiki sebelum menyentuh kode.

---

### Kerangka 38 Aturan Wajib (3-Tier Rule Framework)

#### Tier 1: Hard Gate (Mutlak, Tanpa Pengecualian)
- **R-02 Copywriting**: Larangan mutlak tanda em dash (`—`) pada teks buatan AI. Gunakan koma, titik, atau titik dua.
- **R-03 Responsivitas Mobile**: Layout mobile wajib dirancang khusus dengan reflow continuous; target sentuh minimal **44x44px**; gunakan `100dvh`; dilarang ada overflow horizontal.
- **R-17 Data & Angka Autentik**: Dilarang mengarang statistik atau angka fiktif (`99.9% uptime`, `10,000 users`). Jika data tidak tersedia, jangan tampilkan angka atau gunakan `[REAL DATA]`.
- **R-18 Testimoni Autentik**: Dilarang membuat avatar AI, nama samaran, atau ulasan fiktif.
- **R-23 Konfirmasi Aset Visual**: Dilarang mengasumsikan logo/avatar final tanpa konfirmasi; gunakan penanda jujur `[LOGO]`.
- **R-24 Integritas Navigasi**: Dilarang menempatkan tautan di navbar menuju halaman/bagian yang tidak ada.
- **R-25 Kontras Warna (WCAG AA)**: Minimal 4.5:1 untuk teks normal; 3:1 untuk teks besar (≥18px). Validasi menggunakan script `contrast-check.py`.
- **R-26 Kelengkapan Elemen Interaktif**: Setiap tombol, link, dan dropdown wajib memiliki perilaku nyata atau dihapus. Dilarang ada tombol mati.
- **R-27 Tiga State UI Wajib**: Setiap tampilan data wajib memiliki state **Empty**, **Loading** (skeleton loader), dan **Error** (dengan tombol coba lagi).
- **R-28 FAQ Spesifik**: FAQ harus menjawab pertanyaan riil domain produk, bukan template klise.
- **R-32 Aksesibilitas Keyboard**: Semua kontrol interaktif harus dapat diakses via keyboard dan memiliki indikator fokus yang kontras (`focus-visible:ring-2`).
- **R-33 Larangan Patching File via Script**: Dilarang menambahkan fitur lewat script eksternal yang melakukan string-replace pada file CSS/TSX.
- **R-34 Seluruh Tema Wajib Berfungsi Penuh**: Jika menyediakan toggle tema, mode Terang dan Gelap wajib 100% berfungsi dan lulus uji kontras.
- **R-35 Verifikasi Sebelum Penyerahan (Click-Through)**: Wajib menjalankan aplikasi dan mencatat bukti click-through setiap elemen interaktif sebelum dinyatakan selesai.
- **R-36 Larangan Klaim Kepatuhan Fiktif**: Dilarang mengarang lencana sertifikasi (SOC 2, ISO 27001) atau klaim akselerasi fiktif.
- **R-37 Arah Desain Wajib**: Wajib bersumber dari `DESIGN.md`. Jika tanpa arah, wajib dideklarasikan sebagai *"Draft without direction"* dengan dial **ENERGY 1 / RHYTHM 1 / MOTION 1**.
- **R-38 Konten Nyata atau Placeholder Jujur**: Seluruh konten harus berupa data nyata atau penanda eksplisit (`[REAL DATA]`).

#### Tier 2: Purpose-Gate (Boleh Digunakan Hanya Jika Ada Tujuan Tertulis & Batasan Dosis)
- **R-01 Warna & Gradien**: Gradien biru-ungu/neon dilarang sebagai default; hanya boleh untuk pemisah hierarki dengan alasan tertulis.
- **R-04 Ikon**: Ikon sparkle, bintang, orb, dan robot dilarang sebagai default.
- **R-06 Tipografi**: Font monospace berlebihan dan judul uppercase dengan tracking renggang dilarang tanpa alasan keterbacaan.
- **R-07 Latar Belakang**: Grid titik, garis blueprint, dan grafis kotak-kotak dilarang sebagai shortcut visual.
- **R-08 Ritme Spasi**: Spasi seragam di setiap bagian dilarang; gunakan variasi ritme vertikal.
- **R-09 Variasi Layout**: Layout formulaik klise (Hero -> 3 kartu -> 3 langkah -> Bento grid -> Pricing -> FAQ) dilarang.
- **R-10 Batas Glassmorphism**: Efek frosted glass dibatasi **maksimal 1-2 elemen** per halaman (misalnya hanya header sticky).
- **R-11 Batas Border Radius**: Radius pil (`rounded-full`) dilarang pada tombol persegi panjang atau kartu. Gunakan skala 6-8px untuk kontrol dan 12-16px untuk kartu.
- **R-12 Shadow Membumi**: Shadow melayang berwarna neon dilarang; gunakan border 1px solid dan elevasi halus.
- **R-13 Batas Glow**: Efek pendaran neon dibatasi maksimal 1-2 elemen fokus.
- **R-14 Animasi Berbobot**: Animasi berulang tanpa henti (kartu melayang) dilarang; animasi transisi wajib cepat (150-250ms).
- **R-15 CTA Berorientasi Aksi**: Ganti CTA generik (*Get Started*, *Learn More*) dengan instruksi spesifik (*Buat akun gratis*, *Baca dokumentasi API*).
- **R-16 Eliminasi Buzzword**: Hapus kata-kata klise AI (*unlock, elevate, seamless, revolutionize, game-changer*).
- **R-19 Visual Kontekstual**: Ilustrasi 3D blob generik dilarang; gunakan screenshot produk asli atau diagram teknis.
- **R-20 Dekorasi Fungsional**: Garis strip vertikal di tepi kartu dan panah dekoratif (`→`) dilarang jika tanpa fungsi.
- **R-21 Demo Produk Nyata**: Menjual alat tanpa memperlihatkan interface nyata dilarang.
- **R-22 Alasan Mode Gelap**: Mode gelap harus didasarkan pada karakter brand, bukan sekadar latah default.
- **R-29 Lencana Kapsul**: Lencana pil "AI Powered" dengan dot berkedip dilarang kecuali mewakili status runtime asli.
- **R-30 Eyebrow Badge Redundan**: Lencana kecil di atas H1 yang mengulang kata-kata judul dilarang.
- **R-31 Larangan Separator Banner Kode**: Garis pembatas dekoratif (`// =====================`) pada komentar kode dilarang.

#### Tier 3: Quality Locks & Craftsmanship (C-1 sampai C-5)
- **C-1 Intentionality**: Setiap keputusan desain dan kode memiliki alasan yang dapat dipertanggungjawabkan.
- **C-2 Kelengkapan Fungsional**: Setiap kontrol berfungsi utuh tanpa stub setengah jadi.
- **C-3 Komposisi Berbasis Konten**: Setiap seksi ada karena dibutuhkan produk, bukan sekadar pengisi template.
- **C-4 Ketahanan Sistem**: UI bertahan pada seluruh 3 state (empty, loading, error), semua tema, dan navigasi keyboard.
- **C-5 Bukti Di Atas Klaim**: Fakta yang disajikan terverifikasi secara nyata.

---

### Liveliness Toolkit: 3 Dial, 5 Tuas Visual & Protokol Design Read

Filter anti-slop bertugas membuang kebiasaan buruk AI, namun membuang slop saja akan meninggalkan kekosongan (*void*) yang biasanya diisi model AI dengan tampilan generik yang steril dan membosankan. Karakter visual wajib **ditambahkan secara sengaja**:

#### 3 Dial Karakter (Skala Diskrit 1 sampai 3):
1. **ENERGY (1-3)**:
   - Skala 1 (Tenang): Linear, GOV.UK (Monokromatik, permukaan tenang, aksen tunggal hemat, banyak whitespace).
   - Skala 2 (Seimbang): Stripe, Vercel (Kontras tajam, dual-tone terkontrol, titik fokus terarah).
   - Skala 3 (Berani): Awwwards, portofolio kreatif (Aksen saturasi tinggi, tipografi dramatis).
2. **RHYTHM (1-3)**:
   - Skala 1 (Seragam): Grid linear kaku dan ritme membaca yang terprediksi.
   - Skala 2 (Konsisten Berbobot): Grid konsisten dengan variasi seksi yang memiliki tujuan.
   - Skala 3 (Asimetris): Tata letak editorial dinamis, kartu modular bergantian.
3. **MOTION (1-3)**:
   - Skala 1 (Utilitarian): Efek hover instan (100ms) tanpa animasi berlebihan.
   - Skala 2 (Halus Taktil): Scroll-reveal, transisi tactile press (`scale-[0.98]`, 150-250ms).
   - Skala 3 (Koreografi): Koreografi sticky pin, parallax bermakna, fisika pegas fluida.

*Mengapa 3 skala dan bukan 10? Peninjau manusia dan agen AI dapat memverifikasi kondisi biner: "apakah bagian ini seragam atau bervariasi?" Skala diskrit 1-3 membuat kepatuhan dapat ditegakkan secara absolut tanpa perdebatan subjektif.*

#### 5 Tuas Visual (Visual Levers):
1. **Satu Titik Fokus per Layar**: Tepat satu elemen paling penting di setiap layar; elemen lain mengalah.
2. **Kontras Hirarkis**: Ukuran, bobot, dan warna dibedakan secara sengaja untuk memandu mata pengguna.
3. **Whitespace Struktural**: Ruang kosong digunakan aktif untuk pemisah dan ritme, bukan sisa layout.
4. **Satu Aksen Terukur**: Tepat satu warna aksen pada momen kunci. Tanpa aksen = steril; aksen di mana-mana = slop.
5. **Motif Identitas**: Satu pola berulang, gestur, atau tipografi spesifik yang membuat desain autentik milik produk.

#### Protokol Deklarasi Design Read:
Sebelum menghasilkan kode UI atau layout, deklarasikan satu baris:
> `Reading this as: <jenis halaman> untuk <audiens>, dalam gaya <bahasa visual>, dial <ENERGY/RHYTHM/MOTION>.`

#### 4 Arsitektur Desain Teruji:
1. **Archetype A: High-Precision Developer Tooling** (Linear, Raycast, Vercel)
   - Permukaan matte gelap (`bg-neutral-950`), border 1px solid, tombol shortcut keyboard (`<kbd>⌘K</kbd>`), font mono untuk metadata, padding ringkas.
2. **Archetype B: Refined SaaS & FinTech** (Stripe, Ramp, Mercury)
   - Latar belakang bersih, kontras display header tegas, angka tabular (`tabular-nums`), ritme spasi 4px/8px, data transaksi otentik.
3. **Archetype C: Human Interface & Modern Editorial** (Apple HIG, Notion, Arc)
   - Nuansa hangat netral (stone/slate), padding lega, feedback sentuhan fisik (`active:scale-[0.98]`), ikonografi SVG konsisten.
4. **Archetype D: High-Density Analytics & Operations** (Datadog, Cloudflare)
   - Kepadatan informasi tinggi, breadcrumbs bertingkat, sparklines kontras tinggi, palet aman untuk buta warna, nol dekorasi sia-sia.

---

### Protokol Wajib Delivery Gate

Sebelum menyelesaikan tugas coding atau UI, Anda **WAJIB** menyertakan 4 blok laporan ini:
1. **Konfirmasi Dial & Archetype**: Nama archetype dan nilai dial (ENERGY/RHYTHM/MOTION).
2. **Checklist Kepatuhan 38 Aturan**: Evaluasi PASS/FAIL pada Hard Gate, Purpose-Gate, dan Quality Locks.
3. **Bukti Click-Through Elemen Interaktif (R-35)**: Daftar elemen yang telah dicoba langsung beserta perilakunya.
4. **Keputusan Akhir (Verdict)**: PASS atau FAIL.

---
