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

### 2026-11-24 — Penyeimbangan (masukan: kenaikan musuh kurang terasa, area awal terlalu gampang)
- **Level monster naik bertahap**: level awal area +1 setiap 5 monster dikalahkan (maks level tertinggi area), bos +1. Gua: naik tiap ruang. Arena: = level pemain. Ditampilkan di nama ("Jamur Ungu · Lv 6").
- **XP dari level monster**: 8 + 2×level (bos ×3). Pemain ≥3 level di atas monster → XP −25% per level selisih, minimal 10% (kecuali Arena). Muncul tulisan "XP kecil: musuh terlalu lemah".
- **Angka baru** (`balance.js`): Serangan +1/poin (sebelumnya 2), HP +8/poin, HP +6/level, Pertahanan 0,5/poin; monster HP 24 + 9×level, damage (3 + 1,5×level)×kekuatan, bos damage ×1,4.
- Simulasi (15 monster per area): pemain mencapai ~Lv5 di akhir Padang, 8 Hutan, 11 Bukit, 14 Danau, 17 Lembah, 20 Menara (sesuai rentang area). Semua poin ke Serangan = cepat membunuh tapi mudah KO di bos; seimbang = aman tapi lebih lama.
- Orang Tua → **Atur ulang poin status** (kembalikan semua poin untuk dibagi ulang).
- SW `mq-v4`.

### 2026-11-24 — Cerita utama & cutscene (Koleksi & Cerita putaran 1)
- Naskah: GDD bagian 13. Tokoh orisinal: Kakek Bilang, Kiki (burung hantu), Penyihir Kusut; 6 kepingan Kristal Angka.
- **Mesin cutscene** (`js/cutscene.js`): latar pixel tegak, tokoh masuk/jalan/keluar, efek shake/flash/sparkle/shards/dark, teks mengetik, ketuk lanjut, Lewati. Suara: rekaman `audio/vo/<id>.mp3` jika terdaftar di `MQ.Story.VO`, atau suara HP jika "Bacakan otomatis" nyala.
- **Adegan** (`js/story.js`, 45 baris): prolog (sekali, juga untuk pemain lama), intro tiap area (sekali, sebelum bertarung), kepingan setelah bos pertama kali, Penyihir menantang di Menara, intro Kastil, ending saat lulus pertama kali.
- Kastil Ujian butuh 6 area selesai **dan Level 20** (`minLevel`). Halaman Utama menampilkan 💎 kepingan x/6.
- Sprite baru: kakek, penyihir, kiki, crystal, shard. Simpanan v8: `story.seen`. SW `mq-v5`.
- `tools/naskah-suara.js` → `docs/naskah-suara.md` (daftar baris bernomor untuk direkam).

### 2026-11-24 — Kritikal baru & dungeon bercerita
- **Kritikal**: jawab benar ≤3 detik (waktu menjawab aktif, berhenti saat dibacakan/pesan) = pasti kritikal "⚡KILAT!"; selain itu peluang 10% dasar. Damage kritikal dasar ×1,5. Tambahan peluang (`crit`) & damage (`critDmg`) hanya dari equipment. Bar waktu KILAT di atas soal (tidak di ujian). Kombo tidak lagi memicu kritikal (tetap untuk misi). Angka di `balance.js` → `combat`.
- Senjata diberi status kritikal; aksesori baru **Jimat Kilat** (Pandai Besi). Karakter menampilkan peluang & damage kritikal.
- **3 dungeon bercerita** (cutscene intro → monster kunci → akhir, tampil sekali; bisa diulang untuk XP):
  - Gua Pola (Momo si tikus tanah, kunci: Penjaga Pola, 5 ruang)
  - Kapal Karam (Kapten Kumis, kunci: Kepiting Besar, bos Raja Kepiting, 6 ruang, setelah Danau)
  - Perpustakaan Tua (Hantu Buku, kunci: Hantu Tinta, bos Raja Tinta, 7 ruang, setelah Lembah)
- Monster kunci: HP ×1,5, XP ×2, label "⭐ KUNCI". Sprite baru: momo, kapten, crab, ghost; latar cutscene gua/kapal/perpus; bunyi serangan kepiting & hantu.
- Naskah suara kini 68 baris. SW `mq-v6`.

### 2026-11-24 — Koleksi: Buku Monster, Medali, Kostum
- **Buku Monster** (`js/collection.js`, tombol di Halaman Utama): 27 kartu; belum ditemukan = bayangan + petunjuk lokasi. Detail: cerita (`lore` di data.js), drop (+Mahkota untuk bos), lokasi (area/dungeon/arena), gaya bertarung (dari kecepatan & kekuatan), jumlah dikalahkan dengan bintang 1/10/25.
- **Medali** (22): monster, bos, kristal, lulus, 3 dungeon, kombo, KILAT, ahli per jenis soal, Buku Monster, level, Pandai Besi, hari bermain. Diperiksa setelah tiap monster kalah, peti dungeon, ujian, dan di Halaman Utama; hadiah koin atau kostum.
- **Kostum kepala** (7, dari medali): telinga kucing, pita besar, mahkota bunga, mahkota emas, topi bajak laut, topi penyihir, kacamata. Dipilih di Buat Karakter (Ubah penampilan); tampil di semua gambar pahlawan.
- Simpanan v9: `bestiary`, `medals`, `costumes`, `kilat`, `crafted`, `hero.costume`. SW `mq-v7`.

### 2026-11-25 — 🧪 Atur Angka (eksperimen keseimbangan)
- KILAT jadi ≤ 2 detik (`combat.fastCritSec`).
- Rumus HP/damage/jeda musuh disatukan di `MQ.Calc` (balance.js), dipakai pertarungan & pratinjau. Angka baru: `hpGrowthPct`, `dmgGrowthPct` (naik berlipat), `speedMul`, `startCharge`, `pauseWhileReading`, `keyHpMul`.
- Layar **Atur Angka** (`js/tuner.js`, dari Orang Tua): ±99 angka (karakter, musuh, kecepatan per jenis & monster khusus, pace & level area, XP/hadiah), tersimpan di `localStorage['mathQuest.tuning']` terpisah dari progress. Pratinjau per area: HP musuh, jumlah pukulan, damage/KO, jeda, berapa kali musuh sempat menyerang, XP. Alat: set level pemain, isi HP, naik/turunkan level monster area. Salin/tempel angka, kembalikan ke awal. Gerbang orang tua terbuka 10 menit setelah lolos. SW `mq-v9`.
- Temuan: dengan angka awal musuh kalah dalam 2–3 pukulan di semua area dan sering tidak sempat menyerang.

### 2026-11-25 — Efek suara rekaman (Kenney, CC0)
- 25 MP3 (154 KB) di `audio/sfx/` dari Kenney Interface Sounds & RPG Audio (asli di `C:\proyek\math-quest-aset\kenney`, di luar repo). Kredit: `audio/sfx/CREDITS.txt`.
- `audio.js`: `SAMPLES` + `sample()`; dimuat saat suara dibuka, varian acak, lewat bus efek (ikut volume). Gagal/belum termuat → suara buatan kode.
- Dipakai: klik, kembali, toggle, bagi poin (confirm), tebasan, koin, loot, equip, pandai besi, peti, Buku Monster (buka & balik halaman), pintu dungeon. Jawaban benar/salah, serangan monster, level up, fanfare & musik tetap buatan kode.
- Keterangan poin status di Karakter kini mengikuti balance.js. SW `mq-v10`.

### 2026-11-25 — Contoh tampilan "Petualangan" (Kenney UI Pack Pixel Adventure, CC0)
- `css/skin-kenney.css` aktif hanya dengan `body.skinK` (Orang Tua → Pengaturan → Tampilan Petualangan, atau `?skin=k` / `?skin=0`; disimpan di `localStorage['mathQuest.skin']`, bawaan mati).
- Ubin 32px di `ui/` (16 KB): panel perkamen, kayu, baja, pita merah, tombol kayu diwarnai ulang (hijau/merah/kuning/cyan/pink/lime/biru). border-image 9-slice ×2, pixelated.
- Perkamen untuk isi (tulisan cokelat), kayu untuk bilah atas/HUD/soal/tab, tombol jawaban 4 warna berbingkai, judul pesan di atas pita merah. SW `mq-v11`.
- Belum: ikon/bar HP khusus, slot item, peta & cutscene belum disesuaikan.

### 2026-11-25 — 🎧 Coba Suara + 7 paket Kenney diunduh
- Diunduh ke `C:\proyek\math-quest-aset\kenney` (di luar repo): Music Jingles, Impact Sounds, Emotes Pack, Pixel UI Pack, Minimap Pack, UI Audio, Digital Audio. Seluruh katalog Kenney (219 paket) CC0.
- 50 kandidat efek (396 KB) di `audio/pilihan/`, untuk 12 efek: benar, salah, serang, kritikal, terkena, monster kalah, naik level, medali, peti, koin, tombol, ramuan.
- Layar **Coba Suara** (`js/soundlab.js`, dari Orang Tua): ketuk untuk mendengar & memilih; disimpan di `localStorage['mathQuest.sfxPick']`. `audio.js` membungkus semua `sfx.*`: pilihan yang termuat diputar, selain itu suara bawaan. "Salin pilihan" untuk dijadikan bawaan. SW `mq-v12`.

### 2026-11-25 — Tampilan Petualangan jadi bawaan, semua layar
- `body.skinK` sekarang **bawaan**; tampilan lama (biru) dipilih lewat Orang Tua → Pengaturan (disimpan `'lama'` di `localStorage['mathQuest.skin']`), atau `?skin=0`.
- Ditambah ke `skin-kenney.css`: latar cokelat tua, kotak cekung krem di dalam perkamen (slot tas/perlengkapan, ringkasan, isian, pilihan Buat Karakter), kartu Buku Monster & Medali perkamen/emas, bingkai kayu peta & arena, ikon peta (hijau/emas/baja), tombol mode, kotak bicara cutscene, tombol Orang Tua.
- Teks pendek agar tidak terpotong: info beranda `LV 1 · 💎 0/6`, Buku `👾 0/27`, Medali `🏅 0/22`. SW `mq-v13`.

### 2026-11-25 — Suara pilihan orang tua jadi bawaan
- `DEFAULT_PICKS` di `audio.js`: benar pizzi01, salah pizzi03, kritikal zap1, terkena plateL, monster kalah nes07, naik level nes00, tombol uiRoll1, ramuan phaserUp3. Serang, medali, peti, koin tetap suara lama.
- Coba Suara: ★ = bawaan, chip "Suara lama" = suara buatan kode; HP hanya menyimpan yang berbeda dari bawaan. SW `mq-v14`.

### 2026-11-25 — Angka kecil, halaman Dungeon, Mode Pahlawan, ikon beranda
- **Angka kecil** (`balance.js`): HP pahlawan 20 + 2/level, serangan 5 + ½/level (tetap, tidak acak), kritikal ×2; monster HP 12 + 3×Lv, damage 1,6 + 0,35×Lv; bos HP ×1,5. 1 poin status per level (HP +3, ATK +1, DEF ½). Rumus bersama `MQ.Calc.playerHp/playerAtk`. Simpanan lama: poin dikembalikan sekali (jumlah poin ≠ (level−1)×poin per level → dibagi ulang). Equipment diperkecil (Pedang Kayu +1, Perisai Kayu HP +4, dll).
- **Halaman Dungeon** (`js/dungeon.js`, tab 🏰 di bilah bawah menggantikan Misi): kartu per dungeon (gambar bos, materi, level, cerita), tingkat ⭐/⭐⭐/⭐⭐⭐ dari `balance.tiers` (level +0/+3/+6, jeda ×1/0,85/0,7, hadiah ×1/1,5/2). `S.dungeonStars`. Dungeon tidak lagi di peta (gambarnya tetap hiasan). Keluar dungeon → kembali ke halaman Dungeon.
- **Mode Pahlawan ⭐⭐**: tombol di atas Peta setelah lulus ujian; area biasa level +4, jeda ×0,8, koin ×1,5; `S.heroMode`, `S.heroCleared`. Medali baru: Penakluk Dungeon (semua ⭐⭐⭐), Pahlawan Sejati (6 bos Mode Pahlawan).
- **Beranda**: ikon kecil Buku/Misi/Medali di kiri (badge misi pindah ke sini); tombol besar Buku & Medali dihapus.
- Atur Angka: grup baru "Tingkat dungeon & Mode Pahlawan". Simpanan v10. SW `mq-v15`.

### 2026-11-25 — Bahan khusus dungeon, Mode Pahlawan lebih berat, bilah bawah 5 tombol
- Bilah bawah: Tas, Karakter, **Beranda (tengah)**, Dungeon, Toko. Pandai Besi pindah ke ikon kiri beranda (Buku, Misi, Medali, Pandai Besi; ikon diperkecil).
- Mode Pahlawan: level +6, HP musuh ×1,4, damage ×1,6, jeda ×0,7, koin ×2 (`balance.heroMode`, juga `hpMul`/`dmgMul` per tingkat dungeon; ⭐⭐⭐ ×1,2).
- Bahan khusus: Kristal Pola (Gua Pola → senjata), Mutiara Laut (Kapal Karam → pelindung), Tinta Bintang (Perpustakaan → aksesori). Dari peti (2/3/4 per ⭐) & monster kunci. 6 equipment baru di Pandai Besi: Pedang Kristal/Pahlawan, Perisai Mutiara/Pahlawan, Jimat Tinta, Mahkota Bijak.
- GDD §14: rencana skala angka Kelas 1–6 (HP puluhan → ratusan → ribuan → puluhan ribu, mengikuti rentang bilangan sekolah). SW `mq-v16`.

### 2026-11-25 — 🎨 Contoh grafik baru: Padang Hitung 5 titik (percobaan)
- `contoh-padang.html` + `js/contoh-padang.js` (terpisah dari game, belum memakai simpanan): pahlawan berjalan di latar berlapis (langit bertingkat, matahari, awan, bukit jauh, pohon, jalan tanah, bunga, papan nomor, bendera bos), 5 titik: 1, 2, ⭐ mini bos, 4, 👑 bos. Kanvas 1 piksel dunia = 3 piksel layar.
- `js/pixelart.js` (MQ.Pix): sprite dari bentuk (elips/kotak) + garis tepi otomatis. Pahlawan 30×27 (mata berkilau, pipi, kuncir berpita, animasi jalan/serang/terkena), Lendir Hijau (tunas daun), Lendir Air (tetes), Lendir Bunga (mini bos), Raja Lendir 38×34 (mahkota, kumis).
- Dibuka dari Orang Tua → 🎨 Contoh tampilan baru. Menunggu pendapat sebelum diterapkan ke game.
- Orang tua suka (2026-11-25). Arena diperluas: mengisi sisa tinggi layar (HUD, soal & tombol diringkas, bar 5 titik pindah ke dalam arena), skala piksel 3–5× mengikuti tinggi arena (±4× di HP biasa) sehingga tokoh ikut membesar.

### 2026-11-25 — Grafik baru tahap 1: arena besar & jalur 5 titik di game
- `js/scene.js` (MQ.Scene): kanvas pertarungan bergerak (dipindah dari contoh): latar berlapis + kamera, pahlawan berjalan, monster muncul/terkena/menyerang/meletup, tebasan. Tema warna per tempat (padang, hutan, bukit, danau, lembah, menara malam, kastil senja, arena pasir, gua kristal, kapal bawah air, perpustakaan rak buku). Skala piksel 3–5× dikunci per pertarungan (tinggi arena / 88).
- `battle.js`: area = 5 titik (`B.stops`/`B.stage`), level naik merata, ⭐ mini bos (data `mini`, Padang = Lendir Bunga baru; area lain = monster biasa lebih besar, HP ×keyHpMul, kekuatan ×1,2), bos titik 5 → `fieldEnd` (Ulangi area / Ke Peta). Dungeon berjalan antar ruang. Arena & Ujian tanpa jalur.
- Layar pertarungan: arena mengisi sisa tinggi layar, soal & tombol diringkas, bar titik di bawah arena. Sprite baru dipakai bila ada (Lendir, Lendir Air, Lendir Bunga, Raja Lendir); lainnya sprite lama ×2. Pahlawan masih sprite lama (tahap 2).
- SW `mq-v19` (+ pixelart.js, scene.js).

### 2026-11-25 — Grafik baru tahap 2: pahlawan 32×32
- `hero.js` ditulis ulang: pahlawan digambar dari bentuk (MQ.Pix) 32×32 dengan semua pilihan (3 rambut, 5 warna rambut, 3 kulit, gaun / baju & celana, 6 warna), 7 kostum (telinga kucing, pita besar, mahkota bunga, mahkota emas, topi bajak laut, topi penyihir, kacamata berlensa), senjata per ikon (pedang, kapak, tongkat, palu; warna dari item), perisai, aksesori (kalung koin, jimat kilat/tinta, cincin bintang, mahkota bijak). Frame idle/jalan/serang/terkena dipakai di pertarungan (`Hero.currentCanvas`).
- Kulit lama `#ffcd75` (sama dengan warna emas) dipetakan ke `#ffd8b0`. `pixelart.js` dimuat sebelum `hero.js`.
- Gambar pahlawan di beranda, peta, & cutscene diperbesar (ada ruang kosong untuk topi/senjata). SW `mq-v20`.

### 2026-11-25 — Grafik baru tahap 3: semua 28 monster
- `js/monsters.js`: fungsi gambar per jenis tubuh (lendir, jamur, kelelawar bersayap runcing bergerigi, kepiting bermata tangkai, hantu berekor gelombang, naga) dengan pilihan ciri (mahkota emas untuk raja, tekstur batu, motif papan catur, helm, bintang, gelembung, sayap daun, sayap halaman buku, cincin kayu, tetesan tinta, mata menyala, alis marah). Raja ±38 piksel, naga 46×40.
- `MQ.Pix.url(id, skala, siluet)` → gambar persegi untuk Buku Monster (siluet gelap bila belum ditemukan), kartu Dungeon, dan cutscene. Pertarungan memakai `MQ.Pix.has(id)`.
- SW `mq-v21` (+ monsters.js).

### 2026-11-25 — Grafik baru tahap 4: latar khusus tiap tempat
- `js/backgrounds.js` (MQ.Backdrops) + kait lapisan di `scene.js` (sky2, far, mid, floor, front, noMidHills). Padang: pagar kayu & kupu-kupu. Hutan: hutan rapat, batang pohon tinggi, berkas cahaya, kunang-kunang. Bukit: gunung bersalju berlapis. Danau: air beriak bergerak, teratai, pulau berpohon. Lembah Ukur: mesa bertingkat & tongkat ukur merah-putih. Menara: bulan sabit, menara berjendela menyala, kota malam, lentera. Kastil: kastil berbendera di langit senja, obor. Arena: tribun penonton & panji. Gua Pola: dinding gua, kristal bercahaya, stalaktit. Kapal Karam: cahaya dari permukaan, kapal tenggelam, rumput laut bergoyang, ikan, gelembung, dasar pasir. Perpustakaan: jendela bulan, lampu gantung, lantai kayu, halaman beterbangan.
- SW `mq-v22` (+ backgrounds.js).

### 2026-11-25 — Tahap 5: dua monster sekaligus, Mode Legenda, tingkatkan equipment
- **Dua monster**: `B.other` (monster kedua, field sama dengan sasaran; ganti sasaran = tukar isi). Muncul sesuai `balance.pairs` (Pahlawan: titik 4; Legenda: titik 2 & 4) dan dungeon ⭐⭐ (ruang sebelum bos) / ⭐⭐⭐ (ruang genap). Masing-masing punya bar serangan; panel kedua `#mTop2` (ketuk untuk ganti), ketuk monster di kanvas (`Scene.hitTest`), tanda ▼ di atas kepala sasaran. Sasaran kalah → pindah otomatis.
- **Mode Legenda ⭐⭐⭐**: `S.storyMode` 0/1/2 (simpanan lama heroMode → 1), `S.legendCleared`, `balance.legendMode` (+12 lv, HP ×1,8, dmg ×2,2, jeda ×0,6, koin ×3), terbuka setelah 6 bos Pahlawan. Saklar peta berputar Normal → Pahlawan → Legenda.
- **Tingkatkan +1..+5** (Pandai Besi → tab ✨ Tingkatkan): `S.upgrades`, `balance.upgrade` (bahan khusus slot × tingkat, koin 10 × tingkat, Mahkota mulai +4; senjata ATK +1, pelindung HP +3 & DEF +½, aksesori krit +2% & krit dmg +5% per tingkat). Soal "sekarang X, naik Y, jadi berapa?". Nama item tampil "+n".
- Medali baru: Legenda Matematika, Ahli Tempa. Atur Angka: angka Legenda & upgrade. Simpanan v11. SW `mq-v23`.

### 2026-11-25 — Tokoh cerita digambar ulang (grafik baru selesai)
- `js/characters.js`: Kakek Bilang (botak berjanggut putih, jubah hijau, tongkat), Kiki (burung hantu bermata besar, perut bermotif), Penyihir Kusut (kulit hijau, topi ungu berbintang, tongkat sihir; lucu tidak seram), Momo (tikus tanah berhelm tambang berlampu), Kapten Kumis (kucing oranye bajak laut, penutup mata, kumis panjang), Hantu Buku (berkacamata memeluk buku), Kristal Angka & kepingannya. 32×32, ditampilkan seukuran pahlawan di cutscene.
- Semua gambar game sekarang memakai gaya baru (MQ.Pix). SW `mq-v24`.

### 2026-11-25 — Beranda bergerak & pahlawan interaktif, ujian tanpa kunci level
- `js/homescene.js` (MQ.HomeScene): latar beranda Desa Bilangan bergerak (langit bertingkat, matahari, awan berarak, bukit, rumah warna-warni berjendela, pohon, pagar, jalan tanah ke tengah, bunga bergoyang, kupu-kupu) dan Kristal Angka di tugu yang makin bercahaya sesuai kepingan. Menggantikan `Sprites.drawField` di beranda.
- Pahlawan di beranda bisa diketuk: lompat senang (frame baru `happy` ^‿^ + hati), menebas (+ bintang), atau berputar (+ not musik), dengan gelembung kata ("Ayo berhitung!", "Hore!", ...) & bunyi.
- Ikon Buku/Misi/Medali/Pandai Besi tanpa kotak cokelat (ikon + nama bertepi gelap).
- Kastil Ujian tidak lagi butuh Level 20 (tantangan lanjutan sudah ada di Pahlawan & Legenda); teks Kiki disesuaikan. SW `mq-v25` (+ homescene.js).

### 2026-11-26 — Soal cepat vs soal pikir
- `balance.think`: pengali waktu per jenis soal (tambah/kurang/bandingkan 1; hitung/urutan/bentuk 1,3; isi/panjang 1,5; puluhan 1,6; pola/ukur 2; cerita 3 untuk nanti). `Questions.make` memberi `q.time` & `q.think`.
- Pertarungan: bar serangan musuh (kedua monster) terisi `dt / q.time`; batas KILAT = 2 detik × q.time. Soal pikir (≥ 2): bar KILAT diganti tanda "🧠 Soal pikir: santai saja, yang penting teliti!", jawaban benar = serangan 🧠 TELITI! (damage ×1,5).
- Halaman Karakter & Atur Angka ikut menampilkan/mengatur angka ini. SW `mq-v26`.

### 2026-11-26 — Soal cerita & pasangan bilangan
- Jenis soal baru `cerita` (soal cerita bertokoh, wajah tokoh + gambar benda, dibacakan otomatis, petunjuk model batang) dan `pasangan` (number bond & membuat 10 dengan bingkai sepuluh). Gambar & petunjuk di `visuals.js` (story, bar, bar2, bond, tenFrame, hintBar, hintBar2, hintBond, hintTen).
- Masuk ke Hutan Tambah-Kurang (s/d 10), Danau Dua Puluh (s/d 20) dan dungeon Kapal Karam; ikut bonus senjata. Pengali waktu pasangan 1,5.
- Perbaikan: gaya `.dots` penanda titik jalur ikut mengenai titik petunjuk (sekarang `#dots`); petunjuk tidak lagi terpotong 92px; tanda soal pikir disembunyikan saat berjalan. SW `mq-v27`.

### 2026-11-26 — Peti Teka-teki
- `balance.chest`, `GEN.teka` (kind `teka`, pengali waktu 3), gambar `peti` di characters.js, petunjuk `hintSeq/hintNote/hintEqual`. Battle: `maybeChest`, `chestAnswer`, `showQuestion` (dipisah dari nextQuestion); musuh tidak berjalan selama peti.
- Membacakan soal berhenti saat anak menjawab (musuh tidak tertahan oleh suara). SW `mq-v28`.

### 2026-11-26 — Soal panjang lebih adil, tingkat di peta, ujian Pahlawan, pingsan + pelajaran
- Soal panjang: kecepatan musuh tetap normal, damage musuh dibagi pengali waktu (`think.soft` 1, `think.slow` 0). Soal cerita tidak dibacakan otomatis (`think.storySpeak` 0).
- Peta: tombol tingkat jadi dropdown (Normal/Pahlawan/Legenda, gembok + syarat). `State.modeOpen/modeList/storyMode/unlockedIn`: tiap tingkat area terbuka berurutan dari awal. Legenda terbuka setelah lulus Ujian Pahlawan (dicatat 'kastil' di heroCleared).
- Ujian Pahlawan/Legenda: `B.examAtk`, musuh menyerang; lulus → `storyExamPass` (hadiah, buka Legenda), tidak mengubah kelas.
- Pingsan: `js/learn.js` (MQ.Learn) — 14 materi bergambar + latihan tanpa waktu; `balance.knockout` (lockMin 5, mustLearn 1, practice 3); simpanan `rest`; `Learn.gate()` di awal `Battle.start`; spanduk hitung mundur di beranda; ikon 🎓 Pelajaran. Atur Angka: grup Pingsan & Peti.
- SW `mq-v29` (+ learn.js).

### 2026-11-26 — Peta digambar ulang
- `map.js`: medan digambar di ukuran asli 160×560 (diperbesar CSS pixelated) dengan gradasi & batas berbintik; detail per wilayah (desa & pagar padang, pohon berlapis + jamur di hutan, bukit berbayang + batu bentuk + tebing gua, danau berlapis + pulau + teratai + kapal karam, tebing berlapis + kaktus + penggaris raksasa di lembah, malam + bulan + menara batu + perpustakaan, gunung berapi + kastil besar). Jalan tanah bertepi (abu-abu putus-putus bila terkunci).
- Lapisan animasi ~15 fps (hanya saat Peta tampil): kilau air, kunang-kunang, bintang berkelip, bendera berkibar, lava, asap cerobong, kupu-kupu, awan berbayang.
- Tombol tempat memakai potret bos piksel (siluet bila terkunci); nama tempat diberi ikon. SW `mq-v30`.

### 2026-11-26 — Peta: Menara senja & suasana tingkat
- Wilayah Menara Seratus jadi dataran batu ungu saat senja (ubin batu, rumput ungu, kristal, lentera berkedip), bukan langit malam yang janggal di bawah gunung berapi.
- `drawMood`: Pahlawan = senja merah (warna multiply hangat, tepi gelap kemerahan, bara api naik, awan asap, bingkai merah menyala); Legenda = badai ungu gelap (kabut, hujan miring, kilat tiap ±6 detik, bingkai ungu berdenyut). SW `mq-v31`.

### 2026-11-26 — Tablet penuh layar
- `index.html`: skrip kecil di `<head>` mengatur meta viewport di tablet (sisi pendek layar ≥ 600px): tegak `width=480` (browser memperbesar seluruh game sampai penuh lebar), mendatar lebar dihitung supaya tinggi terlihat ±700px. HP tidak berubah. SW `mq-v32`.

### 2026-11-26 — Kurva level baru & musik per suasana
- Hasil main orang tua (tanpa poin status & item): selesai Menara di Lv 12, damage bos 5–8, cukup menantang tapi bisa lebih. Target baru: Normal Lv 1–15, Pahlawan 16–30, Legenda 31–40.
- `balance.js`: XP monster 5 + 3 × level, potongan XP mulai 2 level di atas monster; HP monster 12 + 3,5 × level; damage 2 + 0,55 × level. `heroMode.lv [16,30]`, `legendMode.lv [31,40]` (dipetakan dari level Normal lewat `MQ.Calc.storyLv`, ganti `lvAdd`); Pahlawan HP/damage ×1,15 jeda ×0,8, Legenda HP ×1,3 damage ×1,4 jeda ×0,65. Dungeon ⭐⭐ +7, ⭐⭐⭐ +16.
- `data.js`: level area Normal dipadatkan (Padang 1–3 … Menara 11–14, Kastil 14), dungeon (Gua 5–8, Kapal 7–10, Perpustakaan 10–13). Simulasi sekali jalan: Normal selesai ±Lv 16, Pahlawan ±28, Legenda ±40.
- Musik: lagu `map` (mars D mayor) di layar Peta; lagu cutscene `csCalm`, `csVillain`, `csSad`, `csWin`. `cutscene.js sceneMusic` memilih musik bawaan adegan; langkah cerita bisa mengganti dengan `music` (prolog: tenang → Penyihir → sedih → semangat; Menara: menang → Penyihir → semangat; Kastil: Penyihir → bos; ending: Penyihir → menang). Setelah adegan selesai musik kembali ke layar asal. SW `mq-v33`.

### 2026-11-26 — Upgrade +10, layar Kelas, tarung di iPad
- Upgrade sampai +10 (`balance.upgrade`: tabel biaya per tingkat `coins/mats/crowns`, total ke +10 = 55 bahan khusus, 1055 koin, 11 Mahkota; +6..+10 efek ×2 lewat `strongFrom/strongMul`, `State.upSteps`). Pandai Besi menampilkan efek tiap tingkat (🔥 untuk +6..+10). Medali baru "Tempa Legenda" (+10). Simpanan: batas tingkat 10.
- 🎓 Pelajaran → **Kelas**: ruang kelas (papan tulis berisi materi/latihan, sprite baru `kakekTunjuk` di characters.js, pahlawan + 4 monster dari Buku Monster duduk di bangku, sorak saat benar).
- iPad: viewport tegak = lebar yang membuat tinggi ±812px + `html.tablet` (kolom game penuh lebar), arena tarung jadi setinggi di HP. Skala adegan tarung (scene.js) dihitung dari tinggi arena dikurangi papan nama, dalam piksel layar asli → tokoh lebih besar & tidak tertutup. Papan nama monster ringkas (bar HP & bar serangan berdampingan). Layar rasio ≥ 0,6: soal & tombol jawaban dirapatkan. SW `mq-v34`.

### 2026-11-26 — Dungeon bergambar & angka Tas
- `js/dungeonart.js` (baru): pemandangan luar tiap dungeon & lorong dalam, kanvas 160×96 piksel, animasi ±12 fps hanya saat halaman Dungeon tampil.
- `js/dungeon.js` ditulis ulang: kartu bergambar → halaman dungeon (penghuni, pilih tingkat, isi peti, tombol Masuk). Catatan "HP tidak pulih" pindah ke tombol ⓘ (Aturan Dungeon).
- Tas: angka jumlah barang jadi lencana gelap berangka putih (sebelumnya teks gelap + bayangan gelap di skin Kenney → terlihat berbayang). SW `mq-v35` (+ dungeonart.js).

### 2026-11-26 — Ikon item gaya baru
- `js/itemart.js` (baru): 27 ikon item 24×24 piksel berbayang + garis tepi + kilau (bahan, ramuan, koin, 7 senjata, 4 pelindung, 5 aksesori), digambar dengan MQ.Pix.grid. `UI.itemImg` memakai gambar baru bila ada (cadangan: ikon lama sprites.js); koin di Pandai Besi & tombol ramuan di pertarungan juga. Ikon senjata yang dipegang pahlawan (hero.js) belum diubah. SW `mq-v36` (+ itemart.js).

### 2026-11-26 — Animasi tarung dipoles
- `scene.js`: serangan pahlawan = ancang-ancang → menerjang ke monster (garis kecepatan, jejak tebasan senjata) → MENGENAI → kembali. Saat kena: monster berkedip putih, terpental & tergencet, percikan, bintang benturan, tebasan melengkung (kritikal: dua tebasan + kilat layar), petir biru untuk KILAT, jeda sesaat (hit-stop) & layar bergetar.
- Monster: napas pegas, muncul melompat + debu mendarat; saat bar serangan > 75% bersiap (mundur, gemetar, kedip merah, tanda !); menyerang = menunduk → melompat menerjang → kembali. Pahlawan terluka tepat saat terjangan kena (mundur, kedip merah, layar bergetar, percikan merah).
- Monster kalah: berkedip putih & menggembung lalu pecah jadi bintang + cincin cahaya; pahlawan melompat senang (frame happy). Pahlawan bernapas saat diam.
- battle.js: `Scene.slash(crit, slot, fast)` (efek kena diatur scene), `Scene.charge(slot, k)` dari bar serangan. SW `mq-v37`.

### 2026-11-26 — Momen hadiah meriah & judul pita
- `UI.overlay` mendukung perayaan: `fx` ('medal' | 'level' | 'chest'), `sub` (label kecil), `chips` (hadiah bergambar, muncul satu per satu), konfeti. Medali: cakram emas berpita berputar masuk + sinar; Naik Level: pahlawan melompat, angka level naik; Peti Harta dungeon: peti bergetar lalu terbuka (sprite baru `petiBuka`).
- Koin dari monster & Peti Teka-teki melompat keluar lalu terbang ke pojok kanan atas (`Scene.coins`).
- Perbaikan: judul panjang di pita merah (skin Kenney) keluar dari pita → judul panjang satu baris dengan huruf lebih kecil; medali sekarang berjudul nama medalinya + label "MEDALI BARU". SW `mq-v38`.

### 2026-11-26 — Dunia tarung penuh layar
- Arena pertarungan menutupi seluruh layar; HUD, papan nama monster, kotak soal & jawaban melayang di atasnya. `scene.js resize` mengukur ruang kosong antara HUD dan kotak soal (`--freeTop/--freeBot` di #arena), tanah tepat di atas kotak soal, skala tokoh sebesar mungkin (tinggi ruang & lebar ±92 piksel dunia). Kotak soal berubah tinggi → tanah & tokoh naik-turun perlahan (`refit`, ResizeObserver).
- Kamera memusatkan pahlawan & monster saat bertarung. HUD & tombol jawaban sedikit lebih ringkas; jalur titik pindah ke bawah papan nama; koin terbang ke pojok kanan atas ruang dunia. SW `mq-v39`.

### 2026-11-26 — Tata letak tarung berdampingan
- Atas: HUD pahlawan (kiri, ringkas: ◀, nama tempat, Lv, HP, ramuan, XP) | papan nama musuh (kanan). Bawah: `#qa` = kotak soal (kiri, huruf lebih kecil, tombol 🔊 di bawah soal) | pilihan jawaban 2×2 (kanan). Ruang dunia di tengah jauh lebih tinggi.
- scene.js: ruang dunia diukur dari HUD/papan nama sampai `#qa`; skala tokoh dibatasi lebar ±76 piksel dunia (sebelumnya 92) → tokoh lebih besar (HP ±4,5×, iPad sampai 7×); monster kedua lebih dekat (+12). Batas minimal lebar kanvas 90 dihapus (membuat gambar terpotong). SW `mq-v40`.

### 2026-11-26 — Papan nama musuh di atas monster
- `#mTop` (sasaran) & `#mTop2` (monster lain) melayang tepat di atas kepala monsternya: `Scene.placeTags()` tiap frame, jangkar tetap dari ukuran asli sprite (tidak ikut bergoyang/menerjang), dibatasi di dalam layar. Gaya: kotak gelap tembus pandang + ekor penunjuk; sasaran berbingkai kuning saat dua monster.
- HUD pahlawan tetap di kiri atas. Ruang dunia mulai tepat di bawah HUD (cadangan ±56px untuk papan nama di atas monster). SW `mq-v41`.

### 2026-11-26 — HUD lebar lagi & langit lebih kaya
- HUD pahlawan kembali selebar layar (tombol "◀ Peta", nama tempat, Lv).
- `js/skyart.js` (baru): lapisan langit/atas per tempat (`back` di belakang bukit, `over` di depan lapisan tengah), digambar mulai baris dunia teratas yang terlihat (`H.ST`, di bawah HUD). Padang: awan berlapis, kawanan burung, balon udara. Hutan: kanopi daun + sulur, daun berguguran. Bukit: gunung besar bersalju, awan berbentuk lingkaran/segitiga/persegi, elang. Danau: pelangi, camar putih. Lembah: bukit karang (mesa), elang, debu angin. Menara: bintang berkelip + bintang jatuh, bulan besar berkawah, lentera kertas naik. Kastil: awan badai + kilat + kelelawar. Arena: tali bendera warna-warni. Gua Pola: langit-langit, stalaktit menetes, kristal atap. Kapal Karam: kawanan ikan, ubur-ubur, gelembung. Perpustakaan: lampu gantung bergoyang, halaman melayang.
- Matahari/bulan bawaan digeser ke bawah HUD; bulan sabit lama Menara dihapus. SW `mq-v42` (+ skyart.js).

### 2026-11-26 — Cutscene sinematik, ikon menu 24×24, logo pahlawan tetap
- Cutscene: latar memakai mesin latar pertarungan (`Scene.renderBg` meminjam scene.js + backgrounds.js + skyart.js) → bergerak & detail, kamera bergeser pelan; latar baru `desa` & `malam` (rumah beratap warna-warni, jendela menyala, asap cerobong). Bar hitam atas, bayangan tepi, latar muncul dari gelap saat berganti. Tokoh: ukuran ikut skala layar (HP 3×, iPad 5×), bernapas, melompat kecil saat bicara, yang tidak bicara diredupkan, bayangan. Kotak bicara muncul dari bawah, papan nama kuning melayang, potret berlatar; narator miring di tengah. iPad: cutscene penuh lebar (`html.tablet`).
- Ikon menu 24×24 baru di itemart.js (`ui_*`): logo pahlawan tetap = helm kesatria (kiri atas beranda & bilah bawah "Karakter", tidak ikut penampilan), Tas, Beranda, Dungeon, Toko, Buku, Misi, Medali, Pandai Besi, Kelas, Musik/Bisu, Orang Tua. Dipasang lewat `img[data-ui]`. SW `mq-v44`.

### 2026-11-26 — Filter kategori item
- `UI.filterBar` (screens.js): bilah tombol Semua / Senjata / Pelindung / Aksesori / Ramuan / Bahan (ikon item), hanya kategori yang ada; pilihan diingat per layar. Dipakai di Tas, Toko, Pandai Besi (Buat & Tingkatkan terpisah). Catatan Tingkatkan sekarang "+10". SW `mq-v45`.

### 2026-11-26 — Tombol Petualangan & halaman Karakter baru
- Beranda: tombol "AYO BERTUALANG!" merah menyala (kilau menyapu, memantul, panah bergerak) dengan potret bos tujuan berikutnya + "Lanjut: <area> ⭐" (`MQ.WorldMap.nextGoal()`).
- Karakter ala RPG: kartu pahlawan (sinar berputar, pahlawan bernapas) dengan slot perlengkapan di sekelilingnya (senjata kiri bawah, pelindung kanan bawah, aksesori kanan atas; tingkat +N; slot kosong = ikon pudar), nama + lencana Lv + tombol Ubah + XP. Spanduk poin tersisa, tiga lencana besar ❤️ HP / ⚔️ Serangan / 🛡️ Pertahanan dengan tombol + bulat. Tab Status (kritikal, KILAT, TELITI, bonus koin/XP, poin dibagi) / Kemampuan (bar berwarna, yang perlu dilatih di atas) / Catatan (kelas, ujian, area, monster, kombo, ketepatan). SW `mq-v46`.

### 2026-11-26 — Materi Kelas 1 disamakan dengan buku sekolah (8 bab) + strategi ala Singapura
- Buku acuan: *Matematika 1 SD/MI Kelas I* (Kurikulum Merdeka, Fase A), 8 bab. Area: Padang = Bab 1, Hutan = Bab 2–3, Bukit = Bab 4, Danau Dua Puluh = Bab 5–6, Lembah = Bab 7, **Menara Seratus → Menara Data** = Bab 8 (bilangan sampai 100 dipindah ke Kelas 2). Perpustakaan Tua: bilangan sampai 20 & diagram. Tetap 6 kepingan, cerita hanya disesuaikan di Menara/Perpustakaan.
- Jenis soal baru (questions.js `GEN`, gambar di visuals.js): `posisi` (bilangan urutan dari bendera), `berulang` (2+2+2, kelompok titik), `keluarga` (hubungan + dan −, number bond), `kelompok` (mana yang beda / hitung satu bentuk), `susun` (bangun dibagi jadi segitiga/persegi kecil, 2 potong jadi bangun apa), `belasan` (dua bingkai sepuluh, 1 puluhan + satuan, 14 = 10 dan ?, nilai angka 1), `dobel` (dobel & hampir dobel), `data` (diagram gambar buah: berapa, paling banyak/sedikit, selisih), `turus` (membaca turus & tabel turus). Tambah/kurang kadang dengan 0; tambah yang melewati 10 memakai petunjuk "buat 10" (dua bingkai). `puluhan` mengikuti batas area (sampai 20).
- Pengali waktu baru di balance.think.time; bonus senjata diperluas; materi Kelas untuk semua jenis baru + kartu "buat 10" & nol; urutan materi mengikuti bab buku. Diuji 300 soal/jenis tanpa error & jawaban selalu ada di pilihan. SW `mq-v47`.

### 2026-11-26 — Target harian, Kalender Stempel, batas waktu orang tua
- `js/daily.js` (baru, MQ.Daily): target harian = jawab benar `settings.goal` soal (bawaan 20) → stempel (`S.stamps`), +10 koin, perayaan "Tugas hari ini selesai, sampai besok!" di beranda/peta (bukan di tengah pertarungan; di pertarungan cukup tulisan melayang). Hitungan per minggu Senin–Minggu: 5 stempel = hadiah mingguan 30 koin + Ramuan (`S.weekClaims`); tidak ada rentetan beruntun yang hangus.
- Beranda: tombol "Hari Ini" (ikon kalender) dengan lencana kemajuan 12/20 → ✔. Layar Kalender: Kiki + bar target, 7 hari minggu ini dengan stempel, kalender bulan ini.
- Orang Tua → ⏰ Waktu Belajar: target harian (10–40 soal), batas main per hari (tanpa batas / 15–90 menit), jam tidur (19.00–22.00 sampai 06.00), tombol +15 menit untuk hari ini. Habis/jam tidur → pertarungan baru tidak bisa dimulai (Kelas tetap boleh); peringatan kecil (toast) saat sisa 2 menit / habis ketika sedang bertarung.
- Ikon baru ui_cal & ui_stamp. Simpanan: settings.goal/limit/bed, stamps, weekClaims, dayParty, extra (tambahan, tanpa naik versi).
- **Perbaikan:** sw.js sempat kosong di mq-v47 (skrip edit membuka file untuk ditulis sebelum membaca) → dipulihkan dari git. SW `mq-v48` (+ daily.js).

### 2026-11-26 — Kiki teman yang tumbuh
- `js/kiki.js` (baru, MQ.Kiki) + layar `scr-kiki`: sekali sehari **Latihan Kiki** 5 soal tanpa waktu, dipilih dari 3 kemampuan terlemah + 2 yang paling lama tidak dilatih (pengulangan berjarak, `S.kiki.seen`). Benar = buah beri terbang ke Kiki & Kiki mengunyah; salah = petunjuk, coba lagi. Selesai = +1 hari (`S.kiki.days`). Jawaban ikut dihitung untuk target harian.
- 5 tahap (characters.js `kiki1..kiki5`): Kecil (0) → Pelajar/syal (2 hari, 20 koin) → Penjelajah/topi & ransel (5, 30 koin + Ramuan) → Bijak/kacamata, buku & toga (9, 40 koin + Mahkota) → Agung/mahkota & bintang (14, 60 koin + Mahkota). Naik tahap = jendela perayaan (fx level dengan gambar Kiki).
- Sapaan pribadi: nama anak, waktu (pagi/siang/sore/malam), jumlah benar kemarin atau jenis soal yang masih sulit.
- Kiki bertengger di samping pahlawan di beranda (tanda 🍓 bila belum diberi makan hari ini; ketuk → layar Kiki) dan terbang di atas kepala pahlawan saat bertarung. SW `mq-v49` (+ kiki.js).

### 2026-11-26 — Bangun desa, koleksi teman, Toko Fashion, uang saku orang tua
- **Bangun Desa** (`js/village.js`, layar `scr-build`, papan "Bangun Desa" di beranda): 1 🧱 bata tiap stempel harian & tiap Latihan Teman (simpanan lama: bata awal = jumlah stempel + hari Kiki). 10 bangunan berurutan, total 30 bata: Taman Bunga, Lampu Jalan, Pohon Apel, Kincir Angin, Air Mancur, Rumah Warga Baru, Menara Jam, Lampion Pesta, Patung Pahlawan, Pelangi Abadi — langsung tergambar di latar beranda (homescene.js → `drawBack/drawFront`).
- **Koleksi teman** (`js/kiki.js` digeneralisasi, `S.pets`, simpanan lama `S.kiki` dipindah): Kiki + 7 teman (Jamu, Kelip, Bubu, Batu, Capit, Kerti dari monster; Si Api setelah lulus Kelas 1). Syarat telur: kalahkan monster sejenis 10×. Adopsi telur baru hanya bila semua teman sudah dewasa (selalu ada yang dirawat, tanpa undian). 5 tahap: telur → bayi → kecil (+syal) → remaja (+topi) → agung (+mahkota), dibuat otomatis dari gambar monster. Hanya teman aktif yang ikut bertualang & tumbuh; ketuk di Koleksi Teman untuk mengganti.
- **Toko Fashion** (tab di Toko): kostum kepala Topi Koboi / Bando Kelinci / Topi Koki (500), Helm Ksatria / Helm Astronot (1000), Mahkota Pelangi (1500); pakaian Jubah Pahlawan (1000) & Zirah Ksatria (1500). Hanya tampilan (bukan pay-to-win), bayar dengan soal sisa koin, langsung dipakai; bisa diganti di ✏️ Ubah. Simpanan `S.outfits`.
- **Uang saku** (Orang Tua → Waktu Belajar): orang tua memberi 500 koin dalam game, paling sering seminggu sekali (jumlah tetap supaya tidak jadi cheat); anak melihat "Uang Saku dari Ayah/Bunda!" saat kembali ke beranda. SW `mq-v50` (+ village.js).

### 2026-11-26 — Beranda lebih simetris
- Pahlawan digeser 16px agar badannya tepat di tengah (gambar 32 piksel berpusat di kolom 13); logo MATH QUEST sedikit lebih ke bawah; ikon samping maks 4 per sisi: kiri Hari Ini/Misi/Medali/Pandai Besi, kanan Buku/Kelas. SW `mq-v51`.

### 2026-11-26 — Istirahat pingsan 2 menit
- `knockout.lockMin` 5 → 2 menit (tetap wajib menyelesaikan pelajaran tentang soal yang salah). Spanduk istirahat di beranda dipindah ke atas papan Bangun Desa (sebelumnya bertumpuk). SW `mq-v52`.

### 2026-11-26 — Perbaikan tab Tingkatkan & jalur titik
- Pandai Besi → Tingkatkan tidak bisa dibuka: tab Toko (baru) memakai kelas `.smithTabs` juga & ada lebih dulu di halaman, sehingga `querySelector('.smithTabs')` memasang tombol ke Toko. Sekarang `#scr-smith .smithTabs`.
- Jalur titik (urutan musuh) tertutup HUD saat baris KOMBO muncul: baris kecil HUD selalu setinggi 16px + `refitTop()` (ResizeObserver HUD) memperbarui `--freeTop`. SW `mq-v53`.

### 2026-11-26 — Teks pertarungan, Power, keseimbangan KILAT
- Teks melayang pertarungan: kotak gelap membulat (lebih terbaca), bertumpuk per sisi tanpa saling tindih (slot baris), posisi dijaga di dalam layar (teks panjang seperti "+1 Sayap Kelelawar" tidak keluar ke kanan).
- Saat berjalan ke titik/ruang berikutnya kotak soal kosong (tanpa tulisan "Masuk ruang 2..."), muncul saat bertemu monster.
- ⚡ **Power** (`State.itemPower`, `State.heroPower`, bobot di `balance.power`): angka di Tas (lencana + tombol "Urut: Jenis / Power"), detail item, Toko, Pandai Besi (Buat & Tingkatkan, termasuk +N), dan Karakter (Power pahlawan). Hanya angka pembanding.
- KILAT per tingkat `combat.fastCritBy` [2, 1,5, 1,2] detik (Normal/⭐, Pahlawan/⭐⭐, Legenda/⭐⭐⭐); damage kritikal dibatasi `combat.critMulMax` ×2,5; HP musuh Legenda ×1,3 → ×1,5. SW `mq-v54`.

## Catatan dari anak (isi setelah anak bermain)
- 2026-11-24: terasa kurang menantang → ditambah HP & serangan musuh berwaktu.
