/* Math Quest — pemandangan pertarungan bergerak (kanvas piksel, dipakai battle.js).
   Dunia dibuat dari lapisan: langit, bukit jauh (paralaks 0,25), bukit/pohon tengah (0,55), tanah & jalan (1).
   Pahlawan berjalan dari titik ke titik (jalur 5 titik di area, ruang di dungeon). Kamera mengikuti pahlawan.
   1 piksel dunia = 3–5 piksel layar, mengikuti tinggi arena (arena lebih tinggi → tokoh lebih besar).
   Tema warna per tempat ada di THEMES (tahap 4 nanti: latar khusus tiap area).
   Sprite: pahlawan dari hero.js (32×32, beranimasi); monster baru dari pixelart.js bila ada (PIX), selain itu sprite lama ×2. */
'use strict';
window.MQ = window.MQ || {};

MQ.Scene = (() => {
  const K = '#1a1c2c';
  const $ = id => document.getElementById(id);
  const cv = $('scene'), ctx = cv.getContext('2d');
  let VW = 120, VH = 100, GY = 83, camX = 0, theme = null, markers = [], running = false, placeId = '';

  /* ===== Tema tempat ===== */
  const T = (o) => Object.assign({
    sky: ['#4fb8f0', '#62c6f4', '#78d4f6', '#92e2f7', '#b4eef6'], sun: '#ffe08a', clouds: true, stars: false,
    far: ['#7fcfa0', '#a6e3b8'], mid: ['#4fbf6e', '#7fdc84'], tree: ['#257179', '#38b764', '#5d275d'], trees: 0.65, treeShape: 'round',
    grass: ['#38b764', '#a7f070'], path: ['#d4a373', '#e8c49a', '#ab5236'], deco: 'flowers', sign: '#d4a373'
  }, o);
  const THEMES = {
    padang: T({}),
    arena: T({mid: ['#c9a46a', '#e0c08a'], tree: null, deco: 'rocks', path: ['#ffcd75', '#fff3b0', '#d4a373'], grass: ['#d4a373', '#e8c49a']}),
    hutan: T({sky: ['#3d8fbf', '#4fa3c9', '#62b5d1', '#7cc6d6', '#9ad5d8'], far: ['#257179', '#3a8a7e'], mid: ['#1a4c4f', '#257179'],
              tree: ['#1a4c4f', '#257179', '#5d275d'], trees: 0.95, grass: ['#257179', '#38b764'], deco: 'mushrooms'}),
    bukit: T({far: ['#94b0c2', '#c7d3de'], mid: ['#8fbf6a', '#a7f070'], tree: ['#566c86', '#94b0c2', '#333c57'], treeShape: 'rock', trees: 0.5, deco: 'rocks'}),
    danau: T({far: ['#41a6f6', '#73eff7'], mid: ['#3b5dc9', '#73eff7'], tree: null,
              path: ['#ffcd75', '#fff3b0', '#d4a373'], deco: 'reeds'}),
    lembah: T({sky: ['#e8a85a', '#f0b96e', '#f6cb86', '#f9dca2', '#fbe9c0'], sun: '#fff3b0', far: ['#c28553', '#d9a066'], mid: ['#ab5236', '#d4a373'],
               tree: ['#5d275d', '#ab5236', '#5d275d'], treeShape: 'cliff', trees: 0.5, grass: ['#8fbf6a', '#a7f070'], deco: 'logs'}),
    menara: T({sky: ['#1a1c2c', '#222a44', '#29366f', '#333c57', '#3b4a73'], sun: '#f4f4f4', clouds: false, stars: true, far: ['#29366f', '#3b5dc9'],
               mid: ['#333c57', '#566c86'], tree: ['#1a1c2c', '#29366f', '#1a1c2c'], trees: 0.4, grass: ['#257179', '#38b764'], path: ['#566c86', '#94b0c2', '#333c57'], deco: 'stars', sign: '#94b0c2'}),
    kastil: T({sky: ['#5d275d', '#7a3466', '#b13e53', '#ef7d57', '#ffcd75'], sun: '#ef7d57', clouds: false, far: ['#333c57', '#566c86'], mid: ['#566c86', '#94b0c2'],
               tree: ['#333c57', '#566c86', '#1a1c2c'], treeShape: 'tower', trees: 0.5, grass: ['#566c86', '#94b0c2'], path: ['#94b0c2', '#c7d3de', '#566c86'], deco: 'rocks', sign: '#94b0c2'}),
    guaPola: T({sky: ['#1a1c2c', '#222533', '#2a2f40', '#333c57', '#3b4458'], sun: null, clouds: false, far: ['#333c57', '#566c86'], mid: ['#566c86', '#94b0c2'],
                tree: ['#333c57', '#566c86', '#1a1c2c'], treeShape: 'rock', trees: 0.7, grass: ['#333c57', '#566c86'], path: ['#566c86', '#94b0c2', '#333c57'], deco: 'crystals', sign: '#94b0c2'}),
    kapalKaram: T({sky: ['#29366f', '#2f4890', '#3b5dc9', '#41a6f6', '#73eff7'], sun: null, clouds: false, far: ['#3b5dc9', '#41a6f6'], mid: ['#29366f', '#3b5dc9'],
                   tree: ['#ab5236', '#d4a373', '#5d275d'], treeShape: 'mast', trees: 0.4, grass: ['#5d275d', '#ab5236'], path: ['#ab5236', '#d4a373', '#5d275d'], deco: 'bubbles', sign: '#d4a373'}),
    perpustakaan: T({sky: ['#3b2a17', '#4a3420', '#5d4128', '#6d4b27', '#7a5a3a'], sun: null, clouds: false, far: ['#5d275d', '#7a3466'], mid: ['#6d4b27', '#a3703a'],
                     tree: ['#5d275d', '#b13e53', '#3b2a17'], treeShape: 'shelf', trees: 0.8, grass: ['#5d275d', '#7a3466'], path: ['#ab5236', '#d4a373', '#5d275d'], deco: 'books', sign: '#d4a373'})
  };

  /* ===== Ukuran ===== */
  let sc = 4; // skala tetap selama satu pertarungan, supaya tokoh tidak berubah ukuran saat tinggi arena berubah
  function resize(fresh) {
    const a = $('arena');
    if (!a.clientHeight) return;
    if (fresh) sc = Math.max(3, Math.min(5, Math.floor(a.clientHeight / 88))); // ±88 piksel dunia tingginya
    VW = Math.max(90, Math.round(a.clientWidth / sc)); VH = Math.max(70, Math.round(a.clientHeight / sc));
    if (cv.width !== VW || cv.height !== VH) { cv.width = VW; cv.height = VH; }
    GY = VH - 17;
  }
  addEventListener('resize', () => resize(true));
  if (window.ResizeObserver) new ResizeObserver(() => resize(false)).observe($('arena'));

  /* ===== Gambar dasar ===== */
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const circle = (cx, cy, r, c) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); R(c, cx - w, cy + dy, w * 2 + 1, 1); } };
  const DIG = {1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
               4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'], 6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.']};
  const digit = (n, x, y, c) => (DIG[n] || DIG[1]).forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && R(c, x + i, y + j, 1, 1)));

  /** Satu "pohon" di lapisan tengah, bentuknya mengikuti tema. */
  function midThing(sx, y, k) {
    const [d, l, t] = theme.tree, r = 5 + Math.round(hash(k + 5) * 3);
    switch (theme.treeShape) {
      case 'rock': circle(sx, y - r + 2, r + 1, K); circle(sx, y - r + 2, r, d); circle(sx - 2, y - r, r - 2, l); break;
      case 'cliff': R(K, sx - 6, y - 18, 13, 18); R(d, sx - 5, y - 17, 11, 17); R(l, sx - 5, y - 17, 11, 2); R(t, sx + 2, y - 12, 2, 10); break;
      case 'tower': R(K, sx - 5, y - 26, 11, 26); R(d, sx - 4, y - 25, 9, 25); R(l, sx - 4, y - 25, 2, 25); R('#ffcd75', sx - 1, y - 18, 2, 3); R(K, sx - 6, y - 29, 13, 4); break;
      case 'mast': R(K, sx - 1, y - 30, 3, 30); R(d, sx, y - 29, 1, 29); R('#f4f4f4', sx + 2, y - 27, 9, 10); R('#c7d3de', sx + 2, y - 19, 9, 2); break;
      case 'shelf':
        R(K, sx - 8, y - 24, 17, 24); R(t, sx - 7, y - 23, 15, 22);
        for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) R(['#b13e53', '#3b5dc9', '#38b764', '#ffcd75'][(i + row + k) & 3], sx - 6 + i * 2.4, y - 21 + row * 7, 2, 5);
        break;
      default:
        R(t, sx - 1, y - 4, 3, 6);
        circle(sx, y - 6 - r, r + 1, K); circle(sx, y - 6 - r, r, d); circle(sx - 2, y - 8 - r, r - 2, l); R('#a7f070', sx - 3, y - 10 - r, 2, 1);
    }
  }

  function drawBackground(t) {
    const S = theme.sky, band = Math.ceil((GY - 30) / S.length);
    R(S[S.length - 1], 0, 0, VW, VH);
    S.forEach((c, i) => R(c, 0, i * band, VW, band + 1));
    for (let i = 1; i < S.length; i++) for (let x = (i % 2); x < VW; x += 2) R(S[i], x, i * band - 1, 1, 1);
    if (theme.stars) for (let i = 0; i < 26; i++) R(Math.floor(t * 2 + i) % 7 ? '#f4f4f4' : '#ffcd75', ((hash(i) * 400 - camX * 0.05) % VW + VW) % VW, hash(i + 3) * (GY - 35), 1, 1);
    if (theme.sun) { circle(VW - 18, 11, 7, theme.stars ? '#c7d3de' : '#fff3b0'); circle(VW - 18, 11, 5, theme.sun); }
    if (theme.clouds) for (let i = 0; i < 4; i++) {
      const span = VW + 70, x = ((hash(i + 1) * span - camX * 0.08 - t * (2 + i)) % span + span) % span - 35, y = 4 + hash(i + 9) * Math.max(4, GY - 50);
      circle(x, y + 3, 5, '#f4f4f4'); circle(x + 7, y, 6, '#f4f4f4'); circle(x + 15, y + 3, 5, '#f4f4f4'); R('#d6f1fa', x - 4, y + 7, 24, 2);
    }
    // Lapisan khusus tempat (backgrounds.js): sky2 setelah langit, far menggantikan bukit jauh,
    // mid menggantikan/menambah lapisan tengah, floor menggantikan tanah, front digambar di depan tokoh.
    const B = (MQ.Backdrops || {})[placeId] || {}, Hp = helpers(t);
    if (B.sky2) B.sky2(Hp);
    if (B.far) B.far(Hp);
    else for (let sx = 0; sx < VW; sx++) {
      const wx = sx + camX * 0.25, y = Math.round(GY - 33 + 5 * Math.sin(wx / 21) + 3 * Math.sin(wx / 8.3));
      R(theme.far[0], sx, y, 1, VH - y); R(theme.far[1], sx, y, 1, 1);
    }
    const midY = Hp.midY;
    if (!B.noMidHills) for (let sx = 0; sx < VW; sx++) { const wx = sx + camX * 0.55, y = midY(wx); R(theme.mid[0], sx, y, 1, VH - y); R(theme.mid[1], sx, y, 1, 1); }
    if (B.mid) B.mid(Hp);
    if (theme.tree) {
      const first = Math.floor((camX * 0.55 - 20) / 26);
      for (let k = first; k < first + VW / 26 + 3; k++) {
        if (hash(k) > theme.trees) continue;
        const wx = k * 26 + hash(k + 3) * 14;
        midThing(wx - camX * 0.55, midY(wx), k);
      }
    }
    if (B.floor) B.floor(Hp);
    else for (let sx = 0; sx < VW; sx++) {
      const wx = sx + camX, top = GY - 7 + Math.round(1.5 * Math.sin(wx / 9));
      R(theme.grass[0], sx, top, 1, VH - top); R(theme.grass[1], sx, top, 1, 1);
      if (hash(wx) > 0.8) R(theme.grass[1], sx, top - 1, 1, 1);
      const p0 = GY - 2 + Math.round(Math.sin(wx / 23)), p1 = GY + 7 + Math.round(Math.sin(wx / 17));
      R(theme.path[0], sx, p0, 1, p1 - p0); R(theme.path[2], sx, p1, 1, 1); R(theme.path[1], sx, p0, 1, 1);
    }
    const f0 = Math.floor(camX / 7);
    for (let k = f0; k < f0 + VW / 7 + 2; k++) {
      const h = hash(k + 77), sx = k * 7 - camX;
      if (h < 0.18) decoItem(sx, k);
      else if (h > 0.93) { R(K, sx - 1, GY + 3, 5, 3); R('#94b0c2', sx, GY + 3, 3, 2); }
      else if (h > 0.75) { const y = GY + 10 + Math.round(hash(k) * 3); R(theme.grass[1], sx, y, 1, 2); R(theme.grass[1], sx + 2, y, 1, 2); }
    }
    // Papan nomor tiap titik & bendera di titik terakhir
    markers.forEach((m, i) => {
      const sx = m.x - 50 - camX;
      if (sx < -20 || sx > VW + 10) return;
      R(K, sx + 3, GY - 18, 3, 16); R('#ab5236', sx + 4, GY - 18, 1, 15);
      R(K, sx - 2, GY - 24, 13, 9); R(m.type === 'boss' ? '#e43b44' : m.type === 'mini' ? '#b06fd0' : theme.sign, sx - 1, GY - 23, 11, 7);
      digit(i + 1, sx + 3, GY - 22, m.type ? '#fff3b0' : K);
      if (m.type === 'boss') { const fx = m.x + 42 - camX; R(K, fx, GY - 34, 2, 33); R('#e43b44', fx + 2, GY - 34, 10, 6); R('#ffcd75', fx + 2, GY - 34 + (Math.floor(t * 4) % 2), 10, 1); }
    });
  }
  /** Alat gambar untuk backgrounds.js (nilai saat ini). */
  function helpers(t) {
    return {R, circle, hash, K, t, VW, VH, GY, camX, theme,
            midY: wx => Math.round(GY - 19 + 3 * Math.sin(wx / 14 + 2) + 2 * Math.sin(wx / 5.1)),
            /** Ulangi benda setiap 'step' piksel dunia pada paralaks f: cb(sx, k) dengan sx = posisi layar. */
            each(step, f, cb, margin = 30) { const first = Math.floor((camX * f - margin) / step); for (let k = first; k <= first + (VW + margin * 2) / step + 1; k++) cb(k * step - camX * f, k); }};
  }
  function drawFront(t) { const B = (MQ.Backdrops || {})[placeId]; if (B && B.front) B.front(helpers(t)); }
  function decoItem(sx, k) {
    const c = ['#e43b44', '#f4f4f4', '#ffcd75', '#f4a3c8'][k & 3], y = GY - 6;
    switch (theme.deco) {
      case 'mushrooms': R('#f4f4f4', sx, y - 1, 1, 3); R('#e43b44', sx - 1, y - 3, 3, 2); R('#f4f4f4', sx, y - 3, 1, 1); break;
      case 'rocks': R(K, sx - 1, y - 2, 5, 4); R('#94b0c2', sx, y - 1, 3, 2); break;
      case 'reeds': R('#257179', sx, y - 5, 1, 7); R('#ab5236', sx, y - 6, 1, 2); R('#257179', sx + 2, y - 3, 1, 5); break;
      case 'logs': R('#5d275d', sx - 2, y - 1, 6, 3); R('#ffe4c4', sx + 3, y - 1, 1, 3); break;
      case 'stars': R('#ffcd75', sx, y - 3, 1, 3); R('#ffcd75', sx - 1, y - 2, 3, 1); break;
      case 'crystals': R(K, sx - 1, y - 5, 4, 7); R('#b06fd0', sx, y - 4, 2, 6); R('#f4a3c8', sx, y - 4, 1, 2); break;
      case 'bubbles': R('#73eff7', sx, y - 6 - Math.round(hash(k) * 10), 2, 2); R('#c7f0ff', sx, y - 6 - Math.round(hash(k) * 10), 1, 1); break;
      case 'books': R(K, sx - 1, y - 1, 6, 3); R(c, sx, y, 4, 1); break;
      default: R(theme.grass[0] === '#38b764' ? '#257179' : theme.grass[1], sx, y, 1, 3); R(c, sx - 1, y - 1, 3, 1); R(c, sx, y - 2, 1, 3);
    }
  }

  /* ===== Sprite ===== */
  const PIX = {lendir: 'lendir', lendirAir: 'lendirAir', lendirBunga: 'lendirBunga', rajaLendir: 'rajaLendir'};
  const imgs = {};
  /** Kanvas/gambar untuk sebuah sumber: {pix: nama} atau {url: dataURL sprite lama, size: piksel asli}. */
  function source(src) {
    if (src.draw) return {img: src.draw(src.frame || 'idle')};                      // mis. pahlawan (hero.js)
    if (src.pix) return {img: MQ.Pix.sprite(src.pix, src.frame || ''), scale: 1};
    let im = imgs[src.url];
    if (!im) { im = imgs[src.url] = new Image(); im.src = src.url; }
    return im.complete && im.naturalWidth ? {img: im, w: src.size * src.mul, h: src.size * src.mul} : null;
  }
  /** Gambar sprite; hide = hitung posisinya saja (kedip saat terkena). Mengembalikan kotaknya di layar. */
  function drawSprite(src, x, opt = {}, hide = false) {
    const s = source(src);
    if (!s) return null;
    const sc = opt.scale || 1;
    const w = Math.round((s.w || s.img.width) * sc), h = Math.round((s.h || s.img.height) * sc);
    const sx = Math.round(x - camX + (opt.dx || 0)), sy = Math.round(GY + 4 - h + (opt.dy || 0));
    if (hide) return {sx, sy, w, h};
    ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    R('#0003', sx + 3, GY + 3, Math.max(4, w - 6), 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s.img, sx, sy, w, h);
    ctx.globalAlpha = 1;
    return {sx, sy, w, h};
  }

  /* ===== Keadaan ===== */
  const hero = {x: 0, src: null, act: null, actT: 0, walkT: 0, target: null, onArrive: null};
  // mons[0] = monster depan, mons[1] = monster kedua (di belakang, sedikit lebih tinggi). target = yang ditandai ▼.
  let mons = [null, null], target = 0, slashT = 0, slashCrit = false, slashSlot = 0, parts = [];
  const pair = () => !!(mons[0] && mons[0].alive && mons[1] && mons[1].alive);
  const STEP = 150; // jarak antar titik

  /** Mulai tempat baru. stops = jenis tiap titik ('', 'mini', 'boss'), kosong = tanpa jalur (Arena/Ujian). */
  function setup(id, stops) {
    placeId = id; theme = THEMES[id] || THEMES.padang;
    markers = (stops || []).map((type, i) => ({x: 110 + i * STEP, type}));
    hero.x = markers.length ? 10 : 30; hero.target = null; hero.act = null; mons = [null, null]; target = 0; parts = []; camX = 0;
    resize(true);
  }
  const fightX = i => (markers.length ? markers[i].x - 30 : 30);
  /** Pahlawan berjalan ke titik i, lalu cb(). Tanpa jalur: langsung. */
  function walkTo(i, cb) {
    if (!markers.length) { hero.x = fightX(0); return cb && cb(); }
    hero.target = fightX(i); hero.onArrive = cb;
  }
  /** Munculkan monster di titik i. slot 0 = depan, 1 = monster kedua (di belakang). */
  function setMonster(src, i, opt = {}, slot = 0) {
    const x = (markers.length ? markers[i].x : 30 + 30) + 6 + (slot ? 16 : 0);
    mons[slot] = {src, x, dy: slot ? -9 : 0, act: null, actT: 0, alive: true, deadT: 0, pop: 0.3, scale: (opt.scale || 1) * (slot ? 0.9 : 1)};
    if (!slot) mons[1] = null;
  }
  function setTarget(slot) { target = slot; }
  /** who = 'hero' atau 'mon' (slot = monster ke berapa, bawaan = sasaran). */
  function act(who, name, dur, slot = target) { const w = who === 'hero' ? hero : mons[slot]; if (w) { w.act = name; w.actT = dur; } }
  function defeat(slot = target) {
    const m = mons[slot];
    if (!m) return;
    m.alive = false; m.deadT = 0.8;
    for (let i = 0; i < 16; i++) {
      const a = Math.PI * 2 * i / 16;
      parts.push({x: m.x + 12, y: GY - 10 + m.dy, vx: Math.cos(a) * (20 + Math.random() * 25), vy: Math.sin(a) * (20 + Math.random() * 25) - 10,
                  life: 0.6 + Math.random() * 0.3, c: ['#f4f4f4', '#a7f070', '#ffcd75'][i % 3]});
    }
  }
  function slash(crit, slot = target) { slashT = 0.3; slashCrit = crit; slashSlot = slot; }
  /** Monster mana yang diketuk (klik di kanvas)? -1 = bukan monster. */
  function hitTest(clientX, clientY) {
    const r = cv.getBoundingClientRect(), wx = (clientX - r.left) / r.width * VW + camX, wy = (clientY - r.top) / r.height * VH;
    let best = -1;
    mons.forEach((m, i) => { if (m && m.alive && wx >= m.x - 2 && wx <= m.x + 40 && wy >= GY - 44 + m.dy && wy <= GY + 6) best = best < 0 || i === 0 ? i : best; });
    return best;
  }
  const walking = () => hero.target != null;

  /* ===== Putaran gambar (hanya saat layar pertarungan tampil) ===== */
  let last = 0;
  function frame(tms) {
    requestAnimationFrame(frame);
    if (!running || !theme) { last = 0; return; }
    const t = tms / 1000, dt = last ? Math.min(0.05, t - last) : 0;
    last = t;
    if (hero.target != null) {
      hero.x = Math.min(hero.target, hero.x + 42 * dt);
      hero.walkT += dt;
      if (hero.x >= hero.target) { hero.target = null; const cb = hero.onArrive; hero.onArrive = null; if (cb) cb(); }
    }
    camX += ((hero.x - VW * (pair() ? 0.04 : 0.12)) - camX) * Math.min(1, dt * 4); // dua monster: kamera sedikit ke kanan
    camX = Math.max(0, camX);
    [hero, mons[0], mons[1]].forEach(w => { if (w && w.actT > 0) { w.actT -= dt; if (w.actT <= 0) w.act = null; } });

    drawBackground(t);
    [1, 0].forEach(i => { // monster kedua digambar dulu (di belakang)
      const mon = mons[i];
      if (!mon) return;
      if (mon.alive) {
        mon.pop = Math.max(0, mon.pop - dt);
        const bob = Math.floor(t * 2 + i) % 2, shake = mon.act === 'hit' ? (Math.floor(t * 30) % 2 ? 2 : -2) : 0;
        const lunge = mon.act === 'atk' ? -Math.sin((1 - mon.actT / 0.45) * Math.PI) * 14 : 0;
        const box = drawSprite(mon.src, mon.x, {dx: shake + lunge, dy: mon.dy - bob, scale: mon.scale * (1 - mon.pop / 0.3 * 0.6)}, mon.act === 'hit' && Math.floor(t * 20) % 3 === 0);
        if (box) mon.box = box;
        if (pair() && i === target && mon.box && Math.floor(t * 3) % 2) { // tanda sasaran ▼ di atas kepala
          const ax = Math.round(mon.box.sx + mon.box.w / 2 - 3), ay = mon.box.sy - 8;
          R(K, ax - 1, ay - 1, 9, 6); R('#ffcd75', ax, ay, 7, 2); R('#ffcd75', ax + 1, ay + 2, 5, 1); R('#ffcd75', ax + 2, ay + 3, 3, 1); R('#ffcd75', ax + 3, ay + 4, 1, 1);
        }
      } else if (mon.deadT > 0) {
        mon.deadT -= dt;
        const k = Math.max(0.05, mon.deadT / 0.8);
        drawSprite(mon.src, mon.x + 12 * (1 - k), {scale: mon.scale * k, alpha: k, dy: mon.dy});
      }
    });
    if (hero.src) {
      const walk = hero.target != null, frm = hero.act === 'atk' ? 'atk' : hero.act === 'hurt' ? 'hurt' : walk ? (Math.floor(hero.walkT * 7) % 2 ? 'walk1' : 'walk2') : 'idle';
      const dash = hero.act === 'atk' ? Math.sin((1 - hero.actT / 0.35) * Math.PI) * 10 : 0;
      const animated = hero.src.pix || hero.src.draw; // gambar baru punya langkah kaki sendiri
      const bob = walk && !animated ? -(Math.floor(hero.walkT * 7) % 2) : !walk && !hero.act ? -(Math.floor(t * 1.5) % 2) : 0;
      if (!(hero.act === 'hurt' && Math.floor(t * 16) % 2)) drawSprite(Object.assign({}, hero.src, {frame: frm}), hero.x, {dx: dash, dy: bob});
    }
    drawFront(t);
    const sm = mons[slashSlot];
    if (slashT > 0 && sm) {
      slashT -= dt;
      const k = 1 - slashT / 0.3, cx = sm.x - camX + 14, cy = GY - 12 + sm.dy;
      for (let a = -1.2; a < -1.2 + 2.4 * k; a += 0.08) R(slashCrit ? '#ffcd75' : '#f4f4f4', cx + Math.cos(a) * (slashCrit ? 15 : 12), cy + Math.sin(a) * (slashCrit ? 15 : 12), 2, 2);
    }
    parts = parts.filter(p => (p.life -= dt) > 0);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; R(p.c, p.x - camX, p.y, 2, 2); });
  }
  requestAnimationFrame(frame);

  return {
    setup, walkTo, setMonster, setTarget, hitTest, act, defeat, slash, walking, PIX, THEMES,
    setHero(src) { hero.src = src; },
    start() { running = true; resize(true); },
    stop() { running = false; }
  };
})();
