/* Math Quest — 🦉 Kiki, teman yang tumbuh bersama anak (2026-11-26).
   - Sekali sehari "Latihan Kiki": 5 soal TANPA waktu, dipilih dari kemampuan yang paling lemah & yang paling lama tidak dilatih
     (pengulangan berjarak). Tiap jawaban benar = memberi Kiki buah beri. Salah = petunjuk, coba lagi (tanpa hukuman).
   - Selesai = Kiki kenyang (+1 hari tumbuh). 5 tahap: Kecil → Pelajar → Penjelajah → Bijak → Agung (gambar kiki1..kiki5 di characters.js);
     naik tahap = hadiah. Kiki menyapa dengan nama anak & mengingat hasil kemarin.
   - Kiki tampil di beranda (bertengger di samping pahlawan, ada tanda "!" bila belum diberi makan) & ikut terbang saat bertarung.
   Simpanan: S.kiki = {days, last, seen: {jenis: tanggal}}. */
'use strict';
window.MQ = window.MQ || {};

MQ.Kiki = (() => {
  const {State, UI, Questions, Data} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const sfx = () => MQ.Audio.sfx;
  const N_Q = 5;
  const STAGES = [ // need = jumlah hari Kiki diberi makan
    {name: 'Kiki Kecil', need: 0},
    {name: 'Kiki Pelajar', need: 2, reward: {coins: 20}, say: 'Lihat syal baruku! Aku jadi pelajar sungguhan!'},
    {name: 'Kiki Penjelajah', need: 5, reward: {coins: 30, item: 'ramuan'}, say: 'Topi & ransel penjelajah! Ayo bertualang lebih jauh!'},
    {name: 'Kiki Bijak', need: 9, reward: {coins: 40, item: 'mahkota'}, say: 'Dengan kacamata ini aku bisa membaca buku tebal!'},
    {name: 'Kiki Agung', need: 14, reward: {coins: 60, item: 'mahkota'}, say: 'Mahkota bintang! Terima kasih sudah merawatku setiap hari!'}
  ];
  const K = () => S.kiki;
  const today = () => State.today();
  const fed = () => K().last === today();
  const stage = () => { let i = 0; STAGES.forEach((s, j) => { if (K().days >= s.need) i = j; }); return i; };
  const img = (scale = 3, st = stage()) => MQ.Pix.url('kiki' + (st + 1), scale);
  const heroName = () => (S.hero && S.hero.name) || 'Pahlawan';

  /* ===== Memilih soal: kemampuan terlemah + paling lama tidak dilatih ===== */
  /** Jenis soal yang sudah bisa dilatih (dari area yang terbuka) + batas angka area itu. */
  function pool() {
    const open = Data.fields.filter(f => f.spec && State.unlocked(f));
    const m = {};
    open.forEach(f => f.spec.kinds.forEach(k => { m[k] = Math.min(m[k] || 99, f.spec.max || 20); }));
    return m;
  }
  function chooseKinds() {
    const p = pool(), kinds = Object.keys(p);
    const acc = k => { const s = S.stats[k]; return s && s.b + s.s >= 3 ? s.b / (s.b + s.s) : 0.8; }; // belum cukup data → dianggap sedang
    const age = k => (K().seen[k] ? (Date.parse(today()) - Date.parse(K().seen[k])) / 864e5 : 30);
    const weak = kinds.slice().sort((a, b) => acc(a) - acc(b)).slice(0, 3);
    const old = kinds.filter(k => !weak.includes(k)).sort((a, b) => age(b) - age(a)).slice(0, 2);
    const list = [...weak, ...old];
    while (list.length < N_Q && kinds.length) list.push(MQ.pick(kinds));
    return MQ.shuffle(list.slice(0, N_Q)).map(k => ({k, max: p[k]}));
  }

  /* ===== Sapaan pribadi ===== */
  function greet() {
    const h = new Date().getHours(), waktu = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yd = S.days[State.dateKey(y)];
    const weakK = Object.entries(S.stats).filter(([, s]) => s.b + s.s >= 5).sort((a, b) => a[1].b / (a[1].b + a[1].s) - b[1].b / (b[1].b + b[1].s))[0];
    if (fed()) return `Nyam! Terima kasih, ${heroName()}. Aku sudah kenyang. Sampai besok ya!`;
    const lines = [`Selamat ${waktu}, ${heroName()}! Aku lapar... ayo latihan ${N_Q} soal bareng aku!`];
    if (yd && yd.b) lines.push(`Kemarin kamu menjawab benar ${yd.b} soal. Keren!`);
    else if (weakK) lines.push(`Soal ${Questions.NAMES[weakK[0]] || weakK[0]} masih agak sulit ya? Kita latihan pelan-pelan.`);
    return lines.join(' ');
  }

  /* ===== Layar Kiki ===== */
  let run = null; // {list, i, ok, q}
  function render() {
    const st = stage(), next = STAGES[st + 1];
    $('kikiImg').src = img(5);
    $('kikiImg').classList.toggle('agung', st === STAGES.length - 1);
    $('kikiName').textContent = `${STAGES[st].name}`;
    const have = K().days - STAGES[st].need, need = next ? next.need - STAGES[st].need : 1;
    $('kikiGrowFill').style.width = (next ? Math.min(100, have / need * 100) : 100) + '%';
    $('kikiGrowText').textContent = next ? `${have} / ${need} hari menuju ${next.name}` : 'Tahap tertinggi! 👑';
    $('kikiStages').innerHTML = STAGES.map((s, i) => `<span class="kStage${i <= st ? ' got' : ''}${i === st ? ' now' : ''}">` +
      `<img src="${MQ.Pix.url('kiki' + (i + 1), 2, i > st)}" alt=""><small>${i > st ? `${s.need} hari` : s.name.replace('Kiki ', '')}</small></span>`).join('');
    if (run) return renderQ();
    $('kikiSay').textContent = greet();
    $('kikiQ').hidden = true;
    const b = $('kikiGo');
    b.hidden = false; b.disabled = fed();
    b.textContent = fed() ? '✔ Kiki sudah kenyang hari ini' : `🍓 Latihan Kiki (${N_Q} soal)`;
  }
  function start() {
    if (fed()) return;
    run = {list: chooseKinds(), i: 0, ok: 0, q: null};
    sfx().confirm(); render();
  }
  function renderQ() {
    $('kikiGo').hidden = true; $('kikiQ').hidden = false;
    if (!run.q) { const c = run.list[run.i]; run.q = Questions.make({kinds: [c.k], max: c.max}); }
    const q = run.q;
    $('kikiSay').textContent = `Soal ${run.i + 1} dari ${N_Q}. Tidak usah buru-buru!`;
    $('kikiBerries').innerHTML = Array.from({length: N_Q}, (_, i) => `<i class="berry${i < run.ok ? ' eaten' : ''}">🍓</i>`).join('');
    $('kikiView').innerHTML = q.view || ''; $('kikiView').hidden = !q.view;
    $('kikiText').textContent = q.text; $('kikiText').className = 'kikiText' + (q.story ? ' story' : '');
    $('kikiHint').innerHTML = '';
    const box = $('kikiAns');
    box.className = 'learnAns cols' + q.cols; box.innerHTML = '';
    q.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'ans'; b.innerHTML = c.html;
      b.addEventListener('click', () => answer(b, c.v));
      box.appendChild(b);
    });
  }
  function answer(btn, v) {
    if (btn.disabled) return;
    const q = run.q, st = S.stats[q.kind] || (S.stats[q.kind] = {b: 0, s: 0});
    if (v !== q.ans) {
      st.s++; State.logDay('s', 1); sfx().wrong(); btn.classList.add('salah'); btn.disabled = true;
      const h = q.hint && q.hint(); if (h) $('kikiHint').innerHTML = h;
      return;
    }
    st.b++; State.logDay('b', 1); if (MQ.Daily) MQ.Daily.onCorrect();
    K().seen[q.kind] = today();
    sfx().correct(); btn.classList.add('benar');
    $('kikiAns').querySelectorAll('button').forEach(b => (b.disabled = true));
    run.ok++;
    // beri makan: buah terbang ke Kiki, Kiki mengunyah
    const berry = document.createElement('i'); berry.className = 'berryFly'; berry.textContent = '🍓'; $('kikiNest').appendChild(berry);
    setTimeout(() => { berry.remove(); $('kikiImg').classList.remove('munch'); void $('kikiImg').offsetWidth; $('kikiImg').classList.add('munch'); sfx().potion(); }, 550);
    setTimeout(() => {
      run.i++; run.q = null;
      if (run.i < N_Q) return render();
      finish();
    }, 1100);
  }
  function finish() {
    const before = stage();
    K().days++; K().last = today(); run = null;
    State.save(); render();
    const after = stage();
    if (after > before) {
      const s = STAGES[after], r = s.reward || {};
      if (r.coins) S.coins += r.coins;
      if (r.item) State.addItem(r.item, 1);
      State.save();
      sfx().levelUp();
      const chips = [];
      if (r.coins) chips.push({img: MQ.ItemArt.url('coin'), text: `+${r.coins} koin`});
      if (r.item) chips.push({img: MQ.ItemArt.url(r.item), text: `+1 ${Data.items[r.item].name}`});
      return UI.overlay({fx: 'level', level: s.name, from: STAGES[before].name, sub: '🦉 KIKI TUMBUH!', title: s.name, btn: 'Hore!', chips,
        img: null, text: `Kiki: "${s.say}"`, kiki: after});
    }
    sfx().fanfare();
    UI.overlay({img: `<img class="iconBig kikiPop" src="${img(4)}" alt="">`, title: 'Kiki kenyang!',
      text: `Kiki: "Nyam nyam! Terima kasih, ${heroName()}! Sampai besok ya." (${K().days} hari bersama Kiki)`});
  }
  $('kikiGo').addEventListener('click', start);
  $('kikiBack').addEventListener('click', () => { run = null; sfx().back(); UI.show('home'); });
  UI.renderers.kiki = render;

  /* ===== Di beranda: Kiki bertengger di samping pahlawan ===== */
  function renderHome() {
    const el = $('homeKiki');
    if (!el) return;
    el.src = img(3);
    $('homeKikiBubble').hidden = fed();
  }

  return {renderHome, stage, img, fed, STAGES};
})();
