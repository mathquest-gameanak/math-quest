/* Math Quest — data monster, item, field, dungeon. Desain lengkap: docs/GDD.md.
   Monster & item varian dibuat dari sprite yang sama dengan palet berbeda (pal = warna pengganti). */
'use strict';
window.MQ = window.MQ || {};

MQ.Data = {
  /* Gaya menyerang bawaan per jenis tubuh:
     spd   = jeda antar serangan dalam detik [min, maks] (acak di antaranya); besar = lambat
     power = pengali damage. Monster boleh menimpa nilainya sendiri (lihat monster batu).
     Per monster juga: tahan = pengali damage yang DITERIMA (batu 0,7 = keras), hpMul = pengali HP. */
  styles: {
    bat:      {spd: [1.5, 3], power: 0.8},   // kelelawar: cepat tapi lemah
    slime:    {spd: [2.5, 4.5], power: 1},
    mushroom: {spd: [3, 5], power: 1.1},
    dragon:   {spd: [3.5, 5.5], power: 1.3},  // besar: lambat tapi kuat
    crab:     {spd: [3, 4.5], power: 1.2},    // kepiting: capitnya keras
    ghost:    {spd: [2, 3.5], power: 1}       // hantu: melayang cukup cepat
  },

  /* drop = bahan yang dijatuhkan, lore = cerita singkat di Buku Monster. Bos (nama "Raja ...") selalu menjatuhkan lebih banyak + Mahkota. */
  monsters: {
    lendir:         {name: 'Lendir Hijau', lore: 'Lendir Hijau suka melompat sambil menghitung lompatannya. Sayangnya ia sering lupa sudah sampai berapa!', sprite: 'slime', drop: 'lendir'},
    lendirAir:      {name: 'Lendir Air', lore: 'Lendir Air lahir dari embun pagi. Badannya dingin dan memantulkan cahaya matahari.', sprite: 'slime', drop: 'lendir', pal: {g: '#41a6f6', G: '#73eff7', d: '#3b5dc9'}},
    lendirBunga:    {name: 'Lendir Bunga', lore: 'Lendir Bunga memakai mahkota bunga dan merasa paling cantik di Padang Hitung. Mini bos yang mudah marah!', sprite: 'slime', drop: 'lendir', power: 1.2, pal: {g: '#b06fd0', G: '#f4a3c8', d: '#5d275d'}},
    rajaLendir:     {name: 'Raja Lendir', lore: 'Raja semua lendir. Ia menyimpan kepingan kristal pertama di dalam badannya yang kenyal.', sprite: 'slime', drop: 'lendir', pal: {g: '#ffcd75', G: '#fff3b0', d: '#ef7d57'}},
    jamur:          {name: 'Jamur Nakal', lore: 'Jamur Nakal suka menambah dan mengurangi seenaknya. Alisnya selalu cemberut.', sprite: 'mushroom', drop: 'spora'},
    jamurUngu:      {name: 'Jamur Ungu', lore: 'Jamur Ungu tumbuh di bagian hutan yang paling gelap. Sporanya berkilau ungu.', sprite: 'mushroom', drop: 'spora', pal: {r: '#b06fd0'}},
    rajaJamur:      {name: 'Raja Jamur', lore: 'Raja Jamur memakai topi terbesar di hutan dan bangga bisa menghitung semua bintik di topinya.', sprite: 'mushroom', drop: 'spora', pal: {r: '#ef7d57', w: '#ffcd75', c: '#fff3b0'}},
    kelelawar:      {name: 'Kelelawar Ungu', lore: 'Kelelawar Ungu terbang sangat cepat sambil menghitung putarannya sendiri.', sprite: 'bat', drop: 'sayap'},
    rajaKelelawar:  {name: 'Raja Kelelawar', lore: 'Raja Kelelawar tinggal di gua tepi Danau Dua Puluh. Sayapnya merah seperti langit senja.', sprite: 'bat', drop: 'sayap', pal: {p: '#b13e53', P: '#ef7d57'}},
    lendirBatu:     {name: 'Lendir Batu', lore: 'Lendir Batu keras seperti kerikil. Ia suka berguling membentuk lingkaran sempurna.', sprite: 'slime', drop: 'batu', spd: [4, 6], power: 1.5, tahan: 0.7, hpMul: 0.85, pal: {g: '#94b0c2', G: '#f4f4f4', d: '#566c86'}},
    jamurBatu:      {name: 'Jamur Batu', lore: 'Jamur Batu tidak pernah bergerak... kecuali ada yang salah menyebut nama bentuk!', sprite: 'mushroom', drop: 'batu', spd: [4, 6], power: 1.5, tahan: 0.7, hpMul: 0.85, pal: {r: '#566c86', c: '#94b0c2', C: '#566c86'}},
    rajaBatu:       {name: 'Raja Batu', lore: 'Raja Batu yang tua dan bijak menjaga semua bentuk di Bukit Bentuk.', sprite: 'slime', drop: 'batu', spd: [4, 6], power: 1.5, tahan: 0.7, hpMul: 0.85, pal: {g: '#566c86', G: '#94b0c2', d: '#333c57'}},
    kelelawarDaun:  {name: 'Kelelawar Daun', lore: 'Kelelawar Daun bersembunyi di pepohonan Lembah Ukur. Sayapnya sepanjang tiga daun!', sprite: 'bat', drop: 'sayap', pal: {p: '#257179', P: '#a7f070'}},
    jamurKayu:      {name: 'Jamur Kayu', lore: 'Jamur Kayu tumbuh di batang pohon tumbang dan suka mengukur apa saja dengan jengkalnya.', sprite: 'mushroom', drop: 'kayu', pal: {r: '#ab5236', c: '#ffcd75'}},
    rajaJamurKayu:  {name: 'Raja Jamur Kayu', lore: 'Raja Jamur Kayu punya penggaris ajaib dari kulit kayu. Tidak ada yang lebih teliti darinya.', sprite: 'mushroom', drop: 'kayu', pal: {r: '#5d275d', w: '#ffcd75', c: '#ef7d57'}},
    kelelawarMalam: {name: 'Kelelawar Malam', lore: 'Kelelawar Malam hanya keluar saat bulan terbit di atas Menara Data. Ia suka menghitung bintang lalu mencatatnya di tabel.', sprite: 'bat', drop: 'sayap', pal: {p: '#333c57', P: '#566c86'}},
    lendirUngu:     {name: 'Lendir Ungu', lore: 'Lendir Ungu suka mencatat apa saja dengan turus: satu ikat turus isinya lima.', sprite: 'slime', drop: 'kayu', pal: {g: '#b06fd0', G: '#f4a3c8', d: '#5d275d'}},
    rajaMalam:      {name: 'Raja Malam', lore: 'Raja Malam menjaga kepingan terakhir. Matanya berkilau seperti bintang.', sprite: 'bat', drop: 'sayap', pal: {p: '#1a1c2c', P: '#5d275d', w: '#ffcd75'}},
    naga:           {name: 'Raja Naga Api', lore: 'Raja Naga Api adalah penguji paling hebat. Napas apinya hangat, bukan panas: ia hanya ingin melihatmu pintar!', sprite: 'dragon', drop: 'batu'},
    // Monster dungeon (kunci = monster penting di tengah dungeon)
    penjagaPola:    {name: 'Penjaga Pola', lore: 'Penjaga Pola menjaga pintu-pintu Gua Pola. Pintu hanya terbuka bagi yang paham pola.', sprite: 'slime', drop: 'kristalPola', spd: [3.5, 5], power: 1.3, pal: {g: '#ffcd75', G: '#fff3b0', d: '#566c86'}},
    kepiting:       {name: 'Kepiting Capit', lore: 'Kepiting Capit suka menyembunyikan koin di balik cangkangnya.', sprite: 'crab', drop: 'batu'},
    lendirLaut:     {name: 'Lendir Laut', lore: 'Lendir Laut terbawa ombak sampai ke Kapal Karam. Rasanya asin!', sprite: 'slime', drop: 'lendir', pal: {g: '#257179', G: '#73eff7', d: '#29366f'}},
    kepitingBesar:  {name: 'Kepiting Besar', lore: 'Kepiting Besar memegang peta harta milik Kapten Kumis.', sprite: 'crab', drop: 'mutiara', power: 1.4, pal: {r: '#ef7d57'}},
    rajaKepiting:   {name: 'Raja Kepiting', lore: 'Raja Kepiting duduk di atas peti harta. Capit ungunya berkilau di bawah air.', sprite: 'crab', drop: 'batu', pal: {r: '#b06fd0', w: '#ffcd75'}},
    hantuKertas:    {name: 'Hantu Kertas', lore: 'Hantu Kertas terbuat dari halaman buku yang sobek. Ia senang mengacak nomor halaman.', sprite: 'ghost', drop: 'kayu', pal: {w: '#ffe4c4'}},
    kelelawarBuku:  {name: 'Kelelawar Buku', lore: 'Kelelawar Buku tinggal di rak paling tinggi. Kepakan sayapnya berbunyi seperti halaman dibalik.', sprite: 'bat', drop: 'sayap', pal: {p: '#ab5236', P: '#ffe4c4'}},
    hantuTinta:     {name: 'Hantu Tinta', lore: 'Hantu Tinta meneteskan tinta biru ke mana-mana. Bersihkan dengan jawaban yang benar!', sprite: 'ghost', drop: 'tinta', power: 1.3, pal: {w: '#73eff7'}},
    rajaTinta:      {name: 'Raja Tinta', lore: 'Raja Tinta adalah hantu paling iseng di Perpustakaan Tua.', sprite: 'ghost', drop: 'kayu', pal: {w: '#566c86', k: '#1a1c2c'}}
  },

  /* ===== Item =====
     type: bahan | ramuan | senjata | pelindung | aksesori
     price  = bisa dibeli di Toko (koin)
     recipe = bisa dibuat di Pandai Besi {bahan: jumlah, koin: jumlah}
     Efek: atk (serangan +), crit (peluang kritikal +%), critDmg (damage kritikal +%), bonus {kinds, dmg} (damage tambahan untuk jenis soal tertentu),
           hp (HP maks +), def (pertahanan +), coins (koin + per monster), xp (persen XP +) */
  items: {
    lendir:  {type: 'bahan', name: 'Gumpalan Lendir', icon: 'blob', desc: 'Lengket! Dari para Lendir.'},
    spora:   {type: 'bahan', name: 'Spora Jamur', icon: 'cap', desc: 'Dari para Jamur.'},
    sayap:   {type: 'bahan', name: 'Sayap Kelelawar', icon: 'wing', desc: 'Dari para Kelelawar.'},
    batu:    {type: 'bahan', name: 'Batu Kotak', icon: 'rock', desc: 'Keras sekali. Dari monster batu.'},
    kayu:    {type: 'bahan', name: 'Kayu Ajaib', icon: 'log', desc: 'Dari Jamur Kayu & Lendir Ungu.'},
    mahkota: {type: 'bahan', name: 'Mahkota Kecil', icon: 'crown', desc: 'Langka! Hanya dari bos.'},
    // Bahan khusus dungeon (from = id dungeon): dari peti harta & monster kunci. Untuk equipment kuat (Mode Pahlawan).
    kristalPola: {type: 'bahan', name: 'Kristal Pola', icon: 'shard', pal: {c: '#b06fd0', C: '#f4a3c8'}, from: 'guaPola',
                  desc: 'Bahan khusus SENJATA. Dari Gua Pola (makin banyak di ⭐⭐⭐).'},
    mutiara:     {type: 'bahan', name: 'Mutiara Laut', icon: 'coin', pal: {y: '#c7f0ff', Y: '#f4f4f4'}, from: 'kapalKaram',
                  desc: 'Bahan khusus PELINDUNG. Dari Kapal Karam (makin banyak di ⭐⭐⭐).'},
    fragmenBintang: {type: 'bahan', name: 'Fragmen Bintang', icon: 'star', pal: {y: '#fff3b0'}, desc: 'Pecahan pedang legendaris. Tukar dari ⭐ Bintang Misi. 10 fragmen = Pedang Bintang.'},
    tinta:       {type: 'bahan', name: 'Tinta Bintang', icon: 'star', pal: {y: '#73eff7'}, from: 'perpustakaan',
                  desc: 'Bahan khusus AKSESORI. Dari Perpustakaan Tua (makin banyak di ⭐⭐⭐).'},

    ramuan:  {type: 'ramuan', name: 'Ramuan Penyembuh', icon: 'potion', price: 10, desc: 'Minum saat bertarung: HP penuh lagi.'},

    pedangKayu:      {type: 'senjata', name: 'Pedang Kayu', icon: 'sword', pal: {w: '#d4a373'}, price: 8, atk: 1, crit: 5,
                      desc: 'Serangan +1. Kritikal +5%.'},
    pedangPenjumlah: {type: 'senjata', name: 'Pedang Penjumlah', icon: 'sword', pal: {w: '#73eff7', y: '#41a6f6'}, atk: 2, crit: 5, critDmg: 20,
                      bonus: {kinds: ['tambah', 'isi', 'hitung', 'pasangan', 'dobel', 'berulang', 'posisi'], dmg: 3}, recipe: {lendir: 5, spora: 3, koin: 10},
                      desc: 'Serangan +2. Ekstra +3 di soal tambah, isi kosong & menghitung. Kritikal +5%, damage kritikal +20%.'},
    kapakPengurang:  {type: 'senjata', name: 'Kapak Pengurang', icon: 'axe', pal: {w: '#f4a3c8'}, atk: 2, crit: 10,
                      bonus: {kinds: ['kurang', 'isi', 'cerita', 'keluarga'], dmg: 3}, recipe: {spora: 5, lendir: 3, koin: 10},
                      desc: 'Serangan +2. Ekstra +3 di soal kurang & isi kosong. Kritikal +10%.'},
    tongkatBentuk:   {type: 'senjata', name: 'Tongkat Bentuk', icon: 'staff', atk: 3, critDmg: 30,
                      bonus: {kinds: ['bentuk', 'pola', 'panjang', 'ukur', 'kelompok', 'susun'], dmg: 4}, recipe: {batu: 5, mahkota: 1, koin: 15},
                      desc: 'Serangan +3. Ekstra +4 di soal bentuk, pola & panjang. Damage kritikal +30%.'},
    paluPuluhan:     {type: 'senjata', name: 'Palu Puluhan', icon: 'hammer', atk: 4, crit: 5, critDmg: 40,
                      bonus: {kinds: ['puluhan', 'urutan', 'banding', 'belasan', 'data', 'turus'], dmg: 5}, recipe: {kayu: 4, batu: 4, koin: 20},
                      desc: 'Serangan +4. Ekstra +5 di soal bilangan 11–20, urutan, bandingkan & diagram. Kritikal +5%, damage kritikal +40%.'},

    pedangKristal:   {type: 'senjata', name: 'Pedang Kristal', icon: 'sword', pal: {w: '#b06fd0', y: '#f4a3c8'}, atk: 5, crit: 10, critDmg: 20,
                      recipe: {kristalPola: 3, batu: 5, koin: 30}, desc: 'Serangan +5. Kritikal +10%, damage kritikal +20%.'},
    // Hadiah Tukar Bintang Misi (2026-11-26): fragmen dari misi harian → Pedang Bintang (senjata terkuat, cocok untuk semua soal)
    pedangBintang:   {type: 'senjata', name: 'Pedang Bintang', icon: 'sword', pal: {w: '#fff3b0', y: '#73eff7'}, atk: 9, crit: 15, critDmg: 50,
                      bonus: {kinds: ['tambah', 'kurang', 'isi', 'hitung', 'banding', 'urutan', 'posisi', 'pasangan', 'berulang', 'keluarga', 'cerita', 'belasan',
                                      'puluhan', 'dobel', 'bentuk', 'kelompok', 'susun', 'pola', 'panjang', 'ukur', 'data', 'turus'], dmg: 2},
                      recipe: {fragmenBintang: 10, mahkota: 2, koin: 100}, desc: 'Serangan +9, ekstra +2 di SEMUA soal. Kritikal +15%, damage kritikal +50%. Dari 10 Fragmen Bintang.'},
    pedangPahlawan:  {type: 'senjata', name: 'Pedang Pahlawan', icon: 'sword', pal: {w: '#ffcd75', y: '#e43b44'}, atk: 8, crit: 15, critDmg: 40,
                      recipe: {kristalPola: 8, mahkota: 3, koin: 60}, desc: 'Serangan +8. Kritikal +15%, damage kritikal +40%.'},

    perisaiKayu:     {type: 'pelindung', name: 'Perisai Kayu', icon: 'shield', price: 12, hp: 4, def: 1, desc: 'HP +4, Pertahanan +1.'},
    perisaiBatu:     {type: 'pelindung', name: 'Perisai Batu', icon: 'shield', pal: {b: '#566c86', y: '#94b0c2'}, hp: 8, def: 2,
                      recipe: {batu: 6, koin: 15}, desc: 'HP +8, Pertahanan +2.'},

    perisaiMutiara:  {type: 'pelindung', name: 'Perisai Mutiara', icon: 'shield', pal: {b: '#c7f0ff', y: '#73eff7'}, hp: 15, def: 3,
                      recipe: {mutiara: 3, batu: 5, koin: 30}, desc: 'HP +15, Pertahanan +3.'},
    zirahPahlawan:   {type: 'pelindung', name: 'Perisai Pahlawan', icon: 'shield', pal: {b: '#ffcd75', y: '#e43b44'}, hp: 25, def: 5,
                      recipe: {mutiara: 8, mahkota: 3, koin: 60}, desc: 'HP +25, Pertahanan +5.'},

    kalungKoin:      {type: 'aksesori', name: 'Kalung Koin', icon: 'ring', pal: {r: '#ffcd75', y: '#94b0c2'}, coins: 1,
                      recipe: {sayap: 5, koin: 10}, desc: 'Setiap monster memberi +1 koin.'},
    cincinBintang:   {type: 'aksesori', name: 'Cincin Bintang', icon: 'ring', pal: {r: '#73eff7'}, xp: 20,
                      recipe: {mahkota: 2, sayap: 3, koin: 20}, desc: 'XP +20%.'},
    jimatKilat:      {type: 'aksesori', name: 'Jimat Kilat', icon: 'ring', pal: {r: '#73eff7', y: '#ffcd75'}, crit: 15, critDmg: 20,
                      recipe: {sayap: 4, mahkota: 1, koin: 15}, desc: 'Kritikal +15%, damage kritikal +20%.'}
,
    jimatTinta:      {type: 'aksesori', name: 'Jimat Tinta', icon: 'ring', pal: {r: '#3b5dc9', y: '#73eff7'}, crit: 10, xp: 30,
                      recipe: {tinta: 3, sayap: 5, koin: 30}, desc: 'Kritikal +10%, XP +30%.'},
    mahkotaBijak:    {type: 'aksesori', name: 'Mahkota Bijak', icon: 'crown', pal: {y: '#73eff7', r: '#b06fd0'}, crit: 20, critDmg: 50, coins: 2,
                      recipe: {tinta: 8, mahkota: 3, koin: 60}, desc: 'Kritikal +20%, damage kritikal +50%, +2 koin tiap monster.'}
  },

  /** Urutan barang di Toko dan resep di Pandai Besi. */
  shop: ['ramuan', 'pedangKayu', 'perisaiKayu'],
  smith: ['pedangPenjumlah', 'kapakPengurang', 'perisaiBatu', 'kalungKoin', 'jimatKilat', 'tongkatBentuk', 'paluPuluhan', 'cincinBintang',
          'pedangKristal', 'perisaiMutiara', 'jimatTinta', 'pedangPahlawan', 'zirahPahlawan', 'mahkotaBijak', 'pedangBintang'],

  /* Area = jalur 5 titik: 1, 2, ⭐ mini bos (mini, atau monster biasa yang lebih besar), 4, 👑 bos. Bisa diulang.
     Field Kelas 1, berurutan. spec.kinds = jenis soal (lihat questions.js GEN);
     req = field yang bosnya harus dikalahkan dulu; soon = belum bisa dimainkan;
     pace = pengali jeda serangan musuh (soal yang butuh waktu berpikir → musuh lebih lambat). */
  fields: [
    /* Area mengikuti 8 bab buku Matematika Kelas 1 (Kurikulum Merdeka, 2026-11-26):
       Padang = Bab 1, Hutan = Bab 2–3, Bukit = Bab 4, Danau = Bab 5–6, Lembah = Bab 7, Menara Data = Bab 8. */
    {id: 'padang', pace: 1.4, name: 'Padang Hitung', icon: '🌼', lv: [1, 3], desc: 'Bilangan 1–10: menghitung, membandingkan & urutan',
     spec: {kinds: ['hitung', 'hitung', 'banding', 'posisi', 'urutan'], max: 10}, mobs: ['lendir', 'lendirAir'], mini: 'lendirBunga', boss: 'rajaLendir'},
    {id: 'hutan', pace: 1.0, name: 'Hutan Tambah-Kurang', icon: '🌲', lv: [3, 5], req: 'padang', desc: 'Penjumlahan & pengurangan sampai 10',
     spec: {kinds: ['tambah', 'kurang', 'isi', 'tambah', 'kurang', 'pasangan', 'pasangan', 'cerita', 'berulang', 'keluarga'], max: 10}, mobs: ['jamur', 'jamurUngu', 'lendir'], boss: 'rajaJamur'},
    {id: 'bukit', pace: 1.3, name: 'Bukit Bentuk', icon: '⛰️', lv: [5, 7], req: 'hutan', desc: 'Bangun datar: mengenal, mengelompokkan & menyusun',
     spec: {kinds: ['bentuk', 'bentuk', 'kelompok', 'susun', 'pola']}, mobs: ['lendirBatu', 'jamurBatu'], boss: 'rajaBatu'},
    {id: 'danau', pace: 1.1, name: 'Danau Dua Puluh', icon: '🌊', lv: [7, 10], req: 'bukit', desc: 'Bilangan 11–20, nilai tempat, tambah & kurang sampai 20',
     spec: {kinds: ['belasan', 'belasan', 'puluhan', 'banding', 'urutan', 'tambah', 'tambah', 'kurang', 'dobel', 'isi', 'cerita'], max: 20}, mobs: ['lendirAir', 'kelelawar'], boss: 'rajaKelelawar'},
    {id: 'lembah', pace: 1.3, name: 'Lembah Ukur', icon: '📏', lv: [9, 12], req: 'danau', desc: 'Mengukur panjang benda',
     spec: {kinds: ['panjang', 'ukur']}, mobs: ['kelelawarDaun', 'jamurKayu'], boss: 'rajaJamurKayu'},
    {id: 'menara', pace: 1.4, name: 'Menara Data', icon: '📊', lv: [11, 14], req: 'lembah', desc: 'Diagram: mengelompokkan data, tabel turus & diagram gambar',
     spec: {kinds: ['data', 'data', 'turus'], max: 20}, mobs: ['kelelawarMalam', 'lendirUngu'], boss: 'rajaMalam'},
    /* Ujian Naik Kelas: terbuka setelah semua area di atas selesai (reqAll). 2 soal dari tiap area, lulus ≥ 75%. */
    {id: 'kastil', name: 'Kastil Ujian', icon: '🏰', lv: [14, 14], exam: true, reqAll: true, boss: 'naga',
     desc: 'Ujian Naik Kelas: 12 soal campuran'}
  ],

  /* Dunia Kelas 2 (GDD §15). Belum aktif: dipakai lewat MQ.Data.useKelas(2) setelah peta Kelas 2 dibuat.
     Monster masih sementara (pakai monster Kelas 1) sampai monster Kelas 2 dibuat. */
  fieldsKelas2: [
    {id: 'k2ribu', kelas: 2, pace: 1.3, name: 'Padang Seribu', icon: '💯', lv: [16, 17], desc: 'Bilangan sampai 1.000: ratusan, nilai tempat, loncat & urutan',
     spec: {kinds: ['ratusan', 'ratusan', 'nilai', 'lompat', 'banding', 'urutan'], max: 1000}, mobs: ['lendir', 'lendirAir'], mini: 'lendirBunga', boss: 'rajaLendir'},
    {id: 'k2susun', kelas: 2, pace: 1.4, name: 'Penjumlahan Bersusun', icon: '➕', lv: [17, 19], req: 'k2ribu', desc: 'Cara berhitung cepat & penjumlahan bersusun',
     spec: {kinds: ['bersusun', 'bersusun', 'bersusun', 'hitungCepat', 'hitungCepat'], max: 100}, mobs: ['jamur', 'jamurUngu'], boss: 'rajaJamur'},
    {id: 'k2kurang', kelas: 2, pace: 1.4, name: 'Kurang Bersusun', icon: '➖', lv: [19, 21], req: 'k2susun', desc: 'Pengurangan bersusun, mengurang cepat & mengecek',
     spec: {kinds: ['kurangSusun', 'kurangSusun', 'kurangSusun', 'kurangCepat', 'kurangCepat', 'bersusun'], max: 100}, mobs: ['kelelawar', 'lendirAir'], boss: 'rajaKelelawar'},
    {id: 'k2ukur', kelas: 2, pace: 1.4, name: 'Ukur & Data', icon: '📏', lv: [21, 23], req: 'k2kurang', desc: 'Panjang (cm, m), banyaknya air (L, dL), tabel & grafik',
     spec: {kinds: ['cm', 'cm', 'cm', 'air', 'air', 'air', 'data', 'turus'], max: 20}, mobs: ['kelelawarDaun', 'jamurKayu'], boss: 'rajaJamurKayu'},
    {id: 'k2waktu', kelas: 2, pace: 1.5, name: 'Waktu & Uang', icon: '⏰', lv: [23, 24], req: 'k2ukur', desc: 'Membaca jam, lama waktu & berbelanja dengan uang',
     spec: {kinds: ['jam', 'jam', 'jam', 'durasi', 'durasi', 'uang', 'uang', 'uang']}, mobs: ['kelelawarMalam', 'lendirUngu'], boss: 'rajaMalam'},
    {id: 'k2kali1', kelas: 2, pace: 1.3, name: 'Perkalian 1', icon: '✖️', lv: [24, 26], req: 'k2waktu', desc: 'Arti perkalian, perkalian 2, 5, 3 & 4',
     spec: {kinds: ['kaliArti', 'kaliArti', 'kaliTabel', 'kaliTabel', 'kaliTabel', 'kaliCerita'], tabel: [2, 5, 3, 4]}, mobs: ['lendir', 'jamurUngu'], boss: 'rajaLendir'},
    {id: 'k2kali2', kelas: 2, soon: true, name: 'Perkalian 2', icon: '✖️', lv: [26, 27], req: 'k2kali1', desc: 'Perkalian (3)–(4)'},
    {id: 'k2bangun', kelas: 2, soon: true, name: 'Bangun', icon: '🔺', lv: [27, 29], req: 'k2kali2', desc: 'Segitiga, segiempat, bentuk kotak'},
    {id: 'k2pecahan', kelas: 2, soon: true, name: 'Bilangan 10.000 & Pecahan', icon: '🍕', lv: [29, 30], req: 'k2bangun', desc: 'Bilangan sampai 10.000, pecahan'},
    /* Ujian Naik Kelas 2: dibuka setelah 9 peta selesai dibuat (soon sampai saat itu). */
    {id: 'k2kastil', kelas: 2, soon: true, name: 'Istana Ujian', icon: '🏯', lv: [30, 30], exam: true, reqAll: true, boss: 'naga',
     desc: 'Ujian Naik Kelas 2: soal campuran dari semua peta'}
  ],

  /* Dungeon bercerita (dibuka dari menu 🏰 Dungeon, js/dungeon.js; tingkat ⭐/⭐⭐/⭐⭐⭐ di balance.js "tiers"):
     rooms ruang beruntun, HP tidak pulih; ruang keyRoom = monster kunci (key), ruang terakhir = bos, lalu peti.
     Cerita: adegan "<id>-intro", "<id>-key", "<id>-end" di story.js (tampil sekali). Bisa diulang untuk latihan & XP. */
  dungeons: [
    {id: 'guaPola', pace: 1.3, name: 'Gua Pola', icon: '🕳️', req: 'bukit', lv: [5, 8], rooms: 5, keyRoom: 3, key: 'penjagaPola',
     dungeon: true, desc: 'Bantu Momo menyelamatkan keluarganya.', topic: 'Pola & bentuk',
     spec: {kinds: ['pola', 'bentuk', 'kelompok', 'susun']}, mobs: ['lendirBatu', 'jamurBatu', 'kelelawar'], boss: 'rajaBatu',
     reward: {coins: 15, items: {ramuan: 1, mahkota: 1, kristalPola: 2}}},
    {id: 'kapalKaram', pace: 1.2, name: 'Kapal Karam', icon: '⛵', req: 'danau', lv: [7, 10], rooms: 6, keyRoom: 3, key: 'kepitingBesar',
     dungeon: true, desc: 'Bantu Kapten Kumis mencari hartanya.', topic: 'Tambah & kurang sampai 20',
     spec: {kinds: ['tambah', 'kurang', 'isi', 'hitung', 'cerita'], max: 20}, mobs: ['kepiting', 'lendirLaut'], boss: 'rajaKepiting',
     reward: {coins: 25, items: {ramuan: 2, mahkota: 1, mutiara: 2}}},
    {id: 'perpustakaan', pace: 1.4, name: 'Perpustakaan Tua', icon: '📚', req: 'lembah', lv: [10, 13], rooms: 7, keyRoom: 4, key: 'hantuTinta',
     dungeon: true, desc: 'Bantu Hantu Buku merapikan nomor halaman.', topic: 'Bilangan sampai 20 & diagram',
     spec: {kinds: ['urutan', 'belasan', 'banding', 'data', 'turus'], max: 20}, mobs: ['hantuKertas', 'kelelawarBuku'], boss: 'rajaTinta',
     reward: {coins: 35, items: {ramuan: 2, mahkota: 2, tinta: 2}}}
  ],

  /* Arena Latihan: selalu terbuka, soal mengikuti level & mode pilihan, monster ikut level pemain. */
  arena: {id: 'arena', name: 'Arena Latihan', icon: '🎯', desc: 'Latihan bebas: pilih jenis soal',
          mobs: ['lendir', 'kelelawar', 'jamur'], boss: 'naga'}
};

/* Dunia per kelas: fields/dungeons yang aktif mengikuti kelas yang sedang dimainkan (S.kelas). */
MQ.Data.byKelas = {1: {fields: MQ.Data.fields, dungeons: MQ.Data.dungeons}, 2: {fields: MQ.Data.fieldsKelas2, dungeons: []}};
/** Ganti dunia aktif (hanya peta; dungeon tetap Kelas 1 sampai dungeon Kelas 2 dibuat). Kelas yang belum ada → Kelas 1. */
MQ.Data.useKelas = k => { const w = MQ.Data.byKelas[k] || MQ.Data.byKelas[1]; MQ.Data.fields = w.fields; return MQ.Data.byKelas[k] ? k : 1; };
/** Semua area dari semua kelas (untuk mencari area syarat). */
MQ.Data.allFields = () => [].concat(...Object.values(MQ.Data.byKelas).map(w => w.fields));
