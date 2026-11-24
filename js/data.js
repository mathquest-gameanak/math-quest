/* Math Quest — data monster, item, field, dungeon. Desain lengkap: docs/GDD.md.
   Monster & item varian dibuat dari sprite yang sama dengan palet berbeda (pal = warna pengganti). */
'use strict';
window.MQ = window.MQ || {};

MQ.Data = {
  /* Gaya menyerang bawaan per jenis tubuh:
     spd   = jeda antar serangan dalam detik [min, maks] (acak di antaranya); besar = lambat
     power = pengali damage. Monster boleh menimpa nilainya sendiri (lihat monster batu). */
  styles: {
    bat:      {spd: [1.5, 3], power: 0.8},   // kelelawar: cepat tapi lemah
    slime:    {spd: [2.5, 4.5], power: 1},
    mushroom: {spd: [3, 5], power: 1.1},
    dragon:   {spd: [3.5, 5.5], power: 1.3}   // besar: lambat tapi kuat
  },

  /* drop = bahan yang dijatuhkan. Bos (nama "Raja ...") selalu menjatuhkan lebih banyak + Mahkota. */
  monsters: {
    lendir:         {name: 'Lendir Hijau', sprite: 'slime', drop: 'lendir'},
    lendirAir:      {name: 'Lendir Air', sprite: 'slime', drop: 'lendir', pal: {g: '#41a6f6', G: '#73eff7', d: '#3b5dc9'}},
    rajaLendir:     {name: 'Raja Lendir', sprite: 'slime', drop: 'lendir', pal: {g: '#ffcd75', G: '#fff3b0', d: '#ef7d57'}},
    jamur:          {name: 'Jamur Nakal', sprite: 'mushroom', drop: 'spora'},
    jamurUngu:      {name: 'Jamur Ungu', sprite: 'mushroom', drop: 'spora', pal: {r: '#b06fd0'}},
    rajaJamur:      {name: 'Raja Jamur', sprite: 'mushroom', drop: 'spora', pal: {r: '#ef7d57', w: '#ffcd75', c: '#fff3b0'}},
    kelelawar:      {name: 'Kelelawar Ungu', sprite: 'bat', drop: 'sayap'},
    rajaKelelawar:  {name: 'Raja Kelelawar', sprite: 'bat', drop: 'sayap', pal: {p: '#b13e53', P: '#ef7d57'}},
    lendirBatu:     {name: 'Lendir Batu', sprite: 'slime', drop: 'batu', spd: [4, 6], power: 1.4, pal: {g: '#94b0c2', G: '#f4f4f4', d: '#566c86'}},
    jamurBatu:      {name: 'Jamur Batu', sprite: 'mushroom', drop: 'batu', spd: [4, 6], power: 1.4, pal: {r: '#566c86', c: '#94b0c2', C: '#566c86'}},
    rajaBatu:       {name: 'Raja Batu', sprite: 'slime', drop: 'batu', spd: [4, 6], power: 1.4, pal: {g: '#566c86', G: '#94b0c2', d: '#333c57'}},
    kelelawarDaun:  {name: 'Kelelawar Daun', sprite: 'bat', drop: 'sayap', pal: {p: '#257179', P: '#a7f070'}},
    jamurKayu:      {name: 'Jamur Kayu', sprite: 'mushroom', drop: 'kayu', pal: {r: '#ab5236', c: '#ffcd75'}},
    rajaJamurKayu:  {name: 'Raja Jamur Kayu', sprite: 'mushroom', drop: 'kayu', pal: {r: '#5d275d', w: '#ffcd75', c: '#ef7d57'}},
    kelelawarMalam: {name: 'Kelelawar Malam', sprite: 'bat', drop: 'sayap', pal: {p: '#333c57', P: '#566c86'}},
    lendirUngu:     {name: 'Lendir Ungu', sprite: 'slime', drop: 'kayu', pal: {g: '#b06fd0', G: '#f4a3c8', d: '#5d275d'}},
    rajaMalam:      {name: 'Raja Malam', sprite: 'bat', drop: 'sayap', pal: {p: '#1a1c2c', P: '#5d275d', w: '#ffcd75'}},
    naga:           {name: 'Raja Naga Api', sprite: 'dragon', drop: 'batu'}
  },

  /* ===== Item =====
     type: bahan | ramuan | senjata | pelindung | aksesori
     price  = bisa dibeli di Toko (koin)
     recipe = bisa dibuat di Pandai Besi {bahan: jumlah, koin: jumlah}
     Efek: atk (serangan +), bonus {kinds, dmg} (damage tambahan untuk jenis soal tertentu),
           hp (HP maks +), def (pertahanan +), coins (koin + per monster), xp (persen XP +) */
  items: {
    lendir:  {type: 'bahan', name: 'Gumpalan Lendir', icon: 'blob', desc: 'Lengket! Dari para Lendir.'},
    spora:   {type: 'bahan', name: 'Spora Jamur', icon: 'cap', desc: 'Dari para Jamur.'},
    sayap:   {type: 'bahan', name: 'Sayap Kelelawar', icon: 'wing', desc: 'Dari para Kelelawar.'},
    batu:    {type: 'bahan', name: 'Batu Kotak', icon: 'rock', desc: 'Keras sekali. Dari monster batu.'},
    kayu:    {type: 'bahan', name: 'Kayu Ajaib', icon: 'log', desc: 'Dari Jamur Kayu & Lendir Ungu.'},
    mahkota: {type: 'bahan', name: 'Mahkota Kecil', icon: 'crown', desc: 'Langka! Hanya dari bos.'},

    ramuan:  {type: 'ramuan', name: 'Ramuan Penyembuh', icon: 'potion', price: 5, desc: 'Minum saat bertarung: HP penuh lagi.'},

    pedangKayu:      {type: 'senjata', name: 'Pedang Kayu', icon: 'sword', pal: {w: '#d4a373'}, price: 8, atk: 2,
                      desc: 'Serangan +2.'},
    pedangPenjumlah: {type: 'senjata', name: 'Pedang Penjumlah', icon: 'sword', pal: {w: '#73eff7', y: '#41a6f6'}, atk: 3,
                      bonus: {kinds: ['tambah', 'isi', 'hitung'], dmg: 6}, recipe: {lendir: 5, spora: 3, koin: 10},
                      desc: 'Serangan +3. Ekstra +6 di soal tambah, isi kosong & menghitung.'},
    kapakPengurang:  {type: 'senjata', name: 'Kapak Pengurang', icon: 'axe', pal: {w: '#f4a3c8'}, atk: 3,
                      bonus: {kinds: ['kurang', 'isi'], dmg: 6}, recipe: {spora: 5, lendir: 3, koin: 10},
                      desc: 'Serangan +3. Ekstra +6 di soal kurang & isi kosong.'},
    tongkatBentuk:   {type: 'senjata', name: 'Tongkat Bentuk', icon: 'staff', atk: 4,
                      bonus: {kinds: ['bentuk', 'pola', 'panjang', 'ukur'], dmg: 7}, recipe: {batu: 5, mahkota: 1, koin: 15},
                      desc: 'Serangan +4. Ekstra +7 di soal bentuk, pola & panjang.'},
    paluPuluhan:     {type: 'senjata', name: 'Palu Puluhan', icon: 'hammer', atk: 5,
                      bonus: {kinds: ['puluhan', 'urutan', 'banding'], dmg: 8}, recipe: {kayu: 4, batu: 4, koin: 20},
                      desc: 'Serangan +5. Ekstra +8 di soal puluhan, urutan & bandingkan.'},

    perisaiKayu:     {type: 'pelindung', name: 'Perisai Kayu', icon: 'shield', price: 12, hp: 10, def: 1, desc: 'HP +10, Pertahanan +1.'},
    perisaiBatu:     {type: 'pelindung', name: 'Perisai Batu', icon: 'shield', pal: {b: '#566c86', y: '#94b0c2'}, hp: 25, def: 2,
                      recipe: {batu: 6, koin: 15}, desc: 'HP +25, Pertahanan +2.'},

    kalungKoin:      {type: 'aksesori', name: 'Kalung Koin', icon: 'ring', pal: {r: '#ffcd75', y: '#94b0c2'}, coins: 1,
                      recipe: {sayap: 5, koin: 10}, desc: 'Setiap monster memberi +1 koin.'},
    cincinBintang:   {type: 'aksesori', name: 'Cincin Bintang', icon: 'ring', pal: {r: '#73eff7'}, xp: 20,
                      recipe: {mahkota: 2, sayap: 3, koin: 20}, desc: 'XP +20%.'}
  },

  /** Urutan barang di Toko dan resep di Pandai Besi. */
  shop: ['ramuan', 'pedangKayu', 'perisaiKayu'],
  smith: ['pedangPenjumlah', 'kapakPengurang', 'perisaiBatu', 'kalungKoin', 'tongkatBentuk', 'paluPuluhan', 'cincinBintang'],

  /* Field Kelas 1, berurutan. spec.kinds = jenis soal (lihat questions.js GEN);
     req = field yang bosnya harus dikalahkan dulu; soon = belum bisa dimainkan;
     pace = pengali jeda serangan musuh (soal yang butuh waktu berpikir → musuh lebih lambat). */
  fields: [
    {id: 'padang', pace: 1.4, name: 'Padang Hitung', icon: '🌼', lv: [1, 4], desc: 'Menghitung & membandingkan sampai 10',
     spec: {kinds: ['hitung', 'hitung', 'banding'], max: 10}, mobs: ['lendir', 'lendirAir'], boss: 'rajaLendir'},
    {id: 'hutan', pace: 1.0, name: 'Hutan Tambah-Kurang', icon: '🌲', lv: [4, 8], req: 'padang', desc: 'Tambah & kurang sampai 10',
     spec: {kinds: ['tambah', 'kurang', 'isi'], max: 10}, mobs: ['jamur', 'jamurUngu', 'lendir'], boss: 'rajaJamur'},
    {id: 'bukit', pace: 1.3, name: 'Bukit Bentuk', icon: '⛰️', lv: [7, 11], req: 'hutan', desc: 'Mengenal bentuk & pola',
     spec: {kinds: ['bentuk', 'pola']}, mobs: ['lendirBatu', 'jamurBatu'], boss: 'rajaBatu'},
    {id: 'danau', pace: 1.1, name: 'Danau Dua Puluh', icon: '🌊', lv: [10, 15], req: 'bukit', desc: 'Tambah & kurang sampai 20',
     spec: {kinds: ['tambah', 'kurang', 'isi'], max: 20}, mobs: ['lendirAir', 'kelelawar'], boss: 'rajaKelelawar'},
    {id: 'lembah', pace: 1.3, name: 'Lembah Ukur', icon: '📏', lv: [13, 17], req: 'danau', desc: 'Membandingkan & mengukur panjang',
     spec: {kinds: ['panjang', 'ukur']}, mobs: ['kelelawarDaun', 'jamurKayu'], boss: 'rajaJamurKayu'},
    {id: 'menara', pace: 1.4, name: 'Menara Seratus', icon: '🗼', lv: [16, 20], req: 'lembah', desc: 'Puluhan, urutan & bilangan sampai 100',
     spec: {kinds: ['puluhan', 'urutan', 'banding'], max: 100}, mobs: ['kelelawarMalam', 'lendirUngu'], boss: 'rajaMalam'},
    /* Ujian Naik Kelas: terbuka setelah semua area di atas selesai (reqAll). 2 soal dari tiap area, lulus ≥ 75%. */
    {id: 'kastil', name: 'Kastil Ujian', icon: '🏰', lv: [18, 20], exam: true, reqAll: true, boss: 'naga',
     desc: 'Ujian Naik Kelas: 12 soal campuran'}
  ],

  /* Dungeon: rooms ruang beruntun, hati tidak terisi ulang, ruang terakhir = bos, lalu peti hadiah. Bisa diulang. */
  dungeons: [
    {id: 'guaPola', pace: 1.3, name: 'Gua Pola', icon: '🕳️', req: 'bukit', lv: [8, 12], rooms: 5, dungeon: true,
     desc: '5 ruang, HP tidak terisi ulang. Ada peti harta!',
     spec: {kinds: ['pola', 'bentuk', 'pola']}, mobs: ['lendirBatu', 'jamurBatu', 'kelelawar'], boss: 'rajaBatu',
     reward: {coins: 15, items: {ramuan: 1, mahkota: 1}}}
  ],

  /* Arena Latihan: selalu terbuka, soal mengikuti level & mode pilihan, monster ikut level pemain. */
  arena: {id: 'arena', name: 'Arena Latihan', icon: '🎯', desc: 'Latihan bebas: pilih jenis soal',
          mobs: ['lendir', 'kelelawar', 'jamur'], boss: 'naga'}
};
