/* Math Quest — PENGATURAN KESEIMBANGAN (semua angka penting ada di sini).
   Ubah angka di file ini untuk membuat game lebih mudah / lebih sulit, tanpa menyentuh kode lain.
   Setelah mengubah: naikkan VERSION di sw.js agar HP yang sudah menginstal ikut memperbarui.

   Cara membaca rumus:
   ANGKA KECIL (2026-11-25): HP & damage dibuat kecil (< 100) dan damage tetap, supaya anak kelas 1 bisa ikut berhitung.
     HP pemain       = player.baseHp + player.hpPerLevel × (level − 1) + player.hpPerPoint × poin HP + bonus equipment
     Serangan pemain = bulat-ke-bawah(player.baseAtk + player.atkPerLevel × (level − 1)) + player.atkPerPoint × poin ATK + equipment
                       sampai + player.atkSpread (0 = damage tetap, tidak acak)
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
    baseHp: 20, hpPerLevel: 2, hpPerPoint: 3,                    // HP: Lv 1 = 20, Lv 10 = 38, Lv 20 = 58
    baseAtk: 5, atkSpread: 0, atkPerLevel: 0.5, atkPerPoint: 1,  // Serangan: Lv 1 = 5, Lv 10 = 9, Lv 20 = 14 (tetap, tidak acak)
    defPerPoint: 0.5,                                            // Pertahanan (dibulatkan ke bawah: 2 poin = −1 damage)
    pointsPerLevel: 1                                            // poin status tiap naik level
  },
  xp: {
    base: 30, perLevel: 15,               // XP untuk naik level = base + perLevel × (level − 1)
    monsterBase: 8, perMonsterLevel: 2,   // XP dari monster = monsterBase + perMonsterLevel × level monster
    bossMul: 3,                           // bos memberi XP × bossMul
    penaltyFrom: 3,                       // mulai dikurangi jika pemain ≥ 3 level di atas monster
    penaltyStep: 0.25, minFactor: 0.1     // tiap level selisih berikutnya −25%, minimal 10%
  },
  monster: {
    hpBase: 12, hpPerLevel: 3, bossHpMul: 1.5, keyHpMul: 1.3,   // Lv 1 = 15, Lv 10 = 42, Lv 20 = 72
    hpGrowthPct: 0,              // HP tambahan berlipat: × (1 + %/100) per level di atas 1 (0 = garis lurus)
    dmgBase: 1.6, dmgPerLevel: 0.35, bossDmgMul: 1.4,           // Lv 1 ≈ 2, Lv 10 ≈ 5, Lv 20 ≈ 9
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
    critMul: 2,                  // damage kritikal dasar (× 2 = dobel) — tambahan hanya dari equipment ("critDmg", dalam %)
    fastCritSec: 2,              // jawab benar dalam ≤ 2 detik = pasti kritikal ("KILAT!")
    comboLabel: 3,               // kombo beruntun mulai ditampilkan dengan 🔥 (hanya hiasan & misi)
    healOnKillPct: 20            // HP pulih (%) setiap mengalahkan monster (bukan di dungeon)
  },
  /* Tingkat dungeon ⭐/⭐⭐/⭐⭐⭐ dan Mode Pahlawan (petualangan utama setelah lulus ujian):
     lvAdd = level monster ditambah (HP, damage & XP ikut naik), hpMul / dmgMul = pengali HP & damage musuh,
     speedMul = pengali jeda serangan (< 1 = lebih cepat), rewardMul = pengali koin & isi peti.
     Mode Pahlawan sengaja berat: dirancang untuk dikalahkan dengan equipment dari bahan khusus dungeon. */
  tiers: [
    {lvAdd: 0, hpMul: 1, dmgMul: 1, speedMul: 1, rewardMul: 1},
    {lvAdd: 3, hpMul: 1, dmgMul: 1, speedMul: 0.85, rewardMul: 1.5},
    {lvAdd: 6, hpMul: 1.2, dmgMul: 1.2, speedMul: 0.7, rewardMul: 2}
  ],
  heroMode: {lvAdd: 6, hpMul: 1.4, dmgMul: 1.6, speedMul: 0.7, rewardMul: 2},
  legendMode: {lvAdd: 12, hpMul: 1.8, dmgMul: 2.2, speedMul: 0.6, rewardMul: 3},  // Legenda: setelah 6 bos Mode Pahlawan
  /* Dua monster sekaligus: titik (0-based) di area per mode cerita (1 = Pahlawan, 2 = Legenda),
     dan ruang di dungeon per tingkat (⭐⭐: ruang sebelum bos; ⭐⭐⭐: ruang genap). */
  pairs: {story: {1: [3], 2: [1, 3]}},
  /* Tingkatkan equipment +1..+5 (Pandai Besi). Per tingkat: tambahan efek per slot; biaya tingkat L:
     bahan khusus slot × L, koin × L, Mahkota Kecil 1 mulai tingkat crownFrom. */
  upgrade: {max: 5, coins: 10, crownFrom: 4,
            mat: {senjata: 'kristalPola', pelindung: 'mutiara', aksesori: 'tinta'},
            per: {senjata: {atk: 1}, pelindung: {hp: 3, def: 0.5}, aksesori: {crit: 2, critDmg: 5}}},
  /* Soal CEPAT vs soal PIKIR (2026-11-26). time = pengali waktu per jenis soal (1 = fakta dasar):
     bar serangan musuh terisi lebih lambat (dibagi angka ini) dan batas KILAT lebih panjang (dikali angka ini).
     Jenis dengan pengali ≥ from = soal PIKIR: tanpa KILAT; jawaban benar = serangan TELITI! (damage × telitiMul),
     supaya anak dihargai karena teliti, bukan karena cepat. */
  think: {
    time: {tambah: 1, kurang: 1, kali: 1, banding: 1, hitung: 1.3, urutan: 1.3, bentuk: 1.3, isi: 1.5, panjang: 1.5, pasangan: 1.5,
           puluhan: 1.6, pola: 2, ukur: 2, cerita: 3},
    from: 2,
    telitiMul: 1.5,
    storySpeak: 1     // 1 = soal cerita selalu dibacakan otomatis (anak kelas 1 belum tentu lancar membaca)
  },
  rewards: {
    coinsNormal: [1, 2], coinsBoss: 8,  // koin dari monster
    dropChance: 0.7,                    // peluang monster biasa menjatuhkan 1 bahan
    bossDrops: 3                        // jumlah bahan dari bos (+1 Mahkota Kecil)
  }
};

/** Rumus bersama (dipakai pertarungan & pratinjau Atur Angka), supaya keduanya selalu sama. */
MQ.Calc = {
  /** HP maks & serangan pemain (poin = poin status yang dibagi, eq = tambahan equipment). */
  playerHp(lv, pts, eq) { const P = MQ.Balance.player; return Math.round(P.baseHp + P.hpPerLevel * (lv - 1) + P.hpPerPoint * pts + eq); },
  playerAtk(lv, pts, eq) { const P = MQ.Balance.player; return Math.floor(P.baseAtk + P.atkPerLevel * (lv - 1)) + P.atkPerPoint * pts + eq; },
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
