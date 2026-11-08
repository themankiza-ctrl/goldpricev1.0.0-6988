## 2. Keahlian Bentuk Objek: 3 Skala Visual (*Object Craft*)

Menambahkan banyak objek pendukung tidak akan menutupi kelemahan pemodelan pada objek utama. Kualitas bentuk harus diselesaikan pada tiga skala:

### Skala 1: Siluet (*The Silhouette Test*)
- Objek harus dapat dikenali seketika hanya dari siluet hitam-putih tanpa mengandalkan warna atau cahaya.
- Spesies makhluk yang berbeda memerlukan struktur proporsi tulang yang berbeda, bukan sekadar model yang sama yang diberi warna berbeda.
- Fitur yang mengubah garis luar objek wajib dimodelkan sebagai **geometri nyata**, bukan sekadar peta normal (*normal map*).

### Skala 2: Konstruksi & Kontinuitas Sambungan
- **Sambungan Kulit Organik**: Hindari batas persimpangan mesh yang canggung; buat sambungan topologi kontinu atau lakukan remeshing/CSG union yang halus.
- **Lapisan Armor / Bulu**: Pastikan memiliki ketebalan nyata, urutan tumpang-tindih yang teratur, dan jangkar pangkal yang jelas.
- **Artikulasi Mekanis**: Poros dan bantalan harus memiliki toleransi ruang (*clearance*) visual yang masuk akal.

### Skala 3: Perlakuan Permukaan & Material
- Berikan detail permukaan (arah serat kayu, jahitan kain, area kontak aus) hanya pada skala yang terlihat oleh kamera.
- Hindari kebisingan prosedural (*random procedural noise*) yang seragam di seluruh permukaan.

### Implementasi Babylon.js WebGPU, Gaussian Splatting & CSG 2.0
```typescript
import {
  WebGPUEngine,
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Constants,
  GaussianSplattingMesh,
  CSG2
} from '@babylonjs/core';

export async function inisialisasiSceneBabylon(canvas: HTMLCanvasElement) {
  // 1. Inisialisasi WebGPUEngine dengan fallback otomatis ke WebGL2
  let engine: WebGPUEngine | Engine;
  if (await WebGPUEngine.IsSupportedAsync) {
    const webgpuEngine = new WebGPUEngine(canvas, { antialias: true, adaptToDeviceRatio: true });
    await webgpuEngine.initAsync();
    // Snapshot Rendering mode FAST: mereduksi overhead CPU draw call hingga 10x lipat
    webgpuEngine.snapshotRendering = true;
    webgpuEngine.snapshotRenderingMode = Constants.SNAPSHOTRENDERING_FAST;
    engine = webgpuEngine;
  } else {
    engine = new Engine(canvas, true);
  }

  const scene = new Scene(engine);

  // 2. 3D Gaussian Splatting (.spz / .splat / .ply) dengan GPU compute radix sorting
  const splatMesh = new GaussianSplattingMesh('heroSplat', null, scene);
  await splatMesh.loadFileAsync('https://assets.babylonjs.com/splats/lod.spz');

  // 3. CSG 2.0 (Manifold Math Kernel): operasi boolean solid tanpa cacat internal face
  const kotak = MeshBuilder.CreateBox('kotak', { size: 2 }, scene);
  const silinder = MeshBuilder.CreateCylinder('silinder', { diameter: 1.2, height: 3 }, scene);
  
  const csgKotak = CSG2.FromMesh(kotak);
  const csgSilinder = CSG2.FromMesh(silinder);
  const hasilCSG = csgKotak.subtract(csgSilinder);
  
  const meshHasil = hasilCSG.toMesh('strukturBerlubang', null, scene);
  kotak.dispose();
  silinder.dispose();

  const light = new HemisphericLight('cahaya', new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  engine.runRenderLoop(() => {
    scene.render();
  });

  return { engine, scene };
}
```

---
