## Production Reverse Engineering Blueprints

### 1. Native Binary (ELF/PE/Mach-O) & Electron ASAR Triage Inspector (TypeScript)

```typescript
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export type BinaryFormat = 'ELF' | 'PE' | 'MACH_O_64' | 'ELECTRON_ASAR' | 'WASM' | 'UNKNOWN';

export interface ArtifactTriageReport {
  readonly filePath: string;
  readonly sha256: string;
  readonly byteSize: number;
  readonly format: BinaryFormat;
  readonly magicHex: string;
  readonly recommendedProvider: 'ghidra' | 'asar-js-inspector' | 'wasm-disassembler' | 'static';
}

export async function triageBinaryArtifact(filePath: string): Promise<ArtifactTriageReport> {
  const buf = await fs.readFile(filePath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const head = buf.subarray(0, 16);
  const magicHex = head.subarray(0, 4).toString('hex');

  let format: BinaryFormat = 'UNKNOWN';
  let recommendedProvider: ArtifactTriageReport['recommendedProvider'] = 'static';

  if (head[0] === 0x7f && head[1] === 0x45 && head[2] === 0x4c && head[3] === 0x46) {
    format = 'ELF';
    recommendedProvider = 'ghidra';
  } else if (head[0] === 0x4d && head[1] === 0x5a) {
    format = 'PE';
    recommendedProvider = 'ghidra';
  } else if (magicHex === 'feedfacf' || magicHex === 'cffaedfe') {
    format = 'MACH_O_64';
    recommendedProvider = 'ghidra';
  } else if (head[0] === 0x00 && head[1] === 0x61 && head[2] === 0x73 && head[3] === 0x6d) {
    format = 'WASM';
    recommendedProvider = 'wasm-disassembler';
  } else if (head.readUInt32LE(0) === 4 && filePath.endsWith('.asar')) {
    format = 'ELECTRON_ASAR';
    recommendedProvider = 'asar-js-inspector';
  }

  return {
    filePath,
    sha256,
    byteSize: buf.byteLength,
    format,
    magicHex,
    recommendedProvider
  };
}
```

### 2. Headless Ghidra PyGhidra Function & Cross-Reference Extractor (Python)

```python
from dataclasses import dataclass
from typing import List

@dataclass(frozen=True)
class DecompiledEvidence:
    symbol_name: str
    entry_point_hex: str
    callers: List[str]
    callees: List[str]
    c_pseudocode: str

def extract_function_evidence(program, decomp_interface, target_func, timeout_sec: int = 30) -> DecompiledEvidence:
    entry_hex = f"0x{target_func.getEntryPoint().toString()}"
    callers = sorted({f.getName() for f in target_func.getCallingFunctions(None)})
    callees = sorted({f.getName() for f in target_func.getCalledFunctions(None)})

    res = decomp_interface.decompileFunction(target_func, timeout_sec, None)
    if not res or not res.decompileCompleted():
        raise RuntimeError(f"Ghidra decompilation timed out or failed at {entry_hex}")

    c_code = res.getDecompiledFunction().getC()
    return DecompiledEvidence(
        symbol_name=target_func.getName(),
        entry_point_hex=entry_hex,
        callers=callers,
        callees=callees,
        c_pseudocode=c_code
    )
```

### 3. Live Web `AgentEnv` HAR Traffic to Endpoint Inventory Mapper (TypeScript)

```typescript
export interface HarEntryLite {
  readonly request: {
    readonly method: string;
    readonly url: string;
    readonly headers: ReadonlyArray<{ readonly name: string; readonly value: string }>;
  };
  readonly response: {
    readonly status: number;
    readonly mimeType: string;
  };
}

export interface DiscoveredApiEndpoint {
  readonly method: string;
  readonly pathnamePattern: string;
  readonly requiresBearerAuth: boolean;
  readonly observedStatusCodes: readonly number[];
}

export function extractApiSurfaceFromHar(entries: readonly HarEntryLite[]): DiscoveredApiEndpoint[] {
  const map = new Map<string, { method: string; pattern: string; auth: boolean; statuses: Set<number> }>();

  for (const entry of entries) {
    const parsedUrl = new URL(entry.request.url);
    const normalizedPath = parsedUrl.pathname.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\/\d+\b/gi,
      '/:id'
    );
    const key = `${entry.request.method.toUpperCase()} ${normalizedPath}`;
    const hasAuth = entry.request.headers.some(
      (h) => h.name.toLowerCase() === 'authorization' || h.name.toLowerCase() === 'x-api-key'
    );

    const existing = map.get(key) ?? {
      method: entry.request.method.toUpperCase(),
      pattern: normalizedPath,
      auth: false,
      statuses: new Set<number>()
    };
    existing.auth = existing.auth || hasAuth;
    existing.statuses.add(entry.response.status);
    map.set(key, existing);
  }

  return Array.from(map.values()).map((item) => ({
    method: item.method,
    pathnamePattern: item.pattern,
    requiresBearerAuth: item.auth,
    observedStatusCodes: Array.from(item.statuses).sort((a, b) => a - b)
  }));
}
```
