/* Math Quest — naskah cerita & latar cutscene.

   Setiap adegan (SCENES[id]) adalah daftar langkah. Satu langkah = satu baris dialog:
     {bg, actors, fx, who, text}
       bg     : latar (lihat BG) — tetap sampai diganti
       actors : {nama: posisi % dari kiri | null (keluar)} — tokoh yang tampil, tetap sampai diubah
                nama: hero, kakek, kiki, penyihir, crystal, atau id monster dari data.js
       fx     : efek: shake | flash | sparkle | shards | dark
       who    : yang berbicara (hero, kakek, kiki, penyihir, narator, atau id monster)
       text   : kalimat; {nama} diganti nama pahlawan
   Id tiap baris untuk rekaman suara = "<adegan>-<nomor>" (mulai 1), mis. "prolog-3".
   Rekaman ditaruh di audio/vo/<id>.mp3 lalu id-nya dimasukkan ke VO di bawah. */
'use strict';
window.MQ = window.MQ || {};

MQ.Story = (() => {
  const NAMES = {kakek: 'Kakek Bilang', kiki: 'Kiki', penyihir: 'Penyihir Kusut', narator: ''};

  /** Id baris yang sudah punya rekaman suara (isi setelah file audio/vo/*.mp3 ditambahkan). */
  const VO = new Set([]);

  const SCENES = {
    prolog: [
      {bg: 'desa', actors: {kakek: 30, hero: 70, crystal: 50}, who: 'kakek', text: 'Halo, {nama}! Selamat datang di Desa Bilangan.'},
      {who: 'kakek', text: 'Lihat Kristal Angka itu. Kristal itu membuat semua angka di lembah ini rapi dan tertib.'},
      {bg: 'malam', actors: {kakek: null, hero: null, penyihir: 20}, fx: 'flash', who: 'penyihir', text: 'Hihihi! Aku Penyihir Kusut. Aku TIDAK suka angka yang rapi!'},
      {fx: 'shards', actors: {crystal: null}, who: 'penyihir', text: 'Kristal ini kupecah jadi 6 kepingan! Biar semua angka kacau-balau!'},
      {bg: 'desa', actors: {penyihir: null, kakek: 30, hero: 70}, fx: 'shake', who: 'kakek', text: 'Oh tidak! Monster-monster jadi nakal karena angkanya kacau.'},
      {who: 'kakek', text: '{nama}, kamu pemberani dan pintar berhitung. Maukah kamu mengumpulkan 6 kepingan kristal?'},
      {who: 'hero', text: 'Siap, Kek! Aku akan mengumpulkan semuanya!'},
      {actors: {kiki: 50}, fx: 'sparkle', who: 'kiki', text: 'Kuk-kuk! Aku Kiki. Aku akan menemanimu berpetualang!'},
      {who: 'kakek', text: 'Kepingan pertama dibawa Raja Lendir di Padang Hitung. Hati-hati, ya!'}
    ],

    'padang-intro': [
      {bg: 'padang', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Ini Padang Hitung. Para lendir sedang bingung menghitung.'},
      {actors: {lendir: 80}, who: 'kiki', text: 'Kalahkan mereka dengan menghitung yang benar. Raja Lendir menyimpan kepingan pertama!'}
    ],
    'padang-shard': [
      {bg: 'padang', actors: {hero: 30, rajaLendir: 72}, who: 'rajaLendir', text: 'Blub... blub... aku kalah! Ini kepingannya.'},
      {actors: {rajaLendir: null, kiki: 60, shard: 72}, fx: 'sparkle', who: 'kiki', text: 'Hore! Kepingan kristal pertama! Tinggal 5 lagi.'}
    ],

    'hutan-intro': [
      {bg: 'hutan', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Hutan Tambah-Kurang gelap sekali...'},
      {actors: {jamur: 80}, who: 'kiki', text: 'Jamur-jamur di sini suka menambah dan mengurangi sembarangan. Ayo luruskan!'}
    ],
    'hutan-shard': [
      {bg: 'hutan', actors: {hero: 30, rajaJamur: 72}, who: 'rajaJamur', text: 'Puff! Hitunganmu hebat. Ambil kepingan ini.'},
      {actors: {rajaJamur: null, kiki: 60, shard: 72}, fx: 'sparkle', who: 'kiki', text: 'Dua kepingan! Kristalnya mulai bercahaya lagi.'}
    ],

    'bukit-intro': [
      {bg: 'bukit', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Bukit Bentuk penuh batu berbentuk aneh: kotak, bulat, dan segitiga.'},
      {actors: {lendirBatu: 80}, who: 'kiki', text: 'Raja Batu menjaga kepingan ketiga. Kenali bentuk dan polanya, ya!'}
    ],
    'bukit-shard': [
      {bg: 'bukit', actors: {hero: 30, rajaBatu: 72}, fx: 'shake', who: 'rajaBatu', text: 'Dug... dug... Kamu jago mengenal bentuk!'},
      {actors: {rajaBatu: null, kiki: 60, shard: 72}, fx: 'sparkle', who: 'kiki', text: 'Kepingan ketiga! Separuh kristal sudah kembali!'}
    ],

    'danau-intro': [
      {bg: 'danau', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Danau Dua Puluh airnya berkilau. Di sini hitungannya sampai dua puluh!'},
      {actors: {kelelawar: 80}, who: 'kiki', text: 'Awas, kelelawarnya cepat! Jawab dengan sigap.'}
    ],
    'danau-shard': [
      {bg: 'danau', actors: {hero: 30, rajaKelelawar: 72}, who: 'rajaKelelawar', text: 'Ciiit! Kamu lebih cepat dariku. Kepingan ini milikmu.'},
      {actors: {rajaKelelawar: null, kiki: 60, shard: 72}, fx: 'sparkle', who: 'kiki', text: 'Empat kepingan! Kamu makin kuat, {nama}!'}
    ],

    'lembah-intro': [
      {bg: 'lembah', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Di Lembah Ukur, semua benda harus diukur dengan teliti.'},
      {actors: {jamurKayu: 80}, who: 'kiki', text: 'Mana yang lebih panjang? Berapa kotak panjangnya? Ayo kita ukur!'}
    ],
    'lembah-shard': [
      {bg: 'lembah', actors: {hero: 30, rajaJamurKayu: 72}, who: 'rajaJamurKayu', text: 'Krek... Ukuranmu tepat sekali. Ambillah kepingannya.'},
      {actors: {rajaJamurKayu: null, kiki: 60, shard: 72}, fx: 'sparkle', who: 'kiki', text: 'Lima kepingan! Tinggal satu lagi di Menara Seratus.'}
    ],

    'menara-intro': [
      {bg: 'menara', actors: {hero: 30, kiki: 60}, who: 'kiki', text: 'Menara Seratus tinggi sekali. Angkanya sampai seratus!'},
      {actors: {kelelawarMalam: 80}, who: 'kiki', text: 'Ingat: satu ikat isinya sepuluh lidi. Kamu pasti bisa!'}
    ],
    'menara-shard': [
      {bg: 'menara', actors: {hero: 30, rajaMalam: 72}, who: 'rajaMalam', text: 'Hmm... Kamu benar-benar paham puluhan dan satuan.'},
      {actors: {rajaMalam: null, kiki: 55, shard: 75}, fx: 'sparkle', who: 'kiki', text: 'Keenam! Semua kepingan sudah terkumpul!'},
      {actors: {penyihir: 78, shard: null}, fx: 'flash', who: 'penyihir', text: 'Grr! Kamu mengumpulkan semua kepinganku?'},
      {who: 'penyihir', text: 'Datanglah ke Kastil Ujian kalau berani! Raja Naga Api akan mengujimu!'},
      {actors: {penyihir: null}, who: 'kiki', text: 'Kita harus lebih kuat dulu. Latihlah dirimu sampai Level 20, lalu ke Kastil Ujian!'}
    ],

    'kastil-intro': [
      {bg: 'kastil', actors: {hero: 25, kiki: 45, penyihir: 80}, fx: 'dark', who: 'penyihir', text: 'Akhirnya kamu datang juga, {nama}!'},
      {actors: {naga: 70, penyihir: 90}, fx: 'shake', who: 'penyihir', text: 'Raja Naga Api, uji anak itu dengan 12 soal sulit!'},
      {who: 'kiki', text: 'Jawab dengan tenang. Di ujian, musuh tidak menyerang. Kamu pasti bisa!'}
    ],
    ending: [
      {bg: 'kastil', actors: {hero: 25, kiki: 45, naga: 70, penyihir: 90}, fx: 'shake', who: 'penyihir', text: 'Tidaaak! Semua jawabanmu benar!'},
      {actors: {naga: null, penyihir: null}, fx: 'flash', who: 'narator', text: 'Penyihir Kusut kabur terbirit-birit. Keenam kepingan bersinar terang...'},
      {bg: 'desa', actors: {kakek: 30, hero: 70, kiki: 50, crystal: 50}, fx: 'sparkle', who: 'kakek', text: 'Kristal Angka utuh kembali! Terima kasih, {nama}!'},
      {who: 'kakek', text: 'Kamu lulus Kelas 1. Kamu pahlawan Desa Bilangan!'},
      {who: 'kiki', text: 'Kuk-kuk! Lihat, ada jalan baru menuju Kelas 2...'},
      {who: 'narator', text: 'Bersambung...'}
    ]
  };

  /* ===== Latar cutscene (kanvas 160×96 "piksel") ===== */
  const BG = {
    desa:   {sky: ['#41a6f6', '#73eff7', '#a6f4f9'], ground: '#38b764', deco: 'houses'},
    malam:  {sky: ['#1a1c2c', '#29366f', '#3b5dc9'], ground: '#257179', deco: 'houses', stars: true},
    padang: {sky: ['#41a6f6', '#73eff7', '#a6f4f9'], ground: '#38b764', deco: 'flowers'},
    hutan:  {sky: ['#257179', '#38b764', '#a7f070'], ground: '#257179', deco: 'trees'},
    bukit:  {sky: ['#5bb8f8', '#a6f4f9', '#f4f4f4'], ground: '#8fbf6a', deco: 'rocks'},
    danau:  {sky: ['#41a6f6', '#73eff7', '#a6f4f9'], ground: '#41a6f6', deco: 'water'},
    lembah: {sky: ['#ef7d57', '#ffcd75', '#fff3b0'], ground: '#d4a373', deco: 'cliffs'},
    menara: {sky: ['#1a1c2c', '#29366f', '#5d275d'], ground: '#333c57', deco: 'tower', stars: true},
    kastil: {sky: ['#1a1c2c', '#5d275d', '#b13e53'], ground: '#566c86', deco: 'castle'}
  };
  function drawBg(canvas, kind) {
    // Kanvas tegak (160×230) agar pas di layar HP; pemandangan digambar di 96 baris bawah (OFF = geser ke bawah)
    const W = 160, H = 230, OFF = H - 96, SC = 4, b = BG[kind] || BG.desa;
    canvas.width = W * SC; canvas.height = H * SC;
    const x = canvas.getContext('2d');
    x.scale(SC, SC);
    const rect = (c, a, y, w, h) => { x.fillStyle = c; x.fillRect(a, y + OFF, w, h); };
    const circle = (cx, cy, r, c) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); rect(c, cx - w, cy + dy, w * 2 + 1, 1); } };
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // langit bertingkat memenuhi bagian atas kanvas
    const band = Math.ceil((OFF + 66) / 3);
    b.sky.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, i * band, W, band); });
    x.fillStyle = b.sky[2]; x.fillRect(0, 2 * band, W, H - 2 * band);
    if (b.stars) for (let i = 0; i < 45; i++) { x.fillStyle = '#f4f4f4'; x.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * (OFF + 60)), 1, 1); }
    if (!b.stars) [[30, 40], [110, 70]].forEach(([cx, cy]) => { x.fillStyle = '#f4f4f4'; x.fillRect(cx - 8, cy, 18, 4); x.fillRect(cx - 4, cy - 3, 9, 3); }); // awan
    rect(b.ground, 0, 70, W, 26);
    rect('#1a1c2c', 0, 70, W, 1);
    if (b.deco === 'houses') {
      [[14, '#e43b44'], [52, '#41a6f6'], [118, '#ffcd75']].forEach(([hx, roof]) => {
        rect('#1a1c2c', hx - 1, 49, 24, 22); rect('#ffe4c4', hx, 50, 22, 20); rect('#ab5236', hx + 8, 58, 6, 12);
        for (let i = 0; i < 9; i++) rect('#1a1c2c', hx - 3 + i, 49 - i, 28 - i * 2, 1), rect(roof, hx - 2 + i, 49 - i, 26 - i * 2, 1);
      });
    } else if (b.deco === 'flowers') {
      for (let i = 0; i < 40; i++) rect(['#e43b44', '#ffcd75', '#f4f4f4', '#257179'][i % 4], Math.floor(rnd() * W), 72 + Math.floor(rnd() * 22), 2, 2);
    } else if (b.deco === 'trees') {
      for (let i = 0; i < 9; i++) { const tx = 8 + i * 18; rect('#5d275d', tx - 1, 52, 3, 20); circle(tx, 48, 9, '#1a4c4f'); circle(tx - 2, 46, 5, '#38b764'); }
    } else if (b.deco === 'rocks') {
      for (let i = 0; i < 6; i++) { const rx = 6 + i * 27; circle(rx, 70, 12, '#94b0c2'); circle(rx - 3, 67, 6, '#f4f4f4'); }
    } else if (b.deco === 'water') {
      rect('#ffcd75', 0, 70, W, 4);
      for (let i = 0; i < 20; i++) rect('#73eff7', Math.floor(rnd() * W), 76 + Math.floor(rnd() * 18), 5, 1);
    } else if (b.deco === 'cliffs') {
      for (let i = 0; i < 8; i++) rect('#ab5236', Math.floor(rnd() * 140), 74 + Math.floor(rnd() * 18), 14, 2);
      rect('#ab5236', 0, 40, 20, 30); rect('#ab5236', 140, 34, 20, 36);
    } else if (b.deco === 'tower') {
      rect('#1a1c2c', 69, 14, 22, 57); rect('#94b0c2', 70, 15, 20, 55); rect('#566c86', 82, 15, 8, 55);
      for (let y = 22; y < 64; y += 10) rect('#ffcd75', 77, y, 4, 5);
      rect('#e43b44', 66, 8, 28, 7);
    } else if (b.deco === 'castle') {
      rect('#1a1c2c', 30, 34, 100, 37); rect('#94b0c2', 31, 35, 98, 35);
      for (let i = 31; i < 128; i += 8) rect('#94b0c2', i, 30, 5, 5);
      [[24], [122]].forEach(([tx]) => { rect('#1a1c2c', tx - 1, 16, 16, 55); rect('#566c86', tx, 17, 14, 53); rect('#e43b44', tx + 6, 6, 1, 11); rect('#ffcd75', tx + 7, 6, 6, 4); });
      rect('#5d275d', 70, 50, 20, 21);
    }
  }

  /** Nama tampilan pembicara. */
  const speakerName = (who, heroName) => (who === 'hero' ? heroName : NAMES[who] !== undefined ? NAMES[who] : (MQ.Data.monsters[who] || {}).name || '');

  return {SCENES, NAMES, VO, BG, drawBg, speakerName};
})();
