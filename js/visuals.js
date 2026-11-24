/* Math Quest — gambar untuk soal (string HTML/SVG buatan sendiri, aman dipasang via innerHTML).
   Semua bentuk memakai garis tepi gelap tebal agar senada dengan pixel art. */
'use strict';
window.MQ = window.MQ || {};

MQ.Vis = (() => {
  const K = '#1a1c2c';
  const svg = (vb, inner, cls = '') => `<svg class="${cls}" viewBox="${vb}" shape-rendering="crispEdges">${inner}</svg>`;

  /* ===== Menghitung benda: disusun 5 per baris (seperti "ten frame") ===== */
  function count(sprite, n) {
    const img = `<img class="cnt" src="${MQ.Sprites.url(sprite)}" alt="">`;
    let html = '';
    for (let i = 0; i < n; i += 5) html += `<div class="cntRow">${img.repeat(Math.min(5, n - i))}</div>`;
    return `<div class="cntBox">${html}</div>`;
  }

  /* ===== Bangun datar & ruang (viewBox 40×40) ===== */
  const st = `stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const SHAPES = {
    lingkaran:      {name: 'lingkaran', d: `<circle cx="20" cy="20" r="15" fill="#e43b44" ${st}/>`},
    segitiga:       {name: 'segitiga', d: `<polygon points="20,5 36,34 4,34" fill="#ffcd75" ${st}/>`},
    persegi:        {name: 'persegi', d: `<rect x="7" y="7" width="26" height="26" fill="#41a6f6" ${st}/>`},
    persegiPanjang: {name: 'persegi panjang', d: `<rect x="3" y="12" width="34" height="17" fill="#38b764" ${st}/>`},
    kubus:          {name: 'kubus', d: `<polygon points="6,14 26,14 26,34 6,34" fill="#41a6f6" ${st}/><polygon points="6,14 14,6 34,6 26,14" fill="#73eff7" ${st}/><polygon points="26,14 34,6 34,26 26,34" fill="#3b5dc9" ${st}/>`},
    bola:           {name: 'bola', d: `<circle cx="20" cy="20" r="15" fill="#ef7d57" ${st}/><path d="M5 20 Q20 28 35 20" fill="none" ${st}/><circle cx="14" cy="13" r="3" fill="#fff3b0"/>`},
    tabung:         {name: 'tabung', d: `<path d="M8 10 V30 A12 5 0 0 0 32 30 V10" fill="#b06fd0" ${st}/><ellipse cx="20" cy="10" rx="12" ry="5" fill="#d9a6f0" ${st}/>`},
    kerucut:        {name: 'kerucut', d: `<path d="M20 4 L33 31 A13 5 0 0 1 7 31 Z" fill="#ffcd75" ${st}/><path d="M7 31 A13 5 0 0 0 33 31" fill="none" ${st}/>`}
  };
  const st2 = `stroke="${K}" stroke-width="2" stroke-linejoin="round"`; // garis tipis untuk pensil
  const shape = id => svg('0 0 40 40', SHAPES[id].d, 'shape');

  /* ===== Token pola: warna × bentuk ===== */
  const COLORS = {merah: '#e43b44', biru: '#41a6f6', kuning: '#ffcd75', hijau: '#38b764'};
  function token(id) { // id contoh: "merah-lingkaran"
    const [c, s] = id.split('-'), f = COLORS[c];
    const d = s === 'lingkaran' ? `<circle cx="20" cy="20" r="14" fill="${f}" ${st}/>`
            : s === 'kotak' ? `<rect x="7" y="7" width="26" height="26" fill="${f}" ${st}/>`
            : `<polygon points="20,5 35,33 5,33" fill="${f}" ${st}/>`;
    return svg('0 0 40 40', d, 'token');
  }
  const patternRow = seq => `<div class="tokRow">${seq.map(token).join('')}<span class="tokQ">?</span></div>`;

  /* ===== Pensil (1 satuan = 10 unit lebar) ===== */
  function pencilShape(x, y, len) { // len dalam satuan kotak
    const w = len * 10;
    return `<rect x="${x}" y="${y}" width="5" height="8" fill="#f4a3c8" ${st2}/>` +
           `<rect x="${x + 5}" y="${y}" width="${w - 11}" height="8" fill="#ffcd75" ${st2}/>` +
           `<polygon points="${x + w - 6},${y} ${x + w},${y + 4} ${x + w - 6},${y + 8}" fill="#ffe4c4" ${st2}/>`;
  }
  /** Dua pensil berlabel A dan B. */
  function pencils(la, lb) {
    const txt = (t, y) => `<text x="2" y="${y}" font-size="11" font-weight="900" fill="#f4f4f4">${t}</text>`;
    return svg('0 0 120 40', txt('A', 13) + pencilShape(14, 4, la) + txt('B', 33) + pencilShape(14, 24, lb), 'wide');
  }
  /** Pensil di atas deretan kotak untuk diukur. */
  function ruler(len) {
    let boxes = '';
    for (let i = 0; i < 10; i++) boxes += `<rect x="${10 + i * 10}" y="18" width="10" height="10" fill="#29366f" stroke="#94b0c2" stroke-width="1"/>`;
    return svg('0 0 120 32', pencilShape(10, 5, len) + boxes, 'wide');
  }

  /* ===== Lidi: ikatan isi 10 + lidi lepas ===== */
  function lidi(tens, ones) {
    const ROW_W = 196, ROW_H = 42; // maks 5 ikat per baris agar tiap lidi tetap terlihat di HP
    let x = 4, y = 0, inner = '';
    const stick = sx => `<rect x="${sx}" y="${y + 4}" width="2" height="34" fill="#ffcd75"/>`; // celah 1 unit antar lidi
    const fit = w => { if (x + w > ROW_W) { x = 4; y += ROW_H; } };
    for (let t = 0; t < tens; t++) {
      fit(32);
      for (let i = 0; i < 10; i++) inner += stick(x + i * 3);
      inner += `<rect x="${x - 1}" y="${y + 18}" width="31" height="5" fill="#e43b44" stroke="${K}" stroke-width="1"/>`; // tali pengikat
      x += 38;
    }
    if (ones) { fit(ones * 7); for (let i = 0; i < ones; i++) { inner += stick(x); x += 7; } }
    return svg(`0 0 ${ROW_W} ${y + ROW_H}`, inner, 'lidi');
  }

  /* ===== Petunjuk bergambar (tampil setelah jawaban salah) ===== */
  const hintBox = (body, cap) => `<div class="hint">${body}<div class="hintCap">${cap}</div></div>`;
  const dot = (c, cls = '') => `<i class="dot ${cls}" style="background:${c}"></i>`;
  /** a + b: titik kuning lalu titik biru, total dihitung. */
  const hintAdd = (a, b, c) => hintBox(`<div class="dots">${dot('#ffcd75').repeat(a)}<b class="gap"></b>${dot('#73eff7').repeat(b)}</div>`,
    `${a} + ${b} → hitung semua: ${c}`);
  /** a − b: a titik, b titik terakhir dicoret. */
  const hintSub = (a, b, c) => hintBox(`<div class="dots">${dot('#ffcd75').repeat(a - b)}${dot('#566c86', 'x').repeat(b)}</div>`,
    `${a} dicoret ${b} → sisa ${c}`);
  /** Bandingkan dua bilangan kecil dengan dua baris titik. */
  const hintCompare = (a, b, sym) => hintBox(
    `<div class="dots">${dot('#ffcd75').repeat(a) || '<small>0</small>'}</div><div class="dots">${dot('#73eff7').repeat(b) || '<small>0</small>'}</div>`,
    `${a} ${sym} ${b}` + (sym === '=' ? ' (sama banyak)' : sym === '>' ? ` (${a} lebih banyak)` : ` (${a} lebih sedikit)`));
  /** Hitung benda satu per satu dengan nomor di bawahnya. */
  function hintCount(sprite, n) {
    const src = MQ.Sprites.url(sprite);
    let items = '';
    for (let i = 1; i <= n; i++) items += `<span class="numItem"><img src="${src}" alt=""><small>${i}</small></span>`;
    return hintBox(`<div class="dots">${items}</div>`, `Hitung satu per satu: ada ${n}`);
  }
  const hintTens = (t, o) => hintBox(`<div class="tensCap">${t} ikat = ${t * 10}<br>${o} lidi lepas = ${o}</div>`, `${t * 10} + ${o} = ${t * 10 + o}`);
  /** Garis bilangan kecil di sekitar n; jawaban disorot. */
  function hintLine(n, ans) {
    let cells = '';
    for (let v = n - 2; v <= n + 2; v++) if (v >= 0) cells += `<span class="nl${v === ans ? ' on' : ''}">${v}</span>`;
    return hintBox(`<div class="numLine">${cells}</div>`, `Urutan bilangan: ${ans} ada di situ`);
  }
  const hintRuler = n => hintBox(ruler(n), `Hitung kotak di bawah pensil: ${n}`);

  return {count, SHAPES, shape, COLORS, token, patternRow, pencils, ruler, lidi,
          hintAdd, hintSub, hintCompare, hintCount, hintTens, hintLine, hintRuler};
})();
