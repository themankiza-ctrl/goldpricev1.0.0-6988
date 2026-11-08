## 7. GPU Asset Pipeline & Memory Optimization

1. **KTX2 + Basis Universal GPU Textures (`KHR_texture_basisu`)**:
   - Compresses textures directly in GPU VRAM (saving 75%-85% VRAM compared to PNG/JPG).
   - Transcodes on the fly into native desktop (BC7) or mobile (ASTC) texture formats.
   ```bash
   npx @gltf-transform/cli optimize input.glb output.glb --texture-compress ktx2
   ```
2. **Meshopt Geometry Compression (`EXT_meshopt_compression`)**:
   - Decompresses at gigabytes per second on WASM (10x faster than Draco on mobile CPUs) and optimizes vertex cache locality.
   ```bash
   npx @gltf-transform/cli meshopt input.glb output.glb
   ```
3. **Strict Memory Lifecycle Management (`.dispose()`)**:
   - Explicitly traverse and dispose geometries, materials, and textures when unmounting scenes:
   ```typescript
   export function purgeThreeObject(root: THREE.Object3D) {
     root.traverse((node) => {
       if ((node as THREE.Mesh).isMesh) {
         const mesh = node as THREE.Mesh;
         mesh.geometry?.dispose();
         if (Array.isArray(mesh.material)) {
           mesh.material.forEach((m) => m.dispose());
         } else if (mesh.material) {
           mesh.material.dispose();
         }
       }
     });
   }
   ```

---
