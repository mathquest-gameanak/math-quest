/* Math Quest — Misi Harian: 3 misi baru setiap hari (tanggal HP), hadiah diambil di layar Misi.
   Pertarungan melapor lewat MQ.Quests.track(jenis, nilai). */
'use strict';
window.MQ = window.MQ || {};

MQ.Quests = (() => {
  const {rand, pick, shuffle, Data, State, UI, Questions} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);

  /* Jenis misi. target(n, kind) → teks; 'combo' memakai nilai tertinggi, lainnya dijumlah. */
  const TYPES = {
    kill:    {text: m => `Kalahkan ${m.n} monster`, n: [5, 8, 10]},
    correct: {text: m => `Jawab benar ${m.n} soal ${Questions.NAMES[m.kind] || m.kind}`, n: [5, 8]},
    boss:    {text: () => 'Kalahkan 1 bos', n: [1]},
    combo:   {text: m => `Buat kombo ${m.n} kali beruntun`, n: [3, 5]},
    dungeon: {text: () => 'Taklukkan 1 dungeon', n: [1]}
  };
  const REWARDS = [{coins: 5}, {coins: 8}, {coins: 4, item: 'ramuan'}];

  const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

  /** Pastikan misi hari ini ada & datanya valid; buat baru jika hari berganti. */
  function ensure() {
    const d = S.daily;
    const valid = d && d.date === today() && Array.isArray(d.list) && d.list.length === 3 &&
      d.list.every(m => m && TYPES[m.t] && Number.isFinite(m.n) && Number.isFinite(m.p) && m.reward);
    if (valid) return;
    // Jenis soal dari area yang sudah terbuka; dungeon hanya jika sudah terbuka
    const kinds = [...new Set(Data.fields.filter(f => f.spec && State.unlocked(f)).flatMap(f => f.spec.kinds))];
    const pool = ['kill', 'correct', 'boss', 'combo'];
    if (Data.dungeons.some(x => State.unlocked(x))) pool.push('dungeon');
    const types = shuffle(pool).slice(0, 3);
    const rewards = shuffle(REWARDS.slice());
    S.daily = {date: today(), list: types.map((t, i) => ({
      t, kind: t === 'correct' ? pick(kinds.length ? kinds : ['tambah']) : undefined,
      n: pick(TYPES[t].n), p: 0, claimed: false, reward: rewards[i]
    }))};
    State.save();
  }

  /** Dipanggil pertarungan. val: jenis soal (correct) atau panjang kombo (combo). */
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

  /** Jumlah misi selesai yang hadiahnya belum diambil (untuk tanda di menu). */
  const claimable = () => { ensure(); return S.daily.list.filter(m => m.p >= m.n && !m.claimed).length; };

  const rewardText = r => `🪙 ${r.coins}` + (r.item ? ` + ${Data.items[r.item].name}` : '');

  /* ===== Layar Misi ===== */
  UI.renderers.quests = () => {
    ensure();
    $('questList').innerHTML = S.daily.list.map((m, i) => {
      const done = m.p >= m.n, pct = Math.round(m.p / m.n * 100);
      const btn = m.claimed ? '<button class="sBtn" disabled>Sudah ✓</button>'
                : done ? `<button class="sBtn" data-q="${i}">Ambil</button>`
                : '<button class="sBtn" disabled>Belum</button>';
      return `<div class="panel shopItem"><div class="sBody"><b>${TYPES[m.t].text(m)}</b>` +
             `<div class="bar"><div style="width:${pct}%;background:var(--hijau)"></div><span>${m.p} / ${m.n}</span></div>` +
             `<small>Hadiah: ${rewardText(m.reward)}</small></div>${btn}</div>`;
    }).join('');
  };
  $('questList').addEventListener('click', e => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const m = S.daily.list[+b.dataset.q];
    if (!m || m.claimed || m.p < m.n) return;
    m.claimed = true;
    S.coins += m.reward.coins;
    if (m.reward.item) State.addItem(m.reward.item);
    State.save();
    MQ.Audio.sfx.levelUp();
    UI.renderers.quests();
    UI.overlay({icon: '🎉', title: 'Misi Selesai!', text: `Hadiah: ${rewardText(m.reward)}. Misi baru muncul besok!`});
  });

  return {ensure, track, claimable};
})();
