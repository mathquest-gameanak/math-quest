# Math Quest

Game RPG matematika pixel art 2D untuk anak SD (mulai kelas 1). Kelak mungkin dijual.

## Wajib dibaca di awal sesi
- `docs/RINGKASAN.md`: ringkasan inti, tujuan, fitur yang sudah ada & rencana lanjutan (mulai dari sini)
- `docs/GDD.md`: desain game (sumber kebenaran; ubah GDD dulu sebelum mengubah desain di kode)
- `docs/PROGRESS.md`: tahap saat ini & log. Perbarui setelah menyelesaikan pekerjaan.

## Aturan
- **Tanpa modal**: tanpa library, tanpa build tool, tanpa server berbayar. HTML + CSS + JS biasa.
- Script klasik dengan namespace global `MQ` (bukan ES module) agar bisa dibuka langsung. Urutan `<script>` di `index.html` penting; `game.js` terakhir.
- Semua teks UI dalam **Bahasa Indonesia**, singkat, untuk anak 6–7 tahun. Angka & teks pakai font tebal yang mudah dibaca, bukan font pixel.
- Sprite ditulis sebagai baris karakter di `js/sprites.js` (format dijelaskan di atas file). Palet tiap sprite memakai warna yang sudah ada.
- Angka keseimbangan (HP, damage, XP, hadiah) hanya diubah di `js/balance.js`.
- Prinsip: tidak ada game over, salah = belajar (tunjukkan jawaban benar).
- `localStorage` selalu dalam try/catch; naikkan `VERSION` di `js/save.js` jika format simpanan berubah dan tambahkan migrasi.

## PWA / offline
- `sw.js` menyimpan semua file game. **Setiap kali file game berubah, naikkan `VERSION` di `sw.js`**, dan tambahkan file JS/CSS baru ke daftar `FILES`; kalau tidak, HP yang sudah menginstal tetap memakai versi lama.
- Service worker hanya jalan di HTTPS/localhost (tidak di artifact claude.ai).

## Menjalankan
Server lokal: `python -m http.server 8123` di folder ini, lalu buka http://localhost:8123 (konfigurasi preview: `C:\proyek\.claude\launch.json`, nama `math-quest`). Uji di ukuran HP (375×812).
