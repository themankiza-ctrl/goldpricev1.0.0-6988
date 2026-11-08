## 5. Checklist Mandiri Kualitas Grafis 3D (16 Poin)

- [ ] **1. Kejelasan Siluet**: Apakah objek utama terbaca jelas hanya dari siluet hitam-putih?
- [ ] **2. Konstruksi Masuk Akal**: Apakah setiap bagian terhubung dengan ketebalan dan sambungan yang meyakinkan?
- [ ] **3. Kontinuitas Sambungan**: Apakah sambungan kulit halus dan sambungan mekanis terartikulasi tanpa robekan visual?
- [ ] **4. Detail Sesuai Jarak Kamera**: Apakah detail difokuskan pada area yang terlihat oleh kamera tanpa noise acak?
- [ ] **5. Respons PBR Berkarakter**: Apakah setiap material merespons cahaya secara akurat (logam, jaringan lunak, batu)?
- [ ] **6. Pencahayaan Mempertegas Bentuk**: Apakah pencahayaan menghindari highlight terpotong atau bayangan terlalu gelap?
- [ ] **7. Efek Berdasar**: Apakah bloom, fog, dan depth-of-field digunakan secara terarah tanpa menutupi cacat model?
- [ ] **8. Komposisi Terarah**: Apakah framing kamera dan kontras mengarahkan pandangan ke fokus utama?
- [ ] **9. Skala Terbaca**: Apakah satuan metrik, scale bar, atau objek pembanding ditampilkan secara jelas?
- [ ] **10. Proyeksi Kamera Sesuai**: Apakah perspektif atau ortografis dipilih sesuai tujuan komunikasi?
- [ ] **11. Instancing Efisien**: Apakah objek berulang menggunakan `InstancedMesh` tanpa jitter acak yang merusak struktur?
- [ ] **12. Gerakan Bermakna**: Apakah animasi bertujuan jelas dan mematuhi aturan aksesibilitas `prefers-reduced-motion`?
- [ ] **13. Bebas Tembus Spasial**: Apakah objek bergerak terbebas dari tabrakan menembus lantai, atap, atau rintangan?
- [ ] **14. Akurasi Batas Collider**: Apakah collider fisik mencakup seluruh bentuk visual (termasuk atap dan sayap)?
- [ ] **15. Kontrol & Reset Jujur**: Apakah slider dan tombol reset benar-benar mengubah state model dan mengembalikan nilai awal?
- [ ] **16. Kebenaran Klaim Ilmiah**: Apakah model ilmiah/teknis berakar pada referensi yang terverifikasi?

### Matriks Eksekusi Berdaulat, Efisiensi Token & Invarian
| Dimensi | Mandat Berdaulat & Kontrak Deterministik |
| :--- | :--- |
| **Kaskade Model Frontier** | Medium / High (`GPT-5.6 Sol Medium`, `Gemini 4 Argon`, `Claude Sonnet 5.5 High`, `Grok 4.7 High Fast`) |
| **Invarian Fallback Ketersediaan** | `Gemini 4 Argon/Pro` -> `Gemini 3.8 Flash`; `Claude Opus 5.5` -> `Claude Opus 4.6` (Bebas gagal saat model belum tersedia/kuota penuh) |
| **Protokol Hemat Token & KV-Cache** | Kunci instruksi & skema statis di prefix awal (`kv-cache-prefix-optimizer`); kirim potongan `CONTEXT_MAP.md` (<250 token/panggilan) saat Fan-Out |
| **Eksekusi SaaT CLI & MCP** | CLI: `vibes skill exec web-3d-graphics-expert <audit\|eval\|verify\|generate\|blueprint>` / MCP: `vibes_skill_dispatch`, `vibes_ast_query`, `vibes_compile_cache`, `vibes_optimize_budget`, `vibes_verify_gate` |
| **Invarian NFR & Anti-Slop** | Latensi P99 API < 85ms, paritas skema ketat OpenAPI 3.1 / TypeSpec, kontrak error RFC 9457 Problem Details, penegakan Idempotency-Key; kode 100% tuntas tanpa placeholder diverifikasi melalui `node scripts/check-anti-slop.js --strict` |

---
