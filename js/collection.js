/* Math Quest — koleksi: Buku Monster & Medali (+ hadiah kostum).
   - Buku Monster: S.bestiary[idMonster] = jumlah dikalahkan. Kartu berisi cerita, drop, lokasi, gaya bertarung.
   - Medali: syarat dihitung dari data permainan; saat terpenuhi → hadiah koin/kostum (S.medals, S.costumes). */
'use strict';
window.MQ = window.MQ || {};

MQ.Collection = (() => {
  const {Data, State, UI, Sprites, Hero} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);

  /* ===== Buku Monster ===== */
  const MONSTER_IDS = Object.keys(Data.monsters);
  const places = () => [...Data.fields.filter(f => f.mobs || f.boss), ...Data.dungeons, Data.arena];
  /** Peran monster: bos, kunci, atau biasa. */
  function role(id) {
    if (Data.dungeons.some(d => d.key === id)) return 'Monster kunci';
    if (places().some(p => p.boss === id)) return 'Bos';
    return 'Monster biasa';
  }
  /** Tempat monster ini bisa ditemui. */
  const locations = id => places().filter(p => (p.mobs || []).includes(id) || p.boss === id || p.key === id).map(p => p.name);
  /** Gaya bertarung dari jenis tubuh (lihat Data.styles), dalam kata-kata anak. */
  function styleText(m) {
    const st = Data.styles[m.sprite] || {spd: [3, 5], power: 1};
    const spd = m.spd || st.spd, pow = m.power || st.power, avg = (spd[0] + spd[1]) / 2;
    return (avg < 3 ? 'Menyerang cepat' : avg > 4.2 ? 'Menyerang lambat' : 'Menyerang sedang') +
           (pow >= 1.3 ? ', pukulannya keras' : pow < 1 ? ', pukulannya ringan' : '');
  }
  const count = id => S.bestiary[id] || 0;
  const stars = n => (n >= 25 ? '⭐⭐⭐' : n >= 10 ? '⭐⭐' : n >= 1 ? '⭐' : '');
  const found = () => MONSTER_IDS.filter(id => count(id) > 0).length;

  /** Catat monster dikalahkan (dipanggil battle.js). */
  function recordKill(id) { S.bestiary[id] = count(id) + 1; }

  let selected = null;
  UI.renderers.book = () => {
    MQ.Audio.sfx.bookOpen();
    $('bookProgress').textContent = `👾 ${found()}/${MONSTER_IDS.length}`;
    $('bookGrid').innerHTML = MONSTER_IDS.map(id => {
      const m = Data.monsters[id], seen = count(id) > 0;
      const img = MQ.Pix.has(id) ? MQ.Pix.url(id, 4, !seen) : Sprites.url(m.sprite, seen ? m.pal : silhouette(m.sprite));
      return `<button class="bookCard${seen ? '' : ' unseen'}${id === selected ? ' on' : ''}" data-mon="${id}">` +
             `<img src="${img}" alt=""><small>${seen ? m.name : '???'}</small>${seen ? `<i>${stars(count(id))}</i>` : ''}</button>`;
    }).join('');
    showDetail(selected || MONSTER_IDS.find(id => count(id) > 0) || MONSTER_IDS[0]);
  };
  /** Palet bayangan: semua warna sprite jadi gelap (monster belum ditemukan). */
  function silhouette(sprite) {
    const pal = {};
    for (const k of Object.keys(Sprites.DATA[sprite].pal)) pal[k] = '#333c57';
    pal.k = '#1a1c2c'; // garis tepi tetap gelap
    return pal;
  }
  function showDetail(id) {
    selected = id;
    const m = Data.monsters[id], n = count(id), seen = n > 0;
    $('bookImg').src = MQ.Pix.has(id) ? MQ.Pix.url(id, 4, !seen) : Sprites.url(m.sprite, seen ? m.pal : silhouette(m.sprite));
    $('bookName').textContent = seen ? m.name : '???';
    $('bookRole').textContent = role(id);
    const drop = Data.items[m.drop];
    const rows = seen ? [
      ['📜', m.lore],
      ['🎁 Menjatuhkan', drop.name + (role(id) === 'Bos' ? ' (×3) + Mahkota Kecil' : '')],
      ['🗺️ Ditemukan di', locations(id).join(', ') || '-'],
      ['⚔️ Gaya bertarung', styleText(m)],
      ['🏆 Dikalahkan', `${n} kali ${stars(n)}`]
    ] : [
      ['❓', 'Monster ini belum pernah kamu kalahkan.'],
      ['🗺️ Petunjuk', 'Cari di ' + (locations(id).join(', ') || 'tempat rahasia') + '.']
    ];
    $('bookInfo').innerHTML = rows.map(([k, v]) => `<div class="bookRow"><b>${k}</b><span></span></div>`).join('');
    // teks dipasang lewat textContent (tetap aman walau nanti datanya berasal dari luar)
    [...$('bookInfo').querySelectorAll('.bookRow span')].forEach((sp, i) => (sp.textContent = rows[i][1]));
    document.querySelectorAll('.bookCard').forEach(c => c.classList.toggle('on', c.dataset.mon === id));
  }
  $('bookGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-mon]');
    if (!b) return;
    MQ.Audio.sfx.book();
    showDetail(b.dataset.mon);
    $('bookDetail').scrollIntoView({block: 'nearest', behavior: 'smooth'});
  });

  /* ===== Medali ===== */
  const totalB = kind => (S.stats[kind] || {b: 0}).b;
  const dungeonDone = id => S.cleared.includes(id);
  /* Tiap medali: judul, syarat, target, nilai saat ini, hadiah {coins} atau {costume} */
  const MEDALS = [
    {id: 'pertama', icon: '🗡️', name: 'Langkah Pertama', desc: 'Kalahkan 1 monster', target: 1, val: () => S.monsters, reward: {coins: 10}},
    {id: 'pemburu50', icon: '⚔️', name: 'Pemburu Monster', desc: 'Kalahkan 50 monster', target: 50, val: () => S.monsters, reward: {costume: 'telingaKucing'}},
    {id: 'pemburu150', icon: '🛡️', name: 'Pemburu Hebat', desc: 'Kalahkan 150 monster', target: 150, val: () => S.monsters, reward: {coins: 50}},
    {id: 'bosPertama', icon: '👑', name: 'Penakluk Bos', desc: 'Kalahkan bos area pertama', target: 1, val: () => State.shards(), reward: {costume: 'pitaBesar'}},
    {id: 'kristal', icon: '💎', name: 'Pengumpul Kristal', desc: 'Kumpulkan 6 kepingan kristal', target: 6, val: () => State.shards(), reward: {costume: 'mahkotaBunga'}},
    {id: 'lulus', icon: '🎓', name: 'Lulus Kelas 1', desc: 'Lulus Ujian Naik Kelas', target: 1, val: () => (S.grade > 1 ? 1 : 0), reward: {costume: 'mahkotaEmas'}},
    {id: 'gua', icon: '🕳️', name: 'Sahabat Momo', desc: 'Taklukkan Gua Pola', target: 1, val: () => (dungeonDone('guaPola') ? 1 : 0), reward: {costume: 'kacamata'}},
    {id: 'kapal', icon: '⛵', name: 'Pelaut Cerdas', desc: 'Taklukkan Kapal Karam', target: 1, val: () => (dungeonDone('kapalKaram') ? 1 : 0), reward: {costume: 'topiBajakLaut'}},
    {id: 'perpus', icon: '📚', name: 'Pustakawan Muda', desc: 'Taklukkan Perpustakaan Tua', target: 1, val: () => (dungeonDone('perpustakaan') ? 1 : 0), reward: {costume: 'topiPenyihir'}},
    {id: 'bintang3', icon: '🌟', name: 'Penakluk Dungeon', desc: 'Selesaikan semua dungeon di ⭐⭐⭐', target: 3,
     val: () => ['guaPola', 'kapalKaram', 'perpustakaan'].filter(id => (S.dungeonStars[id] || 0) >= 3).length, reward: {coins: 100}},
    {id: 'pahlawan', icon: '🦸', name: 'Pahlawan Sejati', desc: 'Kalahkan 6 bos area di Mode Pahlawan', target: 6,
     val: () => State.mainFields().filter(f => S.heroCleared.includes(f.id)).length, reward: {coins: 100}},
    {id: 'legenda', icon: '🐉', name: 'Legenda Matematika', desc: 'Kalahkan 6 bos area di Mode Legenda', target: 6,
     val: () => State.mainFields().filter(f => S.legendCleared.includes(f.id)).length, reward: {coins: 200}},
    {id: 'tingkat5', icon: '✨', name: 'Ahli Tempa', desc: 'Tingkatkan satu perlengkapan sampai +5', target: 5,
     val: () => Math.max(0, ...Object.values(S.upgrades)), reward: {coins: 50}},
    {id: 'tingkat10', icon: '💎', name: 'Tempa Legenda', desc: 'Tingkatkan satu perlengkapan sampai +10', target: 10,
     val: () => Math.max(0, ...Object.values(S.upgrades)), reward: {coins: 150}},
    {id: 'kombo10', icon: '🔥', name: 'Kombo Api', desc: 'Jawab benar 10 kali beruntun', target: 10, val: () => S.bestCombo, reward: {coins: 20}},
    {id: 'kilat50', icon: '⚡', name: 'Secepat Kilat', desc: 'Lakukan 50 serangan KILAT', target: 50, val: () => S.kilat, reward: {coins: 30}},
    {id: 'tambah50', icon: '➕', name: 'Ahli Tambah', desc: 'Jawab benar 50 soal tambah', target: 50, val: () => totalB('tambah'), reward: {coins: 15}},
    {id: 'kurang50', icon: '➖', name: 'Ahli Kurang', desc: 'Jawab benar 50 soal kurang', target: 50, val: () => totalB('kurang'), reward: {coins: 15}},
    {id: 'hitung50', icon: '🍎', name: 'Ahli Menghitung', desc: 'Jawab benar 50 soal menghitung', target: 50, val: () => totalB('hitung'), reward: {coins: 15}},
    {id: 'bentuk30', icon: '🔺', name: 'Ahli Bentuk', desc: 'Jawab benar 30 soal bentuk & pola', target: 30, val: () => totalB('bentuk') + totalB('pola'), reward: {coins: 15}},
    {id: 'puluhan30', icon: '🧮', name: 'Ahli Puluhan', desc: 'Jawab benar 30 soal puluhan', target: 30, val: () => totalB('puluhan'), reward: {coins: 15}},
    {id: 'buku10', icon: '📖', name: 'Peneliti Monster', desc: 'Temukan 10 monster di Buku Monster', target: 10, val: found, reward: {coins: 30}},
    {id: 'bukuSemua', icon: '🌟', name: 'Ensiklopedia Hidup', desc: `Temukan semua ${MONSTER_IDS.length} monster`, target: MONSTER_IDS.length, val: found, reward: {coins: 100}},
    {id: 'level10', icon: '💪', name: 'Makin Kuat', desc: 'Capai Level 10', target: 10, val: () => S.level, reward: {coins: 20}},
    {id: 'level20', icon: '🏋️', name: 'Siap Ujian', desc: 'Capai Level 20', target: 20, val: () => S.level, reward: {coins: 50}},
    {id: 'pandai', icon: '🔨', name: 'Si Pandai Besi', desc: 'Buat 1 barang di Pandai Besi', target: 1, val: () => S.crafted, reward: {coins: 10}},
    {id: 'rajin5', icon: '📅', name: 'Anak Rajin', desc: 'Bermain di 5 hari berbeda', target: 5, val: () => Object.keys(S.days).length, reward: {coins: 30}}
  ];
  const rewardText = r => (r.costume ? `Kostum ${Hero.COSTUMES[r.costume].name}` : `${r.coins} koin`);

  /** Periksa medali baru; berikan hadiah; tampilkan pesan satu per satu, lalu done(). */
  function check(done) {
    const fresh = MEDALS.filter(m => !S.medals[m.id] && m.val() >= m.target);
    fresh.forEach(m => {
      S.medals[m.id] = true;
      if (m.reward.coins) S.coins += m.reward.coins;
      if (m.reward.costume && !S.costumes.includes(m.reward.costume)) S.costumes.push(m.reward.costume);
    });
    if (fresh.length) State.save();
    const next = () => {
      const m = fresh.shift();
      if (!m) { if (done) done(); return; }
      MQ.Audio.sfx.fanfare();
      UI.overlay({icon: m.icon, title: `Medali Baru: ${m.name}!`, btn: 'Hore!', cb: next,
        text: `${m.desc}. Hadiah: ${rewardText(m.reward)}.` + (m.reward.costume ? ' Pakai di Karakter → Ubah penampilan.' : '')});
    };
    next();
  }

  UI.renderers.medals = () => {
    const got = MEDALS.filter(m => S.medals[m.id]).length;
    $('medalProgress').textContent = `🏅 ${got}/${MEDALS.length}`;
    $('medalList').innerHTML = MEDALS.map(m => {
      const have = !!S.medals[m.id], v = Math.min(m.val(), m.target), pct = Math.round(v / m.target * 100);
      return `<div class="medal${have ? ' got' : ''}"><span class="mIcon">${m.icon}</span><div class="mBody"><b>${m.name}</b><small>${m.desc}</small>` +
             `<div class="bar"><div style="width:${pct}%"></div><span>${have ? 'Selesai!' : `${v} / ${m.target}`}</span></div>` +
             `<small class="mReward">🎁 ${rewardText(m.reward)}</small></div></div>`;
    }).join('');
  };

  return {recordKill, check, found, MEDALS, MONSTER_IDS};
})();
