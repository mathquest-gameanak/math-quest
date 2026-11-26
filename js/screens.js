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
    // menu: lagu ceria; Peta Petualangan: mars bersemangat; pertarungan diatur battle.js
    if (name !== 'battle') MQ.Audio.music.play(name === 'map' ? 'map' : 'home');
    const tabbed = TABS.includes(name);
    $('tabbar').hidden = !tabbed;
    document.body.classList.toggle('hasTabs', tabbed);
    if (tabbed) updateTabs(name);
    window.scrollTo(0, 0);
  }
  /** Bilah tombol bawah: tombol aktif, gambar pahlawan, dan tanda angka (misi & poin status). */
  function updateTabs(active) {
    document.querySelectorAll('#tabbar [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === active));
    const n = MQ.Quests.claimable();
    $('questBadge').hidden = !n; $('questBadge').textContent = n;
    $('charBadge').hidden = !S.points; $('charBadge').textContent = S.points;
  }

  /** Gambar ikon item sebagai <img> (data dari data.js). */
  // ikon item: gambar baru (itemart.js) bila ada, selain itu ikon lama
  const itemSrc = id => (MQ.ItemArt && MQ.ItemArt.url(id)) || Sprites.url(Data.items[id].icon, Data.items[id].pal);
  const itemImg = (id, cls = 'icon') => `<img class="${cls}" src="${itemSrc(id)}" alt="">`;

  /* ===== Jendela pesan =====
     overlay({icon | img, title, text, btn, cb, btn2, cb2})  — 1 atau 2 tombol
     quiz({icon | img, title, text, speak, ans, onCorrect})  — soal pilihan ganda; salah → tombol itu mati, coba lagi */
  let cb1 = null, cb2 = null, fxTimers = [];
  /* Perayaan (o.fx): 'medal' = medali berputar masuk, 'level' = angka level naik, 'chest' = peti bergetar lalu terbuka.
     o.sub = label kecil di atas judul, o.chips = [{img | icon, text}] hadiah (muncul satu per satu). */
  function confetti(n = 28) {
    const cols = ['#ffcd75', '#e43b44', '#73eff7', '#a7f070', '#f4a3c8', '#b06fd0'];
    $('confetti').innerHTML = Array.from({length: n}, (_, i) =>
      `<i style="left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-delay:${(Math.random() * 0.8).toFixed(2)}s;` +
      `animation-duration:${(1.6 + Math.random() * 1.4).toFixed(2)}s;--r:${Math.round(Math.random() * 720 - 360)}deg;--x:${Math.round(Math.random() * 80 - 40)}px"></i>`).join('');
  }
  function celebrate(o) {
    const card = document.querySelector('#overlay .card'), icon = $('ovIcon');
    card.className = 'card panel' + (o.fx ? ' fx fx-' + o.fx : '');
    fxTimers.forEach(clearTimeout); fxTimers = [];
    $('confetti').innerHTML = '';
    const chips = $('ovChips');
    chips.hidden = !(o.chips && o.chips.length);
    chips.innerHTML = (o.chips || []).map((c, i) => `<span class="ovChip" style="animation-delay:${(o.fx === 'chest' ? 1.0 : 0.5) + i * 0.18}s">` +
      `${c.img ? `<img src="${c.img}" alt="">` : `<b>${c.icon || ''}</b>`}${c.text}</span>`).join('');
    $('ovSub').hidden = !o.sub; $('ovSub').textContent = o.sub || '';
    if (!o.fx) return;
    if (o.fx === 'medal') {
      icon.innerHTML = `<div class="bigFx"><span class="rays"></span><span class="medalDisc"><i class="tail l"></i><i class="tail r"></i><b>${o.icon}</b></span></div>`;
      confetti();
    } else if (o.fx === 'level') {
      icon.innerHTML = `<div class="bigFx"><span class="rays"></span><img class="lvHero" src="${MQ.Hero.url(S.hero, S.equip, 'happy')}" alt="">` +
        `<b class="lvNum">Lv <span id="ovLvNum">${o.from || o.level}</span></b></div>`;
      confetti(20);
      fxTimers.push(setTimeout(() => { const n = $('ovLvNum'); if (n) { n.textContent = o.level; n.classList.add('bump'); } }, 650));
    } else if (o.fx === 'chest') {
      icon.innerHTML = `<div class="bigFx"><span class="rays"></span><img id="ovChest" class="chestImg shake" src="${MQ.Pix.url('peti', 5)}" alt=""></div>`;
      fxTimers.push(setTimeout(() => {
        const c = $('ovChest'); if (!c) return;
        c.src = MQ.Pix.url('petiBuka', 5); c.classList.remove('shake'); c.classList.add('opened');
        card.classList.add('open'); confetti(24); MQ.Audio.sfx.coin();
      }, 850));
    }
  }
  function overlay(o) {
    if (o.img) $('ovIcon').innerHTML = o.img; else $('ovIcon').textContent = o.icon || '';
    $('ovTitle').textContent = o.title; $('ovText').textContent = o.text || '';
    $('ovText').hidden = !o.text;
    $('ovTitle').classList.toggle('long', (o.title || '').length > 12);
    $('ovTitle').style.fontSize = (o.title || '').length > 20 ? '15px' : '';
    celebrate(o);
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
    $('overlay').hidden = true; cb1 = cb2 = null; fxTimers.forEach(clearTimeout); fxTimers = []; $('confetti').innerHTML = '';
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
    $('homeHero').src = hero; // logo di kiri atas & bilah bawah = ikon helm tetap (ui_hero), bukan penampilan pahlawan
    $('homeName').textContent = (S.hero && S.hero.name) || 'Pahlawan'; // nama dari pemain → textContent
    $('homeInfo').textContent = `LV ${S.level} · 💎 ${State.shards()}/6`;
    $('homeCoins').textContent = `🪙 ${S.coins}`;
    $('musicIco').src = MQ.ItemArt.url(S.settings.music > 0 ? 'ui_music' : 'ui_mute', 3);
    // tombol Petualangan: potret bos tujuan berikutnya
    if (MQ.WorldMap && MQ.WorldMap.nextGoal) {
      const g = MQ.WorldMap.nextGoal(), p = g.place;
      $('advBoss').src = p.boss && MQ.Pix.has(p.boss) ? MQ.Pix.url(p.boss, 3) : MQ.ItemArt.url('ui_dungeon', 3);
      $('advNext').textContent = g.done ? `Semua area ${g.mode} selesai! Main lagi?` : `Lanjut: ${p.icon} ${p.name} ${'⭐'.repeat(g.stars)}`;
    }
    if (MQ.HomeScene) MQ.HomeScene.start(); // latar desa bergerak
    if (!MQ.Cutscene.isOpen()) MQ.Collection.check(); // medali yang terpenuhi di luar pertarungan (mis. Pandai Besi)
  };

  /* Peta petualangan: lihat js/map.js */

  /* ===== Karakter ===== */
  const OP_NAMES = MQ.Questions.NAMES;
  /* Halaman Karakter ala RPG (2026-11-26): kartu pahlawan dengan slot perlengkapan di sekelilingnya,
     tiga lencana status (HP, Serangan, Pertahanan) dengan tombol +, lalu tab Status / Kemampuan / Catatan. */
  let charTab = 'status';
  const SLOT_ICON = {senjata: 'pedangKayu', pelindung: 'perisaiKayu', aksesori: 'cincinBintang'};
  renderers.char = () => {
    $('charLv').textContent = `Lv ${S.level}`;
    $('charName').textContent = (S.hero && S.hero.name) || 'Pahlawan';
    fillXp($('charXpFill'), $('charXpText'));
    const tot = Object.values(S.stats).reduce((a, s) => ({b: a.b + s.b, s: a.s + s.s}), {b: 0, s: 0});
    const pct = s => (s.b + s.s ? Math.round(s.b / (s.b + s.s) * 100) : 0);
    const [lo, hi] = State.atk();
    // kartu pahlawan + slot perlengkapan (aksesori di atas, senjata kiri, pelindung kanan)
    $('charEquip').innerHTML = `<span class="charRays"></span><img id="charHero" src="${MQ.Hero.current()}" alt="Pahlawan">` +
      SLOTS.map(([slot, label]) => {
        const id = S.equip[slot], up = id ? State.upLevel(id) : 0;
        return `<button class="eqSlot ${slot}${id ? ' full' : ''}" data-slot="${slot}">` +
          (id ? `${itemImg(id)}${up ? `<i class="eqUp">+${up}</i>` : ''}` : `<img class="icon ghost" src="${MQ.ItemArt.url(SLOT_ICON[slot], 2)}" alt="">`) +
          `<small>${id ? items(id).name : label}</small></button>`;
      }).join('');
    // tiga lencana status
    const val = {hp: State.maxHp(), atk: lo === hi ? lo : `${lo}–${hi}`, def: State.def()};
    $('charPoints').hidden = !S.points;
    $('charPoints').textContent = `✨ ${S.points} poin status! Ketuk + untuk membagi`;
    $('charAlloc').innerHTML = ALLOC.map(([k, label, effect]) =>
      `<div class="sBadge ${k}"><span class="sbIco">${label.split(' ')[0]}</span><b>${val[k]}</b><small>${label.split(' ').slice(1).join(' ')}</small>` +
      `<em>${effect()}</em>${S.points ? `<button class="plus" data-stat="${k}" aria-label="Tambah ${label}">+</button>` : ''}</div>`).join('');
    // tab
    document.querySelectorAll('.charTabs [data-ct]').forEach(b => b.classList.toggle('on', b.dataset.ct === charTab));
    const statusRows = [
      ['🎯 Peluang kritikal', `${State.critChance()}%`],
      ['💥 Damage kritikal', `×${Math.round(State.critMul() * 10) / 10}`],
      [`⚡ Jawab ≤${MQ.Balance.combat.fastCritSec} detik`, 'pasti KILAT!'],
      ['🧠 Soal pikir benar', `TELITI! ×${MQ.Balance.think.telitiMul}`],
      ['🪙 Koin tambahan', State.effect('coins') ? `+${State.effect('coins')} / monster` : '–'],
      ['✨ XP tambahan', State.effect('xp') ? `+${State.effect('xp')}%` : '–'],
      ['📦 Poin dibagi', `❤️ ${S.alloc.hp} · ⚔️ ${S.alloc.atk} · 🛡️ ${S.alloc.def}`]
    ];
    const logRows = [
      ['🎓 Kelas', S.grade > 1 ? 'Lulus Kelas 1!' : 'Kelas 1'],
      ['📝 Nilai ujian terbaik', S.examBest ? `${S.examBest} / 12` : '–'],
      ['🏆 Area selesai', `${State.mainFields().filter(f => S.cleared.includes(f.id)).length} / ${State.mainFields().length}`],
      ['👾 Monster dikalahkan', S.monsters],
      ['🔥 Kombo terbaik', S.bestCombo],
      ['✅ Soal benar', tot.b],
      ['🎯 Ketepatan', tot.b + tot.s ? pct(tot) + '%' : '–']
    ];
    const rows = charTab === 'log' ? logRows : statusRows;
    $('charStats').hidden = charTab === 'skill'; $('charSkills').hidden = charTab !== 'skill';
    $('charStats').innerHTML = rows.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
    const skills = Object.entries(S.stats).filter(([, s]) => s.b + s.s > 0).sort((a, b) => pct(a[1]) - pct(b[1])); // yang perlu dilatih di atas
    const col = p => (p >= 90 ? '#38b764' : p >= 75 ? '#ffcd75' : '#ef7d57');
    $('charSkills').innerHTML = skills.length
      ? skills.map(([op, s]) => `<div class="skill"><span>${OP_NAMES[op] || op}</span><div class="bar"><div style="width:${pct(s)}%;background:${col(pct(s))}"></div>` +
                                 `<span>${pct(s)}%</span></div></div>`).join('') + '<p class="note">Yang paling atas paling perlu dilatih. Coba di 🎓 Kelas!</p>'
      : '<p class="note">Ayo bertarung dulu!</p>';
  };
  const items = id => Data.items[id];
  document.querySelector('.charTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-ct]');
    if (!b) return;
    charTab = b.dataset.ct; MQ.Audio.sfx.click(); renderers.char();
  });
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
    const b = e.target.closest('.eqSlot');
    if (!b) return;
    const id = S.equip[b.dataset.slot];
    if (id) itemDetail(id, () => show('char'));
    else overlay({img: `<img class="iconBig" src="${MQ.ItemArt.url(SLOT_ICON[b.dataset.slot], 4)}" alt="">`, title: 'Slot kosong',
                  text: 'Beli perlengkapan di Toko atau buat di Pandai Besi, lalu pakai dari Tas.'});
  });

  /* ===== Tas ===== */
  const TYPE_ORDER = ['senjata', 'pelindung', 'aksesori', 'ramuan', 'bahan'];
  const TYPE_NAMES = {senjata: 'Senjata', pelindung: 'Pelindung', aksesori: 'Aksesori', ramuan: 'Ramuan', bahan: 'Bahan'};
  /* Bilah filter kategori (Tas, Toko, Pandai Besi): hanya kategori yang ada di layar itu; pilihan diingat per layar. */
  const FILTERS = [['semua', 'Semua', null], ['senjata', 'Senjata', 'pedangKayu'], ['pelindung', 'Pelindung', 'perisaiKayu'],
                   ['aksesori', 'Aksesori', 'cincinBintang'], ['ramuan', 'Ramuan', 'ramuan'], ['bahan', 'Bahan', 'lendir']];
  const filt = {};
  /** Gambar bilah filter di el untuk daftar ids; onChange() = gambar ulang layar. Mengembalikan fungsi saring(id). */
  function filterBar(el, key, ids, onChange) {
    const types = new Set(ids.map(id => Data.items[id].type));
    const opts = FILTERS.filter(([k]) => k === 'semua' || types.has(k));
    if (!opts.some(([k]) => k === filt[key])) filt[key] = 'semua';
    el.hidden = opts.length <= 2; // satu kategori saja: tidak perlu filter
    el.innerHTML = opts.map(([k, n, ico]) => `<button class="fBtn${filt[key] === k ? ' on' : ''}" data-f="${k}">` +
      `${ico ? `<img src="${MQ.ItemArt.url(ico, 2)}" alt="">` : '<b>✦</b>'}<span>${n}</span></button>`).join('');
    el.onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; filt[key] = b.dataset.f; MQ.Audio.sfx.click(); onChange(); };
    return id => filt[key] === 'semua' || Data.items[id].type === filt[key];
  }
  renderers.bag = () => {
    $('bagCoins').textContent = `🪙 ${S.coins} koin`;
    const all = Object.keys(S.inv), keep = filterBar($('bagFilter'), 'bag', all, renderers.bag);
    const ids = all.filter(keep).sort((a, b) => TYPE_ORDER.indexOf(Data.items[a].type) - TYPE_ORDER.indexOf(Data.items[b].type));
    const cells = ids.map(id => `<button class="slot full" data-item="${id}">${itemImg(id)}` +
      `<b class="qty">${S.inv[id]}</b>${State.isEquipped(id) ? '<b class="eq">E</b>' : ''}</button>`);
    while (cells.length < (filt.bag === 'semua' ? 16 : 8) || cells.length % 4) cells.push('<div class="slot"></div>');
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
    // ikon menu 24×24 (itemart.js): bilah bawah, tombol samping beranda, logo pahlawan, tombol orang tua
    document.querySelectorAll('img[data-ui]').forEach(img => (img.src = MQ.ItemArt.url(img.dataset.ui, 3)));
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

  return {show, overlay, quiz, fillXp, init, itemImg, itemDetail, renderers, filterBar};
})();
