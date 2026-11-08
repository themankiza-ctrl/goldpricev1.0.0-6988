## English

### Orchestration & Integration
- **Upstream & Orchestration**: `zero-to-prod-orchestrator` (Phase 4 AI integration), `brainstorming`, `session-memory-manager`.
- **Model Routing & Cascading**: `adaptive-model-cascade` (complexity-scored model selection), `thinking-budget-orchestrator` (reasoning token envelopes), `test-time-compute-optimizer` (compute cost scaling).
- **Prompt Caching & Context**: `kv-cache-prefix-optimizer` (KV-cache hit maximization), `context-window-engineer` (per-zone token cost accounting).
- **Observability & Infrastructure**: `llm-observability-expert` (Langfuse traces + cost dashboards), `cloud-hosting-expert` (gateway deployment on Vercel, Cloudflare, AWS), `vercel-ai-sdk-expert` (edge streaming & tool-call routing), `multi-agent-orchestration` (per-agent budget envelopes).

---

### Purpose

Optimize operational costs, reliability, and latency of multi-model LLM architectures using dynamic routing, provider fallback chains, semantic caching, and real-time FinOps analytics. Target: **40–70% reduction in monthly LLM spend** without degrading output quality.

---

### 1. LiteLLM v1.x — Deep Configuration Guide

LiteLLM provides a unified OpenAI-compatible interface across 100+ LLM providers with built-in fallback, retries, and budget management.

#### Install & Start Proxy

```bash
pip install litellm[proxy]
litellm --config litellm_config.yaml --port 4000
```

#### `litellm_config.yaml` — Full Production Config

```yaml
model_list:
  - model_name: high-fast-tier       # Virtual name used by clients
    litellm_params:
      model: xai/grok-4.7-high-fast
      api_key: os.environ/XAI_API_KEY
      rpm: 1200
      tpm: 3000000

  - model_name: fast-tier            # Rapid AST diff and code edits
    litellm_params:
      model: cursor/composer-2.5-fast
      api_key: os.environ/CURSOR_API_KEY
      rpm: 1000

  - model_name: medium-tier          # Balanced architecture & strict schema contracts
    litellm_params:
      model: gemini/gemini-4-argon
      api_key: os.environ/GEMINI_API_KEY
      rpm: 300
      tpm: 2000000

  - model_name: reasoning-tier       # High-complexity fullstack craftsmanship
    litellm_params:
      model: anthropic/claude-sonnet-5.5
      api_key: os.environ/ANTHROPIC_API_KEY
      rpm: 100
      tpm: 500000

  - model_name: reasoning-tier       # Fallback 1 for reasoning-tier
    litellm_params:
      model: gemini/gemini-4-pro
      api_key: os.environ/GEMINI_API_KEY
      rpm: 60

  - model_name: embedding-tier
    litellm_params:
      model: text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  routing_strategy: least-busy        # Options: simple-shuffle | least-busy | latency-based-routing | cost-based-routing
  enable_pre_call_checks: true
  num_retries: 3
  retry_after: 2                      # seconds between retries
  timeout: 60
  fallbacks:
    - high-fast-tier: [xai/grok-4.6-high-fast, cursor/composer-2.5-fast]
    - medium-tier: [openai/gpt-5.6-sol, anthropic/claude-opus-5.5, anthropic/claude-opus-4.6, gemini/gemini-3.8-flash]
    - reasoning-tier: [gemini/gemini-4-pro, gemini/gemini-3.8-flash, anthropic/claude-fable-5.1, anthropic/claude-opus-4.6, muse/muse-wonder-high]
  context_window_fallbacks:
    - reasoning-tier: [gemini/gemini-4-argon, gemini/gemini-4-pro, gemini/gemini-3.8-flash]  # 1M+ to 10M+ context fallback

litellm_settings:
  success_callback: ["langfuse"]
  failure_callback: ["langfuse"]
  cache: true
  cache_params:
    type: redis
    host: os.environ/REDIS_HOST
    port: 6379
    password: os.environ/REDIS_PASSWORD
    ttl: 600                          # Cache TTL in seconds
    similarity_threshold: 0.92        # Semantic cache hit threshold

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL  # PostgreSQL for spend tracking

# Virtual Keys with per-user budget limits
virtual_keys:
  - key: sk-agent-research
    user_id: agent-research
    max_budget: 5.00                  # USD per day
    budget_duration: 1d
    allowed_models: [fast-tier, embedding-tier]
  - key: sk-agent-code
    user_id: agent-code
    max_budget: 10.00
    budget_duration: 1d
    allowed_models: [fast-tier, reasoning-tier]
```

#### Python: Dynamic Routing via LiteLLM Client

```python
import litellm
from litellm import acompletion

async def route_by_complexity(prompt: str, complexity_score: float) -> str:
    """
    Routes to fast-tier (<0.5) or reasoning-tier (>=0.5) based on score.
    complexity_score: 0.0 (trivial) → 1.0 (very complex)
    """
    model = "reasoning-tier" if complexity_score >= 0.5 else "fast-tier"

    response = await acompletion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_base="http://localhost:4000",
        api_key="sk-agent-code",
        metadata={
            "generation_name": "dynamic-route",
            "tags": ["finops", f"complexity:{complexity_score:.2f}"],
        },
    )
    return response.choices[0].message.content
```

---

### 2. Portkey AI Gateway — Production Setup

Portkey adds a middleware layer over LLM providers with semantic caching, canary routing, observability, and guardrails.

```bash
npm install portkey-ai
```

#### TypeScript: Portkey Gateway with Fallback & Semantic Cache

```typescript
import Portkey from "portkey-ai";

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY!,
  config: {
    strategy: { mode: "fallback" },
    targets: [
      {
        provider: "anthropic",
        api_key: process.env.ANTHROPIC_API_KEY!,
        override_params: { model: "claude-opus-4-5", max_tokens: 4096 },
        weight: 1,
      },
      {
        // Fallback if Anthropic fails or is rate-limited
        provider: "google",
        api_key: process.env.GEMINI_API_KEY!,
        override_params: { model: "gemini-4-argon-medium", max_tokens: 4096 },
      },
    ],
    cache: {
      mode: "semantic",               // Semantic similarity matching
      max_age: 3600,                  // 1 hour TTL
    },
    retry: { attempts: 3, on_status_codes: [429, 500, 502, 503] },
  },
});

export async function callWithPortkey(
  prompt: string,
  userId: string,
): Promise<string> {
  const response = await portkey.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "claude-opus-4-5",
    // Portkey metadata for observability
    // @ts-expect-error — Portkey extends OpenAI types
    metadata: { _user: userId, environment: process.env.NODE_ENV },
  });

  return response.choices[0].message.content ?? "";
}
```

#### Portkey Canary Routing (A/B Test New Models)

```typescript
const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY!,
  config: {
    strategy: { mode: "loadbalance" },
    targets: [
      {
        provider: "anthropic",
        api_key: process.env.ANTHROPIC_API_KEY!,
        override_params: { model: "claude-opus-4-5" },
        weight: 80,                   // 80% traffic to stable model
      },
      {
        provider: "anthropic",
        api_key: process.env.ANTHROPIC_API_KEY!,
        override_params: { model: "claude-opus-4-6-preview" },  // new model canary
        weight: 20,                   // 20% canary traffic
      },
    ],
  },
});
```

---

### 3. RouteLLM (Stanford) — Complexity Classifier Router

RouteLLM trains a binary classifier to decide whether a query needs a strong model or a weak model, achieving **strong-model call reduction of 40-85%** while preserving quality.

```bash
pip install routellm
```

#### Setup & Router Configuration

```python
from routellm.controller import Controller

# Initialize with a pre-trained classifier (matrix-factorization or causal-llm)
controller = Controller(
    routers=["mf"],                   # 'mf' = matrix-factorization (fastest)
    strong_model="claude-sonnet-5.5",
    weak_model="grok-4.7-high-fast",
    config={
        "mf": {
            "checkpoint_path": "routellm/mf-gpt4-turbo",  # HF checkpoint
        }
    },
    api_base=None,                    # Uses provider API directly
    api_key=None,
)

# Threshold: higher = use weak model more aggressively
# 0.11875 = calibrated to 50% strong model call rate on MMLU benchmark
response = controller.chat.completions.create(
    model="router-mf-0.11875",        # router-{name}-{threshold}
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)
print(response.choices[0].message.content)
```

#### Custom Task-Based Routing

```python
async def intelligent_route(task_type: str, prompt: str) -> str:
    """Route based on known task taxonomy (late-2026 frontier tiers)."""
    FAST_TASKS = {"classification", "extraction", "summarization", "translation", "ast_scan"}
    SLOW_TASKS = {"code_generation", "reasoning", "math", "planning", "security_audit"}

    use_strong = task_type in SLOW_TASKS
    model = "claude-sonnet-5.5" if use_strong else "grok-4.7-high-fast"

    import openai
    client = openai.AsyncOpenAI()
    resp = await client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content
```

---

### 4. Cost Calculation & Budget Enforcement

#### Per-Model Pricing Table (Late-2026 Frontier Models, USD per 1M tokens)

| Model | Input | Output | Cached Input |
|---|---|---|---|
| Grok 4.7 High Fast | \$0.50 | \$2.00 | \$0.10 |
| Grok 4.6 High Fast | \$0.40 | \$1.60 | \$0.08 |
| Composer 2.5 Fast | \$0.30 | \$1.20 | \$0.05 |
| Claude Opus 5.5 Medium | \$10.00 | \$50.00 | \$1.00 |
| Claude Opus 4.6 (Fallback) | \$8.00 | \$40.00 | \$0.80 |
| Gemini 4 Argon Medium | \$0.80 | \$3.20 | \$0.15 |
| Gemini 3.8 Flash (Fallback) | \$0.10 | \$0.40 | \$0.025 |
| GPT-5.6 Sol Medium | \$1.50 | \$6.00 | \$0.35 |
| Claude Sonnet 5.5 High | \$3.00 | \$15.00 | \$0.30 |
| Claude Fable 5.1 High | \$2.50 | \$12.50 | \$0.25 |
| Muse Wonder High | \$3.50 | \$17.50 | \$0.35 |
| Gemini 4 Pro | \$1.25 | \$10.00 | \$0.31 |
| text-embedding-3-small | \$0.02 | — | — |

#### TypeScript: Real-Time Cost Calculator

```typescript
interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  "grok-4.7-high-fast":      { inputPerMillion: 0.50,  outputPerMillion: 2.00,  cachedInputPerMillion: 0.10 },
  "grok-4.6-high-fast":      { inputPerMillion: 0.40,  outputPerMillion: 1.60,  cachedInputPerMillion: 0.08 },
  "composer-2.5-fast":       { inputPerMillion: 0.30,  outputPerMillion: 1.20,  cachedInputPerMillion: 0.05 },
  "claude-opus-5.5":         { inputPerMillion: 10.00, outputPerMillion: 50.00, cachedInputPerMillion: 1.00 },
  "claude-opus-4.6":         { inputPerMillion: 8.00,  outputPerMillion: 40.00, cachedInputPerMillion: 0.80 },
  "gemini-4-argon":          { inputPerMillion: 0.80,  outputPerMillion: 3.20,  cachedInputPerMillion: 0.15 },
  "gemini-3.8-flash":        { inputPerMillion: 0.10,  outputPerMillion: 0.40,  cachedInputPerMillion: 0.025 },
  "gpt-5.6-sol":             { inputPerMillion: 1.50,  outputPerMillion: 6.00,  cachedInputPerMillion: 0.35 },
  "claude-sonnet-5.5":       { inputPerMillion: 3.00,  outputPerMillion: 15.00, cachedInputPerMillion: 0.30 },
  "claude-fable-5.1":        { inputPerMillion: 2.50,  outputPerMillion: 12.50, cachedInputPerMillion: 0.25 },
  "muse-wonder-high":        { inputPerMillion: 3.50,  outputPerMillion: 17.50, cachedInputPerMillion: 0.35 },
  "gemini-4-pro":            { inputPerMillion: 1.25,  outputPerMillion: 10.00, cachedInputPerMillion: 0.31 },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens = 0,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) throw new Error(`Unknown model: ${model}`);

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  const cachedCost = pricing.cachedInputPerMillion
    ? (cachedInputTokens / 1_000_000) * pricing.cachedInputPerMillion
    : 0;

  return inputCost + outputCost + cachedCost;
}

// Token Budget Guard — throws if projected cost exceeds daily cap
export async function guardedLLMCall(
  model: string,
  messages: Array<{ role: string; content: string }>,
  dailyBudgetUSD: number,
  spentTodayUSD: number,
): Promise<string> {
  const estimatedInputTokens = messages.reduce(
    (sum, m) => sum + Math.ceil(m.content.length / 4),
    0,
  );
  const estimatedCost = calculateCost(model, estimatedInputTokens, estimatedInputTokens * 2);

  if (spentTodayUSD + estimatedCost > dailyBudgetUSD) {
    // Availability Fallback Invariant: Cascade to ultra-efficient Gemini 3.8 Flash
    const cheaperModel = "gemini-3.8-flash";
    console.warn(`Budget cap approaching. Cascading to ${cheaperModel}.`);
    return guardedLLMCall(cheaperModel, messages, dailyBudgetUSD, spentTodayUSD);
  }

  const { OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resp = await client.chat.completions.create({ model, messages } as Parameters<typeof client.chat.completions.create>[0]);
  return resp.choices[0].message.content ?? "";
}
```

---

### 5. Monitoring, Alerts & Daily Cost Caps

#### Langfuse Integration (spend tracking + tracing)

```python
from langfuse import Langfuse
from langfuse.decorators import langfuse_context, observe

langfuse = Langfuse(
    public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
    secret_key=os.environ["LANGFUSE_SECRET_KEY"],
    host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
)

@observe(name="llm-call", as_type="generation")
async def tracked_llm_call(model: str, prompt: str, user_id: str) -> str:
    import litellm
    resp = await litellm.acompletion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        metadata={"langfuse_user_id": user_id},
    )

    # Record cost for this generation
    cost = litellm.completion_cost(completion_response=resp)
    langfuse_context.update_current_observation(
        usage={
            "input": resp.usage.prompt_tokens,
            "output": resp.usage.completion_tokens,
            "unit": "TOKENS",
            "total_cost": cost,
        }
    )
    return resp.choices[0].message.content
```

#### Daily Cost Cap via Redis Counter

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DAILY_BUDGET_USD = parseFloat(process.env.LLM_DAILY_BUDGET_USD ?? "50");
const ALERT_THRESHOLD = 0.85; // Alert at 85% of budget

export async function trackAndCheckBudget(
  costUSD: number,
  slackWebhook?: string,
): Promise<{ allowed: boolean; spent: number; remaining: number }> {
  const key = `llm:spend:${new Date().toISOString().slice(0, 10)}`; // YYYY-MM-DD
  const spent = await redis.incrbyfloat(key, costUSD);
  await redis.expire(key, 86400 * 2); // 2 days TTL

  const remaining = DAILY_BUDGET_USD - spent;

  if (spent >= DAILY_BUDGET_USD * ALERT_THRESHOLD && slackWebhook) {
    await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `⚠️ *LLM Budget Alert*: \$${spent.toFixed(4)} spent of \$${DAILY_BUDGET_USD} daily budget (${((spent / DAILY_BUDGET_USD) * 100).toFixed(1)}%).`,
      }),
    });
  }

  return { allowed: spent <= DAILY_BUDGET_USD, spent, remaining };
}
```

---

### 6. Complexity Scorer — Routing Decision Engine

```typescript
export interface ComplexityScore {
  score: number;           // 0.0 → 1.0
  tier: "fast" | "reasoning";
  reason: string;
}

const HIGH_COMPLEXITY_PATTERNS = [
  /step[ -]by[ -]step/i,
  /reason(ing|ed)/i,
  /code\s+(generation|review|refactor)/i,
  /math|calculation|equation/i,
  /analyze|synthesize|compare/i,
  /plan|architect|design system/i,
];

const LOW_COMPLEXITY_PATTERNS = [
  /translate/i,
  /summarize|tldr/i,
  /classify|label/i,
  /extract\s+(name|date|email|phone)/i,
  /yes or no/i,
  /what is the (capital|meaning)/i,
];

export function scoreComplexity(prompt: string): ComplexityScore {
  let score = 0.3; // baseline

  for (const pattern of HIGH_COMPLEXITY_PATTERNS) {
    if (pattern.test(prompt)) score = Math.min(score + 0.2, 1.0);
  }
  for (const pattern of LOW_COMPLEXITY_PATTERNS) {
    if (pattern.test(prompt)) score = Math.max(score - 0.2, 0.0);
  }

  // Penalize long prompts slightly toward reasoning tier
  if (prompt.length > 2000) score = Math.min(score + 0.1, 1.0);

  const tier = score >= 0.5 ? "reasoning" : "fast";
  const reason =
    tier === "reasoning"
      ? `High complexity (score: ${score.toFixed(2)}) — using frontier model`
      : `Low complexity (score: ${score.toFixed(2)}) — using fast model`;

  return { score, tier, reason };
}

export function selectModel(tier: "fast" | "reasoning"): string {
  // Availability Fallback Invariant:
  // - reasoning: Claude Opus 5.5 -> fallback Claude Opus 4.6
  // - fast: Gemini 4 Argon -> fallback Gemini 3.8 Flash
  if (tier === "reasoning") {
    return process.env.FRONTIER_MODEL_AVAILABLE === "false" ? "claude-opus-4.6" : "claude-opus-5.5";
  }
  return process.env.FRONTIER_MODEL_AVAILABLE === "false" ? "gemini-3.8-flash" : "gemini-4-argon";
}
```

---

### 7. Full Routing Pipeline (TypeScript)

```typescript
import OpenAI from "openai";
import { scoreComplexity, selectModel } from "./complexity-scorer";
import { trackAndCheckBudget } from "./budget-tracker";
import { calculateCost } from "./cost-calculator";

const client = new OpenAI({
  baseURL: "http://localhost:4000",   // LiteLLM proxy
  apiKey: process.env.LITELLM_MASTER_KEY,
});

export async function smartRoute(
  prompt: string,
  userId: string,
): Promise<{ content: string; model: string; costUSD: number }> {
  const complexity = scoreComplexity(prompt);
  const model = selectModel(complexity.tier);

  const { allowed, spent } = await trackAndCheckBudget(0, process.env.SLACK_WEBHOOK);
  if (!allowed) {
    throw new Error(`Daily LLM budget exhausted. Spent: \$${spent.toFixed(2)}`);
  }

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    user: userId,
  });

  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;
  const costUSD = calculateCost(model, inputTokens, outputTokens);

  await trackAndCheckBudget(costUSD, process.env.SLACK_WEBHOOK);

  return {
    content: response.choices[0].message.content ?? "",
    model,
    costUSD,
  };
}
```

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec llm-finops-router <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | P99 API Gateway Latency < 85ms, OpenAPI 3.1 / TypeSpec strict schema parity, RFC 9457 Problem Details error contracts, Idempotency-Key enforcement; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
