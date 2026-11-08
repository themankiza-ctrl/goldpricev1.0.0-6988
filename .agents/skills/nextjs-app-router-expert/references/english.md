## English

### Orchestration & Integration
- **Upstream Ideation & System Design**: `brainstorming`, `zero-to-prod-orchestrator` (Phase 3 & Phase 4).
- **Frontend & Design System**: `senior-frontend`, `design-system-architect`, `tailwind-expert`, `modern-css-native-expert`.
- **State & Data Fetching**: `tanstack-query-expert`, `form-validation-expert`, `database-orm-expert`.
- **Quality & Performance**: `performance-web-vitals`, `e2e-testing-expert`, `anti-slop`, `visual-ui-auditor`.

### Description
Production-grade architectural guide for **Next.js 15+ App Router** and **React 19**. Enforces modern standards: asynchronous request APIs (`await params`, `await cookies()`), function-level `'use cache'` with `cacheLife` and `cacheTag`, Partial Prerendering (PPR), React Server Actions with `useActionState` and `useOptimistic`, Parallel & Intercepting Routes, and streaming layouts via `<Suspense>`.

### Trigger Conditions
- Architecting new Next.js 15+ applications or migrating legacy `pages/` directory code.
- Handling asynchronous request parameters (`params`, `searchParams`, `cookies`, `headers`).
- Implementing atomic mutations using React 19 Server Actions without manual REST endpoints.
- Setting up granular caching with the new `'use cache'` directive and cache invalidation tags.
- Building complex modal navigation patterns with Parallel and Intercepting Routes.
- Optimizing Core Web Vitals (LCP, INP, TTFB) with Partial Prerendering and Streaming.

---

### Core Architectural Patterns

#### 1. Async Request APIs (Mandatory in Next.js 15)
In Next.js 15, dynamic APIs (`params`, `searchParams`, `cookies()`, `headers()`) are asynchronous Promises to enable future runtime streaming and static preloading:
```typescript
// app/blog/[slug]/page.tsx
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  // Await params and searchParams concurrently
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
      <p className="mt-2 text-sm text-muted-foreground">User-Agent: {headerStore.get('user-agent')}</p>
      <div className="mt-6 prose dark:prose-invert">{post.content}</div>
    </article>
  );
}
```

#### 2. Next-Gen Caching with `'use cache'`, `cacheLife()`, and `cacheTag()`
Next.js 15 replaces opaque fetch options with explicit, declarative function and component-level caching:
```typescript
// lib/cached-data.ts
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';
import { db } from '@/lib/db';

export async function getProductCatalog(category: string) {
  'use cache';
  cacheLife('hours'); // Predefined profile: 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'
  cacheTag('products', `category-${category}`);

  return await db.products.findMany({
    where: { category, inStock: true },
    select: { id: true, name: true, price: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

```typescript
// In Server Action (app/actions/products.ts)
'use server';

import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';

export async function updateProductStock(productId: string, inStock: boolean) {
  await db.products.update({ where: { id: productId }, data: { inStock } });
  revalidateTag('products'); // Purges all cached product queries instantly
  return { success: true };
}
```

#### 3. React 19 Server Actions with `useActionState` & `useOptimistic`
Atomic form mutations with automatic pending states, error validation, and zero-latency optimistic updates:
```tsx
// app/tasks/task-form.tsx
'use client';

import { useActionState, useOptimistic, startTransition } from 'react';
import { createTaskAction, type TaskState } from '@/app/actions/task';

interface Task {
  id: string;
  title: string;
  pending?: boolean;
}

const initialState: TaskState = { success: false, error: null };

export function TaskManager({ initialTasks }: { initialTasks: Task[] }) {
  const [state, formAction, isPending] = useActionState(createTaskAction, initialState);

  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    initialTasks,
    (currentTasks, newTitle: string) => [
      ...currentTasks,
      { id: `temp-${Date.now()}`, title: newTitle, pending: true },
    ]
  );

  const handleClientSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    if (!title?.trim()) return;

    startTransition(async () => {
      addOptimisticTask(title);
      await formAction(formData);
    });
  };

  return (
    <div className="space-y-4 max-w-md">
      <form action={handleClientSubmit} className="flex gap-2">
        <input
          name="title"
          placeholder="New task..."
          required
          className="flex-1 px-3 py-2 border rounded-md bg-background"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add'}
        </button>
      </form>

      {state.error && <p className="text-sm font-medium text-destructive">{state.error}</p>}

      <ul className="divide-y divide-border border rounded-md">
        {optimisticTasks.map((task) => (
          <li key={task.id} className={`p-3 text-sm flex justify-between ${task.pending ? 'opacity-60' : ''}`}>
            <span>{task.title}</span>
            {task.pending && <span className="text-xs text-muted-foreground">Saving...</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 4. Parallel & Intercepting Routes (URL-Preserving Modals)
Enable modal dialogues with dedicated shareable URLs and seamless backdrop preservation:
```
app/
 ├── @modal/
 │   ├── (.)photos/[id]/page.tsx  <-- Intercepts client navigation to /photos/[id]
 │   └── default.tsx              <-- Returns null when modal is inactive
 ├── photos/
 │   └── [id]/page.tsx            <-- Renders standalone full page on direct refresh
 ├── layout.tsx                   <-- Renders children AND @modal slot
 └── page.tsx
```

```tsx
// app/@modal/(.)photos/[id]/page.tsx
import { Modal } from '@/components/ui/modal';
import { PhotoView } from '@/components/photo-view';

export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Modal>
      <PhotoView photoId={id} />
    </Modal>
  );
}
```

#### 5. Partial Prerendering (PPR) & Streaming Suspense
Combines instantaneous static edge delivery with dynamic personalized punch-outs:
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const experimental_ppr = true; // Enables PPR for this route segment

export default function DashboardPage() {
  return (
    <main className="p-8 space-y-6">
      {/* Static Shell: Prerendered at build time and served immediately from CDN */}
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time telemetry and revenue tracking</p>
      </header>

      {/* Dynamic Punch-out: Streamed dynamically from the server */}
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <AsyncMetricsStream />
      </Suspense>
    </main>
  );
}

async function AsyncMetricsStream() {
  const metrics = await fetchLiveMetrics();
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div key={m.name} className="p-4 border rounded-xl bg-card">
          <div className="text-xs text-muted-foreground">{m.name}</div>
          <div className="text-2xl font-bold tabular-nums mt-1">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

async function fetchLiveMetrics() {
  return [
    { name: 'Active Sessions', value: '4,281' },
    { name: 'Average Latency', value: '18ms' },
    { name: 'Success Rate', value: '99.98%' },
  ];
}
```

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Muse Wonder High`, `Composer 2.5 Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec nextjs-app-router-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_visual_audit`, `vibes_ast_query`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | LCP < 1.8s, INP < 100ms, CLS < 0.05, 1px crisp borders, 3-tier radius (6px/8px/12px), `tabular-nums`, 5-state interactive contract; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
