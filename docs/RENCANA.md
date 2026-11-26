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
- Perlu dicek: daftar bab Kelas 2 dari buku *Matematika SD/MI Kelas II* Kurikulum Merdeka.

## 4. Level per kelas
- Kelas 1: Normal selesai di Lv 15, Legenda di Lv 40.
- Kelas 2 Normal mulai **Lv 16**.
- Perlu diputuskan: rentang level Pahlawan/Legenda di Kelas 2 dan kelas berikutnya. Usul: tiap kelas naik ±15 level per tingkat.

## 5. Mulai langsung di kelas lebih tinggi (fast leveling)
- Untuk anak yang baru main saat sudah Kelas 2–6: saat profil baru dibuat (atau lewat menu Orang Tua), pilih kelas.
- Level langsung naik ke level awal kelas itu (misal Kelas 2 → Lv 16) dan anak mendapat **equipment standar gratis** yang sesuai tingkat tersebut.
- Kelas yang lebih rendah tetap bisa dibuka di menu Kelas untuk mengulang materi.
- Format save berubah, jadi naikkan `VERSION` di `save.js` dan tambahkan migrasi.
