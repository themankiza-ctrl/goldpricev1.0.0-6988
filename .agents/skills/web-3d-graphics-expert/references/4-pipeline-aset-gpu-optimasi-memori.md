## 4. Pipeline Aset GPU & Optimasi Memori

1. **Kompresi Tekstur KTX2 + Basis Universal**:
   - Menghemat 75%-85% VRAM GPU dibanding PNG/JPG karena tetap terkompresi di dalam memori kartu grafis.
2. **Kompresi Geometri Meshopt**:
   - Dekompresi WASM berkecepatan gigabyte per detik (10x lebih cepat dari Draco pada perangkat mobile).
3. **Pembersihan Siklus Hidup Memori (`.dispose()`)**:
   - Telusuri seluruh hierarki objek dan panggil `.dispose()` pada geometri, material, dan tekstur saat komponen di-unmount agar tidak terjadi kebocoran memori VRAM GPU.

---
