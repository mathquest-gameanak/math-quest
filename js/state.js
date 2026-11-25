/* Math Quest — status pemain bersama (dipakai semua layar) + aturan level, status, item & equipment.

   Status pemain (HP, Serangan, Pertahanan) & poin status per level: rumus dan angkanya di js/balance.js. */
'use strict';
window.MQ = window.MQ || {};

MQ.State = (() => {
  const items = MQ.Data.items;
  const P = MQ.Balance.player, X = MQ.Balance.xp;
  const POINTS_PER_LEVEL = P.pointsPerLevel;
  const S = MQ.Save.load();

  /** Item yang sedang dipakai di slot tertentu (atau null). */
  const gear = slot => (S.equip[slot] ? items[S.equip[slot]] : null);
  /** Jumlah efek dari semua equipment yang dipakai, mis. effect('hp'). */
  const effect = key => ['senjata', 'pelindung', 'aksesori'].reduce((n, s) => n + ((gear(s) || {})[key] || 0), 0);

  // Rumus & angka: lihat js/balance.js
  const maxHp = () => MQ.Calc.playerHp(S.level, S.alloc.hp, effect('hp'));
  const atk = () => { const b = MQ.Calc.playerAtk(S.level, S.alloc.atk, effect('atk')); return [b, b + P.atkSpread]; };
  /** Kritikal: peluang (%) & pengali damage — dasar di balance.js, tambahan hanya dari equipment. */
  const critChance = () => MQ.Balance.combat.critChance + effect('crit');
  const critMul = () => MQ.Balance.combat.critMul + effect('critDmg') / 100;
  const def = () => Math.floor(P.defPerPoint * S.alloc.def) + effect('def');
  const xpNeed = lv => X.base + (lv - 1) * X.perLevel; // XP untuk naik dari level lv
  /** Damage tambahan senjata untuk jenis soal tertentu. */
  const bonusFor = kind => { const w = gear('senjata'); return w && w.bonus && w.bonus.kinds.includes(kind) ? w.bonus.dmg : 0; };

  /* Jumlah poin status harus = (level − 1) × poin per level. Bila aturan berubah (mis. angka kecil 2026-11-25),
     semua poin dikembalikan sekali untuk dibagi ulang di halaman Karakter. */
  if (S.points + S.alloc.hp + S.alloc.atk + S.alloc.def !== (S.level - 1) * P.pointsPerLevel) {
    S.alloc = {hp: 0, atk: 0, def: 0}; S.points = (S.level - 1) * P.pointsPerLevel;
  }

  S.hp = maxHp(); // HP saat ini tidak disimpan: penuh tiap masuk pertarungan

  /** Tambah XP; kembalikan true jika naik level (tiap level +3 poin status). */
  function addXp(n) {
    S.xp += n;
    let up = false;
    while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; S.points += P.pointsPerLevel; up = true; }
    return up;
  }
  /** Pakai 1 poin status untuk 'hp' | 'atk' | 'def'. */
  function spendPoint(stat) {
    if (S.points <= 0 || !(stat in S.alloc)) return false;
    S.points--; S.alloc[stat]++;
    if (stat === 'hp') S.hp += P.hpPerPoint;
    return true;
  }

  /* ===== Tas ===== */
  const count = id => S.inv[id] || 0;
  function addItem(id, n = 1) { S.inv[id] = count(id) + n; }
  function removeItem(id, n = 1) {
    S.inv[id] = count(id) - n;
    if (S.inv[id] <= 0) {
      delete S.inv[id];
      for (const slot in S.equip) if (S.equip[slot] === id) delete S.equip[slot]; // item habis → otomatis dilepas
    }
  }
  /** Pakai/lepas equipment (HP saat ini disesuaikan agar tidak melebihi HP maks). */
  function equip(id) { const it = items[id]; if (it && count(id)) S.equip[it.type] = id; S.hp = Math.min(S.hp, maxHp()); }
  function unequip(slot) { delete S.equip[slot]; S.hp = Math.min(S.hp, maxHp()); }
  const isEquipped = id => Object.values(S.equip).includes(id);

  /* ===== Catatan harian (Laporan Orang Tua) ===== */
  const pad = n => String(n).padStart(2, '0');
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dateKey(new Date());
  /** Tambah ke catatan hari ini: field 't' (detik main), 'b' (benar), 's' (salah). */
  function logDay(field, n) {
    const d = S.days[today()] || (S.days[today()] = {t: 0, b: 0, s: 0});
    d[field] += n;
  }

  /** Area biasa Kelas 1 (tanpa ujian). */
  const mainFields = () => MQ.Data.fields.filter(f => f.spec);
  /** Field/dungeon/ujian bisa dimasuki? reqAll = semua area biasa harus selesai. */
  const unlocked = place => !place.soon && (!place.req || S.cleared.includes(place.req)) &&
                            (!place.reqAll || mainFields().every(f => S.cleared.includes(f.id))) &&
                            (!place.minLevel || S.level >= place.minLevel);
  /** Jumlah kepingan kristal = area utama yang bosnya sudah dikalahkan (cerita). */
  const shards = () => mainFields().filter(f => S.cleared.includes(f.id)).length;

  const save = () => MQ.Save.save(S);

  return {S, POINTS_PER_LEVEL, maxHp, atk, def, critChance, critMul, xpNeed, bonusFor, effect, gear, addXp, spendPoint,
          count, addItem, removeItem, equip, unequip, isEquipped, unlocked, mainFields, shards, save,
          today, dateKey, logDay};
})();
