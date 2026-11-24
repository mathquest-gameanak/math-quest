/* Math Quest — PENGATURAN KESEIMBANGAN (semua angka penting ada di sini).
   Ubah angka di file ini untuk membuat game lebih mudah / lebih sulit, tanpa menyentuh kode lain.
   Setelah mengubah: naikkan VERSION di sw.js agar HP yang sudah menginstal ikut memperbarui.

   Cara membaca rumus:
     HP pemain       = player.baseHp + player.hpPerLevel × level + player.hpPerPoint × poin HP + bonus equipment
     Serangan pemain = (player.baseAtk + player.atkPerLevel × level + player.atkPerPoint × poin ATK + equipment)
                       sampai + player.atkSpread  (acak di antaranya)
     Level monster   = level awal area + 1 setiap monster.levelUpEvery monster dikalahkan di area itu
                       (maksimal level tertinggi area; bos = +monster.bossLevelBonus). Arena: = level pemain.
                       Level area ada di data.js ("lv: [min, maks]").
     HP monster      = (monster.hpBase + monster.hpPerLevel × levelMonster) × (1 + hpGrowthPct/100)^(level−1)
                       (bos × monster.bossHpMul, monster kunci × monster.keyHpMul)
     Kritikal        = pasti jika menjawab ≤ combat.fastCritSec detik; jika tidak, acak combat.critChance % + equipment.
                       Damage kritikal = damage × (combat.critMul + critDmg equipment / 100)
     Damage monster  = (monster.dmgBase + monster.dmgPerLevel × levelMonster) × (1 + dmgGrowthPct/100)^(level−1)
                       × kekuatan monster (bos × bossDmgMul) − Pertahanan pemain (minimal 1)
     Jeda serangan   = acak spd jenis monster (data.js styles) × pace tempat × monster.speedMul (bos × bossSlowMul)

   Semua angka di sini juga bisa diubah sementara dari HP: Orang Tua → 🧪 Atur Angka.
     XP              = (xp.monsterBase + xp.perMonsterLevel × levelMonster)          (bos × xp.bossMul)
                       Jika level pemain ≥ level monster + xp.penaltyFrom: XP dikurangi xp.penaltyStep per level selisih
                       (paling kecil xp.minFactor). Tidak berlaku di Arena Latihan.

   Contoh penyesuaian:
     - Naik level terasa terlalu cepat kuat?     → turunkan player.atkPerPoint atau player.atkPerLevel
     - Area akhir terlalu gampang?               → naikkan monster.hpPerLevel atau monster.dmgPerLevel
     - Naik level terlalu lambat?                → naikkan xp.perMonsterLevel atau turunkan xp.perLevel
     - Musuh menyerang terlalu cepat untuk anak? → ubah kecepatan di data.js (styles / spd) atau pace per area */
'use strict';
window.MQ = window.MQ || {};

MQ.Balance = {
  player: {
    baseHp: 40, hpPerLevel: 6, hpPerPoint: 8,                  // HP
    baseAtk: 8, atkSpread: 4, atkPerLevel: 1, atkPerPoint: 1,  // Serangan
    defPerPoint: 0.5,                                          // Pertahanan (dibulatkan ke bawah: 2 poin = −1 damage)
    pointsPerLevel: 3                                          // poin status tiap naik level
  },
  xp: {
    base: 30, perLevel: 15,               // XP untuk naik level = base + perLevel × (level − 1)
    monsterBase: 8, perMonsterLevel: 2,   // XP dari monster = monsterBase + perMonsterLevel × level monster
    bossMul: 3,                           // bos memberi XP × bossMul
    penaltyFrom: 3,                       // mulai dikurangi jika pemain ≥ 3 level di atas monster
    penaltyStep: 0.25, minFactor: 0.1     // tiap level selisih berikutnya −25%, minimal 10%
  },
  monster: {
    hpBase: 24, hpPerLevel: 9, bossHpMul: 2, keyHpMul: 1.5,
    hpGrowthPct: 0,              // HP tambahan berlipat: × (1 + %/100) per level di atas 1 (0 = garis lurus)
    dmgBase: 3, dmgPerLevel: 1.5, bossDmgMul: 1.4,
    dmgGrowthPct: 0,             // damage tambahan berlipat per level (0 = garis lurus)
    speedMul: 1,                 // pengali jeda serangan SEMUA musuh (0.5 = dua kali lebih cepat)
    startCharge: 0,              // bar serangan musuh sudah terisi sekian (0–0.9) saat muncul
    pauseWhileReading: 1,        // 1 = waktu musuh berhenti saat soal dibacakan, 0 = tetap berjalan
    levelUpEvery: 5,             // monster di area naik 1 level setiap 5 monster dikalahkan
    bossLevelBonus: 1,           // bos 1 level di atas monster biasa saat itu
    bossSlowMul: 1.2             // bos menyerang sedikit lebih lambat
  },
  combat: {
    critChance: 10,              // peluang kritikal dasar (%) — tambahan hanya dari equipment ("crit")
    critMul: 1.5,                // damage kritikal dasar (×) — tambahan hanya dari equipment ("critDmg", dalam %)
    fastCritSec: 2,              // jawab benar dalam ≤ 2 detik = pasti kritikal ("KILAT!")
    comboLabel: 3,               // kombo beruntun mulai ditampilkan dengan 🔥 (hanya hiasan & misi)
    healOnKillPct: 20            // HP pulih (%) setiap mengalahkan monster (bukan di dungeon)
  },
  rewards: {
    coinsNormal: [1, 2], coinsBoss: 8,  // koin dari monster
    dropChance: 0.7,                    // peluang monster biasa menjatuhkan 1 bahan
    bossDrops: 3                        // jumlah bahan dari bos (+1 Mahkota Kecil)
  }
};

/** Rumus bersama (dipakai pertarungan & pratinjau Atur Angka), supaya keduanya selalu sama. */
MQ.Calc = {
  monsterHp(lv, kind) {
    const M = MQ.Balance.monster;
    const mul = kind === 'boss' ? M.bossHpMul : kind === 'key' ? M.keyHpMul : 1;
    return Math.round((M.hpBase + M.hpPerLevel * lv) * Math.pow(1 + M.hpGrowthPct / 100, lv - 1) * mul);
  },
  /** Damage sebelum dikurangi pertahanan. */
  monsterDmg(lv, power, isBoss) {
    const M = MQ.Balance.monster;
    return Math.round((M.dmgBase + M.dmgPerLevel * lv) * Math.pow(1 + M.dmgGrowthPct / 100, lv - 1) * power * (isBoss ? M.bossDmgMul : 1));
  },
  /** Pengali jeda serangan (tanpa acak). */
  intervalMul(pace, isBoss) {
    const M = MQ.Balance.monster;
    return (pace || 1) * M.speedMul * (isBoss ? M.bossSlowMul : 1);
  }
};
