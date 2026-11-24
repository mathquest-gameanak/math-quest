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

  return {};
})();
