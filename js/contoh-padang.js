/* Math Quest — CONTOH grafik baru: Padang Hitung dengan 5 titik (2026-11-25).
   Pahlawan berjalan dari titik ke titik di latar berlapis (langit, bukit jauh, pohon, jalan).
   Titik 1, 2, 4 = monster biasa, titik 3 = ⭐ mini bos, titik 5 = 👑 bos area.
   Angka memakai rumus balance.js (MQ.Calc); pahlawan contoh Level 3. Belum terhubung ke simpanan game. */
'use strict';

(() => {
  const {Pix, Questions, Audio, Calc, Balance} = MQ;
  const sfx = Audio.sfx;
  const $ = id => document.getElementById(id);
  const cv = $('scene'), ctx = cv.getContext('2d');
  const K = '#1a1c2c';

  /* ===== Data contoh ===== */
  const SPEC = {kinds: ['hitung', 'hitung', 'banding'], max: 10};
  const STAGES = [
    {m: 'lendir', name: 'Lendir Hijau', lv: 1},
    {m: 'lendirAir', name: 'Lendir Air', lv: 2},
    {m: 'lendirBunga', name: 'Lendir Bunga', lv: 3, mini: true, power: 1.2},
    {m: 'lendir', name: 'Lendir Hijau', lv: 4},
    {m: 'rajaLendir', name: 'Raja Lendir', lv: 5, boss: true}
  ];
  const HERO_LV = 3;
  const hero = {max: Calc.playerHp(HERO_LV, 0, 0), hp: 0, atk: Calc.playerAtk(HERO_LV, 0, 0), x: 10, frame: 'idle', act: null, actT: 0};
  hero.hp = hero.max;
  const SX = i => 110 + i * 150;            // posisi titik ke-i di dunia (piksel)
  const HERO_AT = i => SX(i) - 30;          // tempat pahlawan berdiri saat bertarung
  let VW = 180, VH = 120, GY = 96, camX = 0;
  let stage = 0, phase = 'walk', mon = null, q = null, locked = true, answerTime = 0, parts = [];

  /* ===== Ukuran kanvas: 1 piksel dunia = 3–5 piksel layar ===== */
  function resize() {
    const a = $('arena');
    // Skala piksel mengikuti tinggi arena (±100 piksel dunia tingginya): arena lebih tinggi → tokoh lebih besar
    const sc = Math.max(3, Math.min(5, Math.round(a.clientHeight / 100)));
    VW = Math.max(90, Math.round(a.clientWidth / sc)); VH = Math.max(70, Math.round(a.clientHeight / sc));
    if (cv.width !== VW || cv.height !== VH) { cv.width = VW; cv.height = VH; }
    GY = VH - 17; // sisakan tempat untuk bar 5 titik di bawah
  }
  addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe($('arena')); // arena mengisi sisa layar

  /* ===== Latar berlapis ===== */
  const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const circle = (cx, cy, r, c) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); R(c, cx - w, cy + dy, w * 2 + 1, 1); } };
  const DIG = {1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
               4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.']};
  const digit = (n, x, y, c) => DIG[n].forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && R(c, x + i, y + j, 1, 1)));

  function drawBackground(t) {
    // Langit bergradasi bertingkat (khas pixel art), garis batas diberi pola titik
    const SKY = ['#4fb8f0', '#62c6f4', '#78d4f6', '#92e2f7', '#b4eef6'], band = Math.ceil((GY - 30) / SKY.length);
    R(SKY[SKY.length - 1], 0, 0, VW, VH); // dasar: tidak ada celah yang menyisakan gambar lama
    SKY.forEach((c, i) => R(c, 0, i * band, VW, band + 1));
    for (let i = 1; i < SKY.length; i++) for (let x = (i % 2); x < VW; x += 2) R(SKY[i], x, i * band - 1, 1, 1);
    // Matahari & awan (bergerak pelan)
    circle(VW - 18, 11, 7, '#fff3b0'); circle(VW - 18, 11, 5, '#ffe08a');
    for (let i = 0; i < 4; i++) {
      const span = VW + 70, x = ((hash(i + 1) * span - camX * 0.08 - t * (2 + i)) % span + span) % span - 35, y = 4 + hash(i + 9) * (GY - 50);
      circle(x, y + 3, 5, '#f4f4f4'); circle(x + 7, y, 6, '#f4f4f4'); circle(x + 15, y + 3, 5, '#f4f4f4'); R('#d6f1fa', x - 4, y + 7, 24, 2);
    }
    // Bukit jauh (paralaks 0,25)
    for (let sx = 0; sx < VW; sx++) {
      const wx = sx + camX * 0.25, y = Math.round(GY - 33 + 5 * Math.sin(wx / 21) + 3 * Math.sin(wx / 8.3));
      R('#7fcfa0', sx, y, 1, VH - y); R('#a6e3b8', sx, y, 1, 1);
    }
    // Bukit tengah + pohon bulat (paralaks 0,55)
    const midY = wx => Math.round(GY - 19 + 3 * Math.sin(wx / 14 + 2) + 2 * Math.sin(wx / 5.1));
    for (let sx = 0; sx < VW; sx++) { const wx = sx + camX * 0.55, y = midY(wx); R('#4fbf6e', sx, y, 1, VH - y); R('#7fdc84', sx, y, 1, 1); }
    const first = Math.floor((camX * 0.55 - 20) / 26);
    for (let k = first; k < first + VW / 26 + 3; k++) {
      if (hash(k) < 0.35) continue;
      const wx = k * 26 + hash(k + 3) * 14, sx = wx - camX * 0.55, y = midY(wx), r = 5 + Math.round(hash(k + 5) * 3);
      R('#5d275d', sx - 1, y - 4, 3, 6);
      circle(sx, y - 6 - r, r + 1, K); circle(sx, y - 6 - r, r, '#257179'); circle(sx - 2, y - 8 - r, r - 2, '#38b764'); R('#a7f070', sx - 3, y - 10 - r, 2, 1);
    }
    // Tanah depan (paralaks 1): rumput, jalan tanah, bunga & batu
    for (let sx = 0; sx < VW; sx++) {
      const wx = sx + camX, top = GY - 7 + Math.round(1.5 * Math.sin(wx / 9));
      R('#38b764', sx, top, 1, VH - top); R('#a7f070', sx, top, 1, 1);
      if (hash(wx) > 0.8) R('#a7f070', sx, top - 1, 1, 1);
      const p0 = GY - 2 + Math.round(Math.sin(wx / 23)), p1 = GY + 7 + Math.round(Math.sin(wx / 17));
      R('#d4a373', sx, p0, 1, p1 - p0); R('#ab5236', sx, p1, 1, 1); R('#e8c49a', sx, p0, 1, 1);
    }
    const f0 = Math.floor(camX / 7);
    for (let k = f0; k < f0 + VW / 7 + 2; k++) {
      const h = hash(k + 77), sx = k * 7 - camX;
      if (h < 0.18) { const c = ['#e43b44', '#f4f4f4', '#ffcd75', '#f4a3c8'][k & 3]; R('#257179', sx, GY - 6, 1, 3); R(c, sx - 1, GY - 7, 3, 1); R(c, sx, GY - 8, 1, 3); }
      else if (h > 0.93) { R(K, sx - 1, GY + 3, 5, 3); R('#94b0c2', sx, GY + 3, 3, 2); }
      else if (h > 0.75) { const y = GY + 10 + Math.round(hash(k) * 3); R('#257179', sx, y, 1, 2); R('#257179', sx + 2, y, 1, 2); R('#257179', sx + 1, y - 1, 1, 3); }
    }
    // Papan nomor tiap titik & bendera bos
    STAGES.forEach((s, i) => {
      const sx = SX(i) - 52 - camX;
      if (sx < -20 || sx > VW + 10) return;
      R(K, sx + 3, GY - 18, 3, 16); R('#ab5236', sx + 4, GY - 18, 1, 15);
      R(K, sx - 2, GY - 24, 13, 9); R(s.boss ? '#e43b44' : s.mini ? '#b06fd0' : '#d4a373', sx - 1, GY - 23, 11, 7);
      digit(i + 1, sx + 3, GY - 22, s.boss || s.mini ? '#fff3b0' : K);
    });
    const fx = SX(4) + 46 - camX;
    R(K, fx, GY - 34, 2, 33); R('#e43b44', fx + 2, GY - 34, 10, 6); R('#ffcd75', fx + 2, GY - 34 + (Math.floor(t * 4) % 2), 10, 1);
  }

  /* ===== Sprite di dunia ===== */
  function drawSprite(name, frame, x, opt = {}) {
    const s = Pix.sprite(name, frame);
    const w = Math.round(s.width * (opt.scale || 1)), h = Math.round(s.height * (opt.scale || 1));
    const sx = Math.round(x - camX + (opt.dx || 0)), sy = Math.round(GY + 4 - h + (opt.dy || 0));
    ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    R('#0003', sx + 3, GY + 3, w - 6, 2);                     // bayangan
    ctx.drawImage(s, sx, sy, w, h);
    ctx.globalAlpha = 1;
    return {sx, sy, w, h};
  }

  /* ===== Pertarungan ===== */
  function makeMonster(i) {
    const s = STAGES[i], kind = s.boss ? 'boss' : s.mini ? 'key' : '';
    const max = Calc.monsterHp(s.lv, kind);
    const spd = (s.boss ? [3.5, 5] : [2.5, 4.5]);
    return Object.assign({}, s, {max, hp: max, dmg: Calc.monsterDmg(s.lv, s.power || 1, s.boss), spd, charge: 0, interval: 4,
      x: SX(i) + 6, act: null, actT: 0, alive: true});
  }
  const newInterval = () => (mon.spd[0] + Math.random() * (mon.spd[1] - mon.spd[0])) * 1.4 * (mon.boss ? Balance.monster.bossSlowMul : 1);

  function showFloat(text, cls, side = 'monster', delay = 0) {
    const s = document.createElement('span');
    s.className = 'float ' + cls; s.textContent = text;
    s.style.left = (side === 'hero' ? 26 + Math.random() * 6 : 50 + Math.random() * 10) + '%';
    s.style.animationDelay = delay + 's';
    s.addEventListener('animationend', () => s.remove());
    $('fx').appendChild(s);
  }
  function hud() {
    const p = Math.max(0, hero.hp) / hero.max * 100;
    $('heroHpFill').style.width = p + '%';
    $('heroHpFill').style.background = p > 50 ? '#38b764' : p > 25 ? '#ffcd75' : '#e43b44';
    $('heroHpText').textContent = `HP ${Math.max(0, hero.hp)} / ${hero.max}`;
    $('dots').innerHTML = STAGES.map((s, i) => {
      const st = i < stage || phase === 'done' ? 'done' : i === stage ? 'now' : '';
      return (i ? '<i class="dotLine"></i>' : '') + `<span class="dot5 ${st}">${s.boss ? '👑' : s.mini ? '⭐' : i + 1}</span>`;
    }).join('');
    if (mon) {
      const m = Math.max(0, mon.hp) / mon.max * 100;
      $('hpFill').style.width = m + '%';
      $('hpFill').style.background = m > 50 ? '#38b764' : m > 25 ? '#ffcd75' : '#e43b44';
      $('hpText').textContent = `HP ${Math.max(0, mon.hp)} / ${mon.max}`;
    }
  }

  function startWalk() {
    phase = 'walk'; locked = true; $('mTop').hidden = true;
    $('question').classList.add('walking'); $('answers').classList.add('walking');
    $('qText').textContent = stage === 0 ? 'Ayo berangkat!' : `Berjalan ke titik ${stage + 1}...`;
    $('qView').hidden = true; $('answers').innerHTML = '<button class="ans">.</button><button class="ans">.</button>';
    mon = makeMonster(stage);
    Audio.music.play(mon.boss ? 'boss' : 'field');
    hud();
  }
  function startFight() {
    phase = 'fight';
    $('question').classList.remove('walking'); $('answers').classList.remove('walking');
    $('mName').textContent = (mon.boss ? '👑 BOS: ' : mon.mini ? '⭐ MINI BOS: ' : '') + `${mon.name} · Lv ${mon.lv}`;
    $('mTop').hidden = false;
    mon.interval = newInterval(); mon.charge = 0;
    hud(); nextQuestion();
  }
  function nextQuestion() {
    q = Questions.make(SPEC);
    answerTime = 0;
    $('qText').textContent = q.text;
    $('qText').classList.toggle('long', q.text.length > 12);
    $('qView').innerHTML = q.view || ''; $('qView').hidden = !q.view;
    const box = $('answers');
    box.className = 'cols' + q.cols + (q.choices[0].html.startsWith('<svg') ? ' pics' : '');
    box.innerHTML = '';
    q.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'ans'; b.innerHTML = c.html; b.dataset.v = c.v;
      b.addEventListener('click', () => answer(b, c.v));
      box.appendChild(b);
    });
    locked = false;
  }
  $('btnSpeak').addEventListener('click', () => q && phase === 'fight' && Audio.speak(q.speak));

  function act(who, name, dur) { who.act = name; who.actT = dur; }
  function answer(btn, v) {
    if (locked || phase !== 'fight') return;
    locked = true;
    if (v === q.ans) {
      btn.classList.add('benar');
      const fast = answerTime <= Balance.combat.fastCritSec, crit = fast || Math.random() < 0.1;
      const dmg = hero.atk * (crit ? 2 : 1);
      mon.hp = Math.max(0, mon.hp - dmg);
      act(hero, 'atk', 0.35); act(mon, 'hit', 0.4);
      crit ? sfx.crit() : sfx.correct(); sfx.slash();
      slash(crit);
      showFloat((fast ? '⚡KILAT! ' : crit ? 'KRITIS! ' : '') + '-' + dmg, crit ? 'crit' : '');
      hud();
      setTimeout(mon.hp <= 0 ? defeat : nextQuestion, 750);
    } else {
      btn.classList.add('salah');
      [...$('answers').children].find(b => b.dataset.v === q.ans).classList.add('benar');
      sfx.wrong();
      const hint = q.hint && q.hint();
      if (hint) { $('qView').innerHTML = hint; $('qView').hidden = false; }
      if (!enemyAttack()) setTimeout(nextQuestion, hint ? 3000 : 1400);
    }
  }
  function enemyAttack() {
    mon.charge = 0; mon.interval = newInterval();
    hero.hp = Math.max(0, hero.hp - mon.dmg);
    act(mon, 'atk', 0.45); act(hero, 'hurt', 0.6);
    sfx.enemy && sfx.enemy('slime'); setTimeout(sfx.hurt, 120);
    showFloat('-' + mon.dmg, 'hurt', 'hero');
    hud();
    if (hero.hp > 0) return false;
    locked = true;
    setTimeout(() => overlay({icon: '💤', title: 'Pahlawan Istirahat', btn: 'Ayo Lanjut!', text: 'HP-mu habis. Istirahat sebentar, HP penuh lagi!',
      cb: () => { hero.hp = hero.max; mon.charge = 0; hud(); nextQuestion(); }}), 900);
    return true;
  }
  function defeat() {
    mon.alive = false; mon.deadT = 0.8;
    sfx.defeat();
    poof(mon.x + 12, GY - 10);
    const heal = Math.min(hero.max - hero.hp, Math.round(hero.max * 0.2));
    if (heal > 0) { hero.hp += heal; showFloat(`+${heal} HP`, 'heal', 'hero', 0.1); }
    showFloat(`+${8 + 2 * mon.lv} XP`, 'xp', 'monster', 0.2);
    $('mTop').hidden = true;
    setTimeout(() => {
      if (stage === STAGES.length - 1) return victory();
      stage++; startWalk();
    }, 1100);
  }
  function victory() {
    phase = 'done'; hud(); sfx.fanfare();
    $('qText').textContent = 'Padang Hitung selesai! ⭐';
    overlay({icon: '🏆', title: 'Area Selesai!', btn: 'Main lagi', btn2: 'Kembali ke game',
      text: 'Kamu melewati 5 titik dan mengalahkan Raja Lendir! Ini contoh tampilan baru. Bagaimana menurutmu?',
      cb: () => location.reload(), cb2: () => (location.href = './')});
  }

  /* ===== Efek ===== */
  let slashT = 0, slashCrit = false;
  function slash(crit) { slashT = 0.3; slashCrit = crit; }
  function poof(x, y) {
    for (let i = 0; i < 16; i++) {
      const a = Math.PI * 2 * i / 16;
      parts.push({x, y, vx: Math.cos(a) * (20 + Math.random() * 25), vy: Math.sin(a) * (20 + Math.random() * 25) - 10, life: 0.6 + Math.random() * 0.3,
                  c: ['#f4f4f4', '#a7f070', '#ffcd75'][i % 3]});
    }
  }

  /* ===== Pesan ===== */
  let ovCb = null, ovCb2 = null;
  function overlay(o) {
    $('ovIcon').textContent = o.icon || ''; $('ovTitle').textContent = o.title; $('ovText').textContent = o.text;
    $('ovBtn').textContent = o.btn || 'Oke'; $('ovBtn2').hidden = !o.btn2; $('ovBtn2').textContent = o.btn2 || '';
    ovCb = o.cb || null; ovCb2 = o.cb2 || null; $('overlay').hidden = false;
  }
  $('ovBtn').addEventListener('click', () => { $('overlay').hidden = true; if (ovCb) ovCb(); });
  $('ovBtn2').addEventListener('click', () => { $('overlay').hidden = true; if (ovCb2) ovCb2(); });

  /* ===== Putaran gambar ===== */
  let last = 0, walkT = 0;
  function frame(tms) {
    requestAnimationFrame(frame);
    const t = tms / 1000, dt = last ? Math.min(0.05, t - last) : 0;
    last = t;
    // Gerak & waktu
    if (phase === 'walk') {
      const target = HERO_AT(stage);
      hero.x = Math.min(target, hero.x + 42 * dt);
      walkT += dt;
      hero.frame = Math.floor(walkT * 7) % 2 ? 'walk1' : 'walk2';
      if (hero.x >= target) { hero.frame = 'idle'; startFight(); }
    }
    const reading = window.speechSynthesis && window.speechSynthesis.speaking;
    if (phase === 'fight' && !locked && $('overlay').hidden && !reading && !document.hidden) {
      answerTime += dt;
      mon.charge += dt;
      $('fastFill').style.width = Math.max(0, 1 - answerTime / Balance.combat.fastCritSec) * 100 + '%';
      $('atkFill').style.width = Math.min(100, mon.charge / mon.interval * 100) + '%';
      if (mon.charge >= mon.interval) {
        locked = true;
        if (!enemyAttack()) setTimeout(() => { locked = false; }, 600);
      }
    }
    camX += ((hero.x - VW * 0.12) - camX) * Math.min(1, dt * 4);
    camX = Math.max(0, camX);
    [hero, mon].forEach(w => { if (w && w.actT > 0) { w.actT -= dt; if (w.actT <= 0) w.act = null; } });

    // Gambar
    drawBackground(t);
    if (mon) {
      if (mon.alive) {
        const bob = Math.floor(t * 2) % 2, shake = mon.act === 'hit' ? (Math.floor(t * 30) % 2 ? 2 : -2) : 0;
        const lunge = mon.act === 'atk' ? -Math.sin((1 - mon.actT / 0.45) * Math.PI) * 14 : 0;
        if (!(mon.act === 'hit' && Math.floor(t * 20) % 3 === 0)) drawSprite(mon.m, '', mon.x, {dx: shake + lunge, dy: -bob});
      } else if (mon.deadT > 0) {
        mon.deadT -= dt;
        const k = Math.max(0, mon.deadT / 0.8);
        const s = Pix.sprite(mon.m, '');
        drawSprite(mon.m, '', mon.x + s.width * (1 - k) / 2, {scale: Math.max(0.1, k), alpha: k});
      }
    }
    const hf = hero.act === 'atk' ? 'atk' : hero.act === 'hurt' ? 'hurt' : hero.frame;
    const dash = hero.act === 'atk' ? Math.sin((1 - hero.actT / 0.35) * Math.PI) * 10 : 0;
    if (!(hero.act === 'hurt' && Math.floor(t * 16) % 2)) drawSprite('hero', hf, hero.x, {dx: dash, dy: phase === 'fight' && !hero.act ? -(Math.floor(t * 1.5) % 2) : 0});
    // Tebasan: busur piksel di depan monster
    if (slashT > 0 && mon) {
      slashT -= dt;
      const k = 1 - slashT / 0.3, cx = mon.x - camX + 14, cy = GY - 12;
      for (let a = -1.2; a < -1.2 + 2.4 * k; a += 0.08) {
        const r = slashCrit ? 15 : 12;
        R(slashCrit ? '#ffcd75' : '#f4f4f4', cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2);
      }
    }
    parts = parts.filter(p => (p.life -= dt) > 0);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; R(p.c, p.x - camX, p.y, 2, 2); });
  }

  /* ===== Mulai ===== */
  document.addEventListener('pointerdown', Audio.unlock, {passive: true});
  Audio.setVolumes(0.6, 0.8);
  resize();
  startWalk();
  requestAnimationFrame(frame);
  MQ.Contoh = {question: () => q, state: () => ({stage, phase, heroHp: hero.hp, mon: mon && {name: mon.name, hp: mon.hp, max: mon.max, dmg: mon.dmg}})}; // untuk pengujian
})();
