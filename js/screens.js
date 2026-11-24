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
  const TABS = ['home', 'char', 'bag', 'shop', 'smith', 'quests']; // layar yang memakai bilah tombol bawah
  function show(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 'scr-' + name));
    if (renderers[name]) renderers[name]();
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
    $('homeInfo').textContent = `LV ${S.level} · ${S.grade > 1 ? 'Lulus Kelas 1' : 'Kelas 1'}`;
    $('homeCoins').textContent = `🪙 ${S.coins}`;
  };

  /* ===== Peta ===== */
  const places = () => [...Data.fields, ...Data.dungeons, Data.arena];
  function status(p) {
    if (p.soon) return ['soon', 'Segera'];
    if (!State.unlocked(p)) return ['lock', '🔒'];
    if (S.cleared.includes(p.id)) return ['done', 'Selesai ✓'];
    return ['open', 'Main!'];
  }
  renderers.map = () => {
    // Data berasal dari data.js (teks milik sendiri, bukan masukan pengguna) → aman dirangkai jadi HTML
    const node = p => {
      const [cls, label] = status(p);
      const lv = p.lv ? ` · Lv ${p.lv[0]}–${p.lv[1]}` : '';
      return `<button class="node ${cls}" data-place="${p.id}"><span class="nIcon">${p.icon}</span>` +
             `<span class="nBody"><b>${p.name}</b><small>${p.desc}${lv}</small></span><span class="chip">${label}</span></button>`;
    };
    $('mapList').innerHTML =
      '<h3 class="sec">Kelas 1 · Lembah Hijau</h3><div class="path">' + Data.fields.map(node).join('') + '</div>' +
      '<h3 class="sec">Dungeon</h3>' + Data.dungeons.map(node).join('') +
      '<h3 class="sec">Latihan</h3>' + node(Data.arena);
  };
  $('mapList').addEventListener('click', e => {
    const b = e.target.closest('.node');
    if (!b) return;
    const p = places().find(x => x.id === b.dataset.place);
    if (p.soon) return overlay({icon: '🚧', title: p.name, text: 'Tempat ini sedang dibangun. Segera hadir!'});
    if (!State.unlocked(p)) {
      if (p.reqAll) {
        const all = State.mainFields(), done = all.filter(f => S.cleared.includes(f.id)).length;
        return overlay({icon: '🔒', title: 'Masih Terkunci', text: `Selesaikan semua area Kelas 1 dulu (${done} dari ${all.length} selesai), lalu ikuti Ujian Naik Kelas!`});
      }
      const req = Data.fields.find(x => x.id === p.req);
      return overlay({icon: '🔒', title: 'Masih Terkunci', text: `Kalahkan bos di ${req.name} dulu untuk membuka ${p.name}.`});
    }
    if (p.exam) {
      return overlay({icon: '📝', title: 'Ujian Naik Kelas', btn: 'Mulai Ujian', btn2: 'Nanti', cb: () => MQ.Battle.start(p),
        text: `12 soal dari semua area. Musuh tidak menyerang, jawab dengan tenang. Lulus jika benar minimal 9. Nilai terbaikmu: ${S.examBest}.`});
    }
    if (p.dungeon) {
      return overlay({icon: '🕳️', title: p.name, btn: 'Masuk', btn2: 'Nanti', cb: () => MQ.Battle.start(p),
        text: `${p.rooms} ruang beruntun. HP TIDAK pulih di dalam gua, bawa Ramuan Penyembuh! Kalahkan bos di ruang terakhir untuk membuka peti harta.`});
    }
    MQ.Battle.start(p);
  });

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
      ['⚔️ Serangan', `${lo}–${hi}`],
      ['🛡️ Pertahanan', State.def()],
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
      `<div class="alloc"><span><b>${label}</b><small>${effect} · sudah ${S.alloc[k]} poin</small></span>` +
      `<button class="plus" data-stat="${k}" ${S.points ? '' : 'disabled'} aria-label="Tambah ${label}">+</button></div>`).join('');
    const skills = Object.entries(S.stats).filter(([, s]) => s.b + s.s > 0);
    $('charSkills').innerHTML = skills.length
      ? skills.map(([op, s]) => `<div class="skill"><span>${OP_NAMES[op] || op}</span><div class="bar"><div style="width:${pct(s)}%"></div><span>${pct(s)}% benar</span></div></div>`).join('')
      : '<p class="note">Ayo bertarung dulu!</p>';
    // Slot perlengkapan: ketuk untuk melihat / melepas
    $('charEquip').innerHTML = SLOTS.map(([slot, label]) => {
      const id = S.equip[slot];
      return `<button class="slot${id ? ' full' : ''}" data-slot="${slot}">${id ? itemImg(id) + `<small>${Data.items[id].name}</small>` : `<span>${label}</span>`}</button>`;
    }).join('');
  };
  const SLOTS = [['senjata', 'Senjata'], ['pelindung', 'Pelindung'], ['aksesori', 'Aksesori']];
  const ALLOC = [['hp', '❤️ HP', '+10 HP maks'], ['atk', '⚔️ Serangan', '+2 damage'], ['def', '🛡️ Pertahanan', '-1 damage musuh']];
  $('charAlloc').addEventListener('click', e => {
    const b = e.target.closest('.plus');
    if (b && State.spendPoint(b.dataset.stat)) { State.save(); MQ.Audio.sfx.correct(); renderers.char(); }
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
    const base = {img: itemImg(id, 'iconBig'), title: it.name, text: `${TYPE_NAMES[it.type]} · ${it.desc}` + (it.type === 'bahan' ? ` Kamu punya ${State.count(id)}.` : '')};
    if (!gearType) return overlay(base);
    const on = State.isEquipped(id);
    overlay(Object.assign(base, {
      btn: on ? 'Lepas' : 'Pakai', btn2: 'Tutup',
      cb: () => { on ? State.unequip(it.type) : State.equip(id); State.save(); MQ.Audio.sfx.correct(); after(); }
    }));
  }

  /* ===== Mulai ===== */
  function init() {
    Sprites.drawField($('homeScene'));
    document.querySelectorAll('#tabbar [data-icon]').forEach(img => (img.src = Sprites.url(img.dataset.icon)));
    $('btnEditLook').addEventListener('click', () => MQ.Create.open('char'));
    document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) show(b.dataset.go); });
    document.addEventListener('pointerdown', MQ.Audio.unlock, {passive: true}); // suara butuh interaksi pertama
  }

  return {show, overlay, quiz, fillXp, init, itemImg, itemDetail, renderers};
})();
