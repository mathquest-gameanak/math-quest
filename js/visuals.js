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

  /* ===== Soal cerita: wajah tokoh + gambar benda ===== */
  function story(who, sprite) {
    const face = MQ.Pix && MQ.Pix.has(who) ? `<img class="stFace" src="${MQ.Pix.url(who, 3)}" alt="">` : '';
    return `<div class="stView">${face}<img class="stItem" src="${MQ.Sprites.url(sprite)}" alt=""></div>`;
  }
  /** Model batang (bar model, cara Singapore Math). parts = [{n, label, c}], total = label di bawah. */
  function bar(parts, total) {
    const sum = parts.reduce((t, p) => t + p.n, 0) || 1, W = 180;
    let x = 10, inner = '';
    parts.forEach(p => {
      const w = Math.max(18, Math.round(p.n / sum * W));
      inner += `<rect x="${x}" y="4" width="${w}" height="20" fill="${p.c}" stroke="${K}" stroke-width="2"/>` +
               `<text x="${x + w / 2}" y="19" font-size="12" font-weight="900" text-anchor="middle" fill="${K}">${p.label}</text>`;
      x += w;
    });
    inner += `<path d="M10 30 V35 H${x} V30" fill="none" stroke="${K}" stroke-width="2"/>` +
             `<text x="${(10 + x) / 2}" y="50" font-size="13" font-weight="900" text-anchor="middle" fill="${K}">${total}</text>`;
    return svg(`0 0 ${x + 10} 56`, inner, 'wide');
  }
  /** Dua batang untuk membandingkan (selisih diberi garis putus-putus). */
  function bar2(a, b, la, lb, diff) {
    const u = 170 / Math.max(a, b), wa = Math.max(18, a * u), wb = Math.max(18, b * u);
    const row = (y, w, c, l, n) => `<text x="2" y="${y + 15}" font-size="10" font-weight="900" fill="${K}">${l}</text>` +
      `<rect x="44" y="${y}" width="${w}" height="20" fill="${c}" stroke="${K}" stroke-width="2"/>` +
      `<text x="${44 + w / 2}" y="${y + 15}" font-size="12" font-weight="900" text-anchor="middle" fill="${K}">${n}</text>`;
    const d = `<rect x="${44 + wb}" y="30" width="${Math.max(4, wa - wb)}" height="20" fill="none" stroke="#e43b44" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<text x="${44 + wb + (wa - wb) / 2}" y="45" font-size="12" font-weight="900" text-anchor="middle" fill="#e43b44">${diff}</text>`;
    return svg(`0 0 ${54 + Math.max(wa, wb)} 54`, row(4, wa, '#ffcd75', la, a) + row(30, wb, '#73eff7', lb, b) + d, 'wide');
  }

  /* ===== Pasangan bilangan (number bond): keseluruhan di atas, dua bagian di bawah ===== */
  function bond(whole, a, b) {
    const c = (x, y, v, top) => `<line x1="60" y1="18" x2="${x}" y2="${y}" stroke="#f4f4f4" stroke-width="3"/>` +
      `<circle cx="${x}" cy="${y}" r="15" fill="${v === '?' ? '#1a1c2c' : top ? '#ffcd75' : '#73eff7'}" stroke="${v === '?' ? '#ffcd75' : K}" stroke-width="3"/>` +
      `<text x="${x}" y="${y + 6}" font-size="17" font-weight="900" text-anchor="middle" fill="${v === '?' ? '#ffcd75' : K}">${v}</text>`;
    // garis dulu, lingkaran menutupinya
    return svg('0 0 120 76', c(26, 58, a) + c(94, 58, b) + c(60, 18, whole, true), 'bond');
  }
  /** Bingkai sepuluh (ten frame): n terisi, sisanya kosong. mark = kosongnya ditandai (petunjuk). */
  function tenFrame(n, mark) {
    let inner = '';
    for (let i = 0; i < 10; i++) {
      const x = 4 + (i % 5) * 22, y = 4 + Math.floor(i / 5) * 22;
      inner += `<rect x="${x}" y="${y}" width="22" height="22" fill="#29366f" stroke="#94b0c2" stroke-width="2"/>`;
      if (i < n) inner += `<circle cx="${x + 11}" cy="${y + 11}" r="7" fill="#ffcd75" stroke="${K}" stroke-width="2"/>`;
      else if (mark) inner += `<circle cx="${x + 11}" cy="${y + 11}" r="7" fill="none" stroke="#73eff7" stroke-width="2" stroke-dasharray="3 2"/>`;
    }
    return svg('0 0 118 52', inner, 'frame10');
  }
  const hintBond = (w, a, b) => hintBox(`<div class="dots">${dot('#ffcd75').repeat(a)}<b class="gap"></b>${dot('#73eff7').repeat(b)}</div>`,
    `${a} dan ${b} jadi ${w}`);
  const hintTen = n => hintBox(tenFrame(n, true), `${n} + ${10 - n} = 10 (hitung kotak kosong)`);
  /** Petunjuk deret: bilangan berurutan, jawaban disorot, keterangan langkahnya. */
  const hintSeq = (seq, ans, cap) => hintBox(`<div class="numLine">${seq.concat(ans).map((v, i) => `<span class="nl${i === seq.length ? ' on' : ''}">${v}</span>`).join('')}</div>`, cap);
  const hintNote = cap => hintBox('', cap);
  /** Kotak kembar: n kotak sama (isi ?), dibagi rata. */
  const hintEqual = (k, x) => hintBox(`<div class="dots">${Array.from({length: k}, () => dot('#ffcd75').repeat(x)).join('<b class="gap"></b>')}</div>`,
    `${k * x} dibagi rata ke ${k} kotak → tiap kotak ${x}`);
  const hintBar = (parts, total, cap) => hintBox(bar(parts, total), cap);
  const hintBar2 = (a, b, la, lb, cap) => hintBox(bar2(a, b, la, lb, a - b), cap);


  /* ===== Tambahan 2026-11-26: materi sesuai buku Kelas 1 (Kurikulum Merdeka) + strategi ala Singapura ===== */
  /** Antrean monster menghadap bendera (bilangan urutan). ids = id gambar MQ.Pix, nums = tampilkan nomor (petunjuk). */
  function queue(ids, nums) {
    return `<div class="queue"><span class="qFlag">🚩</span>${ids.map((id, i) =>
      `<span class="qItem"><img src="${MQ.Pix.url(id, 2)}" alt="">${nums ? `<small>${i + 1}</small>` : ''}</span>`).join('')}</div>`;
  }
  /** k kelompok, tiap kelompok n titik (penjumlahan berulang). */
  function groups(k, n) {
    const W = 6 + Math.min(n, 5) * 9, H = n > 5 ? 26 : 16;
    let inner = '';
    for (let g = 0; g < k; g++) {
      const gx = 2 + g * (W + 6);
      inner += `<rect x="${gx}" y="2" width="${W}" height="${H + 4}" rx="5" fill="#29366f" stroke="#94b0c2" stroke-width="2"/>`;
      for (let i = 0; i < n; i++) inner += `<circle cx="${gx + 7 + (i % 5) * 9}" cy="${11 + Math.floor(i / 5) * 10}" r="3.5" fill="#ffcd75" stroke="${K}" stroke-width="1.5"/>`;
    }
    return svg(`0 0 ${4 + k * (W + 6)} ${H + 8}`, inner, 'wide groups');
  }
  /** Bingkai sepuluh dua warna: y kuning lalu b biru (strategi "buat 10"). */
  function frameMix(y, b = 0) {
    let inner = '';
    for (let i = 0; i < 10; i++) {
      const x = 4 + (i % 5) * 22, yy = 4 + Math.floor(i / 5) * 22;
      inner += `<rect x="${x}" y="${yy}" width="22" height="22" fill="#29366f" stroke="#94b0c2" stroke-width="2"/>`;
      if (i < y + b) inner += `<circle cx="${x + 11}" cy="${yy + 11}" r="7" fill="${i < y ? '#ffcd75' : '#73eff7'}" stroke="${K}" stroke-width="2"/>`;
    }
    return svg('0 0 118 52', inner, 'frame10');
  }
  /** Bilangan 11–20: satu bingkai penuh (1 puluhan) + bingkai kedua (satuan). */
  const tens20 = n => `<div class="frames">${frameMix(Math.min(10, n))}${frameMix(Math.max(0, n - 10))}</div>`;
  /** Petunjuk "buat 10": a + b → isi bingkai pertama sampai 10, sisanya di bingkai kedua. */
  function hintMake10(a, b) {
    const need = 10 - a, rest = b - need;
    return hintBox(`<div class="frames">${frameMix(a, need)}${frameMix(0, rest)}</div>`,
      `${a} + ${need} = 10, sisa ${rest} → 10 + ${rest} = ${a + b}`);
  }
  /** Bangun datar berwarna lain (mengelompokkan menurut bentuk). */
  const shapeC = (id, c) => svg('0 0 40 40', SHAPES[id].d.replace(/fill="#[0-9a-fA-F]{6}"/, `fill="${c}"`), 'shape');
  /** Deretan bangun datar campur (menghitung satu jenis bentuk). */
  const shapeRow = list => `<div class="shpRow">${list.map(([id, c]) => shapeC(id, c)).join('')}</div>`;
  /** Bangun yang dibagi menjadi bagian-bagian berwarna (mengurai bangun datar). */
  const PIECE = ['#ffcd75', '#73eff7', '#f4a3c8', '#a7f070'];
  function split(kind) {
    const p = (pts, i) => `<polygon points="${pts}" fill="${PIECE[i % 4]}" ${st}/>`;
    const r = (x, y, w, h, i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PIECE[i % 4]}" ${st}/>`;
    const D = {
      sq2t: p('6,6 46,6 46,46', 0) + p('6,6 46,46 6,46', 1),
      sq4t: p('6,6 46,6 26,26', 0) + p('46,6 46,46 26,26', 1) + p('46,46 6,46 26,26', 2) + p('6,46 6,6 26,26', 3),
      rect2s: r(2, 14, 24, 24, 0) + r(26, 14, 24, 24, 1),
      sq4s: r(6, 6, 20, 20, 0) + r(26, 6, 20, 20, 1) + r(6, 26, 20, 20, 2) + r(26, 26, 20, 20, 3),
      tri4t: p('26,4 15,24 37,24', 0) + p('15,24 4,44 26,44', 1) + p('37,24 26,44 48,44', 2) + p('15,24 37,24 26,44', 3),
      rect3s: r(2, 18, 16, 16, 0) + r(18, 18, 16, 16, 1) + r(34, 18, 16, 16, 2)
    };
    return svg('0 0 52 52', D[kind], 'shape big');
  }
  /** Dua potong bangun terpisah (menyusun bangun datar). */
  function pieces(kind) {
    const D = {
      tt: `<polygon points="4,6 30,6 30,32" fill="#ffcd75" ${st}/><polygon points="40,6 40,32 66,32" fill="#73eff7" ${st}/>`,
      ss: `<rect x="6" y="8" width="24" height="24" fill="#ffcd75" ${st}/><rect x="42" y="8" width="24" height="24" fill="#73eff7" ${st}/>`
    };
    return svg('0 0 70 38', D[kind], 'wide');
  }
  /* Buah untuk data & diagram gambar (viewBox 20×20). */
  const FRUITS = {
    apel: {n: 'apel', d: `<circle cx="10" cy="11" r="7" fill="#e43b44" stroke="${K}" stroke-width="2"/><rect x="9" y="1" width="2" height="5" fill="#6d4b27"/><ellipse cx="13" cy="4" rx="3" ry="1.6" fill="#38b764"/><circle cx="7" cy="9" r="1.6" fill="#f4f4f4"/>`},
    jeruk: {n: 'jeruk', d: `<circle cx="10" cy="11" r="7" fill="#ef7d57" stroke="${K}" stroke-width="2"/><circle cx="10" cy="5" r="1.6" fill="#38b764"/><circle cx="7" cy="9" r="1.3" fill="#ffcd75"/>`},
    pisang: {n: 'pisang', d: `<path d="M3 6 Q6 17 17 15 Q9 13 6 4 Z" fill="#ffcd75" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><rect x="2" y="3" width="3" height="3" fill="#6d4b27"/>`},
    anggur: {n: 'anggur', d: [[7, 7], [13, 7], [10, 11], [5, 12], [15, 12], [10, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#b06fd0" stroke="${K}" stroke-width="1.5"/>`).join('') + `<rect x="9" y="1" width="2" height="4" fill="#38b764"/>`}
  };
  const fruit = id => svg('0 0 20 20', FRUITS[id].d, 'fruit');
  /** Diagram gambar: satu baris per buah. data = [[id, jumlah], ...] */
  const picto = data => `<div class="picto">${data.map(([id, n]) => `<div class="pcRow"><span class="pcLbl">${fruit(id)}</span><span class="pcBar">${fruit(id).repeat(n)}</span></div>`).join('')}</div>`;
  /** Turus: tiap 5 = 4 garis tegak + 1 garis miring. */
  function tally(n, col = '#f4f4f4') {
    let inner = '', x = 3;
    for (let g = 0; g < Math.ceil(n / 5); g++) {
      const k = Math.min(5, n - g * 5);
      for (let i = 0; i < Math.min(4, k); i++) inner += `<rect x="${x + i * 5}" y="2" width="2.4" height="18" fill="${col}"/>`;
      if (k === 5) inner += `<line x1="${x - 2}" y1="17" x2="${x + 18}" y2="5" stroke="${col}" stroke-width="2.4"/>`;
      x += k === 5 ? 26 : k * 5 + 4;
    }
    return svg(`0 0 ${x + 2} 22`, inner, 'tally');
  }
  /** Tabel turus: buah | turus. */
  const tallyTable = data => `<div class="tTable">${data.map(([id, n]) => `<div class="tRow"><span class="pcLbl">${fruit(id)}</span>${tally(n)}</div>`).join('')}</div>`;

  return {queue, groups, frameMix, tens20, hintMake10, shapeC, shapeRow, split, pieces, FRUITS, fruit, picto, tally, tallyTable,
          count, SHAPES, shape, COLORS, token, patternRow, pencils, ruler, lidi, story, bar, bond, tenFrame,
          hintAdd, hintSub, hintCompare, hintCount, hintTens, hintLine, hintRuler, hintBond, hintTen, hintBar, hintBar2, hintSeq, hintNote, hintEqual};
})();
