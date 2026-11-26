/* Math Quest — simpan & muat progress (localStorage).
   Semua akses dibungkus try/catch: di mode privat / data: URL, localStorage bisa melempar error.
   load() selalu mengembalikan objek lengkap & valid; data lama (v1) otomatis terbawa. */
'use strict';
window.MQ = window.MQ || {};

MQ.Save = (() => {
  const KEY = 'mathQuest.v1'; // nama kunci tetap; versi format ada di dalam data (field v)
  const VERSION = 12; // v12: + kelas (dunia kelas yang sedang dimainkan). v11: + Mode Legenda (storyMode), tingkat equipment. v10: + bintang dungeon, Mode Pahlawan.          // v1: level/xp/monsters/mode. v2: + area selesai, kill per field, statistik. v3: + koin, tas, equipment. v4: + kelas, ujian, misi harian. v5: + poin status (HP/ATK/DEF). v6: + catatan harian, pengaturan. v7: + penampilan pahlawan. v8: + cerita (adegan yang sudah ditonton). v9: + Buku Monster, medali, kostum
  const MODES = ['campur', 'tambah', 'kurang', 'kali', 'seribu'];
  const OPS = ['tambah', 'kurang', 'kali'];
  const num = (v, def, min) => (Number.isFinite(v) && v >= min ? Math.floor(v) : def);
  const vol01 = (v, def) => (Number.isFinite(v) && v >= 0 && v <= 1 ? v : def);
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

  function load() {
    let d = {};
    try { d = obj(JSON.parse(localStorage.getItem(KEY))); } catch (e) { d = {}; }
    const kills = {};
    for (const [k, v] of Object.entries(obj(d.fieldKills))) kills[k] = num(v, 0, 0);
    const stats = {}; // statistik per jenis soal; jenis dasar selalu ada, jenis lain ikut tersimpan
    for (const k of new Set([...OPS, ...Object.keys(obj(d.stats))])) {
      const s = obj(obj(d.stats)[k]);
      stats[k] = {b: num(s.b, 0, 0), s: num(s.s, 0, 0)};
    }
    const items = (MQ.Data && MQ.Data.items) || {};
    const inv = {}; // hanya item yang dikenal, jumlah ≥ 1
    for (const [k, v] of Object.entries(obj(d.inv))) if (items[k] && num(v, 0, 0) > 0) inv[k] = num(v, 0, 0);
    const equip = {};
    for (const slot of ['senjata', 'pelindung', 'aksesori']) {
      const id = obj(d.equip)[slot];
      if (items[id] && items[id].type === slot && inv[id]) equip[slot] = id; // hanya yang dimiliki & cocok slotnya
    }
    const level = num(d.level, 1, 1);
    const alloc = {}; // poin status yang sudah dibagi
    for (const k of ['hp', 'atk', 'def']) alloc[k] = num(obj(d.alloc)[k], 0, 0);
    // Simpanan lama (sebelum v5) belum punya poin: berikan 3 poin untuk setiap level yang sudah dicapai
    const points = d.points === undefined ? (level - 1) * 3 : num(d.points, 0, 0);
    // Catatan harian untuk Laporan Orang Tua: {"YYYY-MM-DD": {t: detik main, b: benar, s: salah}}, simpan 30 hari terakhir
    const days = {};
    Object.keys(obj(d.days)).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-30).forEach(k => {
      const v = obj(d.days[k]);
      days[k] = {t: num(v.t, 0, 0), b: num(v.b, 0, 0), s: num(v.s, 0, 0)};
    });
    const st = obj(d.settings);
    const seen = {}; // adegan cerita yang sudah ditonton
    for (const [k, v] of Object.entries(obj(obj(d.story).seen))) if (v === true) seen[k] = true;
    const bestiary = {}; // Buku Monster: id monster → jumlah dikalahkan
    for (const [k, v] of Object.entries(obj(d.bestiary))) if (num(v, 0, 1) > 0) bestiary[k] = num(v, 0, 1);
    const medals = {};
    for (const [k, v] of Object.entries(obj(d.medals))) if (v === true) medals[k] = true;
    const dungeonStars = {}; // id dungeon → tingkat tertinggi yang sudah selesai (1–3)
    for (const [k, v] of Object.entries(obj(d.dungeonStars))) if (num(v, 0, 1) > 0) dungeonStars[k] = Math.min(3, num(v, 0, 1));
    // Simpanan lama: dungeon yang sudah ditaklukkan = ⭐ selesai
    for (const id of ['guaPola', 'kapalKaram', 'perpustakaan']) if (!dungeonStars[id] && Array.isArray(d.cleared) && d.cleared.includes(id)) dungeonStars[id] = 1;
    const strList = v => (Array.isArray(v) ? v.filter(x => typeof x === 'string') : []);
    return {
      dungeonStars, heroCleared: strList(d.heroCleared), legendCleared: strList(d.legendCleared), // area yang bosnya kalah di Pahlawan / Legenda
      // mode petualangan utama: 0 Normal, 1 Pahlawan, 2 Legenda (simpanan lama: heroMode true → 1)
      // istirahat setelah pingsan: {until: waktu (ms), kind: jenis pelajaran, max, learned}
      rest: d.rest && typeof d.rest === 'object' && Number.isFinite(d.rest.until) && typeof d.rest.kind === 'string'
        ? {until: Math.min(d.rest.until, Date.now() + 3600000), kind: d.rest.kind, max: num(d.rest.max, 10, 1), learned: d.rest.learned === true} : null,
      storyMode: [0, 1, 2].includes(d.storyMode) ? d.storyMode : d.heroMode === true ? 1 : 0,
      upgrades: Object.fromEntries(Object.entries(obj(d.upgrades)).filter(([k, v]) => items[k] && num(v, 0, 1) > 0).map(([k, v]) => [k, Math.min(10, num(v, 0, 1))])),
      bestiary, medals,
      costumes: Array.isArray(d.costumes) ? d.costumes.filter(x => typeof x === 'string') : [],
      outfits: Array.isArray(d.outfits) ? d.outfits.filter(x => typeof x === 'string') : [], // pakaian Toko Fashion
      allowance: typeof d.allowance === 'string' ? d.allowance : '',
      lessonsDone: num(d.lessonsDone, 0, 0),
      starTokens: num(d.starTokens, 0, 0),                                    // ⭐ Bintang Misi (dari misi harian)
      starBuys: Array.isArray(d.starBuys) ? d.starBuys.filter(x => typeof x === 'string') : [], // barang sekali-beli dari Tukar Bintang                                  // pelajaran Kelas yang diselesaikan (medali)        // tanggal terakhir uang saku dari orang tua
      allowancePending: num(d.allowancePending, 0, 0),                      // uang saku yang belum diumumkan ke anak
      kilat: num(d.kilat, 0, 0), crafted: num(d.crafted, 0, 0),
      story: {seen},
      hero: MQ.Hero ? MQ.Hero.sanitize(d.hero) : null, // penampilan pahlawan; null = belum dibuat → layar Buat Karakter
      days,
      settings: {santai: st.santai === true, autoSpeak: st.autoSpeak === true, // diatur di layar Orang Tua
                 music: vol01(st.music, 0.6), sfx: vol01(st.sfx, 0.8),       // volume 0..1
                 goal: [10, 15, 20, 30, 40].includes(st.goal) ? st.goal : 20, // target harian (soal benar)
                 limit: [0, 15, 20, 30, 45, 60, 90].includes(st.limit) ? st.limit : 0, // batas main per hari (menit), 0 = tanpa batas
                 bed: [-1, 19, 20, 21, 22].includes(st.bed) ? st.bed : -1},  // jam tidur (sampai jam 6), -1 = mati
      // Kalender stempel (daily.js): tanggal yang target hariannya tercapai, minggu yang hadiahnya sudah diambil
      stamps: Array.isArray(d.stamps) ? d.stamps.filter(k => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k)).slice(-120) : [],
      weekClaims: Array.isArray(d.weekClaims) ? d.weekClaims.filter(k => typeof k === 'string').slice(-20) : [],
      dayParty: typeof d.dayParty === 'string' ? d.dayParty : '',
      // Teman peliharaan (kiki.js): teman aktif, hari diberi makan per teman, latihan terakhir, kapan tiap jenis soal terakhir dilatih.
      // Simpanan lama {kiki: {days, last, seen}} → pets.own.kiki
      pets: (() => { const p = obj(d.pets), old = obj(d.kiki), seen = {}, own = {};
        for (const [a, b] of Object.entries(obj(p.seen || old.seen))) if (typeof b === 'string') seen[a] = b;
        for (const [a, b] of Object.entries(obj(p.own))) if (/^[a-z]+$/i.test(a)) own[a] = {days: num(obj(b).days, 0, 0)};
        if (!own.kiki) own.kiki = {days: num(old.days, 0, 0)};
        const last = typeof p.last === 'string' ? p.last : typeof old.last === 'string' ? old.last : '';
        return {active: typeof p.active === 'string' && own[p.active] ? p.active : 'kiki', own, last, seen}; })(),
      // Membangun Desa Bilangan (village.js): bata dari stempel harian & latihan teman, bangunan yang sudah berdiri
      village: (() => { const v = obj(d.village), start = d.village ? 0 : (Array.isArray(d.stamps) ? d.stamps.length : 0) + num(obj(obj(obj(d.pets).own).kiki).days || obj(d.kiki).days, 0, 0); // pertama kali: bata dari stempel & latihan sebelumnya
        return {bricks: d.village ? num(v.bricks, 0, 0) : start, built: Array.isArray(v.built) ? v.built.filter(x => typeof x === 'string') : []}; })(),
      extra: d.extra && typeof d.extra === 'object' && typeof d.extra.date === 'string' ? {date: d.extra.date, min: num(d.extra.min, 0, 0)} : null,
      alloc, points,
      grade: num(d.grade, 1, 1),         // kelas tertinggi yang terbuka (2 = lulus Kelas 1)
      kelas: Math.min(num(d.kelas, 1, 1), 6), // dunia kelas yang sedang dimainkan (peta/dungeon)
      examBest: num(d.examBest, 0, 0),   // jawaban benar terbanyak di ujian
      daily: d.daily && typeof d.daily === 'object' ? d.daily : null, // misi harian (divalidasi di quests.js)
      coins: num(d.coins, 0, 0),
      inv,
      equip,
      level,
      xp: num(d.xp, 0, 0),
      monsters: num(d.monsters, 0, 0),
      mode: MODES.includes(d.mode) ? d.mode : 'campur',
      cleared: Array.isArray(d.cleared) ? d.cleared.filter(x => typeof x === 'string') : [], // id field yang bosnya sudah kalah
      fieldKills: kills,                                                                      // jumlah monster dikalahkan per field
      bestCombo: num(d.bestCombo, 0, 0),
      stats                                                                                   // {op: {b: benar, s: salah}}
    };
  }

  /** Hanya 30 hari terakhir yang disimpan. */
  function pruneDays(days) {
    const out = {};
    Object.keys(days || {}).sort().slice(-30).forEach(k => (out[k] = days[k]));
    return out;
  }

  function save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, level: s.level, xp: s.xp, monsters: s.monsters, mode: s.mode,
        cleared: s.cleared, fieldKills: s.fieldKills, bestCombo: s.bestCombo, stats: s.stats,
        coins: s.coins, inv: s.inv, equip: s.equip, grade: s.grade, kelas: s.kelas, examBest: s.examBest, daily: s.daily,
        alloc: s.alloc, points: s.points, settings: s.settings, stamps: s.stamps, weekClaims: s.weekClaims, outfits: s.outfits, lessonsDone: s.lessonsDone, starTokens: s.starTokens, starBuys: s.starBuys, allowance: s.allowance, allowancePending: s.allowancePending, pets: s.pets, village: s.village, dayParty: s.dayParty, extra: s.extra, days: pruneDays(s.days), hero: s.hero, story: s.story,
        bestiary: s.bestiary, medals: s.medals, costumes: s.costumes, kilat: s.kilat, crafted: s.crafted,
        dungeonStars: s.dungeonStars, storyMode: s.storyMode, heroCleared: s.heroCleared, legendCleared: s.legendCleared, upgrades: s.upgrades, rest: s.rest
      }));
    } catch (e) { /* penyimpanan tidak tersedia: game tetap jalan */ }
  }

  /* ===== Cadangan (untuk orang tua): kode teks berisi seluruh simpanan ===== */
  /** Kode cadangan = JSON simpanan, di-base64 (aman untuk huruf non-ASCII seperti nama). */
  function exportCode() {
    let raw = '';
    try { raw = localStorage.getItem(KEY) || ''; } catch (e) { raw = ''; }
    const bytes = new TextEncoder().encode(raw);
    let bin = '';
    bytes.forEach(b => (bin += String.fromCharCode(b)));
    return 'MQ1:' + btoa(bin);
  }
  /** Pulihkan dari kode atau isi file cadangan. Kembalikan true jika berhasil (lalu halaman perlu dimuat ulang). */
  function importCode(text) {
    try {
      const t = String(text).trim();
      let json = t;
      if (t.startsWith('MQ1:')) {
        const bin = atob(t.slice(4));
        json = new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
      }
      const d = JSON.parse(json);
      if (!d || typeof d !== 'object' || Array.isArray(d) || !('level' in d)) return false;
      localStorage.setItem(KEY, JSON.stringify(d)); // dibersihkan oleh load() saat game dimuat ulang
      return true;
    } catch (e) { return false; }
  }
  /** Hapus semua progress. */
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  return {load, save, MODES, exportCode, importCode, reset};
})();
