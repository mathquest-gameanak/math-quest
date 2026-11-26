/* Math Quest — 🐾 Teman peliharaan yang tumbuh bersama anak (Kiki dulu, lalu koleksi teman lain; 2026-11-26).
   - Sekali sehari "Latihan Teman": 5 soal TANPA waktu, dipilih dari kemampuan yang paling lemah & yang paling lama tidak dilatih
     (pengulangan berjarak). Tiap jawaban benar = memberi buah beri. Salah = petunjuk, coba lagi (tanpa hukuman).
   - Selesai = KIKI +1 hari tumbuh. 5 tahap; naik tahap = hadiah. Hanya SATU teman yang ikut bertualang.
   - Teman lain (2026-11-27): telur menetas & tumbuh dari Makanan Teman (1/hari dari Peti Bonus Misi Harian), balance.js pets.food.
     Hanya satu telur/teman yang sedang tumbuh; teman baru bisa diadopsi bila teman lain sudah dewasa (tahap 5) & syarat telurnya terpenuhi
     (mengalahkan monster sejenis 10×, atau lulus Kelas 1) → selalu ada yang dirawat, tanpa undian/gacha.
   - Kiki punya gambar khusus kiki1..kiki5; teman lain dibuat dari gambar monsternya: telur → bayi → kecil (+syal) → remaja (+topi) → agung (+mahkota).
   Simpanan: S.pets = {active, own: {id: {days}}, last, seen: {jenis: tanggal}}. Nama modul tetap MQ.Kiki (dipakai beranda & scene). */
'use strict';
window.MQ = window.MQ || {};

MQ.Kiki = (() => {
  const {State, UI, Questions, Data} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const sfx = () => MQ.Audio.sfx;
  const N_Q = 5;
  const NEED_K = [0, 2, 5, 9, 14]; // Kiki: hari Latihan Teman untuk tiap tahap
  const needOf = id => (PETS[id].kiki ? NEED_K : MQ.Balance.pets.food); // teman lain: jumlah Makanan Teman
  const NEED = NEED_K; // jumlah tahap (5)
  const STAGE_NAME = ['Telur', 'Bayi', 'Kecil', 'Remaja', 'Agung'];
  const SIZE = [0.8, 0.6, 0.78, 0.9, 1]; // ukuran gambar tiap tahap (teman selain Kiki)
  const REWARD = [null, {coins: 20}, {coins: 30, item: 'ramuan'}, {coins: 40, item: 'mahkota'}, {coins: 60, item: 'mahkota'}];
  /* Daftar teman. base = gambar monster (MQ.Pix), egg = warna telur, unlock = syarat telur. */
  const PETS = {
    kiki:   {name: 'Kiki', kiki: true, say: ['Lihat syal baruku!', 'Topi & ransel penjelajah!', 'Kacamata & buku, aku makin bijak!', 'Mahkota bintang! Terima kasih sudah merawatku!']},
    jamu:   {name: 'Jamu', base: 'jamur', egg: ['#e43b44', '#f4f4f4'], unlock: {mon: 'jamur', n: 10}},
    kelip:  {name: 'Kelip', base: 'kelelawar', egg: ['#b06fd0', '#5d275d'], unlock: {mon: 'kelelawar', n: 10}},
    bubu:   {name: 'Bubu', base: 'lendirLaut', egg: ['#73eff7', '#257179'], unlock: {mon: 'lendirLaut', n: 10}},
    batu:   {name: 'Batu', base: 'lendirBatu', egg: ['#94b0c2', '#566c86'], unlock: {mon: 'lendirBatu', n: 10}},
    capit:  {name: 'Capit', base: 'kepiting', egg: ['#ef7d57', '#ffcd75'], unlock: {mon: 'kepiting', n: 10}},
    kerti:  {name: 'Kerti', base: 'hantuKertas', egg: ['#ffe4c4', '#d4a373'], unlock: {mon: 'hantuKertas', n: 10}},
    api:    {name: 'Si Api', base: 'naga', egg: ['#e43b44', '#ffcd75'], unlock: {grade: true}},
    kristal: {name: 'Kristalin', base: 'crystal', egg: ['#73eff7', '#b06fd0'], unlock: {stars: true}} // dari Tukar Bintang Misi
  };
  const IDS = Object.keys(PETS);
  const P = () => S.pets;
  const today = () => State.today();
  const fed = () => P().last === today();
  const days = id => (P().own[id] ? P().own[id].days : 0);
  const stageOf = id => { let i = 0; needOf(id).forEach((n, j) => { if (days(id) >= n) i = j; }); return i; };
  /** Teman selain Kiki yang sedang tumbuh (paling banyak satu). */
  const grower = () => Object.keys(P().own).find(id => !PETS[id].kiki && !maxed(id));
  const active = () => (P().own[P().active] ? P().active : 'kiki');
  const stage = () => stageOf(active());
  const maxed = id => stageOf(id) === NEED.length - 1;
  const heroName = () => (S.hero && S.hero.name) || 'Pahlawan';
  const petLabel = id => (PETS[id].kiki ? ['Kiki Kecil', 'Kiki Pelajar', 'Kiki Penjelajah', 'Kiki Bijak', 'Kiki Agung'][stageOf(id)] : `${PETS[id].name} ${STAGE_NAME[stageOf(id)]}`);

  /* ===== Gambar tiap tahap (didaftarkan ke MQ.Pix supaya bisa dipakai <img> & kanvas pertarungan) ===== */
  const K = MQ.Pix.K;
  function eggGrid(c) {
    const G = MQ.Pix.grid(22, 26);
    G.ell(11, 15, 9, 11, c[0]); [[7, 10], [14, 14], [9, 19], [15, 21], [6, 16]].forEach(([x, y]) => G.ell(x, y, 1.8, 1.5, c[1]));
    G.recolor(c[0], tintDark(c[0]), (x, y) => x > 14); G.px(7, 7, '#f4f4f4').px(6, 8, '#f4f4f4');
    G.rect(8, 14, 2, 2, K).rect(13, 14, 2, 2, K).px(8, 14, '#f4f4f4').px(13, 14, '#f4f4f4'); // mata mengintip
    return G.outline();
  }
  const tintDark = hex => { const n = parseInt(hex.slice(1), 16), f = v => Math.round(v * 0.78).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); };
  /** Teman dari gambar monster + perlengkapan sesuai tahap. */
  function petGrid(id, n) {
    const def = PETS[id];
    if (n === 0) return eggGrid(def.egg);
    const src = MQ.Pix.MONSTERS[def.base](), pad = 8, G = MQ.Pix.grid(src.w + 4, src.h + pad);
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) if (src.g[y][x]) G.g[y + pad][x + 2] = src.g[y][x];
    let top = G.h, l = G.w, r = 0, bot = 0;
    for (let y = 0; y < G.h; y++) for (let x = 0; x < G.w; x++) if (G.g[y][x] && G.g[y][x] !== K) { top = Math.min(top, y); bot = Math.max(bot, y); l = Math.min(l, x); r = Math.max(r, x); }
    const cx = Math.round((l + r) / 2), sy = Math.round(top + (bot - top) * 0.62);
    if (n >= 2) for (let x = l; x <= r; x++) for (const y of [sy, sy + 1]) if (G.g[y][x] && G.g[y][x] !== K) G.g[y][x] = y === sy ? '#e43b44' : '#b13e53'; // syal
    if (n === 3) { G.rect(cx - 4, top - 3, 8, 3, '#38b764').rect(cx - 6, top - 1, 4, 1, '#257179').px(cx + 1, top - 2, '#a7f070'); } // topi
    if (n >= 4) { G.rect(cx - 4, top - 3, 9, 3, '#ffcd75').px(cx - 4, top - 4, '#ffcd75').px(cx, top - 5, '#ffcd75').px(cx, top - 4, '#ffcd75').px(cx + 4, top - 4, '#ffcd75');
                  G.px(cx - 2, top - 2, '#e43b44').px(cx + 2, top - 2, '#41a6f6');
                  [[l - 2, top], [r + 1, top + 2], [l - 1, bot - 2]].forEach(([x, y]) => G.px(x, y, '#fff3b0')); }
    return G.outline();
  }
  IDS.filter(id => !PETS[id].kiki).forEach(id => [0, 1, 2, 3, 4].forEach(n => { MQ.Pix.MONSTERS[`pet_${id}_${n}`] = () => petGrid(id, n); }));
  /** Nama gambar & ukuran teman pada tahap n. */
  const spriteOf = (id, n = stageOf(id)) => (PETS[id].kiki ? {name: 'kiki' + (n + 1), size: 1} : {name: `pet_${id}_${n}`, size: SIZE[n]});
  const img = (scale = 3, id = active(), n = stageOf(id), sil = false) => { const s = spriteOf(id, n); return MQ.Pix.url(s.name, scale * s.size, sil); };

  /* ===== Syarat telur & adopsi ===== */
  function unlocked(id) {
    const u = PETS[id].unlock;
    if (!u) return true;
    if (u.grade) return S.grade > 1;
    if (u.stars) return (S.starBuys || []).includes('kristalin');
    return (S.bestiary[u.mon] || 0) >= u.n;
  }
  const reqText = id => { const u = PETS[id].unlock; return u.stars ? 'Tukar di ⭐ Misi Harian' : u.grade ? 'Lulus Kelas 1' : `Kalahkan ${Data.monsters[u.mon].name} ${u.n}× (${Math.min(u.n, S.bestiary[u.mon] || 0)}/${u.n})`; };
  const canAdopt = () => !grower();

  /* ===== Memilih soal: kemampuan terlemah + paling lama tidak dilatih ===== */
  function pool() {
    const m = {};
    Data.allFields().filter(f => f.spec && State.unlocked(f)).forEach(f => f.spec.kinds.forEach(k => { m[k] = Math.min(m[k] || 99, f.spec.max || 20); })); // semua kelas yang terbuka (bukan hanya peta yang sedang dilihat)
    if (!Object.keys(m).length) Data.byKelas[1].fields[0].spec.kinds.forEach(k => { m[k] = 10; });
    return m;
  }
  function chooseKinds() {
    const p = pool(), kinds = Object.keys(p);
    const acc = k => { const s = S.stats[k]; return s && s.b + s.s >= 3 ? s.b / (s.b + s.s) : 0.8; };
    const age = k => (P().seen[k] ? (Date.parse(today()) - Date.parse(P().seen[k])) / 864e5 : 30);
    const weak = kinds.slice().sort((a, b) => acc(a) - acc(b)).slice(0, 3);
    const old = kinds.filter(k => !weak.includes(k)).sort((a, b) => age(b) - age(a)).slice(0, 2);
    const list = [...weak, ...old];
    while (list.length < N_Q && kinds.length) list.push(MQ.pick(kinds));
    return MQ.shuffle(list.slice(0, N_Q)).map(k => ({k, max: p[k]}));
  }

  /* ===== Sapaan pribadi ===== */
  function greet() {
    const id = active(), nm = PETS[id].name;
    const h = new Date().getHours(), waktu = h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam';
    if (stageOf(id) === 0 && !PETS[id].kiki) return `(Telur ${nm} hangat... Beri 🍓 Makanan Teman dari Misi Harian supaya menetas!)`;
    if (!PETS[id].kiki && !fed()) return `${nm}: "Halo, ${heroName()}! Ayo latihan bareng Kiki, lalu beri aku Makanan Teman ya!"`;
    if (fed()) return `${nm}: "Nyam! Terima kasih, ${heroName()}. Aku sudah kenyang. Sampai besok ya!"`;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yd = S.days[State.dateKey(y)];
    const weakK = Object.entries(S.stats).filter(([, s]) => s.b + s.s >= 5).sort((a, b) => a[1].b / (a[1].b + a[1].s) - b[1].b / (b[1].b + b[1].s))[0];
    const lines = [`${nm}: "Selamat ${waktu}, ${heroName()}! Aku lapar... ayo latihan ${N_Q} soal bareng aku!`];
    if (yd && yd.b) lines.push(`Kemarin kamu menjawab benar ${yd.b} soal. Keren!"`);
    else if (weakK) lines.push(`Soal ${Questions.NAMES[weakK[0]] || weakK[0]} masih agak sulit ya? Kita latihan pelan-pelan."`);
    else lines[0] += '"';
    return lines.join(' ');
  }

  /* ===== Layar teman ===== */
  let run = null; // {list, i, ok, q}
  function render() {
    const id = active(), st = stageOf(id), ND = needOf(id), next = ND[st + 1], unit = PETS[id].kiki ? 'hari' : 'makanan';
    $('kikiTitle').textContent = `🐾 ${PETS[id].name}`;
    $('kikiImg').src = img(5);
    $('kikiImg').classList.toggle('agung', st === NEED.length - 1);
    $('kikiName').textContent = petLabel(id);
    const have = days(id) - ND[st], need = next != null ? next - ND[st] : 1;
    $('kikiGrowFill').style.width = (next != null ? Math.min(100, have / need * 100) : 100) + '%';
    $('kikiGrowText').textContent = next != null ? `${have} / ${need} ${unit} menuju tahap berikutnya` : 'Sudah dewasa! 👑';
    $('kikiStages').innerHTML = ND.map((n, i) => `<span class="kStage${i <= st ? ' got' : ''}${i === st ? ' now' : ''}">` +
      `<img src="${img(2, id, i, i > st)}" alt=""><small>${i > st ? `${n} ${unit}` : PETS[id].kiki ? ['Kecil', 'Pelajar', 'Penjelajah', 'Bijak', 'Agung'][i] : STAGE_NAME[i]}</small></span>`).join('');
    renderCollection();
    if (run) return renderQ();
    $('kikiSay').textContent = greet();
    $('kikiQ').hidden = true;
    const b = $('kikiGo');
    b.hidden = false; b.disabled = fed();
    b.textContent = fed() ? `✔ Latihan hari ini selesai` : `🍓 Latihan Teman bersama Kiki (${N_Q} soal)`;
    // Makanan Teman untuk teman yang sedang tumbuh (selain Kiki)
    const g = grower(), f = $('kikiFeed'), n = State.count('makananTeman');
    f.hidden = !g;
    if (g) { f.disabled = !n; f.textContent = n ? `🍖 Beri makan ${PETS[g].name} (punya ${n} Makanan Teman)` : `🍖 Makanan Teman habis · dapat lagi dari Misi Harian`; }
  }
  /** Koleksi: teman yang dimiliki (ketuk = ikut bertualang), telur yang bisa diadopsi, dan yang masih terkunci. */
  function renderCollection() {
    const adopt = canAdopt();
    $('petList').innerHTML = IDS.map(id => {
      const own = !!P().own[id], open = unlocked(id);
      if (own) return `<button class="petCard own${id === active() ? ' on' : ''}" data-pet="${id}"><img src="${img(2, id)}" alt="">` +
        `<b>${PETS[id].name}</b><small>${id === active() ? '⭐ Ikut bertualang' : STAGE_NAME[stageOf(id)]}</small></button>`;
      if (open) return `<button class="petCard egg" data-adopt="${id}"><img src="${img(2, id, 0)}" alt=""><b>${PETS[id].name}</b>` +
        `<small>${adopt ? '🥚 Adopsi!' : 'Besarkan temanmu sampai dewasa dulu'}</small></button>`;
      return `<div class="petCard lock"><img src="${img(2, id, 0, true)}" alt=""><b>???</b><small>${reqText(id)}</small></div>`;
    }).join('');
  }
  $('petList').addEventListener('click', e => {
    const o = e.target.closest('[data-pet]'), a = e.target.closest('[data-adopt]');
    if (o && !run) { P().active = o.dataset.pet; State.save(); sfx().equip(); render(); renderHome(); return; }
    if (!a || run) return;
    const id = a.dataset.adopt;
    if (!canAdopt()) { const g = grower(); return UI.overlay({img: `<img class="iconBig kikiPop" src="${img(4, g)}" alt="">`, title: 'Belum bisa adopsi',
      text: `Besarkan ${PETS[g].name} sampai dewasa (Agung) dulu dengan Makanan Teman, baru adopsi teman baru.`}); }
    P().own[id] = {days: 0}; P().active = id; State.save(); sfx().chest();
    UI.overlay({fx: 'chest', sub: 'TEMAN BARU', title: `Telur ${PETS[id].name}!`, chips: [{img: img(3, id, 0), text: 'Rawat setiap hari'}],
      text: `Beri 🍓 Makanan Teman (dari Peti Bonus Misi Harian) supaya telurnya menetas & ${PETS[id].name} tumbuh besar! Butuh ${MQ.Balance.pets.food[1]} makanan untuk menetas.`});
    render(); renderHome();
  });
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
    P().seen[q.kind] = today();
    sfx().correct(); btn.classList.add('benar');
    $('kikiAns').querySelectorAll('button').forEach(b => (b.disabled = true));
    run.ok++;
    const berry = document.createElement('i'); berry.className = 'berryFly'; berry.textContent = '🍓'; $('kikiNest').appendChild(berry);
    setTimeout(() => { berry.remove(); $('kikiImg').classList.remove('munch'); void $('kikiImg').offsetWidth; $('kikiImg').classList.add('munch'); sfx().potion(); }, 550);
    setTimeout(() => { run.i++; run.q = null; if (run.i < N_Q) return render(); finish(); }, 1100);
  }
  function finish() {
    const id = 'kiki', before = stageOf(id), grows = !maxed(id); // Latihan Teman membesarkan Kiki
    if (grows) P().own[id].days++;
    P().last = today(); run = null;
    if (MQ.Village) MQ.Village.addBrick(1, 'Latihan Teman');
    if (MQ.Quests) MQ.Quests.track('pet');
    if (!grows) S.coins += 5;
    State.save(); render(); renderHome();
    if (!grown(id, before)) fullUp(id, grows);
  }
  /** Beri satu Makanan Teman ke teman yang sedang tumbuh (selain Kiki). */
  $('kikiFeed').addEventListener('click', () => {
    const id = grower();
    if (!id || run || !State.count('makananTeman')) return;
    const before = stageOf(id);
    State.removeItem('makananTeman', 1); P().own[id].days++;
    State.save(); sfx().potion(); render(); renderHome();
    if (!grown(id, before)) UI.overlay({img: `<img class="iconBig kikiPop" src="${img(4, id)}" alt="">`, title: 'Nyam!',
      text: `${PETS[id].name}: "Enak! Terima kasih, ${heroName()}!" (${days(id) - needOf(id)[stageOf(id)]} / ${needOf(id)[stageOf(id) + 1] - needOf(id)[stageOf(id)]} makanan menuju tahap berikutnya)`});
  });
  /** Bila teman naik tahap: hadiah & pesan. true = sudah ditampilkan. */
  function grown(id, before) {
    const after = stageOf(id);
    if (after > before) {
      const r = REWARD[after] || {};
      if (r.coins) S.coins += r.coins;
      if (r.item) State.addItem(r.item, 1);
      State.save(); sfx().levelUp();
      const chips = [];
      if (r.coins) chips.push({img: MQ.ItemArt.url('coin'), text: `+${r.coins} koin`});
      if (r.item) chips.push({img: MQ.ItemArt.url(r.item), text: `+1 ${Data.items[r.item].name}`});
      const say = PETS[id].kiki ? PETS[id].say[after - 1] : after === 1 ? 'Krak! Aku menetas! Halo!' : after === 4 ? 'Mahkota! Aku sudah dewasa. Terima kasih!' : 'Aku tumbuh! Lihat penampilan baruku!';
      UI.overlay({fx: 'level', level: petLabel(id), from: STAGE_NAME[before], sub: '🐾 TEMANMU TUMBUH!', title: petLabel(id), btn: 'Hore!', chips,
        text: `${PETS[id].name}: "${say}"` + (after === 4 && !PETS[id].kiki && IDS.some(x => !P().own[x] && unlocked(x)) ? ' Sekarang kamu bisa adopsi teman baru!' : ''), pet: {id, n: after}});
      return true;
    }
    return false;
  }
  /** Pesan selesai Latihan Teman (tanpa naik tahap). */
  function fullUp(id, grows) {
    sfx().fanfare();
    UI.overlay({img: `<img class="iconBig kikiPop" src="${img(4)}" alt="">`, title: grows ? `${PETS[id].name} kenyang!` : 'Latihan selesai!',
      text: grows ? `${PETS[id].name}: "Nyam nyam! Terima kasih, ${heroName()}! Sampai besok ya."` : `${PETS[id].name} sudah dewasa. Kamu dapat 5 koin. Teman lain tumbuh dari Makanan Teman.`});
  }
  $('kikiGo').addEventListener('click', start);
  $('kikiBack').addEventListener('click', () => { run = null; sfx().back(); UI.show('home'); });
  UI.renderers.kiki = render;

  /* ===== Di beranda: teman bertengger di samping pahlawan ===== */
  function renderHome() {
    const el = $('homeKiki');
    if (!el) return;
    el.src = img(3);
    $('homeKikiBubble').hidden = fed();
  }

  return {renderHome, stage, img, fed, sprite: () => spriteOf(active()), petImg: (id, n, scale = 4) => img(scale, id, n)};
})();
