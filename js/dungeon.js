/* Math Quest — 🏰 halaman Dungeon (dari bilah bawah). Tampilan baru 2026-11-26:
   1. Daftar: satu kartu per dungeon berisi pemandangan LUAR yang bergerak (dungeonart.js) + info dasar.
   2. Ketuk kartu → halaman dungeon: lorong DALAM bergerak (bos, monster kunci, peti), daftar musuh,
      pilihan tingkat ⭐ / ⭐⭐ / ⭐⭐⭐ dengan hadiahnya, lalu tombol Masuk.
   Tombol ⓘ di judul = aturan dungeon (HP tidak pulih, dll.).
   Tingkat berikutnya terbuka setelah tingkat sebelumnya selesai (S.dungeonStars[id] = tingkat tertinggi yang selesai).
   Angka tiap tingkat (level +, kecepatan, hadiah) di balance.js "tiers". */
'use strict';
window.MQ = window.MQ || {};

MQ.Dungeon = (() => {
  const {Data, State, UI, Sprites} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const TIERS = () => MQ.Balance.tiers;
  const stars = n => '⭐'.repeat(n);
  const best = d => S.dungeonStars[d.id] || 0;
  /** Rentang level musuh pada tingkat t (0-based). */
  const lvText = (d, t) => `Lv ${d.lv[0] + TIERS()[t].lvAdd}–${d.lv[1] + TIERS()[t].lvAdd}`;
  const monImg = (id, sc = 3) => { const m = Data.monsters[id]; return MQ.Pix.has(id) ? MQ.Pix.url(id, sc) : Sprites.url(m.sprite, m.pal); };
  const SLOT = {guaPola: 'senjata', kapalKaram: 'pelindung', perpustakaan: 'aksesori', k2pabrik: 'senjata', k2menaraJam: 'pelindung', k2guaPetir: 'aksesori'};
  const specialMat = d => Object.keys(d.reward.items).find(id => Data.items[id].from);
  const TIER_NAME = ['Mudah', 'Sulit', 'Sangat Sulit'];

  let open = null, pick = 0; // dungeon yang sedang dibuka & tingkat terpilih

  /* ===== 1. Daftar dungeon ===== */
  function card(d) {
    const lock = !State.unlocked(d), mat = specialMat(d), got = best(d);
    const starRow = [0, 1, 2].map(i => `<i class="${i < got ? 'on' : ''}">★</i>`).join('');
    const req = lock ? Data.allFields().find(f => f.id === d.req) : null;
    return `<div class="dCard panel${lock ? ' lock' : ''}" data-d="${d.id}" role="button">` +
      `<div class="dArt"><canvas class="dScene" data-out="${d.id}"></canvas>` +
        `<span class="dName">${d.icon} ${d.name}${mat ? `<button class="dInfoBtn" data-info="${d.id}" aria-label="Info bahan khusus">i</button>` : ''}</span><span class="dStars">${starRow}</span>` +
        (lock ? `<span class="dLockTag">🔒 Kalahkan bos ${req.name} dulu</span>` : '<span class="dEnter">Masuk ▶</span>') + `</div>` +
      // 2 baris saja: cerita + materi/ruang/level (bahan khusus ada di tombol i)
      `<div class="dInfo"><p class="dStory">${d.desc}</p>` +
        `<div class="dChips"><span class="dTopic">📘 ${d.topic}</span><span>🚪 ${d.rooms}</span><span>⚔️ ${lvText(d, 0)}</span></div>` +
      `</div></div>`;
  }
  function renderList() {
    $('dungeonList').hidden = false; $('dungeonDetail').hidden = true;
    $('dungeonList').innerHTML = Data.dungeons.map(card).join('');
    draw(performance.now() / 1000);
  }

  /* ===== 2. Halaman satu dungeon ===== */
  function renderDetail() {
    const d = open, T = TIERS(), got = best(d);
    $('dungeonList').hidden = true; $('dungeonDetail').hidden = false;
    const foes = [...new Set(d.mobs)].map(id => `<span class="dFoe"><img src="${monImg(id)}" alt=""><small>${Data.monsters[id].name}</small></span>`).join('') +
      `<span class="dFoe key"><img src="${monImg(d.key)}" alt=""><small>⭐ ${Data.monsters[d.key].name}</small></span>` +
      `<span class="dFoe boss"><img src="${monImg(d.boss)}" alt=""><small>👑 ${Data.monsters[d.boss].name}</small></span>`;
    const tiers = T.map((x, i) => {
      const st = i < got ? 'done' : i === got ? 'open' : 'lock';
      return `<button class="dTier ${st}${i === pick ? ' on' : ''}" data-t="${i}"><b>${stars(i + 1)}</b><small>${TIER_NAME[i]}</small>` +
             `<small>${lvText(d, i)}</small><em>${st === 'done' ? '✔ Selesai' : st === 'lock' ? '🔒 Terkunci' : '⚔️ Siap'}</em></button>`;
    }).join('');
    const t = T[pick], mul = t.rewardMul, r = d.reward, locked = pick > got;
    const loot = `<span class="dLoot">🪙 ${Math.round(r.coins * mul)}</span>` +
      Object.entries(r.items).map(([id, n]) => `<span class="dLoot">${UI.itemImg(id)}×${Math.round(n * mul)}</span>`).join('');
    const note = pick === 0 ? 'Musuh biasa. Cocok untuk pertama kali.'
      : pick === 1 ? 'Musuh lebih kuat & lebih cepat, kadang DUA monster sekaligus.'
      : 'Musuh paling kuat & paling cepat. Hadiah paling banyak!';
    $('dungeonDetail').innerHTML =
      `<div class="dArt big"><canvas class="dScene" data-in="${d.id}"></canvas><span class="dName">${d.icon} ${d.name}</span></div>` +
      `<p class="dStory">${d.desc}</p>` +
      `<div class="dChips"><span>📘 ${d.topic}</span><span>🚪 ${d.rooms} ruang</span><span>❤️ HP tidak pulih</span></div>` +
      `<h3 class="dSub">Penghuni</h3><div class="dFoes">${foes}</div>` +
      `<h3 class="dSub">Pilih tingkat</h3><div class="dTiers">${tiers}</div>` +
      `<div class="panel dPick"><b>${d.name} ${stars(pick + 1)} · ${lvText(d, pick)}</b><small>${note}</small>` +
        `<div class="dLoots"><span class="dLootT">🎁 Peti harta:</span>${loot}</div></div>` +
      `<button class="dGo${locked ? ' off' : ''}" id="dGo">${locked ? `🔒 Selesaikan ${stars(pick)} dulu` : `⚔️ Masuk ${stars(pick + 1)}`}</button>`;
    draw(performance.now() / 1000);
  }

  function render() { if (open) renderDetail(); else renderList(); }
  UI.renderers.dungeon = () => { open = null; render(); };

  $('dungeonList').addEventListener('click', e => {
    const ib = e.target.closest('[data-info]');
    if (ib) { // keterangan bahan khusus, tanpa membuka dungeon
      const d = Data.dungeons.find(x => x.id === ib.dataset.info), mat = specialMat(d), it = Data.items[mat];
      MQ.Audio.sfx.click();
      return UI.overlay({img: UI.itemImg(mat, 'iconBig'), title: it.name,
        text: `Bahan khusus untuk membuat & meningkatkan ${SLOT[d.id] || 'perlengkapan'} kuat. Didapat dari peti harta & monster kunci ${d.name}; makin banyak di tingkat ⭐⭐⭐.`});
    }
    const c = e.target.closest('.dCard');
    if (!c) return;
    const d = Data.dungeons.find(x => x.id === c.dataset.d);
    if (!State.unlocked(d)) {
      const req = Data.allFields().find(f => f.id === d.req);
      return UI.overlay({icon: '🔒', title: `${d.name} masih terkunci`, text: `Kalahkan bos ${req.name} di Peta dulu untuk membuka ${d.name}.`});
    }
    MQ.Audio.sfx.door();
    open = d; pick = Math.min(best(d), TIERS().length - 1);
    renderDetail(); window.scrollTo(0, 0);
  });
  $('dungeonDetail').addEventListener('click', e => {
    const tb = e.target.closest('.dTier');
    if (tb) { pick = Number(tb.dataset.t); MQ.Audio.sfx.click(); return renderDetail(); }
    if (!e.target.closest('#dGo')) return;
    const d = open, t = pick;
    if (t > best(d)) return UI.overlay({icon: '🔒', title: `${stars(t + 1)} masih terkunci`, text: `Selesaikan ${d.name} ${stars(t)} dulu.`});
    MQ.Cutscene.playOnce(`${d.id}-intro`, () => MQ.Battle.start(d, {tier: t}));
  });
  $('dungeonBack').addEventListener('click', () => {
    MQ.Audio.sfx.back();
    if (open) { open = null; renderList(); window.scrollTo(0, 0); } else UI.show('home');
  });
  $('dungeonInfo').addEventListener('click', () => UI.overlay({icon: '🏰', title: 'Aturan Dungeon',
    text: '❤️ HP TIDAK pulih di dalam dungeon, jadi bawa Ramuan Penyembuh! 🚪 Lewati ruang demi ruang: ada monster kunci ⭐ di tengah ' +
          'dan bos 👑 di ruang terakhir, lalu peti harta. ⭐ Selesaikan tingkat ⭐ untuk membuka ⭐⭐, lalu ⭐⭐⭐. Tingkat lebih tinggi = hadiah lebih banyak.'}));

  /* ===== Animasi: ±12 fps, hanya saat halaman Dungeon tampil ===== */
  function draw(t) {
    document.querySelectorAll('#scr-dungeon canvas.dScene').forEach(cv => {
      if (cv.dataset.out) MQ.DungeonArt.outside(cv, cv.dataset.out, t);
      else MQ.DungeonArt.inside(cv, cv.dataset.in, t);
    });
  }
  let last = 0;
  (function loop(ms) {
    requestAnimationFrame(loop);
    if (ms - last < 80 || document.hidden || !$('scr-dungeon').classList.contains('on')) return;
    last = ms; draw(ms / 1000);
  })(0);

  /** Dungeon selesai pada tingkat t → simpan bintang tertinggi. */
  function cleared(id, t) { S.dungeonStars[id] = Math.max(S.dungeonStars[id] || 0, t + 1); }

  return {cleared};
})();
