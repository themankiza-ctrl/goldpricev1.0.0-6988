## Bahasa Indonesia

### Integrasi Orkestrasi
- **Bahasa Python & Runtime**: `python-programming-expert`, `structured-output-contracts`
- **Framework Agen & Swarm**: `multi-agent-orchestration`, `ai-llm-integration-expert`, `frontier-ai-models-expert`
- **Protokol MCP & Tools**: `mcp-server-architect`, `parallel-tool-orchestrator`
- **Persistensi & Database**: `database-orm-expert`, `vector-db-rag-expert`
- **Evaluasi & Pengujian**: `autonomous-tdd-debugger`, `property-mutation-testing-expert`, `anti-slop`
- **Siklus Hidup & Tata Kelola**: `zero-to-prod-orchestrator`, `session-memory-manager`

### Deskripsi
Panduan produksi untuk membangun agen AI kelas perusahaan menggunakan **Pydantic AI** (dari pembuat library Pydantic). Tidak seperti library agen yang tidak bertipe statis atau mudah mengalami galat runtime, Pydantic AI menyediakan sistem tipe statis yang ketat (`Agent[DepsType, ReturnType]`), *dependency injection* bawaan kelas satu (`RunContext[Deps]`), validasi parameter tool otomatis melalui skema Pydantic v2, fleksibilitas pergantian model (*model-agnostic*), dan hasil output terstruktur yang terjamin validitasnya.

**Sinergi Swarm:** Di dalam **Backend & APIs Swarm**, skill ini bertindak sebagai Insinyur Agen AI Python Utama. Bertanggung jawab atas eksekusi logika bisnis kritis, orkestrasi pipeline data, dan query database SQL dengan keamanan tipe kompilasi pada Fase 4.

### Kondisi Pemicu
- Membangun agen otonom Python yang menuntut keamanan tipe statis dan validasi skema data ketat.
- Menerapkan injeksi dependensi (koneksi database, klien HTTP, session user) ke dalam tool agen tanpa variabel global.
- Mengekstrak data terstruktur yang dijamin valid dari model penalaran tanpa kegagalan parsing JSON.
- Menjalankan unit test dan evaluasi deterministik pada agen menggunakan model tiruan (`TestModel`).

---

### Implementasi Pola Kunci (Python 3.13+)

#### 1. Agen Type-Safe dengan Injeksi Dependensi Database
```python
from dataclasses import dataclass
import asyncpg
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

@dataclass
class DependensiDatabase:
    pool: asyncpg.Pool
    tenant_id: str

class LaporanAnomali(BaseModel):
    user_id: str
    skor_risiko: float = Field(ge=0.0, le=1.0)
    peristiwa_anomali: list[str]
    tindakan_disarankan: str

# Agen dengan tipe statis ketat: Agent[TipeDependensi, TipeHasil]
MODEL_UTAMA = 'google-gla:gemini-4-argon'
MODEL_PENGALIHAN = 'google-gla:gemini-3.8-flash'

agen_keamanan = Agent[DependensiDatabase, LaporanAnomali](
    model=MODEL_UTAMA,
    result_type=LaporanAnomali,
    system_prompt=(
        "Anda adalah auditor keamanan SecOps otomatis. Analisis log aktivitas "
        "dan hasilkan evaluasi anomali terstruktur."
    ),
)

@agen_keamanan.system_prompt
async def tambahkan_konteks_tenant(ctx: RunContext[DependensiDatabase]) -> str:
    return f"Tenant ID Aktif: {ctx.deps.tenant_id}. Hanya audit catatan milik tenant ini."

@agen_keamanan.tool
async def query_log_audit(ctx: RunContext[DependensiDatabase], user_id: str, batas: int = 50) -> list[dict]:
    """Mengambil riwayat autentikasi pengguna dari database audit."""
    async with ctx.deps.pool.acquire() as conn:
        baris = await conn.fetch(
            "SELECT event_time, ip_address, action, status FROM audit_logs "
            "WHERE tenant_id = $1 AND user_id = $2 ORDER BY event_time DESC LIMIT $3",
            ctx.deps.tenant_id, user_id, batas
        )
        return [dict(b) for b in baris]

# Eksekusi agen secara aman dengan Invarian Pengalihan Ketersediaan:
async def jalankan_audit(pool: asyncpg.Pool, tenant_id: str, target_user: str) -> LaporanAnomali:
    deps = DependensiDatabase(pool=pool, tenant_id=tenant_id)
    try:
        hasil = await agen_keamanan.run(f"Audit aktivitas user {target_user}", deps=deps)
        return hasil.data  # Dijamin merupakan instance tervalidasi dari LaporanAnomali
    except Exception:
        # Fallback otomatis ke Gemini 3.8 Flash jika Gemini 4 belum siap
        with agen_keamanan.override(model=MODEL_PENGALIHAN):
            hasil = await agen_keamanan.run(f"Audit aktivitas user {target_user}", deps=deps)
            return hasil.data
```

#### 2. Pergantian Model Dinamis & Fallback SLM Lokal (Ollama)
Pydantic AI memungkinkan pergantian tanpa friksi antara model cloud frontier dan model open-weights lokal:
```python
import os
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.models.google import GoogleModel
from pydantic_ai.models.ollama import OllamaModel

def ambil_model_agen():
    """
    Invarian Pengalihan Ketersediaan:
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
        # Pengembangan lokal zero-cost menggunakan Ollama
        return OllamaModel(model_name='qwen2.5-coder:7b')
```

#### 3. Pengujian Unit Deterministik Menggunakan `TestModel`
Tulis pengujian unit yang memvalidasi pemanggilan tool dan parsing output terstruktur tanpa biaya API live:
```python
import pytest
from pydantic_ai.models.test import TestModel

@pytest.mark.asyncio
async def test_eksekusi_tool_agen():
    model_tes = TestModel(call_tools=['query_log_audit'])
    with agen_keamanan.override(model=model_tes):
        deps = DependensiDatabase(pool=mock_pool, tenant_id="tenant_123")
        hasil = await agen_keamanan.run("Audit user 456", deps=deps)
        assert hasil.data is not None
```

#### 4. Validasi Output Terstruktur Real-Time (`run_stream()`)
Stream model Pydantic dengan validasi level-properti saat token diterima secara bertahap:
```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class TriaseInsiden(BaseModel):
    tingkat_keparahan: str = Field(description="Rendah, Sedang, Tinggi, atau Kritis")
    komponen_terdampak: list[str] = Field(default_factory=list)
    tindakan_segera: list[str] = Field(default_factory=list)
    hipotesis_akar_masalah: str

agen_triase = Agent[None, TriaseInsiden](
    model=MODEL_UTAMA,
    result_type=TriaseInsiden,
    system_prompt="Anda adalah responder insiden keandalan infrastruktur real-time."
)

async def stream_triase_insiden(log_insiden: str):
    try:
        async with agen_triase.run_stream(f"Triase insiden: {log_insiden}") as respons:
            async for triase_parsial in respons.stream_structured():
                print(f"[Streaming Validasi Parsial] Keparahan: {triase_parsial.tingkat_keparahan}, Tindakan: {len(triase_parsial.tindakan_segera)}")
            
            hasil_akhir = await respons.get_data()
            return hasil_akhir
    except Exception:
        # Invarian Pengalihan: Degradasi mulus ke Gemini 3.8 Flash
        with agen_triase.override(model=MODEL_PENGALIHAN):
            async with agen_triase.run_stream(f"Triase insiden: {log_insiden}") as respons:
                async for triase_parsial in respons.stream_structured():
                    print(f"[Streaming Fallback Validasi] Keparahan: {triase_parsial.tingkat_keparahan}, Tindakan: {len(triase_parsial.tindakan_segera)}")
                return await respons.get_data()
```

#### 5. Delegasi & Handoff Multi-Agen Berbasis `RunContext`
Panggil sub-agen sebagai tool terspesialisasi dengan isolasi konteks dependensi:
```python
from dataclasses import dataclass
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext

@dataclass
class KonteksRiset:
    kunci_api: str
    mode_mendalam: bool

class LaporanFakta(BaseModel):
    pernyataan: str
    terverifikasi: bool
    sitasi_sumber: str

class LaporanSintesis(BaseModel):
    ringkasan_eksekutif: str
    fakta_terverifikasi: list[LaporanFakta]

# Sub-Agen Spesialis Verifikasi (Cepat & Akurat)
agen_verifikator = Agent[KonteksRiset, LaporanFakta](
    model='google-gla:gemini-3.8-flash',
    result_type=LaporanFakta,
    system_prompt="Verifikasi kebenaran klaim teknis berdasarkan dokumen spesifikasi primer."
)

# Invarian Pengalihan Ketersediaan: Claude Opus 5.5 -> Claude Opus 4.6
DIREKTUR_UTAMA = 'anthropic:claude-opus-5.5'
DIREKTUR_PENGALIHAN = 'anthropic:claude-opus-4.6'

# Agen Utama / Direktur Sintesis
agen_direktur = Agent[KonteksRiset, LaporanSintesis](
    model=DIREKTUR_UTAMA,
    result_type=LaporanSintesis,
    system_prompt="Analisis laporan dan delegasikan verifikasi klaim ke tool verifikator."
)

@agen_direktur.tool
async def verifikasi_klaim(ctx: RunContext[KonteksRiset], klaim: str) -> LaporanFakta:
    """Mendelegasikan verifikasi klaim tertentu ke sub-agen spesialis."""
    sub_hasil = await agen_verifikator.run(klaim, deps=ctx.deps)
    return sub_hasil.data

async def jalankan_sintesis(teks_klaim: str, konteks: KonteksRiset) -> LaporanSintesis:
    try:
        hasil = await agen_direktur.run(teks_klaim, deps=konteks)
        return hasil.data
    except Exception:
        # Fallback invariant degradasi
        with agen_direktur.override(model=DIREKTUR_PENGALIHAN):
            hasil = await agen_direktur.run(teks_klaim, deps=konteks)
            return hasil.data
```

#### 6. Observabilitas & Tracing OpenTelemetry dengan Pydantic Logfire
Instrumentasi performa agen, pelacakan konsumsi token, dan latensi tool secara otomatis:
```python
import logfire
from pydantic_ai import Agent

# 1. Konfigurasi Logfire dengan ekspor OpenTelemetry otomatis
logfire.configure(service_name="secops-pydantic-agent", send_to_logfire=True)
logfire.instrument_pydantic_ai()

# 2. Operasi agen terlacak secara otomatis dalam dasbor telemetri
agen_pemantau = Agent(
    model='anthropic:claude-opus-5.5', # Invarian Pengalihan: degradasi ke claude-opus-4.6
    system_prompt="Auditor pengoptimalan database otonom."
)

@agen_pemantau.tool_plain
def hitung_efisiensi_indeks(nama_tabel: str, jumlah_scan: int) -> float:
    with logfire.span("evaluasi_metrik_indeks", tabel=nama_tabel):
        return round(1.0 - (1.0 / (jumlah_scan + 1)), 4)
```

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec pydantic-ai-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
