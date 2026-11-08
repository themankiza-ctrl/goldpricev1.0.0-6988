## Bahasa Indonesia

### Integrasi Orkestrasi
Terhubung dan mengorkestrasi skill domain yang relevan:
- `senior-frontend` — Integrasi React Three Fiber (R3F) pada React 19 / Next.js 15.
- `vue-frontend-expert` — Integrasi TresJS pada Vue 3 / Nuxt 3.
- `svelte-sveltekit-expert` — Integrasi Threlte pada Svelte 5 (Runes).
- `web-game-engine-expert` — Simulasi fisika (Rapier, Jolt, Havok), game loop, dan ECS.
- `glsl-shader-expert` — Bahasa shader, compute shader WGSL, dan node TSL.
- `webxr-ar-vr-expert` — Pengalaman WebXR VR/AR imersif.
- `data-visualization-expert` — Visualisasi data ilmiah 3D dan explainer spasial.
- `ui-ux-pro-max` — Sistem desain antarmuka spasial, ergonomi viewport kanvas, dan kontrol HUD.
- `visual-ui-auditor` — Audit visual multimodal untuk kanvas 3D, frame rate, dan fidelitas pencahayaan.
- `anti-slop` — Anti-slop visual 3D, membasmi orbe bersinar generik dan model proksi murahan.
- `performance-web-vitals` — Meminimalkan TBT (Total Blocking Time) dan optimasi ukuran bundle.

### Deskripsi
Panduan produksi untuk membangun grafis 3D performa tinggi di browser yang dipadukan dengan penalaran spasial mendalam (*Protokol 3Dviz*). Mengutamakan paradigma modern **WebGPU-first** dengan fallback otomatis ke WebGL2, **Three.js (r170+) WebGPURenderer** dan **TSL (Three Shading Language)**, **Babylon.js WebGPUEngine** dengan Snapshot Rendering, **PlayCanvas Engine** untuk performa mobile ekstrem, serta keahlian bentuk objek (*object craft*) lintas **3 skala visual** (siluet, konstruksi, permukaan).

### Kondisi Pemicu
Aktifkan skill ini ketika:
- Menginisialisasi *scene* WebGPU atau WebGL 3D, visualisasi ilmiah, atau model interaktif.
- Menggunakan `three` (`three/webgpu`), `@react-three/fiber`, `@babylonjs/core`, `playcanvas`, `@tresjs/core`, atau `@threlte/core`.
- Merancang model 3D ekspresif atau teka-teki spasial dari awal.
- Menulis shader khusus dalam TSL/WGSL atau geometri prosedural.
- Memperbaiki kelemahan bentuk objek: sambungan robek, artefak pencahayaan (*pinching*), objek mengambang tanpa dasar, atau model generik yang ditutupi tekstur resolusi tinggi.
- Mengonfigurasi batas tabrakan fisik (*collider envelopes*), fisika *fixed-timestep*, atau *continuous collision detection*.
- Mengompresi aset 3D (`.glb`) dengan KTX2 Basis Universal dan Meshopt.
- Mengatasi penurunan FPS (*frame drop*), hambatan *draw call*, atau kebocoran memori VRAM.

---
