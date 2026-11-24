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
     HP monster      = monster.hpBase + monster.hpPerLevel × levelMonster          (bos × monster.bossHpMul)
     Damage monster  = (monster.dmgBase + monster.dmgPerLevel × levelMonster) × kekuatan monster − Pertahanan pemain
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
    hpBase: 24, hpPerLevel: 9, bossHpMul: 2,
    dmgBase: 3, dmgPerLevel: 1.5, bossDmgMul: 1.4,
    levelUpEvery: 5,             // monster di area naik 1 level setiap 5 monster dikalahkan
    bossLevelBonus: 1,           // bos 1 level di atas monster biasa saat itu
    bossSlowMul: 1.2             // bos menyerang sedikit lebih lambat
  },
  combat: {
    comboForCrit: 3, critMul: 2, // benar beruntun untuk serangan kritis & pengalinya
    healOnKillPct: 20            // HP pulih (%) setiap mengalahkan monster (bukan di dungeon)
  },
  rewards: {
    coinsNormal: [1, 2], coinsBoss: 8,  // koin dari monster
    dropChance: 0.7,                    // peluang monster biasa menjatuhkan 1 bahan
    bossDrops: 3                        // jumlah bahan dari bos (+1 Mahkota Kecil)
  }
};
