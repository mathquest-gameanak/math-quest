/* Math Quest — 🧪 Atur Angka (eksperimen keseimbangan untuk orang tua).
   - Mengubah angka di MQ.Balance, Data.styles, Data.monsters (kecepatan/kekuatan), dan area (pace, level) SAAT INI JUGA.
   - Perubahan disimpan di HP ini (localStorage 'mathQuest.tuning'), terpisah dari progress anak.
   - Pratinjau menghitung HP/damage/jumlah pukulan per area dengan rumus yang sama dengan pertarungan (MQ.Calc).
   Angka bawaan tetap ada di balance.js / data.js; kirim hasil "Salin angka" ke pengembang untuk dijadikan bawaan. */
'use strict';
window.MQ = window.MQ || {};

MQ.Tuner = (() => {
  const {Data, State, UI} = MQ;
  const BAL = MQ.Balance, S = State.S;
  const KEY = 'mathQuest.tuning';
  const $ = id => document.getElementById(id);
  const places = () => [...Data.fields.filter(f => f.lv && !f.exam), ...Data.dungeons];

  /* ===== Daftar angka: [jalur, label, keterangan, step] ===== */
  const GROUPS = [
    {title: '🧒 Karakter', rows: [
      ['player.baseHp', 'HP di Level 1', 'HP = awal + per level × (level − 1)', 1],
      ['player.hpPerLevel', 'HP per level', 'tambahan HP otomatis tiap level', 1],
      ['player.hpPerPoint', 'HP per poin', 'tiap poin status ke HP', 1],
      ['player.baseAtk', 'Serangan di Level 1', 'serangan = awal + per level × (level − 1), dibulatkan ke bawah', 1],
      ['player.atkSpread', 'Acak serangan', '0 = damage tetap; 2 = acak dari X sampai X + 2', 1],
      ['player.atkPerLevel', 'Serangan per level', 'tambahan otomatis tiap level', 0.5],
      ['player.atkPerPoint', 'Serangan per poin', 'tiap poin status ke ATK', 0.5],
      ['player.defPerPoint', 'Pertahanan per poin', 'pengurang damage per poin DEF (dibulatkan ke bawah)', 0.25],
      ['player.pointsPerLevel', 'Poin per level', 'poin status yang didapat tiap naik level', 1]
    ]},
    {title: '👾 Musuh: HP & damage', rows: [
      ['monster.hpBase', 'HP dasar', 'HP musuh = dasar + per level × level', 1],
      ['monster.hpPerLevel', 'HP per level', '', 1],
      ['monster.hpGrowthPct', 'HP berlipat (%)', 'tambahan % per level, berlipat. 0 = naik lurus; 5 = makin curam di level tinggi', 1],
      ['monster.dmgBase', 'Damage dasar', 'damage = (dasar + per level × level) × kekuatan', 0.1],
      ['monster.dmgPerLevel', 'Damage per level', '', 0.05],
      ['monster.dmgGrowthPct', 'Damage berlipat (%)', 'tambahan % per level, berlipat', 1],
      ['monster.bossHpMul', 'HP bos ×', '', 0.1],
      ['monster.bossDmgMul', 'Damage bos ×', '', 0.1],
      ['monster.keyHpMul', 'HP monster kunci ×', 'monster kunci di dungeon', 0.1]
    ]},
    {title: '⏱️ Musuh: kecepatan & level', rows: [
      ['monster.speedMul', 'Pengali jeda serangan', 'SEMUA musuh. 0.5 = dua kali lebih cepat, 2 = dua kali lebih lambat', 0.05],
      ['monster.startCharge', 'Bar serangan awal', '0 = mulai kosong; 0.5 = setengah terisi saat musuh muncul (maks 0.9)', 0.1],
      ['monster.pauseWhileReading', 'Berhenti saat dibacakan', '1 = waktu musuh berhenti saat soal dibacakan; 0 = tetap berjalan', 1],
      ['monster.bossSlowMul', 'Bos lebih lambat ×', 'pengali jeda serangan bos', 0.1],
      ['monster.levelUpEvery', 'Naik level tiap', 'monster di area naik 1 level tiap sekian monster dikalahkan', 1],
      ['monster.bossLevelBonus', 'Bonus level bos', '', 1]
    ]},
    {title: '⚡ Pertarungan', rows: [
      ['combat.fastCritSec', 'Detik KILAT', 'jawab benar dalam detik ini = pasti kritikal', 0.5],
      ['combat.critChance', 'Peluang kritikal (%)', 'dasar, sebelum equipment', 1],
      ['combat.critMul', 'Damage kritikal ×', 'dasar, sebelum equipment', 0.1],
      ['combat.healOnKillPct', 'Pulih tiap menang (%)', 'HP pulih setelah mengalahkan monster (bukan di dungeon)', 5]
    ]},
    {title: '⭐ XP & hadiah', rows: [
      ['xp.base', 'XP naik level: dasar', 'XP perlu = dasar + per level × (level − 1)', 1],
      ['xp.perLevel', 'XP naik level: per level', '', 1],
      ['xp.monsterBase', 'XP monster: dasar', 'XP dari monster = dasar + per level × level monster', 1],
      ['xp.perMonsterLevel', 'XP monster: per level', '', 1],
      ['xp.bossMul', 'XP bos ×', '', 0.5],
      ['xp.penaltyFrom', 'Pengurangan XP mulai', 'pemain ≥ sekian level di atas monster', 1],
      ['xp.penaltyStep', 'Pengurangan per level', '0.25 = −25% tiap level selisih', 0.05],
      ['xp.minFactor', 'XP paling kecil', '0.1 = minimal 10%', 0.05],
      ['rewards.coinsNormal.0', 'Koin monster (min)', '', 1],
      ['rewards.coinsNormal.1', 'Koin monster (maks)', '', 1],
      ['rewards.coinsBoss', 'Koin bos', '', 1],
      ['rewards.dropChance', 'Peluang drop', '0.7 = 70%', 0.05]
    ]},
    {title: '🏰 Tingkat dungeon, Pahlawan, Legenda & upgrade', note: 'Level + = level musuh ditambah. HP/damage × = pengali musuh. Jeda × < 1 = musuh lebih cepat. Hadiah × = koin & isi peti.', rows: [
      ['tiers.1.lvAdd', '⭐⭐ level +', '', 1], ['tiers.1.speedMul', '⭐⭐ jeda ×', '', 0.05], ['tiers.1.rewardMul', '⭐⭐ hadiah ×', '', 0.5],
      ['tiers.2.lvAdd', '⭐⭐⭐ level +', '', 1], ['tiers.2.speedMul', '⭐⭐⭐ jeda ×', '', 0.05], ['tiers.2.rewardMul', '⭐⭐⭐ hadiah ×', '', 0.5],
      ['tiers.2.hpMul', '⭐⭐⭐ HP musuh ×', '', 0.1], ['tiers.2.dmgMul', '⭐⭐⭐ damage musuh ×', '', 0.1],
      ['heroMode.lv.0', 'Pahlawan level dari', '', 1], ['heroMode.lv.1', 'Pahlawan level sampai', '', 1], ['heroMode.hpMul', 'Mode Pahlawan HP musuh ×', '', 0.1],
      ['heroMode.dmgMul', 'Mode Pahlawan damage musuh ×', '', 0.1], ['heroMode.speedMul', 'Mode Pahlawan jeda ×', '', 0.05],
      ['heroMode.rewardMul', 'Mode Pahlawan koin ×', '', 0.5],
      ['legendMode.lv.0', 'Legenda level dari', '', 1], ['legendMode.lv.1', 'Legenda level sampai', '', 1], ['legendMode.hpMul', 'Legenda HP musuh ×', '', 0.1],
      ['legendMode.dmgMul', 'Legenda damage musuh ×', '', 0.1], ['legendMode.speedMul', 'Legenda jeda ×', '', 0.05],
      ['legendMode.rewardMul', 'Legenda koin ×', '', 0.5],
      ['upgrade.coins', 'Upgrade: koin per tingkat', 'biaya koin = angka ini × tingkat tujuan', 1],
      ['upgrade.per.senjata.atk', 'Upgrade senjata: serangan +', 'per tingkat', 1],
      ['upgrade.per.pelindung.hp', 'Upgrade pelindung: HP +', 'per tingkat', 1],
      ['upgrade.per.aksesori.crit', 'Upgrade aksesori: kritikal % +', 'per tingkat', 1]
    ]},
    {title: '🧠 Soal cepat & soal pikir', note: 'Pengali waktu per jenis soal: damage musuh dibagi angka ini (soft 1), batas KILAT dikali angka ini. ≥ batas = soal pikir (tanpa KILAT, benar = TELITI!).', rows: [
      ['think.soft', 'Pengurang damage', '1 = damage dibagi pengali waktu; 0 = tanpa pengurangan', 0.1],
      ['think.slow', 'Pelambat musuh', '0 = kecepatan normal; 1 = bar musuh dibagi pengali waktu', 0.1],
      ['think.storySpeak', 'Bacakan soal cerita', '1 = soal cerita selalu dibacakan otomatis', 1],
      ['think.from', 'Batas soal pikir', 'pengali waktu ≥ angka ini = soal pikir', 0.1],
      ['think.telitiMul', 'Damage TELITI! ×', 'serangan saat menjawab benar soal pikir', 0.1],
      ...['hitung', 'isi', 'urutan', 'bentuk', 'pola', 'panjang', 'ukur', 'puluhan', 'pasangan', 'cerita', 'teka'].map(k => [`think.time.${k}`, `Waktu soal ${k} ×`, '', 0.1])
    ]},
    {title: '😵 Pingsan & 📜 Peti Teka-teki', note: 'Saat HP habis: istirahat (menit) + pelajaran wajib. Peti: peluang muncul di titik 2 & 4, hadiahnya.', rows: [
      ['knockout.lockMin', 'Istirahat (menit)', '0 = langsung boleh main lagi', 1],
      ['knockout.mustLearn', 'Wajib belajar', '1 = harus menyelesaikan pelajaran dulu', 1],
      ['knockout.practice', 'Latihan pelajaran', 'jawaban benar yang dibutuhkan', 1],
      ['chest.chance', 'Peluang peti', '0–1 per titik (0 = tidak pernah)', 0.1],
      ['chest.coins.0', 'Koin peti (benar pertama)', '', 1],
      ['chest.items', 'Bahan peti (benar pertama)', '', 1]
    ]},
    {title: '🦇 Kecepatan jenis monster', note: 'Jeda serangan acak antara cepat–lambat (detik), sebelum dikali pace area. Kekuatan mengalikan damage.',
     rows: () => Object.keys(Data.styles).flatMap(k => [
      [`styles.${k}.spd.0`, `${k}: jeda tercepat`, '', 0.5],
      [`styles.${k}.spd.1`, `${k}: jeda terlama`, '', 0.5],
      [`styles.${k}.power`, `${k}: kekuatan ×`, '', 0.1]])},
    {title: '🐲 Monster khusus', note: 'Monster ini punya kecepatan/kekuatan sendiri (menimpa jenisnya).',
     rows: () => Object.entries(Data.monsters).filter(([, m]) => m.spd || m.power).flatMap(([id, m]) => [
      ...(m.spd ? [[`mon.${id}.spd.0`, `${m.name}: jeda tercepat`, '', 0.5], [`mon.${id}.spd.1`, `${m.name}: jeda terlama`, '', 0.5]] : []),
      ...(m.power ? [[`mon.${id}.power`, `${m.name}: kekuatan ×`, '', 0.1]] : [])])},
    {title: '🗺️ Area & dungeon', note: 'Pace = pengali jeda serangan di tempat itu. Level = level monster awal–akhir.',
     rows: () => places().flatMap(p => [
      [`place.${p.id}.pace`, `${p.icon} ${p.name}: pace`, '', 0.1],
      [`place.${p.id}.lv.0`, `${p.icon} ${p.name}: level awal`, '', 1],
      [`place.${p.id}.lv.1`, `${p.icon} ${p.name}: level akhir`, '', 1]])}
  ];
  const rowsOf = g => (typeof g.rows === 'function' ? g.rows() : g.rows);

  /* ===== Baca/tulis angka lewat jalur ===== */
  function ref(path) {
    const parts = path.split('.');
    const root = parts.shift();
    let o = root === 'styles' ? Data.styles : root === 'mon' ? Data.monsters
      : root === 'place' ? null : BAL[root];
    if (root === 'place') { const id = parts.shift(); o = places().find(p => p.id === id); }
    while (o && parts.length > 1) o = o[parts.shift()];
    return o && typeof o[parts[0]] === 'number' ? [o, parts[0]] : null;
  }
  const get = path => { const r = ref(path); return r ? r[0][r[1]] : NaN; };
  const set = (path, v) => { const r = ref(path); if (r) r[0][r[1]] = v; };

  // Simpan angka bawaan sebelum perubahan apa pun
  const DEF = {};
  GROUPS.forEach(g => rowsOf(g).forEach(([p]) => { DEF[p] = get(p); }));

  let over = {};
  function load() {
    try { over = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { over = {}; }
    for (const [p, v] of Object.entries(over)) {
      if (p in DEF && Number.isFinite(v)) set(p, v); else delete over[p];
    }
  }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(over)); } catch (e) { /* penyimpanan penuh */ } };
  function change(p, v) {
    if (!(p in DEF) || !Number.isFinite(v)) return;
    set(p, v);
    if (v === DEF[p]) delete over[p]; else over[p] = v;
    persist();
  }
  load();

  /* ===== Pratinjau ===== */
  /** Statistik pemain contoh: level L, poin dibagi sesuai pilihan, equipment yang sedang dipakai. */
  function samplePlayer(L, split) {
    const P = BAL.player, pts = (L - 1) * P.pointsPerLevel;
    let a = {hp: 0, atk: 0, def: 0};
    if (split === 'now') {
      const used = S.alloc.hp + S.alloc.atk + S.alloc.def;
      a = used ? {hp: pts * S.alloc.hp / used, atk: pts * S.alloc.atk / used, def: pts * S.alloc.def / used} : {hp: pts / 3, atk: pts / 3, def: pts / 3};
    } else if (split === 'atk') a.atk = pts;
    else if (split === 'hp') a.hp = pts;
    else a = {hp: pts / 3, atk: pts / 3, def: pts / 3};
    const eq = $('tunEquip').checked, e = k => (eq ? State.effect(k) : 0);
    const atkLo = MQ.Calc.playerAtk(L, Math.round(a.atk), e('atk'));
    const critC = BAL.combat.critChance + e('crit'), critM = BAL.combat.critMul + e('critDmg') / 100;
    return {
      hp: MQ.Calc.playerHp(L, Math.round(a.hp), e('hp')),
      atk: atkLo + P.atkSpread / 2, atkLo, atkHi: atkLo + P.atkSpread,
      def: Math.floor(P.defPerPoint * Math.round(a.def)) + e('def'), critC, critM
    };
  }
  /** Rata-rata gaya monster di suatu tempat (kecepatan & kekuatan). */
  function placeStyle(p, boss) {
    const ids = boss ? [p.boss || p.key].filter(Boolean) : (p.mobs || []);
    const st = ids.map(id => { const m = Data.monsters[id], b = Data.styles[m.sprite] || {spd: [3, 5], power: 1};
      const spd = m.spd || b.spd; return {spd: (spd[0] + spd[1]) / 2, power: m.power || b.power}; });
    if (!st.length) return {spd: 4, power: 1};
    return {spd: st.reduce((s, x) => s + x.spd, 0) / st.length, power: st.reduce((s, x) => s + x.power, 0) / st.length};
  }
  function previewRow(label, lv, p, boss, pl, secs, fast) {
    const C = MQ.Calc, st = placeStyle(p, boss);
    const hp = C.monsterHp(lv, boss ? 'boss' : '');
    const critAvg = fast ? pl.critM : 1 + (pl.critC / 100) * (pl.critM - 1);
    const hit = pl.atk * critAvg, hits = Math.ceil(hp / hit);
    const dmg = Math.max(1, C.monsterDmg(lv, st.power, boss) - pl.def);
    const gap = st.spd * C.intervalMul(p.pace, boss);
    const attacks = Math.max(0, Math.floor((hits * secs) / gap + Math.min(0.9, BAL.monster.startCharge)));
    const toKo = Math.ceil(pl.hp / dmg);
    const xp = Math.round((BAL.xp.monsterBase + BAL.xp.perMonsterLevel * lv) * (boss ? BAL.xp.bossMul : 1));
    const warn = attacks === 0 ? ' class="warn"' : '';
    return `<tr><td>${label}</td><td>${hp}</td><td>${hits}</td><td>${dmg}<small>/${toKo}×</small></td><td>${gap.toFixed(1)}s</td><td${warn}>${attacks}×</td><td>${xp}</td></tr>`;
  }
  function renderPreview() {
    const L = Math.max(1, Math.round(Number($('tunLv').value) || 1));
    const split = $('tunSplit').value, secs = Math.max(0.5, Number($('tunSecs').value) || 3), fast = $('tunFast').checked;
    const pl = samplePlayer(L, split);
    const need = BAL.xp.base + BAL.xp.perLevel * (L - 1);
    $('tunPlayer').innerHTML = [
      ['Level', L], ['HP', pl.hp], ['Serangan', `${pl.atkLo}–${pl.atkHi}`], ['Pertahanan', pl.def],
      ['Kritikal', `${pl.critC}% ×${pl.critM.toFixed(2)}`], ['XP naik level', need]
    ].map(([k, v]) => `<div class="sumBox"><small>${k}</small><b>${v}</b></div>`).join('');
    const M = BAL.monster;
    $('tunTable').innerHTML = places().map(p => {
      const [lo, hi] = p.lv;
      const rows = [previewRow(`Lv ${lo}`, lo, p, false, pl, secs, fast)];
      if (hi !== lo) rows.push(previewRow(`Lv ${hi}`, hi, p, false, pl, secs, fast));
      if (p.boss || p.key) { const blv = hi + (p.boss ? M.bossLevelBonus : 0);
        rows.push(previewRow(`${p.boss ? '👑' : '⭐'} Lv ${blv}`, blv, p, !!p.boss, pl, secs, fast)); }
      return `<tr class="tHead"><th colspan="7">${p.icon} ${p.name} <small>(pace ${p.pace})</small></th></tr>` + rows.join('');
    }).join('');
  }

  /* ===== Layar ===== */
  const fmt = v => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000));
  function renderGroups() {
    $('tunGroups').innerHTML = GROUPS.map(g => {
      const rows = rowsOf(g), changed = rows.filter(([p]) => p in over).length;
      return `<details class="panel box tunGroup"><summary>${g.title}${changed ? ` <em class="tag mid">${changed} diubah</em>` : ''}</summary>` +
        (g.note ? `<p class="note left">${g.note}</p>` : '') +
        rows.map(([p, label, desc, step]) =>
          `<label class="tunRow${p in over ? ' changed' : ''}"><span><b>${label}</b>${desc ? `<small>${desc}</small>` : ''}` +
          `<small>awal: ${fmt(DEF[p])}</small></span>` +
          `<input type="number" inputmode="decimal" step="${step}" value="${fmt(get(p))}" data-path="${p}"></label>`).join('') +
        '</details>';
    }).join('');
  }
  function renderLevels() {
    const every = BAL.monster.levelUpEvery;
    $('tunAreas').innerHTML = Data.fields.filter(f => f.lv && !f.exam).map(f => {
      const k = S.fieldKills[f.id] || 0, lv = Math.min(f.lv[1], f.lv[0] + Math.floor(k / every));
      return `<div class="setRow"><span><b>${f.icon} ${f.name}</b><small>${k} dikalahkan · monster sekarang Lv ${lv} (${f.lv[0]}–${f.lv[1]})</small></span>` +
        `<button class="sBtn small" data-kill="${f.id}" data-d="-1">−</button><button class="sBtn small" data-kill="${f.id}" data-d="1">+</button></div>`;
    }).join('');
    $('tunCurLv').textContent = `Level sekarang: ${S.level} · poin belum dibagi: ${S.points}`;
  }
  const msg = t => ($('tunMsg').textContent = t);

  UI.renderers.tuner = () => {
    if (!$('tunLv').value) $('tunLv').value = S.level;
    renderGroups(); renderLevels(); renderPreview(); msg('');
  };

  $('tunGroups').addEventListener('change', e => {
    const inp = e.target.closest('[data-path]');
    if (!inp) return;
    const p = inp.dataset.path, v = Number(inp.value);
    if (inp.value === '' || !Number.isFinite(v)) { inp.value = fmt(get(p)); return; }
    change(p, v);
    inp.closest('.tunRow').classList.toggle('changed', p in over);
    renderPreview(); renderLevels();
    // perbarui penanda "x diubah" tanpa menutup grup yang sedang terbuka
    const det = inp.closest('details'), n = [...det.querySelectorAll('[data-path]')].filter(i => i.dataset.path in over).length;
    let tag = det.querySelector('summary .tag');
    if (n && !tag) { tag = document.createElement('em'); tag.className = 'tag mid'; det.querySelector('summary').append(' ', tag); }
    if (tag) { if (n) tag.textContent = `${n} diubah`; else tag.remove(); }
  });
  ['tunLv', 'tunSplit', 'tunSecs', 'tunFast', 'tunEquip'].forEach(id => $(id).addEventListener('input', renderPreview));

  // Alat karakter
  $('tunSetLv').addEventListener('click', () => {
    const n = Math.max(1, Math.min(99, Math.round(Number($('tunNewLv').value) || 0)));
    if (!n) return msg('Isi level dulu.');
    UI.overlay({icon: '🧪', title: `Jadikan Level ${n}?`, btn: 'Ya', btn2: 'Batal',
      text: `XP jadi 0 dan semua poin status dikembalikan (${(n - 1) * BAL.player.pointsPerLevel} poin) untuk dibagi lagi di halaman Karakter. Simpan cadangan dulu kalau perlu.`,
      cb: () => {
        S.level = n; S.xp = 0; S.alloc = {hp: 0, atk: 0, def: 0}; S.points = (n - 1) * BAL.player.pointsPerLevel;
        S.hp = State.maxHp(); State.save();
        $('tunLv').value = n; renderLevels(); renderPreview(); UI.show('tuner'); msg(`Sekarang Level ${n}.`);
      }});
  });
  $('tunHeal').addEventListener('click', () => { S.hp = State.maxHp(); State.save(); msg('HP penuh.'); });
  $('tunAreas').addEventListener('click', e => {
    const b = e.target.closest('[data-kill]');
    if (!b) return;
    const id = b.dataset.kill;
    S.fieldKills[id] = Math.max(0, (S.fieldKills[id] || 0) + Number(b.dataset.d) * BAL.monster.levelUpEvery);
    State.save(); renderLevels();
  });

  // Salin / tempel / kembalikan
  $('tunCopy').addEventListener('click', async () => {
    const text = JSON.stringify(over, null, 1);
    $('tunText').value = text;
    if (!Object.keys(over).length) return msg('Belum ada angka yang diubah.');
    try { await navigator.clipboard.writeText(text); msg('Disalin. Kirim ke pengembang untuk dijadikan bawaan.'); }
    catch (e) { $('tunText').select(); msg('Angka ada di kotak. Tekan lama untuk menyalin.'); }
  });
  $('tunPaste').addEventListener('click', () => {
    let data;
    try { data = JSON.parse($('tunText').value); } catch (e) { return msg('Teks tidak dikenali.'); }
    if (!data || typeof data !== 'object') return msg('Teks tidak dikenali.');
    let n = 0;
    for (const [p, v] of Object.entries(data)) if (p in DEF && Number.isFinite(v)) { change(p, v); n++; }
    UI.renderers.tuner(); msg(`${n} angka dipasang.`);
  });
  $('tunReset').addEventListener('click', () => {
    UI.overlay({icon: '↩️', title: 'Kembalikan semua angka?', btn: 'Ya', btn2: 'Batal',
      text: 'Semua angka kembali ke bawaan game. Progress anak tidak berubah.',
      cb: () => { for (const p of Object.keys(over)) set(p, DEF[p]); over = {}; persist(); UI.show('tuner'); msg('Semua angka kembali ke awal.'); }});
  });

  const changedCount = () => Object.keys(over).length;
  return {changedCount, DEF, get};
})();
