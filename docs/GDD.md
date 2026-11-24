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
| 2 | Hutan Tambah-Kurang | 4–8 | Tambah & kurang s/d 10, kalimat matematika (`3 + □ = 5`) | Jamur Nakal, Jamur Ungu · bos Raja Jamur |
| 3 | Bukit Bentuk | 7–11 | Bangun datar & ruang, pola (warna/bentuk) | Lendir Batu, Jamur Batu · bos Raja Batu |
| 4 | Danau Dua Puluh | 10–15 | Tambah, kurang & isi kosong s/d 20 | Lendir Air, Kelelawar Ungu · bos Raja Kelelawar |
| 5 | Lembah Ukur | 13–17 | Membandingkan & mengukur panjang (satuan kotak). Nanti: berat, waktu, data | Kelelawar Daun, Jamur Kayu · bos Raja Jamur Kayu |
| 6 | Menara Seratus | 16–20 | Puluhan & satuan (ikatan lidi), urutan & membandingkan s/d 100 | Kelelawar Malam, Lendir Ungu · bos Raja Malam |
| ★ | Kastil Ujian | 18+ | **Ujian Naik Kelas**: campuran semua materi | Bos: Raja Naga Api |

Setiap field punya bos field (setiap monster ke-5) yang menjatuhkan bahan langka.

### Jenis soal (bertahap dibuat)
- **Pilihan ganda 4 tombol** (sudah ada): hitungan.
- **Hitung gambar**: "Ada berapa apel?" (sprite apel 1–10).
- **Bandingkan**: pilih `>`, `<`, atau `=`.
- **Isi yang kosong**: `3 + _ = 5`.
- **Kenali bentuk**: "Mana yang segitiga?" (4 gambar).
- **Puluhan & satuan**: ikatan 10 lidi + lidi lepas → berapa?
- **Lebih panjang**: dua benda, pilih yang lebih panjang.

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
- Damage musuh = (3 + level area) × kekuatan monster − Pertahanan pemain (minimal 1). Mengalahkan monster memulihkan 20% HP (kecuali di dungeon).
- HP habis = "Pahlawan istirahat", HP penuh lagi. **Tidak ada game over.** Di dungeon: keluar gua, hadiah tetap.
- Ujian Naik Kelas: musuh tidak menyerang.

### Status pemain
- HP maks = 40 + 5×level + 10×poin HP + equipment. Serangan = 8–12 + level + 2×poin ATK + equipment. Pertahanan = poin DEF + equipment.
- Setiap naik level: **+3 poin status**, dibagi sendiri di layar Karakter (HP / Serangan / Pertahanan).
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

**Dungeon**: tantangan khusus tanpa isi ulang hati di tengah jalan, beberapa ruangan beruntun, hadiah peti. Contoh: *Gua Pola* (soal pola) di Bukit Bentuk.

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
4. **Kastil Ujian**: terbuka jika 6 area selesai **dan Level 20**. Sebelum ujian: Penyihir memerintah Raja Naga Api.
5. **Ending** (lulus): kristal utuh, Penyihir kabur, jalan ke Kelas 2 terbuka ("Bersambung…").

### Dungeon bercerita (putaran berikutnya)
Setiap dungeon punya cerita sendiri dengan cutscene di awal, setelah monster kunci, dan di akhir; bisa diulang untuk latihan & XP selagi menuju Level 20.

### Cutscene
- Latar pixel, tokoh masuk/berjalan, getar layar, kilatan, kilau; teks muncul huruf demi huruf; ketuk untuk lanjut; tombol "Lewati".
- Naskah di `js/story.js`. Suara opsional per baris: file `audio/vo/<id>.mp3` (daftar id di `docs/naskah-suara.md`), didaftarkan di `MQ.Story.VO`.
