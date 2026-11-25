/* Math Quest — layar Toko & Pandai Besi.
   Setiap transaksi adalah soal matematika (kembalian, sisa, kekurangan bahan).
   Jawaban salah tidak dihukum: tombolnya mati dan anak mencoba lagi. */
'use strict';
window.MQ = window.MQ || {};

MQ.Shop = (() => {
  const {Data, State, UI} = MQ;
  const S = State.S, items = Data.items;
  const $ = id => document.getElementById(id);
  const isGear = it => ['senjata', 'pelindung', 'aksesori'].includes(it.type);
  const have = k => (k === 'koin' ? S.coins : State.count(k));
  const nameOf = k => (k === 'koin' ? 'koin' : items[k].name);
  const iconOf = k => (k === 'koin' ? `<img class="icon" src="${MQ.Sprites.url('coin')}" alt="">` : UI.itemImg(k));

  /** Tempat mencari bahan: field yang monsternya menjatuhkan bahan itu. */
  function whereToFind(k) {
    if (k === 'koin') return 'dari monster mana saja';
    if (k === 'mahkota') return 'dari bos mana saja';
    if (items[k].from) return `di dungeon ${Data.dungeons.find(d => d.id === items[k].from).name} (menu 🏰 Dungeon)`;
    const fields = Data.fields.filter(f => f.mobs && [...f.mobs, f.boss].some(m => Data.monsters[m].drop === k));
    return fields.length ? 'di ' + fields.map(f => f.name).join(' atau ') : 'dari monster';
  }

  /** Kartu barang (dipakai Toko & Pandai Besi). right = HTML harga/resep. */
  const card = (id, right, btn, done) =>
    `<div class="panel shopItem">${UI.itemImg(id, 'iconBig')}<div class="sBody"><b>${items[id].name}</b><small>${items[id].desc}</small>${right}</div>` +
    `<button class="sBtn" data-id="${id}" ${done ? 'disabled' : ''}>${done ? 'Sudah punya' : btn}</button></div>`;

  /* ===== Toko ===== */
  UI.renderers.shop = () => {
    $('shopCoins').textContent = `🪙 ${S.coins} koin`;
    $('shopList').innerHTML = Data.shop.map(id => card(id, `<span class="price">🪙 ${items[id].price}</span>`, 'Beli',
      isGear(items[id]) && State.count(id) > 0)).join('');
  };
  $('shopList').addEventListener('click', e => {
    const b = e.target.closest('.sBtn');
    if (!b || b.disabled) return;
    const id = b.dataset.id, it = items[id], p = it.price, img = UI.itemImg(id, 'iconBig');
    if (S.coins < p) {
      return UI.overlay({img, title: 'Koin belum cukup', text: `Harga ${it.name} ${p} koin, koinmu ${S.coins}. Kalahkan monster untuk mengumpulkan koin!`});
    }
    // Soal pembayaran: kembalian (bayar dengan kelipatan 10) atau sisa koin
    const pay = Math.ceil((p + 1) / 10) * 10;
    const q = S.coins >= pay
      ? {ans: pay - p, text: `Harga ${p} koin. Kamu bayar ${pay} koin. Kembaliannya berapa?`}
      : {ans: S.coins - p, text: `Harga ${p} koin. Koinmu ${S.coins}. Sisa koinmu berapa?`};
    UI.quiz({img, title: `Beli ${it.name}`, text: q.text, speak: q.text, ans: q.ans, onCorrect: () => {
      S.coins -= p; State.addItem(id); State.save();
      MQ.Audio.sfx.buy();
      UI.renderers.shop();
      UI.overlay({img, title: 'Berhasil dibeli!', text: `${it.name} masuk ke Tas.` + (isGear(it) ? ' Ketuk di Tas untuk memakainya.' : '')});
    }});
  });

  /* ===== Pandai Besi ===== */
  UI.renderers.smith = () => {
    $('smithCoins').textContent = `🪙 ${S.coins} koin`;
    document.querySelectorAll('.smithTabs [data-st]').forEach(b => b.classList.toggle('on', b.dataset.st === smithTab));
    $('smithList').hidden = smithTab !== 'make'; $('upList').hidden = smithTab !== 'up';
    $('smithNote').textContent = smithTab === 'make' ? 'Kumpulkan bahan dari monster, lalu buat senjata hebat!'
      : 'Tingkatkan perlengkapan sampai +5 dengan bahan khusus dungeon. Senjata: Kristal Pola, pelindung: Mutiara Laut, aksesori: Tinta Bintang.';
    if (smithTab === 'up') return renderUp();
    $('smithList').innerHTML = Data.smith.map(id => {
      const need = Object.entries(items[id].recipe).map(([k, n]) =>
        `<span class="need ${have(k) >= n ? 'ok' : ''}">${iconOf(k)}${Math.min(have(k), n)}/${n}</span>`).join('');
      return card(id, `<div class="needs">${need}</div>`, 'Buat', State.count(id) > 0);
    }).join('');
  };
  $('smithList').addEventListener('click', e => {
    const b = e.target.closest('.sBtn');
    if (!b || b.disabled) return;
    const id = b.dataset.id, it = items[id], img = UI.itemImg(id, 'iconBig');
    const recipe = Object.entries(it.recipe);
    const lack = recipe.find(([k, n]) => have(k) < n);
    if (lack) { // bahan kurang → soal "kurang berapa?"
      const [k, n] = lack, h = have(k), text = `Butuh ${n} ${nameOf(k)}. Kamu punya ${h}. Kurang berapa?`;
      return UI.quiz({img: iconOf(k).replace('class="icon"', 'class="iconBig"'), title: 'Bahan kurang', text, speak: text, ans: n - h,
        onCorrect: () => UI.overlay({icon: '🧭', title: 'Betul!', text: `Kumpulkan ${n - h} ${nameOf(k)} lagi ${whereToFind(k)}.`})});
    }
    // Bahan cukup → soal "sisa berapa?" dari bahan utama, lalu barang dibuat
    const [k, n] = recipe.find(([key]) => key !== 'koin') || recipe[0], h = have(k);
    const text = `Kamu punya ${h} ${nameOf(k)}. Dipakai ${n}. Sisa berapa?`;
    UI.quiz({img, title: `Buat ${it.name}`, text, speak: text, ans: h - n, onCorrect: () => {
      recipe.forEach(([key, num]) => { if (key === 'koin') S.coins -= num; else State.removeItem(key, num); });
      State.addItem(id); S.crafted++; State.save();
      UI.renderers.smith();
      MQ.Audio.sfx.craft();
      UI.overlay({img, title: 'Berhasil dibuat!', text: `${it.name} siap. ${it.desc}`, btn: 'Pakai sekarang', btn2: 'Nanti',
        cb: () => { State.equip(id); State.save(); MQ.Audio.sfx.equip(); }});
    }});
  });

  /* ===== Pandai Besi: Tingkatkan (+1 sampai +5) =====
     Biaya & efek di balance.js "upgrade". Soal: nilai efek utama sekarang + tambahan = ? */
  let smithTab = 'make';
  document.querySelector('.smithTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-st]');
    if (!b) return;
    smithTab = b.dataset.st; MQ.Audio.sfx.click(); UI.renderers.smith();
  });
  const U = () => MQ.Balance.upgrade;
  /** Biaya naik ke tingkat L: {bahan: n, mahkota?: 1, koin: n}. */
  function upCost(id, L) {
    const c = {[U().mat[items[id].type]]: L};
    if (L >= U().crownFrom) c.mahkota = 1;
    c.koin = U().coins * L;
    return c;
  }
  /** Efek utama item (untuk soal & keterangan): [nama, nilai sekarang, tambahan per tingkat, satuan]. */
  function mainStat(id) {
    const it = items[id], L = State.upLevel(id);
    if (it.type === 'senjata') return ['Serangan', (it.atk || 0) + State.upBonus(id, 'atk'), U().per.senjata.atk, ''];
    if (it.type === 'pelindung') return ['HP tambahan', (it.hp || 0) + State.upBonus(id, 'hp'), U().per.pelindung.hp, ''];
    return ['Peluang kritikal', (it.crit || 0) + Math.floor(U().per.aksesori.crit * L), U().per.aksesori.crit, '%'];
  }
  const UP_TEXT = {senjata: 'Serangan +1', pelindung: 'HP +3, Pertahanan +½', aksesori: 'Kritikal +2%, damage kritikal +5%'};
  function renderUp() {
    const owned = Object.keys(S.inv).filter(id => isGear(items[id]));
    $('upList').innerHTML = owned.length ? owned.map(id => {
      const L = State.upLevel(id), max = L >= U().max;
      const need = max ? '<small>Sudah tingkat tertinggi! ✨</small>' : `<div class="needs">${Object.entries(upCost(id, L + 1)).map(([k, n]) =>
        `<span class="need ${have(k) >= n ? 'ok' : ''}">${iconOf(k)}${Math.min(have(k), n)}/${n}</span>`).join('')}</div>`;
      return `<div class="panel shopItem">${UI.itemImg(id, 'iconBig')}<div class="sBody"><b>${items[id].name} <span class="upLv">${L ? '+' + L : ''}</span></b>` +
        `<small>${max ? 'Maks +5' : `+${L} → +${L + 1}: ${UP_TEXT[items[id].type]}`}</small>${need}</div>` +
        `<button class="sBtn" data-up="${id}" ${max ? 'disabled' : ''}>${max ? 'Maks' : 'Tingkatkan'}</button></div>`;
    }).join('') : '<p class="note">Belum punya perlengkapan. Beli di Toko atau buat di tab Buat dulu.</p>';
  }
  $('upList').addEventListener('click', e => {
    const b = e.target.closest('[data-up]');
    if (!b || b.disabled) return;
    const id = b.dataset.up, it = items[id], L = State.upLevel(id) + 1, img = UI.itemImg(id, 'iconBig');
    const cost = Object.entries(upCost(id, L)), lack = cost.find(([k, n]) => have(k) < n);
    if (lack) {
      const [k, n] = lack, h = have(k), text = `Butuh ${n} ${nameOf(k)}. Kamu punya ${h}. Kurang berapa?`;
      return UI.quiz({img: iconOf(k).replace('class="icon"', 'class="iconBig"'), title: 'Bahan kurang', text, speak: text, ans: n - h,
        onCorrect: () => UI.overlay({icon: '🧭', title: 'Betul!', text: `Kumpulkan ${n - h} ${nameOf(k)} lagi ${whereToFind(k)}.`})});
    }
    const [stat, val, plus, unit] = mainStat(id), text = `${stat} ${it.name} sekarang ${val}${unit}. Naik ${plus}. Jadi berapa?`;
    UI.quiz({img, title: `Tingkatkan ke +${L}`, text, speak: text, ans: val + plus, onCorrect: () => {
      cost.forEach(([k, n]) => { if (k === 'koin') S.coins -= n; else State.removeItem(k, n); });
      S.upgrades[id] = L; State.save();
      MQ.Audio.sfx.craft();
      UI.renderers.smith();
      UI.overlay({img, title: `${it.name} +${L}!`, text: `${stat} jadi ${val + plus}${unit}. ` + (State.isEquipped(id) ? 'Langsung terasa di pertarungan!' : 'Pakai dari Tas supaya terasa di pertarungan.')});
    }});
  });

  return {};
})();
