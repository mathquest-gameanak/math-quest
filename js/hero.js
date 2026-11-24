/* Math Quest — gambar pahlawan berlapis (16×16) yang bisa diatur pemain.

   Lapisan (digambar berurutan): badan → baju/gaun → rambut → aksesori → perisai → senjata.
   Setiap lapisan berupa baris karakter seperti sprites.js; '.' = biarkan lapisan di bawahnya.
   Lapisan simetris ditulis separuh kiri saja (8 karakter) lalu dicerminkan.
   Huruf warna:
     k garis tepi · s kulit · e mata · m mulut · o baju · O bayangan baju · y emas/sabuk · p celana · b sepatu
     h rambut · H kilau rambut · r pita
     (senjata/perisai memakai huruf palet ikon item-nya: w, y, b, g, G, d) */
'use strict';
window.MQ = window.MQ || {};

MQ.Hero = (() => {
  const K = '#1a1c2c', SCALE = 12;

  /** Pilihan yang muncul di layar Buat Karakter. */
  const OPTIONS = {
    hair: [['kuncir', 'Kuncir'], ['panjang', 'Panjang'], ['pendek', 'Pendek']],
    hairColor: ['#2b2b3a', '#8a4b2a', '#ffcd75', '#b13e53', '#5d275d'],
    skin: ['#ffcd75', '#e0a370', '#a8663f'],
    outfit: [['gaun', 'Gaun'], ['baju', 'Baju & celana']],
    outfitColor: ['#f4a3c8', '#e43b44', '#b06fd0', '#3b5dc9', '#38b764', '#ef7d57']
  };
  const DEFAULT = {name: '', hair: 'kuncir', hairColor: '#8a4b2a', skin: '#ffcd75', outfit: 'gaun', outfitColor: '#f4a3c8'};

  /** Pastikan data penampilan valid (dari simpanan); kembalikan null bila tidak ada. */
  function sanitize(h) {
    if (!h || typeof h !== 'object') return null;
    const pickOpt = (v, list, def) => (list.some(o => (Array.isArray(o) ? o[0] : o) === v) ? v : def);
    return {
      name: typeof h.name === 'string' ? h.name.slice(0, 12) : '',
      hair: pickOpt(h.hair, OPTIONS.hair, DEFAULT.hair),
      hairColor: pickOpt(h.hairColor, OPTIONS.hairColor, DEFAULT.hairColor),
      skin: pickOpt(h.skin, OPTIONS.skin, DEFAULT.skin),
      outfit: pickOpt(h.outfit, OPTIONS.outfit, DEFAULT.outfit),
      outfitColor: pickOpt(h.outfitColor, OPTIONS.outfitColor, DEFAULT.outfitColor)
    };
  }

  /* ===== Lapisan ===== */
  // Badan dengan baju & celana (separuh kiri, dicerminkan)
  const BODY = ['........', '........', '....kkkk', '...kssss', '...kssss', '...ksess', '...ksssm', '....kkkk',
                '...kkooo', '..koooOo', '..ksoooo', '...kyyyy', '...kpppp', '...kppk.', '...kbbk.', '...kkkk.'];
  // Gaun: menggantikan baris 11–15
  const DRESS = {11: '...kOooo', 12: '..kOoooo', 13: '..kkkkkk', 14: '....kbk.', 15: '....kkk.'};
  // Rambut (baris → separuh kiri)
  const HAIR = {
    // kilau rambut (H) di baris paling atas agar tidak terlihat seperti mata
    pendek:  {1: '....kkkk', 2: '...khHhh', 3: '...khhhh', 4: '...kh...'},
    kuncir:  {1: '....kkkk', 2: '...khHhh', 3: '...khhhh', 4: '..rkh...', 5: '.khk....', 6: '.khk....', 7: '.khk....', 8: '..k.....'},
    panjang: {1: '....kkkk', 2: '...khHhh', 3: '..khhhhh', 4: '..khh...', 5: '..kh....', 6: '..kh....', 7: '..khk...', 8: '..khk...', 9: '..kk....'}
  };
  // Senjata di tangan kanan (baris penuh 16 karakter), dipilih dari ikon item senjata
  const WEAPON = {
    sword:  {3: '..............k.', 4: '.............kwk', 5: '.............kwk', 6: '.............kwk', 7: '.............kwk',
             8: '............kyyk', 9: '.............kyk', 10: '.............ky.'},
    axe:    {3: '............kkk.', 4: '...........kwwwk', 5: '...........kwwbk', 6: '............kkbk', 7: '.............kbk',
             8: '.............kbk', 9: '.............kbk', 10: '.............kb.'},
    staff:  {2: '.............kk.', 3: '............kgGk', 4: '............kggk', 5: '.............kbk', 6: '.............kbk',
             7: '.............kbk', 8: '.............kbk', 9: '.............kbk', 10: '.............kb.'},
    hammer: {3: '............kkkk', 4: '............kgGk', 5: '............kgdk', 6: '............kkbk', 7: '.............kbk',
             8: '.............kbk', 9: '.............kbk', 10: '.............kb.'}
  };
  const WEAPON_PAL = {w: '#f4f4f4', y: '#ffcd75', b: '#ab5236', g: '#94b0c2', G: '#f4f4f4', d: '#566c86'};
  // Perisai di tangan kiri
  const SHIELD = {8: 'kkkkk...........', 9: 'kbybk...........', 10: 'kyyyk...........', 11: 'kbybk...........', 12: '.kbk............', 13: '..k.............'};
  // Aksesori per item
  const ACC = {
    kalungKoin:    {rows: {8: '......yyyy......'}, pal: {y: '#ffcd75'}},
    jimatKilat:    {rows: {8: '......yyyy......', 9: '.......yy.......'}, pal: {y: '#73eff7'}},
    cincinBintang: {rows: {0: '.............y..', 1: '............yyy.', 2: '.............y..'}, pal: {y: '#73eff7'}}
  };

  const mirror = r => r + [...r].reverse().join('');
  /** Campur warna hex dengan putih (amt > 0) atau hitam (amt < 0). */
  function tint(hex, amt) {
    const n = parseInt(hex.slice(1), 16), t = amt > 0 ? 255 : 0, a = Math.abs(amt);
    const ch = sh => Math.round(((n >> sh) & 255) * (1 - a) + t * a);
    return '#' + [16, 8, 0].map(sh => ch(sh).toString(16).padStart(2, '0')).join('');
  }

  /** Susun semua lapisan menjadi grid warna 16×16. equip = {senjata, pelindung, aksesori} (id item). */
  function compose(look, equip = {}) {
    const grid = Array.from({length: 16}, () => Array(16).fill(null));
    const paint = (rows, pal, isHalf) => {
      for (const [y, row] of Object.entries(rows)) {
        const full = isHalf ? mirror(row) : row;
        [...full].forEach((ch, x) => { if (ch !== '.' && pal[ch]) grid[y][x] = pal[ch]; });
      }
    };
    const bodyPal = {k: K, s: look.skin, e: K, m: '#b13e53', o: look.outfitColor, O: tint(look.outfitColor, -0.3),
                     y: '#ffcd75', p: '#29366f', b: '#5d275d'};
    const body = Object.assign({}, BODY, look.outfit === 'gaun' ? DRESS : {});
    paint(body, bodyPal, true);
    paint(HAIR[look.hair] || {}, {k: K, h: look.hairColor, H: tint(look.hairColor, 0.35), r: '#e43b44'}, true);
    const items = MQ.Data.items;
    const acc = ACC[equip.aksesori];
    if (acc) paint(acc.rows, Object.assign({k: K}, acc.pal), false);
    const sh = items[equip.pelindung];
    if (sh) paint(SHIELD, Object.assign({k: K, b: '#ab5236', y: '#ffcd75'}, sh.pal), false);
    const w = items[equip.senjata];
    if (w && WEAPON[w.icon]) paint(WEAPON[w.icon], Object.assign({k: K}, WEAPON_PAL, w.pal), false);
    return grid;
  }

  const cache = {};
  /** Gambar pahlawan sebagai data-URL PNG. */
  function url(look, equip = {}) {
    look = look || DEFAULT;
    const key = JSON.stringify([look.hair, look.hairColor, look.skin, look.outfit, look.outfitColor, equip.senjata, equip.pelindung, equip.aksesori]);
    if (cache[key]) return cache[key];
    const grid = compose(look, equip);
    const c = document.createElement('canvas');
    c.width = c.height = 16 * SCALE;
    const ctx = c.getContext('2d');
    grid.forEach((row, y) => row.forEach((col, x) => { if (col) { ctx.fillStyle = col; ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE); } }));
    return (cache[key] = c.toDataURL());
  }

  /** Pahlawan pemain saat ini (penampilan + equipment yang dipakai). */
  const current = () => url(MQ.State.S.hero, MQ.State.S.equip);

  return {OPTIONS, DEFAULT, sanitize, url, current, BODY, HAIR, WEAPON, SHIELD, DRESS, ACC};
})();
