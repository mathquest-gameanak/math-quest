/* Math Quest — Peta Petualangan bergambar (pixel art, digulir ke atas).
   Dunia Kelas 1 dari bawah ke atas: padang → hutan → bukit → danau → lembah → menara → kastil.
   Gua Pola (dungeon) di samping bukit, Arena Latihan di samping padang.
   Gambar medan dibuat sekali; jalur & tombol tempat digambar ulang sesuai progress. */
'use strict';
window.MQ = window.MQ || {};

MQ.WorldMap = (() => {
  const {Data, State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const W = 160, H = 560, SC = 4; // ukuran peta dalam "piksel" & skala gambar

  /* Posisi tiap tempat di peta (x, y dalam piksel peta) */
  const POS = {padang: [44, 515], hutan: [112, 432], bukit: [44, 350], danau: [108, 268], lembah: [46, 188],
               menara: [106, 112], kastil: [80, 40], guaPola: [134, 350], arena: [128, 532]};
  /* Wilayah warna dari atas ke bawah: [batas bawah y, nama] */
  const BANDS = [[78, 'kastil'], [156, 'menara'], [236, 'lembah'], [314, 'danau'], [392, 'bukit'], [472, 'hutan'], [H, 'padang']];

  let terrain = null; // kanvas medan (dibuat sekali)

  /* ===== Menggambar medan ===== */
  function drawTerrain() {
    const c = document.createElement('canvas');
    c.width = W * SC; c.height = H * SC;
    const x = c.getContext('2d');
    x.scale(SC, SC);
    const rect = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
    const circle = (cx, cy, r, col) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); rect(col, cx - w, cy + dy, w * 2 + 1, 1); } };
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));

    // Warna dasar tiap wilayah, batasnya bergelombang
    const BASE = {kastil: '#333c57', menara: '#29366f', lembah: '#d4a373', danau: '#7fcf6a', bukit: '#8fbf6a', hutan: '#257179', padang: '#38b764'};
    for (let px = 0; px < W; px++) {
      let top = 0;
      BANDS.forEach(([bottom, name], i) => {
        const wave = i === BANDS.length - 1 ? 0 : Math.round(3 * Math.sin(px / 7 + i));
        rect(BASE[name], px, top, 1, bottom + wave - top);
        top = bottom + wave;
      });
    }

    // Padang: rumput & bunga
    for (let i = 0; i < 90; i++) { const a = ri(0, W), b = ri(474, H - 2); rect('#257179', a, b, 1, 2); rect('#257179', a + 2, b, 1, 2); }
    for (let i = 0; i < 30; i++) rect(['#e43b44', '#ffcd75', '#f4f4f4', '#f4a3c8'][i % 4], ri(2, W - 3), ri(478, H - 3), 2, 2);
    // Hutan: banyak pohon bulat
    for (let i = 0; i < 26; i++) {
      const tx = ri(4, W - 4), ty = ri(398, 468);
      if (Math.hypot(tx - POS.hutan[0], ty - POS.hutan[1]) < 16) continue; // jangan tutupi tempat
      rect('#5d275d', tx - 1, ty + 3, 2, 5); circle(tx, ty, 5, '#1a4c4f'); circle(tx - 1, ty - 1, 3, '#38b764');
    }
    // Bukit: gundukan & batu
    for (let i = 0; i < 6; i++) { const hx = ri(0, W), hy = ri(330, 385); circle(hx, hy, ri(9, 14), '#a7f070'); circle(hx + 2, hy + 2, 6, '#8fbf6a'); }
    for (let i = 0; i < 14; i++) { const bx = ri(4, W - 6), by = ri(320, 388); rect('#566c86', bx, by, 5, 3); rect('#94b0c2', bx, by, 4, 2); }
    // Danau: air besar dengan riak
    for (let dy = -26; dy <= 26; dy++) { const w = Math.round(70 * Math.sqrt(1 - (dy / 27) ** 2)); rect('#ffcd75', 80 - w - 2, 274 + dy, w * 2 + 4, 1); }
    for (let dy = -24; dy <= 24; dy++) { const w = Math.round(66 * Math.sqrt(1 - (dy / 25) ** 2)); rect('#41a6f6', 80 - w, 274 + dy, w * 2, 1); }
    for (let i = 0; i < 18; i++) rect('#73eff7', ri(30, 130), ri(256, 292), 4, 1);
    circle(POS.danau[0], POS.danau[1] + 2, 9, '#ffcd75'); circle(POS.danau[0], POS.danau[1] + 1, 7, '#a7f070'); // pulau kecil
    // Lembah: tebing & kayu
    for (let i = 0; i < 10; i++) { const lx = ri(0, W - 20), ly = ri(162, 230); rect('#ab5236', lx, ly, ri(10, 22), 2); }
    for (let i = 0; i < 6; i++) { const lx = ri(8, W - 12), ly = ri(165, 228); rect('#5d275d', lx, ly, 8, 3); rect('#ffe4c4', lx + 7, ly, 1, 3); }
    // Menara: malam berbintang + menara batu
    for (let i = 0; i < 30; i++) rect('#f4f4f4', ri(0, W), ri(82, 150), 1, 1);
    const [mx, my] = POS.menara;
    rect('#1a1c2c', mx - 9, my - 44, 18, 40); rect('#94b0c2', mx - 8, my - 43, 16, 39); rect('#566c86', mx + 2, my - 43, 6, 39);
    for (let yy = my - 40; yy < my - 6; yy += 8) rect('#ffcd75', mx - 2, yy, 3, 4);  // jendela
    rect('#1a1c2c', mx - 11, my - 50, 22, 7); rect('#e43b44', mx - 10, my - 49, 20, 5);
    // Kastil: dinding batu + menara kembar + bendera
    const [kx, ky] = POS.kastil;
    rect('#1a1c2c', kx - 28, ky - 22, 56, 20); rect('#94b0c2', kx - 27, ky - 21, 54, 18);
    for (let i = -27; i < 27; i += 6) rect('#94b0c2', kx + i, ky - 25, 4, 4);       // gerigi dinding
    [[-30], [22]].forEach(([dx]) => { rect('#1a1c2c', kx + dx - 1, ky - 38, 10, 36); rect('#566c86', kx + dx, ky - 37, 8, 34); rect('#e43b44', kx + dx + 3, ky - 46, 1, 9); rect('#ffcd75', kx + dx + 4, ky - 46, 5, 3); });
    rect('#5d275d', kx - 6, ky - 14, 12, 12); // gerbang
    // Gua Pola: mulut gua di tebing batu
    const [gx, gy] = POS.guaPola;
    circle(gx, gy - 2, 14, '#566c86'); circle(gx, gy - 4, 11, '#94b0c2'); circle(gx, gy + 1, 7, '#1a1c2c'); rect('#8fbf6a', gx - 16, gy + 8, 32, 6);
    // Arena: lingkaran pasir
    const [ax, ay] = POS.arena;
    circle(ax, ay, 11, '#ab5236'); circle(ax, ay, 9, '#ffcd75');
    return c;
  }

  /* ===== Status & jalur ===== */
  const places = () => [...Data.fields, ...Data.dungeons, Data.arena];
  function status(p) {
    if (p.soon) return 'soon';
    if (!State.unlocked(p)) return 'lock';
    if (S.cleared.includes(p.id)) return 'done';
    return 'open';
  }
  /** Tempat tujuan berikutnya (area terbuka pertama yang belum selesai) — di sini pahlawan berdiri. */
  function currentPlace() {
    const main = Data.fields.filter(f => !f.soon);
    return main.find(f => State.unlocked(f) && !S.cleared.includes(f.id)) || main[main.length - 1];
  }

  /** Jalur titik-titik antar tempat; terang jika tujuannya sudah terbuka. */
  function drawPaths(ctx) {
    ctx.save(); ctx.scale(SC, SC);
    const seg = (a, b, open) => {
      const [x1, y1] = POS[a], [x2, y2] = POS[b];
      const mx = (x1 + x2) / 2 + (y1 - y2) * 0.15, my = (y1 + y2) / 2; // sedikit melengkung
      const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 5);
      for (let i = 1; i < steps; i++) {
        const t = i / steps, px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2;
        ctx.fillStyle = '#1a1c2c'; ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 4, 4);
        ctx.fillStyle = open ? '#ffcd75' : '#94b0c2'; ctx.fillRect(Math.round(px), Math.round(py), 2, 2);
      }
    };
    const order = Data.fields.map(f => f.id);
    for (let i = 1; i < order.length; i++) seg(order[i - 1], order[i], State.unlocked(Data.fields[i]));
    Data.dungeons.forEach(d => seg(d.req, d.id, State.unlocked(d)));
    seg('padang', 'arena', true);
    ctx.restore();
  }

  /* ===== Layar Peta ===== */
  UI.renderers.map = () => {
    if (!terrain) terrain = drawTerrain();
    const cv = $('mapCanvas');
    cv.width = W * SC; cv.height = H * SC;
    const ctx = cv.getContext('2d');
    ctx.drawImage(terrain, 0, 0);
    drawPaths(ctx);
    // Tombol tempat di atas gambar (posisi dalam persen agar ikut lebar layar)
    const cur = currentPlace();
    $('mapNodes').innerHTML = places().map(p => {
      const [x, y] = POS[p.id], st = status(p);
      const badge = st === 'done' ? '⭐' : st === 'lock' ? '🔒' : st === 'soon' ? '🚧' : '';
      return `<button class="mapNode ${st}${p === cur ? ' cur' : ''}" data-place="${p.id}" style="left:${x / W * 100}%;top:${y / H * 100}%">` +
             `<span class="mnIcon">${p.icon}${badge ? `<i>${badge}</i>` : ''}</span><span class="mnName">${p.name}</span></button>`;
    }).join('');
    // Pahlawan berdiri di atas tujuan berikutnya
    const [hx, hy] = POS[cur.id];
    const hero = $('mapHero');
    hero.src = MQ.Hero.current();
    hero.style.left = (hx / W * 100) + '%'; hero.style.top = (hy / H * 100) + '%';
    requestAnimationFrame(() => hero.scrollIntoView({block: 'center'})); // langsung tampilkan tujuan berikutnya
  };

  /* Ketuk tempat: tampilkan keterangan, lalu mulai */
  $('mapNodes').addEventListener('click', e => {
    const b = e.target.closest('.mapNode');
    if (!b) return;
    const p = places().find(x => x.id === b.dataset.place);
    if (p.soon) return UI.overlay({icon: '🚧', title: p.name, text: 'Tempat ini sedang dibangun. Segera hadir!'});
    if (!State.unlocked(p)) {
      if (p.reqAll && !State.mainFields().every(f => S.cleared.includes(f.id))) {
        const all = State.mainFields(), done = all.filter(f => S.cleared.includes(f.id)).length;
        return UI.overlay({icon: '🔒', title: 'Masih Terkunci', text: `Selesaikan semua area Kelas 1 dulu (${done} dari ${all.length} selesai), lalu ikuti Ujian Naik Kelas!`});
      }
      if (p.minLevel && S.level < p.minLevel) {
        return UI.overlay({icon: '💪', title: 'Belum Cukup Kuat', text: `Kastil Ujian butuh Level ${p.minLevel} (sekarang Level ${S.level}). Latihan di area dan dungeon untuk naik level!`});
      }
      const req = Data.fields.find(x => x.id === p.req);
      return UI.overlay({icon: '🔒', title: 'Masih Terkunci', text: `Kalahkan bos di ${req.name} dulu untuk membuka ${p.name}.`});
    }
    // Cerita pembuka tempat ini (sekali saja), lalu bertarung
    const go = () => MQ.Cutscene.playOnce(`${p.id}-intro`, () => MQ.Battle.start(p));
    if (p.exam) {
      return UI.overlay({icon: '📝', title: 'Ujian Naik Kelas', btn: 'Mulai Ujian', btn2: 'Nanti', cb: go,
        text: `12 soal dari semua area. Musuh tidak menyerang, jawab dengan tenang. Lulus jika benar minimal 9. Nilai terbaikmu: ${S.examBest}.`});
    }
    if (p.dungeon) {
      return UI.overlay({icon: '🕳️', title: p.name, btn: 'Masuk', btn2: 'Nanti', cb: go,
        text: `${p.rooms} ruang beruntun. HP TIDAK pulih di dalam gua, bawa Ramuan Penyembuh! Kalahkan bos di ruang terakhir untuk membuka peti harta.`});
    }
    const lv = p.lv ? ` Level ${p.lv[0]}–${p.lv[1]}.` : '';
    const done = S.cleared.includes(p.id) ? ' Bos sudah kamu kalahkan ⭐' : '';
    UI.overlay({icon: p.icon, title: p.name, btn: 'Main!', btn2: 'Nanti', cb: go, text: `${p.desc}.${lv}${done}`});
  });

  return {POS};
})();
