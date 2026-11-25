/* Math Quest — gambar pahlawan (32×32) yang bisa diatur pemain: rambut, warna, kulit, pakaian, kostum, perlengkapan.
   Digambar dari bentuk sederhana lewat MQ.Pix (pixelart.js), dengan animasi jalan, serang, dan terkena (scene.js).
   Grafik lama 16×16 (baris huruf) diganti 2026-11-25 (tahap 2 grafik baru). */
'use strict';
window.MQ = window.MQ || {};

MQ.Hero = (() => {
  const K = '#1a1c2c';

  /** Pilihan yang muncul di layar Buat Karakter. */
  const OPTIONS = {
    hair: [['kuncir', 'Kuncir'], ['panjang', 'Panjang'], ['pendek', 'Pendek']],
    hairColor: ['#2b2b3a', '#8a4b2a', '#ffcd75', '#b13e53', '#5d275d'],
    skin: ['#ffd8b0', '#e0a370', '#a8663f'],
    outfit: [['gaun', 'Gaun'], ['baju', 'Baju & celana']],
    outfitColor: ['#f4a3c8', '#e43b44', '#b06fd0', '#3b5dc9', '#38b764', '#ef7d57']
  };
  const DEFAULT = {name: '', hair: 'kuncir', hairColor: '#8a4b2a', skin: '#ffd8b0', outfit: 'gaun', outfitColor: '#f4a3c8'};

  /** Pastikan data penampilan valid (dari simpanan); kembalikan null bila tidak ada. */
  function sanitize(h) {
    if (!h || typeof h !== 'object') return null;
    const pickOpt = (v, list, def) => (list.some(o => (Array.isArray(o) ? o[0] : o) === v) ? v : def);
    return {
      name: typeof h.name === 'string' ? h.name.slice(0, 12) : '',
      hair: pickOpt(h.hair, OPTIONS.hair, DEFAULT.hair),
      hairColor: pickOpt(h.hairColor, OPTIONS.hairColor, DEFAULT.hairColor),
      skin: pickOpt(h.skin === '#ffcd75' ? '#ffd8b0' : h.skin, OPTIONS.skin, DEFAULT.skin), // warna kulit lama → baru
      outfit: pickOpt(h.outfit, OPTIONS.outfit, DEFAULT.outfit),
      outfitColor: pickOpt(h.outfitColor, OPTIONS.outfitColor, DEFAULT.outfitColor),
      costume: COSTUMES[h.costume] ? h.costume : '' // kepemilikan dicek di layar Buat Karakter
    };
  }

  /** Kostum kepala (hadiah medali); gambarnya di draw(). */
  const COSTUMES = {
    telingaKucing: {name: 'Telinga Kucing'}, pitaBesar: {name: 'Pita Besar'}, mahkotaBunga: {name: 'Mahkota Bunga'},
    mahkotaEmas: {name: 'Mahkota Emas'}, topiBajakLaut: {name: 'Topi Bajak Laut'}, topiPenyihir: {name: 'Topi Penyihir'},
    kacamata: {name: 'Kacamata Pintar'}
  };

  /* ===== Gambar pahlawan (32×32, digambar dari bentuk lewat MQ.Pix; tahap 2 grafik baru) =====
     frame: 'idle' | 'walk1' | 'walk2' | 'atk' | 'hurt' | 'happy'. Lapisan: rambut belakang → badan & pakaian → wajah & rambut depan
     → aksesori → kostum kepala → perisai (tangan kiri) → senjata (tangan kanan). Warna senjata/perisai dari palet item. */
  const WEAPON_PAL = {w: '#f4f4f4', y: '#ffcd75', b: '#ab5236', g: '#94b0c2', G: '#f4f4f4', d: '#566c86'};
  const SHIELD_PAL = {b: '#ab5236', y: '#ffcd75'};
  /** Warna kulit lama (sebelum 2026-11-25) → warna baru yang lebih alami. */
  const SKIN_OLD = {'#ffcd75': '#ffd8b0'};

  /** Campur warna hex dengan putih (amt > 0) atau hitam (amt < 0). */
  function tint(hex, amt) {
    const n = parseInt(hex.slice(1), 16), t = amt > 0 ? 255 : 0, a = Math.abs(amt);
    const ch = sh => Math.round(((n >> sh) & 255) * (1 - a) + t * a);
    return '#' + [16, 8, 0].map(sh => ch(sh).toString(16).padStart(2, '0')).join('');
  }

  function draw(look, equip = {}, frame = 'idle') {
    look = look || DEFAULT;
    const P = MQ.Pix.grid(32, 32), items = MQ.Data.items;
    const walk = frame === 'walk1' || frame === 'walk2', dy = walk ? -1 : 0, cx = 13;
    const Y = v => v + dy + 6;
    const hair = look.hairColor, hairHi = tint(hair, 0.35);
    const skin = SKIN_OLD[look.skin] || look.skin, skinSh = tint(skin, -0.15);
    const out = look.outfitColor, outSh = tint(out, -0.28), outHi = tint(out, 0.45);
    const W = '#f4f4f4', RIB = '#e43b44';

    // Rambut belakang
    if (look.hair === 'panjang') P.ell(cx, Y(13), 7.3, 8, hair, (x, y) => y >= Y(8));
    P.ell(cx, Y(8.6), 7, 6.6, hair);
    if (look.hair === 'kuncir') {
      P.ell(cx - 7.5, Y(9), 2.6, 3.2, hair).ell(cx + 7.5, Y(9), 2.6, 3.2, hair);
      P.rect(cx - 7, Y(5), 2, 2, RIB).rect(cx + 5, Y(5), 2, 2, RIB);
    }
    // Badan: lengan belakang, pakaian, kaki
    P.ell(cx - 5.5, Y(17), 1.2, 1.9, skin);
    const legs = {idle: [[cx - 3, 22], [cx + 1, 22]], walk1: [[cx - 4, 22], [cx + 2, 21]], walk2: [[cx - 3, 21], [cx + 1, 22]],
                  atk: [[cx - 4, 22], [cx + 2, 22]], hurt: [[cx - 3, 22], [cx + 1, 22]]}[frame] || [[cx - 3, 22], [cx + 1, 22]];
    if (look.outfit === 'baju') {
      const PANTS = '#29366f';
      P.ell(cx, Y(17), 4.6, 3, out, (x, y) => y >= Y(15) && y <= Y(19));
      P.rect(cx - 4, Y(15), 8, 4, out);
      P.recolor(out, outSh, (x, y) => x >= cx + 2 && y >= Y(16));
      P.px(cx - 3, Y(16), outHi).px(cx - 2, Y(16), outHi);
      P.rect(cx - 4, Y(19), 8, 1, '#ffcd75');
      P.rect(cx - 4, Y(20), 8, 1, PANTS);
      legs.forEach(([x, y]) => { P.rect(x, Y(20), 2, y - 20 + 1, PANTS); P.rect(x, Y(y + 1), 2, 1, '#5d275d'); });
    } else {
      P.ell(cx, Y(19), 5.2, 4.4, out, (x, y) => y >= Y(15));
      P.rect(cx - 3, Y(15), 6, 2, out);
      P.recolor(out, outSh, (x, y) => x >= cx + 2 && y >= Y(17));
      P.px(cx - 3, Y(17), outHi).px(cx - 2, Y(16), outHi);
      legs.forEach(([x, y]) => { P.rect(x, Y(y), 2, 1, skin); P.rect(x, Y(y + 1), 2, 1, '#5d275d'); });
    }
    P.px(cx - 1, Y(15), W).px(cx, Y(15), W); // kerah
    // Wajah
    P.ell(cx, Y(10.2), 5.7, 4.6, skin);
    for (let x = cx - 5; x <= cx + 4; x++) P.px(x, Y(5), hair);
    [cx - 5, cx - 4, cx - 2, cx - 1, cx + 1, cx + 2, cx + 4].forEach(x => P.px(x, Y(6), hair));
    if (look.hair === 'pendek') P.px(cx + 1, Y(1), hair).px(cx + 2, Y(1), hair).px(cx + 2, Y(0), hair);
    P.px(cx - 3, Y(2), hairHi).px(cx - 2, Y(2), hairHi).px(cx - 4, Y(3), hairHi).px(cx + 3, Y(3), hairHi);
    if (frame === 'happy') { // mata tersenyum ^ ^
      [cx - 4, cx + 2].forEach(x => P.px(x - 1, Y(10), K).px(x, Y(9), K).px(x + 1, Y(9), K).px(x + 2, Y(10), K));
    } else if (frame === 'hurt') { P.px(cx - 4, Y(9), K).px(cx - 3, Y(10), K).px(cx - 4, Y(10), K); P.px(cx + 3, Y(9), K).px(cx + 2, Y(10), K).px(cx + 3, Y(10), K); }
    else { P.rect(cx - 4, Y(8), 2, 3, K).rect(cx + 2, Y(8), 2, 3, K); P.px(cx - 4, Y(8), W).px(cx + 2, Y(8), W); }
    P.px(cx - 5, Y(11), '#f68aa5').px(cx + 4, Y(11), '#f68aa5');
    if (frame === 'happy') P.rect(cx - 2, Y(12), 4, 1, '#b13e53').rect(cx - 1, Y(13), 2, 1, '#f68aa5'); // tertawa
    else if (frame === 'atk') P.rect(cx - 1, Y(12), 2, 1, '#b13e53').px(cx - 1, Y(13), '#b13e53');
    else P.px(cx - 1, Y(12), '#b13e53').px(cx, Y(12), '#b13e53');
    P.recolor(skin, skinSh, (x, y) => y === Y(14) || (x === cx + 5 && y > Y(9) && y < Y(15)));

    // Aksesori
    const acc = equip.aksesori;
    if (acc === 'kalungKoin') { [-2, -1, 0, 1].forEach(i => P.px(cx + i, Y(15), '#ffcd75')); P.rect(cx - 1, Y(16), 2, 2, '#ffcd75'); }
    if (acc === 'jimatKilat') { P.px(cx - 2, Y(15), '#73eff7').px(cx + 1, Y(15), '#73eff7'); P.rect(cx - 1, Y(16), 2, 2, '#73eff7').px(cx - 1, Y(16), W); }
    if (acc === 'jimatTinta') { P.px(cx - 2, Y(15), '#3b5dc9').px(cx + 1, Y(15), '#3b5dc9'); P.rect(cx - 1, Y(16), 2, 2, '#3b5dc9').px(cx, Y(16), '#73eff7'); }
    if (acc === 'cincinBintang') P.px(cx + 9, Y(1), '#73eff7').rect(cx + 8, Y(2), 3, 1, '#73eff7').px(cx + 9, Y(3), '#73eff7').px(cx + 9, Y(2), W);
    if (acc === 'mahkotaBijak') { P.rect(cx - 4, Y(4), 8, 1, '#73eff7'); P.rect(cx - 1, Y(2), 2, 2, '#b06fd0').px(cx - 1, Y(2), '#f4a3c8'); }

    // Kostum kepala (hadiah medali)
    switch (look.costume) {
      case 'telingaKucing':
        [[-6, 1], [4, 1]].forEach(([dx]) => { const x = cx + dx; P.px(x, Y(-1), '#f4a3c8').rect(x, Y(0), 2, 1, '#f4a3c8').rect(x - (dx < 0 ? 0 : 1), Y(1), 3, 2, '#f4a3c8'); P.px(x + (dx < 0 ? 1 : 0), Y(1), '#ffd6ea'); });
        break;
      case 'pitaBesar':
        P.ell(cx + 2.5, Y(1.5), 2.2, 1.7, RIB).ell(cx + 7.5, Y(1.5), 2.2, 1.7, RIB).rect(cx + 4, Y(1), 2, 2, '#b13e53');
        P.px(cx + 2, Y(1), '#ff9aa5').px(cx + 7, Y(1), '#ff9aa5');
        break;
      case 'mahkotaBunga':
        [cx - 6, cx - 3, cx, cx + 3].forEach((x, i) => { P.ell(x + 0.5, Y(3), 1.3, 1.3, ['#f4a3c8', '#f4f4f4', '#f4a3c8', '#f4f4f4'][i]); P.px(x, Y(3), '#ffcd75'); });
        P.px(cx - 4, Y(4), '#38b764').px(cx - 1, Y(4), '#38b764').px(cx + 2, Y(4), '#38b764');
        break;
      case 'mahkotaEmas': {
        const G = '#ffcd75', GS = '#ef7d57';
        P.rect(cx - 4, Y(1), 8, 3, G).rect(cx - 4, Y(-1), 1, 2, G).rect(cx - 1, Y(-2), 2, 3, G).rect(cx + 3, Y(-1), 1, 2, G);
        P.rect(cx - 4, Y(3), 8, 1, GS); P.rect(cx - 1, Y(1), 2, 1, '#e43b44'); P.px(cx - 3, Y(2), '#41a6f6').px(cx + 2, Y(2), '#41a6f6');
        break;
      }
      case 'topiBajakLaut':
        P.rect(cx - 5, Y(-1), 10, 3, '#333c57'); P.ell(cx, Y(2.5), 8.5, 1.8, '#333c57');
        P.px(cx - 1, Y(0), W).px(cx, Y(0), W).px(cx - 1, Y(1), '#94b0c2').px(cx, Y(1), '#94b0c2');
        P.rect(cx - 5, Y(-1), 10, 1, '#566c86');
        break;
      case 'topiPenyihir':
        P.ell(cx, Y(3.5), 8.5, 1.5, '#b06fd0');
        for (let i = 0; i < 7; i++) P.rect(cx - 4 + Math.round(i * 0.4), Y(2 - i), Math.max(1, 8 - i * 1.2), 1, '#b06fd0');
        P.px(cx + 3, Y(-5), '#b06fd0').px(cx + 4, Y(-5), '#b06fd0');
        P.rect(cx - 4, Y(1), 8, 1, '#ffcd75'); P.recolor('#b06fd0', '#5d275d', (x, y) => x >= cx + 1 && y < Y(1) && y > Y(-4));
        break;
      case 'kacamata':
        // bingkai bulat-kotak dengan lensa biru muda, mata tetap terlihat
        [cx - 6, cx + 1].forEach(x => {
          P.rect(x, Y(7), 5, 1, K).rect(x, Y(11), 5, 1, K).rect(x, Y(8), 1, 3, K).rect(x + 4, Y(8), 1, 3, K);
          P.rect(x + 1, Y(8), 3, 3, '#c7f0ff');
        });
        P.rect(cx - 4, Y(8), 2, 3, K).rect(cx + 2, Y(8), 2, 3, K).px(cx - 4, Y(8), W).px(cx + 2, Y(8), W);
        P.px(cx - 1, Y(9), K).px(cx, Y(9), K);
        break;
    }

    // Perisai (tangan kiri)
    const sh = items[equip.pelindung];
    if (sh) {
      const sp = Object.assign({}, SHIELD_PAL, sh.pal);
      P.ell(cx - 6, Y(17.5), 3, 3.8, sp.b, (x, y) => y <= Y(20));
      P.rect(cx - 7, Y(20), 2, 1, sp.b).px(cx - 6, Y(21), sp.b);
      P.rect(cx - 7, Y(15), 3, 1, sp.y).rect(cx - 6, Y(16), 1, 4, sp.y).rect(cx - 7, Y(17), 3, 1, sp.y);
    }

    // Senjata (tangan kanan); tanpa senjata = kepalan tangan
    const w = items[equip.senjata], wp = Object.assign({}, WEAPON_PAL, w && w.pal), kind = w ? w.icon : null;
    const HN = '#5d275d';
    if (frame === 'atk') {
      P.ell(cx + 6.5, Y(16), 1.6, 1.2, skin);
      if (kind === 'sword') { P.rect(cx + 8, Y(14), 1, 4, wp.y); P.rect(cx + 9, Y(15), 7, 1, wp.w).rect(cx + 9, Y(16), 7, 1, tint(wp.w, -0.3)).px(cx + 16, Y(15), wp.w); P.px(cx + 7, Y(16), HN); }
      else if (kind === 'axe') { P.rect(cx + 8, Y(16), 7, 1, wp.b); P.rect(cx + 13, Y(13), 3, 3, wp.w).rect(cx + 13, Y(16), 3, 2, wp.w).px(cx + 16, Y(14), wp.w); }
      else if (kind === 'staff') { P.rect(cx + 8, Y(16), 6, 1, wp.b); P.ell(cx + 15.5, Y(16), 2, 2, wp.g).px(cx + 15, Y(15), wp.G); }
      else if (kind === 'hammer') { P.rect(cx + 8, Y(16), 6, 1, wp.b); P.rect(cx + 13, Y(13), 3, 6, wp.g).rect(cx + 15, Y(13), 1, 6, wp.d); }
    } else {
      P.ell(cx + 5.6, Y(17), 1.2, 1.9, skin);
      if (kind === 'sword') { P.rect(cx + 7, Y(8), 1, 8, wp.w).rect(cx + 8, Y(8), 1, 8, tint(wp.w, -0.3)).px(cx + 7, Y(7), wp.w); P.rect(cx + 5, Y(16), 5, 1, wp.y).rect(cx + 7, Y(17), 2, 2, HN); }
      else if (kind === 'axe') { P.rect(cx + 7, Y(8), 1, 11, wp.b); P.rect(cx + 8, Y(7), 3, 5, wp.w).px(cx + 11, Y(8), wp.w).px(cx + 11, Y(10), wp.w); P.rect(cx + 8, Y(11), 3, 1, tint(wp.w, -0.3)); }
      else if (kind === 'staff') { P.rect(cx + 7, Y(7), 1, 13, wp.b); P.ell(cx + 7.5, Y(5.5), 2.2, 2.2, wp.g).px(cx + 6, Y(4), wp.G).px(cx + 7, Y(4), wp.G); }
      else if (kind === 'hammer') { P.rect(cx + 7, Y(9), 1, 11, wp.b); P.rect(cx + 4, Y(6), 7, 4, wp.g).rect(cx + 4, Y(9), 7, 1, wp.d).rect(cx + 10, Y(6), 1, 4, wp.d); }
    }
    return P.outline();
  }

  const cache = {}, SCALE = 6;
  const keyOf = (look, equip, frame) => JSON.stringify([look.hair, look.hairColor, look.skin, look.outfit, look.outfitColor, look.costume,
    equip.senjata, equip.pelindung, equip.aksesori, frame]);
  /** Kanvas kecil 32×32 (1 titik = 1 piksel) untuk pemandangan pertarungan. */
  function canvas(look, equip = {}, frame = 'idle') {
    look = look || DEFAULT;
    const k = 'c' + keyOf(look, equip, frame);
    return cache[k] || (cache[k] = draw(look, equip, frame).canvas());
  }
  /** Gambar pahlawan sebagai data-URL PNG (diperbesar), untuk <img> di menu. */
  function url(look, equip = {}, frame = 'idle') {
    look = look || DEFAULT;
    const k = 'u' + keyOf(look, equip, frame);
    if (cache[k]) return cache[k];
    const small = canvas(look, equip, frame), c = document.createElement('canvas');
    c.width = c.height = 32 * SCALE;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, c.width, c.height);
    return (cache[k] = c.toDataURL());
  }

  /** Pahlawan pemain saat ini (penampilan + equipment yang dipakai). */
  const current = () => url(MQ.State.S.hero, MQ.State.S.equip);
  const currentCanvas = frame => canvas(MQ.State.S.hero, MQ.State.S.equip, frame);

  return {OPTIONS, DEFAULT, COSTUMES, sanitize, url, canvas, current, currentCanvas};
})();
