# Math Quest — Game Design Document (GDD)

> Dokumen hidup. Ubah di sini dulu sebelum mengubah kode.
> Status: **draf v0.1** (2026-11-24). Fokus: **Dunia A, Kelas 1**.

## 1. Ringkasan

| | |
|---|---|
| **Konsep** | RPG pixel art 2D: anak berpetualang, melawan monster dengan menjawab soal matematika |
| **Pemain** | Anak SD kelas 1 (6–7 tahun). Kelak kelas 1–12 |
| **Platform** | Web di HP (portrait), bisa diinstal (PWA), jalan offline |
| **Bahasa** | Bahasa Indonesia |
| **Modal** | Nol. Tanpa server, tanpa library berbayar, hosting gratis |

### Prinsip desain (wajib dipegang)
1. **Tidak ada game over.** Gagal = istirahat sebentar, lalu lanjut. Anak tidak boleh takut salah.
2. **Salah = kesempatan belajar.** Setiap jawaban salah menampilkan jawaban benar, dan nanti juga *petunjuk bergambar*.
3. **Sedikit teks, banyak gambar.** Anak kelas 1 baru belajar membaca: pakai ikon, angka besar, dan soal yang dibacakan (suara).
4. **Sesi pendek.** Satu sesi main yang memuaskan ±10–15 menit.
5. **Sesuai kurikulum.** Materi mengikuti Capaian Pembelajaran Kurikulum Merdeka.
6. **Orang tua yang membeli.** Laporan perkembangan anak harus jelas dan jujur.

## 2. Struktur dunia

Satu **dunia** = satu **fase** Kurikulum Merdeka. Satu **kelas** = satu wilayah berisi beberapa field.

| Dunia | Fase | Kelas | Tema (usulan) | Status |
|---|---|---|---|---|
| A | A | 1–2 | Lembah Hijau (padang, hutan, danau) | **Kelas 1 dikerjakan** |
| B | B | 3–4 | Gurun & oasis | nanti |
| C | C | 5–6 | Pegunungan salju | nanti |
| D | D | 7–9 | Kota pelabuhan & laut | nanti |
| E | E | 10 | Kerajaan langit | nanti |
| F | F | 11–12 | Observatorium bintang | nanti |

## 3. Materi Kelas 1 → field

Sumber: Capaian Pembelajaran Matematika Fase A. **Perlu dicocokkan dengan daftar isi buku sekolah anak** (foto daftar isinya, lalu sesuaikan tabel ini).

| # | Field | Rek. level | Materi | Musuh (usulan) |
|---|---|---|---|---|
| 1 | Padang Hitung | 1–4 | Membilang benda s/d 10, membandingkan bilangan (> < =) | Lendir Hijau, Lendir Air · bos Raja Lendir |
| 2 | Hutan Tambah-Kurang | 4–8 | Tambah & kurang s/d 10, kalimat matematika (`3 + □ = 5`), pasangan bilangan & membuat 10, soal cerita | Jamur Nakal, Jamur Ungu · bos Raja Jamur |
| 3 | Bukit Bentuk | 7–11 | Bangun datar & ruang, pola (warna/bentuk) | Lendir Batu, Jamur Batu · bos Raja Batu |
| 4 | Danau Dua Puluh | 10–15 | Tambah, kurang & isi kosong s/d 20, soal cerita s/d 20 | Lendir Air, Kelelawar Ungu · bos Raja Kelelawar |
| 5 | Lembah Ukur | 13–17 | Membandingkan & mengukur panjang (satuan kotak). Nanti: berat, waktu, data | Kelelawar Daun, Jamur Kayu · bos Raja Jamur Kayu |
| 6 | Menara Seratus | 16–20 | Puluhan & satuan (ikatan lidi), urutan & membandingkan s/d 100 | Kelelawar Malam, Lendir Ungu · bos Raja Malam |
| ★ | Kastil Ujian | 18+ | **Ujian Naik Kelas**: campuran semua materi | Bos: Raja Naga Api |

Setiap area = **jalur 5 titik**: 1 → 2 → ⭐ mini bos → 4 → 👑 bos area (menjatuhkan bahan langka). Pahlawan berjalan dari titik ke titik di latar bergerak; level musuh naik dari level awal ke level akhir area. Setelah bos kalah: *Ulangi area* atau kembali ke peta. Dungeon memakai cara yang sama (ruang demi ruang). Arena Latihan tetap tanpa akhir (bos tiap monster ke-5).

### Jenis soal (bertahap dibuat)
- **Pilihan ganda 4 tombol** (sudah ada): hitungan.
- **Hitung gambar**: "Ada berapa apel?" (sprite apel 1–10).
- **Bandingkan**: pilih `>`, `<`, atau `=`.
- **Isi yang kosong**: `3 + _ = 5`.
- **Kenali bentuk**: "Mana yang segitiga?" (4 gambar).
- **Puluhan & satuan**: ikatan 10 lidi + lidi lepas → berapa?
- **Lebih panjang**: dua benda, pilih yang lebih panjang.
- **Pasangan bilangan** (2026-11-26): diagram number bond (keseluruhan di atas, dua bagian di bawah, satu "?") dan "Berapa lagi jadi 10?" dengan bingkai sepuluh. Petunjuk: titik dua warna / kotak kosong bingkai sepuluh.
- **Soal cerita** (2026-11-26): 1–3 kalimat pendek dengan tokoh cerita (Kiki, Momo, Kakek, Kapten) dan benda (apel, bintang, koin, batu, jamur, ramuan). Jenis: digabung, sisa, punya berdua, selisih "lebih banyak", dan perubahan yang tidak diketahui. Selalu dibacakan otomatis (`think.storySpeak`), termasuk soal pikir (pengali 3). Petunjuk setelah salah = **model batang** (cara Singapore Math).

## 4. Sistem level & kelas

Dua angka yang **terpisah**:

- **Level karakter** naik dari XP bertarung. Tidak dibatasi. Menaikkan HP/hati dan membuka equipment.
- **Kelas** hanya naik lewat **Ujian Naik Kelas**. Lulus ujian membuka wilayah kelas berikutnya.

Aturan agar level tetap seimbang:
- Field punya **rekomendasi level**. Kelas 1 kira-kira Lv 1–20, kelas 2 Lv 20–40, dan seterusnya. Rentangnya terbentuk dari field, bukan batas keras.
- Musuh yang levelnya jauh di bawah pemain memberi XP lebih sedikit (minimal 1). Anak terdorong maju tanpa dilarang mengulang.
- Ujian bisa diulang tanpa hukuman. Kalau gagal, game menunjukkan topik yang perlu dilatih.
- **Tes penempatan** (opsional) di awal: anak yang sudah mahir bisa langsung mulai dari kelas yang lebih tinggi.
- Dunia lama selalu bisa dikunjungi. Sesekali muncul **musuh pengulangan** dari topik yang sering salah.

## 5. Pertarungan

- Pemain dan monster sama-sama punya **HP**. Jawaban benar = serangan. **3 benar beruntun = kombo kritis** (2× damage).
- **Musuh menyerang berwaktu**: bar ⚡ terisi selama soal tampil; saat penuh, musuh menyerang. Jeda acak per jenis monster (kelelawar 1,5–3 dtk, lendir 2,5–4,5, jamur 3–5, batu 4–6, naga 3,5–5,5) × *pace* area (soal yang butuh berpikir lebih lama → musuh lebih lambat). Bos sedikit lebih lambat tapi 1,5× lebih kuat.
- Waktu musuh berhenti saat animasi, saat ada pesan, saat soal dibacakan (🔊), dan saat aplikasi tidak terlihat.
- Jawaban salah = musuh langsung menyerang, kombo hilang, jawaban benar ditunjukkan.
- **Soal cepat vs soal pikir** (2026-11-26): tiap jenis soal punya pengali waktu (`balance.think.time`). Fakta dasar (tambah/kurang/bandingkan) = 1: bar musuh normal, KILAT ≤ 2 detik. Soal yang perlu dipikir lebih lama (isi kosong, puluhan, panjang ±1,5) membuat musuh lebih sabar dan batas KILAT lebih panjang. **Soal pikir** (pola, ukur, soal cerita; pengali ≥ 2): tanpa bar KILAT, muncul tanda "🧠 santai saja, yang penting teliti", dan jawaban benar selalu menjadi serangan **TELITI!** (damage ×1,5). Tujuannya: anak dihargai karena teliti, tidak didorong menebak cepat. Kelas lanjutan akan punya lebih banyak soal pikir.
- **Angka kecil** (keputusan 2026-11-25): semua HP & damage di bawah 100 dan damage **tetap (tidak acak)**, supaya anak bisa ikut berhitung ("HP 15, pukul 5, tinggal 10"). Kritikal = **×2**.
- Damage musuh = 1,6 + 0,35 × level monster (dibulatkan) × kekuatan monster − Pertahanan (minimal 1): Lv 1 ≈ 2, Lv 10 ≈ 5, Lv 20 ≈ 9. Mengalahkan monster memulihkan 20% HP (kecuali di dungeon).
- HP monster = 12 + 3 × level: Lv 1 = 15, Lv 10 = 42, Lv 20 = 72 (bos ×1,5). Monster butuh ±3–5 pukulan.
- HP habis = "Pahlawan istirahat", HP penuh lagi. **Tidak ada game over.** Di dungeon: keluar gua, hadiah tetap.
- Ujian Naik Kelas: musuh tidak menyerang.

### Status pemain
- HP maks = 20 + 2 × (level − 1) + 3 × poin HP + equipment (Lv 1 = 20, Lv 10 = 38, Lv 20 = 58).
- Serangan = 5 + ½ × (level − 1) (dibulatkan ke bawah) + poin ATK + equipment (Lv 1 = 5, Lv 10 = 9, Lv 20 = 14). Pertahanan = ½ × poin DEF + equipment.
- Setiap naik level: **+1 poin status**, dibagi sendiri di layar Karakter (HP / Serangan / Pertahanan). Simpanan lama: poin dikembalikan sekali untuk dibagi ulang.
- Semua angka di `js/balance.js`, bisa dicoba dari Orang Tua → Atur Angka.
- Mengalahkan monster = XP + drop item.
- **Petunjuk bergambar** (nanti): setelah salah, muncul bantuan visual (titik-titik, garis bilangan, ikatan lidi).
- **Soal dibacakan** (nanti): tombol 🔊 memakai suara bawaan HP (Web Speech API, gratis).

## 6. Item & equipment (dengan unsur matematika)

| Sistem | Cara kerja | Matematika yang dilatih |
|---|---|---|
| **Koin** | Satu jenis koin (sudah dibuat). Nanti mungkin: perunggu (1), perak (5), emas (10), 10 perunggu = 1 emas | Membilang, puluhan & satuan |
| **Bahan** | Drop monster: lendir, sayap, spora, batu kotak, sisik… | Menghitung koleksi |
| **Crafting (Pandai Besi)** | "Butuh 7 sayap, punya 4. Kurang berapa?" Jawab benar → bisa membuat | Pengurangan, kalimat matematika |
| **Toko** | Harga dalam koin, harus dijumlah dan dihitung kembaliannya | Penjumlahan & pengurangan |
| **Senjata bertopik** | *Pedang Penjumlah*: +damage di soal tambah. *Palu Pengurang*, *Tongkat Bentuk*… | Mendorong latihan topik lemah |
| **Pelindung** | Menambah hati maksimal (+1) | — |
| **Aksesori** | Efek: petunjuk lebih sering, XP +10%, koin +1 | — |
| **Bandingkan statistik** | "Pedang A +12, Pedang B +9. Mana lebih kuat?" | Membandingkan bilangan |

Slot equipment: **senjata, pelindung, aksesori**.

**Bahan khusus dungeon** (2026-11-25): setiap dungeon punya satu bahan khusus untuk satu slot. Bahan ini didapat dari peti harta (2 / 3 / 4 di ⭐ / ⭐⭐ / ⭐⭐⭐) dan dari monster kuncinya.

| Dungeon | Bahan | Equipment (Pandai Besi) |
|---|---|---|
| Gua Pola | Kristal Pola | Pedang Kristal (ATK +5) → Pedang Pahlawan (ATK +8) |
| Kapal Karam | Mutiara Laut | Perisai Mutiara (HP +15, DEF +3) → Perisai Pahlawan (HP +25, DEF +5) |
| Perpustakaan Tua | Tinta Bintang | Jimat Tinta (krit +10%, XP +30%) → Mahkota Bijak (krit +20%, krit dmg +50%, koin +2) |

Lingkaran yang diharapkan membuat anak terus main dan belajar: **dungeon lebih sulit → bahan lebih banyak → equipment lebih kuat → bisa mengalahkan Mode Pahlawan / ⭐⭐⭐**.

## 7. Kota & misi

**Kota Kelas 1: Desa Bilangan.** Berupa layar ilustrasi; bangunan diketuk untuk masuk (lebih mudah di HP daripada berjalan di peta).

| Bangunan | Fungsi |
|---|---|
| Rumah Kepala Desa | Misi cerita per field |
| Pandai Besi | Crafting & upgrade equipment |
| Toko | Ramuan (isi hati), bahan |
| Sekolah | Latihan bebas (pilih topik) & **Ujian Naik Kelas** |
| Papan Misi | 3 misi harian (contoh: "Kalahkan 5 Lendir", "Jawab 10 soal kurang dengan benar") |
| Gerbang | Peta dunia → pilih field |

**Peta dunia**: jalur bertitik yang menghubungkan field. Field berikutnya terbuka setelah bos field dikalahkan.

**Dungeon**: tantangan khusus tanpa isi ulang HP di tengah jalan, beberapa ruangan beruntun, hadiah peti. Tiap dungeon punya materi sendiri (Gua Pola: pola & bentuk; Kapal Karam: tambah & kurang s/d 20; Perpustakaan Tua: puluhan, urutan & bandingkan s/d 100).
- Dibuka dari tombol **🏰 Dungeon** di bilah bawah (bukan dari peta). Halaman berisi satu kartu per dungeon: gambar, nama, materi, level, hadiah; yang belum terbuka tampil terkunci dengan syaratnya.
- **Tingkat ⭐ / ⭐⭐ / ⭐⭐⭐** (seperti bintang di game anak): soal sama, musuh lebih tinggi levelnya & lebih cepat, hadiah peti lebih besar (×1 / ×1,5 / ×2). Tingkat berikutnya terbuka setelah tingkat sebelumnya selesai. Tanpa energi, timer, atau peringkat.

**Mode Pahlawan ⭐⭐** (petualangan utama, terbuka setelah lulus Ujian Naik Kelas): area & soal sama, musuh +6 level, HP ×1,4, damage ×1,6, menyerang lebih cepat (jeda ×0,7), koin ×2. Sengaja berat: perlu equipment dari bahan khusus dungeon. Saklar Normal/Pahlawan di atas peta. Medali "Pahlawan Sejati" untuk mengalahkan keenam bos area di Mode Pahlawan.

**Tahap 5 (2026-11-25)**
- **Dua monster sekaligus**: muncul di Mode Pahlawan (titik 4), Legenda (titik 2 & 4), dungeon ⭐⭐ (ruang sebelum bos) dan ⭐⭐⭐ (beberapa ruang). Masing-masing punya HP & bar serangan sendiri. Jawaban benar memukul monster yang ditandai ▼; ketuk monster (atau panelnya) untuk ganti sasaran. Bila sasaran kalah, sasaran pindah otomatis. Jawaban salah = monster sasaran menyerang.
- **Mode Legenda ⭐⭐⭐** (petualangan utama): terbuka setelah keenam bos Mode Pahlawan dikalahkan. Musuh +12 level, HP ×1,8, damage ×2,2, jeda ×0,6, koin ×3. Hampir mustahil tanpa equipment yang sudah ditingkatkan. Saklar peta: Normal → Pahlawan → Legenda. Medali "Legenda Matematika".
- **Tingkatkan equipment +1 sampai +5** (Pandai Besi → Tingkatkan): bahan khusus dungeon sesuai slot (senjata: Kristal Pola, pelindung: Mutiara Laut, aksesori: Tinta Bintang) sebanyak tingkat tujuan, koin 10 × tingkat, Mahkota Kecil di +4 & +5. Tiap tingkat: senjata Serangan +1; pelindung HP +3 & Pertahanan +½; aksesori kritikal +2% & damage kritikal +5%. Ada soal hitungan sebelum meningkatkan ("Serangan 6 naik 1, jadi berapa?").

**Halaman utama**: Buku Monster, Misi, Medali berupa ikon kecil bertumpuk di kiri di bawah kartu nama (ada tanda merah bila ada yang baru). Ikon Pandai Besi juga di situ. Bilah bawah (5): Tas, Karakter, **Beranda (tengah)**, Dungeon, Toko.

## 8. Laporan Orang Tua

- Dibuka lewat *gerbang orang tua* (soal untuk orang dewasa, mis. `7 × 8`).
- Isi: penguasaan per topik (% benar), topik yang sering salah, waktu bermain per hari, kemajuan kelas.
- Data tersimpan di HP saja (tidak dikirim ke mana pun).
- Pengaturan orang tua: **Mode Santai** (musuh tidak menyerang berwaktu), **Bacakan soal otomatis**. (Sudah dibuat.)

## 9. Seni & suara

- **Pixel art 2D**, palet terbatas 16 warna, garis tepi gelap.
  Keputusan 2026-11-24: tetap pixel art (sampel gaya kartun HD/SVG di `prototype/desain-hd.html` tidak dipakai).
- Sprite ditulis langsung di kode sebagai baris karakter, tanpa file gambar. Musuh biasa 16×16, bos 24×24, pahlawan 16×16.
- Latar digambar di kanvas resolusi rendah lalu diperbesar tanpa blur.
- **Teks dan angka tetap pakai font tebal yang mudah dibaca**, bukan font pixel kecil (pembacanya anak 6 tahun).
- Suara: efek chiptune dengan Web Audio API. Musik latar sederhana (nanti).

## 10. Teknis

- HTML + CSS + JavaScript biasa, **tanpa library dan tanpa build**. Script klasik dengan namespace `MQ`, sehingga bisa dibuka langsung dari file maupun web.
- Progress di `localStorage` dengan nomor versi (`v`) supaya update game tidak merusak simpanan. Nanti: kode ekspor/impor simpanan untuk pindah HP.
- PWA (manifest + service worker) supaya bisa diinstal dan main offline.
- Hosting: GitHub Pages (gratis).

## 11. Rencana jualan (nanti, setelah terbukti)

- Dunia A Kelas 1 gratis. Buka fase berikutnya dengan sekali bayar (lebih disukai orang tua daripada langganan).
- Jual awal lewat web (itch.io / link pembayaran) agar tanpa biaya. Google Play butuh $25 sekali bayar, nanti saja kalau sudah ada pembeli.
- **Tanpa iklan dan tanpa chat**: aman untuk anak, dan menjadi nilai jual.
- Fitur online/multiplayer ditunda: butuh server berbayar dan moderasi, serta ada aturan perlindungan data anak (UU PDP).

## 12. Pertanyaan terbuka

- [ ] Nama game final (sementara "Math Quest"). Usulan: *Petualangan Angka*, *Kesatria Hitung*, *Negeri Bilangan*.
- [ ] Pahlawan: satu karakter tetap, atau anak bisa memilih (laki-laki/perempuan, warna)?
- [ ] Cocokkan tabel materi (bagian 3) dengan buku sekolah anak.
- [ ] Musik latar: perlu atau cukup efek suara?

## 13. Cerita

### Dunia & tokoh (orisinal)
- **Desa Bilangan** di Lembah Hijau. Di tengah desa ada **Kristal Angka** yang membuat semua angka rapi.
- **Kakek Bilang**: kepala desa, pemberi tugas.
- **Kiki**: burung hantu kecil, teman & pemandu pahlawan (kelak bisa jadi hewan peliharaan).
- **Penyihir Kusut**: penjahat lucu (tidak menakutkan) yang benci angka rapi. Ia memecah Kristal Angka menjadi **6 kepingan** dan menitipkannya pada para bos.

### Alur utama (Kelas 1)
1. **Prolog**: desa damai → malam, Penyihir Kusut memecah kristal → monster jadi nakal → Kakek meminta pahlawan mengumpulkan 6 kepingan; Kiki menemani.
2. **Tiap area**: cutscene pendek saat pertama masuk; setelah bos pertama kali kalah → dapat **kepingan kristal**.
3. **Menara Seratus** (kepingan ke-6): Penyihir Kusut muncul dan menantang ke Kastil Ujian.
4. **Kastil Ujian**: terbuka jika 6 area selesai (tanpa syarat level sejak 2026-11-25; tantangan lanjutan ada di Mode Pahlawan & Legenda). Sebelum ujian: Penyihir memerintah Raja Naga Api.
5. **Ending** (lulus): kristal utuh, Penyihir kabur, jalan ke Kelas 2 terbuka ("Bersambung…").

### Dungeon bercerita (putaran berikutnya)
Setiap dungeon punya cerita sendiri dengan cutscene di awal, setelah monster kunci, dan di akhir; bisa diulang untuk latihan, XP & bahan.

### Cutscene
- Latar pixel, tokoh masuk/berjalan, getar layar, kilatan, kilau; teks muncul huruf demi huruf; ketuk untuk lanjut; tombol "Lewati".
- Naskah di `js/story.js`. Suara opsional per baris: file `audio/vo/<id>.mp3` (daftar id di `docs/naskah-suara.md`), didaftarkan di `MQ.Story.VO`.

## 14. Skala angka dari Kelas 1 sampai Kelas 6 (rencana)

Progress pemain **terus berlanjut** antar kelas: level, equipment, medali, dan koleksi tidak di-reset. Besarnya HP & damage tumbuh mengikuti **rentang bilangan yang sedang dipelajari**, sehingga membaca HP dan damage juga menjadi latihan:

| Kelas | Rentang bilangan di sekolah | Level kira-kira | HP pahlawan | Damage |
|---|---|---|---|---|
| 1 | sampai 100 | 1–20 | 20–60 (gear sampai ±100) | satuan – puluhan kecil |
| 2 | sampai 1.000 | 20–40 | ratusan | puluhan |
| 3–4 | sampai 10.000 | 40–80 | ribuan | ratusan |
| 5–6 | sampai 1.000.000 | 80–120 | puluhan ribu | ribuan |

Cara membuatnya (nanti, saat Kelas 2 dikerjakan):
- `balance.js` diberi blok angka per kelas (HP dasar, HP per level, damage, dll.). Pertumbuhan **di dalam** satu kelas tetap lurus (mudah ditebak); lompatannya terjadi **antar kelas** (± ×5–10).
- Saat naik kelas, monster di wilayah baru langsung jauh lebih kuat, jadi equipment kelas lama terasa lemah. Equipment baru dibuat dari bahan & dungeon kelas itu, dengan pola yang sama: dungeon → bahan khusus → equipment kuat → Mode Pahlawan.
- Pahlawan juga ikut "naik skala" saat lulus ujian (bonus HP & serangan dasar kelas baru), supaya tidak terasa tertinggal.
- Angka besar ditampilkan dengan pemisah ribuan (12.500) sesuai cara menulis di buku sekolah.
