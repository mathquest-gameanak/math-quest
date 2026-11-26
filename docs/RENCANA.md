# Rencana Lanjutan (konsep, belum dikerjakan)

_Dicatat 2026-11-27. Konten Kelas 1 sudah dianggap cukup. Sebelum dikodekan, pindahkan dulu ke `GDD.md`._

## 1. Telur teman (Kiki tidak diubah)
- Teman selain Kiki mulai dari **telur** dan tumbuh lewat item **Makanan Teman** (nama sementara).
- Makanan Teman didapat **1 per hari** dari Misi Harian (hadiah selesai semua misi), jadi tetap ada titik berhenti harian.
- 5 tahap sama seperti Kiki: Telur → Bayi → Anak → Remaja → Dewasa. Total **30 item** (±30 hari per teman):
  | Naik ke | Item |
  |---|---|
  | Menetas (Bayi) | 2 |
  | Anak | 5 |
  | Remaja | 8 |
  | Dewasa | 15 |
- Hanya 1 telur yang diberi makan dalam satu waktu. Teman yang sudah dimiliki tetap ada (migrasi save).

## 2. Kelas disederhanakan
- Masuk Kelas → pilih **Kelas 1–6** (yang belum ada dikunci, tulisan "Segera").
- Pilih kelas → daftar **Bab** sesuai buku. Kelas 1 = 8 bab.
- Pilih bab → materi bab itu. Materi Kelas 1 yang sudah ada dirapikan ke dalam babnya masing-masing.

## 3. Kelas 2–6: petualangan baru
- Tiap kelas punya **cerita, peta, monster, equipment, fashion, dan item** sendiri yang sesuai tingkatnya. Cerita disesuaikan dengan umur anak di kelas itu.
- Jumlah bab mengikuti buku Matematika Kurikulum Merdeka kelas itu, dengan metode ala Singapura (bar model dan lain-lain). Jangan memakai merek "Singapore Math".
- **Dungeon = gabungan 2 bab**, jadi jumlah dungeon = jumlah bab ÷ 2 (dibulatkan ke atas).
- Kemungkinan ada fitur, peta, atau jenis dungeon baru di kelas tertentu (mulai Kelas 3?) agar lebih bervariasi. Belum diputuskan.
- **Bab Kelas 2 (sementara, BELUM diverifikasi):** situs buku Kemdikbud tidak bisa diakses dari sini, dan daftar isi buku Yudhistira tidak ditemukan online. Usulan topik (Fase A Kurikulum Merdeka, hanya 1 judul yang terkonfirmasi):
  1. Bilangan sampai 1.000 (terkonfirmasi sebagai bab 1 buku Kemdikbud)
  2. Penjumlahan & pengurangan (bersusun, bar model)
  3. Perkalian (penjumlahan berulang, kelompok sama)
  4. Pembagian (bagi rata)
  5. Pecahan sederhana (1/2, 1/4)
  6. Pengukuran panjang & berat
  7. Waktu (jam) & uang
  8. Bangun datar & bangun ruang
  9. Data & diagram gambar
  → Sekitar 9 bab, jadi 5 dungeon. Cocokkan dengan daftar isi buku Yudhistira milik sekolah (foto daftar isi cukup) sebelum dikerjakan.

## 4. Level per kelas
- Kelas 1: Normal selesai di Lv 15, Legenda di Lv 40.
- Kelas 2 Normal mulai **Lv 16**.
- **Rentang Kelas 2 (usulan):** Normal Lv 16–30, Pahlawan 31–45, Legenda 46–55. Kelas berikutnya mengikuti pola yang sama: awal Normal = akhir Normal kelas sebelumnya + 1, dan Legenda bertambah ±15 level.
- **Agar anak berlevel tinggi (misal Lv 40) tidak terlalu mudah menang di Kelas 2 Normal:**
  - Monster Kelas 2 menyesuaikan level: level monster = maks(level area, level anak − 3). Batas atasnya level tertinggi tingkat itu.
  - Equipment Kelas 2 punya stat dasar lebih tinggi, jadi equipment Kelas 1 +10 kira-kira setara equipment dasar Kelas 2.
  - Tantangan utama tetap materi baru. Menang agak cepat di Normal masih wajar.

## 5. Mulai langsung di kelas lebih tinggi (fast leveling)
- Untuk anak yang baru main saat sudah Kelas 2–6: saat profil baru dibuat (atau lewat menu Orang Tua), pilih kelas.
- Level langsung naik ke level awal kelas itu (misal Kelas 2 → Lv 16) dan anak mendapat **equipment standar gratis** yang sesuai tingkat tersebut.
- Kelas yang lebih rendah tetap bisa dibuka di menu Kelas untuk mengulang materi.
- Format save berubah, jadi naikkan `VERSION` di `save.js` dan tambahkan migrasi.
