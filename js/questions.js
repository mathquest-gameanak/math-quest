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
    },
    /** Pasangan bilangan: 7 dipecah jadi 3 dan □, atau "berapa lagi supaya jadi 10" (bingkai sepuluh). */
    pasangan(s) {
      const M = Math.max(5, Math.min(10, s.max || 10));
      if (M >= 10 && rand(0, 2) === 0) {
        const n = rand(1, 9);
        return hint(numQ('pasangan', 'Berapa lagi jadi 10?', `Ada ${n}. Berapa lagi supaya jadi sepuluh?`, 10 - n, [n], 0, V().tenFrame(n)),
                    () => V().hintTen(n));
      }
      const w = rand(3, M), a = rand(1, w - 1), b = w - a, left = rand(0, 1);
      const q = numQ('pasangan', 'Pasangan bilangan', `${w} dipecah jadi ${left ? a : b} dan berapa?`, left ? b : a, [w], 0,
                     left ? V().bond(w, a, '?') : V().bond(w, '?', b));
      return hint(q, () => V().hintBond(w, a, b));
    },
    /** Soal cerita pendek bertokoh (dibacakan otomatis). Petunjuk = model batang. */
    cerita(s) {
      const M = Math.max(5, Math.min(20, s.max || 10));
      const who = pick(PEOPLE), oth = pick(PEOPLE.filter(p => p !== who)), it = pick(THINGS), A = who.n, B = oth.n, X = it.n;
      const P = (n, l, c) => ({n, label: l, c}), Y = '#ffcd75', C = '#73eff7';
      const type = pick(['gabung', 'gabung', 'sisa', 'sisa', 'dua', 'beda', 'ubah']);
      let text, ans, hf, extra = [];
      if (type === 'gabung' || type === 'dua' || type === 'ubah') {
        const c = rand(3, M), a = rand(1, c - 1), b = c - a;
        if (type === 'gabung') {
          text = `${A} punya ${a} ${X}. ${B} memberi ${b} ${X} lagi. Berapa ${X} ${A} sekarang?`; ans = c; extra = [a, b];
          hf = () => V().hintBar([P(a, a, Y), P(b, b, C)], `semua = ${c}`, `${a} + ${b} = ${c}`);
        } else if (type === 'dua') {
          text = `${A} punya ${a} ${X}. ${B} punya ${b} ${X}. Berapa ${X} mereka semuanya?`; ans = c; extra = [a, b];
          hf = () => V().hintBar([P(a, A, Y), P(b, B, C)], `semua = ${c}`, `${a} + ${b} = ${c}`);
        } else {
          text = `${A} punya ${a} ${X}. ${B} memberi lagi. Sekarang ada ${c} ${X}. Berapa ${X} dari ${B}?`; ans = b; extra = [c, a];
          hf = () => V().hintBar([P(a, a, Y), P(b, b, C)], `semua = ${c}`, `${c} − ${a} = ${b}`);
        }
      } else if (type === 'sisa') {
        const a = rand(3, M), b = rand(1, a - 1), c = a - b;
        text = `${A} punya ${a} ${X}. ${b} ${X} ${it.gone}. Berapa sisa ${X} ${A}?`; ans = c; extra = [a, a + b];
        hf = () => V().hintBar([P(c, c, Y), P(b, b, '#566c86')], `mula-mula = ${a}`, `${a} − ${b} = ${c}`);
      } else {
        const a = rand(3, M), b = rand(1, a - 1), d = a - b;
        text = `${A} punya ${a} ${X}. ${B} punya ${b} ${X}. Berapa lebih banyak ${X} ${A}?`; ans = d; extra = [a + b, a];
        hf = () => V().hintBar2(a, b, A, B, `${a} − ${b} = ${d}`);
      }
      const q = numQ('cerita', text, text, ans, extra, 0, V().story(who.id, it.s));
      q.story = true;
      return hint(q, hf);
    }
  };
  /** Teka-teki Peti (tanpa waktu): bilangan misteri, kotak kembar, pola loncat, mundur, cerita dua langkah. */
  GEN.teka = s => {
    const M = Math.max(10, Math.min(20, s.max || 10)), type = pick(['misteri', 'lebih', 'kembar', 'tiga', 'loncat', 'mundur', 'dua']);
    const q = (text, speak, ans, extra, hf, story) => { const r = hint(numQ('teka', text, speak, ans, extra, 0), hf); r.story = !!story; return r; };
    if (type === 'misteri') {
      const n = rand(2, M - 1);
      return q(`Aku lebih dari ${n - 1} dan kurang dari ${n + 1}. Siapa aku?`, `Aku lebih dari ${n - 1} dan kurang dari ${n + 1}. Siapa aku?`, n, [n - 1, n + 1],
               () => V().hintLine(n, n), true);
    }
    if (type === 'lebih') {
      const a = rand(1, M - 3), d = rand(1, 3), up = rand(0, 1);
      return up ? q(`Aku ${d} lebih banyak dari ${a}. Siapa aku?`, `Aku ${d} lebih banyak dari ${a}. Siapa aku?`, a + d, [a, a - d].filter(v => v >= 0),
                    () => V().hintNote(`${a} + ${d} = ${a + d}`), true)
                : q(`Aku ${d} lebih sedikit dari ${a + d}. Siapa aku?`, `Aku ${d} lebih sedikit dari ${a + d}. Siapa aku?`, a, [a + d, a + d + d],
                    () => V().hintNote(`${a + d} − ${d} = ${a}`), true);
    }
    if (type === 'kembar' || type === 'tiga') {
      const k = type === 'kembar' ? 2 : 3, x = rand(1, Math.floor(M / k)), sum = k * x;
      return q(`${Array(k).fill('□').join(' + ')} = ${sum}. Kotaknya sama. □ = ?`,
               `${Array(k).fill('kotak').join(' tambah ')} sama dengan ${sum}. Isi kotaknya sama. Berapa isi satu kotak?`,
               x, [sum, x + 1, x - 1].filter(v => v >= 0), () => V().hintEqual(k, x));
    }
    if (type === 'loncat') {
      const step = M >= 20 ? pick([2, 2, 5]) : 2, start = step === 5 ? 0 : rand(0, Math.max(0, (M - 8) / 2)) * 2;
      const seq = [0, 1, 2, 3].map(i => start + step * (i + (step === 5 ? 1 : 0))), ans = seq[3] + step;
      return q(`${seq.join(', ')}, ?`, `Lanjutkan pola bilangan: ${seq.join(', ')}. Berapa berikutnya?`, ans, [seq[3] + 1, ans + step],
               () => V().hintSeq(seq, ans, `Setiap kali loncat +${step}`));
    }
    if (type === 'mundur') {
      const a = rand(5, M), seq = [a, a - 1, a - 2], ans = a - 3;
      return q(`${seq.join(', ')}, ?`, `Lanjutkan: ${seq.join(', ')}. Berapa berikutnya?`, ans, [a - 1, a + 1],
               () => V().hintSeq(seq, ans, 'Setiap kali mundur −1'));
    }
    const who = pick(PEOPLE), it = pick(THINGS), a = rand(2, M - 2), b = rand(1, M - a), c = rand(1, a + b - 1), r = a + b - c;
    const text = `${who.n} punya ${a} ${it.n}. Dapat ${b} lagi, lalu ${c} ${it.gone}. Berapa sisanya?`;
    return q(text, text, r, [a + b, a + b + c, a - c].filter(v => v >= 0), () => V().hintNote(`${a} + ${b} = ${a + b}, lalu ${a + b} − ${c} = ${r}`), true);
  };
  /** Tokoh & benda untuk soal cerita (id = gambar MQ.Pix / MQ.Sprites). */
  const PEOPLE = [{id: 'kiki', n: 'Kiki'}, {id: 'momo', n: 'Momo'}, {id: 'kakek', n: 'Kakek'}, {id: 'kapten', n: 'Kapten'}];
  const THINGS = [{s: 'apple', n: 'apel', gone: 'dimakan'}, {s: 'star', n: 'bintang', gone: 'terbang'},
                  {s: 'coin', n: 'koin', gone: 'dipakai jajan'}, {s: 'rock', n: 'batu', gone: 'jatuh ke sungai'},
                  {s: 'cap', n: 'jamur', gone: 'dimasak'}, {s: 'potion', n: 'ramuan', gone: 'diminum'}];

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
                 bentuk: 'Bentuk', pola: 'Pola', panjang: 'Panjang', ukur: 'Mengukur', puluhan: 'Puluhan', urutan: 'Urutan',
                 pasangan: 'Pasangan bilangan', cerita: 'Soal cerita', teka: 'Teka-teki'};

  return {make, GEN, NAMES, maxFor, specForLevel, nearChoices};
})();
