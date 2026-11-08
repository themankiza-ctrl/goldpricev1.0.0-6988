## Bahasa Indonesia

### Direktif Eksekutif & Paradigma UI Efemeral (Pergeseran 2026)
Aplikasi web konvensional merender template statis yang telah dikompilasi sebelumnya. Bahkan chatbot AI modern sebagian besar masih menghasilkan teks markdown pasif atau diagram statis. Di era Gemini 4 (fallback: Gemini 3.8 Flash) / Claude 5.5 (fallback: Claude Opus 4.6) / Muse Wonder, arsitektur ini sudah usang untuk kebutuhan coding tingkat lanjut dan alur kerja agen otonom.

**Generative UI Efemeral** adalah paradigma arsitektur di mana antarmuka:
1. **Disintesis Secara Instan (On-the-fly)**: Dihasilkan secara dinamis berdasarkan konteks kueri pengguna, topologi data yang mendasari, dan beban kognitif pengguna.
2. **Streaming & Progresif**: Mengeluarkan kerangka pemuatan (*skeleton*) optimistik dalam hitungan milidetik dari token alat pertama, melakukan streaming metrik angka secara bertahap, dan menghidrasi komponen interaktif.
3. **Fana (Transient) Secara Bawaan**: Hidup di dalam aliran percakapan aktif. Begitu keputusan diambil atau konteks berpindah, widget menyusut menjadi lencana audit ringkas atau diarsipkan ke checkpoint sesi (`session-memory-manager`).
4. **Dua Arah & Dapat Dioperasikan (Bidirectional)**: Interaksi pengguna di dalam widget (memilih tanggal, menggeser slider harga, mengisi formulir) mengirimkan aksi bertipe kembali ke loop penalaran LLM tanpa *refresh* halaman.

### Integrasi Orkestrasi
- **Model AI Hulu & Protokol Transport**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `gemini-agent-booster`, `vercel-ai-sdk-expert`.
- **Presentasi Frontend & Tata Letak**: `senior-frontend`, `nextjs-app-router-expert`, `design-system-architect`, `tailwind-expert`, `modern-css-native-expert`.
- **Standar Kualitas & Anti-Slop**: `anti-slop`, `visual-ui-auditor`, `ui-ux-pro-max`, `structured-output-contracts`.
- **Adaptasi Emosional & Kognitif**: `affective-computing-emotion-ai`, `voice-ai-realtime-agent`.
- **Siklus Hidup & Keamanan**: `prompt-injection-firewall`, `session-memory-manager`, `zero-to-prod-orchestrator`.

---

### 5 Topologi Arsitektur UI Efemeral

```
┌────────────────────────────────────────────────────────────────────────┐
│               ALUR TOPOLOGI: GENERATIVE UI EFEMERAL 2026               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Pemanggilan Alat LLM ──► 2. Skeleton Optimis (<WidgetSkeleton />)   │
│                             │                                          │
│                             ▼                                          │
│ 3. StreamableValue Progresif ──► 4. RSC Interaktif Terhidrasi Penuh    │
│                                  │                                     │
│                                  ▼                                     │
│ 5. Interaksi User (Klik/Slider) ──► 6. Umpan Balik Server Action       │
│                                  │                                     │
│                                  ▼                                     │
│                              7. Giliran Penalaran LLM Berikutnya       │
└────────────────────────────────────────────────────────────────────────┘
```

#### 1. Streaming RSC Progresif Server-Side (`createStreamableUI` + React 19)
Server mencegat eksekusi alat LLM dan langsung memancarkan skeleton optimistik ke klien. Selama data diselesaikan secara paralel, nilai streamable memompa angka secara langsung, dan berakhir pada komponen interaktif yang utuh.

#### 2. Dispatcher Pemanggilan Alat Sisi Klien (`useChat` + `toolInvocations`)
Untuk aplikasi berskala tinggi pada edge node, pemanggilan alat LLM memancarkan payload JSON terstruktur melalui data stream standar (`createDataStreamResponse`). Router klien menyelesaikan komponen dari registri bertipe secara dinamis.

#### 3. Orkestrasi Tata Letak Multi-Slot Dinamis (Mesin Layout AI)
Alih-alih men-streaming satu kartu terisolasi, LLM memancarkan manifes tata letak (`LayoutManifest`: *split-master*, *masonry-grid*, *dashboard-3col*) dan men-streaming beberapa widget secara bersamaan ke slot yang ditentukan (`headerSlot`, `primarySlot`, `secondarySlot`, `actionSlot`).

#### 4. Loop Aksi Umpan Balik Tertutup (Closed-Loop Feedback)
Komponen efemeral tidak bersifat *read-only*. Mengklik opsi atau menggeser nilai memicu Server Action React 19 bertipe yang memperbarui state percakapan dan memicu kembali pipeline agen tanpa kehilangan konteks aliran.

#### 5. Adaptasi Afektif & Kognitif
Terkoneksi dengan `affective-computing-emotion-ai`. Jika `AffectVector` pengguna mendeteksi kebingungan atau stres tinggi, mesin antarmuka menyederhanakan kepadatan visual:
- Beralih dari multi-tab kompleks ke kartu fokus keputusan metrik tunggal.
- Memperbesar ukuran teks dan target sentuh tombol.
- Menonaktifkan animasi transisi agar tata letak tampil instan dan jernih.

---

### Kontrak Hierarki Visual Anti-Slop pada UI Efemeral
Seluruh komponen efemeral wajib mematuhi **Pilar 7 Anti-Slop**:
1. **Pembatasan Kontainer Permukaan**: Bungkus widget dalam wadah Level 1 dengan border 1px yang tegas:
   `bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden`.
2. **Skala Radius 3-Tingkat**:
   - `rounded-lg` (8px) untuk tombol, input, dan badge.
   - `rounded-xl` (12px) untuk permukaan kartu dan panel widget.
   - `rounded-2xl` (16px) untuk wadah modal dan sheet generatif utama.
3. **Irama Tipografi Baku**:
   - Eyebrow Kategori: `text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400`.
   - Judul Utama: `text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100`.
   - Nilai Metrik & Saldo: `font-mono text-xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 tabular-nums`.
   - Teks Pendukung: `text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed`.
4. **Kontrak 5-State Interaktif Wajib**:
   - Setiap elemen interaktif wajib menangani: `idle`, `hover`, `active`, `focus-visible`, dan `disabled`/`loading`.
5. **Aksesibilitas & Pembaca Layar**:
   - Bungkus slot streaming dengan atribut `role="region"` dan `aria-live="polite"`.
   - Gunakan `aria-busy="true"` selama fase streaming, dan ubah ke `false` setelah hidrasi selesai.
6. **Larangan Slop Visual**:
   - Dilarang keras menggunakan gradien ungu-biru generik AI.
   - Dilarang menampilkan orb neon blur di belakang kartu.
   - Dilarang memakai tombol pil (`rounded-full`) pada tata letak kartu persegi panjang standar.

---

### Verifikasi, Latensi & Keamanan
- **TTFS (Waktu ke Skeleton Pertama)**: Maksimal **100ms** sejak token pembuka pemanggilan alat dipancarkan.
- **Target Hidrasi**: Maksimal **450ms** sejak aliran stream tuntas hingga komponen siap berinteraksi.
- **Sanitasi Input**: Seluruh argumen dari LLM WAJIB divalidasi dengan skema Zod sebelum diteruskan ke komponen klien guna menangkal injeksi prompt tidak langsung (`prompt-injection-firewall`).
- **Kebersihan Memori**: Komponen efemeral wajib membersihkan *event listener* atau langganan aktif saat dicopot dari DOM.
- **Fallback Ketersediaan Model**: Jika men-streaming manifes UI terstruktur melalui Gemini 4 atau Claude Opus 5.5, alihkan secara otomatis ke Gemini 3.8 Flash dan Claude Opus 4.6 untuk mempertahankan TTFS <100ms.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Muse Wonder High`, `Composer 2.5 Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec ephemeral-generative-ui-architect <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_visual_audit`, `vibes_ast_query`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | LCP < 1.8s, INP < 100ms, CLS < 0.05, border tegas 1px, radius 3-tier (6px/8px/12px), `tabular-nums`, kontrak interaktif 5-state; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
