/* Math Quest — pelukis piksel (percobaan grafik baru, 2026-11-25).
   Sprite dibuat dari bentuk sederhana (elips, kotak, titik) di grid kecil, lalu diberi garis tepi gelap otomatis.
   Hasilnya kanvas kecil (1 piksel = 1 titik) yang diperbesar tanpa dihaluskan.
   Dipakai halaman contoh-padang.html: pahlawan 28×26, monster 26–38 piksel, wajah lebih jelas. */
'use strict';
window.MQ = window.MQ || {};

MQ.Pix = (() => {
  const K = '#1a1c2c';

  /** Grid w×h berisi warna (atau null = transparan). */
  function grid(w, h) {
    const g = Array.from({length: h}, () => Array(w).fill(null));
    const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    const P = {
      w, h, g,
      px(x, y, c) { x = Math.round(x); y = Math.round(y); if (inb(x, y)) g[y][x] = c; return P; },
      rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) P.px(x + i, y + j, c); return P; },
      /** Elips berpusat (cx, cy). cond(x, y) opsional untuk memotong (mis. bagian bawah rata). */
      ell(cx, cy, rx, ry, c, cond) {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1 && (!cond || cond(x, y))) g[y][x] = c;
        }
        return P;
      },
      /** Ganti warna 'from' menjadi 'to' pada titik yang memenuhi cond. */
      recolor(from, to, cond) {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x] === from && (!cond || cond(x, y))) g[y][x] = to;
        return P;
      },
      /** Titik-titik dari baris teks: setiap huruf = warna dari pal, '.' dilewati. */
      rows(x0, y0, lines, pal) {
        lines.forEach((ln, j) => [...ln].forEach((ch, i) => { if (ch !== '.') P.px(x0 + i, y0 + j, pal[ch]); }));
        return P;
      },
      /** Garis tepi: setiap titik kosong yang bersebelahan (atas/bawah/kiri/kanan) dengan isi → warna tepi. */
      outline(c = K) {
        const add = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (g[y][x]) continue;
          if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => inb(x + a, y + b) && g[y + b][x + a] && g[y + b][x + a] !== c)) add.push([x, y]);
        }
        add.forEach(([x, y]) => (g[y][x] = c));
        return P;
      },
      /** Kanvas hasil (bisa dicerminkan ke kiri). */
      canvas(flip = false) {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const ctx = cv.getContext('2d');
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const c = g[y][flip ? w - 1 - x : x];
          if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
        }
        return cv;
      }
    };
    return P;
  }

  /* ===================== Pahlawan (28×26) =====================
     frame: 'idle' | 'walk1' | 'walk2' | 'atk' | 'hurt'. Warna bisa diganti lewat look. */
  const HERO_LOOK = {hair: '#ab5236', hairHi: '#d4a373', skin: '#ffd8b0', skinSh: '#eaa97a', dress: '#f4a3c8', dressSh: '#d16fa6',
                     dressHi: '#ffd6ea', ribbon: '#e43b44', shoe: '#5d275d', blush: '#f68aa5', mouth: '#b13e53'};
  function hero(frame = 'idle', look = {}) {
    const L = Object.assign({}, HERO_LOOK, look);
    const P = grid(30, 27), dy = frame === 'walk1' || frame === 'walk2' ? -1 : 0, cx = 12;
    const Y = v => v + dy + 1;
    // Kuncir kiri-kanan + pita
    P.ell(cx - 7.5, Y(9), 2.6, 3.2, L.hair).ell(cx + 7.5, Y(9), 2.6, 3.2, L.hair);
    P.rect(cx - 7, Y(5), 2, 2, L.ribbon).rect(cx + 5, Y(5), 2, 2, L.ribbon);
    // Rambut belakang, wajah, poni
    P.ell(cx, Y(8.6), 7, 6.6, L.hair);
    P.ell(cx, Y(10.2), 5.7, 4.6, L.skin);
    for (let x = cx - 5; x <= cx + 4; x++) P.px(x, Y(5), L.hair);
    [cx - 5, cx - 4, cx - 2, cx - 1, cx + 1, cx + 2, cx + 4].forEach(x => P.px(x, Y(6), L.hair));
    P.px(cx - 3, Y(2), L.hairHi).px(cx - 2, Y(2), L.hairHi).px(cx - 4, Y(3), L.hairHi).px(cx + 3, Y(3), L.hairHi);
    // Mata besar berkilau, pipi merona, mulut
    const eyes = frame === 'hurt'
      ? () => { P.px(cx - 4, Y(9), K).px(cx - 3, Y(10), K).px(cx - 4, Y(10), K); P.px(cx + 3, Y(9), K).px(cx + 2, Y(10), K).px(cx + 3, Y(10), K); }
      : () => { P.rect(cx - 4, Y(8), 2, 3, K).rect(cx + 2, Y(8), 2, 3, K); P.px(cx - 4, Y(8), '#f4f4f4').px(cx + 2, Y(8), '#f4f4f4'); };
    eyes();
    P.px(cx - 5, Y(11), L.blush).px(cx + 4, Y(11), L.blush);
    if (frame === 'atk') P.rect(cx - 1, Y(12), 2, 1, L.mouth).px(cx - 1, Y(13), L.mouth); // berteriak "hiyaa!"
    else P.px(cx - 1, Y(12), L.mouth).px(cx, Y(12), L.mouth);
    P.recolor(L.skin, L.skinSh, (x, y) => y === Y(14) || (x === cx + 5 && y > Y(9)));
    // Gaun (bawah lebih lebar) + kerah
    P.ell(cx, Y(19), 5.2, 4.4, L.dress, (x, y) => y >= Y(15));
    P.rect(cx - 3, Y(15), 6, 2, L.dress);
    P.px(cx - 1, Y(15), '#f4f4f4').px(cx, Y(15), '#f4f4f4');
    P.recolor(L.dress, L.dressSh, (x, y) => x >= cx + 2 && y >= Y(17));
    P.px(cx - 3, Y(17), L.dressHi).px(cx - 2, Y(16), L.dressHi);
    // Lengan
    P.ell(cx - 5.5, Y(17), 1.2, 1.9, L.skin);
    // Kaki
    const legs = {idle: [[cx - 3, 22], [cx + 1, 22]], walk1: [[cx - 4, 22], [cx + 2, 21]], walk2: [[cx - 3, 21], [cx + 1, 22]],
                  atk: [[cx - 4, 22], [cx + 2, 22]], hurt: [[cx - 3, 22], [cx + 1, 22]]}[frame];
    legs.forEach(([x, y]) => { P.rect(x, Y(y), 2, 1, L.skin); P.rect(x, Y(y + 1), 2, 1, L.shoe); });
    // Pedang
    const W = '#f4f4f4', G = '#94b0c2', GOLD = '#ffcd75', HN = '#5d275d';
    if (frame === 'atk') {
      P.ell(cx + 6.5, Y(16), 1.6, 1.2, L.skin);               // lengan terjulur
      P.rect(cx + 8, Y(14), 1, 4, GOLD);                       // pelindung
      P.rect(cx + 9, Y(15), 7, 1, W).rect(cx + 9, Y(16), 7, 1, G).px(cx + 16, Y(15), W);
      P.px(cx + 7, Y(16), HN);
    } else {
      P.ell(cx + 5.6, Y(17), 1.2, 1.9, L.skin);
      P.rect(cx + 7, Y(8), 1, 8, W).rect(cx + 8, Y(8), 1, 8, G).px(cx + 7, Y(7), W);
      P.rect(cx + 5, Y(16), 5, 1, GOLD).rect(cx + 7, Y(17), 2, 2, HN);
    }
    return P.outline();
  }

  /* ===================== Monster ===================== */
  /** Lendir dasar: kubah dengan dasar rata, kilau, mata besar, senyum. c = {b, d, l, w}. */
  function slimeBody(P, cx, cy, rx, ry, c, bottom) {
    P.ell(cx, cy, rx, ry, c.b, (x, y) => y <= bottom);
    // Bayangan di pinggir kanan-bawah, kilau di kiri-atas
    P.recolor(c.b, c.d, (x, y) => { const dx = (x + 0.5 - (cx - rx * 0.18)) / rx, dy = (y + 0.5 - (cy - ry * 0.3)) / ry; return dx * dx + dy * dy > 1.02; });
    P.recolor(c.b, c.d, (x, y) => y === bottom);
    P.ell(cx - rx * 0.45, cy - ry * 0.45, rx * 0.22, ry * 0.16, c.l);
    P.px(cx - rx * 0.62, cy - ry * 0.05, c.l);
  }
  function face(P, cx, ey, gap, opt = {}) {
    const eh = opt.eh || 3;
    P.rect(cx - gap - 2, ey, 2, eh, K).rect(cx + gap, ey, 2, eh, K);
    P.px(cx - gap - 2, ey, '#f4f4f4').px(cx + gap, ey, '#f4f4f4');
    if (opt.brow) { P.px(cx - gap - 3, ey - 2, K).px(cx - gap - 2, ey - 2, K).px(cx - gap - 1, ey - 1, K); P.px(cx + gap + 2, ey - 2, K).px(cx + gap + 1, ey - 2, K).px(cx + gap, ey - 1, K); }
    const my = ey + eh + 1;
    if (opt.grin) { P.rect(cx - 2, my, 4, 2, K); P.px(cx - 1, my, '#f4f4f4').px(cx + 1, my, '#f4f4f4'); }
    else { P.px(cx - 2, my, K).px(cx - 1, my + 1, K).px(cx, my + 1, K).px(cx + 1, my, K); }
    if (opt.blush) P.px(cx - gap - 4, my, opt.blush).px(cx + gap + 3, my, opt.blush);
  }

  /** Lendir Hijau (26×22) dengan tunas daun di kepala. */
  function lendir() {
    const P = grid(26, 22), c = {b: '#38b764', d: '#257179', l: '#a7f070'};
    slimeBody(P, 13, 14, 10, 7.6, c, 20);
    P.px(13, 5, '#257179').px(13, 6, '#257179');
    P.ell(11.2, 4.6, 1.8, 1, '#a7f070').ell(15, 4.2, 1.8, 1, '#a7f070');
    face(P, 13, 12, 2, {blush: '#f4a3c8'});
    return P.outline();
  }
  /** Lendir Air (26×24): bentuk tetes air, kilau ombak. */
  function lendirAir() {
    const P = grid(26, 24), c = {b: '#41a6f6', d: '#3b5dc9', l: '#c7f0ff'};
    slimeBody(P, 13, 15.5, 9.6, 7.6, c, 22);
    for (let y = 4; y <= 9; y++) { const hw = Math.round((y - 4) * 0.9); P.rect(13 - hw, y, hw * 2 + 1, 1, c.b); }
    P.px(13, 3, c.b).px(14, 2, c.b);
    P.recolor(c.b, c.d, (x, y) => y < 10 && x > 14);
    P.px(12, 6, c.l).px(11, 8, c.l);
    face(P, 13, 13, 2, {blush: '#f4a3c8'});
    P.px(7, 20, c.l).px(8, 19, c.l).px(9, 20, c.l);
    return P.outline();
  }
  /** Mini bos: Lendir Bunga (30×27), lebih besar, bunga di kepala, alis marah. */
  function lendirBunga() {
    const P = grid(30, 27), c = {b: '#b06fd0', d: '#5d275d', l: '#f4a3c8'};
    slimeBody(P, 15, 17.5, 12, 8.6, c, 25);
    P.px(15, 9, '#38b764').px(15, 8, '#38b764');
    [[0, -2.6], [2.5, -0.8], [1.6, 2.1], [-1.6, 2.1], [-2.5, -0.8]].forEach(([dx, dy]) => P.ell(15 + dx, 5.5 + dy, 1.35, 1.35, '#f4a3c8'));
    P.ell(15, 5.5, 1.2, 1.2, '#ffcd75');
    face(P, 15, 15, 3, {brow: true, grin: true});
    return P.outline();
  }
  /** Bos: Raja Lendir (38×34), mahkota emas bermata merah, alis tebal, kumis. */
  function rajaLendir() {
    const P = grid(38, 34), c = {b: '#ffcd75', d: '#ef7d57', l: '#fff3b0'};
    slimeBody(P, 19, 22, 16, 11, c, 32);
    // Mahkota
    P.rect(11, 8, 16, 4, '#ffcd75');
    [[11, 4], [16, 3], [21, 3], [26, 4]].forEach(([x, y]) => P.rect(x, y, 1, 8 - y, '#ffcd75').px(x, y - 1, '#ffcd75'));
    P.rect(12, 6, 2, 2, '#ffcd75').rect(24, 6, 2, 2, '#ffcd75').rect(17, 5, 4, 3, '#ffcd75');
    P.recolor('#ffcd75', '#ef7d57', (x, y) => y === 11 && x >= 11 && x <= 26);
    P.rect(18, 9, 2, 2, '#e43b44').px(13, 10, '#41a6f6').px(24, 10, '#41a6f6');
    face(P, 19, 18, 4, {brow: true, eh: 4});
    // Kumis
    P.rect(14, 24, 4, 1, '#ab5236').rect(20, 24, 4, 1, '#ab5236').px(13, 23, '#ab5236').px(24, 23, '#ab5236');
    P.rect(17, 26, 4, 1, K);
    return P.outline();
  }

  const MONSTERS = {lendir, lendirAir, lendirBunga, rajaLendir};
  const cache = {};
  /** Kanvas sprite (disimpan supaya tidak digambar ulang). */
  function sprite(name, frame, flip) {
    const key = name + '|' + frame + '|' + !!flip;
    if (!cache[key]) cache[key] = (name === 'hero' ? hero(frame) : MONSTERS[name]()).canvas(flip);
    return cache[key];
  }

  return {grid, hero, sprite, MONSTERS, K};
})();
