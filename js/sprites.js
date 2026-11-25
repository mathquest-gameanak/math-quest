/* Math Quest — pixel art yang ditulis sebagai baris karakter (tanpa file gambar).

   Format sprite:
     pal    : { karakter: warna }  — '.' selalu transparan
     rows   : array string, satu string = satu baris piksel
     mirror : true → setiap baris hanya separuh kiri; separuh kanan dibuat otomatis
              dengan mencerminkan (menjamin sprite simetris & hemat ketik)

   Sprites.url(nama, palGanti) → data-URL PNG yang sudah diperbesar (piksel tetap tajam). */
'use strict';
window.MQ = window.MQ || {};

MQ.Sprites = (() => {
  const K = '#1a1c2c'; // warna garis tepi semua sprite
  const SCALE = 12;    // ukuran 1 piksel sprite dalam gambar hasil

  const DATA = {
    /* Pahlawan (16×16), menghadap kanan dengan pedang */
    hero: {pal: {k: K, b: '#3b5dc9', B: '#73eff7', s: '#ffcd75', e: K, r: '#b13e53', w: '#f4f4f4', y: '#ffcd75', n: '#5d275d'}, rows: [
      '................',
      '.....kkkkk......',
      '....kbBBbbk.....',
      '...kbBbbbbbk....',
      '...kbbbbbbbk....',
      '...ksssssssk....',
      '...ksesssesk.w..',
      '...ksssssssk.w..',
      '....krrrrrk..w..',
      '...krbbbbbrk.w..',
      '..ksbbbbbbbsyy..',
      '..kkbbbbbbbkk...',
      '...kbbbybbbk....',
      '...kbbbkbbbk....',
      '...knnk.knnk....',
      '...kkkk.kkkk....']},

    /* Lendir Hijau (16×16) — sengaja tidak simetris: sisi kiri terkena cahaya */
    slime: {pal: {k: K, g: '#38b764', G: '#a7f070', d: '#257179', w: '#f4f4f4'}, rows: [
      '................',
      '................',
      '................',
      '................',
      '......kkkk......',
      '....kkGGggkk....',
      '...kGGgggggdk...',
      '..kGGggggggddk..',
      '..kGgwkggwkgdk..',
      '.kgggwkggwkggdk.',
      '.kgggggkkgggddk.',
      'kGggggggggggggdk',
      'kgggggggggggdddk',
      'kdgggggggggddddk',
      '.kkkkkkkkkkkkkk.',
      '................']},

    /* Kelelawar Ungu (16×16, dicerminkan) */
    bat: {mirror: true, pal: {k: K, p: '#5d275d', P: '#b06fd0', w: '#f4f4f4'}, rows: [
      '........',
      '........',
      '...k....',
      '...kk...',
      '...kpk..',
      '...kppkk',
      'k..kpppp',
      'kk.kpwwp',
      'kpkkpwkp',
      'kppkpppp',
      'kpppkpPP',
      '.kpkkPwP',
      '..k.kPPP',
      '....kkpp',
      '......kk',
      '........']},

    /* Jamur Nakal (16×16, dicerminkan) */
    mushroom: {mirror: true, pal: {k: K, r: '#e43b44', w: '#f4f4f4', c: '#ffe4c4', C: '#d4a373'}, rows: [
      '........',
      '.....kkk',
      '...kkrrw',
      '..krrrww',
      '.krwwrrr',
      '.krwwrrr',
      'krrrrrrw',
      'krrrrrrr',
      '.kkkkkkk',
      '...kcccc',
      '...kckkc',
      '...kcckc',
      '...kcccc',
      '...kccck',
      '...kCCCC',
      '....kkkk']},

    /* Bos: Raja Naga Api (24×24, dicerminkan) */
    dragon: {mirror: true, pal: {k: K, o: '#ef7d57', d: '#b13e53', y: '#ffcd75', r: '#e43b44', w: '#f4f4f4', b: '#ffe4c4'}, rows: [
      '............',
      '........y..y',
      '..w.....yyyy',
      '..ww....yryy',
      '...ww.kkkkkk',
      '....wkoooooo',
      '....kooooooo',
      '...kookkoooo',
      '...kooyykooo',
      '...kooykyooo',
      '...kooyyyooo',
      '...kooooooko',
      '...kdooooooo',
      '..kdookkkkkk',
      '..kdokwrrwrr',
      '..kddookkkkk',
      '...kdooooooo',
      '..kdddbbbbbb',
      '.kodkdbbbbbb',
      '.kodkdbbbbbb',
      '..kkkdbbbbbb',
      '...kddbbbbbb',
      '...kddddk...',
      '..kkkkkkk...']},

    /* Benda untuk soal menghitung (8×8) */
    apple: {pal: {k: K, r: '#e43b44', w: '#f4f4f4', g: '#38b764'}, rows: [
      '....kg..',
      '...k.gg.',
      '.kkkkkk.',
      'krrrrwrk',
      'krrrrrrk',
      'krrrrrrk',
      '.krrrrk.',
      '..kkkk..']},
    star: {mirror: true, pal: {k: K, y: '#ffcd75'}, rows: [
      '...k',
      '..ky',
      'kkky',
      'kyyy',
      '.kyy',
      '.kyy',
      'kyyk',
      'kkk.']},

    /* ===== Ikon item (8×8). Banyak item memakai ikon yang sama dengan palet berbeda (lihat data.js). ===== */
    coin: {mirror: true, pal: {k: K, y: '#ffcd75', Y: '#fff3b0'}, rows: [
      '..kk', '.kyy', 'kyYy', 'kyYy', 'kyyy', 'kyyy', '.kyy', '..kk']},
    potion: {mirror: true, pal: {k: K, c: '#ab5236', w: '#c7f0ff', r: '#e43b44'}, rows: [
      '...k', '..kc', '..kw', '.kww', 'kwrr', 'krrr', 'krrr', '.kkk']},
    blob: {mirror: true, pal: {k: K, g: '#38b764', G: '#a7f070'}, rows: [
      '...k', '..kg', '.kgg', 'kgGg', 'kggg', 'kggg', '.kgg', '..kk']},
    cap: {mirror: true, pal: {k: K, r: '#e43b44', w: '#f4f4f4', c: '#ffe4c4'}, rows: [
      '..kk', '.krr', 'krwr', 'krrr', 'kkkk', '..kc', '..kc', '..kk']},
    wing: {pal: {k: K, p: '#b06fd0'}, rows: [
      'k.......', 'kk......', 'kpk.....', 'kppk....', 'kpppkk..', 'kppppppk', '.kpkpkpk', '..k.k.k.']},
    rock: {mirror: true, pal: {k: K, G: '#f4f4f4', g: '#94b0c2', d: '#566c86'}, rows: [
      '....', '..kk', '.kGg', 'kGgg', 'kggg', 'kggd', 'kgdd', '.kkk']},
    log: {pal: {k: K, b: '#ab5236', B: '#d4a373', y: '#ffe4c4'}, rows: [
      '........', '.kkkkkk.', 'kbbbbkyk', 'kBBBBkyk', 'kbbbbkyk', '.kkkkkk.', '........', '........']},
    crown: {mirror: true, pal: {k: K, y: '#ffcd75', r: '#e43b44'}, rows: [
      '....', 'k..k', 'kk.k', 'kyky', 'kyyy', 'kyry', 'kyyy', 'kkkk']},
    sword: {pal: {k: K, w: '#f4f4f4', y: '#ffcd75'}, rows: [
      '......kk', '.....kwk', '....kwk.', 'k..kwk..', '.kkwk...', '..kk....', '.kyk....', 'kk.k....']},
    axe: {pal: {k: K, w: '#f4f4f4', b: '#ab5236'}, rows: [
      '.kkk....', 'kwwwk...', 'kwwwbk..', '.kkkkbk.', '.....kbk', '......kb', '.......k', '........']},
    staff: {pal: {k: K, g: '#73eff7', G: '#f4f4f4', b: '#ab5236'}, rows: [
      '..kkk...', '.kgGgk..', '.kgggk..', '..kbk...', '..kbk...', '..kbk...', '..kbk...', '..kkk...']},
    hammer: {pal: {k: K, g: '#94b0c2', G: '#f4f4f4', d: '#566c86', b: '#ab5236'}, rows: [
      'kkkkkkkk', 'kgggGggk', 'kgggggdk', 'kkkbbkkk', '..kbbk..', '..kbbk..', '..kbbk..', '..kkkk..']},
    shield: {mirror: true, pal: {k: K, b: '#ab5236', y: '#ffcd75'}, rows: [
      'kkkk', 'kbbb', 'kbby', 'kbyy', 'kbby', '.kbb', '..kb', '...k']},
    ring: {mirror: true, pal: {k: K, r: '#e43b44', y: '#ffcd75'}, rows: [
      '...k', '..kr', '.kyk', 'ky..', 'ky..', 'ky..', '.kyy', '..kk']},

    /* ===== Tokoh cerita (16×16, dicerminkan) ===== */
    kakek: {mirror: true, pal: {k: K, s: '#ffcd75', w: '#f4f4f4', e: K, g: '#38b764', b: '#5d275d'}, rows: [
      '........', '....kkkk', '...kssss', '..kwssss', '..kwsess', '...kssss', '...kwwww', '...kwwww',
      '..kgkwww', '..kggkww', '..kgggkw', '..kggggg', '..kggggg', '..kggggg', '..kkkkkk', '...kbk..']},
    penyihir: {mirror: true, pal: {k: K, p: '#b06fd0', y: '#ffcd75', c: '#a7f070', e: K, m: '#e43b44', b: K}, rows: [
      '.......k', '......kp', '.....kpp', '....kppp', '...kpppp', '..kyyyyy', '.kkkkkkk', '...kcccc',
      '...kcecc', '...kcccm', '..kpkkkk', '.kpppppp', '.kpppppy', 'kppppppp', 'kkkkkkkk', '..kbk...']},
    kiki: {mirror: true, pal: {k: K, b: '#ab5236', B: '#ffe4c4', w: '#f4f4f4', e: K, y: '#ffcd75', d: '#5d275d'}, rows: [
      '........', '..k.....', '..kkkkkk', '.kbbbbbb', '.kbbwwbb', '.kbbwebb', '.kbbbbby', '.kbbBBBB',
      'kdbBBBBB', 'kdbBBBBB', '.kbBBBBB', '..kbbbbb', '...kkkkk', '...kyk..', '........', '........']},
    crystal: {mirror: true, pal: {k: K, c: '#73eff7', C: '#f4f4f4'}, rows: [
      '.......k', '......kc', '.....kcC', '....kccC', '...kcccC', '..kccccC', '.kcccccC', 'kccccccC',
      'kccccccc', '.kcccccc', '..kccccc', '...kcccc', '....kccc', '.....kcc', '......kc', '.......k']},
    shard: {mirror: true, pal: {k: K, c: '#73eff7', C: '#f4f4f4'}, rows: [
      '...k', '..kc', '.kcC', 'kccC', 'kccc', '.kcc', '..kc', '...k']},

    /* Tokoh & monster dungeon */
    momo: {mirror: true, pal: {k: K, y: '#ffcd75', b: '#8a5a3c', B: '#d4a373', e: K, p: '#f4a3c8', c: '#ffe4c4'}, rows: [
      '....kkkk', '...kyyyy', '..kyyyyy', '.kkkkkkk', '..kbbbbb', '..kbbebb', '..kbbbbp', '..kbBBBB',
      '.kbbBBBB', 'kcbbBBBB', '.kbbBBBB', '..kbbbbb', '...kkkkk', '...kck..', '........', '........']},
    kapten: {mirror: true, pal: {k: K, h: '#333c57', w: '#f4f4f4', o: '#ef7d57', e: K, p: '#f4a3c8', r: '#b13e53', y: '#ffcd75', b: '#5d275d'}, rows: [
      '...kkkkk', '..khhhhh', '.khhhhhw', 'kkkkkkkk', '..kooooo', '..kooeoo', 'wwkoooop', '..kooooo',
      '...kkkkk', '..krrrrr', '.krrrrry', '.krrrrrr', '.krrrrry', '..kkkkkk', '...kbk..', '........']},
    crab: {mirror: true, pal: {k: K, r: '#e43b44', w: '#f4f4f4'}, rows: [
      '........', '.kk.....', 'krrk....', 'kr.k..k.', 'krrk..kw', '.kk...kk', '..k.kkkk', '...krrrr',
      '..krrrrr', '.krrrrrr', '.krrrrrr', '..krrrrr', '..kkkkkk', '.k.k.k..', 'k.k.k...', '........']},
    ghost: {mirror: true, pal: {k: K, w: '#c7f0ff'}, rows: [
      '........', '....kkkk', '...kwwww', '..kwwwww', '..kwwkww', '..kwwkww', '..kwwwww', '..kwwwwk',
      '.kwwwwww', '.kwwwwww', 'kwwwwwww', 'kwwwwwww', 'kwwkwwkw', 'k.k.k.kk', '........', '........']},

    bag: {mirror: true, pal: {k: K, b: '#ab5236', y: '#ffcd75'}, rows: [
      '..kk', '.k..', 'kkkk', 'kbbb', 'kbyb', 'kbbb', 'kbbb', 'kkkk']},

    /* Gerbang dungeon untuk bilah bawah (8×8) */
    gate: {mirror: true, pal: {k: K, g: '#94b0c2', d: '#566c86', n: '#5d275d', y: '#ffcd75'}, rows: [
      'kk.k', 'kgkg', 'kggg', 'kgdk', 'kgkn', 'kgkn', 'kdkn', 'kkkk']},

    /* Hati untuk HUD (7×6). Hati kosong = palet diganti abu-abu. */
    heart: {pal: {k: K, r: '#e43b44', w: '#f4f4f4'}, rows: [
      '.kk.kk.',
      'kwrkrrk',
      'krrrrrk',
      '.krrrk.',
      '..krk..',
      '...k...']}
  };

  /** Baris lengkap sebuah sprite (mencerminkan separuh kiri bila perlu). */
  const rowsOf = s => (s.mirror ? s.rows.map(r => r + [...r].reverse().join('')) : s.rows);

  const cache = {};
  function url(name, palOverride) {
    const key = name + JSON.stringify(palOverride || {});
    if (cache[key]) return cache[key];
    const s = DATA[name], rows = rowsOf(s), pal = Object.assign({}, s.pal, palOverride);
    const c = document.createElement('canvas');
    c.width = rows[0].length * SCALE; c.height = rows.length * SCALE;
    const ctx = c.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.' || !pal[ch]) return;
      ctx.fillStyle = pal[ch];
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }));
    return (cache[key] = c.toDataURL());
  }

  /* ===== Latar padang rumput (kanvas 160×96 "piksel", digambar 4× agar tajam) ===== */
  function drawField(canvas) {
    const W = 160, H = 96, S = 4;
    canvas.width = W * S; canvas.height = H * S;
    const ctx = canvas.getContext('2d');
    ctx.scale(S, S);
    const rect = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const circle = (cx, cy, r, c) => { // lingkaran piksel: baris demi baris
      for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); rect(c, cx - w, cy + dy, w * 2 + 1, 1); }
    };
    let seed = 7; // acak deterministik: rumput selalu di tempat yang sama
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    ['#41a6f6', '#5bb8f8', '#73eff7', '#a6f4f9'].forEach((c, i) => rect(c, 0, i * 12, W, 12)); // langit bertingkat
    rect('#a6f4f9', 0, 48, W, 20);
    circle(136, 16, 8, '#ffcd75');                                                                  // matahari
    [[22, 12], [84, 20]].forEach(([x, y]) => { circle(x, y, 4, '#f4f4f4'); circle(x + 6, y + 1, 3, '#f4f4f4'); rect('#f4f4f4', x - 4, y + 2, 14, 3); }); // awan
    for (let x = 0; x < W; x++) rect('#a7f070', x, 52 + Math.round(4 * Math.sin(x / 9)), 1, 20);     // bukit jauh
    [[10, 44], [34, 38], [126, 38], [150, 44]].forEach(([x, y]) => {                                  // pohon
      rect('#5d275d', x - 2, y + 6, 4, 22);
      circle(x, y, 9, '#257179'); circle(x - 2, y - 2, 6, '#38b764');
    });
    rect('#38b764', 0, 68, W, H - 68);                                                              // tanah
    rect('#257179', 0, 68, W, 1);
    for (let i = 0; i < 45; i++) {                                                                  // rumput
      const x = Math.floor(rnd() * W), y = 72 + Math.floor(rnd() * 22);
      rect('#257179', x, y, 1, 2); rect('#257179', x + 2, y, 1, 2); rect('#257179', x + 1, y - 1, 1, 3);
    }
    [['#e43b44', 20, 86], ['#ffcd75', 52, 78], ['#f4f4f4', 112, 90], ['#e43b44', 146, 80]].forEach(([c, x, y]) => { // bunga
      rect(c, x, y, 2, 2); rect('#257179', x, y + 2, 1, 2);
    });
  }

  return {DATA, rowsOf, url, drawField};
})();
