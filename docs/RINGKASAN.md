# Math Quest — Ringkasan Proyek (untuk memulai sesi baru)

_Terakhir diperbarui: 2026-11-27 · versi `mq-v64`_

## Inti
Game RPG matematika pixel art 2D (PWA, Bahasa Indonesia) untuk anak SD, dimulai dari **Kelas 1**. Dibuat ayah untuk anaknya, kelak **dijual**.
- **Live:** https://mathquest-gameanak.github.io/math-quest/ (push ke `main` = deploy otomatis; **jangan** pakai danapeta.github.io).
- **Tanpa modal:** HTML + CSS + JS biasa (namespace global `MQ`, tanpa library/build), localStorage, GitHub Pages.
- **Wajib baca:** `CLAUDE.md` (aturan), `docs/GDD.md` (desain), `docs/PROGRESS.md` (log rinci per fitur).
- **Setiap perubahan:** naikkan `VERSION` di `sw.js` (+ daftarkan file JS baru di `FILES`). Angka keseimbangan hanya di `js/balance.js`.

## Tujuan & prinsip
- Anak **belajar setiap hari tanpa kecanduan**: ada titik berhenti harian, tanpa gacha/undian, tanpa hukuman bolos, tanpa pay-to-win.
- Salah = belajar (petunjuk bergambar, Kelas). Kalah = pingsan → istirahat 2 menit + wajib pelajaran soal yang salah.
- Materi **sesuai buku sekolah** (*Matematika 1 SD/MI Kelas I*, Kurikulum Merdeka, 8 bab) dengan **metode ala Singapura** (number bond, bar model, buat 10, dobel). Jangan memakai merek "Singapore Math" di iklan.
- Rencana jual: iklan IG/FB ke orang tua; nilai jual = sesuai Kurikulum Merdeka + teruji di anak sendiri.

## Yang sudah ada (Kelas 1)
- **6 area** (Padang=Bab 1, Hutan=Bab 2–3, Bukit=Bab 4, Danau=Bab 5–6, Lembah=Bab 7, Menara Data=Bab 8) + Kastil Ujian; **3 tingkat** Normal (Lv 1–15) / Pahlawan (16–30) / Legenda (31–40); 3 dungeon ⭐/⭐⭐/⭐⭐⭐.
- ±24 jenis soal (questions.js `GEN`), gambar soal & petunjuk (visuals.js), **Kelas** (ruang kelas, materi per jenis soal).
- Pertarungan penuh layar (scene.js): animasi serang/kena/kalah, KILAT (2/1,5/1,2 dtk per tingkat), kritikal maks ×2,5, jeda ⏸, ramuan 10 koin maks 5×/pertarungan.
- Perlengkapan: Toko, Pandai Besi (buat + tingkatkan sampai +10), ⚡ Power, ikon item 24×24, Toko Fashion (500/1000/1500, hanya tampilan).
- Harian: target harian & kalender stempel, Misi Harian (1 misi belajar + 2 petualangan → ⭐ Bintang Misi → Peti Bonus → tukar di Toko tab ⭐), **Teman peliharaan** (Kiki + 8 teman, tumbuh lewat Latihan Teman 5 soal/hari, hanya 1 ikut bertualang), **Bangun Desa** (bata dari stempel & latihan teman), 43 medali.
- Cerita & cutscene sinematik, musik per suasana, peta bergambar dengan suasana tiap tingkat.
- Orang Tua (gerbang soal perkalian): laporan, target harian, batas main/hari, jam tidur, uang saku 500 koin/minggu, cadangan simpanan, 🧪 Atur Angka.
- iPad: viewport khusus tablet (penuh lebar).

## Rencana lanjutan (urutan saran)
1. **Kelas 2** (dunia/wilayah baru setelah Kastil, cerita lanjutan Penyihir Kusut): bilangan sampai 1.000 (materi sampai 100 dari Menara lama dipindah ke sini), tambah/kurang bersusun, perkalian & pembagian dasar, pecahan sederhana, jam, uang, satuan baku (cm/kg). Angka HP/damage ikut naik (lihat GDD bagian "antar kelas").
2. **Persiapan jual:** versi gratis (2 area) + kode lisensi tanpa server, nama game final (sementara "Math Quest"), beberapa profil anak dalam satu HP, bahan iklan (rekaman layar).
3. **Bahasa Inggris** (sedang–besar, ±2–3 sesi): sebaiknya setelah Kelas 2 supaya tidak menulis dua bahasa terus.
4. Opsional: misi dunia nyata bersama orang tua, rekaman suara (pengganti suara HP yang aksennya buruk), gambar ulang benda hitungan di soal (apel/bintang lama).

## Catatan kerja
- Uji di ukuran HP 375×812 (dan 564×812 + `html.tablet` untuk iPad).
- Pengguna sering main di tab preview port **8125**; untuk tes pakai **`math-quest-test` (port 8126)** di `C:\proyek\.claude\launch.json` supaya simpanannya tidak tersentuh.
- Cache browser/SW sering basi saat tes: unregister SW + hapus caches, lalu reload 1–2×.
- Skrip edit Python: **jangan** `open(f,'w').write(open(f).read()...)` dalam satu baris (pernah mengosongkan sw.js); baca dulu, baru tulis.

## Rencana lanjutan
Lihat `docs/RENCANA.md` (telur teman, Kelas 1–6 per bab, Kelas 2+, level per kelas, fast leveling).
