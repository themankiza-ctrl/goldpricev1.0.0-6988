## Bahasa Indonesia

### Integrasi Orkestrasi
- **Ideasi Hulu & Desain Sistem**: `brainstorming`, `zero-to-prod-orchestrator` (Fase 3 & Fase 4).
- **Frontend & Design System**: `senior-frontend`, `design-system-architect`, `tailwind-expert`, `modern-css-native-expert`.
- **State & Pengambilan Data**: `tanstack-query-expert`, `form-validation-expert`, `database-orm-expert`.
- **Kualitas & Performa**: `performance-web-vitals`, `e2e-testing-expert`, `anti-slop`, `visual-ui-auditor`.

### Deskripsi
Panduan arsitektur tingkat produksi untuk **Next.js 15+ App Router** dan **React 19**. Menegakkan standar modern: API request asinkron (`await params`, `await cookies()`), caching tingkat fungsi `'use cache'` dengan `cacheLife` dan `cacheTag`, Partial Prerendering (PPR), React Server Actions dengan `useActionState` dan `useOptimistic`, Parallel & Intercepting Routes, serta streaming layout via `<Suspense>`.

### Kondisi Pemicu
- Merancang aplikasi Next.js 15+ baru atau migrasi kode dari direktori `pages/`.
- Menangani parameter request asinkron (`params`, `searchParams`, `cookies`, `headers`).
- Mengimplementasikan mutasi data atomik menggunakan Server Actions React 19 tanpa endpoint REST manual.
- Mengonfigurasi strategi cache terperinci dengan direktif `'use cache'` dan tag invalidasi.
- Membangun antarmuka modal URL-preserving dengan Parallel dan Intercepting Routes.
- Mengoptimalkan Core Web Vitals (LCP, INP, TTFB) melalui Partial Prerendering dan Streaming.

---

### Implementasi Pola Kunci

#### 1. API Request Asinkron (Wajib di Next.js 15)
Di Next.js 15, API dinamis (`params`, `searchParams`, `cookies()`, `headers()`) berbentuk Promise asinkron untuk mendukung streaming runtime dan optimasi preloading:
```typescript
// app/blog/[slug]/page.tsx
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function HalamanBlogPost({ params, searchParams }: PageProps) {
  // Await params dan searchParams secara bersamaan
  const [{ slug }, { preview }] = await Promise.all([params, searchParams]);
  const cookieStore = await cookies();
  const headerStore = await headers();

  const isPreview = preview === 'true' && cookieStore.get('preview_token')?.value === process.env.PREVIEW_SECRET;
  const post = await db.posts.findUnique({ where: { slug } });

  if (!post || (!post.published && !isPreview)) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold tracking-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-500">User-Agent: {headerStore.get('user-agent')}</p>
      <div className="mt-6 prose dark:prose-invert">{post.content}</div>
    </article>
  );
}
```

#### 2. Caching Generasi Baru dengan `'use cache'`, `cacheLife()`, dan `cacheTag()`
Next.js 15 menggantikan opsi fetch manual dengan caching deklaratif tingkat fungsi dan komponen:
```typescript
// lib/cached-data.ts
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { db } from '@/lib/db';

export async function ambilKatalogProduk(kategori: string) {
  'use cache';
  cacheLife('hours'); // Profil cache bawaan: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'
  cacheTag('produk', `kategori-${kategori}`);

  return await db.products.findMany({
    where: { category: kategori, inStock: true },
    select: { id: true, name: true, price: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

```typescript
// Dalam Server Action (app/actions/products.ts)
'use server';

import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function perbaruiStokProduk(productId: string, inStock: boolean) {
  await db.products.update({ where: { id: productId }, data: { inStock } });
  revalidateTag('produk'); // Menghapus seluruh cache query produk seketika
  return { success: true };
}
```

#### 3. React 19 Server Actions dengan `useActionState` & `useOptimistic`
Mutasi formulir atomik dengan penanganan loading otomatis, validasi error server, dan update UI optimistik instan:
```tsx
// app/tasks/task-form.tsx
'use client';

import { useActionState, useOptimistic, startTransition } from 'react';
import { buatTugasAction, type StatusTugas } from '@/app/actions/task';

interface Tugas {
  id: string;
  title: string;
  pending?: boolean;
}

const statusAwal: StatusTugas = { success: false, error: null };

export function PengelolaTugas({ tugasAwal }: { tugasAwal: Tugas[] }) {
  const [state, formAction, isPending] = useActionState(buatTugasAction, statusAwal);

  const [tugasOptimistik, tambahTugasOptimistik] = useOptimistic(
    tugasAwal,
    (daftarSekarang, judulBaru: string) => [
      ...daftarSekarang,
      { id: `temp-${Date.now()}`, title: judulBaru, pending: true },
    ]
  );

  const tanganiSubmitKlien = (formData: FormData) => {
    const title = formData.get('title') as string;
    if (!title?.trim()) return;

    startTransition(async () => {
      tambahTugasOptimistik(title);
      await formAction(formData);
    });
  };

  return (
    <div className="space-y-4 max-w-md">
      <form action={tanganiSubmitKlien} className="flex gap-2">
        <input
          name="title"
          placeholder="Tugas baru..."
          required
          className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      {state.error && <p className="text-sm font-medium text-rose-600">{state.error}</p>}

      <ul className="divide-y divide-slate-200 dark:divide-slate-800 border rounded-md">
        {tugasOptimistik.map((tugas) => (
          <li key={tugas.id} className={`p-3 text-sm flex justify-between ${tugas.pending ? 'opacity-60' : ''}`}>
            <span>{tugas.title}</span>
            {tugas.pending && <span className="text-xs text-slate-400">Menyinkronkan...</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 4. Parallel & Intercepting Routes (Modal Preservasi URL)
Menghadirkan dialog modal dengan URL mandiri yang dapat dibagikan tanpa menghilangkan state halaman latar:
```
app/
 ├── @modal/
 │   ├── (.)photos/[id]/page.tsx  <-- Mencegat navigasi klien ke /photos/[id]
 │   └── default.tsx              <-- Mengembalikan null saat modal tidak aktif
 ├── photos/
 │   └── [id]/page.tsx            <-- Memuat halaman utuh saat di-refresh langsung
 ├── layout.tsx                   <-- Me-render children DAN slot @modal
 └── page.tsx
```

#### 5. Partial Prerendering (PPR) & Streaming Suspense
Menggabungkan kecepatan delivery shell statis dari CDN edge dengan data dinamis real-time:
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const experimental_ppr = true; // Mengaktifkan PPR pada rute ini

export default function HalamanDashboard() {
  return (
    <main className="p-8 space-y-6">
      {/* Shell Statis: Di-prerender saat build time dan disajikan instan dari CDN */}
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Dashboard Analitik</h1>
        <p className="text-slate-500 text-sm">Pelacakan telemetri dan pendapatan real-time</p>
      </header>

      {/* Bagian Dinamis: Di-stream secara bertahap dari server */}
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <StreamMetrikLangsung />
      </Suspense>
    </main>
  );
}

async function StreamMetrikLangsung() {
  const metrik = await ambilMetrikSistem();
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrik.map((m) => (
        <div key={m.nama} className="p-4 border rounded-xl bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500">{m.nama}</div>
          <div className="text-2xl font-bold tabular-nums mt-1">{m.nilai}</div>
        </div>
      ))}
    </div>
  );
}

async function ambilMetrikSistem() {
  return [
    { nama: 'Sesi Aktif', nilai: '4,281' },
    { nama: 'Rata-rata Latensi', nilai: '18ms' },
    { nama: 'Tingkat Keberhasilan', nilai: '99.98%' },
  ];
}
```

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Muse Wonder High`, `Composer 2.5 Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec nextjs-app-router-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_visual_audit`, `vibes_ast_query`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | LCP < 1.8s, INP < 100ms, CLS < 0.05, border tegas 1px, radius 3-tier (6px/8px/12px), `tabular-nums`, kontrak interaktif 5-state; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
