## Bahasa Indonesia

### Integrasi Orkestrasi
- **Model Hulu & Transport**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `gemini-agent-booster`
- **Presentasi Frontend & Generative UI**: `senior-frontend`, `nextjs-app-router-expert`, `ephemeral-generative-ui-architect`
- **Tooling & Swarm**: `mcp-server-architect`, `multi-agent-orchestration`, `parallel-tool-orchestrator`
- **Kontrak & Skema**: `structured-output-contracts`, `form-validation-expert`, `typescript-expert`
- **Siklus Hidup & Tata Kelola**: `zero-to-prod-orchestrator`, `session-memory-manager`, `anti-slop`

### Deskripsi
Panduan produksi untuk membangun aplikasi AI menggunakan **Vercel AI SDK (Core & UI)**. Mencakup abstraksi penyedia model terpadu (`@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`), streaming teks dan objek terstruktur (`streamText`, `streamObject`), siklus eksekusi tool multi-langkah otonom dengan `maxSteps`, hook klien React 19 (`useChat`, `useCompletion`), streaming respons saluran data (`createDataStreamResponse`), dan rendering Generative UI.

**Sinergi Swarm:** Di dalam **Frontend & UI Swarm**, skill ini berperan sebagai Pemimpin Presentasi UI AI. Skill ini bertugas mentransformasikan keluaran multi-agen backend dan token streaming menjadi komponen web yang interaktif, aksesibel, dan elegan pada Fase 4 & Fase 5.

### Kondisi Pemicu
- Mengintegrasikan chat percakapan, streaming respons, atau generative UI di React 19 / Next.js 15.
- Menerapkan ekstraksi data terstruktur dengan validasi skema Zod via `generateObject` atau `streamObject`.
- Membangun loop pemanggilan tool (*tool-calling loops*) multi-langkah di Route Handler atau Server Actions.
- Beralih fleksibel antar penyedia model frontier (Claude Sonnet 5.5 / Fable 5.1, Gemini 4 Argon / Pro, OpenAI GPT-5.6 Sol, Grok 4.7, Ollama).
- Mengelola status eksekusi tool, indikator loading, dan rendering komponen UI secara dinamis saat streaming berlangsung.

---

### Implementasi Pola Kunci (TypeScript & React 19)

#### 1. Next.js 15 Route Handler dengan Multi-Step Tool Calling & Hooks Langkah
Gunakan `streamText` dengan `maxSteps: 10`, `onStepFinish`, dan prompt caching native untuk siklus pemanggilan tool iteratif otonom:
```typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 60; // Izinkan penalaran agen hingga 60 detik

export async function POST(req: Request) {
  const { messages } = await req.json();

  const hasil = streamText({
    model: anthropic('claude-sonnet-5.5-20261022'),
    messages,
    maxSteps: 10, // Siklus iteratif pemanggilan tool hingga 10 langkah
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' }, // Prompt caching untuk akselerasi TTFT hingga 90%
      },
    },
    tools: {
      hitungMetrikPerforma: tool({
        description: 'Menghitung metrik analitik aplikasi dari data deret waktu mentah',
        parameters: z.object({
          datasetId: z.string().min(1),
          metrik: z.enum(['p95_latensi', 'tingkat_error', 'throughput']),
        }),
        execute: async ({ datasetId, metrik }) => {
          const data = await ambilMetrikSistem(datasetId, metrik);
          return { datasetId, metrik, nilai: data.hasil, timestamp: new Date().toISOString() };
        },
      }),
    },
    system: 'Anda adalah auditor performa perangkat lunak elit. Selalu sertakan bukti valid dari pemanggilan tool.',
    onStepFinish: ({ stepType, text, toolCalls, toolResults, finishReason, usage }) => {
      console.log(`[Langkah ${stepType}] Status: ${finishReason}, Prompt Tokens: ${usage.promptTokens}, Completion: ${usage.completionTokens}`);
      if (toolCalls && toolCalls.length > 0) {
        console.log(`Tool dipanggil: ${toolCalls.map(t => t.toolName).join(', ')}`);
      }
    },
  });

  return hasil.toDataStreamResponse();
}

async function ambilMetrikSistem(datasetId: string, metrik: string) {
  return { hasil: metrik === 'p95_latensi' ? '12.4ms' : '0.01%' };
}
```

#### 2. Streaming Objek Terstruktur Type-Safe (`streamObject`)
Streaming objek terstruktur tervalidasi skema Zod secara instan ke antarmuka klien:
```typescript
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

export const SkemaLaporanKeamanan = z.object({
  kerentananKeamanan: z.array(z.object({
    tingkatKeparahan: z.enum(['rendah', 'sedang', 'tinggi', 'kritis']),
    cwe: z.string(),
    penjelasan: z.string(),
    saranPerbaikan: z.string(),
  })),
  skorRisikoGlobal: z.number().min(0).max(100),
  lolosReview: z.boolean(),
  ringkasanMitigasi: z.string(),
});

export async function POST(req: Request) {
  const { diffKode } = await req.json();

  // Invarian: Pengalihan otomatis ke Gemini 3.8 Flash jika Gemini 4 Pro belum aktif
  let modelTarget;
  try {
    modelTarget = google('gemini-4-pro');
  } catch (galat) {
    console.warn('[VercelAISDK] Gemini 4 Pro belum tersedia. Mengalihkan ke Gemini 3.8 Flash:', galat);
    modelTarget = google('gemini-3.8-flash');
  }

  const hasil = streamObject({
    model: modelTarget,
    schema: SkemaLaporanKeamanan,
    prompt: `Audit perubahan kode berikut untuk potensi regresi keamanan:\n${diffKode}`,
  });

  return hasil.toTextStreamResponse();
}
```

#### 3. Integrasi Hook Klien React 19 (`useChat` dengan Invokasi Tool & Persetujuan)
Render token streaming, akordion penalaran (*thinking process*), dan persetujuan eksekusi tool interaktif:
```tsx
'use client';

import { useChat } from '@ai-sdk/react';

export function AntarmukaChatAgen() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    maxSteps: 10,
  });

  return (
    <div className="flex flex-col h-[650px] w-full max-w-3xl mx-auto border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
              {/* Bagian Penalaran Model / Thinking Process */}
              {m.parts?.map((bagian, index) => {
                if (bagian.type === 'reasoning') {
                  return (
                    <details key={index} className="mb-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs">
                      <summary className="cursor-pointer font-medium text-slate-500 dark:text-slate-400">Proses Penalaran (Thinking)</summary>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-slate-600 dark:text-slate-300">{bagian.reasoning}</pre>
                    </details>
                  );
                }
                return null;
              })}

              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

              {/* Status Pemanggilan Tool & Aksi Interaktif */}
              {m.toolInvocations?.map((inv) => (
                <div key={inv.toolCallId} className="mt-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono">
                  <div className="flex items-center justify-between font-semibold pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span>Tool: {inv.toolName}</span>
                    <span className="text-slate-400">{'result' in inv ? 'Selesai' : 'Sedang Berjalan...'}</span>
                  </div>
                  {'result' in inv ? (
                    <pre className="mt-2 text-slate-600 dark:text-slate-300 overflow-x-auto">{JSON.stringify(inv.result, null, 2)}</pre>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => addToolResult({ toolCallId: inv.toolCallId, result: { disetujui: true } })}
                        className="px-2 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded text-xs"
                      >
                        Setujui Eksekusi Tool
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Tanyakan analisis pada agen..."
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}

#### 4. Pemrosesan Lampiran Multimodal (Gambar, PDF & Dokumen)
Kirim buffer file multimodal atau URL langsung ke dalam array pesan `streamText`:
```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt, pdfBase64, imageBase64 } = await req.json();

  // Invarian: Pengalihan otomatis ke Gemini 3.8 Flash jika Gemini 4 Argon belum aktif
  let modelTarget;
  try {
    modelTarget = google('gemini-4-argon');
  } catch (galat) {
    console.warn('[VercelAISDK] Gemini 4 Argon belum tersedia. Mengalihkan ke Gemini 3.8 Flash:', galat);
    modelTarget = google('gemini-3.8-flash');
  }

  const hasil = streamText({
    model: modelTarget,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'file', mimeType: 'application/pdf', data: pdfBase64 },
          { type: 'image', image: imageBase64 },
        ],
      },
    ],
  });

  return hasil.toDataStreamResponse();
}
```

#### 5. Middleware Kustom LanguageModelV1 (`wrapLanguageModel`)
Terapkan penyaringan keamanan, logging token, dan guardrail melalui middleware terpadu:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

export const modelAudit = wrapLanguageModel({
  model: anthropic('claude-sonnet-5.5-20261022'),
  middleware: {
    wrapGenerate: async ({ doGenerate, params }) => {
      console.log(`[Middleware Audit] Panjang prompt sebelum generasi: ${params.prompt.length}`);
      const hasil = await doGenerate();
      console.log(`[Middleware Audit] Token selesai di-generate: ${hasil.text?.length ?? 0}`);
      return hasil;
    },
    wrapStream: async ({ doStream, params }) => {
      console.log(`[Middleware Audit] Memulai streaming untuk model: ${params.modelId}`);
      return await doStream();
    },
  },
});
```

#### 6. Kendali Aliran Data Langsung dengan `createDataStreamResponse`
Kirim pembaruan progres kustom, metadata status, dan anotasi telemetri bersamaan dengan token LLM:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // 1. Tulis anotasi status awal
      dataStream.writeMessageAnnotation({ status: 'MEMULAI_AUDIT', timestamp: Date.now() });

      // 2. Stream token LLM (dengan fallback Claude Opus 5.5 -> Claude Opus 4.6)
      let modelTarget;
      try {
        modelTarget = anthropic('claude-opus-5.5-20261022');
      } catch (galat) {
        console.warn('[VercelAISDK] Claude Opus 5.5 tidak tersedia. Mengalihkan ke Claude Opus 4.6:', galat);
        modelTarget = anthropic('claude-opus-4.6');
      }

      const hasil = streamText({
        model: modelTarget,
        messages,
      });

      hasil.mergeIntoDataStream(dataStream);
    },
  });
}
```

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec vercel-ai-sdk-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
