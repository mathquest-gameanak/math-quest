/* Math Quest — 🏰 halaman Dungeon (dari bilah bawah).
   Satu kartu per dungeon: gambar bos, nama, cerita, materi, level, dan tombol tingkat ⭐ / ⭐⭐ / ⭐⭐⭐.
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

  function card(d) {
    const boss = Data.monsters[d.boss], img = `<img class="dImg" src="${Sprites.url(boss.sprite, boss.pal)}" alt="">`;
    const mat = Object.keys(d.reward.items).find(id => Data.items[id].from), SLOT = {guaPola: 'senjata', kapalKaram: 'pelindung', perpustakaan: 'aksesori'};
    const matLine = mat ? `<p class="dMat">${UI.itemImg(mat)}<span>Bahan khusus <b>${Data.items[mat].name}</b> untuk ${SLOT[d.id] || 'equipment'} kuat</span></p>` : '';
    const head = `<div class="dHead">${img}<div class="dBody"><b>${d.icon} ${d.name}</b><small>📘 ${d.topic}</small>` +
                 `<small>🚪 ${d.rooms} ruang · ${lvText(d, 0)}</small></div></div><p class="dStory">${d.desc}</p>${matLine}`;
    if (!State.unlocked(d)) {
      const req = Data.fields.find(f => f.id === d.req);
      return `<div class="panel dCard lock">${head}<p class="dLock">🔒 Kalahkan bos ${req.name} dulu</p></div>`;
    }
    const tiers = TIERS().map((t, i) => {
      const st = i < best(d) ? 'done' : i === best(d) ? 'open' : 'lock';
      return `<button class="dTier ${st}" data-d="${d.id}" data-t="${i}"><b>${stars(i + 1)}</b>` +
             `<small>${lvText(d, i)}</small><small>${st === 'done' ? '✔ Selesai' : st === 'lock' ? '🔒' : 'Main!'}</small></button>`;
    }).join('');
    return `<div class="panel dCard">${head}<div class="dTiers">${tiers}</div></div>`;
  }

  UI.renderers.dungeon = () => { $('dungeonList').innerHTML = Data.dungeons.map(card).join(''); };

  $('dungeonList').addEventListener('click', e => {
    const b = e.target.closest('.dTier');
    if (!b) return;
    const d = Data.dungeons.find(x => x.id === b.dataset.d), t = Number(b.dataset.t), T = TIERS()[t];
    if (t > best(d)) {
      return UI.overlay({icon: '🔒', title: `${stars(t + 1)} masih terkunci`, text: `Selesaikan ${d.name} ${stars(t)} dulu.`});
    }
    const r = d.reward, mul = T.rewardMul;
    const items = Object.entries(r.items).map(([id, n]) => `${Math.round(n * mul)} ${Data.items[id].name}`).join(', ');
    const harder = t ? ' Musuh lebih kuat & lebih cepat!' : '';
    UI.overlay({icon: d.icon, title: `${d.name} ${stars(t + 1)}`, btn: 'Masuk', btn2: 'Nanti',
      text: `${d.rooms} ruang, musuh ${lvText(d, t)}.${harder} HP tidak pulih, bawa Ramuan Penyembuh! ` +
            `Peti harta: ${Math.round(r.coins * mul)} koin, ${items}.`,
      cb: () => MQ.Cutscene.playOnce(`${d.id}-intro`, () => MQ.Battle.start(d, {tier: t}))});
  });

  /** Dungeon selesai pada tingkat t → simpan bintang tertinggi. */
  function cleared(id, t) { S.dungeonStars[id] = Math.max(S.dungeonStars[id] || 0, t + 1); }

  return {cleared};
})();
