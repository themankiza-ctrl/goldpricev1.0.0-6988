## 3. Fisika & Batas Tabrakan Spasial

1. **Collider Wajib Mengikuti Geometri Nyata**:
   - Kotak pembatas (*bounding box*) dasar yang mengecualikan atap bangunan akan menyebabkan karakter melayang menembus atap.
   - Karakter makhluk hidup membutuhkan gabungan collider kapsul majemuk (*compound colliders*) yang mencakup bentang sayap, tanduk, dan ruang gerak putar.
2. **Integrasi Fixed-Timestep (Memisahkan Fisika dari Refresh Rate)**:
   - Gunakan laju simulasi tetap (misal: 60Hz) dengan akumulator waktu untuk mencegah penembusan objek (*tunneling*) dan memastikan stabilitas matematis pada layar 120Hz/ProMotion.

---
