/* Math Quest — Peta Petualangan bergambar (pixel art, digulir ke atas).
   Dunia Kelas 1 dari bawah ke atas: padang → hutan → bukit → danau → lembah → menara → kastil.
   Arena Latihan di samping padang. Dungeon dibuka dari menu 🏰 Dungeon (js/dungeon.js); gambarnya tetap jadi hiasan peta.
   Setelah lulus ujian: tombol Mode Pahlawan ⭐⭐ di atas peta (musuh lebih kuat, lihat balance.js heroMode).
   Gambar medan dibuat sekali; jalur & tombol tempat digambar ulang sesuai progress. */
'use strict';
window.MQ = window.MQ || {};

MQ.WorldMap = (() => {
  const {Data, State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const W = 160, H = 560; // ukuran peta dalam piksel (diperbesar CSS)

  /* Posisi tiap tempat di peta (x, y dalam piksel peta) */
  const POS = {padang: [44, 515], hutan: [112, 432], bukit: [44, 350], danau: [108, 268], lembah: [46, 188],
               menara: [106, 112], kastil: [80, 40], guaPola: [134, 350], arena: [128, 532],
               kapalKaram: [36, 262], perpustakaan: [30, 120]};
  /* Wilayah warna dari atas ke bawah: [batas bawah y, nama] */
  const BANDS = [[78, 'kastil'], [156, 'menara'], [236, 'lembah'], [314, 'danau'], [392, 'bukit'], [472, 'hutan'], [H, 'padang']];

  let terrain = null; // kanvas medan + jalan (dibuat ulang bila progress berubah)
  let terrainKey = '';

  /* ===== Menggambar medan (digambar ulang 2026-11-26) =====
     Peta digambar di ukuran aslinya (160×560 piksel) lalu diperbesar CSS (image-rendering: pixelated),
     sehingga lapisan animasi bisa digambar ulang tiap frame dengan murah. */
  const K = '#1a1c2c';
  function painter(cv) {
    const x = cv.getContext('2d');
    const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); };
    const ell = (cx, cy, rx, ry, col) => { for (let dy = -ry; dy <= ry; dy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2))); R(col, cx - w, cy + dy, w * 2 + 1, 1); } };
    const circle = (cx, cy, r, col) => ell(cx, cy, r, r, col);
    return {x, R, ell, circle};
  }
  /** Batas bergelombang antar wilayah (indeks pita i, kolom px). */
  const border = (i, px) => BANDS[i][0] + Math.round(3 * Math.sin(px / 7 + i) + 1.5 * Math.sin(px / 3.1 + i * 2));
  /** Titik-titik jalan antar tempat (kurva sedikit melengkung). */
  function curve(a, b, step = 2) {
    const [x1, y1] = POS[a], [x2, y2] = POS[b];
    const mx = (x1 + x2) / 2 + (y1 - y2) * 0.15, my = (y1 + y2) / 2, n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step), pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2]);
    }
    return pts;
  }
  const ROUTES = () => { const o = Data.fields.map(f => f.id), r = []; for (let i = 1; i < o.length; i++) r.push([o[i - 1], o[i], i]); r.push(['padang', 'arena', -1]); return r; };

  function drawTerrain() {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const {R, ell, circle} = painter(c);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const road = ROUTES().flatMap(([a, b]) => curve(a, b, 3));
    // Jangan menaruh hiasan di atas tempat (ikon + papan nama) atau di jalan
    const free = (px, py, pad = 0) => !Object.values(POS).some(([x, y]) => Math.abs(px - x) < 17 + pad && py - y > -16 - pad && py - y < 26 + pad) &&
                                      !road.some(([x, y]) => Math.abs(px - x) < 6 + pad && Math.abs(py - y) < 6 + pad);

    /* 1. Warna dasar tiap wilayah: gradasi 3 tingkat + batas berbintik (dither) */
    const PAL = {kastil: ['#1a1c2c', '#262b44', '#333c57'], menara: ['#1f2a55', '#29366f', '#3b4a8a'], lembah: ['#e8b07a', '#d4a373', '#c28a5c'],
                 danau: ['#8fd47a', '#7fcf6a', '#6cbf5c'], bukit: ['#b5dc84', '#9fca72', '#86b861'], hutan: ['#1f6b52', '#1a5c48', '#164f3f'],
                 padang: ['#5ac46a', '#45bb63', '#38b764']};
    for (let px = 0; px < W; px++) {
      let top = 0;
      BANDS.forEach(([, name], i) => {
        const bottom = i === BANDS.length - 1 ? H : border(i, px), pal = PAL[name], h = bottom - top;
        for (let k = 0; k < 3; k++) R(pal[k], px, top + Math.floor(h * k / 3), 1, Math.ceil(h / 3) + 1);
        if (i > 0) { const prev = PAL[BANDS[i - 1][1]][2]; for (let d = 0; d < 3; d++) if ((px + d) % 2 === 0) R(prev, px, top + d, 1, 1); } // dither
        top = bottom;
      });
    }

    /* 2. Padang Hitung: rumput, bunga, desa kecil, pagar */
    for (let i = 0; i < 140; i++) { const a = ri(0, W), b = ri(476, H - 2); if (!free(a, b, -8)) continue; R('#257179', a, b, 1, 2); R('#257179', a + 2, b + 1, 1, 1); R('#a7f070', a + 1, b - 1, 1, 1); }
    for (let i = 0; i < 40; i++) { const a = ri(2, W - 3), b = ri(480, H - 3); if (!free(a, b, -8)) continue; const f = ['#e43b44', '#ffcd75', '#f4f4f4', '#f4a3c8'][i % 4]; R(f, a, b, 1, 1); R(f, a - 1, b + 1, 3, 1); R(f, a, b + 2, 1, 1); R('#ffcd75', a, b + 1, 1, 1); }
    const house = (hx, hy, wall, roof) => {
      R(K, hx - 1, hy - 1, 14, 10); R(wall, hx, hy, 12, 8); R('#5d3a28', hx + 5, hy + 3, 3, 5); R('#73eff7', hx + 1, hy + 2, 3, 2); R('#73eff7', hx + 9, hy + 2, 2, 2);
      for (let k = 0; k < 6; k++) { R(K, hx - 2 + k, hy - 2 - k, 16 - k * 2, 1); R(roof, hx - 1 + k, hy - 2 - k, 14 - k * 2, 1); }
      R(K, hx + 9, hy - 9, 3, 4); R('#94b0c2', hx + 10, hy - 8, 1, 3);                                     // cerobong
    };
    house(6, 486, '#ffe4c4', '#e43b44'); house(8, 540, '#fff3b0', '#3b5dc9'); house(84, 492, '#f4a3c8', '#5d275d');
    for (let fx = 70; fx < 104; fx += 4) { R(K, fx, 548, 3, 7); R('#d4a373', fx + 1, 549, 1, 5); }       // pagar
    R('#d4a373', 70, 550, 34, 1); R('#d4a373', 70, 553, 34, 1);
    // Arena: lingkaran pasir berpagar batu dengan bendera
    const [ax, ay] = POS.arena;
    ell(ax, ay + 2, 15, 10, K); ell(ax, ay + 2, 14, 9, '#94b0c2'); ell(ax, ay + 2, 12, 7, '#ffcd75'); ell(ax, ay + 3, 9, 4, '#e8c49a');

    /* 3. Hutan: pohon berlapis (belakang gelap, depan terang), jamur */
    const tree = (tx, ty, s, dark) => {
      R('#5d3a28', tx - 1, ty + s - 2, 2, 5);
      circle(tx, ty, s + 1, K); circle(tx, ty, s, dark ? '#1f5c4a' : '#257179');
      circle(tx - 1, ty - 1, s - 2, dark ? '#257179' : '#38b764');
      R(dark ? '#38b764' : '#a7f070', tx - 2, ty - s + 1, 2, 1);
    };
    for (let row = 0; row < 2; row++) for (let i = 0; i < 46; i++) {
      const tx = ri(2, W - 2), ty = ri(398 + row * 6, 470);
      if (free(tx, ty, 2)) tree(tx, ty, ri(4, 6), row === 0);
    }
    for (let i = 0; i < 10; i++) { const a = ri(4, W - 4), b = ri(410, 468); if (!free(a, b, 0)) continue; R(K, a - 2, b - 1, 5, 3); R('#e43b44', a - 1, b - 1, 3, 2); R('#f4f4f4', a, b - 1, 1, 1); R('#ffe4c4', a, b + 1, 1, 2); }

    /* 4. Bukit Bentuk: bukit bergaris tepi & berbayang, batu, tebing gua */
    for (let i = 0; i < 9; i++) {
      const hx = ri(0, W), hy = ri(332, 388), rx = ri(10, 18), ry = ri(6, 9);
      if (!free(hx, hy, -10)) continue;
      ell(hx, hy + 1, rx + 1, ry + 1, '#5a9a4a'); ell(hx, hy, rx, ry, '#8fbf6a'); ell(hx - 2, hy - 2, rx - 4, ry - 3, '#b5dc84'); R('#d7f0a0', hx - rx / 2, hy - ry + 1, 4, 1);
    }
    for (let i = 0; i < 16; i++) { const bx = ri(4, W - 6), by = ri(322, 390); if (!free(bx, by, 0)) continue; R(K, bx - 1, by - 1, 7, 5); R('#94b0c2', bx, by, 5, 3); R('#c7d3de', bx, by, 3, 1); R('#566c86', bx + 3, by + 1, 2, 2); }
    // bentuk-bentuk batu (segitiga, kotak, lingkaran) sebagai tanda "Bukit Bentuk"
    [[14, 380, 'tri'], [92, 330, 'sq'], [150, 384, 'ci']].forEach(([sx, sy, t]) => {
      if (t === 'tri') for (let k = 0; k < 6; k++) { R(K, sx - k - 1, sy - 6 + k, k * 2 + 3, 1); R('#ffcd75', sx - k, sy - 6 + k, k * 2 + 1, 1); }
      else if (t === 'sq') { R(K, sx - 1, sy - 1, 8, 8); R('#41a6f6', sx, sy, 6, 6); R('#73eff7', sx, sy, 6, 1); }
      else { circle(sx, sy, 4, K); circle(sx, sy, 3, '#e43b44'); R('#f4a3c8', sx - 2, sy - 2, 2, 1); }
    });
    const [gx, gy] = POS.guaPola; // tebing batu dengan mulut gua
    ell(gx, gy, 18, 15, K); ell(gx, gy, 17, 14, '#566c86'); ell(gx - 3, gy - 3, 12, 9, '#94b0c2'); ell(gx - 5, gy - 6, 6, 3, '#c7d3de');
    ell(gx, gy + 6, 8, 7, K); ell(gx, gy + 7, 6, 5, '#0d0e18'); R('#8fbf6a', gx - 18, gy + 12, 36, 3);

    /* 5. Danau: pantai pasir, air dangkal→dalam, pulau, teratai, kapal karam */
    ell(80, 274, 72, 28, '#e8c49a'); ell(80, 273, 70, 26, '#ffe4c4');
    ell(80, 274, 67, 24, '#73eff7'); ell(80, 275, 62, 21, '#41a6f6'); ell(84, 277, 48, 15, '#3b5dc9');
    for (let i = 0; i < 8; i++) { const lx = ri(30, 130), ly = ri(258, 292); R('#38b764', lx, ly, 3, 2); R('#a7f070', lx, ly, 1, 1); if (i % 3 === 0) R('#f4a3c8', lx + 1, ly - 1, 1, 1); }
    const [dx, dy] = POS.danau; ell(dx, dy + 4, 12, 6, '#e8c49a'); ell(dx, dy + 3, 10, 5, '#a7f070'); ell(dx - 2, dy + 2, 6, 3, '#7fdc84');
    const [sx, sy] = POS.kapalKaram; // kapal miring separuh tenggelam
    for (let k = 0; k < 9; k++) { R(K, sx - 16 + k * 3, sy + 1 + Math.round(k * 0.6), 4, 8); R(k < 3 ? '#8a5a3c' : '#ab5236', sx - 15 + k * 3, sy + 2 + Math.round(k * 0.6), 3, 6); }
    R('#5d3a28', sx - 15, sy + 6, 26, 1);
    R(K, sx + 1, sy - 22, 3, 24); R('#8a5a3c', sx + 2, sy - 21, 1, 22);
    R(K, sx + 3, sy - 20, 13, 11); R('#f4f4f4', sx + 4, sy - 19, 11, 9); R('#c7d3de', sx + 10, sy - 19, 5, 9); R('#41a6f6', sx + 12, sy - 14, 3, 3); // layar sobek

    /* 6. Lembah Ukur: lapisan batu tebing, tebing kiri-kanan, kaktus, jembatan kayu */
    for (let y = 160; y < 234; y += 5) for (let px = 0; px < W; px++) { const yy = y + Math.round(2 * Math.sin(px / 9 + y)); if ((px + y) % 23 < 15) R(y % 10 ? '#c28a5c' : '#e8c49a', px, yy, 1, 1); }
    for (let y = 160; y < 236; y++) { const wl = 8 + Math.round(4 * Math.sin(y / 6)), wr = 9 + Math.round(4 * Math.cos(y / 7)); R('#ab5236', 0, y, wl, 1); R(K, wl, y, 1, 1); R('#ab5236', W - wr, y, wr, 1); R(K, W - wr - 1, y, 1, 1); R('#8a4a2c', 0, y, 3, 1); }
    for (let i = 0; i < 6; i++) { const cx = ri(18, W - 20), cy = ri(166, 228); if (!free(cx, cy, 0)) continue; R(K, cx - 1, cy - 7, 4, 9); R('#38b764', cx, cy - 6, 2, 8); R(K, cx - 4, cy - 4, 4, 3); R('#38b764', cx - 3, cy - 3, 2, 1); R('#38b764', cx - 3, cy - 5, 1, 2); R('#a7f070', cx, cy - 6, 1, 3); }
    for (let i = 0; i < 8; i++) { const lx = ri(14, W - 30), ly = ri(165, 230); if (!free(lx, ly, 0)) continue; R(K, lx - 1, ly - 1, 9, 4); R('#94b0c2', lx, ly, 7, 2); R('#c7d3de', lx, ly, 4, 1); }
    // penggaris raksasa tertancap (tanda "Lembah Ukur")
    R(K, 136, 196, 7, 30); R('#ffcd75', 137, 197, 5, 28); for (let k = 0; k < 7; k++) R(K, 137, 199 + k * 4, k % 2 ? 2 : 3, 1);

    /* 7. Menara Seratus: malam berbintang, bulan, bukit ungu, menara, perpustakaan */
    for (let i = 0; i < 46; i++) R(i % 7 ? '#c7d3de' : '#ffcd75', ri(0, W), ri(80, 140), 1, 1);
    circle(140, 92, 7, '#fff3b0'); circle(143, 90, 6, '#29366f');                                          // bulan sabit
    for (let px = 0; px < W; px++) { const top = 140 + Math.round(6 * Math.sin(px / 13) + 3 * Math.sin(px / 5)); R('#3b2a5d', px, top, 1, 160 - top); R('#5d275d', px, top, 1, 1); }
    const [mx, my] = POS.menara;
    R(K, mx - 10, my - 46, 20, 44); R('#94b0c2', mx - 9, my - 45, 18, 42); R('#566c86', mx + 3, my - 45, 6, 42);
    for (let yy = my - 44; yy < my - 4; yy += 6) R('#566c86', mx - 9, yy, 18, 1);                            // susunan batu
    for (let yy = my - 40; yy < my - 8; yy += 9) { R(K, mx - 3, yy - 1, 5, 6); R('#ffcd75', mx - 2, yy, 3, 4); }
    for (let k = 0; k < 5; k++) R(K, mx - 12 + k * 5, my - 52, 4, 7), R('#94b0c2', mx - 11 + k * 5, my - 51, 2, 5); // gerigi
    const [lx2, ly2] = POS.perpustakaan;
    R(K, lx2 - 15, ly2 - 22, 30, 24); R('#d4a373', lx2 - 14, ly2 - 21, 28, 22); R('#c28a5c', lx2 + 6, ly2 - 21, 8, 22);
    for (let k = 0; k < 9; k++) { R(K, lx2 - 17 + k, ly2 - 22 - k, 34 - k * 2, 1); R('#5d275d', lx2 - 16 + k, ly2 - 22 - k, 32 - k * 2, 1); }
    R('#5d3a28', lx2 - 3, ly2 - 10, 6, 10); [['#e43b44', -12], ['#41a6f6', 8]].forEach(([cc, ox]) => { R(K, lx2 + ox - 1, ly2 - 19, 6, 8); R('#ffe08a', lx2 + ox, ly2 - 18, 4, 6); R(cc, lx2 + ox, ly2 - 18, 1, 6); });

    /* 8. Kastil: gunung berapi gelap, aliran lava, kastil besar */
    [[18, 80, 30], [142, 80, 30]].forEach(([vx, vb, vh]) => { // gunung berapi ungu dengan kawah menyala
      for (let k = 0; k < vh; k++) {
        const w = Math.round(4 + k * 0.9), y = vb - vh + k;
        R(K, vx - w - 1, y, w * 2 + 2, 1); R('#3b2a5d', vx - w, y, w * 2, 1); R('#5d275d', vx - w, y, Math.max(1, w - 1), 1); R('#8a4a8a', vx - w, y, 1, 1);
      }
      R(K, vx - 5, vb - vh - 1, 10, 3); R('#e43b44', vx - 4, vb - vh, 8, 2); R('#ffcd75', vx - 2, vb - vh, 4, 1);
      for (let k = 2; k < vh * 0.45; k++) R(k % 3 ? '#ef7d57' : '#ffcd75', vx - 1 + Math.round(Math.sin(k / 2.5) * 1.5), vb - vh + k, 2, 1); // aliran lava pendek
    });
    const [kx, ky] = POS.kastil;
    R(K, kx - 30, ky - 24, 60, 22); R('#94b0c2', kx - 29, ky - 23, 58, 20); R('#566c86', kx + 8, ky - 23, 21, 20);
    for (let yy = ky - 20; yy < ky - 3; yy += 5) R('#566c86', kx - 29, yy, 37, 1);
    for (let i = -29; i < 29; i += 6) { R(K, kx + i - 1, ky - 28, 6, 5); R('#94b0c2', kx + i, ky - 27, 4, 4); }
    [-34, 24].forEach(ox => { R(K, kx + ox - 1, ky - 33, 12, 31); R('#566c86', kx + ox, ky - 32, 10, 29); R('#94b0c2', kx + ox, ky - 32, 4, 29);
      for (let k = 0; k < 6; k++) R(K, kx + ox - 2 + k, ky - 33 - k, 14 - k * 2, 1), R('#e43b44', kx + ox - 1 + k, ky - 33 - k, 12 - k * 2, 1);
      R(K, kx + ox + 3, ky - 25, 4, 6); R('#ffcd75', kx + ox + 4, ky - 24, 2, 4); });
    R(K, kx - 7, ky - 16, 14, 14); R('#5d275d', kx - 6, ky - 15, 12, 13); R('#3b2a5d', kx - 6, ky - 15, 12, 2);

    /* 9. Jalan tanah bertepi antar tempat */
    drawRoads(c);
    return c;
  }

  /** Jalan: tanah terang bila tempat tujuannya terbuka, abu-abu putus-putus bila masih terkunci. */
  function drawRoads(c) {
    const {R} = painter(c);
    ROUTES().forEach(([a, b, i]) => {
      const open = i < 0 || isOpen(Data.fields[i]), pts = curve(a, b, 1);
      pts.forEach(([x, y], k) => { if (open || k % 6 < 3) R(K, x - 2, y - 2, 5, 5); });
      pts.forEach(([x, y], k) => { if (open) { R('#e8c49a', x - 1, y - 1, 3, 3); if (k % 5 === 0) R('#d4a373', x, y, 1, 1); } else if (k % 6 < 3) R('#94b0c2', x - 1, y - 1, 3, 3); });
    });
  }

  /* ===== Animasi peta: awan, kilau air, kunang-kunang, bintang, bendera, lava, kupu-kupu ===== */
  const hash = n => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
  function drawAnim(ctx, t) {
    const R = (col, a, b, w, h) => { ctx.fillStyle = col; ctx.fillRect(Math.round(a), Math.round(b), w, h); };
    // kilau & riak air danau
    for (let i = 0; i < 14; i++) {
      const on = Math.floor(t * 2 + i * 0.7) % 3 === 0, x = 30 + hash(i) * 100, y = 262 + hash(i + 9) * 24;
      if (on) R('#f4f4f4', x, y, 2, 1); else R('#73eff7', x + Math.round(Math.sin(t + i) * 2), y, 3, 1);
    }
    // kunang-kunang di hutan & malam menara
    for (let i = 0; i < 12; i++) {
      const night = i % 2, bx = hash(i + 20) * W, by = night ? 95 + hash(i + 30) * 50 : 405 + hash(i + 30) * 60;
      if (Math.floor(t * 3 + i) % 4 === 0) continue;
      R('#ffcd75', bx + Math.sin(t * 0.8 + i) * 4, by + Math.cos(t * 0.6 + i) * 3, 1, 1);
    }
    // bintang berkelip
    for (let i = 0; i < 10; i++) if (Math.floor(t * 2 + i * 1.3) % 5 === 0) { const sx = hash(i + 50) * W, sy = 82 + hash(i + 60) * 50; R('#f4f4f4', sx - 1, sy, 3, 1); R('#f4f4f4', sx, sy - 1, 1, 3); }
    // bendera berkibar di kastil & menara
    const flag = (fx, fy, col) => { const f = Math.floor(t * 4) % 2; R(K, fx, fy, 1, 10); R(col, fx + 1, fy, 6, 2); R(col, fx + 1, fy + 2, 5 + f, 2); R(col, fx + 1 + f, fy + 4, 4, 1); };
    const [kx, ky] = POS.kastil, [mx, my] = POS.menara;
    flag(kx - 18, ky - 38, '#ffcd75'); flag(kx + 14, ky - 38, '#ffcd75'); flag(mx, my - 62, '#e43b44');
    // lava berdenyut di puncak gunung
    if (Math.floor(t * 2) % 2) [[18, 48], [142, 48]].forEach(([vx, vy]) => { R('#ffcd75', vx - 1, vy, 2, 1); R('#ef7d57', vx - 2, vy - 2, 1, 1); R('#ef7d57', vx + 2, vy - 3, 1, 1); });
    // asap cerobong rumah padang
    [[17, 476], [19, 530], [95, 482]].forEach(([cx, cy], i) => { for (let k = 0; k < 3; k++) { const p = (t * 0.6 + k / 3 + i * 0.2) % 1; R('#c7d3de', cx + Math.sin(p * 6) * 2, cy - p * 10, 2, 2); } });
    // kupu-kupu di padang
    for (let i = 0; i < 3; i++) {
      const bx = ((hash(i + 70) * 200 + t * (5 + i * 2)) % (W + 20)) - 10, by = 490 + i * 18 + Math.sin(t * 3 + i) * 4, o = Math.floor(t * 8 + i) % 2;
      const cc = ['#ffcd75', '#f4a3c8', '#73eff7'][i]; R(cc, bx - (o ? 2 : 1), by, o ? 2 : 1, 2); R(cc, bx + 1, by, o ? 2 : 1, 2); R(K, bx, by, 1, 2);
    }
    // awan (dengan bayangan di tanah) melayang pelan dari kiri ke kanan
    for (let i = 0; i < 4; i++) {
      const span = W + 60, cx = ((hash(i + 80) * span + t * (3 + i)) % span) - 30, cy = 60 + i * 130 + hash(i + 90) * 40;
      ctx.fillStyle = 'rgba(26,28,44,0.12)'; ctx.fillRect(Math.round(cx) + 4, Math.round(cy) + 14, 24, 4);
      ctx.fillStyle = 'rgba(244,244,244,0.85)';
      [[0, 3, 5], [7, 0, 6], [15, 3, 5]].forEach(([ox, oy, r]) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); ctx.fillRect(Math.round(cx + ox - w), Math.round(cy + oy + dy), w * 2 + 1, 1); } });
    }
  }

  /* ===== Status & jalur ===== */
  const places = () => [...Data.fields, Data.arena];
  /* Mode cerita: 0 Normal, 1 Pahlawan (setelah lulus ujian), 2 Legenda (setelah 6 bos Pahlawan) */
  const mode = () => State.storyMode();
  const heroOn = () => mode() > 0;
  const modeList = () => State.modeList(mode());
  const MODES = [{name: '⭐ Normal', short: 'Normal'}, {name: '⭐⭐ Pahlawan', short: 'Pahlawan', cfg: 'heroMode'},
                 {name: '⭐⭐⭐ Legenda', short: 'Legenda', cfg: 'legendMode'}];
  const isOpen = p => State.unlockedIn(p, mode());
  function status(p) {
    if (p.soon) return 'soon';
    if (!isOpen(p)) return 'lock';
    return (p.spec || p.exam ? modeList() : S.cleared).includes(p.id) ? 'done' : 'open'; // tiap tingkat: bintang dihitung ulang
  }
  /** Tempat tujuan berikutnya (area terbuka pertama yang belum selesai) — di sini pahlawan berdiri. */
  function currentPlace() {
    const main = Data.fields.filter(f => !f.soon);
    return main.find(f => isOpen(f) && !modeList().includes(f.id)) || main[main.length - 1];
  }

  /* ===== Layar Peta ===== */
  UI.renderers.map = () => {
    const hb = $('btnHeroMode');
    hb.hidden = false;
    hb.textContent = MODES[mode()].name + ' ▾';
    $('modeMenu').hidden = true;
    hb.classList.toggle('on', heroOn());
    hb.classList.toggle('legend', mode() === 2);
    $('scr-map').classList.toggle('heroMode', heroOn());
    // medan + jalan dibuat ulang hanya bila tingkat / tempat terbuka berubah
    const key = mode() + '|' + Data.fields.map(f => (isOpen(f) ? 1 : 0)).join('');
    if (!terrain || key !== terrainKey) { terrain = drawTerrain(); terrainKey = key; }
    const cv = $('mapCanvas');
    if (cv.width !== W) { cv.width = W; cv.height = H; }
    paint(performance.now() / 1000);
    // Tombol tempat di atas gambar (posisi dalam persen agar ikut lebar layar)
    const cur = currentPlace();
    $('mapNodes').innerHTML = places().map(p => {
      const [x, y] = POS[p.id], st = status(p);
      const badge = st === 'done' ? '⭐' : st === 'lock' ? '🔒' : st === 'soon' ? '🚧' : '';
      // potret bos piksel (siluet bila masih terkunci); Arena tetap memakai ikon
      const art = p.id !== 'arena' && p.boss && MQ.Pix && MQ.Pix.has(p.boss)
        ? `<img class="mnArt" src="${MQ.Pix.url(p.boss, 2, st === 'lock' || st === 'soon')}" alt="">` : p.icon;
      return `<button class="mapNode ${st}${p === cur ? ' cur' : ''}" data-place="${p.id}" style="left:${x / W * 100}%;top:${y / H * 100}%">` +
             `<span class="mnIcon">${art}${badge ? `<i>${badge}</i>` : ''}</span><span class="mnName">${p.icon} ${p.name}</span></button>`;
    }).join('');
    // Pahlawan berdiri di atas tujuan berikutnya
    const [hx, hy] = POS[cur.id];
    const hero = $('mapHero');
    hero.src = MQ.Hero.current();
    hero.style.left = (hx / W * 100) + '%'; hero.style.top = (hy / H * 100) + '%';
    requestAnimationFrame(() => hero.scrollIntoView({block: 'center'})); // langsung tampilkan tujuan berikutnya
  };

  /** Gambar satu frame peta: medan (sudah jadi) + lapisan animasi. ~15 fps, hanya saat Peta tampil. */
  function paint(t) {
    const ctx = $('mapCanvas').getContext('2d');
    ctx.drawImage(terrain, 0, 0);
    drawAnim(ctx, t);
  }
  let lastPaint = 0;
  (function loop(ms) {
    requestAnimationFrame(loop);
    if (!terrain || ms - lastPaint < 66 || document.hidden || !$('scr-map').classList.contains('on')) return;
    lastPaint = ms; paint(ms / 1000);
  })(0);

  /* Ketuk tempat: tampilkan keterangan, lalu mulai */
  $('mapNodes').addEventListener('click', e => {
    const b = e.target.closest('.mapNode');
    if (!b) return;
    const p = places().find(x => x.id === b.dataset.place);
    if (p.soon) return UI.overlay({icon: '🚧', title: p.name, text: 'Tempat ini sedang dibangun. Segera hadir!'});
    if (!isOpen(p)) {
      const lst = modeList(), lvl = heroOn() ? ` di tingkat ${MODES[mode()].short}` : '';
      if (p.reqAll && !State.mainFields().every(f => lst.includes(f.id))) {
        const all = State.mainFields(), done = all.filter(f => lst.includes(f.id)).length;
        return UI.overlay({icon: '🔒', title: 'Masih Terkunci', text: `Selesaikan semua area Kelas 1${lvl} dulu (${done} dari ${all.length} selesai), lalu ikuti ujiannya!`});
      }
      if (p.minLevel && S.level < p.minLevel) {
        return UI.overlay({icon: '💪', title: 'Belum Cukup Kuat', text: `Kastil Ujian butuh Level ${p.minLevel} (sekarang Level ${S.level}). Latihan di area dan dungeon untuk naik level!`});
      }
      const req = Data.fields.find(x => x.id === p.req);
      return UI.overlay({icon: '🔒', title: 'Masih Terkunci', text: `Kalahkan bos di ${req.name}${lvl} dulu untuk membuka ${p.name}.`});
    }
    // Cerita pembuka tempat ini (sekali saja), lalu bertarung
    const go = () => MQ.Cutscene.playOnce(`${p.id}-intro`, () => MQ.Battle.start(p));
    if (p.exam) {
      if (heroOn()) return UI.overlay({icon: '📝', title: `Ujian ${MODES[mode()].short}`, btn: 'Mulai Ujian', btn2: 'Nanti', cb: go,
        text: '12 soal dari semua area. Kali ini Raja Naga MENYERANG! Lulus jika benar minimal 9. ' +
              (mode() === 1 ? 'Lulus = membuka tingkat Legenda ⭐⭐⭐.' : 'Ujian terberat di Kelas 1!')});
      return UI.overlay({icon: '📝', title: 'Ujian Naik Kelas', btn: 'Mulai Ujian', btn2: 'Nanti', cb: go,
        text: `12 soal dari semua area. Musuh tidak menyerang, jawab dengan tenang. Lulus jika benar minimal 9. Nilai terbaikmu: ${S.examBest}.`});
    }
    const hero = heroOn() && p.spec, M = MODES[hero ? mode() : 0], add = hero ? MQ.Balance[M.cfg].lvAdd : 0;
    const lv = p.lv ? ` Level ${p.lv[0] + add}–${p.lv[1] + add}.` : '';
    const done = (hero ? modeList() : S.cleared).includes(p.id) ? ' Bos sudah kamu kalahkan ⭐' : '';
    UI.overlay({icon: p.icon, title: p.name + (hero ? ' ' + M.name.split(' ')[0] : ''), btn: 'Main!', btn2: 'Nanti', cb: go,
      text: `${p.desc}.${lv}${hero ? ` Mode ${M.name.split(' ')[1]}: musuh lebih kuat & cepat, kadang DUA monster sekaligus. Koin lebih banyak!` : ''}${done}`});
  });

  /* Pilihan tingkat kesulitan (dropdown): tingkat yang belum terbuka tetap terlihat dengan gembok & syaratnya */
  const LOCK_TEXT = ['', 'Lulus Ujian Naik Kelas (Normal) dulu', 'Lulus Ujian Pahlawan dulu'];
  function renderModeMenu() {
    $('modeMenu').innerHTML = MODES.map((M, i) => {
      const open = State.modeOpen(i), list = State.modeList(i), n = State.mainFields().filter(f => list.includes(f.id)).length;
      const sub = !open ? '🔒 ' + LOCK_TEXT[i] : `${n} dari ${State.mainFields().length} bos` + ((i === 0 ? S.grade >= 2 : list.includes('kastil')) ? ' · ujian lulus 🎓' : '');
      return `<button class="modeOpt${i === mode() ? ' on' : ''}${open ? '' : ' locked'}" data-m="${i}"><b>${M.name}</b><small>${sub}</small></button>`;
    }).join('');
  }
  $('btnHeroMode').addEventListener('click', e => {
    e.stopPropagation();
    const menu = $('modeMenu');
    if (menu.hidden) renderModeMenu();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', e => { if (!e.target.closest('#modeMenu')) $('modeMenu').hidden = true; });
  $('modeMenu').addEventListener('click', e => {
    const b = e.target.closest('.modeOpt');
    if (!b) return;
    const m = +b.dataset.m;
    if (!State.modeOpen(m)) {
      MQ.Audio.sfx.wrong();
      return UI.overlay({icon: '🔒', title: `${MODES[m].short} masih terkunci`, text: LOCK_TEXT[m] + ' untuk membuka tingkat ini.'});
    }
    $('modeMenu').hidden = true;
    if (m === mode()) return;
    S.storyMode = m; State.save();
    UI.renderers.map();
    if (S.storyMode === 1) UI.overlay({icon: '🦸', title: 'Mode Pahlawan ⭐⭐', text: 'Soalnya sama, tapi musuh JAUH lebih kuat dan cepat, kadang DUA monster sekaligus. Koin dua kali lipat! Buat & tingkatkan perlengkapan di Pandai Besi supaya cukup kuat.' +
      (State.modeOpen(2) ? '' : ' Mulai lagi dari Padang Hitung. Selesaikan semua area dan lulus ujiannya untuk membuka Mode Legenda!')});
    if (S.storyMode === 2) UI.overlay({icon: '🐉', title: 'Mode Legenda ⭐⭐⭐', text: 'Tantangan tersulit! Musuh sangat kuat dan cepat. Hanya pahlawan dengan perlengkapan +4 atau +5 yang bisa menang. Koin tiga kali lipat!'});
  });

  return {POS};
})();
