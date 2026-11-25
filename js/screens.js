/* Math Quest — perpindahan layar, jendela pesan, dan layar Utama / Peta / Karakter / Tas.
   Layar pertarungan ada di battle.js; Toko & Pandai Besi di shop.js. */
'use strict';
window.MQ = window.MQ || {};

MQ.UI = (() => {
  const {Sprites, Data, State} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);

  /* ===== Pindah layar: tiap <section class="screen" id="scr-NAMA"> ===== */
  const renderers = {};
  const TABS = ['bag', 'char', 'home', 'dungeon', 'shop']; // layar yang memakai bilah tombol bawah
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 'scr-' + name));
    if (renderers[name]) renderers[name]();
    if (name !== 'battle') MQ.Audio.music.play('home'); // menu & peta: lagu ceria; pertarungan diatur battle.js
    const tabbed = TABS.includes(name);
    $('tabbar').hidden = !tabbed;
    document.body.classList.toggle('hasTabs', tabbed);
    if (tabbed) updateTabs(name);
    window.scrollTo(0, 0);
  }
  /** Bilah tombol bawah: tombol aktif, gambar pahlawan, dan tanda angka (misi & poin status). */
  function updateTabs(active) {
    document.querySelectorAll('#tabbar [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === active));
    $('tabHero').src = MQ.Hero.current();
    const n = MQ.Quests.claimable();
    $('questBadge').hidden = !n; $('questBadge').textContent = n;
    $('charBadge').hidden = !S.points; $('charBadge').textContent = S.points;
  }

  /** Gambar ikon item sebagai <img> (data dari data.js). */
  const itemImg = (id, cls = 'icon') => { const it = Data.items[id]; return `<img class="${cls}" src="${Sprites.url(it.icon, it.pal)}" alt="">`; };

  /* ===== Jendela pesan =====
     overlay({icon | img, title, text, btn, cb, btn2, cb2})  — 1 atau 2 tombol
     quiz({icon | img, title, text, speak, ans, onCorrect})  — soal pilihan ganda; salah → tombol itu mati, coba lagi */
  let cb1 = null, cb2 = null;
  function overlay(o) {
    if (o.img) $('ovIcon').innerHTML = o.img; else $('ovIcon').textContent = o.icon || '';
    $('ovTitle').textContent = o.title; $('ovText').textContent = o.text;
    $('ovChoices').innerHTML = ''; $('ovChoices').hidden = true;
    $('ovBtn').textContent = o.btn || 'Oke'; cb1 = o.cb || null;
    $('ovBtn2').hidden = !o.btn2; $('ovBtn2').textContent = o.btn2 || ''; cb2 = o.cb2 || null;
    $('overlay').hidden = false;
  }
  function quiz(o) {
    overlay(Object.assign({}, o, {btn: 'Batal', cb: null, btn2: null}));
    const box = $('ovChoices');
    box.hidden = false;
    MQ.Questions.nearChoices(o.ans).forEach(c => {
      const b = document.createElement('button');
      b.className = 'ans'; b.textContent = c.v;
      b.addEventListener('click', () => {
        if (c.v === String(o.ans)) { MQ.Audio.sfx.correct(); closeOverlay(o.onCorrect); }
        else { MQ.Audio.sfx.wrong(); b.disabled = true; b.classList.add('salah'); } // tidak dihukum: coba lagi
      });
      box.appendChild(b);
    });
    if (o.speak) MQ.Audio.speak(o.speak);
  }
  function closeOverlay(cb) { // tutup dulu, baru jalankan callback (callback boleh membuka pesan baru)
    $('overlay').hidden = true; cb1 = cb2 = null;
    if (cb) cb();
  }
  $('ovBtn').addEventListener('click', () => closeOverlay(cb1));
  $('ovBtn2').addEventListener('click', () => closeOverlay(cb2));

  /** Isi bar XP (dipakai di pertarungan & karakter). */
  function fillXp(fill, text) {
    const need = State.xpNeed(S.level);
    fill.style.width = Math.min(100, S.xp / need * 100) + '%';
    text.textContent = `XP ${S.xp} / ${need}`;
  }

  /* ===== Layar Utama ===== */
  renderers.home = () => {
    const hero = MQ.Hero.current();
    $('homeHero').src = hero; $('homeAvatar').src = hero;
    $('homeName').textContent = (S.hero && S.hero.name) || 'Pahlawan'; // nama dari pemain → textContent
    $('homeInfo').textContent = `LV ${S.level} · 💎 ${State.shards()}/6`;
    $('homeCoins').textContent = `🪙 ${S.coins}`;
    $('btnMusic').textContent = S.settings.music > 0 ? '🎵' : '🔇';
    if (MQ.HomeScene) MQ.HomeScene.start(); // latar desa bergerak
    if (!MQ.Cutscene.isOpen()) MQ.Collection.check(); // medali yang terpenuhi di luar pertarungan (mis. Pandai Besi)
  };

  /* Peta petualangan: lihat js/map.js */

  /* ===== Karakter ===== */
  const OP_NAMES = MQ.Questions.NAMES;
  renderers.char = () => {
    $('charLv').textContent = `Level ${S.level}`;
    $('charName').textContent = (S.hero && S.hero.name) || 'Pahlawan';
    $('charHero').src = MQ.Hero.current(); // ikut berubah sesuai equipment
    fillXp($('charXpFill'), $('charXpText'));
    const tot = Object.values(S.stats).reduce((a, s) => ({b: a.b + s.b, s: a.s + s.s}), {b: 0, s: 0});
    const pct = s => (s.b + s.s ? Math.round(s.b / (s.b + s.s) * 100) : 0);
    const [lo, hi] = State.atk();
    const rows = [
      ['🎓 Kelas', S.grade > 1 ? 'Lulus Kelas 1!' : 'Kelas 1'],
      ['📝 Nilai ujian terbaik', S.examBest ? `${S.examBest} / 12` : '–'],
      ['❤️ HP maks', State.maxHp()],
      ['⚔️ Serangan', lo === hi ? lo : `${lo}–${hi}`],
      ['🛡️ Pertahanan', State.def()],
      ['🎯 Peluang kritikal', `${State.critChance()}%`],
      ['💥 Damage kritikal', `×${Math.round(State.critMul() * 10) / 10}`],
      [`⚡ Soal cepat ≤${MQ.Balance.combat.fastCritSec} detik`, 'pasti kritikal'],
      ['🧠 Soal pikir benar', `TELITI! ×${MQ.Balance.think.telitiMul}`],
      ['👾 Monster dikalahkan', S.monsters],
      ['🏆 Area selesai', `${State.mainFields().filter(f => S.cleared.includes(f.id)).length} / ${State.mainFields().length}`],
      ['🔥 Kombo terbaik', S.bestCombo],
      ['✅ Soal benar', tot.b],
      ['🎯 Ketepatan', tot.b + tot.s ? pct(tot) + '%' : '–']
    ];
    $('charStats').innerHTML = rows.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
    // Bagi poin status: tiap baris punya tombol "+"
    $('charPoints').textContent = S.points ? `Poin tersisa: ${S.points}` : 'Naik level untuk dapat poin';
    $('charAlloc').innerHTML = ALLOC.map(([k, label, effect]) =>
      `<div class="alloc"><span><b>${label}</b><small>${effect()} · sudah ${S.alloc[k]} poin</small></span>` +
      `<button class="plus" data-stat="${k}" ${S.points ? '' : 'disabled'} aria-label="Tambah ${label}">+</button></div>`).join('');
    const skills = Object.entries(S.stats).filter(([, s]) => s.b + s.s > 0);
    $('charSkills').innerHTML = skills.length
      ? skills.map(([op, s]) => `<div class="skill"><span>${OP_NAMES[op] || op}</span><div class="bar"><div style="width:${pct(s)}%"></div><span>${pct(s)}% benar</span></div></div>`).join('')
      : '<p class="note">Ayo bertarung dulu!</p>';
    // Slot perlengkapan: ketuk untuk melihat / melepas
    $('charEquip').innerHTML = SLOTS.map(([slot, label]) => {
      const id = S.equip[slot];
      return `<button class="slot${id ? ' full' : ''}" data-slot="${slot}">${id ? itemImg(id) + `<small>${State.itemName(id)}</small>` : `<span>${label}</span>`}</button>`;
    }).join('');
  };
  const SLOTS = [['senjata', 'Senjata'], ['pelindung', 'Pelindung'], ['aksesori', 'Aksesori']];
  // Keterangan efek tiap poin mengikuti balance.js (juga bila diubah di Atur Angka)
  const P = () => MQ.Balance.player;
  const ALLOC = [['hp', '❤️ HP', () => `+${P().hpPerPoint} HP maks`], ['atk', '⚔️ Serangan', () => `+${P().atkPerPoint} damage`],
                 ['def', '🛡️ Pertahanan', () => (P().defPerPoint >= 1 ? `-${P().defPerPoint} damage musuh` : `-1 damage musuh tiap ${Math.round(1 / P().defPerPoint)} poin`)]];
  $('charAlloc').addEventListener('click', e => {
    const b = e.target.closest('.plus');
    if (b && State.spendPoint(b.dataset.stat)) { State.save(); MQ.Audio.sfx.confirm(); renderers.char(); }
  });
  $('charEquip').addEventListener('click', e => {
    const b = e.target.closest('.slot');
    if (!b) return;
    const id = S.equip[b.dataset.slot];
    if (id) itemDetail(id, () => show('char'));
    else overlay({icon: '🎒', title: 'Slot kosong', text: 'Beli perlengkapan di Toko atau buat di Pandai Besi, lalu pakai dari Tas.'});
  });

  /* ===== Tas ===== */
  const TYPE_ORDER = ['senjata', 'pelindung', 'aksesori', 'ramuan', 'bahan'];
  const TYPE_NAMES = {senjata: 'Senjata', pelindung: 'Pelindung', aksesori: 'Aksesori', ramuan: 'Ramuan', bahan: 'Bahan'};
  renderers.bag = () => {
    $('bagCoins').textContent = `🪙 ${S.coins} koin`;
    const ids = Object.keys(S.inv).sort((a, b) => TYPE_ORDER.indexOf(Data.items[a].type) - TYPE_ORDER.indexOf(Data.items[b].type));
    const cells = ids.map(id => `<button class="slot full" data-item="${id}">${itemImg(id)}` +
      `<b class="qty">${S.inv[id]}</b>${State.isEquipped(id) ? '<b class="eq">E</b>' : ''}</button>`);
    while (cells.length < 16 || cells.length % 4) cells.push('<div class="slot"></div>');
    $('bagGrid').innerHTML = cells.join('');
    $('bagNote').textContent = ids.length ? 'Ketuk item untuk melihat atau memakainya.' : 'Tas masih kosong. Kalahkan monster untuk mendapat koin & bahan!';
  };
  $('bagGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-item]');
    if (b) itemDetail(b.dataset.item, () => show('bag'));
  });

  /** Keterangan item + tombol Pakai/Lepas untuk perlengkapan. after() = gambar ulang layar asal. */
  function itemDetail(id, after) {
    const it = Data.items[id], gearType = ['senjata', 'pelindung', 'aksesori'].includes(it.type);
    const base = {img: itemImg(id, 'iconBig'), title: State.itemName(id), text: `${TYPE_NAMES[it.type]} · ${it.desc}` + (it.type === 'bahan' ? ` Kamu punya ${State.count(id)}.` : '')};
    if (!gearType) return overlay(base);
    const on = State.isEquipped(id);
    overlay(Object.assign(base, {
      btn: on ? 'Lepas' : 'Pakai', btn2: 'Tutup',
      cb: () => { on ? State.unequip(it.type) : State.equip(id); State.save(); MQ.Audio.sfx.equip(); after(); }
    }));
  }

  /* ===== Mulai ===== */
  function init() {
    document.querySelectorAll('#tabbar [data-icon]').forEach(img => (img.src = Sprites.url(img.dataset.icon)));
    $('btnEditLook').addEventListener('click', () => MQ.Create.open('char'));
    // Tombol 🎵 di Halaman Utama: musik nyala/mati cepat (volume terakhir diingat)
    let lastMusic = S.settings.music || 0.6;
    $('btnMusic').addEventListener('click', () => {
      if (S.settings.music > 0) { lastMusic = S.settings.music; S.settings.music = 0; } else S.settings.music = lastMusic;
      MQ.Audio.setVolumes(S.settings.music, S.settings.sfx);
      State.save(); renderers.home();
    });
    document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });
    document.addEventListener('pointerdown', MQ.Audio.unlock, {passive: true}); // suara butuh interaksi pertama
    // Bunyi "klik" pendek untuk tombol menu (tombol jawaban & beli punya bunyinya sendiri)
    document.addEventListener('click', e => {
      if (e.target.closest('.back')) return MQ.Audio.sfx.back();
      if (e.target.closest('[data-go="book"]')) return; // Buku Monster punya bunyi buka buku sendiri
      if (e.target.closest('.tabbar button, .adventure, .sBtn, .pick, .mapNode, #ovBtn2, .who, .parentBtn, .musicBtn, .sideBtn, .heroToggle')) MQ.Audio.sfx.click();
    });
  }

  return {show, overlay, quiz, fillXp, init, itemImg, itemDetail, renderers};
})();
