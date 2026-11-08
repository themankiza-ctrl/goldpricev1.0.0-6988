## Bahasa Indonesia

### Integrasi Orkestrasi
Terhubung dan mengorkestrasi skill domain yang relevan:
- **`modern-web-guidance`**: Mengevaluasi fitur validasi form native (`:user-valid`, `:user-invalid`), token autofill, dan custom select.
- **`modern-css-native-expert`**: Memanfaatkan `field-sizing: content` untuk textarea dinamis dan umpan balik validasi CSS murni.
- **`design-system-architect`**: Menyediakan primitif kontrol form aksesibel, border input, dan token floating label.
- **`anti-slop`**: Melenyapkan pesan error samar, bug pengiriman ganda, dan status pending yang tidak ditangani.
- **`senior-frontend`**: Mengimplementasikan `useActionState`, `useOptimistic`, dan pengiriman form Server Actions di React 19.
- **`brainstorming`**, **`zero-to-prod-orchestrator`**, **`session-memory-manager`**: Eksekusi siklus hidup proyek secara terpadu.

### Deskripsi
Panduan tingkat produksi untuk membangun formulir yang kuat, aksesibel, dan ramah pengguna. Mencakup **React Hook Form v7+** dengan Zod/Valibot resolver, **validasi server-side** dengan `useActionState` + Zod, **wizard formulir multi-langkah**, **formulir dinamis** dari JSON Schema, **pola autofill-friendly**, **optimistic form submission**, **Conform** (progressive enhancement), dan **aksesibilitas formulir** (ARIA, pengumuman error).

### Kondisi Pemicu
Aktifkan skill ini ketika:
- Membangun formulir dengan validasi client-side (React Hook Form, Zod, Valibot).
- Mengimplementasikan validasi formulir server-side dengan React 19 Server Actions.
- Membuat wizard formulir multi-langkah dengan persistensi state.
- Membangun formulir dinamis dari definisi skema.
- Membuat formulir yang aksesibel (atribut ARIA, pengumuman error).

### Arsitektur Text Field Material Design 3 (M3) (https://m3.material.io/components/text-fields/overview)
M3 menetapkan dua format input utama (Filled dan Outlined) dengan animasi floating label dan indikator status:
- **Outlined Text Field**: Garis batas perimetral bersih (`border-outline`), label mengapung saat fokus atau terisi (`peer-focus:top-1.5 peer-focus:scale-75`).
- **Filled Text Field**: Latar belakang kontainer `surface-container-highest` dengan garis indikator aktif di bagian bawah (2px saat fokus).
- **Aksesibilitas & Ikon**: Dukungan ikon leading/trailing (misal tombol visibilitas kata sandi), helper text terikat via `aria-describedby`, dan error alert berkontras tinggi yang lolos uji WCAG.
### Arahan Anti-Slop Formulir
Standar nol toleransi untuk rekayasa formulir:
1. **Dilarang Menulis Pesan Error Samar**: Melarang pesan generik "Field tidak valid", "Input salah", atau "Terjadi kesalahan". Setiap aturan validasi wajib menjelaskan apa yang keliru dan cara memperbaikinya (misal: "Kata sandi minimal 8 karakter dan mengandung minimal satu angka").
2. **Kunci Double-Submission & Indikator Pending Aksesibel**: Tombol submit wajib dinonaktifkan selama proses pengiriman (`disabled={isSubmitting || isPending}`), menampilkan spinner inline, dan memiliki atribut `aria-busy="true"`.
3. **Pengikatan Error ARIA pada Field**: Setiap input yang berada dalam status error wajib menyematkan `aria-invalid="true"` dan `aria-describedby="{field}-error"`, serta membungkus pesan error dengan `role="alert"`.
4. **Hukum Perlindungan Input Pengguna**: Dilarang mengosongkan atau menghapus input pengguna saat validasi gagal atau server error. Biarkan data pengguna tetap ada agar mereka dapat memperbaikinya tanpa mengetik ulang dari awal.
5. **Paritas Kontrak Skema End-to-End**: Dilarang hanya mengandalkan validasi di sisi klien. Server action atau rute API wajib memvalidasi payload request terhadap skema Zod/Valibot yang identik.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Muse Wonder High`, `Composer 2.5 Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec form-validation-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_visual_audit`, `vibes_ast_query`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | LCP < 1.8s, INP < 100ms, CLS < 0.05, border tegas 1px, radius 3-tier (6px/8px/12px), `tabular-nums`, kontrak interaktif 5-state; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
