/* Math Quest — 🎯 Target Harian, 📅 Kalender Stempel, ⏰ batas main dari orang tua (2026-11-26).
   Tujuan: anak ingin kembali BESOK, bukan main terus sekarang.
   - Target harian = jawab benar S.settings.goal soal hari ini (dihitung dari S.days[hari].b). Tercapai → stempel di kalender,
     +10 koin, dan Kiki mengucapkan "sampai besok" (titik berhenti yang wajar; boleh lanjut main).
   - Kalender dihitung per minggu (Senin–Minggu): 5 stempel dalam seminggu = hadiah mingguan. Tidak ada "beruntun" yang hangus.
   - Orang tua: batas main per hari (menit, S.settings.limit; 0 = tanpa batas) & jam tidur (S.settings.bed, -1 = mati, sampai jam 6).
     Saat habis, pertarungan baru tidak bisa dimulai (Kelas tetap boleh). Orang tua bisa memberi +15 menit untuk hari ini. */
'use strict';
window.MQ = window.MQ || {};

MQ.Daily = (() => {
  const {State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const REWARD = {stamp: 10, weekNeed: 5, weekCoins: 30, weekItem: 'ramuan'};
  const WAKE = 6; // jam bangun (akhir jam tidur)

  const goal = () => S.settings.goal || 20;
  const today = () => State.today();
  const todayData = () => S.days[today()] || {t: 0, b: 0, s: 0};
  const done = () => S.stamps.includes(today());
  /** Senin minggu ini (kunci minggu). */
  function monday(d = new Date()) { const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return m; }
  function weekDays(d = new Date()) { const m = monday(d); return Array.from({length: 7}, (_, i) => { const x = new Date(m); x.setDate(m.getDate() + i); return x; }); }
  const weekKey = () => State.dateKey(monday());
  const weekCount = () => weekDays().filter(d => S.stamps.includes(State.dateKey(d))).length;

  /** Dipanggil setiap jawaban benar (battle & Kelas). true = target baru saja tercapai. */
  function onCorrect() {
    if (done() || todayData().b < goal()) return false;
    S.stamps.push(today());
    S.stamps = S.stamps.slice(-120);
    S.coins += REWARD.stamp;
    if (MQ.Village) MQ.Village.addBrick(1); // 1 bata untuk membangun desa
    if (MQ.Quests) MQ.Quests.track('goal');
    S.dayParty = today(); // perayaan ditampilkan di beranda / peta (tidak mengganggu pertarungan)
    State.save();
    return true;
  }
  /** Perayaan tertunda (di beranda/peta): stempel hari ini, lalu hadiah mingguan bila 5 stempel. */
  function celebrate(done2) {
    onCorrect(); // target mungkin sudah tercapai sebelumnya (mis. orang tua menurunkan target)
    if (S.dayParty !== today()) { if (done2) done2(); return false; }
    S.dayParty = '';
    const name = (S.hero && S.hero.name) || 'Pahlawan';
    const weekly = weekCount() >= REWARD.weekNeed && !S.weekClaims.includes(weekKey());
    const next = () => {
      if (!weekly) return done2 && done2();
      S.weekClaims.push(weekKey()); S.weekClaims = S.weekClaims.slice(-20);
      S.coins += REWARD.weekCoins; State.addItem(REWARD.weekItem, 1); State.save();
      MQ.Audio.sfx.chest();
      UI.overlay({fx: 'chest', sub: `${REWARD.weekNeed} HARI BELAJAR MINGGU INI`, title: 'Hadiah Mingguan!', btn: 'Hore!', cb: done2,
        chips: [{img: MQ.ItemArt.url('coin'), text: `+${REWARD.weekCoins} koin`}, {img: MQ.ItemArt.url(REWARD.weekItem), text: '+1 Ramuan'}],
        text: 'Kamu rajin sekali! Kristal Angka makin bersinar.'});
    };
    State.save(); MQ.Audio.sfx.fanfare();
    UI.overlay({fx: 'medal', icon: '🌟', sub: '📅 TUGAS HARI INI SELESAI', title: `Hebat, ${name}!`, btn: 'Sampai besok!', cb: next,
      chips: [{img: MQ.ItemArt.url('ui_stamp'), text: 'Stempel hari ini'}, {img: MQ.ItemArt.url('coin'), text: `+${REWARD.stamp} koin`},
              {img: MQ.ItemArt.url('ui_brick'), text: '+1 bata desa'}],
      text: `Kiki: "Kamu sudah belajar ${goal()} soal hari ini. Istirahatkan matamu, sampai besok ya!" (Boleh lanjut main kalau mau.)`});
    return true;
  }

  /* ===== Batas main & jam tidur ===== */
  const limitMin = () => (S.settings.limit ? S.settings.limit + (S.extra && S.extra.date === today() ? S.extra.min : 0) : 0);
  const minutesLeft = () => (limitMin() ? limitMin() - todayData().t / 60 : Infinity);
  function bedtime() {
    const b = S.settings.bed;
    if (b == null || b < 0) return false;
    const h = new Date().getHours();
    return b > WAKE ? h >= b || h < WAKE : h >= b && h < WAKE;
  }
  /** Sebelum bertarung: true = boleh. */
  function gate() {
    if (bedtime()) {
      UI.overlay({icon: '🌙', title: 'Sudah Malam', text: `Pahlawan sudah tidur. Kamu juga ya! Petualangan dibuka lagi jam ${WAKE} pagi. (Kelas tetap boleh dibuka.)`});
      return false;
    }
    if (minutesLeft() <= 0) {
      UI.overlay({icon: '😴', title: 'Waktu Main Habis', text: 'Pahlawan sudah lelah hari ini. Main lagi besok ya! Sambil menunggu, kamu boleh membaca di 🎓 Kelas.'});
      return false;
    }
    return true;
  }
  /** Pesan kecil di atas layar (tidak menghentikan permainan). */
  function toast(text) {
    let t = $('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = text; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  }
  // Peringatan saat waktu main hampir / sudah habis ketika sedang bertarung
  let warned = '';
  setInterval(() => {
    if (!limitMin() || !$('scr-battle').classList.contains('on')) return;
    const left = minutesLeft(), key = today() + (left <= 0 ? 'x' : left <= 2 ? 'w' : '');
    if (key === warned || (left > 2)) return;
    warned = key;
    toast(left <= 0 ? '⏰ Waktu main habis. Selesaikan pertarungan ini, lalu istirahat ya!' : '⏰ Waktu main tinggal 2 menit');
  }, 5000);

  /* ===== Tampilan: lencana di beranda & layar Kalender ===== */
  function renderBadge() {
    onCorrect();
    const b = Math.min(goal(), todayData().b);
    $('calBadge').textContent = done() ? '✔' : `${b}/${goal()}`;
    $('calBadge').classList.toggle('done', done());
  }
  const DAYN = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const MONTH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  UI.renderers.cal = () => {
    const b = Math.min(goal(), todayData().b), pct = Math.round(b / goal() * 100), stamp = `<img class="stampImg" src="${MQ.ItemArt.url('ui_stamp', 3)}" alt="">`;
    const left = minutesLeft();
    $('calToday').innerHTML = `<img class="calKiki" src="${MQ.Pix.url('kiki', 3)}" alt=""><div class="calTxt">` +
      `<b>${done() ? 'Tugas hari ini selesai! 🌟' : `Target hari ini: ${goal()} soal benar`}</b>` +
      `<div class="bar calBar"><div style="width:${pct}%"></div><span>${b} / ${goal()}</span></div>` +
      `<small>${done() ? 'Kiki: "Sampai besok ya! Istirahatkan matamu."' : `Kiki: "Tinggal ${goal() - b} soal lagi. Semangat!"`}` +
      `${limitMin() ? ` · ⏰ sisa waktu main ${Math.max(0, Math.ceil(left))} menit` : ''}</small></div>`;
    const t0 = today();
    $('calWeek').innerHTML = weekDays().map((d, i) => {
      const k = State.dateKey(d), has = S.stamps.includes(k), isT = k === t0, future = k > t0;
      return `<div class="calDay${isT ? ' today' : ''}${future ? ' future' : ''}"><small>${DAYN[i]}</small>${has ? stamp : `<span class="calDot">${d.getDate()}</span>`}</div>`;
    }).join('');
    const wc = weekCount(), claimed = S.weekClaims.includes(weekKey());
    $('calWeekInfo').innerHTML = `Minggu ini: <b>${wc} dari 7 hari</b> · ` + (claimed ? 'Hadiah mingguan sudah diambil 🎁✔'
      : `${Math.max(0, REWARD.weekNeed - wc)} hari lagi → 🎁 ${REWARD.weekCoins} koin + Ramuan`);
    // bulan ini
    const now = new Date(), first = new Date(now.getFullYear(), now.getMonth(), 1), lead = (first.getDay() + 6) % 7;
    const daysIn = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let cells = DAYN.map(n => `<small class="calHead">${n}</small>`).join('') + '<i></i>'.repeat(lead);
    let total = 0;
    for (let dd = 1; dd <= daysIn; dd++) {
      const k = State.dateKey(new Date(now.getFullYear(), now.getMonth(), dd)), has = S.stamps.includes(k);
      if (has) total++;
      cells += `<span class="calCell${has ? ' got' : ''}${k === t0 ? ' today' : ''}">${has ? stamp : dd}</span>`;
    }
    $('calMonthTitle').textContent = `${MONTH[now.getMonth()]} ${now.getFullYear()} · ${total} stempel`;
    $('calMonth').innerHTML = cells;
  };

  return {onCorrect, celebrate, gate, renderBadge, toast, minutesLeft, bedtime, goal, done};
})();
