/* Math Quest — layar pertarungan. Dimulai dari peta lewat MQ.Battle.start(tempat).

   Empat mode (B.mode):
     field   : area biasa — jalur 5 titik: 1, 2, ⭐ mini bos, 4, 👑 bos; bos pertama kali membuka area berikutnya; bisa diulang
     arena   : Arena Latihan — seperti field, soal & monster mengikuti level pemain
     dungeon : beberapa ruang beruntun (pahlawan berjalan antar ruang), HP TIDAK pulih; HP habis = keluar; ruang terakhir = bos + peti
     exam    : Ujian Naik Kelas — sejumlah soal campuran, musuh tidak menyerang, lulus bila cukup benar

   Serangan musuh berwaktu: bar "serangan" terisi selama soal tampil. Saat penuh, musuh menyerang.
   Jeda tiap monster berbeda (Data.styles / monster.spd) × pace tempat. Jawaban salah = musuh langsung menyerang.
   Waktu berhenti saat animasi jawaban, saat ada pesan, saat soal dibacakan (🔊), dan saat aplikasi tidak terlihat.
   Gambar pertarungan (latar bergerak, pahlawan berjalan, monster) digambar oleh scene.js (MQ.Scene). */
'use strict';
window.MQ = window.MQ || {};

MQ.Battle = (() => {
  const {rand, Questions, Audio, Sprites, Data, State, UI} = MQ;
  const sfx = Audio.sfx, S = State.S, BAL = MQ.Balance;
  const $ = id => document.getElementById(id);
  const els = {};
  ['scr-battle', 'overlay', 'fastBar', 'fastFill', 'btnExit', 'btnPotion', 'potionCount', 'fieldName', 'lvl', 'heroHpFill', 'heroHpText', 'xpFill', 'xpText',
   'count', 'combo', 'modes', 'mTop', 'mName', 'hpFill', 'hpText', 'atkBar', 'atkFill', 'fx', 'dots', 'question', 'arena', 'scene',
   'mTop2', 'mName2', 'hpFill2', 'hpText2', 'atkFill2',
   'qText', 'qView', 'btnSpeak', 'answers', 'thinkTag'].forEach(id => (els[id] = $(id)));
  const Scene = MQ.Scene;

  /* Status satu pertarungan. run = nomor sesi: dinaikkan saat masuk/keluar,
     sehingga timer dari sesi lama tidak lagi menyentuh layar (lihat later()). */
  const B = {run: 0, field: null, mode: 'field', combo: 0, hp: 0, maxHp: 1, isBoss: false, last: '', q: null, locked: true,
             room: 0, exam: null, charge: 0, interval: 3, tier: 0, mods: null, stage: 0, stops: [], isMini: false,
             slot: 0, other: null, story: 0};
  /* Dua monster: B.monId/B.hp/... = monster SASARAN; B.other = monster kedua (field sama). Ganti sasaran = tukar isinya. */
  const MF = ['monId', 'hp', 'maxHp', 'mLv', 'isBoss', 'isKey', 'isMini', 'charge', 'interval', 'slot'];
  function swapTarget() {
    if (!B.other || B.other.hp <= 0) return;
    MF.forEach(k => { const v = B[k]; B[k] = B.other[k]; B.other[k] = v; });
    Scene.setTarget(B.slot);
    els.mName.textContent = monLabel(B); updateHP(); renderOther();
  }
  /** Panel monster kedua (kanan atas arena). */
  function renderOther() {
    const o = B.other && B.other.hp > 0 ? B.other : null;
    els.mTop2.hidden = !o; els.arena.classList.toggle('pair', !!o);
    if (!o) return;
    els.mName2.textContent = monLabel(o);
    const p = o.hp / o.maxHp * 100;
    els.hpFill2.style.width = p + '%'; els.hpFill2.style.background = p > 50 ? '#38b764' : p > 25 ? '#ffcd75' : '#e43b44';
    els.hpText2.textContent = `HP ${o.hp} / ${o.maxHp}`;
  }
  const monLabel = M => (B.mode === 'exam' ? '📝 UJIAN: ' : M.isBoss ? '👑 BOS: ' : M.isKey ? '⭐ KUNCI: ' : M.isMini ? '⭐ MINI BOS: ' : '') +
    Data.monsters[M.monId].name + (B.mode === 'exam' ? '' : ` · Lv ${M.mLv}`);
  /** Pengubah kesulitan: tingkat dungeon atau Mode Pahlawan (balance.js), selain itu netral. */
  const NONE = {lvAdd: 0, hpMul: 1, dmgMul: 1, speedMul: 1, rewardMul: 1};
  const STORY_STARS = ['', ' ⭐⭐', ' ⭐⭐⭐'];
  /** Pengali waktu soal sekarang (soal pikir → musuh lebih sabar, batas KILAT lebih panjang). */
  const qTime = () => (B.q ? B.q.time || 1 : 1);
  /** Batas KILAT: Normal 2 dtk, makin singkat di Pahlawan/Legenda & dungeon ⭐⭐/⭐⭐⭐ (balance.combat.fastCritBy). */
  const kilatSec = () => {
    const by = BAL.combat.fastCritBy, i = B.mode === 'dungeon' ? B.tier : B.story || 0;
    return ((by && by[i]) || BAL.combat.fastCritSec) * qTime();
  };
  const mods = () => B.mods || NONE;
  const later = (fn, ms) => { const r = B.run; setTimeout(() => { if (r === B.run) fn(); }, ms); };
  const kills = () => S.fieldKills[B.field.id] || 0;
  const quest = (type, val) => { if (MQ.Quests) MQ.Quests.track(type, val); }; // misi harian


  /* ===== Tampilan ===== */
  function updateHud() {
    const max = State.maxHp(), p = Math.max(0, S.hp) / max * 100;
    els.lvl.textContent = `LV ${S.level}`;
    els.heroHpFill.style.width = p + '%';
    els.heroHpFill.style.background = p > 50 ? '#38b764' : p > 25 ? '#ffcd75' : '#e43b44';
    els.heroHpText.textContent = `HP ${Math.max(0, S.hp)} / ${max}`;
    UI.fillXp(els.xpFill, els.xpText);
    const pots = State.count('ramuan'); // tombol ramuan: tampil jika punya (bukan saat ujian), aktif jika HP belum penuh
    els.btnPotion.hidden = pots === 0 || B.mode === 'exam';
    const left = Math.max(0, BAL.combat.potionLimit - (B.potUsed || 0));
    els.potionCount.textContent = `×${pots} · ${left}/${BAL.combat.potionLimit}`; // punya × · sisa boleh diminum
    els.btnPotion.disabled = S.hp >= max || left <= 0;
    els.combo.textContent = B.combo >= BAL.combat.comboLabel ? `🔥 KOMBO x${B.combo}!` : B.combo > 0 ? `Beruntun ${B.combo}` : '';
    if (B.mode === 'exam') {
      els.count.textContent = `📝 Soal ${Math.min(B.exam.i + 1, B.exam.qs.length)} dari ${B.exam.qs.length} · Benar ${B.exam.ok}`;
    } else if (B.mode === 'arena') {
      const cur = kills() + 1, bossAt = Math.ceil(cur / 5) * 5; // Arena: bos setiap monster ke-5
      els.count.textContent = B.isBoss ? '👑 Pertarungan bos!' : `Bos setelah ${bossAt - cur} monster lagi`;
    } else els.count.textContent = ''; // area & dungeon: kemajuan ditunjukkan bar titik di arena
    renderDots();
  }

  /** Bar kemajuan titik/ruang di bawah arena: 1 – 2 – ⭐ – 4 – 👑. */
  function renderDots() {
    els.dots.hidden = !B.stops.length;
    els.dots.innerHTML = B.stops.map((type, i) => {
      const st = i < B.stage ? 'done' : i === B.stage ? 'now' : '';
      return (i ? '<i class="dotLine"></i>' : '') + `<span class="dot5 ${st}">${type === 'boss' ? '👑' : type === 'mini' ? '⭐' : i + 1}</span>`;
    }).join('');
  }

  function updateHP() {
    const p = B.hp / B.maxHp * 100;
    els.hpFill.style.width = p + '%';
    els.hpFill.style.background = p > 50 ? '#38b764' : p > 25 ? '#ffcd75' : '#e43b44';
    els.hpText.textContent = `HP ${B.hp} / ${B.maxHp}`;
  }

  /** Teks melayang. side 'hero' = di atas pahlawan (damage yang diterima). */
  /* Teks melayang bertumpuk rapi per sisi (tidak saling tindih), berlatar gelap supaya terbaca, & dijaga tetap di dalam layar. */
  const floatSlots = {hero: [], monster: []};
  function showFloat(text, cls, delay = 0, side = 'monster') {
    const s = document.createElement('span');
    s.className = 'float ' + cls; s.textContent = text;
    const slots = floatSlots[side === 'hero' ? 'hero' : 'monster'];
    let i = 0; while (slots[i]) i++;           // baris kosong pertama
    slots[i] = s;
    s.style.top = `calc(${side === 'hero' ? 46 : 34}% - ${i * 34}px)`;
    s.style.animationDelay = delay + 's';
    s.addEventListener('animationend', () => { s.remove(); if (slots[i] === s) slots[i] = null; });
    els.fx.appendChild(s);
    // tengah teks di atas pahlawan / monster, digeser bila kepanjangan supaya tidak keluar layar
    const W = els.fx.clientWidth || 300, w = s.offsetWidth, want = W * (side === 'hero' ? 0.27 : 0.62);
    s.style.left = Math.round(Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, want))) + 'px';
  }

  /* ===== Serangan musuh berwaktu ===== */
  /** Gaya bertarung monster sekarang: gaya bawaan jenis tubuhnya, bisa ditimpa per monster. */
  function style(M = B) {
    const m = Data.monsters[M.monId], base = Data.styles[m.sprite] || {spd: [3, 5], power: 1};
    return {spd: m.spd || base.spd, power: m.power || base.power};
  }
  /** Jeda serangan berikutnya (detik): acak dalam rentang monster × pace tempat; bos sedikit lebih lambat. */
  function newInterval(M = B) {
    const [a, b] = style(M).spd;
    return (a + Math.random() * (b - a)) * MQ.Calc.intervalMul(B.field.pace, M.isBoss) * mods().speedMul;
  }
  /** Damage serangan musuh: tergantung level tempat & kekuatan monster, dikurangi pertahanan pemain (min 1). */
  function enemyDamage(M = B) {
    const power = style(M).power * (M.isMini && !Data.monsters[M.monId].power ? 1.2 : 1); // mini bos sedikit lebih kuat
    const soft = 1 / Math.pow(qTime(), BAL.think.soft); // soal panjang: serangan musuh lebih lemah (bukan lebih lambat)
    return Math.max(1, Math.round(MQ.Calc.monsterDmg(M.mLv, power, M.isBoss) * (mods().dmgMul || 1) * soft) - State.def());
  }
  /** Level monster yang akan muncul (lihat rumus di balance.js):
      area  → titik 1 = level awal area, titik 4 = level akhir, bos = level akhir + bonus
      gua   → naik 1 level tiap ruang
      arena → sama dengan level pemain.  Bos mendapat bonus level. */
  function monsterLevel() {
    const M = BAL.monster;
    if (B.mode === 'arena') return S.level + (B.isBoss ? M.bossLevelBonus : 0);
    const [lo, hi] = B.field.lv;
    // area: naik merata dari level awal (titik 1) ke level akhir (titik 4); dungeon: +1 tiap ruang
    const steps = B.mode === 'dungeon' ? B.room - 1 : Math.floor((hi - lo) * Math.min(B.stage, 3) / 3);
    // Normal: level apa adanya; dungeon: + lvAdd tingkat; Pahlawan/Legenda: dipetakan ke rentang tingkatnya (balance.js)
    const base = Math.min(hi, lo + steps), L = B.isBoss ? Math.min(hi + M.bossLevelBonus, base + M.bossLevelBonus) : base;
    return MQ.Calc.storyLv(L, B.mods);
  }
  /** Jenis bunyi serangan: monster kuat & lambat (batu) berdentum, selain itu mengikuti jenis tubuh. */
  function soundKind(M = B) { const m = Data.monsters[M.monId]; return style(M).power >= 1.4 && m.sprite !== 'dragon' ? 'rock' : m.sprite; }
  /** Musik sesuai situasi: ujian, bos, dungeon, atau area biasa. */
  function battleMusic() {
    Audio.music.play(B.mode === 'exam' ? 'exam' : B.isBoss ? 'boss' : B.mode === 'dungeon' ? 'dungeon' : 'field');
  }
  /** Waktu musuh berjalan hanya saat anak sedang menjawab. */
  const timerActive = () => els['scr-battle'].classList.contains('on') && els.overlay.hidden && !B.locked &&
    (B.mode !== 'exam' || B.examAtk) && !S.settings.santai && !document.hidden && !MQ.Cutscene.isOpen() &&
    !(BAL.monster.pauseWhileReading && window.speechSynthesis && window.speechSynthesis.speaking) && !B.chest;

  /** Musuh menyerang. Mengembalikan true jika HP pemain habis. */
  function enemyAttack(M = B) {
    M.charge = 0; M.interval = newInterval(M);
    const dmg = enemyDamage(M);
    S.hp = Math.max(0, S.hp - dmg);
    sfx.enemy(soundKind(M)); setTimeout(sfx.hurt, 120); // bunyi serangan khas monster, lalu pahlawan terkena
    Scene.act('mon', 'atk', 0.45, M.slot); Scene.act('hero', 'hurt', 0.6);
    showFloat('-' + dmg, 'hurt', 0, 'hero');
    updateHud();
    if (S.hp > 0) return false;
    knockedOut();
    return true;
  }

  let lastT = 0, playSecs = 0;
  function tick(t) {
    requestAnimationFrame(tick);
    const dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0; // dibatasi agar jeda panjang tidak langsung menyerang
    lastT = t;
    // Catat lama bermain (untuk Laporan Orang Tua) selama layar pertarungan tampil
    if (els['scr-battle'].classList.contains('on') && !document.hidden) {
      playSecs += dt;
      if (playSecs >= 10) { State.logDay('t', Math.round(playSecs)); playSecs = 0; State.save(); }
    }
    // Waktu menjawab (untuk kritikal KILAT): berjalan selama soal bisa dijawab, berhenti saat soal dibacakan/pesan
    const answering = els['scr-battle'].classList.contains('on') && els.overlay.hidden && !B.locked && !document.hidden &&
      !MQ.Cutscene.isOpen() && !(window.speechSynthesis && window.speechSynthesis.speaking);
    if (answering && B.mode !== 'exam') {
      B.answerTime += dt;
      els.fastFill.style.width = Math.max(0, 1 - B.answerTime / kilatSec()) * 100 + '%';
    }
    if (!timerActive()) return;
    const rate = dt / Math.pow(qTime(), BAL.think.slow); // think.slow 0 = kecepatan musuh tetap normal
    B.charge += rate;
    els.atkFill.style.width = Math.min(100, B.charge / B.interval * 100) + '%';
    Scene.charge(B.slot, B.charge / B.interval); // monster bersiap menyerang (animasi ancang-ancang)
    const o = B.other && B.other.hp > 0 ? B.other : null; // monster kedua menyerang dengan waktunya sendiri
    if (o) { o.charge += rate; els.atkFill2.style.width = Math.min(100, o.charge / o.interval * 100) + '%'; Scene.charge(o.slot, o.charge / o.interval); }
    if (B.charge >= B.interval) enemyAttack();
    else if (o && o.charge >= o.interval) enemyAttack(o);
  }
  requestAnimationFrame(tick);

  /** HP habis: field/arena → istirahat lalu HP penuh; dungeon → keluar gua. Tidak ada game over. */
  function knockedOut() {
    B.locked = true; B.combo = 0;
    State.save();
    // Pingsan: istirahat beberapa menit + pelajaran tentang soal yang paling sering salah
    const weak = Object.entries(B.wrongs || {}).sort((a, b) => b[1] - a[1])[0];
    const kind = weak ? weak[0] : (B.q && B.q.kind) || 'tambah', max = (B.field.spec && B.field.spec.max) || 10;
    if (MQ.Learn.knockOut(kind, max)) {
      S.hp = State.maxHp(); State.save(); // HP pulih saat bangun nanti
      const K = BAL.knockout, les = MQ.Learn.LESSONS[S.rest.kind];
      return later(() => UI.overlay({icon: '😵', title: 'Pahlawan Pingsan!',
        text: `HP-mu habis. Pahlawan harus istirahat ${K.lockMin} menit dulu.` + (K.mustLearn ? ` Sambil menunggu, ayo belajar "${les.title}" supaya lebih kuat!` : ''),
        btn: K.mustLearn ? '🎓 Belajar' : 'Oke', cb: () => { exit(); if (K.mustLearn) MQ.Learn.openRest(); },
        btn2: K.mustLearn ? 'Nanti' : null, cb2: () => { exit(); UI.show('home'); }}), 900);
    }
    later(() => {
      if (B.mode === 'dungeon') return dungeonEnd(false);
      UI.overlay({icon: '💤', title: 'Pahlawan Istirahat', btn: 'Ayo Lanjut!',
        text: 'HP-mu habis. Pahlawan tidur sebentar untuk mengisi tenaga. HP sudah penuh lagi. Ayo semangat!',
        cb: () => { S.hp = State.maxHp(); B.charge = 0; if (B.other) B.other.charge = 0; updateHud(); nextQuestion(); }});
    }, 900);
  }

  /* ===== Masuk & keluar ===== */
  /** opt.tier = tingkat dungeon (0 = ⭐). Area biasa memakai Mode Pahlawan bila dinyalakan. */
  function start(place, opt = {}) {
    if (MQ.Learn && !MQ.Learn.gate()) return; // pahlawan masih istirahat setelah pingsan
    if (MQ.Daily && !MQ.Daily.gate()) return; // batas main harian / jam tidur dari orang tua
    B.run++; B.wrongs = {}; B.potUsed = 0; // ramuan yang sudah diminum di pertarungan ini
    B.field = place; B.combo = 0; B.q = null; B.last = ''; B.room = 0;
    B.mode = place.exam ? 'exam' : place.dungeon ? 'dungeon' : place.id === 'arena' ? 'arena' : 'field';
    B.tier = B.mode === 'dungeon' ? (opt.tier || 0) : 0;
    B.story = B.mode === 'field' || B.mode === 'exam' ? storyMode() : 0; // 0 Normal, 1 Pahlawan, 2 Legenda
    B.examAtk = B.mode === 'exam' && B.story > 0; // ujian Pahlawan/Legenda: musuh tetap menyerang
    B.mods = B.mode === 'dungeon' ? BAL.tiers[B.tier] : MQ.Calc.modeCfg(B.story, S.kelas);
    B.other = null;
    if (B.mode === 'exam') B.exam = {i: 0, ok: 0, wrong: {}, qs: makeExam()};
    if (B.mode === 'dungeon') sfx.door(); // pintu dungeon berderit terbuka
    S.hp = State.maxHp();
    els.fieldName.textContent = place.name + (B.mode === 'dungeon' ? ' ' + '⭐'.repeat(B.tier + 1) : STORY_STARS[B.story]);
    els.btnExit.textContent = B.mode === 'dungeon' ? '◀ Keluar' : '◀ Peta';
    els.modes.hidden = B.mode !== 'arena'; // pilihan jenis soal hanya di Arena Latihan
    els.atkBar.hidden = (B.mode === 'exam' && !B.examAtk) || S.settings.santai; // ujian & Mode Santai: musuh tidak menyerang berwaktu
    els.fx.innerHTML = '';
    renderModes();
    // Jalur: area = 5 titik, dungeon = ruang-ruangnya, Arena/Ujian = tanpa jalur
    B.stage = 0; B.chest = null; B.chestDone = false;
    B.stops = B.mode === 'field' ? ['', '', 'mini', '', 'boss']
      : B.mode === 'dungeon' ? Array.from({length: place.rooms}, (_, i) => (i === place.rooms - 1 ? 'boss' : i + 1 === place.keyRoom ? 'mini' : '')) : [];
    UI.show('battle');
    Scene.setup(place.id, B.stops);
    Scene.setHero({draw: MQ.Hero.currentCanvas}); // penampilan + equipment terbaru, beranimasi
    Scene.start();
    updateHud();
    goStage();
  }

  /** Berjalan ke titik/ruang berikutnya, lalu monster muncul. Arena & Ujian: langsung. */
  function goStage() {
    B.locked = true;
    els.mTop.hidden = true; B.other = null; renderOther();
    if (!B.stops.length) { els.mTop.hidden = false; spawnMonster(); nextQuestion(); return; }
    const n = B.stage + 1, type = B.stops[B.stage];
    els.question.classList.add('walking'); els.answers.classList.add('walking');
    els.qView.hidden = true; els.fastBar.hidden = true; els.thinkTag.hidden = true;
    els.qText.classList.remove('long');
    els.qText.textContent = ''; // kotak soal & jawaban disembunyikan sampai bertemu monster (2026-11-26)
    els.answers.className = 'walking';
    els.answers.innerHTML = '<button class="ans">.</button><button class="ans">.</button><button class="ans">.</button><button class="ans">.</button>';
    renderDots();
    const r = B.run;
    Scene.walkTo(B.stage, () => {
      if (r !== B.run) return; // sudah keluar / mulai ulang
      els.mTop.hidden = false;
      spawnMonster(); nextQuestion();
    });
  }

  function exit() {
    B.run++; B.locked = true;
    Scene.stop();
    if (playSecs >= 1) { State.logDay('t', Math.round(playSecs)); playSecs = 0; } // sisa waktu main yang belum tercatat
    State.save();
    UI.show(B.mode === 'dungeon' ? 'dungeon' : 'map');
  }
  els.btnExit.addEventListener('click', exit);
  /* Jeda: memakai jendela pesan (waktu musuh & KILAT otomatis berhenti selama pesan terbuka); soal & jawaban diburamkan
     supaya tidak bisa dipikirkan diam-diam saat jeda. */
  document.getElementById('btnPause').addEventListener('click', () => {
    if (!els['scr-battle'].classList.contains('on') || !els.overlay.hidden) return;
    els['scr-battle'].classList.add('paused'); sfx.click();
    UI.overlay({icon: '⏸️', title: 'Jeda', text: 'Pertarungan berhenti sebentar. Monster juga menunggu!', btn: '▶ Lanjut',
      cb: () => els['scr-battle'].classList.remove('paused')});
  });
  /** Mode cerita yang berlaku (dipilih di Peta): Pahlawan setelah lulus ujian, Legenda setelah 6 bos Pahlawan. */
  const storyMode = () => State.storyMode();
  /** Di titik/ruang ini muncul dua monster? (balance.js pairs; tidak untuk bos, mini bos, monster kunci) */
  function pairHere() {
    if (B.isBoss || B.isKey || B.isMini) return false;
    if (B.mode === 'field') return ((BAL.pairs.story || {})[B.story] || []).includes(B.stage);
    if (B.mode === 'dungeon') return B.tier === 1 ? B.room === B.field.rooms - 1 : B.tier === 2 ? B.room % 2 === 0 : false;
    return false;
  }

  /* ===== Monster ===== */
  function spawnMonster() {
    const f = B.field;
    B.isMini = false;
    if (B.mode === 'dungeon') { B.room = B.stage + 1; B.isBoss = B.room === f.rooms; }
    else if (B.mode === 'exam') B.isBoss = true;
    else if (B.mode === 'field') { B.isBoss = B.stops[B.stage] === 'boss'; B.isMini = B.stops[B.stage] === 'mini'; }
    else B.isBoss = (kills() + 1) % 5 === 0;
    B.isKey = B.mode === 'dungeon' && !B.isBoss && !!f.key && B.room === f.keyRoom; // monster kunci di tengah dungeon
    let id = B.isKey ? f.key : B.isMini && f.mini ? f.mini : f.boss;
    if (!B.isBoss && !B.isKey && !(B.isMini && f.mini)) { // mini bos tanpa monster khusus = monster biasa yang lebih besar // monster biasa: acak, jangan sama berturut-turut
      const pool = f.mobs.filter(m => m !== B.last);
      id = pool.length ? pool[rand(0, pool.length - 1)] : f.mobs[0];
      B.last = id;
    }
    B.monId = id; B.slot = 0; Scene.setTarget(0);
    const m = Data.monsters[id];
    if (B.mode === 'exam') { // HP ujian = jumlah soal × 10; tiap jawaban benar -10
      B.maxHp = B.exam.qs.length * 10;
      if (B.examAtk) B.mLv = monsterLevel(); // ujian Pahlawan/Legenda: naga menyerang sesuai levelnya
    } else {
      B.mLv = monsterLevel();
      B.maxHp = Math.round(MQ.Calc.monsterHp(B.mLv, B.isBoss ? 'boss' : B.isKey || B.isMini ? 'key' : '') * (mods().hpMul || 1) * (m.hpMul || 1));
    }
    B.hp = B.maxHp;
    B.interval = newInterval();
    B.charge = Math.min(0.9, Math.max(0, BAL.monster.startCharge)) * B.interval; // bisa dibuat langsung "siap menyerang"
    els.atkFill.style.width = B.charge / B.interval * 100 + '%';
    els.mName.textContent = monLabel(B);
    // Gambar baru (pixelart.js) bila sudah ada; selain itu sprite lama diperbesar (bos & mini bos lebih besar)
    const pix = MQ.Pix.has(id) ? id : null, size = Sprites.rowsOf(Sprites.DATA[m.sprite])[0].length;
    const big = B.isBoss ? 1.3 : B.isMini || B.isKey ? 1.15 : 1;
    Scene.setMonster(pix ? {pix} : {url: Sprites.url(m.sprite, m.pal), size, mul: 2}, B.stops.length ? B.stage : 0,
                     {scale: pix ? (B.isMini && !f.mini ? 1.2 : 1) : big});
    // Monster kedua (Mode Pahlawan/Legenda, dungeon ⭐⭐/⭐⭐⭐): monster biasa lain, level sama, waktu serang sendiri
    B.other = null;
    if (pairHere()) {
      const pool = f.mobs.filter(x => x !== id), oid = pool.length ? pool[rand(0, pool.length - 1)] : id, om = Data.monsters[oid];
      const o = {monId: oid, mLv: B.mLv, isBoss: false, isKey: false, isMini: false, slot: 1};
      o.maxHp = o.hp = Math.round(MQ.Calc.monsterHp(o.mLv, '') * (mods().hpMul || 1) * (om.hpMul || 1));
      o.interval = newInterval(o); o.charge = o.interval * 0.45; // mulai setengah jalan supaya tidak menyerang bersamaan
      B.other = o;
      const osize = Sprites.rowsOf(Sprites.DATA[om.sprite])[0].length;
      Scene.setMonster(MQ.Pix.has(oid) ? {pix: oid} : {url: Sprites.url(om.sprite, om.pal), size: osize, mul: 2}, B.stops.length ? B.stage : 0, {}, 1);
    }
    renderOther();
    updateHP();
    battleMusic();
  }

  /* ===== Soal ===== */
  /** Soal ujian: 2 soal dari setiap area kelas yang sedang dimainkan, berurutan dari yang termudah. */
  function makeExam() {
    return Data.fields.filter(f => f.spec).flatMap(f => [Questions.make(f.spec), Questions.make(f.spec)]);
  }

  function nextQuestion() {
    let q;
    if (B.mode === 'exam') q = B.exam.qs[B.exam.i];
    else {
      const spec = B.field.spec || Questions.specForLevel(S.level, S.mode);
      const key = x => x.text + '|' + x.ans + '|' + (x.view || '');
      let tries = 0;
      do { q = Questions.make(spec); } while (B.q && key(q) === key(B.q) && ++tries < 5); // hindari soal kembar
    }
    showQuestion(q);
  }
  /** Tampilkan soal di panel (soal pertarungan maupun teka-teki peti). */
  function showQuestion(q) {
    B.q = q;
    els.question.classList.remove('walking'); els.answers.classList.remove('walking');
    B.answerTime = 0; els.fastFill.style.width = '100%';
    els.fastBar.hidden = B.mode === 'exam' || q.think; // ujian: tanpa kritikal; soal pikir: tanpa KILAT
    els.thinkTag.hidden = B.mode === 'exam' || !q.think;
    els.thinkTag.textContent = B.chest ? '📜 Peti Teka-teki: tanpa waktu, pikirkan pelan-pelan!' : '🧠 Soal pikir: serangan musuh lebih lemah, yang penting teliti!';
    els.qText.textContent = q.text;
    els.qText.classList.toggle('long', q.text.length > 12); // kalimat panjang → huruf sedikit lebih kecil
    els.qText.classList.toggle('story', !!q.story);          // soal cerita: kalimat, huruf biasa
    els.qView.innerHTML = q.view || '';  // gambar buatan visuals.js (bukan masukan pengguna)
    els.qView.hidden = !q.view;
    els.answers.className = 'cols' + q.cols + (q.choices[0].html.startsWith('<svg') ? ' pics' : ''); // pilihan bergambar → latar netral
    els.answers.innerHTML = '';
    q.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'ans'; b.innerHTML = c.html; b.dataset.v = c.v;
      b.setAttribute('aria-label', c.v);
      b.addEventListener('click', () => answer(b, c.v));
      els.answers.appendChild(b);
    });
    updateHud();
    B.locked = false;
    if (S.settings.autoSpeak || (q.story && BAL.think.storySpeak)) Audio.speak(q.speak); // pengaturan orang tua: bacakan setiap soal
  }

  /* Ganti sasaran: ketuk monster di arena atau panel monster kedua */
  els.scene.addEventListener('pointerdown', e => {
    if (!B.other || B.other.hp <= 0) return;
    const slot = Scene.hitTest(e.clientX, e.clientY);
    if (slot >= 0 && slot !== B.slot) { swapTarget(); sfx.click(); }
  });
  els.mTop2.addEventListener('click', () => { if (B.other && B.other.hp > 0) { swapTarget(); sfx.click(); } });

  /* Tombol 🔊: bacakan soal (untuk anak yang belum lancar membaca) */
  els.btnSpeak.addEventListener('click', () => { if (B.q) Audio.speak(B.q.speak); });

  function answer(btn, val) {
    if (B.locked) return;
    B.locked = true;
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* - */ } // sudah menjawab → berhenti membacakan (agar musuh tidak tertahan)
    if (B.chest) return chestAnswer(btn, val);
    const q = B.q, stat = S.stats[q.kind] || (S.stats[q.kind] = {b: 0, s: 0});
    const exam = B.mode === 'exam';
    if (val === q.ans) {
      // BENAR → pahlawan menyerang; 3+ beruntun = kritis (2×). Ujian: tiap benar = -10 HP tetap.
      stat.b++; State.logDay('b', 1);
      if (MQ.Daily && MQ.Daily.onCorrect()) showFloat('🌟 Target hari ini tercapai!', 'xp', 0.5); // stempel kalender
      btn.classList.add('benar');
      B.combo++; S.bestCombo = Math.max(S.bestCombo, B.combo);
      quest('correct', q.kind); quest('combo', B.combo);
      // Kritikal: pasti jika menjawab cepat (KILAT), selain itu peluang acak dari status & equipment
      const fast = !exam && !q.think && B.answerTime <= kilatSec();
      const teliti = !exam && q.think; // soal pikir: benar = serangan TELITI!
      if (fast) { S.kilat++; quest('kilat'); } // medali "Secepat Kilat" & misi KILAT
      const crit = !exam && (fast || Math.random() * 100 < State.critChance()), [lo, hi] = State.atk();
      const extra = exam ? 0 : State.bonusFor(q.kind); // senjata bertopik: damage tambahan untuk jenis soal ini
      const tahan = exam ? 1 : Data.monsters[B.monId].tahan || 1; // monster keras (batu) menerima damage lebih kecil
      const dmg = exam ? 10 : Math.max(1, Math.round((rand(lo, hi) + extra) * (crit ? State.critMul() : teliti ? BAL.think.telitiMul : 1) * tahan));
      if (tahan < 1) showFloat('🛡️ Keras!', 'loot', 0.3);
      if (extra) showFloat('⚔️ Bonus senjata!', 'xp', 0.15);
      if (exam) B.exam.ok++;
      B.hp = Math.max(0, B.hp - dmg);
      crit ? sfx.crit() : sfx.correct();
      sfx.slash();
      Scene.slash(crit, B.slot, fast); // pahlawan menerjang; efek benturan saat senjata mengenai (scene.js)
      showFloat(exam ? '✔ Benar!' : (fast ? '⚡KILAT! ' : crit ? 'KRITIS! ' : teliti ? '🧠TELITI! ' : '') + '-' + dmg, crit || teliti ? 'crit' : '');
      updateHP(); updateHud();
      later(exam ? examNext : B.hp <= 0 ? defeatMonster : nextQuestion, 750);
    } else {
      // SALAH → jawaban benar ditunjukkan, kombo hilang, musuh langsung menyerang. Ujian: tanpa serangan.
      stat.s++;
      btn.classList.add('salah');
      [...els.answers.children].find(b => b.dataset.v === q.ans).classList.add('benar');
      B.combo = 0; B.wrongs[q.kind] = (B.wrongs[q.kind] || 0) + 1;
      sfx.wrong();
      State.logDay('s', 1);
      if (exam) { Scene.act('hero', 'hurt', 0.6); B.exam.wrong[q.kind] = (B.exam.wrong[q.kind] || 0) + 1; updateHud(); return later(examNext, 1400); }
      // Petunjuk bergambar menggantikan gambar soal sebentar, jeda lebih lama agar sempat dilihat
      const hint = q.hint && q.hint();
      if (hint) { els.qView.innerHTML = hint; els.qView.hidden = false; }
      if (!enemyAttack()) later(nextQuestion, hint ? 3000 : 1400); // HP habis → knockedOut() yang melanjutkan
    }
  }

  /* ===== Monster kalah: XP, hadiah, pesan ===== */
  function defeatMonster() {
    const f = B.field, wasBoss = B.isBoss, wasKey = B.isKey, dungeon = B.mode === 'dungeon';
    const otherAlive = !!(B.other && B.other.hp > 0);
    Scene.defeat(B.slot); if (B.stops.length && !otherAlive) els.mTop.hidden = true;
    sfx.defeat();
    S.monsters++;
    MQ.Collection.recordKill(B.monId); // Buku Monster
    if (!dungeon) S.fieldKills[f.id] = kills() + 1;
    quest('kill'); if (wasBoss) quest('boss');
    // Di luar dungeon, HP pulih 20% setiap mengalahkan monster
    if (!dungeon) {
      const heal = Math.min(State.maxHp() - S.hp, Math.round(State.maxHp() * BAL.combat.healOnKillPct / 100));
      if (heal > 0) { S.hp += heal; showFloat(`+${heal} HP`, 'heal', 0.1, 'hero'); }
    }
    // XP berkurang jika pemain sudah jauh di atas level tempat (Arena: selalu penuh)
    // XP sesuai level monster; dikurangi jika pemain jauh lebih kuat (kecuali Arena). Rumus di balance.js.
    const X = BAL.xp;
    let gain = (X.monsterBase + X.perMonsterLevel * B.mLv) * (wasBoss ? X.bossMul : wasKey ? 2 : 1);
    const gap = S.level - B.mLv;
    const factor = B.mode === 'arena' || gap < X.penaltyFrom ? 1 : Math.max(X.minFactor, 1 - X.penaltyStep * (gap - X.penaltyFrom + 1));
    gain = Math.max(1, Math.round(gain * factor * (1 + State.effect('xp') / 100))); // + aksesori XP
    if (factor < 1) showFloat('XP kecil: musuh terlalu lemah', 'loot', 0.8);
    showFloat(`+${gain} XP`, 'xp');
    const leveled = State.addXp(gain);

    // Hadiah: koin + bahan. Bos: lebih banyak koin, 3 bahan, dan 1 Mahkota Kecil.
    const mon = Data.monsters[B.monId];
    const R = BAL.rewards;
    const coins = Math.round(((wasBoss ? R.coinsBoss : rand(R.coinsNormal[0], R.coinsNormal[1])) + State.effect('coins')) * mods().rewardMul);
    S.coins += coins;
    showFloat(`+${coins} koin`, 'coin', 0.25);
    Scene.coins(Math.min(10, coins), B.slot); // koin melompat keluar lalu terbang ke pojok (dompet)
    later(sfx.coin, 300);
    const loot = wasBoss ? [[mon.drop, R.bossDrops], ['mahkota', 1]] : Math.random() < R.dropChance ? [[mon.drop, 1]] : [];
    loot.forEach(([id, n], i) => { State.addItem(id, n); showFloat(`+${n} ${Data.items[id].name}`, 'loot', 0.5 + i * 0.25); });
    if (loot.length) later(sfx.loot, 550);
    const firstClear = wasBoss && B.mode === 'field' && !B.story && !S.cleared.includes(f.id);
    if (firstClear) S.cleared.push(f.id);
    const clearedList = B.story === 2 ? S.legendCleared : B.story === 1 ? S.heroCleared : null;
    const heroClear = wasBoss && clearedList && !clearedList.includes(f.id); // bos pertama kali kalah di Mode Pahlawan/Legenda
    if (heroClear) clearedList.push(f.id);
    State.save(); updateHud();

    // Pesan yang perlu ditampilkan, satu per satu, lalu monster berikutnya
    const steps = [];
    if (leveled) steps.push(done => {
      if (!dungeon) S.hp = State.maxHp(); // di dungeon HP tetap tidak pulih
      updateHud(); sfx.levelUp();
      const chips = [{icon: '⭐', text: `+${BAL.player.pointsPerLevel} poin status`}];
      if (!dungeon) chips.unshift({icon: '❤️', text: 'HP penuh lagi'});
      UI.overlay({fx: 'level', level: S.level, from: S.level - 1, sub: '✨ HEBAT SEKALI!', title: 'Naik Level!', btn: 'Siap!', cb: done, chips,
        text: `Kamu punya ${S.points} poin status. Atur di Karakter untuk menambah HP, Serangan, atau Pertahanan!`});
    });
    if (firstClear) steps.push(done => MQ.Cutscene.play(`${f.id}-shard`, done)); // cerita: kepingan kristal
    if (wasKey) steps.push(done => MQ.Cutscene.playOnce(`${f.id}-key`, done));   // cerita dungeon: setelah monster kunci

    steps.push(done => MQ.Collection.check(done)); // medali baru (jika ada)
    const run = () => {
      const s = steps.shift();
      if (s) return s(run);
      if (dungeon && wasBoss) return dungeonEnd(true);
      if (otherAlive) { swapTarget(); B.other = null; renderOther(); return nextQuestion(); } // masih ada monster kedua
      if (B.mode === 'field' && wasBoss) return fieldEnd(firstClear, heroClear);
      if (B.stops.length) return maybeChest(() => { B.stage++; goStage(); });
      spawnMonster(); nextQuestion();
    };
    later(run, 900);
  }

  /* ===== Peti Teka-teki (area): kadang muncul setelah titik 2 / 4; soal tanpa waktu, hadiah bila terbuka ===== */
  function maybeChest(next) {
    const C = BAL.chest;
    if (B.mode !== 'field' || B.chestDone || !C.at.includes(B.stage) || Math.random() >= C.chance) return next();
    B.chestDone = true; B.chest = {tries: 0, next};
    els.mTop.hidden = true;
    Scene.setMonster({pix: 'peti'}, B.stage);
    showFloat('📜 Peti Teka-teki!', 'loot', 0);
    sfx.loot();
    showQuestion(Questions.make({kinds: ['teka'], max: B.field.spec.max}));
  }
  function chestAnswer(btn, val) {
    const q = B.q, ch = B.chest, C = BAL.chest, stat = S.stats[q.kind] || (S.stats[q.kind] = {b: 0, s: 0});
    if (val !== q.ans) { // tanpa hukuman: tombol itu mati, petunjuk muncul, coba lagi
      ch.tries++; stat.s++; State.logDay('s', 1);
      sfx.wrong(); btn.classList.add('salah'); btn.disabled = true;
      const h = q.hint && q.hint();
      if (h) { els.qView.innerHTML = h; els.qView.hidden = false; }
      B.locked = false;
      return;
    }
    stat.b++; State.logDay('b', 1); if (MQ.Daily) MQ.Daily.onCorrect();
    quest('chest');
    btn.classList.add('benar'); sfx.correct();
    const first = ch.tries === 0, mul = mods().rewardMul;
    const coins = Math.round((first ? C.coins[0] : C.coins[1]) * mul);
    S.coins += coins;
    Scene.defeat(0); Scene.act('hero', 'atk', 0.4);
    showFloat(first ? '✨ Peti terbuka!' : 'Peti terbuka!', 'loot', 0);
    showFloat(`+${coins} koin`, 'coin', 0.3);
    Scene.coins(Math.min(10, coins), 0);
    if (first) {
      const id = Data.monsters[MQ.pick(B.field.mobs)].drop, n = C.items;
      State.addItem(id, n); showFloat(`+${n} ${Data.items[id].name}`, 'loot', 0.6);
    }
    later(sfx.loot, 300);
    State.save(); updateHud();
    later(() => { B.chest = null; ch.next(); }, 1800);
  }

  /* ===== Area selesai (bos titik 5 kalah): ulangi atau ke peta ===== */
  function fieldEnd(firstClear, heroClear) {
    const f = B.field, boss = Data.monsters[f.boss].name;
    const nxt = firstClear && Data.fields.find(x => x.req === f.id && !x.soon), dun = firstClear && Data.dungeons.find(x => x.req === f.id);
    sfx.fanfare();
    const list = B.story === 2 ? S.legendCleared : S.heroCleared, modeName = B.story === 2 ? 'Legenda ⭐⭐⭐' : 'Pahlawan ⭐⭐';
    const text = heroClear ? `Kamu mengalahkan ${boss} di Mode ${modeName}! (${list.length} dari ${State.mainFields().length})`
      : `Kamu melewati 5 titik dan mengalahkan ${boss}! ` + (nxt ? `Tempat baru terbuka: ${nxt.name}. ` : '') +
        (dun ? `Dungeon baru: ${dun.name} (menu 🏰 Dungeon). ` : '') + (firstClear ? '' : 'Ulangi untuk XP, koin & bahan.');
    UI.overlay({icon: heroClear ? '🦸' : '🏆', title: 'Area Selesai!', btn: 'Ke Peta', cb: () => MQ.Collection.check(exit),
                btn2: 'Ulangi area', cb2: () => start(f), text});
  }

  /* ===== Dungeon selesai (menang) atau HP habis ===== */
  function dungeonEnd(won) {
    const f = B.field;
    if (!won) {
      return UI.overlay({icon: '🏃', title: `Keluar dari ${f.name}`, btn: 'Keluar', cb: exit,
        text: `HP-mu habis di ruang ${B.room}. Koin & bahan yang sudah didapat tetap milikmu. Coba lagi kapan saja!`});
    }
    if (!S.cleared.includes(f.id)) S.cleared.push(f.id);
    const firstStar = (S.dungeonStars[f.id] || 0) <= B.tier;
    MQ.Dungeon.cleared(f.id, B.tier);
    const mul = mods().rewardMul, r = f.reward, coins = Math.round(r.coins * mul);
    const items = Object.entries(r.items).map(([id, n]) => [id, Math.round(n * mul)]);
    S.coins += coins;
    items.forEach(([id, n]) => State.addItem(id, n));
    quest('dungeon');
    State.save();
    sfx.chest();
    const list = items.map(([id, n]) => `${n} ${Data.items[id].name}`).join(', ');
    const nextTier = firstStar && B.tier < BAL.tiers.length - 1 ? ` Tingkat ${'⭐'.repeat(B.tier + 2)} terbuka!` : '';
    // cerita penutup dungeon (sekali), lalu peti harta
    const chips = [{img: MQ.ItemArt.url('coin'), text: `+${coins} koin`}].concat(items.map(([id, n]) => ({img: MQ.ItemArt.url(id) || '', text: `+${n} ${Data.items[id].name}`})));
    MQ.Cutscene.playOnce(`${f.id}-end`, () => UI.overlay({fx: 'chest', sub: `${f.name} ${'⭐'.repeat(B.tier + 1)}`, title: 'Peti Harta!', btn: 'Keluar',
      cb: () => MQ.Collection.check(exit), chips, text: `Kamu menaklukkan ${f.name}!${nextTier}`}));
  }

  /* ===== Ujian ===== */
  function examNext() {
    B.exam.i++;
    if (B.exam.i < B.exam.qs.length) return nextQuestion();
    const {ok, qs, wrong} = B.exam, N = qs.length, need = Math.ceil(N * 0.75);
    const pass = ok >= need;
    if (!B.field.kelas) S.examBest = Math.max(S.examBest, ok); // nilai terbaik Ujian Kelas 1
    if (!pass) {
      State.save();
      const weak = Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => Questions.NAMES[k] || k).join(', ');
      return UI.overlay({icon: '📚', title: 'Belum Lulus', btn: 'Coba Lagi', cb: () => start(B.field), btn2: 'Ke Peta', cb2: exit,
        text: `Benar ${ok} dari ${N}. Perlu ${need} untuk lulus. Ayo latihan lagi: ${weak}. Kamu pasti bisa!`});
    }
    Scene.defeat();
    if (B.story > 0) return storyExamPass(ok, N);
    const K = B.field.kelas || 1, first = S.grade <= K; // lulus ujian Normal kelas K → kelas K+1 terbuka
    S.grade = Math.max(S.grade, K + 1);
    if (!S.cleared.includes(B.field.id)) S.cleared.push(B.field.id);
    if (first) { S.coins += 30; State.addItem('mahkota', 2); }
    State.save();
    sfx.fanfare();
    const stars = '⭐'.repeat(ok === N ? 3 : ok >= N - 2 ? 2 : 1);
    const result = () => UI.overlay({icon: '🎓', title: `Lulus Kelas ${K}!`, btn: 'Ke Peta', cb: () => MQ.Collection.check(exit),
      text: `${stars} Benar ${ok} dari ${N}. ` + (first ? `Hadiah: 30 koin & 2 Mahkota Kecil. Petualangan Kelas ${K + 1} terbuka (pilih 🎒 Kelas di Peta)! Tingkat Pahlawan ⭐⭐ Kelas ${K} juga terbuka.` : 'Kamu tetap juara!')});
    later(() => (first && K === 1 ? MQ.Cutscene.play('ending', result) : result()), 900); // lulus pertama kali → cerita penutup
  }

  /** Lulus ujian di Pahlawan/Legenda: bukan syarat naik kelas, tapi membuka tingkat berikutnya + hadiah. */
  function storyExamPass(ok, N) {
    const list = State.modeList(B.story), first = !list.includes(B.field.id);
    if (first) { list.push(B.field.id); S.coins += B.story === 2 ? 150 : 80; State.addItem('mahkota', B.story === 2 ? 5 : 3); }
    State.save(); sfx.fanfare();
    const name = B.story === 2 ? 'Legenda ⭐⭐⭐' : 'Pahlawan ⭐⭐';
    later(() => UI.overlay({icon: B.story === 2 ? '🐉' : '🦸', title: `Lulus Ujian ${name}!`, btn: 'Ke Peta', cb: () => MQ.Collection.check(exit),
      text: `Benar ${ok} dari ${N}. ` + (first ? `Hadiah: ${B.story === 2 ? '150 koin & 5' : '80 koin & 3'} Mahkota Kecil.` +
            (B.story === 1 ? ' Tingkat Legenda ⭐⭐⭐ sekarang terbuka!' : ' Kamu benar-benar legenda!') : 'Kamu tetap juara!')}), 900);
  }

  /* ===== Ramuan Penyembuh: HP penuh ===== */
  els.btnPotion.addEventListener('click', () => {
    if (!State.count('ramuan') || S.hp >= State.maxHp() || S.hp <= 0) return;
    if ((B.potUsed || 0) >= BAL.combat.potionLimit) { showFloat(`Batas ${BAL.combat.potionLimit} ramuan per pertarungan`, 'loot', 0, 'hero'); return; }
    B.potUsed = (B.potUsed || 0) + 1;
    State.removeItem('ramuan');
    const heal = State.maxHp() - S.hp;
    S.hp = State.maxHp();
    sfx.potion(); showFloat(`+${heal} HP`, 'heal', 0, 'hero');
    State.save(); updateHud();
  });

  /* ===== Pilihan jenis soal (Arena Latihan) ===== */
  const modeBtns = els.modes.querySelectorAll('.mode');
  function renderModes() { modeBtns.forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode)); }
  modeBtns.forEach(b => b.addEventListener('click', () => {
    S.mode = b.dataset.mode; renderModes(); State.save();
    if (!B.locked) nextQuestion(); // saat animasi, soal berikutnya otomatis ikut mode baru
  }));

  els.btnPotion.querySelector('img').src = MQ.ItemArt.url('ramuan');

  // currentQuestion & state: untuk pengujian otomatis
  return {start, currentQuestion: () => B.q, debug: () => ({charge: B.charge, interval: B.interval, mode: B.mode, monId: B.monId})};
})();
