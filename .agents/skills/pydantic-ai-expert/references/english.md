## English

### Orchestration & Integration
- **Python Language & Runtime**: `python-programming-expert`, `structured-output-contracts`
- **Agent Frameworks & Swarms**: `multi-agent-orchestration`, `ai-llm-integration-expert`, `frontier-ai-models-expert`
- **MCP & Tool Protocols**: `mcp-server-architect`, `parallel-tool-orchestrator`
- **Persistence & Databases**: `database-orm-expert`, `vector-db-rag-expert`
- **Evaluation & Testing**: `autonomous-tdd-debugger`, `property-mutation-testing-expert`, `anti-slop`
- **Lifecycle & Governance**: `zero-to-prod-orchestrator`, `session-memory-manager`

### Description
Production-grade guide for building enterprise AI agents using **Pydantic AI** (from the creators of Pydantic). Unlike untyped or fragile agent libraries, Pydantic AI provides strict static typing (`Agent[DepsType, ReturnType]`), first-class dependency injection (`RunContext[Deps]`), automatic tool parameter validation via Pydantic v2 schemas, model-agnostic provider switching (Anthropic, OpenAI, Gemini, Groq, Ollama), dynamic system prompts, and deterministic structured outputs.

**Swarm Synergy:** Within the **Backend & APIs Swarm**, this skill serves as the Lead Python Agent Engineer. It executes critical business operations, runs data pipelines, and integrates with SQL databases with compile-time type safety in Phase 4.

### Trigger Conditions
- Engineering Python-based autonomous agents requiring strict type safety and schema validation.
- Implementing dependency injection (passing database connections, API clients, or user sessions) into agent tools.
- Extracting guaranteed structured outputs from frontier reasoning models without JSON parsing errors.
- Designing multi-agent delegation or agent handoffs in Python microservices.
- Running unit tests and deterministic evals on agent logic using mock models (`TestModel`).

### Pydantic AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT DEFINITION                         │
│  Agent[DatabaseDeps, AuditReport](                          │
│    model='anthropic:claude-opus-5.5',                        │
│    result_type=AuditReport,                                 │
│  )                                                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐       ┌──────────────────────────────┐
│     DEPENDENCY INJECTION     │       │     TOOL EXECUTION LOOP      │
│  RunContext[DatabaseDeps]    │       │  @agent.tool                 │
│  • Async DB connection pool  │       │  • Auto Pydantic validation  │
│  • Tenant & session auth     │       │  • Structured error return   │
└──────────────────────────────┘       └──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             DETERMINISTIC STRUCTURED RESULT                 │
│  result.data -> Pydantic BaseModel instance (Validated)     │
└─────────────────────────────────────────────────────────────┘
```

### Core Implementation Guidelines

#### 1. Type-Safe Agent with Dependency Injection
Pass database pools or HTTP clients directly into tools without global state:
```python
from dataclasses import dataclass
import asyncpg
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

@dataclass
class DatabaseDeps:
    pool: asyncpg.Pool
    tenant_id: str

class UserAnomalyReport(BaseModel):
    user_id: str
    risk_score: float = Field(ge=0.0, le=1.0)
    anomalous_events: list[str]
    action_recommended: str

# Typed agent: Agent[DependencyType, ResultType]
PRIMARY_MODEL = 'google-gla:gemini-4-argon'
FALLBACK_MODEL = 'google-gla:gemini-3.8-flash'

security_agent = Agent[DatabaseDeps, UserAnomalyReport](
    model=PRIMARY_MODEL,
    result_type=UserAnomalyReport,
    system_prompt=(
        "You are an automated SecOps auditor. Analyze the user access logs provided "
        "and generate a strictly structured anomaly assessment."
    ),
)

@security_agent.system_prompt
async def add_tenant_context(ctx: RunContext[DatabaseDeps]) -> str:
    return f"Active Tenant ID: {ctx.deps.tenant_id}. Only audit records matching this tenant."

@security_agent.tool
async def query_audit_logs(ctx: RunContext[DatabaseDeps], user_id: str, limit: int = 50) -> list[dict]:
    """Retrieve raw authentication events for a given user from the audit store."""
    async with ctx.deps.pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT event_time, ip_address, action, status FROM audit_logs "
            "WHERE tenant_id = $1 AND user_id = $2 ORDER BY event_time DESC LIMIT $3",
            ctx.deps.tenant_id, user_id, limit
        )
        return [dict(r) for r in rows]

# Execution with Availability Fallback (Gemini 4 -> Gemini 3.8 Flash):
async def run_audit(pool: asyncpg.Pool, tenant_id: str, target_user: str) -> UserAnomalyReport:
    deps = DatabaseDeps(pool=pool, tenant_id=tenant_id)
    try:
        result = await security_agent.run(f"Audit user activity for {target_user}", deps=deps)
        return result.data  # Guaranteed instance of UserAnomalyReport
    except Exception:
        # Fallback invariant: degrade to gemini-3.8-flash
        with security_agent.override(model=FALLBACK_MODEL):
            result = await security_agent.run(f"Audit user activity for {target_user}", deps=deps)
            return result.data
```

#### 2. Model-Agnostic Switching & Local SLM Fallback
Pydantic AI allows switching between cloud APIs and local Ollama models effortlessly:
```python
import os
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.models.ollama import OllamaModel

def get_agent_model():
    """
    Availability Fallback Invariant:
    - Gemini 4 Argon -> Gemini 3.8 Flash
    - Claude Opus 5.5 -> Claude Opus 4.6
    """
    env = os.getenv("ENV", "production")
    if env == "production":
        try:
            return AnthropicModel('claude-opus-5.5')
        except Exception:
            return AnthropicModel('claude-opus-4.6')
    elif env == "staging":
        try:
            return GoogleModel('gemini-4-argon')
        except Exception:
            return GoogleModel('gemini-3.8-flash')
    else:
        # Zero cost local development with Ollama
        return OllamaModel(model_name='qwen2.5-coder:7b')
```

#### 3. Deterministic Testing with `TestModel`
Write unit tests that verify tool invocations and structured output parsing without calling live LLMs:
```python
import pytest
from pydantic_ai.models.test import TestModel

@pytest.mark.asyncio
async def test_security_agent_tool_dispatch():
    # TestModel can simulate deterministic responses or tool calls
    test_model = TestModel(call_tools=['query_audit_logs'])
    
    with security_agent.override(model=test_model):
        deps = DatabaseDeps(pool=mock_pool, tenant_id="tenant_123")
        result = await security_agent.run("Audit user 456", deps=deps)
        assert result.data is not None
```

#### 4. Streaming Structured Output Validation (`run_stream`)
Stream typed Pydantic models with real-time field-level validation as tokens arrive:
```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class IncidentTriage(BaseModel):
    severity: str = Field(description="Low, Medium, High, or Critical")
    affected_components: list[str] = Field(default_factory=list)
    immediate_actions: list[str] = Field(default_factory=list)
    root_cause_hypothesis: str

triage_agent = Agent[None, IncidentTriage](
    model=PRIMARY_MODEL,
    result_type=IncidentTriage,
    system_prompt="You are a real-time site reliability incident responder."
)

async def stream_incident_triage(incident_log: str):
    try:
        async with triage_agent.run_stream(f"Triage incident: {incident_log}") as response:
            async for partial_triage in response.stream_structured():
                print(f"[Streaming Partial Validation] Severity: {partial_triage.severity}, Actions: {len(partial_triage.immediate_actions)}")
            
            final_result = await response.get_data()
            return final_result
    except Exception:
        # Availability Fallback Invariant: Seamless degradation to Gemini 3.8 Flash
        with triage_agent.override(model=FALLBACK_MODEL):
            async with triage_agent.run_stream(f"Triage incident: {incident_log}") as response:
                async for partial_triage in response.stream_structured():
                    print(f"[Streaming Fallback Validation] Severity: {partial_triage.severity}, Actions: {len(partial_triage.immediate_actions)}")
                return await response.get_data()
```

#### 5. Multi-Agent Delegation & Handoffs via `RunContext`
Sub-agents invoked as specialized tools with context isolation:
```python
from dataclasses import dataclass
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

@dataclass
class ResearchContext:
    api_key: str
    deep_mode: bool

class FactReport(BaseModel):
    statement: str
    verified: bool
    source_citation: str

class SynthesisReport(BaseModel):
    executive_summary: str
    verified_facts: list[FactReport]

# Specialist Sub-Agent (Fast validation)
verifier_agent = Agent[ResearchContext, FactReport](
    model='google-gla:gemini-3.8-flash',
    result_type=FactReport,
    system_prompt="Fact-check individual technical claims against primary specifications."
)

# Availability Fallback Invariant: Claude Opus 5.5 -> Claude Opus 4.6
DIRECTOR_PRIMARY = 'anthropic:claude-opus-5.5'
DIRECTOR_FALLBACK = 'anthropic:claude-opus-4.6'

# Root Orchestrator Agent
director_agent = Agent[ResearchContext, SynthesisReport](
    model=DIRECTOR_PRIMARY,
    result_type=SynthesisReport,
    system_prompt="Analyze claims and delegate individual verification to the verifier tool."
)

@director_agent.tool
async def verify_claim(ctx: RunContext[ResearchContext], claim: str) -> FactReport:
    """Delegates verification of a specific claim to the specialized verifier agent."""
    sub_result = await verifier_agent.run(claim, deps=ctx.deps)
    return sub_result.data

async def conduct_synthesis(claim_text: str, context: ResearchContext) -> SynthesisReport:
    try:
        result = await director_agent.run(claim_text, deps=context)
        return result.data
    except Exception:
        # Fallback invariant degradation
        with director_agent.override(model=DIRECTOR_FALLBACK):
            result = await director_agent.run(claim_text, deps=context)
            return result.data
```

#### 6. Observability & OpenTelemetry Instrumentation with Pydantic Logfire
Instrument agents with zero boilerplate for token tracking, tool latency, and structured traces:
```python
import logfire
from pydantic_ai import Agent

# 1. Initialize Logfire with automatic OpenTelemetry export
logfire.configure(service_name="secops-pydantic-agent", send_to_logfire=True)
logfire.instrument_pydantic_ai()

# 2. Agent operations are automatically traced with token counts & tool timings
monitor_agent = Agent(
    model='anthropic:claude-opus-5.5', # Availability Fallback: degrades to claude-opus-4.6
    system_prompt="Autonomous database optimization auditor."
)

@monitor_agent.tool_plain
def calculate_index_efficiency(table_name: str, scan_count: int) -> float:
    with logfire.span("evaluate_index_metrics", table=table_name):
        return round(1.0 - (1.0 / (scan_count + 1)), 4)
```

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec pydantic-ai-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | P99 API Gateway Latency < 85ms, OpenAPI 3.1 / TypeSpec strict schema parity, RFC 9457 Problem Details error contracts, Idempotency-Key enforcement; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
