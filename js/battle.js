/* Math Quest — layar pertarungan. Dimulai dari peta lewat MQ.Battle.start(tempat).

   Empat mode (B.mode):
     field   : area biasa — tanpa akhir, bos tiap monster ke-5, bos pertama membuka area berikutnya
     arena   : Arena Latihan — seperti field, soal & monster mengikuti level pemain
     dungeon : beberapa ruang beruntun, HP TIDAK pulih; HP habis = keluar gua; ruang terakhir = bos + peti
     exam    : Ujian Naik Kelas — sejumlah soal campuran, musuh tidak menyerang, lulus bila cukup benar

   Serangan musuh berwaktu: bar "serangan" terisi selama soal tampil. Saat penuh, musuh menyerang.
   Jeda tiap monster berbeda (Data.styles / monster.spd) × pace tempat. Jawaban salah = musuh langsung menyerang.
   Waktu berhenti saat animasi jawaban, saat ada pesan, saat soal dibacakan (🔊), dan saat aplikasi tidak terlihat. */
'use strict';
window.MQ = window.MQ || {};

MQ.Battle = (() => {
  const {rand, Questions, Audio, Sprites, Data, State, UI} = MQ;
  const sfx = Audio.sfx, S = State.S, BAL = MQ.Balance;
  const $ = id => document.getElementById(id);
  const els = {};
  ['scr-battle', 'overlay', 'fastBar', 'fastFill', 'btnExit', 'btnPotion', 'potionCount', 'fieldName', 'lvl', 'heroHpFill', 'heroHpText', 'xpFill', 'xpText',
   'count', 'combo', 'modes', 'scene', 'mName', 'hpFill', 'hpText', 'atkBar', 'atkFill', 'hero', 'mWrap', 'mImg', 'slash', 'fx',
   'qText', 'qView', 'btnSpeak', 'answers'].forEach(id => (els[id] = $(id)));

  /* Status satu pertarungan. run = nomor sesi: dinaikkan saat masuk/keluar,
     sehingga timer dari sesi lama tidak lagi menyentuh layar (lihat later()). */
  const B = {run: 0, field: null, mode: 'field', combo: 0, hp: 0, maxHp: 1, isBoss: false, last: '', q: null, locked: true,
             room: 0, exam: null, charge: 0, interval: 3, tier: 0, mods: null};
  /** Pengubah kesulitan: tingkat dungeon atau Mode Pahlawan (balance.js), selain itu netral. */
  const NONE = {lvAdd: 0, hpMul: 1, dmgMul: 1, speedMul: 1, rewardMul: 1};
  const mods = () => B.mods || NONE;
  const later = (fn, ms) => { const r = B.run; setTimeout(() => { if (r === B.run) fn(); }, ms); };
  const kills = () => S.fieldKills[B.field.id] || 0;
  const quest = (type, val) => { if (MQ.Quests) MQ.Quests.track(type, val); }; // misi harian

  /** Putar ulang animasi CSS. */
  const ANIMS = ['pop', 'hit', 'defeat', 'lunge', 'hurt', 'attack'];
  function anim(el, cls) { el.classList.remove(...ANIMS); void el.offsetWidth; el.classList.add(cls); }

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
    els.potionCount.textContent = '×' + pots;
    els.btnPotion.disabled = S.hp >= max;
    els.combo.textContent = B.combo >= BAL.combat.comboLabel ? `🔥 KOMBO x${B.combo}!` : B.combo > 0 ? `Beruntun ${B.combo}` : '';
    if (B.mode === 'exam') {
      els.count.textContent = `📝 Soal ${Math.min(B.exam.i + 1, B.exam.qs.length)} dari ${B.exam.qs.length} · Benar ${B.exam.ok}`;
    } else if (B.mode === 'dungeon') {
      els.count.textContent = `🕳️ Ruang ${B.room} dari ${B.field.rooms}` + (B.isBoss ? ' · 👑 Bos!' : '');
    } else {
      const cur = kills() + 1, bossAt = Math.ceil(cur / 5) * 5; // bos = setiap monster ke-5 di field ini
      els.count.textContent = B.isBoss ? '👑 Pertarungan bos!' : `Bos setelah ${bossAt - cur} monster lagi`;
    }
  }

  function updateHP() {
    const p = B.hp / B.maxHp * 100;
    els.hpFill.style.width = p + '%';
    els.hpFill.style.background = p > 50 ? '#38b764' : p > 25 ? '#ffcd75' : '#e43b44';
    els.hpText.textContent = `HP ${B.hp} / ${B.maxHp}`;
  }

  /** Teks melayang. side 'hero' = di atas pahlawan (damage yang diterima). */
  function showFloat(text, cls, delay = 0, side = 'monster') {
    const s = document.createElement('span');
    s.className = 'float ' + cls; s.textContent = text;
    s.style.left = (side === 'hero' ? rand(20, 30) : rand(48, 70)) + '%';
    s.style.animationDelay = delay + 's';
    s.addEventListener('animationend', () => s.remove());
    els.fx.appendChild(s);
  }

  /* ===== Serangan musuh berwaktu ===== */
  /** Gaya bertarung monster sekarang: gaya bawaan jenis tubuhnya, bisa ditimpa per monster. */
  function style() {
    const m = Data.monsters[B.monId], base = Data.styles[m.sprite] || {spd: [3, 5], power: 1};
    return {spd: m.spd || base.spd, power: m.power || base.power};
  }
  /** Jeda serangan berikutnya (detik): acak dalam rentang monster × pace tempat; bos sedikit lebih lambat. */
  function newInterval() {
    const [a, b] = style().spd;
    return (a + Math.random() * (b - a)) * MQ.Calc.intervalMul(B.field.pace, B.isBoss) * mods().speedMul;
  }
  /** Damage serangan musuh: tergantung level tempat & kekuatan monster, dikurangi pertahanan pemain (min 1). */
  function enemyDamage() {
    return Math.max(1, Math.round(MQ.Calc.monsterDmg(B.mLv, style().power, B.isBoss) * (mods().dmgMul || 1)) - State.def());
  }
  /** Level monster yang akan muncul (lihat rumus di balance.js):
      area  → naik 1 level tiap levelUpEvery monster dikalahkan di area itu, maks level tertinggi area
      gua   → naik 1 level tiap ruang
      arena → sama dengan level pemain.  Bos mendapat bonus level. */
  function monsterLevel() {
    const M = BAL.monster;
    if (B.mode === 'arena') return S.level + (B.isBoss ? M.bossLevelBonus : 0);
    const [lo, hi] = B.field.lv;
    const steps = B.mode === 'dungeon' ? B.room - 1 : Math.floor(kills() / M.levelUpEvery);
    const add = mods().lvAdd, lv = Math.min(hi, lo + steps) + add;
    return B.isBoss ? Math.min(hi + add + M.bossLevelBonus, lv + M.bossLevelBonus) : lv;
  }
  /** Jenis bunyi serangan: monster kuat & lambat (batu) berdentum, selain itu mengikuti jenis tubuh. */
  function soundKind() { const m = Data.monsters[B.monId]; return style().power >= 1.4 && m.sprite !== 'dragon' ? 'rock' : m.sprite; }
  /** Musik sesuai situasi: ujian, bos, dungeon, atau area biasa. */
  function battleMusic() {
    Audio.music.play(B.mode === 'exam' ? 'exam' : B.isBoss ? 'boss' : B.mode === 'dungeon' ? 'dungeon' : 'field');
  }
  /** Waktu musuh berjalan hanya saat anak sedang menjawab. */
  const timerActive = () => els['scr-battle'].classList.contains('on') && els.overlay.hidden && !B.locked &&
    B.mode !== 'exam' && !S.settings.santai && !document.hidden && !MQ.Cutscene.isOpen() &&
    !(BAL.monster.pauseWhileReading && window.speechSynthesis && window.speechSynthesis.speaking);

  /** Musuh menyerang. Mengembalikan true jika HP pemain habis. */
  function enemyAttack() {
    B.charge = 0; B.interval = newInterval();
    const dmg = enemyDamage();
    S.hp = Math.max(0, S.hp - dmg);
    anim(els.mWrap, 'attack'); anim(els.hero, 'hurt');
    sfx.enemy(soundKind()); setTimeout(sfx.hurt, 120); // bunyi serangan khas monster, lalu pahlawan terkena
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
      els.fastFill.style.width = Math.max(0, 1 - B.answerTime / BAL.combat.fastCritSec) * 100 + '%';
    }
    if (!timerActive()) return;
    B.charge += dt;
    els.atkFill.style.width = Math.min(100, B.charge / B.interval * 100) + '%';
    if (B.charge >= B.interval) enemyAttack();
  }
  requestAnimationFrame(tick);

  /** HP habis: field/arena → istirahat lalu HP penuh; dungeon → keluar gua. Tidak ada game over. */
  function knockedOut() {
    B.locked = true; B.combo = 0;
    State.save();
    later(() => {
      if (B.mode === 'dungeon') return dungeonEnd(false);
      UI.overlay({icon: '💤', title: 'Pahlawan Istirahat', btn: 'Ayo Lanjut!',
        text: 'HP-mu habis. Pahlawan tidur sebentar untuk mengisi tenaga. HP sudah penuh lagi. Ayo semangat!',
        cb: () => { S.hp = State.maxHp(); B.charge = 0; updateHud(); nextQuestion(); }});
    }, 900);
  }

  /* ===== Masuk & keluar ===== */
  /** opt.tier = tingkat dungeon (0 = ⭐). Area biasa memakai Mode Pahlawan bila dinyalakan. */
  function start(place, opt = {}) {
    B.run++;
    B.field = place; B.combo = 0; B.q = null; B.last = ''; B.room = 0;
    B.mode = place.exam ? 'exam' : place.dungeon ? 'dungeon' : place.id === 'arena' ? 'arena' : 'field';
    B.tier = B.mode === 'dungeon' ? (opt.tier || 0) : 0;
    B.hero = B.mode === 'field' && heroModeOn();
    B.mods = B.mode === 'dungeon' ? BAL.tiers[B.tier] : B.hero ? BAL.heroMode : null;
    if (B.mode === 'exam') B.exam = {i: 0, ok: 0, wrong: {}, qs: makeExam()};
    if (B.mode === 'dungeon') sfx.door(); // pintu dungeon berderit terbuka
    S.hp = State.maxHp();
    els.fieldName.textContent = place.name + (B.mode === 'dungeon' ? ' ' + '⭐'.repeat(B.tier + 1) : B.hero ? ' ⭐⭐' : '');
    els.btnExit.textContent = B.mode === 'dungeon' ? '◀ Keluar' : '◀ Peta';
    els.modes.hidden = B.mode !== 'arena'; // pilihan jenis soal hanya di Arena Latihan
    els.atkBar.hidden = B.mode === 'exam' || S.settings.santai; // ujian & Mode Santai: musuh tidak menyerang berwaktu
    els.fx.innerHTML = ''; els.slash.className = '';
    renderModes();
    els.hero.src = MQ.Hero.current(); // penampilan + equipment terbaru
    UI.show('battle');
    spawnMonster(); nextQuestion(); updateHud();
  }

  function exit() {
    B.run++; B.locked = true;
    if (playSecs >= 1) { State.logDay('t', Math.round(playSecs)); playSecs = 0; } // sisa waktu main yang belum tercatat
    State.save();
    UI.show(B.mode === 'dungeon' ? 'dungeon' : 'map');
  }
  els.btnExit.addEventListener('click', exit);
  /** Mode Pahlawan: terbuka setelah lulus Ujian Naik Kelas, dinyalakan dari tombol di Peta. */
  const heroModeOn = () => S.grade > 1 && S.heroMode;

  /* ===== Monster ===== */
  function spawnMonster() {
    const f = B.field;
    if (B.mode === 'dungeon') { B.room++; B.isBoss = B.room === f.rooms; }
    else if (B.mode === 'exam') B.isBoss = true;
    else B.isBoss = (kills() + 1) % 5 === 0;
    B.isKey = B.mode === 'dungeon' && !B.isBoss && !!f.key && B.room === f.keyRoom; // monster kunci di tengah dungeon
    let id = B.isKey ? f.key : f.boss;
    if (!B.isBoss && !B.isKey) { // monster biasa: acak, jangan sama berturut-turut
      const pool = f.mobs.filter(m => m !== B.last);
      id = pool.length ? pool[rand(0, pool.length - 1)] : f.mobs[0];
      B.last = id;
    }
    B.monId = id;
    const m = Data.monsters[id];
    if (B.mode === 'exam') { // HP ujian = jumlah soal × 10; tiap jawaban benar -10
      B.maxHp = B.exam.qs.length * 10;
    } else {
      B.mLv = monsterLevel();
      B.maxHp = Math.round(MQ.Calc.monsterHp(B.mLv, B.isBoss ? 'boss' : B.isKey ? 'key' : '') * (mods().hpMul || 1));
    }
    B.hp = B.maxHp;
    B.interval = newInterval();
    B.charge = Math.min(0.9, Math.max(0, BAL.monster.startCharge)) * B.interval; // bisa dibuat langsung "siap menyerang"
    els.atkFill.style.width = B.charge / B.interval * 100 + '%';
    els.mName.textContent = (B.mode === 'exam' ? '📝 UJIAN: ' : B.isBoss ? '👑 BOS: ' : B.isKey ? '⭐ KUNCI: ' : '') + m.name + (B.mode === 'exam' ? '' : ` · Lv ${B.mLv}`);
    els.mImg.src = Sprites.url(m.sprite, m.pal);
    els.mWrap.className = B.isBoss ? 'boss' : '';
    anim(els.mWrap, 'pop');
    updateHP();
    battleMusic();
  }

  /* ===== Soal ===== */
  /** Soal ujian: 2 soal dari setiap area Kelas 1, berurutan dari yang termudah. */
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
    B.q = q;
    B.answerTime = 0; els.fastFill.style.width = '100%';
    els.fastBar.hidden = B.mode === 'exam'; // ujian: tanpa kritikal
    els.qText.textContent = q.text;
    els.qText.classList.toggle('long', q.text.length > 12); // kalimat panjang → huruf sedikit lebih kecil
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
    if (S.settings.autoSpeak) Audio.speak(q.speak); // pengaturan orang tua: bacakan setiap soal
  }

  /* Tombol 🔊: bacakan soal (untuk anak yang belum lancar membaca) */
  els.btnSpeak.addEventListener('click', () => { if (B.q) Audio.speak(B.q.speak); });

  function answer(btn, val) {
    if (B.locked) return;
    B.locked = true;
    const q = B.q, stat = S.stats[q.kind] || (S.stats[q.kind] = {b: 0, s: 0});
    const exam = B.mode === 'exam';
    if (val === q.ans) {
      // BENAR → pahlawan menyerang; 3+ beruntun = kritis (2×). Ujian: tiap benar = -10 HP tetap.
      stat.b++; State.logDay('b', 1);
      btn.classList.add('benar');
      B.combo++; S.bestCombo = Math.max(S.bestCombo, B.combo);
      quest('correct', q.kind); quest('combo', B.combo);
      // Kritikal: pasti jika menjawab cepat (KILAT), selain itu peluang acak dari status & equipment
      const fast = !exam && B.answerTime <= BAL.combat.fastCritSec;
      if (fast) S.kilat++; // untuk medali "Secepat Kilat"
      const crit = !exam && (fast || Math.random() * 100 < State.critChance()), [lo, hi] = State.atk();
      const extra = exam ? 0 : State.bonusFor(q.kind); // senjata bertopik: damage tambahan untuk jenis soal ini
      const dmg = exam ? 10 : Math.round((rand(lo, hi) + extra) * (crit ? State.critMul() : 1));
      if (extra) showFloat('⚔️ Bonus senjata!', 'xp', 0.15);
      if (exam) B.exam.ok++;
      B.hp = Math.max(0, B.hp - dmg);
      crit ? sfx.crit() : sfx.correct();
      sfx.slash();
      anim(els.hero, 'lunge');
      els.slash.className = ''; void els.slash.offsetWidth; els.slash.className = crit ? 'go crit' : 'go';
      anim(els.mWrap, 'hit');
      showFloat(exam ? '✔ Benar!' : (fast ? '⚡KILAT! ' : crit ? 'KRITIS! ' : '') + '-' + dmg, crit ? 'crit' : '');
      updateHP(); updateHud();
      later(exam ? examNext : B.hp <= 0 ? defeatMonster : nextQuestion, 750);
    } else {
      // SALAH → jawaban benar ditunjukkan, kombo hilang, musuh langsung menyerang. Ujian: tanpa serangan.
      stat.s++;
      btn.classList.add('salah');
      [...els.answers.children].find(b => b.dataset.v === q.ans).classList.add('benar');
      B.combo = 0;
      sfx.wrong();
      State.logDay('s', 1);
      if (exam) { anim(els.hero, 'hurt'); B.exam.wrong[q.kind] = (B.exam.wrong[q.kind] || 0) + 1; updateHud(); return later(examNext, 1400); }
      // Petunjuk bergambar menggantikan gambar soal sebentar, jeda lebih lama agar sempat dilihat
      const hint = q.hint && q.hint();
      if (hint) { els.qView.innerHTML = hint; els.qView.hidden = false; }
      if (!enemyAttack()) later(nextQuestion, hint ? 3000 : 1400); // HP habis → knockedOut() yang melanjutkan
    }
  }

  /* ===== Monster kalah: XP, hadiah, pesan ===== */
  function defeatMonster() {
    const f = B.field, wasBoss = B.isBoss, wasKey = B.isKey, dungeon = B.mode === 'dungeon';
    anim(els.mWrap, 'defeat');
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
    later(sfx.coin, 300);
    const loot = wasBoss ? [[mon.drop, R.bossDrops], ['mahkota', 1]] : Math.random() < R.dropChance ? [[mon.drop, 1]] : [];
    loot.forEach(([id, n], i) => { State.addItem(id, n); showFloat(`+${n} ${Data.items[id].name}`, 'loot', 0.5 + i * 0.25); });
    if (loot.length) later(sfx.loot, 550);
    const firstClear = wasBoss && B.mode === 'field' && !B.hero && !S.cleared.includes(f.id);
    if (firstClear) S.cleared.push(f.id);
    const heroClear = wasBoss && B.hero && !S.heroCleared.includes(f.id); // bos area pertama kali kalah di Mode Pahlawan
    if (heroClear) S.heroCleared.push(f.id);
    State.save(); updateHud();

    // Pesan yang perlu ditampilkan, satu per satu, lalu monster berikutnya
    const steps = [];
    if (leveled) steps.push(done => {
      if (!dungeon) S.hp = State.maxHp(); // di dungeon HP tetap tidak pulih
      updateHud(); sfx.levelUp();
      UI.overlay({icon: '⭐', title: `Naik ke Level ${S.level}!`, btn: 'Siap!', cb: done,
        text: (dungeon ? 'Hebat sekali! ' : 'Hebat sekali! HP penuh lagi. ') +
              `Kamu punya ${S.points} poin status. Atur di halaman Karakter untuk menambah HP, Serangan, atau Pertahanan!`});
    });
    if (firstClear) steps.push(done => MQ.Cutscene.play(`${f.id}-shard`, done)); // cerita: kepingan kristal
    if (wasKey) steps.push(done => MQ.Cutscene.playOnce(`${f.id}-key`, done));   // cerita dungeon: setelah monster kunci
    if (firstClear) steps.push(done => {
      const nxt = Data.fields.find(x => x.req === f.id), dun = Data.dungeons.find(x => x.req === f.id);
      sfx.fanfare();
      UI.overlay({icon: '🏆', title: 'Area Selesai!', btn: 'Lanjut di sini', cb: done, btn2: 'Ke Peta', cb2: exit,
        text: `Kamu mengalahkan ${Data.monsters[f.boss].name}! ` + (nxt ? `Tempat baru terbuka: ${nxt.name}. ` : '') +
              (dun ? `Dungeon baru: ${dun.name} (buka menu 🏰 Dungeon).` : '')});
    });
    if (heroClear) steps.push(done => {
      sfx.fanfare();
      UI.overlay({icon: '🦸', title: 'Bos Pahlawan Kalah!', btn: 'Lanjut di sini', cb: done, btn2: 'Ke Peta', cb2: exit,
        text: `Kamu mengalahkan ${Data.monsters[f.boss].name} di Mode Pahlawan ⭐⭐! (${S.heroCleared.length} dari ${State.mainFields().length})`});
    });
    steps.push(done => MQ.Collection.check(done)); // medali baru (jika ada)
    const run = () => {
      const s = steps.shift();
      if (s) return s(run);
      if (dungeon && wasBoss) return dungeonEnd(true);
      spawnMonster(); nextQuestion();
    };
    later(run, 900);
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
    MQ.Cutscene.playOnce(`${f.id}-end`, () => UI.overlay({icon: '🎁', title: 'Peti Harta!', btn: 'Keluar', cb: () => MQ.Collection.check(exit),
      text: `Kamu menaklukkan ${f.name} ${'⭐'.repeat(B.tier + 1)}! Isi peti: ${coins} koin, ${list}.${nextTier}`}));
  }

  /* ===== Ujian ===== */
  function examNext() {
    B.exam.i++;
    if (B.exam.i < B.exam.qs.length) return nextQuestion();
    const {ok, qs, wrong} = B.exam, N = qs.length, need = Math.ceil(N * 0.75);
    const pass = ok >= need;
    S.examBest = Math.max(S.examBest, ok);
    if (!pass) {
      State.save();
      const weak = Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => Questions.NAMES[k] || k).join(', ');
      return UI.overlay({icon: '📚', title: 'Belum Lulus', btn: 'Coba Lagi', cb: () => start(B.field), btn2: 'Ke Peta', cb2: exit,
        text: `Benar ${ok} dari ${N}. Perlu ${need} untuk lulus. Ayo latihan lagi: ${weak}. Kamu pasti bisa!`});
    }
    anim(els.mWrap, 'defeat');
    const first = S.grade < 2;
    S.grade = Math.max(S.grade, 2);
    if (!S.cleared.includes(B.field.id)) S.cleared.push(B.field.id);
    if (first) { S.coins += 30; State.addItem('mahkota', 2); }
    State.save();
    sfx.fanfare();
    const stars = '⭐'.repeat(ok === N ? 3 : ok >= N - 2 ? 2 : 1);
    const result = () => UI.overlay({icon: '🎓', title: 'Lulus Kelas 1!', btn: 'Ke Peta', cb: () => MQ.Collection.check(exit),
      text: `${stars} Benar ${ok} dari ${N}. ` + (first ? 'Hadiah: 30 koin & 2 Mahkota Kecil. Dunia Kelas 2 segera hadir!' : 'Kamu tetap juara!')});
    later(() => (first ? MQ.Cutscene.play('ending', result) : result()), 900); // lulus pertama kali → cerita penutup
  }

  /* ===== Ramuan Penyembuh: HP penuh ===== */
  els.btnPotion.addEventListener('click', () => {
    if (!State.count('ramuan') || S.hp >= State.maxHp() || S.hp <= 0) return;
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

  /* Gambar latar & pahlawan sekali saja */
  Sprites.drawField(els.scene);
  els.btnPotion.querySelector('img').src = Sprites.url('potion');

  // currentQuestion & state: untuk pengujian otomatis
  return {start, currentQuestion: () => B.q, debug: () => ({charge: B.charge, interval: B.interval, mode: B.mode, monId: B.monId})};
})();
