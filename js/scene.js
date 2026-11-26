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
  const cv = $('scene');
  let ctx = cv.getContext('2d'); // bisa dipinjam renderBg() untuk melukis latar cutscene
  let VW = 120, VH = 100, GY = 83, camX = 0, theme = null, markers = [], running = false, placeId = '';

  /* ===== Tema tempat ===== */
  const T = (o) => Object.assign({
    sky: ['#4fb8f0', '#62c6f4', '#78d4f6', '#92e2f7', '#b4eef6'], sun: '#ffe08a', clouds: true, stars: false,
    far: ['#7fcfa0', '#a6e3b8'], mid: ['#4fbf6e', '#7fdc84'], tree: ['#257179', '#38b764', '#5d275d'], trees: 0.65, treeShape: 'round',
    grass: ['#38b764', '#a7f070'], path: ['#d4a373', '#e8c49a', '#ab5236'], deco: 'flowers', sign: '#d4a373'
  }, o);
  const THEMES = {
    padang: T({}),
    // latar cutscene: desa siang & malam (rumah-rumah di backgrounds.js)
    desa: T({trees: 0.35}),
    malam: T({sky: ['#1a1c2c', '#222a44', '#29366f', '#333c57', '#3b4a73'], sun: '#f4f4f4', clouds: false, stars: true, far: ['#29366f', '#3b5dc9'],
              mid: ['#257179', '#38b764'], tree: ['#1a1c2c', '#257179', '#1a1c2c'], trees: 0.35, grass: ['#257179', '#38b764'], path: ['#566c86', '#94b0c2', '#333c57']}),
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
  let freeTop = 0, freeBot = 0; // batas atas & bawah ruang kosong (atas kotak soal), CSS px dari atas arena
  /* Dunia penuh layar: arena menutupi seluruh layar pertarungan, HUD di atas & kotak soal di bawah melayang di atasnya.
     Ruang kosong di antaranya diukur; tanah diletakkan tepat di atas kotak soal, tokoh sebesar mungkin di ruang itu:
     muat tingginya (papan nama monster ±52px + monster terbesar ±62 piksel dunia) dan lebarnya (pahlawan + monster ±92 piksel dunia).
     Skala dihitung dalam piksel layar asli (devicePixelRatio) supaya tetap tajam walau bukan bilangan bulat (iPad). */
  function resize(fresh) {
    const a = $('arena');
    if (!a.clientHeight) return;
    if (fresh) {
      const ar = a.getBoundingClientRect(), q = $('qa') || $('question'), hud = document.querySelector('#scr-battle .hud'), md = $('modes');
      let top = 0, bot = a.clientHeight;
      if (q && q.offsetHeight && hud) {
        top = Math.max(hud.getBoundingClientRect().bottom, md && md.offsetHeight ? md.getBoundingClientRect().bottom : 0) - ar.top;
        bot = q.getBoundingClientRect().top - ar.top;
      }
      if (bot - top < 140) { top = 0; bot = a.clientHeight; }
      a.style.setProperty('--freeTop', Math.round(top) + 'px');
      a.style.setProperty('--freeBot', Math.round(a.clientHeight - bot) + 'px');
      freeTop = top; freeBot = bot;
      const dpr = window.devicePixelRatio || 1, byH = (bot - top - 56) / 62, byW = a.clientWidth / 76; // papan nama musuh kini di samping HUD (bukan di ruang dunia)
      sc = Math.max(2, Math.min(7, Math.floor(Math.min(byH, byW) * dpr) / dpr));
    }
    VW = Math.max(60, Math.round(a.clientWidth / sc)); VH = Math.max(70, Math.round(a.clientHeight / sc));
    if (cv.width !== VW || cv.height !== VH) { cv.width = VW; cv.height = VH; }
    GYt = freeBot ? groundFor(freeBot) : VH - 17;
    if (fresh) GY = GYt;
  }
  /** Garis tanah (piksel dunia) untuk batas bawah ruang kosong bot (CSS px), tidak lebih tinggi dari papan nama + tinggi monster. */
  const groundFor = bot => Math.max(Math.round((freeTop + 56) / sc) + 40, Math.min(VH - 8, Math.round(bot / sc) - 5));
  let GYt = 0;
  /** Kotak soal berubah tinggi (soal cerita / gambar / petunjuk): tanah & tokoh ikut naik-turun perlahan, tidak tertutup. */
  function refit() {
    const a = $('arena'), q = $('qa') || $('question');
    if (!freeBot || !a.clientHeight || !q.offsetHeight) return;
    const bot = q.getBoundingClientRect().top - a.getBoundingClientRect().top;
    if (Math.abs(bot - freeBot) < 2) return;
    freeBot = bot; a.style.setProperty('--freeBot', Math.round(a.clientHeight - bot) + 'px');
    GYt = groundFor(bot);
  }
  addEventListener('resize', () => resize(true));
  if (window.ResizeObserver) { new ResizeObserver(() => resize(false)).observe($('arena')); new ResizeObserver(() => refit()).observe($('qa') || $('question')); }

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
    const st = Math.round(freeTop / sc);
    if (theme.sun && placeId !== 'menara') { circle(VW - 18, st + 11, 7, theme.stars ? '#c7d3de' : '#fff3b0'); circle(VW - 18, st + 11, 5, theme.sun); }
    const SA = MQ.SkyArt;
    if (theme.clouds && !(SA && SA.hasBack(placeId))) for (let i = 0; i < 4; i++) {
      const span = VW + 70, x = ((hash(i + 1) * span - camX * 0.08 - t * (2 + i)) % span + span) % span - 35, y = 4 + hash(i + 9) * Math.max(4, GY - 50);
      circle(x, y + 3, 5, '#f4f4f4'); circle(x + 7, y, 6, '#f4f4f4'); circle(x + 15, y + 3, 5, '#f4f4f4'); R('#d6f1fa', x - 4, y + 7, 24, 2);
    }
    // Lapisan khusus tempat (backgrounds.js): sky2 setelah langit, far menggantikan bukit jauh,
    // mid menggantikan/menambah lapisan tengah, floor menggantikan tanah, front digambar di depan tokoh.
    const B = (MQ.Backdrops || {})[placeId] || {}, Hp = helpers(t);
    if (B.sky2) B.sky2(Hp);
    if (SA) SA.back(placeId, Hp); // langit lebih kaya (skyart.js)
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
    if (SA) SA.over(placeId, Hp);
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
    return {R, circle, hash, K, t, VW, VH, GY, camX, theme, ST: Math.round(freeTop / sc), // ST = baris dunia teratas yang terlihat (di bawah HUD)
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
  /** Gambar sprite; hide = hitung posisinya saja. opt: dx, dy, scale, sx/sy (pengali lebar/tinggi untuk pegas),
      alpha, tint (warna siluet: putih saat terkena, merah saat terluka) & tintA (kekuatan). Mengembalikan kotaknya di layar. */
  const tints = new Map();
  function tinted(img, color) {
    let m = tints.get(img);
    if (!m) tints.set(img, m = {});
    if (!m[color]) {
      const c = document.createElement('canvas'); c.width = img.width || img.naturalWidth; c.height = img.height || img.naturalHeight;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, c.width, c.height);
      x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
      m[color] = c;
    }
    return m[color];
  }
  function drawSprite(src, x, opt = {}, hide = false) {
    const s = source(src);
    if (!s) return null;
    const sc = opt.scale || 1;
    const w = Math.round((s.w || s.img.width) * sc * (opt.sx || 1)), h = Math.round((s.h || s.img.height) * sc * (opt.sy || 1));
    const baseW = Math.round((s.w || s.img.width) * sc);
    const sx = Math.round(x - camX + (opt.dx || 0) - (w - baseW) / 2), sy = Math.round(GY + 4 - h + (opt.dy || 0));
    if (hide) return {sx, sy, w, h};
    ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    if (!opt.noShadow) R('#0003', sx + 3, GY + 3, Math.max(4, w - 6), 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(s.img, sx, sy, w, h);
    if (opt.tint && opt.tintA > 0) { ctx.globalAlpha = Math.min(1, opt.tintA) * (opt.alpha == null ? 1 : opt.alpha); ctx.drawImage(tinted(s.img, opt.tint), sx, sy, w, h); }
    ctx.globalAlpha = 1;
    return {sx, sy, w, h};
  }

  /* ===== Keadaan ===== */
  const hero = {x: 0, src: null, act: null, actT: 0, walkT: 0, target: null, onArrive: null,
                strike: null, kb: 0, hurtT: 0, pendingHurt: 0, cheer: 0};
  // mons[0] = monster depan, mons[1] = monster kedua (di belakang, sedikit lebih tinggi). target = yang ditandai ▼.
  let mons = [null, null], target = 0, parts = [], fxs = [];
  let shakeT = 0, shakeA = 0, freeze = 0, flashA = 0, flashC = '#f4f4f4';
  const pair = () => !!(mons[0] && mons[0].alive && mons[1] && mons[1].alive);
  const STEP = 150; // jarak antar titik
  const ease = k => 1 - Math.pow(1 - k, 3);

  /** Mulai tempat baru. stops = jenis tiap titik ('', 'mini', 'boss'), kosong = tanpa jalur (Arena/Ujian). */
  function setup(id, stops) {
    placeId = id; theme = THEMES[id] || THEMES.padang;
    markers = (stops || []).map((type, i) => ({x: 110 + i * STEP, type}));
    hero.x = markers.length ? 10 : 30; hero.target = null; hero.act = null; hero.strike = null; hero.kb = 0; hero.hurtT = 0; hero.pendingHurt = 0;
    mons = [null, null]; target = 0; parts = []; fxs = []; coinParts = []; camX = 0; shakeT = 0; flashA = 0;
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
    const x = (markers.length ? markers[i].x : 30 + 30) + 6 + (slot ? 12 : 0);
    mons[slot] = {src, x, dy: slot ? -9 : 0, act: null, actT: 0, alive: true, deadT: 0, pop: 0.35, scale: (opt.scale || 1) * (slot ? 0.9 : 1),
                  kb: 0, hitT: 0, flashT: 0, charge: 0, landed: false};
    if (!slot) mons[1] = null;
  }
  function setTarget(slot) { target = slot; }
  /** Bar serangan musuh (0..1) dari battle.js: monster bersiap (ancang-ancang) saat hampir penuh. */
  function charge(slot, k) { if (mons[slot]) mons[slot].charge = k; }
  /** who = 'hero' atau 'mon' (slot = monster ke berapa, bawaan = sasaran). */
  function act(who, name, dur, slot = target) {
    if (who === 'hero') {
      // terluka karena serangan monster: tunggu sampai terjangan monster mengenai
      if (name === 'hurt' && mons.some(m => m && m.act === 'atk')) { hero.pendingHurt = 0.2; return; }
      if (name === 'hurt') return hurtHero();
      if (name === 'atk' && hero.strike) return; // serangan diatur slash()
      hero.act = name; hero.actT = dur;
      return;
    }
    const m = mons[slot];
    if (!m || name === 'hit') return; // 'hit' terjadi saat pukulan pahlawan mengenai (lihat strike)
    m.act = name; m.actT = dur; m.actDur = dur; m.charge = 0;
  }
  function hurtHero() {
    hero.hurtT = 0.6; hero.kb = -7; shake(2.5, 0.25); flash('#e43b44', 0.22);
    burst(hero.x + 14, GY - 12, 8, ['#e43b44', '#f68aa5', '#f4f4f4'], 30);
  }
  function shake(a, t) { shakeA = Math.max(shakeA, a); shakeT = Math.max(shakeT, t); }
  function flash(c, a) { flashC = c; flashA = Math.max(flashA, a); }
  function burst(x, y, n, cols, speed = 40, grav = 60) {
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * (i + Math.random() * 0.5) / n, v = speed * (0.5 + Math.random() * 0.7);
      parts.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3, life: 0.35 + Math.random() * 0.35, c: cols[i % cols.length], g: grav, s: Math.random() < 0.3 ? 2 : 1});
    }
  }
  function defeat(slot = target) {
    const m = mons[slot];
    if (!m) return;
    m.alive = false; m.deadT = 0.75; m.flashT = 0.75;
    const box = m.box || {sx: m.x - camX, sy: GY - 20, w: 24, h: 24}, cx = box.sx + camX + box.w / 2, cy = box.sy + box.h / 2;
    setTimeout(() => { // pecah jadi bintang & cahaya setelah berkedip putih
      burst(cx, cy, 22, ['#f4f4f4', '#a7f070', '#ffcd75', '#73eff7'], 55, 40);
      fxs.push({k: 'ring', x: cx, y: cy, t: 0, d: 0.4, c: '#fff3b0'});
      shake(2, 0.2);
    }, 260);
    if (!mons.some(o => o && o.alive)) hero.cheer = 0.9; // pahlawan melompat senang
  }
  /** Serangan pahlawan: ancang-ancang → menerjang → MENGENAI (efek) → kembali. fast = KILAT. */
  function slash(crit, slot = target, fast = false) {
    hero.strike = {t: 0, slot, crit, fast, hit: false};
    hero.act = null;
  }
  /** Saat senjata mengenai monster: kilat putih, mundur, percikan, getar, jeda sesaat (hit-stop). */
  function impact(s) {
    const m = mons[s.slot];
    if (!m) return;
    m.hitT = 0.4; m.flashT = 0.1; m.kb = s.crit ? 9 : 5; m.act = null; m.charge = 0;
    const box = m.box || {sx: m.x - camX, sy: GY - 20, w: 24, h: 24}, cx = box.sx + camX + box.w * 0.4, cy = box.sy + box.h * 0.5;
    const cols = s.fast ? ['#73eff7', '#f4f4f4', '#41a6f6'] : s.crit ? ['#ffcd75', '#f4f4f4', '#ef7d57'] : ['#f4f4f4', '#ffcd75'];
    burst(cx, cy, s.crit ? 16 : 9, cols, s.crit ? 60 : 42, 30);
    fxs.push({k: 'star', x: cx, y: cy, t: 0, d: s.crit ? 0.22 : 0.15, c: s.fast ? '#73eff7' : s.crit ? '#ffcd75' : '#f4f4f4', big: s.crit});
    fxs.push({k: 'slash', x: cx, y: cy, t: 0, d: 0.25, c: cols[0], crit: s.crit});
    if (s.crit) fxs.push({k: 'slash', x: cx, y: cy, t: -0.06, d: 0.25, c: '#f4f4f4', crit: true, flip: true});
    if (s.fast) fxs.push({k: 'bolt', x: cx, y: cy, t: 0, d: 0.3, seed: Math.random() * 99});
    freeze = s.crit ? 0.11 : 0.06;
    shake(s.crit ? 4 : 2, s.crit ? 0.3 : 0.18);
    if (s.crit) flash(s.fast ? '#73eff7' : '#fff3b0', 0.35);
  }
  /** Koin melompat keluar dari monster, memantul sebentar, lalu terbang ke pojok kanan atas (dompet). */
  function coins(n, slot = target) {
    const m = mons[slot], box = (m && m.box) || {sx: VW * 0.6, sy: GY - 20, w: 20, h: 20};
    for (let i = 0; i < n; i++) coinParts.push({x: box.sx + camX + box.w / 2, y: box.sy + box.h / 2, vx: (Math.random() - 0.3) * 50, vy: -50 - Math.random() * 40,
                                             t: -i * 0.05, home: 0.55 + i * 0.06});
  }
  let coinParts = [];
  function drawCoins(dt, t) {
    coinParts = coinParts.filter(c => {
      c.t += dt;
      if (c.t < 0) return true;
      let x = c.x - camX, y = c.y;
      if (c.t < c.home) { c.x += c.vx * dt; c.vy += 160 * dt; c.y += c.vy * dt; if (c.y > GY) { c.y = GY; c.vy *= -0.45; } x = c.x - camX; y = c.y; }
      else { // terbang ke dompet
        const k = Math.min(1, (c.t - c.home) / 0.35), sx = c.x - camX, tx = VW - 8, ty = Math.round(freeTop / sc) + 6;
        x = sx + (tx - sx) * k * k; y = c.y + (ty - c.y) * k - Math.sin(k * Math.PI) * 10;
        if (k >= 1) { burst(tx + camX, ty, 3, ['#fff3b0', '#ffcd75'], 20, 0); return false; }
      }
      const f = Math.floor(t * 10 + c.home * 10) % 4, w = [4, 3, 1, 3][f]; // koin berputar
      R(K, x - w / 2 - 1, y - 3, w + 2, 6); R('#ffcd75', x - w / 2, y - 2, w, 4); if (w > 2) R('#fff3b0', x - w / 2, y - 2, 1, 2);
      return true;
    });
  }
  /** Papan nama & status musuh melayang tepat di atas kepala monsternya (mTop = sasaran, mTop2 = monster lain). */
  function placeTags() {
    const a = $('arena'), kx = a.clientWidth / VW, ky = a.clientHeight / VH;
    [[$('mTop'), mons[target]], [$('mTop2'), mons[1 - target]]].forEach(([el, m]) => {
      if (!el || !m || el.hidden) return;
      const src = source(m.src);
      if (!src) return;
      // jangkar tetap (tidak ikut bergoyang/menerjang): ukuran asli sprite di posisi berdirinya
      const w0 = (src.w || src.img.width) * m.scale, h0 = (src.h || src.img.height) * m.scale;
      const w = el.offsetWidth || 150, h = el.offsetHeight || 40;
      const cx = Math.max(w / 2 + 4, Math.min(a.clientWidth - w / 2 - 4, (m.x - camX + w0 / 2) * kx));
      const top = Math.max(freeTop + 2, (GY + 4 - h0 + m.dy) * ky - h - 10);
      el.style.left = Math.round(cx) + 'px'; el.style.top = Math.round(top) + 'px';
    });
  }
  /** Monster mana yang diketuk (klik di kanvas)? -1 = bukan monster. */
  function hitTest(clientX, clientY) {
    const r = cv.getBoundingClientRect(), wx = (clientX - r.left) / r.width * VW + camX, wy = (clientY - r.top) / r.height * VH;
    let best = -1;
    mons.forEach((m, i) => { if (m && m.alive && wx >= m.x - 2 && wx <= m.x + 40 && wy >= GY - 44 + m.dy && wy <= GY + 6) best = best < 0 || i === 0 ? i : best; });
    return best;
  }
  const walking = () => hero.target != null;

  /* ===== Efek (bintang benturan, tebasan, petir KILAT, cincin cahaya) ===== */
  function drawFx(dt) {
    fxs = fxs.filter(f => (f.t += dt) < f.d);
    fxs.forEach(f => {
      if (f.t < 0) return;
      const k = f.t / f.d, x = Math.round(f.x - camX), y = Math.round(f.y);
      if (f.k === 'star') { // bintang 4 sudut yang membesar lalu hilang
        const r = Math.round((f.big ? 10 : 6) * (k < 0.4 ? k / 0.4 : 1 - (k - 0.4) / 0.6 * 0.5));
        R(f.c, x - r, y, r * 2 + 1, 1); R(f.c, x, y - r, 1, r * 2 + 1);
        const d = Math.round(r * 0.5); R(f.c, x - d, y - d, d * 2 + 1, d * 2 + 1 > 2 ? 2 : 1); R('#f4f4f4', x - 1, y - 1, 3, 3);
      } else if (f.k === 'slash') { // tebasan melengkung
        const rad = f.crit ? 16 : 12, a0 = f.flip ? -2.4 : -0.9, span = 2.0 * Math.min(1, k * 2.2), fade = k > 0.5 ? 1 - (k - 0.5) * 2 : 1;
        ctx.globalAlpha = fade;
        for (let a = 0; a < span; a += 0.07) {
          const aa = f.flip ? a0 - a : a0 + a, th = (f.crit ? 3 : 2) * (1 - Math.abs(a - span / 2) / (span / 2 + 0.01) * 0.6);
          R(a > span - 0.25 ? '#f4f4f4' : f.c, x + Math.cos(aa) * rad - 4, y + Math.sin(aa) * rad, Math.max(1, Math.round(th)), Math.max(1, Math.round(th)));
        }
        ctx.globalAlpha = 1;
      } else if (f.k === 'bolt') { // petir dari atas (KILAT)
        if (Math.floor(f.t * 30) % 2) return;
        let bx = x + 6, by = 0;
        while (by < y) { const nx = bx + Math.round((hash(by + f.seed) - 0.5) * 8); R('#73eff7', Math.min(bx, nx), by, Math.abs(nx - bx) + 2, 2); R('#f4f4f4', nx, by, 1, 5); bx = nx; by += 5; }
      } else if (f.k === 'ring') { // cincin cahaya mengembang
        const r = 4 + k * 18; ctx.globalAlpha = 1 - k;
        for (let a = 0; a < Math.PI * 2; a += 0.25) R(f.c, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 2, 2);
        ctx.globalAlpha = 1;
      } else if (f.k === 'dust') {
        ctx.globalAlpha = 1 - k; R('#f4f4f4', x - 6 - k * 8, y, 3, 2); R('#f4f4f4', x + 6 + k * 8, y, 3, 2); ctx.globalAlpha = 1;
      }
    });
  }

  /* ===== Putaran gambar (hanya saat layar pertarungan tampil) ===== */
  let last = 0;
  function frame(tms) {
    requestAnimationFrame(frame);
    if (!running || !theme) { last = 0; return; }
    const t = tms / 1000, rdt = last ? Math.min(0.05, t - last) : 0;
    last = t;
    if (GYt && GY !== GYt) { GY += (GYt - GY) * Math.min(1, rdt * 8); if (Math.abs(GYt - GY) < 0.3) GY = GYt; }
    // jeda benturan (hit-stop): gerak tokoh berhenti sesaat, efek tetap berjalan
    let dt = rdt;
    if (freeze > 0) { freeze -= rdt; dt = 0; }
    if (hero.target != null) {
      hero.x = Math.min(hero.target, hero.x + 42 * dt);
      hero.walkT += dt;
      if (hero.x >= hero.target) { hero.target = null; const cb = hero.onArrive; hero.onArrive = null; if (cb) cb(); }
    }
    // kamera: saat berjalan mengikuti pahlawan; saat bertarung memusatkan pahlawan & monster
    let camT = hero.x - VW * 0.12;
    const fm = mons.filter(m => m && (m.alive || m.deadT > 0));
    if (hero.target == null && fm.length) camT = (hero.x + Math.max(...fm.map(m => m.x + 30))) / 2 - VW / 2;
    camX += (camT - camX) * Math.min(1, rdt * 4);
    camX = Math.max(0, camX);
    [hero, mons[0], mons[1]].forEach(w => { if (w && w.actT > 0) { w.actT -= dt; if (w.actT <= 0) w.act = null; } });
    if (hero.pendingHurt > 0 && (hero.pendingHurt -= dt) <= 0) hurtHero();
    hero.hurtT = Math.max(0, hero.hurtT - dt); hero.cheer = Math.max(0, hero.cheer - dt);
    hero.kb *= Math.pow(0.0005, dt);

    // getar layar (CSS, supaya latar ikut bergetar)
    if (shakeT > 0) {
      shakeT -= rdt;
      const a = shakeA * Math.max(0, shakeT) / 0.3 * sc;
      cv.style.transform = `translate(${Math.round((Math.random() - 0.5) * 2 * a)}px, ${Math.round((Math.random() - 0.5) * 2 * a)}px)`;
      if (shakeT <= 0) { cv.style.transform = ''; shakeA = 0; }
    }

    drawBackground(t);

    // ----- monster -----
    [1, 0].forEach(i => { // monster kedua digambar dulu (di belakang)
      const mon = mons[i];
      if (!mon) return;
      mon.kb *= Math.pow(0.002, dt); mon.hitT = Math.max(0, mon.hitT - dt); mon.flashT = Math.max(0, mon.flashT - rdt);
      if (mon.alive) {
        const wasPop = mon.pop > 0;
        mon.pop = Math.max(0, mon.pop - dt);
        if (wasPop && mon.pop === 0 && !mon.landed) { mon.landed = true; fxs.push({k: 'dust', x: mon.x + 12, y: GY + 2, t: 0, d: 0.35}); }
        // napas pegas: melebar-memendek bergantian
        const br = Math.sin(t * 3.2 + i * 1.7);
        let sx = 1 + br * 0.03, sy = 1 - br * 0.04, dx = mon.kb, dy = mon.dy, tint = null, tintA = 0;
        // ancang-ancang: bar serangan hampir penuh → mundur sedikit, gemetar, berkedip merah
        if (!mon.act && mon.charge > 0.75) {
          const c = (mon.charge - 0.75) / 0.25;
          dx += 3 * c + (Math.floor(t * 24) % 2 ? 0.6 : -0.6) * c; sx *= 1 + 0.06 * c; sy *= 1 - 0.08 * c;
          tint = '#e43b44'; tintA = (Math.floor(t * 8) % 2 ? 0.35 : 0.1) * c;
        }
        if (mon.act === 'atk') { // terjang ke pahlawan: menunduk → melompat memanjang → kembali
          const k = 1 - mon.actT / (mon.actDur || 0.45), reach = Math.max(10, mon.x - hero.x - 20);
          if (k < 0.3) { const q = k / 0.3; dx += 4 * q; sx *= 1 + 0.12 * q; sy *= 1 - 0.15 * q; }
          else if (k < 0.55) { const q = (k - 0.3) / 0.25; dx += 4 - (reach + 4) * ease(q); sx *= 1.18; sy *= 0.9; dy -= Math.sin(q * Math.PI) * 6; }
          else { const q = (k - 0.55) / 0.45; dx += -reach * (1 - ease(q)); sx *= 1 - 0.05 * (1 - q); }
        }
        if (mon.hitT > 0) { const q = mon.hitT / 0.4; sx *= 1 + 0.12 * q; sy *= 1 - 0.14 * q; dx += (Math.floor(t * 40) % 2 ? 1 : -1) * q * 1.5; }
        if (mon.flashT > 0) { tint = '#f4f4f4'; tintA = 1; }
        const pop = mon.pop > 0 ? 1 - mon.pop / 0.35 : 1, popS = pop < 1 ? 0.3 + 0.7 * ease(pop) + Math.sin(pop * Math.PI) * 0.15 : 1;
        const box = drawSprite(mon.src, mon.x, {dx, dy: dy - (pop < 1 ? Math.sin(pop * Math.PI) * 10 : 0), scale: mon.scale * popS, sx, sy, tint, tintA});
        if (box) mon.box = box;
        if (!mon.act && mon.charge > 0.85 && box && Math.floor(t * 6) % 2) { // tanda ! sebelum menyerang
          const ax = box.sx + box.w - 2, ay = box.sy - 6;
          R(K, ax - 1, ay - 1, 5, 9); R('#ffcd75', ax, ay, 3, 5); R('#ffcd75', ax, ay + 6, 3, 1);
        }
        if (pair() && i === target && mon.box && Math.floor(t * 3) % 2) { // tanda sasaran ▼ di atas kepala
          const ax = Math.round(mon.box.sx + mon.box.w / 2 - 3), ay = mon.box.sy - 8;
          R(K, ax - 1, ay - 1, 9, 6); R('#ffcd75', ax, ay, 7, 2); R('#ffcd75', ax + 1, ay + 2, 5, 1); R('#ffcd75', ax + 2, ay + 3, 3, 1); R('#ffcd75', ax + 3, ay + 4, 1, 1);
        }
      } else if (mon.deadT > 0) {
        mon.deadT -= rdt;
        // berkedip putih, menggembung, lalu pecah (partikel dari defeat())
        const k = mon.deadT / 0.75;
        if (k > 0.4) drawSprite(mon.src, mon.x, {dx: mon.kb, dy: mon.dy, scale: mon.scale * (1 + (1 - k) * 0.35), sx: 1 + (1 - k) * 0.2, sy: 1 - (1 - k) * 0.1,
                                                 tint: '#f4f4f4', tintA: Math.floor(mon.deadT * 20) % 2 ? 1 : 0.4, noShadow: true});
      }
    });

    // ----- pahlawan -----
    if (hero.src) {
      const walk = hero.target != null, s = hero.strike;
      let frm = walk ? (Math.floor(hero.walkT * 7) % 2 ? 'walk1' : 'walk2') : 'idle', dx = hero.kb, dy = 0, sx = 1, sy = 1;
      if (s) { // ancang-ancang 0–0.12 → terjang 0.12–0.24 → kena → tahan → kembali (total 0.55 detik)
        s.t += dt;
        const m = mons[s.slot], reach = m ? Math.max(8, m.x - hero.x - 18) : 10;
        if (s.t < 0.12) { const q = s.t / 0.12; dx -= 3 * q; sx = 1 + 0.08 * q; sy = 1 - 0.1 * q; }
        else if (s.t < 0.24) {
          const q = (s.t - 0.12) / 0.12; dx += -3 + (reach + 3) * ease(q); frm = 'atk'; sx = 1.12; sy = 0.92;
          if (Math.floor(s.t * 60) % 2 === 0) parts.push({x: hero.x + dx + 6, y: GY - 8 - Math.random() * 10, vx: -20, vy: 0, life: 0.15, c: '#f4f4f4', g: 0, s: 1}); // garis kecepatan
        } else if (s.t < 0.36) { dx += reach; frm = 'atk'; if (!s.hit) { s.hit = true; impact(s); } }
        else if (s.t < 0.55) { const q = (s.t - 0.36) / 0.19; dx += reach * (1 - ease(q)); }
        else hero.strike = null;
        // jejak tebasan senjata di depan pahlawan saat terjang & kena
        if (s.t > 0.16 && s.t < 0.36) {
          const ax = Math.round(hero.x - camX + dx + 22), ay = GY - 14, prog = Math.min(1, (s.t - 0.16) / 0.14);
          const col = s.fast ? '#73eff7' : s.crit ? '#ffcd75' : '#f4f4f4';
          ctx.globalAlpha = 0.8;
          for (let a = -1.6; a < -1.6 + 2.6 * prog; a += 0.12) R(col, ax + Math.cos(a) * 10, ay + Math.sin(a) * 11, 2, 2);
          ctx.globalAlpha = 1;
        }
      } else if (hero.act === 'atk') { frm = 'atk'; dx += Math.sin((1 - hero.actT / 0.35) * Math.PI) * 10; }
      if (hero.hurtT > 0) { frm = 'hurt'; const q = hero.hurtT / 0.6; sx = 1 - 0.08 * q; sy = 1 + 0.04 * q; }
      if (hero.cheer > 0 && !s) { frm = 'happy'; dy -= Math.abs(Math.sin((0.9 - hero.cheer) / 0.45 * Math.PI)) * 7; }
      else if (!walk && !s && !hero.hurtT && !hero.act) { const br = Math.sin(t * 2.4); sy = 1 + br * 0.03; sx = 1 - br * 0.02; } // bernapas
      drawSprite(Object.assign({}, hero.src, {frame: frm}), hero.x, {dx, dy, sx, sy,
        tint: hero.hurtT > 0.3 ? '#e43b44' : null, tintA: hero.hurtT > 0.3 && Math.floor(t * 16) % 2 ? 0.7 : 0});
    }
    // Kiki (teman) terbang di belakang pahlawan, sesuai tahap pertumbuhannya
    if (hero.src && MQ.Kiki && MQ.Pix.has('kiki1')) {
      const kx = hero.x + 2 + Math.sin(t * 1.3) * 4, ky = -34 - Math.abs(Math.sin(t * 2.6)) * 4 + (hero.strike ? -6 : 0); // melayang di atas kepala pahlawan
      drawSprite({pix: 'kiki' + (MQ.Kiki.stage() + 1)}, kx, {dy: ky, scale: 0.62, noShadow: true});
    }
    drawFront(t);
    placeTags();
    drawFx(rdt);
    drawCoins(rdt, t);
    parts = parts.filter(p => (p.life -= rdt) > 0);
    parts.forEach(p => { p.x += p.vx * rdt; p.y += p.vy * rdt; p.vy += (p.g == null ? 60 : p.g) * rdt; R(p.c, p.x - camX, p.y, p.s || 2, p.s || 2); });
    if (flashA > 0) { ctx.globalAlpha = flashA; R(flashC, 0, 0, VW, VH); ctx.globalAlpha = 1; flashA = Math.max(0, flashA - rdt * 1.6); }
  }
  requestAnimationFrame(frame);

  /** Lukis latar sebuah tempat ke kanvas lain (cutscene): pinjam mesin latar pertarungan sebentar, lalu kembalikan.
      o.sc = skala piksel, o.ground = posisi tanah (0..1 dari atas), o.cam = geser kamera (paralaks pelan). */
  function renderBg(canvas, id, t, o = {}) {
    const keep = {ctx, VW, VH, GY, camX, theme, placeId, markers, freeTop, sc};
    try {
      const s = o.sc || 4, w = Math.max(40, Math.round(canvas.clientWidth / s)), h = Math.max(40, Math.round(canvas.clientHeight / s));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
      VW = w; VH = h; sc = s; GY = Math.round(h * (o.ground || 0.86)); camX = o.cam || 0; freeTop = (o.top || 0) * s;
      theme = THEMES[id] || THEMES.padang; placeId = id; markers = [];
      drawBackground(t); drawFront(t);
    } finally { ({ctx, VW, VH, GY, camX, theme, placeId, markers, freeTop, sc} = keep); }
  }

  return {
    renderBg,
    setup, walkTo, setMonster, setTarget, hitTest, act, defeat, slash, charge, coins, walking, PIX, THEMES,
    setHero(src) { hero.src = src; },
    start() { running = true; resize(true); },
    stop() { running = false; cv.style.transform = ''; }
  };
})();
