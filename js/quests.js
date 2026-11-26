/* Math Quest — Misi Harian (diperbarui 2026-11-26).
   - 3 misi baru setiap hari: 1 misi BELAJAR (Latihan Teman / pelajaran di Kelas / target harian) + 2 misi petualangan.
   - Tiap misi: koin + ⭐ Bintang Misi. Ketiganya selesai → Peti Bonus (⭐ tambahan, bahan khusus bergiliran, koin).
   - ⭐ ditukar di "Tukar Bintang" dengan hadiah istimewa yang tidak dijual di Toko: Fragmen Bintang (10 = Pedang Bintang di Pandai Besi),
     telur teman spesial Kristalin, kostum Mahkota Bintang, bahan khusus, Mahkota Kecil, Ramuan. Tanpa undian/gacha.
   Pertarungan, Kelas, teman & target harian melapor lewat MQ.Quests.track(jenis, nilai). */
'use strict';
window.MQ = window.MQ || {};

MQ.Quests = (() => {
  const {pick, shuffle, Data, State, UI, Questions} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);

  /* Jenis misi. 'combo' memakai nilai tertinggi, lainnya dijumlah. learn = misi belajar (selalu ada satu). */
  const TYPES = {
    pet:     {icon: '🍓', text: () => 'Selesaikan Latihan Teman', n: [1], learn: true},
    learn:   {icon: '🎓', text: () => 'Selesaikan 1 pelajaran di Kelas', n: [1], learn: true},
    goal:    {icon: '📅', text: () => 'Capai target harian (stempel)', n: [1], learn: true},
    kill:    {icon: '⚔️', text: m => `Kalahkan ${m.n} monster`, n: [5, 8, 10]},
    correct: {icon: '✅', text: m => `Jawab benar ${m.n} soal ${Questions.NAMES[m.kind] || m.kind}`, n: [5, 8]},
    boss:    {icon: '👑', text: () => 'Kalahkan 1 bos', n: [1]},
    combo:   {icon: '🔥', text: m => `Buat kombo ${m.n} kali beruntun`, n: [3, 5]},
    kilat:   {icon: '⚡', text: m => `Lakukan ${m.n} serangan KILAT`, n: [3, 5]},
    chest:   {icon: '📜', text: () => 'Buka 1 Peti Teka-teki', n: [1]},
    dungeon: {icon: '🏰', text: () => 'Taklukkan 1 dungeon', n: [1]}
  };
  const REWARDS = [{coins: 10, stars: 1}, {coins: 15, stars: 1}, {coins: 10, stars: 1, item: 'ramuan'}];
  const BONUS = {stars: 2, coins: 20, mats: ['kristalPola', 'mutiara', 'tinta']}; // bahan khusus bergiliran per hari

  const today = () => State.today();

  /** Pastikan misi hari ini ada & datanya valid; buat baru jika hari berganti. */
  function ensure() {
    const d = S.daily;
    const valid = d && d.date === today() && Array.isArray(d.list) && d.list.length === 3 &&
      d.list.every(m => m && TYPES[m.t] && Number.isFinite(m.n) && Number.isFinite(m.p) && m.reward && m.reward.stars);
    if (valid) return;
    const kinds = [...new Set(Data.fields.filter(f => f.spec && State.unlocked(f)).flatMap(f => f.spec.kinds))];
    const learn = pick(['pet', 'pet', 'learn', 'goal']);
    const pool = ['kill', 'correct', 'boss', 'combo', 'kilat', 'chest'];
    if (Data.dungeons.some(x => State.unlocked(x))) pool.push('dungeon');
    const types = [learn, ...shuffle(pool).slice(0, 2)];
    const rewards = shuffle(REWARDS.slice());
    S.daily = {date: today(), bonus: false, list: types.map((t, i) => ({
      t, kind: t === 'correct' ? pick(kinds.length ? kinds : ['tambah']) : undefined,
      n: pick(TYPES[t].n), p: 0, claimed: false, reward: rewards[i]
    }))};
    // misi yang sudah tercapai hari ini sebelum misi dibuat
    if (S.pets && S.pets.last === today()) track('pet');
    if (S.stamps && S.stamps.includes(today())) track('goal');
    State.save();
  }

  /** Dipanggil pertarungan / Kelas / teman / target harian. val: jenis soal (correct) atau panjang kombo (combo). */
  function track(type, val) {
    ensure();
    let changed = false;
    for (const m of S.daily.list) {
      if (m.t !== type || m.claimed || m.p >= m.n) continue;
      if (type === 'correct' && m.kind !== val) continue;
      m.p = type === 'combo' ? Math.max(m.p, val) : m.p + 1;
      m.p = Math.min(m.p, m.n);
      changed = true;
    }
    if (changed) State.save();
  }

  /** Jumlah hadiah yang bisa diambil (untuk tanda di menu). */
  const claimable = () => { ensure(); return S.daily.list.filter(m => m.p >= m.n && !m.claimed).length + (bonusReady() ? 1 : 0); };
  const bonusReady = () => S.daily.list.every(m => m.claimed) && !S.daily.bonus;
  const bonusMat = () => BONUS.mats[new Date().getDate() % BONUS.mats.length];

  const rewardText = r => `🪙 ${r.coins} + ⭐ ${r.stars}` + (r.item ? ` + ${Data.items[r.item].name}` : '');

  /* ===== Tukar Bintang ===== */
  const STAR_SHOP = [
    {id: 'fragmen', item: 'fragmenBintang', price: 3, text: '10 fragmen → Pedang Bintang di Pandai Besi'},
    {id: 'ramuan', item: 'ramuan', price: 2, text: 'HP penuh saat bertarung'},
    {id: 'mahkota', item: 'mahkota', price: 4, text: 'Bahan langka dari bos'},
    {id: 'kristalPola', item: 'kristalPola', price: 3, text: 'Bahan khusus senjata'},
    {id: 'mutiara', item: 'mutiara', price: 3, text: 'Bahan khusus pelindung'},
    {id: 'tinta', item: 'tinta', price: 3, text: 'Bahan khusus aksesori'},
    {id: 'mahkotaBintang', costume: 'mahkotaBintang', price: 20, once: true, text: 'Kostum kepala eksklusif'},
    {id: 'kristalin', pet: 'kristal', price: 30, once: true, text: 'Telur teman spesial Kristalin'}
  ];
  const owned = s => (s.costume ? S.costumes.includes(s.costume) : S.starBuys.includes(s.id));
  function starImg(s) {
    if (s.item) return UI.itemImg(s.item, 'stImg');
    if (s.costume) return `<img class="stImg" src="${MQ.Hero.url(Object.assign({}, S.hero, {costume: s.costume}), S.equip, 'happy')}" alt="">`;
    return `<img class="stImg" src="${MQ.Kiki.petImg(s.pet, 0, 3)}" alt="">`;
  }
  const starName = s => (s.item ? Data.items[s.item].name : s.costume ? MQ.Hero.COSTUMES[s.costume].name : 'Telur Kristalin');

  /* ===== Layar Misi ===== */
  UI.renderers.quests = () => {
    ensure();
    $('questList').innerHTML = S.daily.list.map((m, i) => {
      const done = m.p >= m.n, pct = Math.round(m.p / m.n * 100), T = TYPES[m.t];
      const btn = m.claimed ? '<button class="sBtn" disabled>Sudah ✓</button>'
                : done ? `<button class="sBtn" data-q="${i}">Ambil</button>`
                : '<button class="sBtn" disabled>Belum</button>';
      return `<div class="panel shopItem"><span class="qIco">${T.icon}</span><div class="sBody"><b>${T.text(m)}${T.learn ? ' <i class="pwTag">belajar</i>' : ''}</b>` +
             `<div class="bar"><div style="width:${pct}%;background:var(--hijau)"></div><span>${m.p} / ${m.n}</span></div>` +
             `<small>Hadiah: ${rewardText(m.reward)}</small></div>${btn}</div>`;
    }).join('');
    const n = S.daily.list.filter(m => m.claimed).length, ready = bonusReady();
    $('questBonus').innerHTML = `<div class="panel bonusBox${ready ? ' ready' : ''}"><img src="${MQ.Pix.url(S.daily.bonus ? 'petiBuka' : 'peti', 3)}" alt="">` +
      `<div class="sBody"><b>Peti Bonus Harian</b><small>${S.daily.bonus ? 'Sudah dibuka. Datang lagi besok!' : `Ambil hadiah ketiga misi (${n}/3): ⭐ ${BONUS.stars} + ${Data.items[bonusMat()].name} + 🪙 ${BONUS.coins}`}</small></div>` +
      `<button class="sBtn" id="qBonus" ${ready ? '' : 'disabled'}>${S.daily.bonus ? '✓' : 'Buka'}</button></div>`;
    $('starNow').textContent = `Punya ⭐ ${S.starTokens}`;
    $('starShop').innerHTML = STAR_SHOP.map(s => {
      const own = s.once && owned(s), can = !own && S.starTokens >= s.price;
      return `<div class="panel shopItem starItem">${starImg(s)}<div class="sBody"><b>${starName(s)}</b><small>${s.text}</small></div>` +
        `<button class="sBtn" data-star="${s.id}" ${can ? '' : 'disabled'}>${own ? '✓ Punya' : `⭐ ${s.price}`}</button></div>`;
    }).join('');
  };
  $('questList').addEventListener('click', e => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const m = S.daily.list[+b.dataset.q];
    if (!m || m.claimed || m.p < m.n) return;
    m.claimed = true;
    S.coins += m.reward.coins; S.starTokens += m.reward.stars;
    if (m.reward.item) State.addItem(m.reward.item);
    State.save();
    MQ.Audio.sfx.chest();
    UI.renderers.quests();
    const chips = [{img: MQ.ItemArt.url('coin'), text: `+${m.reward.coins} koin`}, {icon: '⭐', text: `+${m.reward.stars} Bintang Misi`}];
    if (m.reward.item) chips.push({img: MQ.ItemArt.url(m.reward.item), text: `+1 ${Data.items[m.reward.item].name}`});
    UI.overlay({fx: 'medal', icon: TYPES[m.t].icon, sub: 'MISI SELESAI', title: TYPES[m.t].text(m), chips,
      text: bonusReady() ? 'Ketiga misi selesai! Buka Peti Bonus di bawah.' : 'Selesaikan semua misi untuk membuka Peti Bonus!'});
  });
  $('questBonus').addEventListener('click', e => {
    if (!e.target.closest('#qBonus') || !bonusReady()) return;
    S.daily.bonus = true; S.starTokens += BONUS.stars; S.coins += BONUS.coins; State.addItem(bonusMat(), 1);
    State.save(); MQ.Audio.sfx.chest(); UI.renderers.quests();
    UI.overlay({fx: 'chest', sub: 'SEMUA MISI SELESAI', title: 'Peti Bonus!', chips: [{icon: '⭐', text: `+${BONUS.stars} Bintang Misi`},
      {img: MQ.ItemArt.url(bonusMat()), text: `+1 ${Data.items[bonusMat()].name}`}, {img: MQ.ItemArt.url('coin'), text: `+${BONUS.coins} koin`}],
      text: 'Hebat! Tukarkan ⭐ dengan hadiah istimewa di Tukar Bintang.'});
  });
  $('starShop').addEventListener('click', e => {
    const b = e.target.closest('[data-star]');
    if (!b || b.disabled) return;
    const s = STAR_SHOP.find(x => x.id === b.dataset.star);
    if (S.starTokens < s.price || (s.once && owned(s))) return;
    S.starTokens -= s.price;
    if (s.item) State.addItem(s.item, 1);
    if (s.costume) { S.costumes.push(s.costume); S.hero.costume = s.costume; }
    if (s.pet || s.once) S.starBuys.push(s.id);
    State.save(); MQ.Audio.sfx.buy(); UI.renderers.quests();
    const extra = s.item === 'fragmenBintang' ? ` Kamu punya ${State.count('fragmenBintang')} dari 10 fragmen.` : s.pet ? ' Lihat di 🐾 Koleksi Teman: adopsi saat semua temanmu sudah dewasa.' : s.costume ? ' Langsung dipakai!' : '';
    UI.overlay({img: starImg(s).replace('stImg', 'iconBig'), title: `${starName(s)}!`, text: `Ditukar dengan ⭐ ${s.price}.${extra}`});
  });

  return {ensure, track, claimable};
})();
