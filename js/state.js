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
  /** Tingkat equipment (+0..+5, Pandai Besi → Tingkatkan). */
  const upLevel = id => S.upgrades[id] || 0;
  /** Tambahan efek dari tingkat item (lihat balance.js upgrade.per). */
  /** Banyaknya "langkah efek" sampai tingkat L: +1..+5 = 1 per tingkat, mulai +6 = strongMul per tingkat. */
  const upSteps = L => { const U = MQ.Balance.upgrade, f = U.strongFrom || 99; return Math.min(L, f - 1) + (U.strongMul || 1) * Math.max(0, L - f + 1); };
  const upBonus = (id, key) => { const it = items[id], per = it && MQ.Balance.upgrade.per[it.type]; return per && per[key] ? Math.floor(per[key] * upSteps(upLevel(id))) : 0; };
  /** Jumlah efek dari semua equipment yang dipakai (termasuk tingkatnya), mis. effect('hp'). */
  const effect = key => ['senjata', 'pelindung', 'aksesori'].reduce((n, s) => n + ((gear(s) || {})[key] || 0) + (S.equip[s] ? upBonus(S.equip[s], key) : 0), 0);

  // Rumus & angka: lihat js/balance.js
  const maxHp = () => MQ.Calc.playerHp(S.level, S.alloc.hp, effect('hp'));
  const atk = () => { const b = MQ.Calc.playerAtk(S.level, S.alloc.atk, effect('atk')); return [b, b + P.atkSpread]; };
  /** Kritikal: peluang (%) & pengali damage — dasar di balance.js, tambahan hanya dari equipment. */
  const critChance = () => MQ.Balance.combat.critChance + effect('crit');
  // damage kritikal dibatasi critMulMax supaya equipment terbaik tidak membuat musuh selalu kalah sekali pukul
  const critMul = () => Math.min(MQ.Balance.combat.critMulMax || 99, MQ.Balance.combat.critMul + effect('critDmg') / 100);
  /* ===== ⚡ Power (2026-11-26): satu angka dari semua status, untuk membandingkan & mengurutkan perlengkapan.
     Item: efek item + tingkatan (+N). Pahlawan: dari HP, serangan, pertahanan, kritikal. Rumus di balance.power. */
  function itemPower(id) {
    const it = items[id], W = MQ.Balance.power;
    if (!it || !['senjata', 'pelindung', 'aksesori'].includes(it.type)) return 0;
    const v = k => (it[k] || 0) + upBonus(id, k);
    return Math.round(v('atk') * W.atk + v('hp') * W.hp + v('def') * W.def + v('crit') * W.crit + v('critDmg') * W.critDmg +
      (it.bonus ? it.bonus.dmg * W.bonus : 0) + (it.coins || 0) * W.coins + (it.xp || 0) * W.xp);
  }
  function heroPower() {
    const W = MQ.Balance.power, [a] = atk();
    return Math.round(maxHp() * W.hp + a * W.atk + def() * W.def + critChance() * W.crit + (critMul() - 1) * 100 * W.critDmg);
  }
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
                            (!place.minLevel || S.level >= place.minLevel) &&
                            (!place.kelas || S.grade >= place.kelas); // kelas atas: boleh diintip, dimainkan setelah lulus kelas sebelumnya
  /* Tingkat cerita: 0 Normal, 1 Pahlawan, 2 Legenda. Pahlawan terbuka setelah lulus Ujian Normal (naik Kelas 2);
     Legenda terbuka setelah lulus Ujian Pahlawan. Di tiap tingkat area terbuka berurutan lagi dari awal.
     Ujian yang lulus di Pahlawan/Legenda dicatat sebagai 'kastil' di heroCleared/legendCleared. */
  const modeList = m => (m === 2 ? S.legendCleared : m === 1 ? S.heroCleared : S.cleared);
  /** Id ujian kelas yang sedang dimainkan (Kelas 1: 'kastil'). */
  const examId = () => { const e = MQ.Data.fields.find(f => f.exam); return e ? e.id : ''; };
  /* Tingkat per kelas: Pahlawan terbuka setelah lulus ujian Normal kelas itu, Legenda setelah lulus ujian Pahlawan kelas itu. */
  const modeOpen = m => (m === 0 ? true : m === 1 ? S.grade > S.kelas : S.grade > S.kelas && S.heroCleared.includes(examId()));
  const storyMode = () => (modeOpen(S.storyMode) ? S.storyMode : modeOpen(1) && S.storyMode === 2 ? 1 : 0);
  /** Tempat terbuka di tingkat m (arena & dungeon mengikuti Normal). */
  const unlockedIn = (place, m) => {
    if (!m || !(place.spec || place.exam)) return unlocked(place);
    const list = modeList(m);
    return !place.soon && (!place.req || list.includes(place.req)) && (!place.reqAll || mainFields().every(f => list.includes(f.id)));
  };
  /** Jumlah kepingan kristal = area utama yang bosnya sudah dikalahkan (cerita). */
  const shards = () => mainFields().filter(f => S.cleared.includes(f.id)).length;

  const save = () => MQ.Save.save(S);

  /** Nama item beserta tingkatnya, mis. "Pedang Kayu +2". */
  const itemName = id => items[id].name + (upLevel(id) ? ` +${upLevel(id)}` : '');

  return {S, POINTS_PER_LEVEL, itemPower, heroPower, upLevel, upSteps, upBonus, itemName, maxHp, atk, def, critChance, critMul, xpNeed, bonusFor, effect, gear, addXp, spendPoint,
          count, addItem, removeItem, equip, unequip, isEquipped, unlocked, mainFields, shards, save, modeList, modeOpen, storyMode, unlockedIn, examId,
          today, dateKey, logDay};
})();
