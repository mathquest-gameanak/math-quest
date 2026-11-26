/* Math Quest — latar Halaman Utama bergerak: Desa Bilangan (2026-11-25).
   Langit bertingkat, matahari, awan berarak, bukit jauh, deretan rumah warna-warni, Kristal Angka di tugu
   (makin terang sesuai kepingan yang terkumpul), pohon, pagar, bunga, kupu-kupu, rumput bergoyang.
   Pahlawan (gambar <img> di atas kanvas) bisa diketuk: melompat senang, menebas, atau berputar, dengan efek & kata-kata. */
'use strict';
window.MQ = window.MQ || {};

MQ.HomeScene = (() => {
  const {State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const cv = $('homeScene'), ctx = cv.getContext('2d'), K = '#1a1c2c', SC = 4;
  let VW = 100, VH = 120, GY = 100;

  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const circle = (cx, cy, r, c) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); R(c, cx - w, cy + dy, w * 2 + 1, 1); } };
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

  function resize() {
    const a = cv.parentElement;
    VW = Math.max(60, Math.round(a.clientWidth / SC)); VH = Math.max(80, Math.round(a.clientHeight / SC));
    if (cv.width !== VW || cv.height !== VH) { cv.width = VW; cv.height = VH; }
    GY = VH - Math.round(VH * 0.1);
  }
  addEventListener('resize', resize);

  /** Rumah piksel: dinding, atap segitiga, pintu, jendela. */
  function house(x, base, w, h, wall, roof, k) {
    R(K, x - 1, base - h - 1, w + 2, h + 1); R(wall, x, base - h, w, h);
    for (let i = 0; i <= w / 2 + 2; i++) { R(K, x - 2 + i, base - h - 1 - i, w + 4 - i * 2, 1); R(roof, x - 1 + i, base - h - 1 - i, Math.max(0, w + 2 - i * 2), 1); }
    R(K, x + Math.round(w / 2) - 2, base - 6, 4, 6); R('#ab5236', x + Math.round(w / 2) - 1, base - 5, 2, 5);
    const lit = Math.floor(Date.now() / 1500 + k) % 5 === 0;
    R(K, x + 2, base - h + 3, 4, 4); R(lit ? '#ffe08a' : '#73eff7', x + 3, base - h + 4, 2, 2);
    if (w > 12) { R(K, x + w - 6, base - h + 3, 4, 4); R('#73eff7', x + w - 5, base - h + 4, 2, 2); }
  }

  function draw(t) {
    // Langit bertingkat & matahari
    const SKY = ['#4fb8f0', '#62c6f4', '#78d4f6', '#92e2f7', '#b4eef6'], band = Math.ceil((GY - 40) / SKY.length);
    R(SKY[4], 0, 0, VW, VH);
    SKY.forEach((c, i) => R(c, 0, i * band, VW, band + 1));
    for (let i = 1; i < SKY.length; i++) for (let x = i % 2; x < VW; x += 2) R(SKY[i], x, i * band - 1, 1, 1);
    circle(VW - 16, 14, 8, '#fff3b0'); circle(VW - 16, 14, 6, '#ffe08a');
    for (let i = 0; i < 4; i++) { // awan berarak
      const span = VW + 60, x = ((hash(i + 2) * span + t * (2 + i)) % span) - 30, y = 6 + hash(i + 7) * (GY * 0.35);
      circle(x, y + 3, 5, '#f4f4f4'); circle(x + 7, y, 6, '#f4f4f4'); circle(x + 15, y + 3, 5, '#f4f4f4'); R('#d6f1fa', x - 4, y + 7, 24, 2);
    }
    // Bukit jauh & dekat
    for (let x = 0; x < VW; x++) { const y = Math.round(GY - 40 + 5 * Math.sin(x / 19) + 2 * Math.sin(x / 6.7)); R('#7fcfa0', x, y, 1, VH); R('#a6e3b8', x, y, 1, 1); }
    for (let x = 0; x < VW; x++) { const y = Math.round(GY - 26 + 3 * Math.sin(x / 13 + 1)); R('#4fbf6e', x, y, 1, VH); R('#7fdc84', x, y, 1, 1); }
    // Desa: rumah-rumah di kiri & kanan, Kristal Angka di tengah belakang
    const base = GY - 14, VH2 = {R, circle, VW, VH, GY, base, cx: Math.round(VW / 2), t, K, hash};
    if (MQ.Village) MQ.Village.drawBack(VH2); // bangunan desa yang sudah dibangun (lapisan belakang)
    house(2, base, 16, 12, '#ffe4c4', '#e43b44', 1); house(VW - 20, base, 17, 13, '#fff3b0', '#3b5dc9', 2);
    if (VW > 120) { house(26, base - 4, 12, 10, '#f4a3c8', '#5d275d', 3); house(VW - 40, base - 4, 12, 10, '#c7f0ff', '#38b764', 4); }
    // Pohon bulat
    [[VW * 0.22, 0], [VW * 0.8, 3]].forEach(([x, k]) => { R('#5d275d', x - 1, base - 9, 3, 10); circle(x, base - 14, 7, K); circle(x, base - 14, 6, '#257179'); circle(x - 2, base - 16, 4, '#38b764'); });
    // Kristal Angka di tugu: cahaya sesuai kepingan terkumpul
    const shards = State.shards(), cx = Math.round(VW / 2), cy = base - 34 + Math.round(Math.sin(t * 2) * 1.5);
    R(K, cx - 5, base - 14, 11, 15); R('#94b0c2', cx - 4, base - 13, 9, 13); R('#566c86', cx + 2, base - 13, 3, 13); R('#c7d3de', cx - 6, base - 15, 13, 2);
    if (shards) for (let r = 4 + shards; r > 3; r -= 2) circle(cx, cy, r + 4, `rgba(115,239,247,${0.06 + shards * 0.015})`);
    for (let y = 0; y < 14; y++) { const hw = y < 5 ? y + 1 : Math.round((14 - y) * 0.45); R(K, cx - hw - 1, cy - 7 + y, hw * 2 + 2, 1); }
    for (let y = 0; y < 14; y++) { const hw = y < 5 ? y : Math.round((14 - y) * 0.45) - 1; if (hw > 0) { R('#73eff7', cx - hw, cy - 7 + y, hw * 2, 1); R('#41a6f6', cx + 1, cy - 7 + y, Math.max(0, hw - 1), 1); } }
    if (Math.floor(t * 2) % 3 === 0) { R('#f4f4f4', cx - 2, cy - 4, 1, 1); R('#f4f4f4', cx - 3, cy - 3, 3, 1); R('#f4f4f4', cx - 2, cy - 2, 1, 1); }
    // Pagar kayu
    for (let x = 0; x < VW; x += 8) { if (Math.abs(x - cx) < 14) continue; R(K, x - 1, base - 6, 4, 9); R('#d4a373', x, base - 5, 2, 7); }
    R('#d4a373', 0, base - 3, cx - 14, 1); R('#d4a373', cx + 14, base - 3, VW, 1);
    // Tanah depan: rumput, jalan tanah ke tengah, bunga bergoyang
    R('#38b764', 0, base + 2, VW, VH); R('#a7f070', 0, base + 2, VW, 1);
    for (let y = base + 3; y < VH; y++) { const hw = 8 + (y - base) * 0.9; R('#d4a373', cx - hw, y, hw * 2, 1); R('#e8c49a', cx - hw, y, 1, 1); R('#e8c49a', cx + hw - 1, y, 1, 1); }
    for (let k = 0; k < VW / 5; k++) {
      const x = Math.round(hash(k + 30) * VW), y = base + 5 + Math.round(hash(k + 31) * (VH - base - 8));
      if (Math.abs(x - cx) < 10 + (y - base)) continue;
      const sway = Math.round(Math.sin(t * 2 + k) * 0.8);
      if (hash(k + 32) < 0.35) { const c = ['#e43b44', '#f4f4f4', '#ffcd75', '#f4a3c8'][k & 3]; R('#257179', x, y, 1, 3); R(c, x - 1 + sway, y - 1, 3, 1); R(c, x + sway, y - 2, 1, 3); }
      else { R('#257179', x + sway, y, 1, 2); R('#257179', x + 2, y, 1, 2); }
    }
    if (MQ.Village) MQ.Village.drawFront(VH2); // bangunan desa (lapisan depan)
    // Kupu-kupu
    for (let i = 0; i < 2; i++) {
      const x = ((hash(i + 4) * 300 + t * (6 + i * 3)) % (VW + 20)) - 10, y = base - 22 - i * 10 + Math.sin(t * 3 + i) * 3, open = Math.floor(t * 8 + i) % 2;
      const c = ['#ffcd75', '#f4a3c8'][i];
      R(c, x - (open ? 2 : 1), y, open ? 2 : 1, 2); R(c, x + 1, y, open ? 2 : 1, 2); R(K, x, y, 1, 2);
    }
  }

  let running = false;
  function frame(tms) {
    requestAnimationFrame(frame);
    if (!running) return;
    if (!$('scr-home').classList.contains('on') || document.hidden) return;
    draw(tms / 1000);
  }
  requestAnimationFrame(frame);

  /* ===== Pahlawan bisa diketuk ===== */
  const hero = $('homeHero'), stage = hero.parentElement;
  const SAYS = ['Ayo berhitung!', 'Hore!', 'Aku siap!', 'Hiyaa!', 'Semangat!', 'Mana monsternya?', 'Satu, dua, tiga!', 'Aku pintar!'];
  let busy = false, pick = 0;
  /** Teks gelembung & efek kecil (hati, bintang, not) di atas pahlawan. */
  function pop(text, emoji) {
    const b = document.createElement('div'); b.className = 'homeSay'; b.textContent = text; stage.appendChild(b);
    setTimeout(() => b.remove(), 1600);
    for (let i = 0; i < 4; i++) {
      const p = document.createElement('i'); p.className = 'homeFx'; p.textContent = emoji;
      p.style.left = 30 + Math.random() * 40 + '%'; p.style.animationDelay = i * 0.12 + 's';
      stage.appendChild(p); setTimeout(() => p.remove(), 1400);
    }
  }
  hero.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    const look = S.hero, eq = S.equip, A = MQ.Audio.sfx;
    const acts = [
      () => { hero.src = MQ.Hero.url(look, eq, 'happy'); hero.classList.add('jump'); A.coin(); pop(SAYS[pick++ % SAYS.length], '❤️'); },
      () => { hero.src = MQ.Hero.url(look, eq, 'atk'); hero.classList.add('swing'); A.slash(); pop('Hiyaa!', '⭐'); },
      () => { hero.src = MQ.Hero.url(look, eq, 'happy'); hero.classList.add('spin'); A.toggle(); pop('Wiii!', '🎵'); }
    ];
    acts[Math.floor(Math.random() * acts.length)]();
    setTimeout(() => { hero.classList.remove('jump', 'swing', 'spin'); hero.src = MQ.Hero.current(); busy = false; }, 900);
  });

  return {
    start() { running = true; resize(); },
    stop() { running = false; }
  };
})();
