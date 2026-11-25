/* Math Quest — utilitas acak & pembuat soal.

   Setiap soal berbentuk:
     { kind, text, view?, speak, ans, choices: [{v, html}], cols }
       kind    : jenis soal (juga kunci statistik kemampuan)
       text    : tulisan besar di panel soal
       view    : gambar pendukung (HTML/SVG buatan sendiri) — opsional
       speak   : kalimat yang dibacakan tombol 🔊
       ans     : jawaban benar (string, sama dengan salah satu choices[].v)
       cols    : jumlah kolom tombol jawaban (2 atau 3)
       hint    : (opsional) fungsi → HTML petunjuk bergambar, ditampilkan setelah jawaban salah
   Spesifikasi soal per field ada di data.js: { kinds: [...], max }. */
'use strict';
window.MQ = window.MQ || {};

/** Bilangan bulat acak a..b (inklusif). */
MQ.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
/** Ambil satu isi array secara acak. */
MQ.pick = arr => arr[MQ.rand(0, arr.length - 1)];
/** Acak isi array di tempat (Fisher-Yates), lalu kembalikan array itu. */
MQ.shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = MQ.rand(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

MQ.Questions = (() => {
  const {rand, pick, shuffle} = MQ;
  const V = () => MQ.Vis; // dibaca saat dipakai (visuals.js dimuat setelah file ini)

  /** Batas angka Arena per level: Lv1 ≤10, Lv2 ≤15, Lv3 ≤20, lalu +10 per level (maks 100). */
  const maxFor = L => (L <= 1 ? 10 : L === 2 ? 15 : L === 3 ? 20 : Math.min(100, 20 + (L - 3) * 10));

  /** Spesifikasi Arena Latihan: mengikuti level pemain & mode. mode: campur | tambah | kurang | kali */
  function specForLevel(level, mode) {
    const kinds = mode !== 'campur' ? [mode] : level >= 3 ? ['tambah', 'kurang', 'kali'] : ['tambah', 'kurang'];
    return {kinds, max: maxFor(level), mulA: Math.min(10, level + 1), mulB: level < 3 ? 5 : 10};
  }

  /** 3 bilangan salah yang dekat dengan jawaban: unik, ≥ min, lalu 4 pilihan diacak. */
  function nearChoices(ans, extra = [], min = 0) {
    const pool = shuffle([1, -1, 2, -2, 3, -3].map(d => ans + d));
    const prio = shuffle(extra.slice());          // pengecoh khusus (mis. salah puluhan) didahulukan sebagian
    const cand = [...prio.slice(0, 1), ...pool, ...prio.slice(1)];
    const wrong = [];
    for (const v of cand) {
      if (v >= min && v !== ans && !wrong.includes(v)) wrong.push(v);
      if (wrong.length === 3) break;
    }
    for (let v = ans + 4; wrong.length < 3; v++) if (!wrong.includes(v)) wrong.push(v); // cadangan
    return shuffle([ans, ...wrong]).map(n => ({v: String(n), html: String(n)}));
  }
  const numQ = (kind, text, speak, ans, extra, min, view) =>
    ({kind, text, speak, view, ans: String(ans), choices: nearChoices(ans, extra, min), cols: 2});

  /** Pasang petunjuk bergambar (fungsi → HTML, dibuat hanya saat dibutuhkan). fn = false → tanpa petunjuk. */
  const hint = (q, fn) => { if (fn) q.hint = fn; return q; };

  /* ===== Generator per jenis soal ===== */
  const GEN = {
    tambah(s) {
      const c = rand(2, s.max), a = rand(1, c - 1), b = c - a;
      return hint(numQ('tambah', `${a} + ${b} = ?`, `${a} tambah ${b} sama dengan berapa?`, c, c >= 20 ? [c + 10, c - 10] : []),
                  c <= 20 && (() => V().hintAdd(a, b, c)));
    },
    kurang(s) {
      const a = rand(2, s.max), b = rand(1, a), c = a - b; // b ≤ a → tidak pernah negatif
      return hint(numQ('kurang', `${a} − ${b} = ?`, `${a} kurang ${b} sama dengan berapa?`, c, c >= 20 ? [c + 10, c - 10] : []),
                  a <= 20 && (() => V().hintSub(a, b, c)));
    },
    kali(s) {
      const a = rand(1, s.mulA || 10), b = rand(1, s.mulB || 10), c = a * b;
      return numQ('kali', `${a} × ${b} = ?`, `${a} kali ${b} sama dengan berapa?`, c, [c + a, c - a, c + b, c - b]);
    },
    /** Isi yang kosong: 3 + □ = 5 */
    isi(s) {
      if (rand(0, 1)) {
        const c = rand(2, s.max), a = rand(1, c - 1), b = c - a;
        return hint(rand(0, 1)
          ? numQ('isi', `${a} + □ = ${c}`, `${a} tambah berapa sama dengan ${c}?`, b)
          : numQ('isi', `□ + ${b} = ${c}`, `Berapa tambah ${b} sama dengan ${c}?`, a, [], 1), c <= 20 && (() => V().hintAdd(a, b, c)));
      }
      const a = rand(2, s.max), b = rand(1, a), c = a - b;
      return hint(rand(0, 1)
        ? numQ('isi', `${a} − □ = ${c}`, `${a} kurang berapa sama dengan ${c}?`, b, [], 1)
        : numQ('isi', `□ − ${b} = ${c}`, `Berapa kurang ${b} sama dengan ${c}?`, a, [], 1), a <= 20 && (() => V().hintSub(a, b, c)));
    },
    /** Menghitung gambar benda */
    hitung(s) {
      const n = rand(1, Math.min(10, s.max || 10)), item = pick([['apple', 'apel'], ['star', 'bintang']]);
      return hint(numQ('hitung', 'Ada berapa?', `Ada berapa ${item[1]}?`, n, [], 1, V().count(item[0], n)), () => V().hintCount(item[0], n));
    },
    /** Membandingkan dua bilangan dengan > < = */
    banding(s) {
      const a = rand(0, s.max), b = rand(0, 3) === 0 ? a : rand(0, s.max);
      const ans = a > b ? '>' : a < b ? '<' : '=';
      return hint({kind: 'banding', text: `${a} ○ ${b}`, speak: `${a} dan ${b}. Pilih tanda yang benar.`, ans, cols: 3,
              choices: ['<', '=', '>'].map(v => ({v, html: v}))}, // urutan tetap agar mudah diingat
              Math.max(a, b) <= 20 && (() => V().hintCompare(a, b, ans)));
    },
    /** Mengenal bangun datar & ruang */
    bentuk() {
      const flat = ['lingkaran', 'segitiga', 'persegi', 'persegiPanjang'], solid = ['kubus', 'bola', 'tabung', 'kerucut'];
      const group = pick([flat, solid, [...flat, ...solid]]);
      const opts = shuffle(group.slice()).slice(0, 4), ans = pick(opts), name = V().SHAPES[ans].name;
      return {kind: 'bentuk', text: `Mana ${name}?`, speak: `Mana yang ${name}?`, ans, cols: 2,
              choices: opts.map(v => ({v, html: V().shape(v)}))};
    },
    /** Melanjutkan pola warna/bentuk */
    pola() {
      const tokens = shuffle(Object.keys(V().COLORS).flatMap(c => ['lingkaran', 'kotak', 'segitiga'].map(sh => `${c}-${sh}`)));
      const unit = pick(['AB', 'ABC', 'AAB', 'ABB']);
      const map = {A: tokens[0], B: tokens[1], C: tokens[2]};
      const seq = [];
      for (let i = 0; i < 6; i++) seq.push(map[unit[i % unit.length]]);
      const ans = seq[5];
      // Pengecoh: token lain dari pola itu sendiri dulu (paling masuk akal), lalu token acak
      const distract = [...new Set([map.A, map.B, map.C])].filter(t => t !== ans);
      const rest = tokens.filter(t => t !== ans && !distract.includes(t));
      const opts = shuffle([ans, ...[...distract, ...rest].slice(0, 3)]);
      return {kind: 'pola', text: 'Apa berikutnya?', speak: 'Gambar apa yang berikutnya?', view: V().patternRow(seq.slice(0, 5)),
              ans, cols: 2, choices: opts.map(v => ({v, html: V().token(v)}))};
    },
    /** Membandingkan panjang dua pensil */
    panjang() {
      const la = rand(3, 10);
      let lb; do { lb = rand(3, 10); } while (lb === la);
      const long = rand(0, 1), word = long ? 'panjang' : 'pendek';
      const ans = (la > lb) === Boolean(long) ? 'A' : 'B';
      return {kind: 'panjang', text: `Mana lebih ${word}?`, speak: `Mana pensil yang lebih ${word}?`, view: V().pencils(la, lb),
              ans, cols: 2, choices: ['A', 'B'].map(v => ({v, html: v}))};
    },
    /** Mengukur panjang dengan satuan kotak */
    ukur() {
      const n = rand(2, 9);
      return hint(numQ('ukur', 'Panjang berapa kotak?', 'Pensil ini panjangnya berapa kotak?', n, [], 1, V().ruler(n)), () => V().hintRuler(n));
    },
    /** Puluhan & satuan: ikatan 10 lidi + lidi lepas */
    puluhan() {
      const t = rand(1, 9), o = rand(0, 9), n = t * 10 + o;
      const swap = o * 10 + t; // kesalahan umum: puluhan & satuan tertukar
      return hint(numQ('puluhan', 'Ada berapa lidi?', 'Satu ikat isinya 10 lidi. Ada berapa lidi semuanya?', n,
                  [swap, n + 10, n - 10].filter(v => v !== n), 1, V().lidi(t, o)), () => V().hintTens(t, o));
    },
    /** Urutan bilangan: sesudah, sebelum, di antara */
    urutan(s) {
      const n = rand(2, Math.min(99, s.max) - 1), type = rand(0, 2);
      const line = ans => () => V().hintLine(n, ans);
      if (type === 0) return hint(numQ('urutan', `${n}, ?`, `Bilangan sesudah ${n} adalah?`, n + 1, [n + 10, n - 1]), line(n + 1));
      if (type === 1) return hint(numQ('urutan', `?, ${n}`, `Bilangan sebelum ${n} adalah?`, n - 1, [n - 10, n + 1].filter(v => v >= 0)), line(n - 1));
      return hint(numQ('urutan', `${n - 1}, ?, ${n + 1}`, `Bilangan di antara ${n - 1} dan ${n + 1} adalah?`, n, [n + 10, n - 10].filter(v => v >= 0)), line(n));
    }
  };

  /** Membuat satu soal dari spesifikasi { kinds[], max, mulA?, mulB? }. */
  /** Buat soal; q.time = pengali waktu jenisnya (balance.js think.time), q.think = soal pikir (tanpa buru-buru). */
  const make = spec => {
    const q = GEN[pick(spec.kinds)](spec), T = MQ.Balance && MQ.Balance.think;
    q.time = (T && T.time[q.kind]) || 1;
    q.think = !!T && q.time >= T.from;
    return q;
  };

  /** Nama jenis soal untuk tampilan (statistik kemampuan). */
  const NAMES = {tambah: 'Tambah +', kurang: 'Kurang −', kali: 'Kali ×', isi: 'Isi kosong', hitung: 'Menghitung', banding: 'Bandingkan',
                 bentuk: 'Bentuk', pola: 'Pola', panjang: 'Panjang', ukur: 'Mengukur', puluhan: 'Puluhan', urutan: 'Urutan'};

  return {make, GEN, NAMES, maxFor, specForLevel, nearChoices};
})();
