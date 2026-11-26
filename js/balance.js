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
    defPerPoint: 1,                                              // Pertahanan: 1 poin = −1 damage musuh
    pointsPerLevel: 1                                            // poin status tiap naik level
  },
  /* KURVA LEVEL (2026-11-26, hasil main orang tua): Normal ≈ Lv 1–15, Pahlawan ≈ Lv 16–30, Legenda ≈ Lv 31–40.
     Level monster mengikuti rentang itu (data.js "lv" untuk Normal, heroMode/legendMode "lv" di bawah),
     dan XP dikurangi bila pemain sudah 2 level di atas monster, jadi level pemain ikut tertahan di rentang tingkatnya. */
  xp: {
    base: 30, perLevel: 15,               // XP untuk naik level = base + perLevel × (level − 1)
    monsterBase: 5, perMonsterLevel: 3,   // XP dari monster = monsterBase + perMonsterLevel × level monster
    bossMul: 3,                           // bos memberi XP × bossMul
    penaltyFrom: 2,                       // mulai dikurangi jika pemain ≥ 2 level di atas monster
    penaltyStep: 0.25, minFactor: 0.1     // tiap level selisih berikutnya −25%, minimal 10%
  },
  monster: {
    hpBase: 12, hpPerLevel: 3.5, bossHpMul: 1.5, keyHpMul: 1.3, // Lv 1 = 16, Lv 15 = 65, Lv 30 = 117, Lv 40 = 152
    hpGrowthPct: 0,              // HP tambahan berlipat: × (1 + %/100) per level di atas 1 (0 = garis lurus)
    dmgBase: 2, dmgPerLevel: 0.55, bossDmgMul: 1.4,             // Lv 1 ≈ 3, Lv 15 ≈ 10, Lv 30 ≈ 19, Lv 40 ≈ 24
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
    fastCritBy: [2, 1.5, 1.2],   // batas KILAT per tingkat: [Normal / dungeon ⭐, Pahlawan / ⭐⭐, Legenda / ⭐⭐⭐] (2026-11-26)
    critMulMax: 2.5,
    potionLimit: 5,              // Ramuan Penyembuh paling banyak 5× per pertarungan (satu jalan area / dungeon / ujian)             // damage kritikal paling tinggi ×2,5 (walau equipment menambah lebih)
    comboLabel: 3,               // kombo beruntun mulai ditampilkan dengan 🔥 (hanya hiasan & misi)
    healOnKillPct: 20            // HP pulih (%) setiap mengalahkan monster (bukan di dungeon)
  },
  /* Tingkat dungeon ⭐/⭐⭐/⭐⭐⭐ dan Mode Pahlawan (petualangan utama setelah lulus ujian):
     lvAdd = level monster ditambah (HP, damage & XP ikut naik), hpMul / dmgMul = pengali HP & damage musuh,
     speedMul = pengali jeda serangan (< 1 = lebih cepat), rewardMul = pengali koin & isi peti.
     Pahlawan & Legenda memakai "lv: [dari, sampai]": level Normal 1–15 dipetakan ke rentang itu (bukan ditambah).
     Dungeon ⭐⭐⭐ setara pertengahan Pahlawan: tempat mengumpulkan bahan equipment terbaik untuk Legenda.
     Legenda sengaja berat: dirancang untuk dikalahkan dengan equipment terbaik dari dungeon + ditingkatkan di Pandai Besi. */
  tiers: [
    {lvAdd: 0, hpMul: 1, dmgMul: 1, speedMul: 1, rewardMul: 1},
    {lvAdd: 7, hpMul: 1, dmgMul: 1, speedMul: 0.85, rewardMul: 1.5},
    {lvAdd: 16, hpMul: 1.15, dmgMul: 1.15, speedMul: 0.7, rewardMul: 2}
  ],
  heroMode: {lv: [16, 30], hpMul: 1.15, dmgMul: 1.15, speedMul: 0.8, rewardMul: 2},
  /* Rentang level per kelas: [Normal, Pahlawan, Legenda] (GDD §15). Monster Pahlawan/Legenda = level Normal dipetakan ke rentangnya. */
  kelasLv: {2: [[16, 30], [31, 45], [46, 55]]}, // Kelas 1 memakai heroMode.lv / legendMode.lv (Normal 1–15)
  legendMode: {lv: [31, 40], hpMul: 1.5, dmgMul: 1.4, speedMul: 0.65, rewardMul: 3},  // Legenda: setelah lulus Ujian Pahlawan
  /* Dua monster sekaligus: titik (0-based) di area per mode cerita (1 = Pahlawan, 2 = Legenda),
     dan ruang di dungeon per tingkat (⭐⭐: ruang sebelum bos; ⭐⭐⭐: ruang genap). */
  pairs: {story: {1: [3], 2: [1, 3]}},
  /* Tingkatkan equipment +1..+10 (Pandai Besi, 2026-11-26: dari +5 jadi +10, sengaja mahal).
     Biaya naik KE tingkat L = isi daftar ke-L (urutan +1, +2, ... +10): bahan khusus slot, koin, Mahkota Kecil.
     Total +0 → +10 per perlengkapan: 55 bahan khusus, 1055 koin, 11 Mahkota.
     Efek per tingkat = "per"; mulai tingkat strongFrom (+6) tiap tingkat memberi × strongMul (lebih kuat). */
  upgrade: {max: 10, strongFrom: 6, strongMul: 2,
            coins:  [10, 20, 35, 50, 70, 100, 130, 170, 210, 260],
            mats:   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            crowns: [0, 0, 0, 1, 1, 1, 1, 2, 2, 3],
            mat: {senjata: 'kristalPola', pelindung: 'mutiara', aksesori: 'tinta'},
            per: {senjata: {atk: 1}, pelindung: {hp: 3, def: 0.5}, aksesori: {crit: 2, critDmg: 5}}},
  /* Soal CEPAT vs soal PIKIR (2026-11-26). time = pengali waktu per jenis soal (1 = fakta dasar):
     damage musuh lebih kecil (dibagi angka ini ^ soft) dan batas KILAT lebih panjang (dikali angka ini); kecepatan musuh tetap (slow 0).
     Jenis dengan pengali ≥ from = soal PIKIR: tanpa KILAT; jawaban benar = serangan TELITI! (damage × telitiMul),
     supaya anak dihargai karena teliti, bukan karena cepat. */
  think: {
    time: {ratusan: 1.5, nilai: 1.5, lompat: 1.5, bersusun: 1.8, hitungCepat: 1.3, kurangSusun: 1.8, kurangCepat: 1.4, cm: 1.5, air: 1.5, jam: 1.6, durasi: 1.6, uang: 1.6, kaliArti: 1.4, kaliTabel: 1.2, kaliCerita: 2, kaliPola: 1.6, segi: 1.4, kotak: 1.4, tambah: 1, kurang: 1, kali: 1, banding: 1, hitung: 1.3, urutan: 1.3, bentuk: 1.3, isi: 1.5, panjang: 1.5, pasangan: 1.5,
           puluhan: 1.6, pola: 2, ukur: 2, cerita: 3, teka: 3,
           posisi: 1.3, berulang: 1.5, keluarga: 1.6, kelompok: 1.3, susun: 2, belasan: 1.5, dobel: 1.3, data: 2, turus: 1.6},
    from: 2,
    telitiMul: 1.5,
    storySpeak: 0,    // 1 = soal cerita selalu dibacakan otomatis (0: suara bawaan HP/laptop beraksen aneh; tombol 🔊 tetap ada)
    soft: 1,          // damage musuh dibagi (pengali waktu ^ soft): pola/ukur ×2 → damage 50%, cerita/teka ×3 → 33%
    slow: 0           // bar serangan musuh dibagi (pengali waktu ^ slow): 0 = kecepatan tetap normal (pilihan orang tua 2026-11-26)
  },
  /* Peti Teka-teki (2026-11-26): kadang muncul di jalur area setelah titik 2 / titik 4. Soal teka-teki TANPA waktu;
     salah = coba lagi (tanpa hukuman), hadiah penuh bila benar pada percobaan pertama. Paling banyak 1 peti per jalan. */
  chest: {
    chance: 0.4,     // peluang muncul di tiap titik di "at" (0 = tidak pernah)
    at: [1, 3],      // indeks titik yang baru dilewati (0 = titik 1)
    coins: [6, 2],   // koin: benar pertama kali / setelah mencoba lagi
    items: 2         // bahan area bila benar pertama kali
  },
  /* Pingsan (HP habis, 2026-11-26): pertarungan terkunci lockMin menit DAN sampai pelajaran selesai (mustLearn 1),
     pelajaran = jenis soal yang paling sering salah di pertarungan itu, latihan tanpa waktu sampai benar "practice" kali. */
  knockout: {
    lockMin: 2,      // menit istirahat (0 = tanpa menunggu); 2026-11-26: 5 → 2 menit, cukup untuk mempelajari yang salah
    mustLearn: 1,    // 1 = wajib menyelesaikan pelajaran dulu
    practice: 3      // jumlah jawaban benar di latihan pelajaran
  },
  /* ⚡ Power = jumlah status × bobot ini (perlengkapan & pahlawan). Hanya angka pembanding, tidak mengubah pertarungan. */
  power: {atk: 10, hp: 2, def: 15, crit: 2, critDmg: 1, bonus: 4, coins: 8, xp: 1},
  rewards: {
    coinsNormal: [1, 2], coinsBoss: 8,  // koin dari monster
    dropChance: 0.7,                    // peluang monster biasa menjatuhkan 1 bahan
    bossDrops: 3                        // jumlah bahan dari bos (+1 Mahkota Kecil)
  }
};

/** Rumus bersama (dipakai pertarungan & pratinjau Atur Angka), supaya keduanya selalu sama. */
MQ.Calc = {
  /** Level monster di tingkat cerita: level Normal (1–15) dipetakan ke cfg.lv [dari, sampai]; tanpa lv → + cfg.lvAdd. */
  storyLv(L, cfg) {
    if (!cfg) return L;
    if (!cfg.lv) return L + (cfg.lvAdd || 0);
    const [a, b] = cfg.lv, [n0, n1] = cfg.from || [1, 15];
    return Math.min(b, a + Math.round((L - n0) * (b - a) / (n1 - n0)));
  },
  /** Pengaturan tingkat cerita m (1 Pahlawan, 2 Legenda) untuk kelas k: rentang level ikut kelas (kelasLv). */
  modeCfg(m, k) {
    const B = MQ.Balance, base = m === 2 ? B.legendMode : m === 1 ? B.heroMode : null, R = B.kelasLv[k];
    return base && R ? Object.assign({}, base, {lv: R[m], from: R[0]}) : base;
  },
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
