## Bahasa Indonesia

### Integrasi Orkestrasi
- **Direktur Swarm & Perencanaan**: `brainstorming`, `zero-to-prod-orchestrator`, `speculative-multi-draft-synthesizer`
- **Model Fondasi & Penyedia**: `ai-llm-integration-expert`, `frontier-ai-models-expert`, `gemini-agent-booster`, `vercel-ai-sdk-expert`
- **Eksekusi Alat & Protokol MCP**: `mcp-server-architect`, `parallel-tool-orchestrator`, `doku-mcp-server`
- **Bahasa & Framework Agen**: `pydantic-ai-expert`, `structured-output-contracts`, `python-programming-expert`
- **Memori, State & Telemetri**: `session-memory-manager`, `agentic-memory-architect`, `data-telemetry-expert`
- **Keamanan & Gerbang Kualitas**: `anti-slop`, `mcp-sampling-critic`, `autonomous-red-teamer`, `zero-trust-secret-vault`

### Deskripsi
Panduan ahli untuk merancang, membangun, dan men-deploy sistem multi-agen AI tingkat produksi. Mencakup pola desain agentik inti (Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer), engine graph stateful (LangGraph, OpenAI Agents SDK, Google ADK, Mastra.ai), memori bersama episodik/semantik, sandbox eksekusi tool, dan guardrail human-in-the-loop (HITL).

**Sinergi Swarm:** Skill ini bertindak sebagai orkestrator utama jika dipadukan dengan `mcp-server-architect` (untuk integrasi tool eksternal) dan `ai-llm-integration-expert` (untuk konfigurasi foundation model). Bersama-sama, ketiganya membentuk **AI Engineering Swarm** yang tangguh dari awal hingga rilis produksi.

### Kondisi Pemicu
- Membangun agen AI otonom yang mengeksekusi tugas kompleks multi-langkah lintas domain.
- Merancang sistem kolaborasi, deliberasi, dan validasi silang antar beberapa agen AI spesialis.
- Mengimplementasikan alur kerja graph stateful dengan LangGraph, OpenAI Agents SDK, atau Google ADK.
- Menerapkan 5 pola desain agentik standar: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, atau Evaluator-Optimizer.
- Mengintegrasikan pos henti human-in-the-loop (HITL) untuk tindakan berisiko tinggi (eksekusi kode, migrasi database, transaksi keuangan).
- Memilih dan mengevaluasi arsitektur agen di ekosistem Python, TypeScript, atau multi-platform.

### 5 Pola Desain Agentik Inti (Standar Anthropic 2026)

Untuk sistem produksi yang handal, utamakan arsitektur **Workflows** terstruktur daripada loop otonom tanpa batas:

1. **Prompt Chaining**: Memecah tugas menjadi langkah-langkah sekuensial dengan validasi output di setiap transisi.
2. **Routing**: Mengklasifikasikan input pengguna dan mengarahkannya ke model atau sub-agen yang memiliki spesialisasi yang tepat.
3. **Parallelization (Sectioning & Voting)**: Menjalankan beberapa sub-agen secara simultan untuk tugas independen atau menjalankan ensemble untuk konsensus voting.
4. **Orchestrator-Workers**: Agen orkestrator pusat memecah masalah dinamis, mendelegasikannya ke pekerja dengan konteks terfokus, lalu merangkum hasil akhirnya.
5. **Evaluator-Optimizer Loop**: Agen pembuat (*generator*) menghasilkan solusi sementara agen penilai (*evaluator*) memberikan audit dan umpan balik hingga standar kualitas terpenuhi.

### Perbandingan Framework Agen (2026)

| Framework | Bahasa | Terbaik Untuk | Keunggulan Utama |
|---|---|---|---|
| **LangGraph (v0.3+)** | Python / TypeScript | Alur kerja graf stateful kompleks | Berbasis graf, checkpointer persisten, time-travel debugging |
| **OpenAI Agents SDK** | Python | Agen native GPT-5.6 Sol / o4-series | Handoff antar agen bawaan, tracing, dan guardrail otomatis |
| **Google ADK** | Python | Swarm agen bertenaga Gemini | Integrasi Vertex AI native, streaming multi-agen, search grounding |
| **Mastra.ai** | TypeScript | Web apps & microservice TS-first | Memori bawaan, evaluasi otomatis, RAG, dan dukungan MCP native |
| **CrewAI** | Python | Tim kolaborasi peran & flow terstruktur | Event-driven Flows, eksekusi manajer hierarkis, memori multi-tier |

### Panduan Implementasi Inti

#### 1. LangGraph — State Persisten & Checkpoint HITL
Memodelkan alur agen sebagai graf terarah dengan state bersama dan penyimpanan checkpoint:
- Simpan state di database (PostgreSQL / MemorySaver) agar alur kerja dapat dijeda dan dilanjutkan kapan saja.
- Terapkan `interrupt_before` sebelum node yang menjalankan perintah destruktif untuk meminta persetujuan manusia (*Human-in-the-loop*).

#### 2. OpenAI Agents SDK — Handoffs & Guardrails
Terapkan transisi kendali yang mulus antar agen dengan fungsi `handoff` bawaan serta pasang filter `guardrail` pada input dan output untuk mencegah eksekusi instruksi berbahaya.

#### 3. Google ADK — Multi-Agent Gemini
Bangun hierarki agen dengan model Gemini 3.x, di mana root agent mengoordinasikan sub-agents untuk riset, eksekusi kode, dan pembuatan dokumen.

#### 4. Mastra.ai — Solusi TypeScript Penuh
Gunakan Mastra untuk ekosistem Next.js dan Node.js: sediakan memori persisten ke Supabase/PostgreSQL, integrasikan tool MCP secara langsung, dan manfaatkan framework evaluasi bawaan.

#### 5. CrewAI — Tim Kolaborasi Agen, Eksekusi Hierarkis & Event-Driven Flows
Menggabungkan alur status aplikasi berbasis peristiwa (`Flow`) dengan tim agen otonom berbasis peran (`Crew`), mendukung delegasi hierarkis dan output Pydantic yang terstruktur:

```python
from crewai import Agent, Crew, Process, Task
from crewai.tools import tool
from crewai.flow.flow import Flow, start, listen, router
from pydantic import BaseModel, Field

# 1. Skema State dan Output Terstruktur
class LaporanKeamanan(BaseModel):
    is_vulnerable: bool
    vulnerabilities: list[str] = Field(default_factory=list)
    mitigation_plan: str

class StatePipeline(BaseModel):
    target_service: str = "payment-gateway"
    audit_passed: bool = False
    laporan: LaporanKeamanan | None = None

# 2. Tool Kustom Aman
@tool("pindai_dependensi")
def pindai_dependensi(service_name: str) -> str:
    """Memindai dependensi layanan terhadap kerentanan CVE yang diketahui."""
    return f"Pemindaian {service_name}: 0 kerentanan kritis, 1 peringatan tingkat rendah pada modul OpenSSL."

# 3. Alur Kerja Event-Driven (Flow) dengan State & Percabangan Kondisional
class PipelineDeploymentFlow(Flow[StatePipeline]):
    @start()
    def inisialisasi_pipeline(self):
        print(f"Menginisialisasi pipeline audit keamanan untuk: {self.state.target_service}")
        return self.state.target_service

    @listen(inisialisasi_pipeline)
    def jalankan_crew_keamanan(self, service: str):
        # Definisikan Agen Kolaboratif Berbasis Peran
        auditor = Agent(
            role="Auditor Keamanan",
            goal=f"Audit dependensi dan celah serangan untuk {service}",
            backstory="Pakar keamanan siber spesialisasi regulasi FinTech dan standar OWASP Top 10.",
            tools=[pindai_dependensi],
            verbose=True,
            memory=True
        )

        engineer = Agent(
            role="DevSecOps Engineer",
            goal="Menyusun langkah mitigasi terstruktur untuk seluruh temuan keamanan",
            backstory="Arsitek infrastruktur zero-trust dan rekayasa keandalan sistem.",
            verbose=True,
            memory=True
        )

        # Definisikan Tugas dengan Output Terstruktur dan Checkpoint HITL
        tugas_audit = Task(
            description=f"Periksa seluruh dependensi pustaka dan attack surface pada {service}.",
            expected_output="Hasil pemindaian dependensi mentah.",
            agent=auditor
        )

        tugas_mitigasi = Task(
            description="Buat laporan mitigasi dan verifikasi apakah layanan aman untuk di-deploy.",
            expected_output="Laporan JSON terstruktur sesuai skema LaporanKeamanan.",
            agent=engineer,
            output_pydantic=LaporanKeamanan,
            human_input=True
        )

        # Inisialisasi Crew dengan Eksekusi Manajer Hierarkis
        crew_keamanan = Crew(
            agents=[auditor, engineer],
            tasks=[tugas_audit, tugas_mitigasi],
            process=Process.hierarchical,
            manager_llm="gpt-5.6-sol",
            memory=True,
            verbose=True
        )

        hasil = crew_keamanan.kickoff()
        self.state.laporan = hasil.pydantic
        self.state.audit_passed = not self.state.laporan.is_vulnerable
        return self.state.audit_passed

    @router(jalankan_crew_keamanan)
    def evaluasi_rilis(self):
        if self.state.audit_passed:
            return "deploy"
        return "karantina"

    @listen("deploy")
    def tangani_deploy(self):
        print(f"Layanan {self.state.target_service} disetujui untuk rilis produksi zero-downtime.")

    @listen("karantina")
    def tangani_karantina(self):
        print(f"Rilis ditangguhkan: {self.state.target_service} dikarantina untuk perbaikan celah keamanan.")
```

#### 6. Guardrails Human-in-the-Loop (HITL)
Pengamanan wajib sebelum melakukan tindakan yang tidak dapat dibatalkan:
- **Pos Henti Interupsi**: Hentikan eksekusi sebelum menjalankan skrip shell berbahaya, migrasi skema tabel, atau memodifikasi data produksi.
- **Tinjauan Pratinjau**: Tampilkan ringkasan perbedaan (*diff*) kepada pengguna sebelum modifikasi dieksekusi.
- **Ambang Keyakinan**: Otomatis lanjutkan hanya jika skor keyakinan model >= 0.90; eskalasikan ke manusia jika berada di bawah ambang batas.

#### 7. Circuit Breakers & Protokol Pemulihan Swarm
- **Batas Percobaan Ulang**: Maksimal 2 kali perbaikan otomatis per sub-agen.
- **Eskalasi Fallback**: Jika agen spesialis mengalami kendala konteks atau gagal berulang kali, Swarm Director segera mengalihkan tugas ke `fullstack-expert` atau meminta masukan pengguna.
- **Invarian Fallback Ketersediaan Model**: Saat mengorkestrasi swarm multi-agen, jika model primer belum tersedia atau terkena batasan kuota:
  - Jika **Gemini 4** (Argon/Pro) belum tersedia, tugas pekerja dan sintesis secara otomatis dialihkan ke **Gemini 3.8 Flash** (mempertahankan context window 1M+ dan latensi instan).
  - Jika **Claude Opus 5.5** tidak tersedia, tugas koordinasi arsitektur dialihkan ke **Claude Opus 4.6** (mempertahankan penalaran mendalam dan sintesis lintas domain).
- **Persistensi Kemajuan**: Simpan selalu checkpoint di `PROGRESS.md` atau `BLUEPRINT.md` agar alur kerja dapat dilanjutkan secara efisien tanpa token berlebih.

#### 8. Swarm Simulasi Naratif (Paradigma Fable)
Arsitektur simulasi dunia cerita otonom multi-agen di mana agen bertindak sebagai karakter.
- **Pengkodean Kepribadian Karakter-Agen:** Menggunakan model kepribadian Big Five + vektor valensi emosional.
- **Protokol Dialog Antar-Agen:** Dibatasi oleh koherensi naratif.
- **Protokol Konsensus Status Dunia:** Memori bersama terdistribusi dengan penyelesaian konflik.
- **Pola Agen Sutradara (Director):** Meta-agen yang memastikan konsistensi alur cerita.

#### 9. Orkestrasi Computer-Using Agent (CUA)
- **Delegasi Agen CUA:** Sutradara mendelegasikan tugas UI ke agen pekerja CUA.
- **Observasi Berbagi Layar:** Orkestrator memantau aliran visual CUA.
- **Protokol Pemulihan:** Menangani kegagalan CUA (UI macet) melalui loop umpan balik visual.
- **Eksekusi CUA Paralel:** Berbagai agen mengoperasikan tab browser berbeda secara bersamaan.

#### 10. Swarm Persepsi Berkelanjutan
- **Pemantauan Selalu Aktif:** Loop persepsi 24/7 yang menangkap input multimodal (video/audio).
- **Agen Triase Langsung:** Pipeline (Intake → Klasifikasi → Rute).
- **Protokol Bangun Berbasis Peristiwa (Event-Driven):** Agen tidur hingga mendeteksi stimulus yang relevan.
- **Integrasi API Live Multimodal Gemini:** Hook bawaan untuk pemrosesan persepsi berkelanjutan.

#### 11. Swarm Paralel Masif (Agentic MoE) untuk LLM Next-Gen
Untuk model generasi berikutnya seperti **Gemini 4 Pro** (Fallback: **Gemini 3.8 Flash**):
- **Pemanggilan Tool Massal (Batching)**: Beralih dari orkestrator sekuensial (bertahap) ke pemanggilan fungsi massal secara serentak.
- **Aliran Konteks Monolitik**: Kirimkan seluruh konteks masif (snapshot codebase) secara langsung melalui KV-Cache, hindari RAG terfragmentasi per agen. Ini memungkinkan sub-agen menganalisis *state* memori yang sama secara instan.

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec multi-agent-orchestration <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
