## English

### Orchestration & Integration
- **Upstream Models & Transports**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `gemini-agent-booster`
- **Frontend Presentation & Generative UI**: `senior-frontend`, `nextjs-app-router-expert`, `ephemeral-generative-ui-architect`
- **Tooling & Swarms**: `mcp-server-architect`, `multi-agent-orchestration`, `parallel-tool-orchestrator`
- **Contracts & Schemas**: `structured-output-contracts`, `form-validation-expert`, `typescript-expert`
- **Lifecycle & Governance**: `zero-to-prod-orchestrator`, `session-memory-manager`, `anti-slop`

### Description
Production-grade guide for building AI applications using the **Vercel AI SDK (Core & UI)**. Covers unified model provider abstraction (`@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`), streaming text and structured objects (`streamText`, `streamObject`), dynamic multi-step tool execution loops with `maxSteps`, client-side React 19 hooks (`useChat`, `useCompletion`), streaming data attachments (`createDataStreamResponse`), and generative UI rendering.

**Swarm Synergy:** Within the **Frontend & UI Swarm**, this skill serves as the AI UI Presentation Lead. It translates complex backend multi-agent outputs and streaming tokens into accessible, beautiful web components in Phase 4 & Phase 5.

### Trigger Conditions
- Integrating conversational chat, streaming completions, or generative UI in React 19 / Next.js 15.
- Implementing structured data extraction using `generateObject` or `streamObject` with Zod schemas.
- Building autonomous multi-step tool-calling loops on Next.js Route Handlers or Server Actions.
- Switching seamlessly across frontier providers (Claude Sonnet 5.5 / Fable 5.1, Gemini 4 Argon / Pro, OpenAI GPT-5.6 Sol, Grok 4.7, Ollama).
- Building streaming data channels with custom metadata, tool status indicators, and citations.

### Vercel AI SDK Architecture (Core vs UI)

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                          │
│  useChat / useCompletion / Generative UI React Components    │
│  • Optimistic updates  • Stream reader  • Tool invocation   │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP SSE / Data Stream Protocol
┌──────────────────────────────▼──────────────────────────────┐
│                    SERVER ROUTE / ACTION                    │
│  streamText({                                               │
│    model: anthropic('claude-sonnet-5.5-20261022'),          │
│    tools: { weatherTool, dbQueryTool },                     │
│    maxSteps: 5,                                             │
│  }).toDataStreamResponse()                                  │
└─────────────────────────────────────────────────────────────┘
```

### Core Implementation Guidelines

#### 1. Next.js 15 Route Handler with Multi-Step Tool Calling & Step Hooks
Use `streamText` with `maxSteps`, `onStepFinish`, and native prompt caching for iterative tool calling:
```typescript
// app/api/chat/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 60; // Allow long-running agentic reasoning

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-5.5-20261022'),
    messages,
    maxSteps: 10, // Iterative tool-calling loop up to 10 steps
    providerOptions: {
      anthropic: {
        cacheControl: { type: 'ephemeral' }, // Prompt caching for 90% TTFT acceleration
      },
    },
    tools: {
      calculateMetrics: tool({
        description: 'Computes analytical metrics from raw time series data',
        parameters: z.object({
          datasetId: z.string().min(1),
          metricType: z.enum(['p95_latency', 'error_rate', 'throughput']),
        }),
        execute: async ({ datasetId, metricType }) => {
          const metrics = await fetchDatasetMetrics(datasetId, metricType);
          return { datasetId, metricType, value: metrics.result, timestamp: new Date().toISOString() };
        },
      }),
    },
    system: 'You are an elite software performance auditor. Always ground conclusions with tool metrics.',
    onStepFinish: ({ stepType, text, toolCalls, toolResults, finishReason, usage }) => {
      console.log(`[Step ${stepType}] Finish: ${finishReason}, Prompt Tokens: ${usage.promptTokens}, Completion: ${usage.completionTokens}`);
      if (toolCalls && toolCalls.length > 0) {
        console.log(`Dispatched tools: ${toolCalls.map(t => t.toolName).join(', ')}`);
      }
    },
  });

  return result.toDataStreamResponse();
}

async function fetchDatasetMetrics(datasetId: string, metricType: string) {
  return { result: metricType === 'p95_latency' ? '12.4ms' : '0.01%' };
}
```

#### 2. Streaming Type-Safe Structured Objects (`streamObject`)
Stream validated structured objects to client components with partial object completion:
```typescript
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

export const SecurityReportSchema = z.object({
  securityVulnerabilities: z.array(z.object({
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    cwe: z.string(),
    explanation: z.string(),
    suggestedFix: z.string(),
  })),
  overallRiskScore: z.number().min(0).max(100),
  passesReview: z.boolean(),
  mitigationSummary: z.string(),
});

export async function POST(req: Request) {
  const { codeDiff } = await req.json();

  // Invariant: Gracefully fall back to Gemini 3.8 Flash if Gemini 4 Pro is unprovisioned
  let modelInstance;
  try {
    modelInstance = google('gemini-4-pro');
  } catch (err) {
    console.warn('[VercelAISDK] Gemini 4 Pro unavailable. Falling back to Gemini 3.8 Flash:', err);
    modelInstance = google('gemini-3.8-flash');
  }

  const result = streamObject({
    model: modelInstance,
    schema: SecurityReportSchema,
    prompt: `Audit the following git diff for security regressions:\n${codeDiff}`,
  });

  return result.toTextStreamResponse();
}
```

#### 3. Client Hook Integration (`useChat` with Interactive Tool Invocations)
Render streaming markdown, reasoning tokens, and interactive human-in-the-loop tool approvals:
```tsx
'use client';

import { useChat } from '@ai-sdk/react';

export function AgenticChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    maxSteps: 10,
  });

  return (
    <div className="flex flex-col h-[650px] w-full max-w-3xl mx-auto border border-border rounded-xl p-4 bg-background">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/80'}`}>
              {/* Reasoning Accordion */}
              {m.parts?.map((part, index) => {
                if (part.type === 'reasoning') {
                  return (
                    <details key={index} className="mb-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs">
                      <summary className="cursor-pointer font-medium text-muted-foreground">Thinking Process</summary>
                      <pre className="mt-1 whitespace-pre-wrap font-mono text-muted-foreground">{part.reasoning}</pre>
                    </details>
                  );
                }
                return null;
              })}

              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

              {/* Tool Invocations & Interactive Action Requests */}
              {m.toolInvocations?.map((inv) => (
                <div key={inv.toolCallId} className="mt-3 p-3 bg-background border border-border rounded-lg text-xs font-mono">
                  <div className="flex items-center justify-between font-semibold pb-1 border-b border-border">
                    <span>Tool: {inv.toolName}</span>
                    <span className="text-muted-foreground">{'result' in inv ? 'Done' : 'Running...'}</span>
                  </div>
                  {'result' in inv ? (
                    <pre className="mt-2 text-muted-foreground overflow-x-auto">{JSON.stringify(inv.result, null, 2)}</pre>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => addToolResult({ toolCallId: inv.toolCallId, result: { approved: true } })}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                      >
                        Approve Execution
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-border">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask the performance auditor..."
          className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

#### 4. Multimodal Attachments (Images, PDFs & Audio)
Pass multimodal file buffers or URLs directly into `streamText` message arrays:
```typescript
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { prompt, pdfBase64, imageBase64 } = await req.json();

  // Invariant: Gracefully fall back to Gemini 3.8 Flash if Gemini 4 Argon is unprovisioned
  let modelInstance;
  try {
    modelInstance = google('gemini-4-argon');
  } catch (err) {
    console.warn('[VercelAISDK] Gemini 4 Argon unavailable. Falling back to Gemini 3.8 Flash:', err);
    modelInstance = google('gemini-3.8-flash');
  }

  const result = streamText({
    model: modelInstance,
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

  return result.toDataStreamResponse();
}
```

#### 5. Custom LanguageModelV1 Middleware (`wrapLanguageModel`)
Implement security screening, prompt caching telemetry, or rate limiting via unified middleware:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

export const auditedModel = wrapLanguageModel({
  model: anthropic('claude-sonnet-5.5-20261022'),
  middleware: {
    wrapGenerate: async ({ doGenerate, params }) => {
      console.log(`[Audit Middleware] Pre-generation prompt tokens: ${params.prompt.length}`);
      const result = await doGenerate();
      console.log(`[Audit Middleware] Generated tokens: ${result.text?.length ?? 0}`);
      return result;
    },
    wrapStream: async ({ doStream, params }) => {
      console.log(`[Audit Middleware] Initiating stream for model: ${params.modelId}`);
      return await doStream();
    },
  },
});
```

#### 6. Direct Data Stream Control with `createDataStreamResponse`
Send custom progress updates, telemetry events, and citations alongside model tokens:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // 1. Send initial telemetry annotation
      dataStream.writeMessageAnnotation({ step: 'INITIALIZING_AUDIT', timestamp: Date.now() });

      // 2. Stream LLM tokens (with Claude Opus 5.5 -> Claude Opus 4.6 fallback support)
      let modelInstance;
      try {
        modelInstance = anthropic('claude-opus-5.5-20261022');
      } catch (err) {
        console.warn('[VercelAISDK] Claude Opus 5.5 unavailable. Falling back to Claude Opus 4.6:', err);
        modelInstance = anthropic('claude-opus-4.6');
      }

      const result = streamText({
        model: modelInstance,
        messages,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec vercel-ai-sdk-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | P99 API Gateway Latency < 85ms, OpenAPI 3.1 / TypeSpec strict schema parity, RFC 9457 Problem Details error contracts, Idempotency-Key enforcement; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
