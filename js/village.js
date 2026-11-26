/* Math Quest — 🏗️ Membangun Desa Bilangan (2026-11-26).
   Kemajuan belajar yang TERLIHAT: setiap stempel harian & setiap Latihan Teman memberi 1 🧱 bata.
   Bata dipakai membangun 10 bagian desa secara berurutan (total 30 bata ≈ beberapa minggu belajar rutin).
   Bangunan langsung muncul di latar beranda (homescene.js memanggil drawHome di lapisan belakang & depan).
   Simpanan: S.village = {bricks, built: [id]}. */
'use strict';
window.MQ = window.MQ || {};

MQ.Village = (() => {
  const {State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const PROJECTS = [
    {id: 'tamanBunga', name: 'Taman Bunga', icon: '🌷', cost: 1, desc: 'Bunga warna-warni di tepi jalan.'},
    {id: 'lampuJalan', name: 'Lampu Jalan', icon: '💡', cost: 1, desc: 'Jalan desa terang di malam hari.'},
    {id: 'pohonApel', name: 'Pohon Apel', icon: '🍎', cost: 2, desc: 'Pohon desa berbuah apel merah.'},
    {id: 'kincirAngin', name: 'Kincir Angin', icon: '🌬️', cost: 2, desc: 'Kincir berputar di atas bukit.'},
    {id: 'airMancur', name: 'Air Mancur', icon: '⛲', cost: 3, desc: 'Air mancur berkilau di taman desa.'},
    {id: 'rumahBaru', name: 'Rumah Warga Baru', icon: '🏠', cost: 3, desc: 'Warga baru pindah ke Desa Bilangan.'},
    {id: 'menaraJam', name: 'Menara Jam', icon: '🕰️', cost: 4, desc: 'Jam besar untuk belajar membaca waktu.'},
    {id: 'lampion', name: 'Lampion Pesta', icon: '🏮', cost: 4, desc: 'Desa merayakan pahlawannya!'},
    {id: 'patung', name: 'Patung Pahlawan', icon: '🗿', cost: 5, desc: 'Patung untuk pahlawan Desa Bilangan.'},
    {id: 'pelangi', name: 'Pelangi Abadi', icon: '🌈', cost: 5, desc: 'Pelangi yang tidak pernah hilang.'}
  ];
  const V = () => S.village;
  const has = id => V().built.includes(id);
  const nextP = () => PROJECTS.find(p => !has(p.id));

  /** Tambah bata (dari stempel harian / latihan teman). */
  function addBrick(n = 1) { V().bricks += n; State.save(); }

  /* ===== Layar Bangun Desa ===== */
  UI.renderers.build = () => {
    const nx = nextP();
    $('brickNow').textContent = V().bricks;
    $('buildList').innerHTML = PROJECTS.map(p => {
      const done = has(p.id), isNext = nx && nx.id === p.id, can = isNext && V().bricks >= p.cost;
      return `<div class="panel bCard${done ? ' done' : ''}${isNext ? ' next' : ''}"><span class="bIco">${p.icon}</span>` +
        `<div class="bBody"><b>${p.name}</b><small>${p.desc}</small></div>` +
        (done ? '<em class="bOk">✔ Berdiri</em>'
          : `<button class="sBtn bBtn" data-b="${p.id}" ${can ? '' : 'disabled'}>${isNext ? `Bangun 🧱${p.cost}` : `🔒 🧱${p.cost}`}</button>`) + `</div>`;
    }).join('');
    $('buildNote').textContent = nx ? (V().bricks >= nx.cost ? `Bata cukup! Ayo bangun ${nx.name}.` : `Kumpulkan ${nx.cost - V().bricks} 🧱 lagi untuk ${nx.name}.`)
      : 'Desa Bilangan sudah lengkap dan indah! Terima kasih, Pahlawan! 🎉';
  };
  $('buildList').addEventListener('click', e => {
    const b = e.target.closest('[data-b]');
    if (!b || b.disabled) return;
    const p = PROJECTS.find(x => x.id === b.dataset.b);
    if (V().bricks < p.cost || nextP() !== p) return;
    V().bricks -= p.cost; V().built.push(p.id); State.save();
    MQ.Audio.sfx.craft();
    UI.overlay({fx: 'medal', icon: p.icon, sub: '🏗️ DESA MAKIN INDAH', title: p.name, btn: 'Lihat desa', cb: () => UI.show('home'),
      text: `${p.desc} Lihat di halaman depan!`});
  });

  /* ===== Gambar di latar beranda. H = {R, circle, VW, VH, GY, base, cx, t, K, hash} ===== */
  function drawBack(H) {
    const {R, circle, VW, base, t, K} = H;
    if (has('pelangi')) {
      const cx = VW * 0.3, cy = base - 22, cols = ['#e43b4480', '#ef7d5780', '#ffcd7580', '#a7f07080', '#73eff780', '#b06fd080'];
      cols.forEach((c, i) => { const r = 40 - i * 2; for (let a = Math.PI; a <= Math.PI * 2; a += 0.025) R(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 2, 2); });
    }
    if (has('kincirAngin')) {
      const x = Math.round(VW * 0.1), y = base - 30;
      R(K, x - 3, y, 7, 22); R('#ffe4c4', x - 2, y + 1, 5, 21); R('#ab5236', x - 3, y - 2, 7, 3); R('#ab5236', x - 1, y + 14, 2, 7);
      for (let k = 0; k < 4; k++) { const a = t * 1.6 + k * Math.PI / 2; for (let r = 2; r < 11; r++) R(r > 3 ? '#f4f4f4' : '#d4a373', x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2); }
      R(K, x - 1, y - 1, 2, 2);
    }
    if (has('menaraJam')) {
      const x = Math.round(VW * 0.66), top = base - 44;
      R(K, x - 5, top, 11, 34); R('#c7d3de', x - 4, top + 1, 9, 33); R('#94b0c2', x + 2, top + 1, 3, 33);
      for (let i = 0; i < 6; i++) { R(K, x - 6 + i, top - 1 - i, 13 - i * 2, 1); R('#e43b44', x - 5 + i, top - 1 - i, 11 - i * 2, 1); }
      circle(x, top + 8, 4, K); circle(x, top + 8, 3, '#fff3b0');
      const m = t * 0.5, hh = t * 0.05; R(K, x + Math.round(Math.cos(m) * 2), top + 8 + Math.round(Math.sin(m) * 2), 1, 1); R(K, x, top + 8, 1, 1);
      R('#e43b44', x + Math.round(Math.cos(hh) * 1.4), top + 8 + Math.round(Math.sin(hh) * 1.4), 1, 1);
    }
    if (has('rumahBaru')) {
      [[VW * 0.36, '#ffcd75', '#b06fd0'], [VW * 0.6 - 8, '#a6f4f9', '#e43b44']].forEach(([hx, wall, roof]) => {
        const x = Math.round(hx), b = base - 16, w = 9, h = 7;
        R(K, x - 1, b - h - 1, w + 2, h + 1); R(wall, x, b - h, w, h);
        for (let i = 0; i < 6; i++) { R(K, x - 2 + i, b - h - 1 - i, w + 4 - i * 2, 1); R(roof, x - 1 + i, b - h - 1 - i, Math.max(0, w + 2 - i * 2), 1); }
        R('#ab5236', x + 3, b - 4, 3, 4); R('#73eff7', x + 1, b - h + 2, 2, 2);
      });
    }
  }
  function drawFront(H) {
    const {R, circle, VW, VH, base, cx, t, K, hash} = H;
    if (has('pohonApel')) [[VW * 0.22, 0], [VW * 0.8, 3]].forEach(([x]) => [[-3, -17], [2, -14], [-1, -11], [3, -19], [-4, -13]].forEach(([dx, dy]) => { R('#e43b44', x + dx, base + dy, 2, 2); R('#f4a3c8', x + dx, base + dy, 1, 1); }));
    if (has('lampion')) {
      const y0 = base - 26;
      for (let x = 2; x < VW - 2; x++) R('#5d275d', x, y0 + Math.round(Math.sin(x / VW * Math.PI) * 6), 1, 1);
      for (let x = 6; x < VW - 4; x += 9) { const y = y0 + Math.round(Math.sin(x / VW * Math.PI) * 6), on = Math.floor(t * 3 + x) % 4;
        R(K, x - 2, y + 1, 5, 5); R(['#e43b44', '#ffcd75', '#38b764', '#41a6f6'][(x / 9 | 0) % 4], x - 1, y + 2, 3, 3); if (on) R('#fff3b0', x, y + 3, 1, 1); }
    }
    if (has('lampuJalan')) [cx - 12, cx + 11].forEach((x, i) => { R(K, x - 1, base - 12, 3, 16); R('#566c86', x, base - 11, 1, 15); R(K, x - 3, base - 16, 7, 5); R(Math.floor(t * 2 + i) % 5 ? '#ffe08a' : '#ffcd75', x - 2, base - 15, 5, 3); });
    if (has('tamanBunga')) for (let i = 0; i < 12; i++) {
      const side = i % 2 ? 1 : -1, x = cx + side * (16 + (i >> 1) * 5) + Math.round(hash(i + 70) * 2), y = base + 4 + (i % 3) * 3, sway = Math.round(Math.sin(t * 2 + i) * 0.8);
      const c = ['#e43b44', '#f4a3c8', '#ffcd75', '#b06fd0', '#41a6f6'][i % 5];
      R('#257179', x, y, 1, 3); R(c, x - 1 + sway, y - 1, 3, 1); R(c, x + sway, y - 2, 1, 3); R('#fff3b0', x + sway, y - 1, 1, 1);
    }
    if (has('airMancur')) {
      const x = Math.round(VW * 0.86), y = Math.min(VH - 8, base + 14);
      R(K, x - 9, y - 3, 19, 6); R('#94b0c2', x - 8, y - 2, 17, 4); R('#41a6f6', x - 7, y - 2, 15, 2); R(K, x - 2, y - 9, 5, 7); R('#c7d3de', x - 1, y - 8, 3, 6);
      for (let i = 0; i < 6; i++) { const p = (t * 1.4 + i / 6) % 1, dx = (i % 2 ? 1 : -1) * p * 7; R('#73eff7', x + dx, y - 10 - Math.sin(p * Math.PI) * 6, 1, 1); }
    }
    if (has('patung')) {
      const x = cx - 22, y = base + 9;
      R(K, x - 5, y - 2, 11, 5); R('#94b0c2', x - 4, y - 1, 9, 3);
      R(K, x - 3, y - 16, 7, 14); R('#c7d3de', x - 2, y - 15, 5, 12); circle(x, y - 18, 3, K); circle(x, y - 18, 2, '#c7d3de');
      R('#94b0c2', x + 3, y - 22, 1, 10); R('#ffcd75', x - 2, y - 22, 5, 1); // pedang & mahkota
    }
  }
  /** Lencana bata di beranda. */
  function renderHome() { const el = $('brickCount'); if (el) el.textContent = V().bricks; const n = nextP(); $('buildSign').classList.toggle('ready', !!n && V().bricks >= n.cost); }

  return {addBrick, drawBack, drawFront, renderHome, PROJECTS};
})();
