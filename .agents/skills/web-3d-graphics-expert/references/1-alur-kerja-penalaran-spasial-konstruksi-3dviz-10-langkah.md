## 1. Alur Kerja Penalaran Spasial & Konstruksi 3Dviz (10 Langkah)

Sebuah scene 3D yang dapat dijalankan membutuhkan pertimbangan visual yang matang. Ikuti 10 keputusan ini:

1. **Arah & Maksud Visual**: Tentukan apa yang harus dipahami, dirasakan, atau dilakukan oleh pengguna. Tentukan jarak pandang utama (*overview*, inspeksi, atau *close-up* mikro). Pastikan siluet, material, cahaya, kamera, dan gerakan bekerja selaras.
2. **Penalaran Objek (3 Skala Visual)**: Sebelum memilih template, rumuskan siluet, proporsi, sambungan, karakter permukaan, dan perilaku objek utama. Selesaikan objek yang paling menantang terlebih dahulu.
3. **Representasi Berpijak & Kebenaran Ilmiah**: Tentukan apakah scene berupa ilustrasi, state machine diskrit, simulasi fisika, atau pemutaran animasi. Untuk visualisasi ilmiah, verifikasi rantai: **Klaim/Rumus → Model Matematis → Hasil Visual**.
4. **Rute Konstruksi per Objek**: Pilih rute konstruksi yang tepat (gunakan kit langsung, modifikasi kit, buat geometri kustom, atau gunakan aset pindaian/CAD eksternal).
5. **Kontinuitas Sambungan (*Join Continuity*)**: Pada area sambungan, tentukan apakah objek membutuhkan kulit organik menyatu (*continuous skin*), lapisan bersusun (*layered covering*), atau bagian artikulasi mekanis terpisah.
6. **Arah Material & Pencahayaan**: Rancang respons PBR yang berbeda untuk setiap material (jaringan lunak, logam, batu, kaca). Arahkan cahaya untuk mempertegas bentuk; hindari highlight terpotong (*clipped highlights*) atau bayangan terlalu gelap.
7. **Interaksi Fisik & Batas Spasial**: Pastikan batas tabrakan (*collider*) membungkus mesh visual secara akurat (termasuk atap, sayap, tanduk). Pisahkan tick fisika dari rendering menggunakan akumulator *fixed-timestep*.
8. **Inspeksi Output Nyata di Browser**: Jangan pernah menyimpulkan kualitas visual dari frame yang belum dilihat langsung. Periksa dari sudut overview, oblique, close-up, dan saat interaksi berjalan.
9. **Review Visual & Anti-Slop 3D**: Evaluasi terhadap 16 poin checklist visual. Perbaiki kelemahan bentuk dasar sebelum menambal dengan tekstur atau efek post-processing berlebih.
10. **Laporan Jujur**: Jelaskan secara transparan apa yang dimodelkan secara matematis, apa yang diverifikasi secara numerik, dan bagian mana yang merupakan penyederhanaan artistik.

---
