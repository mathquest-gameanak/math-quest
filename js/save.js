/* Math Quest — simpan & muat progress (localStorage).
   Semua akses dibungkus try/catch: di mode privat / data: URL, localStorage bisa melempar error.
   load() selalu mengembalikan objek lengkap & valid; data lama (v1) otomatis terbawa. */
'use strict';
window.MQ = window.MQ || {};

MQ.Save = (() => {
  const KEY = 'mathQuest.v1'; // nama kunci tetap; versi format ada di dalam data (field v)
  const VERSION = 7;          // v1: level/xp/monsters/mode. v2: + area selesai, kill per field, statistik. v3: + koin, tas, equipment. v4: + kelas, ujian, misi harian. v5: + poin status (HP/ATK/DEF). v6: + catatan harian, pengaturan. v7: + penampilan pahlawan
  const MODES = ['campur', 'tambah', 'kurang', 'kali'];
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
    return {
      hero: MQ.Hero ? MQ.Hero.sanitize(d.hero) : null, // penampilan pahlawan; null = belum dibuat → layar Buat Karakter
      days,
      settings: {santai: st.santai === true, autoSpeak: st.autoSpeak === true, // diatur di layar Orang Tua
                 music: vol01(st.music, 0.6), sfx: vol01(st.sfx, 0.8)},      // volume 0..1
      alloc, points,
      grade: num(d.grade, 1, 1),         // kelas saat ini (2 = lulus Kelas 1)
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
        coins: s.coins, inv: s.inv, equip: s.equip, grade: s.grade, examBest: s.examBest, daily: s.daily,
        alloc: s.alloc, points: s.points, settings: s.settings, days: pruneDays(s.days), hero: s.hero
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
