/* Math Quest — PENGATURAN KESEIMBANGAN (semua angka penting ada di sini).
   Ubah angka di file ini untuk membuat game lebih mudah / lebih sulit, tanpa menyentuh kode lain.
   Setelah mengubah: naikkan VERSION di sw.js agar HP yang sudah menginstal ikut memperbarui.

   Cara membaca rumus:
     HP pemain       = player.baseHp + player.hpPerLevel × level + player.hpPerPoint × poin HP + bonus equipment
     Serangan pemain = (player.baseAtk + player.atkPerLevel × level + player.atkPerPoint × poin ATK + equipment)
                       sampai + player.atkSpread  (acak di antaranya)
     HP monster      = monster.hpBase + monster.hpPerLevel × levelArea   (bos × monster.bossHpMul)
     Damage monster  = (monster.dmgBase + monster.dmgPerLevel × levelArea) × kekuatan monster − Pertahanan pemain
     levelArea       = level di peta (data.js, "lv: [min, maks]"), dipilih oleh monster.areaLevel

   Contoh penyesuaian:
     - Naik level terasa terlalu cepat kuat?     → turunkan player.atkPerPoint (mis. 2 → 1)
     - Area akhir terlalu gampang?               → naikkan monster.hpPerLevel (mis. 6 → 9) atau monster.dmgPerLevel
     - Musuh menyerang terlalu cepat untuk anak? → ubah kecepatan di data.js (styles / spd) atau pace per area */
'use strict';
window.MQ = window.MQ || {};

MQ.Balance = {
  player: {
    baseHp: 40, hpPerLevel: 5, hpPerPoint: 10,   // HP
    baseAtk: 8, atkSpread: 4, atkPerLevel: 1, atkPerPoint: 2, // Serangan
    defPerPoint: 1,                               // Pertahanan
    pointsPerLevel: 3                             // poin status tiap naik level
  },
  xp: {
    base: 30, perLevel: 15,      // XP untuk naik level = base + perLevel × (level − 1)
    normal: 10, boss: 30         // XP dari monster biasa / bos (berkurang jika level pemain di atas area)
  },
  monster: {
    hpBase: 30, hpPerLevel: 6, bossHpMul: 2,
    dmgBase: 3, dmgPerLevel: 1, bossDmgMul: 1.5,
    bossSlowMul: 1.2,            // bos menyerang sedikit lebih lambat
    areaLevel: 'min'             // 'min' = pakai level terendah area, 'max' = tertinggi, 'mid' = tengah
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
