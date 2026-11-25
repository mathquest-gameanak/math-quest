/* Math Quest — gambar bergerak halaman Dungeon (2026-11-26).
   outside(canvas, id, t): pemandangan LUAR tiap dungeon untuk kartu daftar (tokoh cerita ketakutan di luar,
                           monster mengintip dari dalam).
   inside(canvas, id, t):  lorong DALAM dungeon untuk halaman pilih tingkat (obor berkedip, monster kunci, bos & peti di ujung).
   Semua digambar piksel demi piksel di kanvas 160×96 lalu diperbesar CSS (pixelated). t = detik. */
'use strict';
window.MQ = window.MQ || {};

MQ.DungeonArt = (() => {
  const W = 160, H = 96, K = '#1a1c2c';
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  let ctx = null;
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  /** Elips penuh (baris demi baris, tajam), hanya baris yMin..yMax. */
  function ell(cx, cy, rx, ry, c, yMin = -999, yMax = 999) {
    for (let dy = -ry; dy <= ry; dy++) {
      const y = cy + dy;
      if (y < yMin || y > yMax) continue;
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
      R(c, cx - w, y, w * 2 + 1, 1);
    }
  }
  const bands = (cols, h) => { const b = Math.ceil(h / cols.length); cols.forEach((c, i) => R(c, 0, i * b, W, b + 1)); };
  /** Sprite piksel (MQ.Pix) dengan titik tengah-bawah di (x, bottom). */
  function sprite(name, x, bottom, o = {}) {
    if (!MQ.Pix.has(name)) return;
    const s = MQ.Pix.sprite(name, '', o.flip), k = o.scale || 1, w = Math.round(s.width * k), h = Math.round(s.height * k);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(s, Math.round(x - w / 2), Math.round(bottom - h), w, h);
    ctx.globalAlpha = 1;
  }
  /** Gambar fn() hanya di dalam elips (lubang gua / jendela / lubang kapal). */
  function inEllipse(cx, cy, rx, ry, fn) { ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip(); fn(); ctx.restore(); }
  function inRect(x, y, w, h, fn) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(); ctx.restore(); }
  /** Seberapa jauh monster mengintip (0 = sembunyi, 1 = keluar), berulang tiap `cycle` detik. */
  function peek(t, cycle = 6, off = 0) {
    const p = (t + off) % cycle;
    return p < 0.6 ? p / 0.6 : p < 2.6 ? 1 : p < 3.2 ? 1 - (p - 2.6) / 0.6 : 0;
  }
  const blink = (t, i) => Math.floor(t * 1.3 + i * 0.7) % 4 !== 0;
  const tremble = t => (Math.floor(t * 14) % 2 ? 1 : 0);

  /* ================= LUAR ================= */
  function guaPolaOut(t) {
    bands(['#29366f', '#3b2a5d', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75'], 60);           // senja
    ell(26, 50, 9, 9, '#fff3b0');
    for (let i = 0; i < 3; i++) { const x = ((t * (3 + i) + i * 60) % (W + 40)) - 30; R('#f4a3c8', x, 10 + i * 9, 22 - i * 4, 2); R('#f4a3c8', x + 4, 8 + i * 9, 10, 2); }
    for (let x = 0; x < W; x++) { const y = Math.round(52 + 6 * Math.sin(x / 17) + 3 * Math.sin(x / 7)); R('#5d275d', x, y, 1, H - y); }
    R('#38b764', 0, 80, W, 16); R('#257179', 0, 89, W, 7);
    // bukit batu besar dengan tepi terang
    ell(104, 84, 56, 48, '#94b0c2', 0, 82); ell(106, 85, 55, 47, '#566c86', 0, 82); ell(124, 88, 34, 40, '#4a5d75', 0, 82);
    for (let i = 0; i < 26; i++) { const x = 56 + hash(i) * 96, y = 44 + hash(i + 7) * 36; if (Math.abs(x - 104) < 22 && y > 58) continue; R('#333c57', x, y, 3, 1); R('#94b0c2', x, y - 1, 2, 1); }
    // mulut gua
    ell(104, 82, 20, 23, K, 0, 82); ell(104, 83, 17, 20, '#0b0c14', 0, 82);
    // mata-mata di kegelapan
    [[96, 70, 0], [112, 74, 2], [104, 66, 4]].forEach(([x, y, i]) => { if (blink(t, i)) { R('#ffcd75', x, y, 1, 1); R('#ffcd75', x + 3, y, 1, 1); } });
    // monster batu mengintip dari sisi kanan mulut gua
    const a = peek(t);
    inEllipse(104, 82, 17, 20, () => sprite('penjagaPola', 125 - a * 16, 84));
    // kristal pola di sekitar mulut gua (berdenyut)
    [[80, 80], [128, 78], [122, 60], [86, 60]].forEach(([x, y], i) => {
      const on = Math.floor(t * 2 + i) % 3;
      R(K, x - 2, y - 6, 5, 8); R(on ? '#b06fd0' : '#f4a3c8', x - 1, y - 5, 3, 6); R('#f4f4f4', x - 1, y - 5, 1, 2);
    });
    // Momo bersembunyi di balik batu, gemetar ketakutan
    sprite('momo', 30 + tremble(t), 86);
    ell(30, 88, 15, 8, '#94b0c2', 0, 96); ell(31, 89, 14, 7, '#566c86', 0, 96);
    if (Math.floor(t * 2) % 2) { R('#73eff7', 42, 60, 2, 3); R('#73eff7', 43, 59, 1, 1); }              // keringat dingin
    R(K, 22, 52, 7, 9); R('#f4f4f4', 23, 53, 5, 7); R(K, 25, 54, 1, 3); R(K, 25, 58, 1, 1);            // tanda !
    for (let i = 0; i < 14; i++) { const x = hash(i + 40) * W; R('#a7f070', x, 86 + hash(i + 3) * 8, 1, 2); }
  }

  function kapalKaramOut(t) {
    bands(['#41a6f6', '#5ec5f7', '#73eff7', '#a6f4f9'], 48);
    ell(136, 14, 7, 7, '#fff3b0');
    for (let i = 0; i < 2; i++) { const x = ((t * (2 + i) + i * 80) % (W + 40)) - 30; ell(x, 12 + i * 10, 10, 3, '#f4f4f4'); ell(x + 8, 10 + i * 10, 7, 3, '#f4f4f4'); }
    R('#3b5dc9', 0, 46, W, H - 46); R('#29366f', 0, 70, W, H - 70);
    // kapal karam miring di kanan
    // lambung miring (haluan kiri terangkat, buritan kanan tenggelam), dibuat per kolom
    for (let x = 72; x < 158; x++) {
      const top = Math.round(34 + (x - 72) * 0.26 + (x < 84 ? (84 - x) * 0.9 : 0)), bot = Math.round(66 + (x - 72) * 0.2);
      R(K, x, top - 1, 1, bot - top + 2); R('#ab5236', x, top, 1, bot - top);
      for (let y = top + 4; y < bot; y += 6) R('#5d275d', x, y, 1, 1);                              // garis papan
      R('#d4a373', x, top, 1, 2);
    }
    for (let k = 0; k < 9; k++) R(K, 100 + k, 52 + Math.round(Math.sin(k) * 2), 1, 1);             // retakan
    for (let k = 0; k < 30; k++) R('#6d4b27', 112 - k * 0.45, 43 - k, 3, 1);                       // tiang patah
    for (let y = 0; y < 14; y++) R('#f4f4f4', 104 - y * 0.45, 18 + y, Math.max(1, 14 - y), 1);       // layar sobek
    R('#e43b44', 98, 14, 6, 3);
    ell(126, 62, 7, 6, K); ell(126, 62, 5, 4, '#0b0c14');                                            // lubang lambung
    const a = peek(t, 5);
    inEllipse(126, 62, 6, 5, () => sprite('kepiting', 126, 72 - a * 8));
    for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i / 4) % 1; R('#a6f4f9', 128 + Math.sin(t * 3 + i) * 3, 56 - p * 14, 1, 1); }
    // air menutupi bagian kapal yang karam, ombak bergerak di depan kapal
    ctx.fillStyle = 'rgba(41,54,111,0.78)'; ctx.fillRect(70, 70, 90, H - 70);
    for (let y = 72; y < H; y += 5) for (let x = 0; x < W; x += 12) { const s = (x + Math.round(t * 10) + y * 3) % 24; R('#73eff7', x + s / 3, y + (s > 12 ? 1 : 0), 5, 1); }
    // pantai & Kapten Kumis yang cemas
    ell(18, 108, 62, 30, '#ffcd75', 0, 96); ell(14, 110, 56, 28, '#f0c590', 0, 96);
    sprite('kapten', 32, 90 + (Math.floor(t * 2) % 2));
    R(K, 44, 50, 7, 9); R('#f4f4f4', 45, 51, 5, 7); R(K, 46, 52, 3, 1); R(K, 48, 53, 1, 2); R(K, 47, 55, 1, 1); R(K, 47, 57, 1, 1); // tanda ?
    for (let i = 0; i < 2; i++) { const x = (t * 12 + i * 70) % (W + 20) - 10, y = 26 + i * 6 + Math.sin(t * 3 + i) * 2; R(K, x, y, 2, 1); R(K, x + 2, y + 1, 1, 1); R(K, x + 3, y, 2, 1); } // camar
  }

  function perpustakaanOut(t) {
    bands(['#1a1c2c', '#222a44', '#29366f', '#3b2a5d', '#5d275d'], 70);
    for (let i = 0; i < 24; i++) if (Math.floor(t * 2 + i) % 5) R(i % 4 ? '#c7d3de' : '#ffcd75', hash(i) * W, hash(i + 9) * 50, 1, 1);
    ell(24, 16, 8, 8, '#fff3b0'); ell(28, 14, 7, 7, '#29366f');
    R('#333c57', 0, 84, W, 12); R('#566c86', 0, 84, W, 1);
    // gedung perpustakaan tua
    for (let y = 12; y < 32; y++) { const w = Math.round((y - 12) * 2.6); R(K, 100 - w - 1, y, w * 2 + 2, 1); R('#5d275d', 100 - w, y, w * 2, 1); }
    R(K, 49, 31, 102, 54); R('#ab5236', 50, 32, 100, 52);
    for (let y = 34; y < 84; y += 4) for (let x = 50 + ((y / 4) % 2) * 4; x < 150; x += 8) R('#8a4030', x, y, 1, 3);
    R('#d4a373', 50, 32, 100, 2);
    ell(100, 86, 12, 18, K, 0, 84); ell(100, 87, 10, 16, '#3b2a17', 0, 84);                           // pintu
    if (Math.floor(t * 3) % 6) R('#ffcd75', 100, 76, 2, 8);                                          // celah cahaya
    const win = (x, i) => { const on = Math.floor(t * 4 + i * 3) % 7; R(K, x - 1, 39, 20, 20); R(on ? '#ffcd75' : '#ef7d57', x, 40, 18, 18); };
    win(60, 0); win(122, 1);
    // hantu kertas mengintip dari jendela kiri
    const a = peek(t, 5.5);
    inRect(60, 40, 18, 18, () => sprite('hantuKertas', 69, 74 - a * 18));
    [60, 122].forEach(x => { R('#5d275d', x + 8, 40, 2, 18); R('#5d275d', x, 48, 18, 2); });
    // buku-buku beterbangan
    for (let i = 0; i < 3; i++) {
      const ang = t * 0.9 + i * 2.1, x = 100 + Math.cos(ang) * 46, y = 20 + Math.sin(ang * 1.3) * 8, f = Math.floor(t * 6 + i) % 2;
      R(K, x - 4, y - 2, 9, 5); R(['#e43b44', '#41a6f6', '#38b764'][i], x - 3, y - 1 - f, 3, 3); R(['#e43b44', '#41a6f6', '#38b764'][i], x + 1, y - 1 + f, 3, 3); R('#f4f4f4', x, y - 1, 1, 3);
    }
    // Hantu Buku sedih menunggu di luar
    sprite('hantuBuku', 26, 88 + Math.round(Math.sin(t * 2) * 2), {alpha: 0.95});
    R('#73eff7', 34, 64 + (Math.floor(t * 2) % 2), 1, 2);                                            // air mata
  }

  /* ================= DALAM (lorong menuju bos) ================= */
  const THEME = {
    guaPola: {bg: '#1a1c2c', wall: '#566c86', wall2: '#333c57', lite: '#94b0c2', floor: '#3b4458', rug: '#5d275d', acc: '#b06fd0', acc2: '#f4a3c8', deco: 'crystal'},
    kapalKaram: {bg: '#3b2a17', wall: '#ab5236', wall2: '#6d4b27', lite: '#d4a373', floor: '#5d3a28', rug: '#29366f', acc: '#73eff7', acc2: '#41a6f6', deco: 'ship'},
    perpustakaan: {bg: '#2a1a2e', wall: '#5d275d', wall2: '#3b2a17', lite: '#b13e53', floor: '#4a3420', rug: '#b13e53', acc: '#ffcd75', acc2: '#ef7d57', deco: 'books'}
  };
  function inside(id, t) {
    const P = THEME[id], d = MQ.Data.dungeons.find(x => x.id === id);
    const bx = 52, by = 14, bw = 56, bh = 50, fy = by + bh;
    R(P.bg, 0, 0, W, H);
    // dinding samping (perspektif), lantai, dinding ujung
    for (let x = 0; x < bx; x++) {
      const top = Math.round(by * x / bx), bot = Math.round(H - (H - fy) * x / bx);
      R(P.wall, x, top, 1, bot - top); R(P.wall, W - 1 - x, top, 1, bot - top);
      if (x % 9 === 0) { R(P.wall2, x, top, 1, bot - top); R(P.wall2, W - 1 - x, top, 1, bot - top); }
    }
    for (let y = fy; y < H; y++) {
      const k = (y - fy) / (H - fy), l = Math.round(bx * (1 - k)), r = W - l;
      R(P.floor, l, y, r - l, 1);
      const rl = Math.round(W / 2 - 8 - k * 22); R(P.rug, rl, y, (W / 2 - rl) * 2, 1);              // karpet ke arah bos
      if ((y - fy) % 6 === 0) R(P.wall2, l, y, r - l, 1);
    }
    R(P.wall2, bx, by, bw, bh); R(P.wall, bx + 2, by + 2, bw - 4, bh - 2);
    // hiasan tema
    if (P.deco === 'crystal') {
      [[14, 70], [30, 40], [140, 64], [126, 36], [58, 60], [102, 58]].forEach(([x, y], i) => {
        const on = Math.floor(t * 2 + i) % 3; R(K, x - 2, y - 7, 5, 9); R(on ? P.acc : P.acc2, x - 1, y - 6, 3, 7); R('#f4f4f4', x - 1, y - 6, 1, 2);
      });
    } else if (P.deco === 'ship') {
      [[16, 34], [144, 34]].forEach(([x, y]) => { ell(x, y, 6, 6, K); ell(x, y, 5, 5, '#3b5dc9'); R('#73eff7', x - 3 + Math.round(Math.sin(t * 2) * 2), y - 1, 4, 1); });
      const sw = Math.round(Math.sin(t * 1.6) * 4); R(K, 80 + sw, 0, 1, 10); R(K, 77 + sw, 10, 7, 6); R(Math.floor(t * 5) % 4 ? '#ffcd75' : '#ef7d57', 78 + sw, 11, 5, 4); // lentera bergoyang
    } else {
      for (let x = 2; x < bx - 4; x += 5) for (let r = 0; r < 4; r++) {
        const top = Math.round(by * x / bx) + 8 + r * 14, c = ['#e43b44', '#41a6f6', '#38b764', '#ffcd75', '#b06fd0'][(x + r) % 5];
        R(c, x, top, 3, 9); R(c, W - 4 - x, top, 3, 9);
      }
      for (let i = 0; i < 4; i++) { const p = (t * 0.25 + i / 4) % 1; R('#ffe4c4', 30 + i * 30 + Math.sin(t + i) * 6, 80 - p * 70, 4, 3); } // halaman melayang
    }
    // obor berkedip + cahaya
    [[26, 40], [134, 40]].forEach(([x, y], i) => {
      ctx.fillStyle = `rgba(255,205,117,${0.12 + 0.06 * Math.sin(t * 9 + i)})`; ctx.beginPath(); ctx.arc(x, y - 4, 12, 0, Math.PI * 2); ctx.fill();
      R(K, x - 1, y - 2, 3, 10); R('#6d4b27', x, y - 1, 1, 9);
      const f = Math.floor(t * 8 + i) % 3; R('#ef7d57', x - 2, y - 7 + f % 2, 5, 5); R('#ffcd75', x - 1, y - 6 + f % 2, 3, 3);
    });
    // bos & peti di ujung, monster kunci di tengah lorong
    ctx.fillStyle = 'rgba(228,59,68,0.18)'; ctx.beginPath(); ctx.ellipse(W / 2, fy - 14, 22, 18, 0, 0, Math.PI * 2); ctx.fill();
    sprite(d.boss, W / 2 - 4, fy + 2 + Math.round(Math.sin(t * 2) * 1));
    sprite('peti', W / 2 + 20, fy + 3, {scale: 0.6});
    sprite(d.key, 44, 90 + (Math.floor(t * 2) % 2), {scale: 1.1});
    sprite(d.mobs[0], 122, 92 + (Math.floor(t * 2 + 1) % 2), {flip: true});
    // debu berkilau
    for (let i = 0; i < 10; i++) { const p = (t * 0.1 + hash(i)) % 1; ctx.fillStyle = 'rgba(244,244,244,0.5)'; ctx.fillRect(Math.round(hash(i + 3) * W), Math.round(H - p * H), 1, 1); }
    // bayangan tepi
    for (let k = 0; k < 10; k++) { ctx.fillStyle = `rgba(0,0,0,${(10 - k) / 10 * 0.35})`; ctx.fillRect(0, H - 1 - k, W, 1); ctx.fillRect(0, k, W, 1); }
  }

  const OUT = {guaPola: guaPolaOut, kapalKaram: kapalKaramOut, perpustakaan: perpustakaanOut};
  function prep(cv) {
    if (cv.width !== W) { cv.width = W; cv.height = H; }
    ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  }
  return {
    W, H,
    outside(cv, id, t) { prep(cv); (OUT[id] || guaPolaOut)(t); },
    inside(cv, id, t) { prep(cv); inside(id, t); }
  };
})();
