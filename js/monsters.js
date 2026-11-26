/* Math Quest — gambar monster baru (tahap 3 grafik baru, 2026-11-25).
   Setiap jenis tubuh punya satu fungsi gambar dengan pilihan (warna, mahkota, tekstur batu, sayap daun, dll.),
   lalu setiap monster di data.js mendapat resepnya di ART. Monster biasa ±26 piksel, bos (raja) ±38 piksel.
   Menambah ke MQ.Pix.MONSTERS sehingga MQ.Pix.sprite(id) dan MQ.Pix.url(id) bisa dipakai di mana saja. */
'use strict';
window.MQ = window.MQ || {};

(() => {
  const {grid} = MQ.Pix, K = MQ.Pix.K, W = '#f4f4f4';

  /* ===== Bagian bersama ===== */
  function eyes(P, cx, ey, gap, o = {}) {
    const eh = o.eh || 3, ec = o.eyeColor || K;
    P.rect(cx - gap - 2, ey, 2, eh, ec).rect(cx + gap, ey, 2, eh, ec);
    if (!o.eyeColor) P.px(cx - gap - 2, ey, W).px(cx + gap, ey, W);
    if (o.angry) { P.px(cx - gap - 3, ey - 2, K).px(cx - gap - 2, ey - 2, K).px(cx - gap - 1, ey - 1, K); P.px(cx + gap + 2, ey - 2, K).px(cx + gap + 1, ey - 2, K).px(cx + gap, ey - 1, K); }
  }
  function mouth(P, cx, my, kind) {
    if (kind === 'grin') { P.rect(cx - 2, my, 4, 2, K); P.px(cx - 1, my, W).px(cx + 1, my, W); }
    else if (kind === 'o') P.rect(cx - 1, my, 2, 2, K);
    else if (kind === 'fang') { P.rect(cx - 2, my, 4, 1, K); P.px(cx - 2, my + 1, W).px(cx + 1, my + 1, W); }
    else P.px(cx - 2, my, K).px(cx - 1, my + 1, K).px(cx, my + 1, K).px(cx + 1, my, K);
  }
  /** Mahkota emas (lebar w) dengan dasar di y. */
  function crown(P, cx, y, w = 14, gem = '#e43b44') {
    const G = '#ffcd75', x0 = Math.round(cx - w / 2);
    P.rect(x0, y - 3, w, 3, G);
    [0, Math.round(w / 2) - 1, w - 1].forEach((dx, i) => P.rect(x0 + dx, y - 6 + (i === 1 ? -1 : 0), i === 1 ? 2 : 1, 3 + (i === 1 ? 1 : 0), G));
    P.rect(x0 + 2, y - 5, 2, 2, G).rect(x0 + w - 4, y - 5, 2, 2, G);
    P.rect(x0, y - 1, w, 1, '#ef7d57');
    P.rect(Math.round(cx) - 1, y - 3, 2, 2, gem);
  }
  function shade(P, base, dark, light, cx, cy, rx, ry) {
    P.recolor(base, dark, (x, y) => { const dx = (x + 0.5 - (cx - rx * 0.18)) / rx, dy = (y + 0.5 - (cy - ry * 0.3)) / ry; return dx * dx + dy * dy > 1.02; });
    P.ell(cx - rx * 0.45, cy - ry * 0.45, Math.max(1, rx * 0.22), Math.max(1, ry * 0.16), light);
  }

  /* ===== Lendir ===== */
  function slime(o) {
    const big = o.boss, P = grid(big ? 38 : 26, big ? 34 : 23);
    const cx = big ? 19 : 13, cy = big ? 22 : 14.5, rx = big ? 16 : 10, ry = big ? 11 : 7.6, bottom = big ? 32 : 21;
    P.ell(cx, cy, rx, ry, o.b, (x, y) => y <= bottom);
    shade(P, o.b, o.d, o.l, cx, cy, rx, ry);
    P.recolor(o.b, o.d, (x, y) => y === bottom);
    if (o.rock) for (let i = 0; i < (big ? 7 : 4); i++) { const x = cx - rx * 0.6 + ((i * 7) % Math.round(rx * 1.4)), y = cy - 2 + ((i * 5) % Math.round(ry)); P.px(x, y, o.d).px(x + 1, y, o.d); }
    if (o.check) for (let x = cx - rx + 2; x < cx + rx - 1; x += 2) P.px(x, cy + 2, K).px(x + 1, cy + 3, K);
    if (o.bubbles) P.px(cx + rx * 0.5, cy - ry * 0.2, W).px(cx + rx * 0.62, cy - ry * 0.45, '#c7f0ff').px(cx - rx * 0.3, cy + ry * 0.5, '#c7f0ff');
    if (o.star) P.px(cx + rx * 0.45, cy - ry * 0.6, '#ffcd75').rect(cx + rx * 0.45 - 1, cy - ry * 0.6 + 1, 3, 1, '#ffcd75').px(cx + rx * 0.45, cy - ry * 0.6 + 2, '#ffcd75');
    const ey = big ? 18 : 12;
    eyes(P, cx, ey, big ? 4 : 2, {angry: o.angry, eh: big ? 4 : 3});
    mouth(P, cx, ey + (big ? 6 : 4), o.mouth);
    if (o.blush) P.px(cx - (big ? 8 : 6), ey + 4, o.blush).px(cx + (big ? 7 : 5), ey + 4, o.blush);
    if (o.crown) crown(P, cx, Math.round(cy - ry) + 2, big ? 16 : 10, o.gem);
    if (o.helmet) { P.ell(cx, cy - ry + 3, rx * 0.8, 3, '#566c86', (x, y) => y <= cy - ry + 3); P.rect(cx - 1, cy - ry - 1, 2, 2, '#ffcd75'); }
    return P.outline();
  }

  /* ===== Jamur ===== */
  function mushroom(o) {
    const big = o.boss, P = grid(big ? 38 : 26, big ? 36 : 26);
    const cx = big ? 19 : 13, capY = big ? 15 : 10, crx = big ? 16 : 11, cry = big ? 10 : 7, top = big ? 6 : 4;
    // Batang + wajah
    const sw = big ? 9 : 6, sy0 = capY + 1, sy1 = big ? 33 : 24;
    P.ell(cx, (sy0 + sy1) / 2 + 1, sw, (sy1 - sy0) / 2 + 1, o.stem);
    P.recolor(o.stem, o.stemSh, (x, y) => x > cx + sw * 0.5);
    // Tudung
    P.ell(cx, capY, crx, cry, o.cap, (x, y) => y <= capY + (big ? 2 : 1));
    P.recolor(o.cap, o.capSh, (x, y) => y >= capY + (big ? 1 : 0) || x > cx + crx * 0.7);
    (big ? [[-9, -3, 2.4], [-1, -6, 2.2], [7, -3, 2.4], [-5, 0, 1.6], [4, 0, 1.6]] : [[-6, -2, 1.7], [0, -4, 1.6], [5, -2, 1.7]])
      .forEach(([dx, dy, r]) => P.ell(cx + dx, capY + dy, r, r * 0.85, o.spot));
    if (o.rings) for (let x = cx - crx + 3; x < cx + crx - 2; x += 4) P.rect(x, capY - 1, 2, 1, o.capSh);
    if (o.rock) P.px(cx - 3, capY - 4, o.capSh).px(cx + 4, capY - 2, o.capSh).px(cx - 8, capY - 1, o.capSh);
    const ey = capY + (big ? 6 : 4);
    eyes(P, cx, ey, big ? 3 : 1, {angry: o.angry, eh: big ? 4 : 3});
    mouth(P, cx, ey + (big ? 6 : 4), o.mouth);
    P.px(cx - (big ? 6 : 4), ey + (big ? 4 : 3), '#f4a3c8').px(cx + (big ? 5 : 3), ey + (big ? 4 : 3), '#f4a3c8');
    if (o.crown) crown(P, cx, capY - cry + 2, big ? 14 : 10, o.gem);
    P.rect(cx - sw + 1, sy1, 3, 1, o.stemSh).rect(cx + sw - 4, sy1, 3, 1, o.stemSh); // kaki kecil
    return P.outline();
  }

  /* ===== Kelelawar ===== */
  function bat(o) {
    const big = o.boss, P = grid(big ? 44 : 32, big ? 32 : 24);
    const cx = big ? 22 : 16, cy = big ? 18 : 13, br = big ? 7.5 : 5.5;
    // Sayap runcing: tepi atas naik ke ujung, tepi bawah bergerigi (lengkung-lengkung)
    const wing = s => {
      const L = big ? 16 : 12, f = big ? 1.35 : 1;
      for (let d = 0; d <= L; d++) {
        const x = cx + s * (br - 1 + d);
        const top = Math.round(cy - 3 * f - d * 0.45);
        const bot = Math.round(cy + 4 * f - d * 0.42 - Math.abs(Math.sin(d * Math.PI / (big ? 5.4 : 4))) * 2.4 * f);
        if (bot >= top) P.rect(x, top, 1, bot - top + 1, o.wing);
        P.px(x, top, o.bone || o.body);
      }
      // tulang jari sayap
      [0.35, 0.7].forEach(k => { const d = Math.round(L * k); for (let t = 0; t < 4; t++) P.px(cx + s * (br - 1 + d - t * 0.5), cy - 2 * f - d * 0.45 + t + 1, o.bone || o.body); });
    };
    wing(-1); wing(1);
    if (o.leaf) { P.ell(cx - (big ? 14 : 11), cy - 2, 2, 1, '#a7f070').ell(cx + (big ? 14 : 11), cy - 2, 2, 1, '#a7f070'); }
    if (o.pages) for (let x = 2; x < P.w - 2; x += 3) P.recolor(o.wing, '#e8d5b0', (xx, y) => xx === x);
    // Badan & telinga
    P.ell(cx, cy, br, br * 1.05, o.body);
    P.rect(cx - (big ? 6 : 4), cy - br - (big ? 4 : 3), 2, big ? 4 : 3, o.body).rect(cx + (big ? 4 : 2), cy - br - (big ? 4 : 3), 2, big ? 4 : 3, o.body);
    P.recolor(o.body, o.bodySh, (x, y) => x > cx + br * 0.4 && y > cy - 2);
    P.px(cx - br * 0.4, cy - br * 0.5, o.bodyHi || o.body);
    eyes(P, cx, cy - (big ? 2 : 2), big ? 2 : 1, {angry: o.angry, eh: big ? 3 : 2, eyeColor: o.eyeColor});
    if (o.eyeColor) P.px(cx - (big ? 4 : 3), cy - 2, W).px(cx + (big ? 2 : 1), cy - 2, W);
    mouth(P, cx, cy + (big ? 3 : 2), 'fang');
    if (o.crown) crown(P, cx, Math.round(cy - br) - 1, big ? 12 : 8, o.gem);
    if (o.moon) P.ell(cx + br + 2, cy - br - 2, 2, 2, '#ffcd75').ell(cx + br + 3, cy - br - 3, 1.6, 1.6, null);
    return P.outline();
  }

  /* ===== Kepiting ===== */
  function crab(o) {
    const big = o.boss || o.large, P = grid(big ? 40 : 30, big ? 32 : 24);
    const cx = big ? 20 : 15, cy = big ? 21 : 15, rx = big ? 12 : 9, ry = big ? 7 : 5.2;
    // Kaki
    for (let i = -2; i <= 2; i++) if (i) { const x = cx + i * (big ? 4 : 3); P.rect(x, cy + ry - 1, 1, big ? 4 : 3, o.sh); }
    // Capit
    [-1, 1].forEach(s => {
      const px = cx + s * (rx + (big ? 4 : 3)), py = cy - (big ? 7 : 5);
      P.ell(px, py, big ? 4 : 3, big ? 3.6 : 2.8, o.b);
      P.rect(px - (s < 0 ? 0 : 1), py - (big ? 4 : 3), 2, 2, null);  // celah capit
      const aw = big ? 3 : 2;
      P.rect(s < 0 ? cx - (rx - 1) - aw : cx + (rx - 1), cy - 2, aw, 2, o.b); // lengan
      P.px(px - s, py + 1, o.hi);
    });
    // Badan
    P.ell(cx, cy, rx, ry, o.b);
    P.recolor(o.b, o.sh, (x, y) => y > cy + ry * 0.35);
    P.ell(cx - rx * 0.4, cy - ry * 0.4, rx * 0.2, 1, o.hi);
    // Mata bertangkai
    [-1, 1].forEach(s => { P.rect(cx + s * (big ? 4 : 3) - (s < 0 ? 0 : 1), cy - ry - (big ? 4 : 3), 1, big ? 4 : 3, o.b); P.ell(cx + s * (big ? 4 : 3) - (s < 0 ? 0 : 1) + 0.5, cy - ry - (big ? 5 : 4), 1.8, 1.8, W); P.px(cx + s * (big ? 4 : 3) - (s < 0 ? 0 : 1), cy - ry - (big ? 5 : 4), K); });
    mouth(P, cx, cy - 1, o.angry ? 'grin' : 'smile');
    if (o.crown) crown(P, cx, Math.round(cy - ry - (big ? 6 : 5)), big ? 12 : 8, o.gem);
    return P.outline();
  }

  /* ===== Hantu ===== */
  function ghost(o) {
    const big = o.boss, P = grid(big ? 36 : 26, big ? 36 : 27);
    const cx = big ? 18 : 13, cy = big ? 16 : 11, r = big ? 12 : 8.5, bottom = big ? 32 : 24;
    P.ell(cx, cy, r, r, o.b);
    P.rect(cx - r + 0.5, cy, r * 2, bottom - cy - 2, o.b);
    // Ekor bergelombang
    for (let x = Math.round(cx - r + 1); x < cx + r; x++) { const wv = Math.round(Math.sin(x * 1.3) * 1.5); P.rect(x, bottom - 3, 1, 2 + wv, o.b); }
    P.recolor(o.b, o.sh, (x, y) => x > cx + r * 0.45);
    P.ell(cx - r * 0.45, cy - r * 0.45, r * 0.2, r * 0.15, o.hi);
    // Tangan kecil
    P.ell(cx - r - 0.5, cy + (big ? 6 : 4), 2, 1.5, o.b).ell(cx + r + 0.5, cy + (big ? 6 : 4), 2, 1.5, o.sh);
    if (o.lines) for (let y = cy + 3; y < bottom - 3; y += 3) P.rect(cx - r * 0.5, y, r, 1, o.sh);
    if (o.drips) P.rect(cx - 3, bottom - 1, 1, 3, o.b).rect(cx + 4, bottom - 1, 1, 2, o.b).px(cx - 3, bottom + 3, o.b);
    eyes(P, cx, cy - 1, big ? 3 : 2, {angry: o.angry, eh: big ? 4 : 3, eyeColor: o.eyeColor});
    mouth(P, cx, cy + (big ? 5 : 4), o.mouth || 'o');
    if (o.crown) crown(P, cx, Math.round(cy - r) + 2, big ? 14 : 9, o.gem);
    return P.outline();
  }

  /* ===== Naga (bos ujian) ===== */
  function dragon() {
    const P = grid(46, 40), R = '#e43b44', RS = '#b13e53', BELLY = '#ffcd75', WING = '#ef7d57';
    // Sayap
    // Sayap runcing ke kiri-atas (tepi bawah bergerigi) + sayap jauh yang mengintip di belakang
    for (let d = 0; d <= 15; d++) {
      const x = 19 - d, top = Math.round(19 - d * 1.05), bot = Math.round(24 - d * 0.45 - Math.abs(Math.sin(d * Math.PI / 5)) * 3);
      if (bot >= top) P.rect(x, top, 1, bot - top + 1, WING);
      P.px(x, top, RS);
    }
    [5, 10].forEach(d => { for (let t = 0; t < 4; t++) P.px(19 - d + t * 0.4, 20 - d * 1.05 + t, RS); });
    for (let d = 0; d <= 6; d++) { const x = 22 + d, top = Math.round(17 - d * 1.2); P.rect(x, top, 1, Math.max(1, 4 - Math.round(d * 0.3)), WING); P.px(x, top, RS); }
    // Ekor
    for (let i = 0; i < 9; i++) P.ell(8 - i * 0.2, 32 - i * 1.2, 2.6 - i * 0.18, 2.4 - i * 0.15, R);
    P.rect(4, 19, 3, 3, RS).px(3, 19, RS);
    // Badan & perut
    P.ell(20, 28, 10, 9, R); P.ell(21, 30, 6, 6.5, BELLY);
    for (let y = 26; y < 36; y += 3) P.rect(17, y, 8, 1, '#ef7d57');
    // Kaki
    P.rect(13, 35, 5, 3, R).rect(24, 35, 5, 3, R); P.px(13, 38, W).px(15, 38, W).px(24, 38, W).px(26, 38, W);
    // Kepala
    P.ell(29, 15, 8, 6.5, R); P.ell(35, 18, 5, 3.5, R);
    P.rect(24, 6, 2, 4, '#f4f4f4').rect(25, 5, 1, 1, '#f4f4f4').rect(31, 6, 2, 4, '#f4f4f4').rect(32, 5, 1, 1, '#f4f4f4'); // tanduk
    P.recolor(R, RS, (x, y) => y > 30 && x > 24);
    P.rect(27, 12, 3, 3, K).px(27, 12, W).rect(33, 12, 3, 3, K).px(33, 12, W); // mata
    P.px(26, 10, K).px(27, 10, K).px(28, 11, K).px(36, 10, K).px(35, 10, K).px(34, 11, K);   // alis marah
    P.px(38, 17, K).px(38, 19, K); // lubang hidung
    P.rect(31, 20, 8, 1, K).px(32, 21, W).px(36, 21, W);  // mulut bertaring
    P.px(41, 15, '#ffcd75').px(42, 14, '#ef7d57');          // asap api
    return P.outline();
  }

  /* ===== KELAS 2: Robot (badan kotak, layar wajah, antena) ===== */
  function robot(o) {
    const big = o.boss, s = big ? 1.4 : 1, P = grid(big ? 38 : 26, big ? 38 : 27), cx = big ? 19 : 13;
    const bw = Math.round(8 * s), top = Math.round(8 * s), bot = Math.round(21 * s);
    P.rect(cx - Math.round(6 * s), bot, Math.round(4 * s), Math.round(4 * s), o.d).rect(cx + Math.round(2 * s), bot, Math.round(4 * s), Math.round(4 * s), o.d); // kaki
    P.rect(cx - bw - Math.round(3 * s), top + Math.round(6 * s), Math.round(3 * s), Math.round(6 * s), o.d).rect(cx + bw, top + Math.round(6 * s), Math.round(3 * s), Math.round(6 * s), o.d); // lengan
    P.rect(cx - bw, top, bw * 2, bot - top, o.b);
    P.recolor(o.b, o.d, (x, y) => x >= cx + bw - Math.round(3 * s));
    P.rect(cx - bw + 1, top + 1, bw * 2 - 4, 1, o.l);
    // layar wajah
    const sx = cx - Math.round(6 * s), sy = top + Math.round(2 * s), sw = Math.round(12 * s), sh = Math.round(7 * s);
    P.rect(sx, sy, sw, sh, '#333c57');
    const ec = o.eye || '#73eff7', eh = big ? 3 : 2, ey = sy + Math.round(2 * s);
    P.rect(cx - Math.round(4 * s), ey, 2, eh, ec).rect(cx + Math.round(4 * s) - 2, ey, 2, eh, ec);
    if (o.angry) P.px(cx - Math.round(4 * s), ey - 1, ec).px(cx + Math.round(4 * s) - 1, ey - 1, ec);
    P.rect(cx - 2, sy + sh - 2, 4, 1, ec);
    // antena
    if (!o.crown) P.rect(cx, top - Math.round(4 * s), 1, Math.round(4 * s), o.d).ell(cx + 0.5, top - Math.round(4 * s), big ? 2 : 1.5, big ? 2 : 1.5, o.ant || '#e43b44'); // raja: mahkota menggantikan antena
    // hiasan dada
    const cy = top + Math.round(10 * s);
    if (o.ruler) for (let x = cx - bw + 1; x < cx + bw - 1; x += 2) P.rect(x, cy + 1, 1, x % 4 ? 1 : 2, K);
    if (o.clock) { P.ell(cx, cy + 2, 2.6 * s, 2.6 * s, W); P.rect(cx, cy, 1, 2, K).rect(cx, cy + 2, 2, 1, K); }
    if (o.num) P.rect(cx - 2, cy, 4, 1, '#ffcd75').rect(cx + 1, cy, 1, 4, '#ffcd75').rect(cx - 2, cy + 2, 4, 1, '#ffcd75');
    if (o.rock) [[-5, 1], [3, 3], [-2, 5], [5, -1]].forEach(([dx, dy]) => P.px(cx + dx * s, cy + dy, o.d).px(cx + dx * s + 1, cy + dy, o.d));
    if (o.crown) crown(P, cx, top + 1, big ? 16 : 10, o.gem);
    return P.outline();
  }

  /* ===== KELAS 2: Siput (rumah spiral) ===== */
  function snail(o) {
    const big = o.boss, s = big ? 1.4 : 1, P = grid(big ? 42 : 30, big ? 34 : 24);
    const fy = Math.round(19 * s), cx = Math.round(14 * s);
    P.ell(cx + 2 * s, fy, 12 * s, 3.5 * s, o.b);                               // kaki
    P.ell(cx + 10 * s, fy - 6 * s, 4 * s, 5.5 * s, o.b, (x, y) => y <= fy);    // kepala
    P.recolor(o.b, o.d, (x, y) => y >= fy + 1);
    [-1.5, 1.5].forEach(dx => { const ex = cx + 10 * s + dx * s; P.rect(ex, fy - 14 * s, 1, 4 * s, o.d).ell(ex + 0.5, fy - 14 * s, 1.6 * s, 1.6 * s, o.b); P.px(ex, fy - 14 * s, K).px(ex + 1, fy - 14 * s, K); });
    mouth(P, cx + 11 * s, fy - 5 * s, o.angry ? 'grin' : 'smile');
    if (o.blush) P.px(cx + 13 * s, fy - 6 * s, o.blush);
    // rumah spiral
    const hx = cx - 1 * s, hy = fy - 7 * s, R = 8 * s;
    P.ell(hx, hy, R, R, o.shell);
    P.ell(hx - 0.5, hy + 0.5, R * 0.68, R * 0.68, o.shSh).ell(hx - 1, hy + 1, R * 0.5, R * 0.5, o.shell).ell(hx - 0.5, hy + 0.5, R * 0.3, R * 0.3, o.shSh).ell(hx, hy, R * 0.14 + 0.5, R * 0.14 + 0.5, o.shell);
    P.ell(hx - R * 0.45, hy - R * 0.55, R * 0.18, R * 0.12, o.hi || W);
    if (o.times) { for (let i = -2; i <= 2; i++) P.px(hx + i, hy + i, W).px(hx + i, hy - i, W); }
    if (o.honey) P.rect(hx + R * 0.6, hy + R * 0.3, 1, 3, '#ffcd75').px(hx + R * 0.6, hy + R * 0.3 + 3, '#ffcd75');
    if (o.crown) crown(P, hx, Math.round(hy - R) + 2, big ? 14 : 10, o.gem);
    return P.outline();
  }

  /* ===== KELAS 2: Awan (hujan, petir, salju) ===== */
  function cloud(o) {
    const big = o.boss, s = big ? 1.4 : 1, P = grid(big ? 40 : 28, big ? 38 : 27), cx = big ? 20 : 14, cy = Math.round(12 * s);
    [[-6, 2, 5], [0, -2, 6.5], [6, 2, 5], [-2, 4, 5], [3, 4, 5]].forEach(([dx, dy, r]) => P.ell(cx + dx * s, cy + dy * s, r * s, r * s * 0.85, o.b));
    P.recolor(o.b, o.d, (x, y) => y > cy + 5 * s);
    P.ell(cx - 5 * s, cy - 2 * s, 2 * s, 1.2 * s, o.l);
    eyes(P, cx, cy, big ? 3 : 2, {angry: o.angry, eh: big ? 3 : 2});
    mouth(P, cx, cy + (big ? 5 : 4), o.angry ? 'grin' : 'o');
    P.px(cx - 6 * s, cy + 3, '#f4a3c8').px(cx + 5 * s, cy + 3, '#f4a3c8');
    const by = Math.round(cy + 9 * s);
    if (o.rain) [-5, -1, 3, 7].forEach((dx, i) => P.rect(cx + dx * s, by + (i % 2) * 2, 1, 3, '#41a6f6'));
    if (o.bolt) { const x = cx + 1; P.rect(x, by, 2, 3, '#ffcd75').rect(x - 2, by + 3, 3, 1, '#ffcd75').rect(x - 2, by + 4, 2, 3, '#ffcd75'); }
    if (o.snow) [-5, 0, 5].forEach((dx, i) => { const x = cx + dx * s, y = by + (i % 2) * 2 + 1; P.px(x, y, W).px(x - 1, y + 1, W).px(x + 1, y + 1, W).px(x, y + 2, W); });
    if (o.crown) crown(P, cx, Math.round(cy - 7 * s), big ? 14 : 10, o.gem);
    return P.outline();
  }

  /* ===== Resep tiap monster ===== */
  const GREEN = {b: '#38b764', d: '#257179', l: '#a7f070'};
  const ART = {
    lendirBatu:  () => slime({b: '#94b0c2', d: '#566c86', l: W, rock: true, mouth: 'smile'}),
    rajaBatu:    () => slime({boss: true, b: '#566c86', d: '#333c57', l: '#94b0c2', rock: true, angry: true, crown: true, mouth: 'grin'}),
    penjagaPola: () => slime({b: '#ffcd75', d: '#ef7d57', l: '#fff3b0', check: true, angry: true, helmet: true, mouth: 'grin'}),
    lendirUngu:  () => slime({b: '#b06fd0', d: '#5d275d', l: '#f4a3c8', star: true, blush: '#f4a3c8'}),
    lendirLaut:  () => slime({b: '#257179', d: '#29366f', l: '#73eff7', bubbles: true, blush: '#f4a3c8'}),

    jamur:         () => mushroom({cap: '#e43b44', capSh: '#b13e53', spot: W, stem: '#ffe4c4', stemSh: '#d4a373'}),
    jamurUngu:     () => mushroom({cap: '#b06fd0', capSh: '#5d275d', spot: '#f4a3c8', stem: '#ffe4c4', stemSh: '#d4a373'}),
    rajaJamur:     () => mushroom({boss: true, cap: '#ef7d57', capSh: '#b13e53', spot: '#ffcd75', stem: '#fff3b0', stemSh: '#d4a373', crown: true, angry: true, mouth: 'grin'}),
    jamurBatu:     () => mushroom({cap: '#94b0c2', capSh: '#566c86', spot: '#c7d3de', stem: '#c7d3de', stemSh: '#94b0c2', rock: true, angry: true}),
    jamurKayu:     () => mushroom({cap: '#ab5236', capSh: '#5d275d', spot: '#d4a373', stem: '#ffcd75', stemSh: '#d4a373', rings: true}),
    rajaJamurKayu: () => mushroom({boss: true, cap: '#5d275d', capSh: '#3b1a3b', spot: '#ffcd75', stem: '#ef7d57', stemSh: '#b13e53', crown: true, gem: '#73eff7', angry: true, mouth: 'grin'}),

    kelelawar:      () => bat({body: '#5d275d', bodySh: '#3b1a3b', bodyHi: '#b06fd0', wing: '#b06fd0', bone: '#5d275d'}),
    rajaKelelawar:  () => bat({boss: true, body: '#b13e53', bodySh: '#5d275d', bodyHi: '#ef7d57', wing: '#ef7d57', bone: '#b13e53', crown: true, angry: true}),
    kelelawarDaun:  () => bat({body: '#257179', bodySh: '#1a4c4f', bodyHi: '#38b764', wing: '#38b764', bone: '#257179', leaf: true}),
    kelelawarMalam: () => bat({body: '#333c57', bodySh: '#1a1c2c', bodyHi: '#566c86', wing: '#566c86', bone: '#333c57', eyeColor: '#ffcd75', moon: true}),
    rajaMalam:      () => bat({boss: true, body: '#29366f', bodySh: '#1a1c2c', bodyHi: '#3b5dc9', wing: '#5d275d', bone: '#29366f', eyeColor: '#ffcd75', crown: true, angry: true}),
    kelelawarBuku:  () => bat({body: '#ab5236', bodySh: '#5d275d', bodyHi: '#d4a373', wing: '#ffe4c4', bone: '#ab5236', pages: true}),

    kepiting:      () => crab({b: '#e43b44', sh: '#b13e53', hi: '#f4a3c8'}),
    kepitingBesar: () => crab({large: true, b: '#ef7d57', sh: '#b13e53', hi: '#ffcd75', angry: true}),
    rajaKepiting:  () => crab({boss: true, b: '#b06fd0', sh: '#5d275d', hi: '#f4a3c8', crown: true, angry: true}),

    hantuKertas: () => ghost({b: '#ffe4c4', sh: '#d4a373', hi: W, lines: true}),
    hantuTinta:  () => ghost({b: '#73eff7', sh: '#41a6f6', hi: W, drips: true, angry: true}),
    rajaTinta:   () => ghost({boss: true, b: '#566c86', sh: '#333c57', hi: '#94b0c2', crown: true, angry: true, eyeColor: '#73eff7', mouth: 'grin', drips: true}),

    // ===== Kelas 2 =====
    robotKecil:    () => robot({b: '#94b0c2', d: '#566c86', l: '#c7d3de', num: true}),
    rajaRobot:     () => robot({boss: true, b: '#41a6f6', d: '#3b5dc9', l: '#73eff7', angry: true, crown: true, num: true}),
    robotMeteran:  () => robot({b: '#ffcd75', d: '#ef7d57', l: '#fff3b0', ruler: true, ant: '#3b5dc9'}),
    robotJam:      () => robot({b: '#b06fd0', d: '#5d275d', l: '#f4a3c8', clock: true, eye: '#ffcd75'}),
    robotBatu:     () => robot({b: '#94b0c2', d: '#566c86', l: W, rock: true, angry: true, eye: '#e43b44'}),
    rajaRobotEmas: () => robot({boss: true, b: '#ffcd75', d: '#ef7d57', l: '#fff3b0', angry: true, crown: true, gem: '#3b5dc9', eye: '#e43b44', num: true}),
    siputHijau:    () => snail({b: '#a7f070', d: '#38b764', shell: '#ef7d57', shSh: '#b13e53', blush: '#f4a3c8'}),
    siputMadu:     () => snail({b: '#ffe4c4', d: '#d4a373', shell: '#ffcd75', shSh: '#ef7d57', honey: true, blush: '#f4a3c8'}),
    siputKali:     () => snail({b: '#73eff7', d: '#41a6f6', shell: '#b06fd0', shSh: '#5d275d', times: true}),
    rajaSiput:     () => snail({boss: true, b: '#38b764', d: '#257179', shell: '#3b5dc9', shSh: '#29366f', crown: true, angry: true}),
    awanHujan:     () => cloud({b: '#c7d3de', d: '#94b0c2', l: W, rain: true}),
    rajaAwan:      () => cloud({boss: true, b: '#94b0c2', d: '#566c86', l: '#c7d3de', rain: true, angry: true, crown: true, gem: '#41a6f6'}),
    awanPetir:     () => cloud({b: '#566c86', d: '#333c57', l: '#94b0c2', bolt: true, angry: true}),
    rajaPetir:     () => cloud({boss: true, b: '#333c57', d: '#1a1c2c', l: '#566c86', bolt: true, angry: true, crown: true}),
    awanSalju:     () => cloud({b: W, d: '#c7d3de', l: W, snow: true}),

    naga: dragon
  };
  Object.assign(MQ.Pix.MONSTERS, ART);
})();
