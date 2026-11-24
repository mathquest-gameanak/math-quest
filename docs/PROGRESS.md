# Progress Math Quest

Baca file ini + `GDD.md` di awal setiap sesi kerja. Perbarui setelah setiap tahap.

## Tahapan

| Tahap | Isi | Status |
|---|---|---|
| 0 | Fondasi: GDD, struktur proyek modular, gaya pixel art | **Selesai** (2026-11-24) |
| 1 | Kerangka layar: Utama, Peta (field/dungeon/arena), Karakter, Tas, pertarungan per field, simpanan v2 | **Selesai** (2026-11-24) |
| 2 | Jenis soal kelas 1 → semua 6 field terbuka; soal dibacakan | **Selesai** (2026-11-24) — petunjuk bergambar setelah salah belum |
| 3 | Drop, tas, koin, toko, crafting, equipment (mengisi layar Tas & Karakter) | **Selesai** (2026-11-24) |
| 4 | Dungeon, misi harian, Ujian Naik Kelas | **Selesai** (2026-11-24) |
| 5 | Pertarungan HP + serangan musuh berwaktu + poin status (masukan user) | **Selesai** (2026-11-24) |
| 5b | Laporan Orang Tua (+ Mode Santai, bacakan otomatis), petunjuk bergambar | **Selesai** (2026-11-24) — offline ditunda: artifact claude.ai tidak mengizinkan service worker; dibuat saat pindah ke hosting sendiri |
| 6 | Uji coba anak & orang tua lain → penyeimbangan → putuskan jualan | belum |
| 6 | Uji coba ke orang tua lain → putuskan jualan | belum |

## Log

### 2026-11-24 — Tahap 0
- GDD v0.1 ditulis (`docs/GDD.md`).
- Prototipe flat (`prototype/v0-flat.html`) dipecah jadi modul: `js/questions.js`, `save.js`, `audio.js`, `sprites.js`, `data.js`, `game.js`, `css/style.css`.
- Gaya berganti ke **pixel art 2D**: sprite pahlawan, Lendir Hijau, Kelelawar Ungu, Jamur Nakal, bos Raja Naga Api, hati HUD; latar padang rumput digambar di kanvas.
- Diuji di browser ukuran HP: kombo, bos ke-5, naik level, istirahat saat hati habis, simpan & muat ulang. Tidak ada error di console.
- Belum: repo git sendiri, deploy GitHub Pages, cek di HP asli.

### 2026-11-24 — Tahap 1 (urutan diubah atas permintaan user: layar dulu)
- Layar: **Utama** (logo, pahlawan, menu), **Peta** (7 field Kelas 1 + Gua Pola + Arena Latihan, status Main/Selesai/🔒/Segera), **Karakter** (statistik, kemampuan per operasi, slot perlengkapan kosong), **Tas** (16 slot kosong).
- Pertarungan dimulai dari field: soal sesuai field (`spec` di `js/data.js`), bos tiap monster ke-5 per field, kalahkan bos pertama kali → area berikutnya terbuka. XP berkurang bila level pemain di atas rentang field.
- Playable: Padang Hitung (≤5), Hutan Tambah-Kurang (≤10), Danau Dua Puluh (≤20), Arena Latihan (pilih jenis soal). Lainnya "Segera" (butuh Tahap 2/4).
- Monster varian via ganti palet: Lendir Air, Raja Lendir, Jamur Ungu, Raja Jamur, Raja Kelelawar.
- Simpanan v2: area selesai, kill per field, kombo terbaik, benar/salah per operasi (awal pelacak kemampuan). Data v1 terbawa otomatis.
- `game.js` dipecah: `state.js`, `screens.js`, `battle.js`, `main.js`. Timer pertarungan memakai nomor sesi (`B.run`) agar keluar di tengah animasi aman.
- Diuji di browser 375×812: semua alur di atas, tanpa error console.

### 2026-11-24 — Tahap 2
- Format soal baru (lihat komentar di atas `js/questions.js`): `{kind, text, view, speak, ans, choices[{v, html}], cols}`.
- 12 jenis soal (`GEN`): tambah, kurang, kali, isi (□), hitung (apel/bintang, susunan 5 per baris), banding (> < =), bentuk (4 bangun datar + 4 bangun ruang), pola (AB/ABC/AAB/ABB warna×bentuk), panjang (pensil A/B), ukur (pensil di atas kotak), puluhan (ikatan lidi, maks 5 ikat per baris), urutan (sesudah/sebelum/di antara).
- Gambar soal di `js/visuals.js` (SVG + sprite apel/bintang baru di `sprites.js`).
- Tombol 🔊 membacakan soal (Web Speech API, `MQ.Audio.speak`, suara id-ID bila ada).
- Semua 6 field terbuka berurutan: Padang (hitung, banding ≤10) → Hutan (tambah/kurang/isi ≤10) → Bukit (bentuk, pola) → Danau (≤20) → Lembah (panjang, ukur) → Menara (puluhan, urutan, banding ≤100). Kastil Ujian & Gua Pola masih "Segera" (Tahap 4).
- 9 monster varian baru (batu, kayu, daun, malam, ungu).
- Statistik kemampuan kini per jenis soal; Karakter menampilkan namanya.
- Uji: 36.000 soal acak tanpa pilihan ganda/negatif/jawaban hilang; tiap jenis dicoba di layar pertarungan (jawab salah → jawaban benar disorot); tanpa error console.
- Catatan: Danau sekarang butuh bos Bukit (sebelumnya Hutan).

### 2026-11-24 — Tahap 3
- Koin (satu angka `S.coins`) + 6 bahan (lendir, spora, sayap, batu, kayu, mahkota). Drop: monster biasa 1–2 koin + 70% 1 bahan; bos 8 koin + 3 bahan + 1 Mahkota. Bahan per monster di `data.js` (`drop`).
- 14 ikon item 8×8 baru di `sprites.js` (koin, ramuan, bahan, pedang, kapak, tongkat, palu, perisai, cincin); varian lewat palet.
- Equipment 3 slot (`S.equip`): senjata (atk + bonus damage per jenis soal), pelindung (hati maks +), aksesori (koin +/monster, XP +%). Efek dihitung di `state.js` (`effect`, `bonusFor`, `maxHearts`).
- **Toko** (`js/shop.js`): Ramuan Hati, Pedang Kayu, Perisai Kayu. Bayar = soal kembalian (bayar kelipatan 10) atau sisa koin.
- **Pandai Besi**: 7 resep. Bahan kurang → soal "kurang berapa?" + petunjuk field tempat mencarinya; bahan cukup → soal "sisa berapa?" lalu barang dibuat & bisa langsung dipakai.
- Soal transaksi memakai `UI.quiz`: salah tidak dihukum, tombol salah dimatikan, coba lagi.
- Tas: grid ikon + jumlah + tanda E (dipakai); ketuk untuk detail/Pakai/Lepas. Karakter: slot menampilkan equipment.
- Ramuan Hati bisa diminum di pertarungan (tombol di HUD).
- Simpanan v3 (`coins`, `inv`, `equip`), data lama terbawa.
- `MQ.Battle.currentQuestion()` ditambahkan khusus untuk pengujian otomatis.
- Uji: drop setelah 5 monster + bos, beli 2 barang (dengan jawaban salah dulu), pakai pedang, buat Pedang Penjumlah, bonus damage aktif, ramuan; layar Toko/Pandai Besi/Tas/Karakter tidak melebar di 375px; tanpa error.

### 2026-11-24 — Tahap 4
- `battle.js` punya 4 mode (`B.mode`): field, arena, dungeon, exam (penjelasan di atas file).
- **Gua Pola** (dungeon, terbuka setelah bos Bukit): 5 ruang, hati tidak terisi ulang (naik level pun tidak), ramuan boleh. Hati habis → keluar gua, hadiah yang didapat tetap. Ruang 5 = Raja Batu → peti: 15 koin, Ramuan, Mahkota. Bisa diulang.
- **Kastil Ujian** (terbuka setelah 6 area selesai, `reqAll`): 12 soal (2 per area, urut mudah→sulit), salah tidak mengurangi hati, lulus ≥ 9. Lulus pertama: `S.grade = 2`, 30 koin + 2 Mahkota, bintang 1–3. Gagal: tampil 3 topik terlemah + Coba Lagi.
- **Misi Harian** (`js/quests.js`): 3 misi per tanggal HP (kalahkan N monster, jawab benar N soal jenis X, kalahkan bos, kombo N, taklukkan dungeon). Hadiah koin / ramuan diambil di layar Misi. Tanda angka di tombol Misi pada halaman Utama.
- Simpanan v4: `grade`, `examBest`, `daily`.
- Karakter menampilkan kelas & nilai ujian terbaik; Utama menampilkan status kelas.
- Uji: misi terisi & diklaim, dungeon kalah & menang, ujian gagal (6/12, hati tetap) & lulus (12/12), tanpa error.

### 2026-11-24 — Tahap 5 bagian 1 (masukan: "kurang menantang")
- Sistem 5 hati diganti **HP** pemain (bar di HUD). Rumus di komentar atas `js/state.js`.
- **Serangan musuh berwaktu** (`battle.js`: `tick` via requestAnimationFrame, `timerActive`, `enemyAttack`, `knockedOut`). Gaya per jenis tubuh di `Data.styles`; monster batu menimpa `spd`/`power`; tiap area punya `pace`.
- Jawaban salah = serangan balik langsung. Kalahkan monster = pulih 20% HP (bukan di dungeon). Naik level = HP penuh (bukan di dungeon).
- **Poin status**: +3 per level, dibagi di Karakter (HP +10, Serangan +2, Pertahanan +1). Simpanan lama mendapat (level−1)×3 poin. Tanda angka di tombol Karakter.
- Perisai sekarang memberi HP + Pertahanan. Ramuan → "Ramuan Penyembuh" (HP penuh).
- Simpanan v5: `alloc`, `points`.
- Uji: serangan berwaktu terjadi, salah → -4 HP langsung, HP habis → istirahat & HP penuh, timer berhenti saat ada pesan, bagi 3 poin → HP/Serangan/Pertahanan naik; tanpa error.
- Perlu dilihat di HP asli: apakah kecepatan musuh terlalu cepat/lambat untuk anak (atur `Data.styles` / `pace`).

### 2026-11-24 — Tahap 5 bagian 2
- **Petunjuk bergambar** setelah jawaban salah (`q.hint()` di `questions.js`, gambar di `visuals.js` `hint*`): titik tambah/kurang (≤20), dua baris titik untuk bandingkan (≤20), benda bernomor (hitung), kotak bernomor (ukur), puluhan+satuan, garis bilangan (urutan). Jeda 3 detik saat petunjuk tampil. Bentuk/pola/panjang/kali: hanya sorot jawaban benar.
- **Layar Untuk Orang Tua** (`js/parent.js`, tautan kecil di bawah menu Utama): gerbang soal perkalian 2 digit × 1 digit (ketik), ringkasan, 7 hari terakhir (menit main, benar/salah), kemampuan per jenis soal (Perlu latihan <70% / Cukup / Mahir ≥85%, minimal 5 soal), saran area latihan, pengaturan.
- **Pengaturan**: Mode Santai (tanpa serangan berwaktu; salah tetap diserang balik), Bacakan soal otomatis.
- Catatan harian `S.days` (detik main, benar, salah; 30 hari). Simpanan v6: `days`, `settings`.
- Uji: petunjuk tampil per jenis (300/300), gerbang salah/benar, Mode Santai menghentikan bar serangan, tanpa error.

### 2026-11-24 — PWA & git
- Repo git lokal dibuat di folder ini (commit pertama = Tahap 0–5).
- PWA: `manifest.webmanifest`, ikon `icons/`, `sw.js` (cache `mq-v1`), pendaftaran di `js/main.js`. Diuji: setelah server dimatikan, game tetap terbuka dari cache.
- Hosting: GitHub Pages dari repo publik `mathquest-gameanak/math-quest` (organisasi GitHub milik akun danapeta; branch `main`, root) → https://mathquest-gameanak.github.io/math-quest/ . Push ke `main` = situs ikut berubah (ingat naikkan `VERSION` di `sw.js`).
- **Jangan** hosting di danapeta.github.io: service worker DanaPeta (Workbox NavigationRoute) mengambil alih semua halaman di origin itu, dan origin yang sama berarti berbagi penyimpanan dengan aplikasi keuangan.
- Email commit repo ini memakai noreply GitHub (bukan email pribadi).

### 2026-11-24 — Tahap 6 putaran 1 (masukan tampilan dari user)
- **Buat Karakter** (`js/create.js`, `js/hero.js`): nama, rambut (kuncir/panjang/pendek), warna rambut, kulit, gaun/baju, warna pakaian. Muncul saat pertama main (`S.hero` kosong); bisa diubah dari Karakter → "Ubah penampilan".
- **Pahlawan berlapis** 16×16: badan → pakaian → rambut → aksesori → perisai → senjata. Equipment terlihat (pedang/kapak/tongkat/palu sesuai ikon item, perisai, kalung, bintang).
- **Halaman Utama modern**: profil + koin + tombol 👪 kecil di kanan atas, logo besar, pahlawan di tengah, tombol PETUALANGAN, dan **bilah tombol bawah** (Beranda, Karakter, Tas, Toko, Pandai Besi, Misi) di layar menu.
- **Orang Tua → Data Permainan**: salin/unduh kode cadangan (`MQ1:` + base64 JSON), pulihkan dari kode/file, hapus semua progress (dengan konfirmasi).
- **`js/balance.js`**: semua angka keseimbangan (HP/serangan pemain, poin per level, HP & damage monster, XP, hadiah) + penjelasan cara mengatur. Nilai belum diubah.
- Simpanan v7: `hero`. SW `mq-v2`.

### 2026-11-24 — Tahap 6 putaran 2
- **Peta Petualangan bergambar** (`js/map.js`): kanvas 160×560 piksel digulir; wilayah padang → hutan → bukit → danau (pulau) → lembah → menara (malam) → kastil; Gua Pola di samping bukit, Arena di samping padang. Jalur titik emas (terbuka) / abu (terkunci). Pahlawan berdiri di atas tujuan berikutnya, peta langsung digulir ke sana. Ketuk tempat → kartu keterangan + tombol Main.
- **Efek suara baru** (`js/audio.js`): tebasan, serangan khas monster (kelelawar mencicit, lendir "plop", jamur "puff", batu berdentum, naga menggeram), koin, bahan, ramuan, beli, palu Pandai Besi, pasang equipment, peti, fanfare area selesai/lulus ujian, klik menu.
- **Musik chiptune orisinal** 5 lagu: `home` (menu & peta), `field`, `boss`, `dungeon`, `exam` (tanpa drum). Penjadwal not via Web Audio; musik berhenti saat aplikasi tidak terlihat.
- **Volume**: penggeser Musik & Efek di Orang Tua → Pengaturan; tombol 🎵/🔇 di Halaman Utama. Tersimpan di `settings.music` / `settings.sfx`.
- SW `mq-v3`. Diuji di browser: peta & gulir, mulai area dari peta, musik berganti (home → field), semua efek tanpa error, volume tersimpan.

## Catatan dari anak (isi setelah anak bermain)
- 2026-11-24: terasa kurang menantang → ditambah HP & serangan musuh berwaktu.
