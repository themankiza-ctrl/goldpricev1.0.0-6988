## English

### Orchestration & Integration
- **Swarm Directorship & Planning**: `brainstorming`, `zero-to-prod-orchestrator`, `speculative-multi-draft-synthesizer`
- **Foundation Models & Providers**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `gemini-agent-booster`, `vercel-ai-sdk-expert`
- **Tool Execution & MCP Protocols**: `mcp-server-architect`, `parallel-tool-orchestrator`, `doku-mcp-server`
- **Agent Languages & Frameworks**: `pydantic-ai-expert`, `structured-output-contracts`, `python-programming-expert`
- **Memory, State & Telemetry**: `session-memory-manager`, `agentic-memory-architect`, `data-telemetry-expert`
- **Security & Quality Gates**: `anti-slop`, `mcp-sampling-critic`, `autonomous-red-teamer`, `zero-trust-secret-vault`

### Description
Expert guide for designing, building, and deploying production-grade multi-agent AI systems. Covers core agentic design patterns (Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer), stateful graph engines (LangGraph, OpenAI Agents SDK, Google ADK, Mastra.ai), shared episodic/semantic memory, tool execution sandboxes, and human-in-the-loop (HITL) guardrails.

**Swarm Synergy:** This skill acts as a master orchestrator when combined with `mcp-server-architect` (for external tool integration) and `ai-llm-integration-expert` (for foundation model setup). Together, they form a complete, end-to-end **AI Engineering Swarm**.

### Trigger Conditions
- Building autonomous AI agents that execute complex, multi-step tasks across several domains.
- Designing systems where multiple specialized AI agents collaborate, deliberate, and cross-validate.
- Implementing stateful, graph-based agent workflows with LangGraph, OpenAI Agents SDK, or Google ADK.
- Implementing Anthropic agentic design patterns: Evaluator-Optimizer loops, Orchestrator-Workers, or Routing.
- Integrating human-in-the-loop (HITL) pause checkpoints for high-risk actions (code execution, database migrations, financial transactions).
- Evaluating and selecting agent architectures across Python, TypeScript, and multi-platform swarms.

### Anthropic 2026 Core Agentic Design Patterns

Production systems should favor explicit **Workflows** over unbounded autonomous loops where predictability and reliability are required:

```
1. PROMPT CHAINING
   [Input] ---> [LLM Step 1] ---> [Gate/Validator] ---> [LLM Step 2] ---> [Output]

2. ROUTING
   [Input] ---> [Classifier/Router] ──┬──> [Specialist Agent A]
                                     ├──> [Specialist Agent B]
                                     └──> [Specialist Agent C]

3. PARALLELIZATION (Sectioning & Voting)
   [Input] ──┬──> [Task 1 (Subagent)] ──┐
             ├──> [Task 2 (Subagent)] ──┼──> [Aggregator / Synthesizer]
             └──> [Task 3 (Subagent)] ──┘

4. ORCHESTRATOR-WORKERS (Dynamic Decomposition)
   [Input] ---> [Orchestrator] ──┬──> [Worker 1 (Focused Context)] ──┐
                                 ├──> [Worker 2 (Focused Context)] ──┼──> [Orchestrator Synthesis]
                                 └──> [Worker 3 (Focused Context)] ──┘

5. EVALUATOR-OPTIMIZER LOOP (Zero-Tolerance Quality Gate)
   [Input] ---> [Generator Agent] <─────┐ (Feedback Loop)
                       │                 │
                       ▼                 │
               [Evaluator / Auditor] ────┘ (Reject / Needs Revision)
                       │
                       ▼ (Approved)
                   [Output]
```

### Bridging Internal Swarm Patterns
vibes-plug's internal Swarm Director patterns (from `AGENTS.md`) map directly to these external frameworks:
- **Fan-Out / Fan-In topology**: Mapped via LangGraph parallel node execution + reducer functions, or Google ADK sub-agent arrays.
- **Pipeline Saga topology**: Mapped via OpenAI Agents SDK sequential handoffs or Mastra.ai sequential chains.
- **Critic-Validator Loop topology**: Mapped via LangGraph conditional edges routing back to generator nodes.

### Agent Framework Comparison (2026)

| Framework | Language | Best For | Key Differentiator |
|---|---|---|---|
| **LangGraph (v0.3+)** | Python / TypeScript | Complex stateful workflows & graphs | Graph-based, persistent checkpointers, time-travel debugging |
| **OpenAI Agents SDK** | Python | GPT-5.6 Sol / o4-series native agents | Built-in agent handoffs, tracing, and tripwire guardrails |
| **Google ADK** | Python | Gemini-powered swarms | Native Vertex AI, multi-agent streaming, search grounding |
| **Mastra.ai** | TypeScript | TS-first web apps & microservices | Built-in memory, evals, RAG, and native MCP support |
| **CrewAI** | Python | Role-playing business teams & flows | Event-driven Flows, hierarchical manager execution, multi-tier memory |

### Core Implementation Guidelines

#### 1. LangGraph — Persistent State & HITL Checkpoints
LangGraph models agent workflows as directed acyclic or cyclic graphs with persistent state:
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    task: str
    code_artifact: str
    audit_feedback: str
    approved: bool

def generator_node(state: AgentState):
    # Generates or refactors code based on previous feedback
    code = coder_agent.invoke(state["task"], feedback=state.get("audit_feedback"))
    return {"code_artifact": code}

def evaluator_node(state: AgentState):
    # Runs automated linter/tests & security review
    audit = auditor_agent.invoke(state["code_artifact"])
    return {
        "audit_feedback": audit.critique,
        "approved": audit.is_passing
    }

def route_next(state: AgentState) -> str:
    return END if state["approved"] else "generator"

builder = StateGraph(AgentState)
builder.add_node("generator", generator_node)
builder.add_node("evaluator", evaluator_node)
builder.set_entry_point("generator")
builder.add_edge("generator", "evaluator")
builder.add_conditional_edges("evaluator", route_next, {"generator": "generator", END: END})

# Persist state with checkpointer for HITL interruption before destructive actions
checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer, interrupt_before=["generator"])
```

**TypeScript LangGraph Implementation:**
```typescript
import { StateGraph, MemorySaver, END } from "@langchain/langgraph";

const graphState = {
  messages: { value: (x, y) => x.concat(y), default: () => [] },
  approved: { value: (x, y) => y, default: () => false }
};

const builder = new StateGraph({ channels: graphState })
  .addNode("generator", async (state) => ({ messages: [await coder.invoke(state)] }))
  .addNode("evaluator", async (state) => {
    const res = await auditor.invoke(state);
    return { messages: [res.critique], approved: res.isPassing };
  })
  .addEdge("__start__", "generator")
  .addEdge("generator", "evaluator")
  .addConditionalEdges("evaluator", (state) => state.approved ? END : "generator");

const checkpointer = new MemorySaver();
const graph = builder.compile({ checkpointer, interruptBefore: ["generator"] });
```

#### 2. OpenAI Agents SDK — Agent Handoffs & Guardrails
Implement native agent handoffs where specialized agents transition control cleanly:
```python
from agents import Agent, Runner, handoff, input_guardrail, GuardrailFunctionOutput

researcher = Agent(
    name="Researcher",
    instructions="Research libraries, security advisories, and system specs.",
    tools=[web_search, doc_retrieval],
)

architect = Agent(
    name="Architect",
    instructions="Synthesize technical architecture and delegate research when needed.",
    handoffs=[handoff(researcher, tool_name_override="delegate_research")],
)

@input_guardrail
async def safety_guardrail(ctx, agent, input_data) -> GuardrailFunctionOutput:
    if contains_destructive_commands(input_data):
        return GuardrailFunctionOutput(output_info="Blocked destructive payload", tripwire_triggered=True)
    return GuardrailFunctionOutput(output_info="Safe", tripwire_triggered=False)

result = await Runner.run(architect, "Design high-throughput ingestion pipeline", guardrails=[safety_guardrail])
```

#### 3. Google ADK — Gemini Multi-Agent Systems
Orchestrate Gemini 3.x agents with streaming subagent calls and Vertex AI tooling:
```python
from google.adk.agents import Agent
from google.adk.tools import google_search, code_execution

director = Agent(
    model="gemini-3.1-pro",
    name="director",
    instruction="Coordinate domain specialists and synthesize final deliverables.",
    sub_agents=[frontend_agent, backend_agent, security_agent],
    tools=[google_search, code_execution],
)
```

#### 4. Mastra.ai — TypeScript-Native Agents
For modern Next.js / Node.js / Bun environments:
```typescript
import { Agent, MastraMemory } from '@mastra/core';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const researcher = new Agent({
  name: 'researcher',
  instructions: 'Find and summarize accurate technical documentation.',
  model: { provider: 'ANTHROPIC', name: 'claude-sonnet-5.5-20261022' },
  memory: new MastraMemory({ storage: supabaseStorage }),
});
```

#### 5. CrewAI — Role-Playing Crews, Hierarchical Execution & Event-Driven Flows
Combines event-driven application state flows (`Flow`) with autonomous role-playing agent crews (`Crew`), supporting hierarchical delegation and typed Pydantic outputs:

```python
from crewai import Agent, Crew, Process, Task
from crewai.tools import tool
from crewai.flow.flow import Flow, start, listen, router
from pydantic import BaseModel, Field

# 1. Typed State and Output Schemas
class SecurityReport(BaseModel):
    is_vulnerable: bool
    vulnerabilities: list[str] = Field(default_factory=list)
    mitigation_plan: str

class PipelineState(BaseModel):
    target_service: str = "payment-gateway"
    audit_passed: bool = False
    report: SecurityReport | None = None

# 2. Custom Safe Tool
@tool("scan_dependencies")
def scan_dependencies(service_name: str) -> str:
    """Scans service dependencies for known CVEs and outdated packages."""
    return f"Scan complete for {service_name}: 0 critical, 1 low severity vulnerability in OpenSSL binding."

# 3. Define Event-Driven Flow with State & Conditional Branching
class DeploymentFlow(Flow[PipelineState]):
    @start()
    def initialize_pipeline(self):
        print(f"Initializing security pipeline for: {self.state.target_service}")
        return self.state.target_service

    @listen(initialize_pipeline)
    def run_security_crew(self, service: str):
        # Define Specialized Role-Playing Agents
        scanner = Agent(
            role="Security Researcher",
            goal=f"Audit dependencies and network vectors for {service}",
            backstory="Veteran cybersecurity auditor specialized in FinTech compliance and OWASP Top 10.",
            tools=[scan_dependencies],
            verbose=True,
            memory=True
        )

        hardener = Agent(
            role="Systems Hardener",
            goal="Formulate actionable mitigation plans for all identified security vectors",
            backstory="Principal DevSecOps engineer with deep zero-trust and kernel security expertise.",
            verbose=True,
            memory=True
        )

        # Define Tasks with Structured Output and HITL Checkpoint
        audit_task = Task(
            description=f"Analyze all package dependencies and attack surfaces for {service}.",
            expected_output="Raw vulnerability scan assessment.",
            agent=scanner
        )

        remediation_task = Task(
            description="Produce a structured mitigation report and verify if the service is safe for deploy.",
            expected_output="A typed JSON security report matching the SecurityReport schema.",
            agent=hardener,
            output_pydantic=SecurityReport,
            human_input=True
        )

        # Instantiate Hierarchical Crew with Manager LLM
        security_crew = Crew(
            agents=[scanner, hardener],
            tasks=[audit_task, remediation_task],
            process=Process.hierarchical,
            manager_llm="gpt-5.6-sol",
            memory=True,
            verbose=True
        )

        result = security_crew.kickoff()
        self.state.report = result.pydantic
        self.state.audit_passed = not self.state.report.is_vulnerable
        return self.state.audit_passed

    @router(run_security_crew)
    def evaluate_deployment(self):
        if self.state.audit_passed:
            return "deploy"
        return "quarantine"

    @listen("deploy")
    def handle_deployment(self):
        print(f"Service {self.state.target_service} approved for zero-downtime deployment.")

    @listen("quarantine")
    def handle_quarantine(self):
        print(f"Deployment halted: {self.state.target_service} quarantined for remediation.")
```

#### 6. Human-in-the-Loop (HITL) Guardrails
Mandatory safeguards before executing irreversible operations:
- **Interrupt Checkpoints**: Halt workflow execution before executing code, migrating databases, or modifying production records.
- **Approval Dashboards**: Surface diff previews and proposed shell commands to the user or admin before proceeding.
- **Confidence Gates**: Auto-proceed only when model confidence score is >= 0.90; trigger human escalation otherwise.

#### 7. Swarm Circuit Breakers & Fallback Protocols
- **Retry Caps**: Maximum 2 automated retries per subagent.
- **Fallback Escalation**: If a specialist agent stalls or loops, the Swarm Director gracefully fallbacks to `fullstack-expert` or requests human guidance.
- **Model Availability Fallback Invariant**: When orchestrating multi-agent swarms, if primary frontier models are unprovisioned or rate-limited:
  - If **Gemini 4** (Argon/Pro) is unavailable, worker and synthesis tasks gracefully fall back to **Gemini 3.8 Flash** (preserving 1M+ context window and rapid TTFT).
  - If **Claude Opus 5.5** is unavailable, deep architectural coordination gracefully falls back to **Claude Opus 4.6** (preserving complex cross-domain synthesis).
- **Checkpoint Persistence**: Always persist intermediate progress to `PROGRESS.md` or `BLUEPRINT.md` so sessions can resume without losing context.

#### 8. Narrative Simulation Swarms (Fable Paradigm)
Multi-agent autonomous story world simulation architecture where agents act as characters.
- **Character-Agent Personality Encoding:** Uses Big Five personality model + emotional valence vectors (joy, anger, fear, surprise, sadness, disgust).
- **Inter-Agent Dialogue Protocols:** Constrained by narrative coherence.
- **World-State Consensus Protocol:** Distributed shared memory with conflict resolution to maintain a consistent simulated reality.
- **Autonomous Episodic Generation:** Agents create story episodes dynamically without human prompting.
- **Director Agent Pattern:** A meta-agent that monitors the swarm and ensures narrative arc consistency.

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { BaseMessage, SystemMessage } from "@langchain/core/messages";

interface WorldState {
  messages: BaseMessage[];
  events: string[];
}

const romeoAgent = async (state: WorldState) => {
  // Encoded with High Openness, High Neuroticism, emotional vectors
  const response = await llm.invoke([
    new SystemMessage("You are Romeo. You are feeling [Joy: 0.8, Sadness: 0.2]. Respond to the world state."),
    ...state.messages
  ]);
  return { messages: [response] };
};

const directorAgent = async (state: WorldState) => {
  // Ensures narrative arc consistency
  const evaluation = await evaluatorLLM.invoke(state.messages);
  return { events: [evaluation.content] };
};
```

#### 9. Computer-Using Agent (CUA) Orchestration
- **CUA Agent Delegation:** Swarm director delegates specific UI tasks to CUA worker agents.
- **Screen-Sharing Observation:** Orchestrator agent observes CUA's visual stream to verify progress.
- **Recovery Protocols:** Handles CUA failures like stuck UI states or navigation errors via visual feedback loops.
- **Parallel CUA Execution:** Multiple CUA workers operate different browser tabs/windows simultaneously.

```typescript
import { CUARunner, CUAWorker } from "cua-orchestration-sdk";

const orchestrator = new CUARunner();
const worker1 = new CUAWorker({ id: "tab-1", objective: "Scrape pricing page" });
const worker2 = new CUAWorker({ id: "tab-2", objective: "Monitor system health" });

orchestrator.registerWorkers([worker1, worker2]);
orchestrator.on("worker_stuck", async (worker, screenshot) => {
  await orchestrator.recoverWorker(worker, screenshot);
});
await orchestrator.executeParallel();
```

#### 10. Continuous Perception Swarms
- **Always-on Monitoring:** 24/7 perception loops capturing multimodal input.
- **Live Video/Audio Triage Agents:** (Intake → Classify → Route) pipelines processing continuous streams.
- **Spatial Awareness Distribution:** Sharing spatial context across the agent swarm.
- **Event-Driven Wakeup Protocols:** Agents remain dormant until a relevant stimulus is detected.
- **Gemini Multimodal Live API Integration:** Native hooks for continuous audio/video perception.

```typescript
import { MultimodalLiveClient } from "gemini-live-sdk";
import { TriageSwarm } from "./swarm";

const client = new MultimodalLiveClient({ apiKey: process.env.GEMINI_API_KEY });
const swarm = new TriageSwarm();

client.on("video_frame", async (frame) => {
  const classification = await swarm.intake(frame);
  if (classification.isCritical) {
    swarm.wakeupSpecialists(classification.type);
    await swarm.route(frame, classification.type);
  }
});
client.connect();
```

#### 11. Massive Parallel Swarms (Agentic MoE) for Next-Gen LLMs
For next-gen models like **Gemini 4 Pro**:
- **Batched Tool Invocation**: Transition from sequential step-by-step orchestrators to massive batched function calling.
- **Monolithic Context Flow**: Pass the entire massive context (codebase snapshot) directly via KV-Cache rather than using chunked RAG retrieval per agent, allowing subagents to natively attend to the exact same shared memory state instantly.

### Sovereign Execution, Token Efficiency & Invariants
| Dimension | Sovereign Mandate & Deterministic Contract |
| :--- | :--- |
| **Frontier Model Cascade** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Availability Fallback** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Zero unhandled missing-model errors) |
| **KV-Cache & Token Protocol** | Pin static instructions & schemas at prompt prefix (`kv-cache-prefix-optimizer`); pass surgical `CONTEXT_MAP.md` slices (<250 tokens/call) during Swarm Fan-Out |
| **SaaT CLI & MCP Dispatch** | CLI: `vibes skill exec multi-agent-orchestration <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **NFR & Anti-Slop Invariants** | P99 API Gateway Latency < 85ms, OpenAPI 3.1 / TypeSpec strict schema parity, RFC 9457 Problem Details error contracts, Idempotency-Key enforcement; 100% complete zero-placeholder output verified via `node scripts/check-anti-slop.js --strict` |

---


---

<a name="bahasa-indonesia"></a>
