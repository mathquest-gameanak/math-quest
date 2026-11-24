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
  const maxHp = () => P.baseHp + P.hpPerLevel * S.level + P.hpPerPoint * S.alloc.hp + effect('hp');
  const atk = () => { const b = P.baseAtk + P.atkPerLevel * S.level + P.atkPerPoint * S.alloc.atk + effect('atk'); return [b, b + P.atkSpread]; };
  const def = () => Math.floor(P.defPerPoint * S.alloc.def) + effect('def');
  const xpNeed = lv => X.base + (lv - 1) * X.perLevel; // XP untuk naik dari level lv
  /** Damage tambahan senjata untuk jenis soal tertentu. */
  const bonusFor = kind => { const w = gear('senjata'); return w && w.bonus && w.bonus.kinds.includes(kind) ? w.bonus.dmg : 0; };

  S.hp = maxHp(); // HP saat ini tidak disimpan: penuh tiap masuk pertarungan

  /** Tambah XP; kembalikan true jika naik level (tiap level +3 poin status). */
  function addXp(n) {
    S.xp += n;
    let up = false;
    while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; S.points += POINTS_PER_LEVEL; up = true; }
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
                            (!place.reqAll || mainFields().every(f => S.cleared.includes(f.id)));

  const save = () => MQ.Save.save(S);

  return {S, POINTS_PER_LEVEL, maxHp, atk, def, xpNeed, bonusFor, effect, gear, addXp, spendPoint,
          count, addItem, removeItem, equip, unequip, isEquipped, unlocked, mainFields, save,
          today, dateKey, logDay};
})();
