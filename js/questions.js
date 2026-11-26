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
    if (mode === 'seribu') return {kinds: ['ratusan', 'nilai', 'lompat', 'banding', 'urutan'], max: 1000}; // Kelas 2 Bab 1
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
      if (rand(0, 9) === 0) { const a = rand(1, Math.min(10, s.max)), z = rand(0, 1); // penjumlahan dengan nol (Bab 2E)
        return hint(numQ('tambah', z ? `${a} + 0 = ?` : `0 + ${a} = ?`, z ? `${a} tambah nol sama dengan berapa?` : `nol tambah ${a} sama dengan berapa?`, a, [0, a + 1]),
                    () => V().hintNote(`Ditambah 0 = tidak bertambah. Tetap ${a}.`)); }
      const c = rand(2, s.max), a = rand(1, c - 1), b = c - a;
      const make10 = c > 10 && c <= 20 && a < 10 && b < 10; // melewati 10: strategi "buat 10"
      return hint(numQ('tambah', `${a} + ${b} = ?`, `${a} tambah ${b} sama dengan berapa?`, c, c >= 20 ? [c + 10, c - 10] : []),
                  c <= 20 && (() => (make10 ? V().hintMake10(Math.max(a, b), Math.min(a, b)) : V().hintAdd(a, b, c))));
    },
    kurang(s) {
      if (rand(0, 9) === 0) { const a = rand(1, Math.min(10, s.max)); // pengurangan dengan nol (Bab 3D)
        return hint(numQ('kurang', `${a} − 0 = ?`, `${a} kurang nol sama dengan berapa?`, a, [0, a - 1]),
                    () => V().hintNote(`Dikurangi 0 = tidak ada yang diambil. Tetap ${a}.`)); }
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
    puluhan(s = {}) {
      const small = (s.max || 100) <= 20, t = small ? (rand(0, 9) ? 1 : 2) : rand(1, 9), o = small && t === 2 ? 0 : rand(0, 9), n = t * 10 + o;
      const swap = o * 10 + t; // kesalahan umum: puluhan & satuan tertukar
      return hint(numQ('puluhan', 'Ada berapa lidi?', 'Satu ikat isinya 10 lidi. Ada berapa lidi semuanya?', n,
                  [swap, n + 10, n - 10].filter(v => v !== n), 1, V().lidi(t, o)), () => V().hintTens(t, o));
    },
    /** Urutan bilangan: sesudah, sebelum, di antara */
    urutan(s) {
      const n = rand(2, Math.min(s.max > 100 ? 999 : 99, s.max) - 1), type = rand(0, 2);
      const line = ans => (n > 100 ? false : () => V().hintLine(n, ans));
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

  /* ===== Jenis soal baru 2026-11-26: mengikuti buku Matematika Kelas 1 (Kurikulum Merdeka) + strategi ala Singapura ===== */
  /** Pilihan jawaban berupa teks/gambar (bukan angka): opts = [{v, html}], ans = v yang benar. */
  const optQ = (kind, text, speak, ans, opts, view, cols = 2) => ({kind, text, speak, view, ans: String(ans), cols,
    choices: shuffle(opts.slice()).map(o => ({v: String(o.v), html: o.html}))});
  const QMON = ['jamur', 'kelelawar', 'kepiting', 'lendirBatu', 'hantuKertas', 'jamurUngu', 'lendirLaut'];
  const MON_NAME = {jamur: 'Jamur', kelelawar: 'Kelelawar', kepiting: 'Kepiting', lendirBatu: 'Lendir Batu', hantuKertas: 'Hantu', jamurUngu: 'Jamur Ungu', lendirLaut: 'Lendir Laut'};
  const FR = ['apel', 'jeruk', 'pisang', 'anggur'];

  /** Bab 1D — bilangan urutan: "yang ke-berapa dari bendera?" / "siapa yang ke-3?" */
  GEN.posisi = () => {
    const ids = shuffle(QMON.slice()).slice(0, 5), k = rand(0, 4), who = ids[k], img = id => `<img class="ansPic" src="${MQ.Pix.url(id, 3)}" alt="">`;
    const h = () => V().hintNote('Hitung dari bendera 🚩: pertama, kedua, ketiga, ...') + V().queue(ids, true);
    if (rand(0, 1)) {
      const ans = k + 1, opts = shuffle([1, 2, 3, 4, 5].filter(v => v !== ans)).slice(0, 3).concat(ans);
      return hint(optQ('posisi', `${MON_NAME[who]} urutan ke berapa?`, `Dihitung dari bendera, ${MON_NAME[who]} ada di urutan ke berapa?`,
        ans, opts.map(v => ({v, html: `ke-${v}`})), V().queue(ids)), h);
    }
    return hint(optQ('posisi', `Siapa yang ke-${k + 1}?`, `Dihitung dari bendera, siapa yang ada di urutan ke-${k + 1}?`, who,
      shuffle(ids.filter(x => x !== who)).slice(0, 3).concat(who).map(v => ({v, html: img(v)})), V().queue(ids)), h);
  };
  /** Bab 2D — penjumlahan berulang: 3 kelompok isi 2 → 2 + 2 + 2. */
  GEN.berulang = s => {
    const M = s.max || 10, k = rand(2, 4), n = rand(2, Math.max(2, Math.min(5, Math.floor(M / k)))), c = k * n;
    return hint(numQ('berulang', Array(k).fill(n).join(' + ') + ' = ?', `Ada ${k} kelompok, tiap kelompok ${n}. Semuanya berapa?`, c,
      [c + n, c - n, k + n], 1, V().groups(k, n)),
      () => V().hintSeq(Array.from({length: k - 1}, (_, i) => n * (i + 1)), c, `Hitung loncat ${n}-${n}: ${Array.from({length: k}, (_, i) => n * (i + 1)).join(', ')}`));
  };
  /** Bab 3E — hubungan penjumlahan & pengurangan (keluarga fakta). */
  GEN.keluarga = s => {
    const M = Math.max(5, Math.min(20, s.max || 10)), c = rand(3, M), a = rand(1, c - 1), b = c - a, t = rand(0, 2);
    const q = t === 0 ? numQ('keluarga', `${a} + ${b} = ${c}\n${c} − ${b} = ?`, `${a} tambah ${b} sama dengan ${c}. Jadi ${c} kurang ${b} sama dengan berapa?`, a, [b, c], 0, V().bond(c, a, b))
      : t === 1 ? numQ('keluarga', `${a} + ${b} = ${c}\n${c} − ${a} = ?`, `${a} tambah ${b} sama dengan ${c}. Jadi ${c} kurang ${a} sama dengan berapa?`, b, [a, c], 0, V().bond(c, a, b))
      : numQ('keluarga', `${c} − ${a} = ${b}\n${b} + ${a} = ?`, `${c} kurang ${a} sama dengan ${b}. Jadi ${b} tambah ${a} sama dengan berapa?`, c, [a, b], 0, V().bond(c, a, b));
    q.text = q.text.replace('\n', '  →  ');
    return hint(q, () => V().hintBond(c, a, b));
  };
  /** Bab 4B — mengelompokkan benda menurut bentuk: mana yang berbeda / ada berapa segitiga. */
  GEN.kelompok = () => {
    const flat = ['lingkaran', 'segitiga', 'persegi', 'persegiPanjang'], cols = ['#e43b44', '#ffcd75', '#41a6f6', '#38b764', '#b06fd0', '#ef7d57'];
    if (rand(0, 1)) {
      const same = pick(flat), odd = pick(flat.filter(x => x !== same)), c = shuffle(cols.slice());
      const opts = [0, 1, 2].map(i => ({v: 's' + i, html: V().shapeC(same, c[i])})).concat({v: 'odd', html: V().shapeC(odd, c[3])});
      return hint(optQ('kelompok', 'Mana yang bentuknya beda?', 'Mana yang bentuknya berbeda dari yang lain?', 'odd', opts),
        () => V().hintNote(`Tiga yang lain ${V().SHAPES[same].name}. Yang beda: ${V().SHAPES[odd].name}.`));
    }
    const target = pick(flat), n = rand(1, 4), list = [];
    for (let i = 0; i < n; i++) list.push([target, pick(cols)]);
    while (list.length < 7) list.push([pick(flat.filter(x => x !== target)), pick(cols)]);
    const name = V().SHAPES[target].name;
    return hint(numQ('kelompok', `Ada berapa ${name}?`, `Ada berapa ${name}? Warnanya boleh berbeda.`, n, [], 0, V().shapeRow(shuffle(list))),
      () => V().hintNote(`Cari bentuk ${name} saja, warnanya tidak penting. Ada ${n}.`));
  };
  /** Bab 4C — mengurai & menyusun bangun datar. */
  GEN.susun = () => {
    const t = rand(0, 2);
    if (t === 2) {
      const tt = rand(0, 1), ans = tt ? 'persegi' : 'persegiPanjang';
      const opts = ['persegi', 'persegiPanjang', 'lingkaran', 'segitiga'].map(v => ({v, html: V().shape(v)}));
      return hint(optQ('susun', tt ? '2 segitiga disusun jadi?' : '2 persegi disusun jadi?', tt ? 'Dua segitiga ini disusun menjadi bangun apa?' : 'Dua persegi ini disusun berdampingan menjadi bangun apa?',
        ans, opts, V().pieces(tt ? 'tt' : 'ss')), () => V().hintNote(tt ? 'Dua segitiga siku-siku yang ditempel jadi PERSEGI.' : 'Dua persegi berdampingan jadi PERSEGI PANJANG.'));
    }
    const kinds = [['sq2t', 'segitiga', 2], ['sq4t', 'segitiga', 4], ['tri4t', 'segitiga', 4], ['rect2s', 'persegi', 2], ['sq4s', 'persegi', 4], ['rect3s', 'persegi', 3]];
    const [k, name, n] = pick(kinds);
    return hint(numQ('susun', `Ada berapa ${name} kecil?`, `Bangun ini disusun dari ${name} kecil. Ada berapa?`, n, [], 1, V().split(k)),
      () => V().hintNote(`Hitung tiap warna: ada ${n} ${name}.`));
  };
  /** Bab 5 — bilangan 11–20 & nilai tempat (1 puluhan + satuan), ala Singapura: 14 = 10 dan 4. */
  GEN.belasan = () => {
    const n = rand(11, 20), o = n - 10, t = rand(0, 3);
    const h = () => V().hintNote(`${n} = 10 dan ${o} (1 puluhan, ${o} satuan)`);
    if (t === 0) return hint(numQ('belasan', 'Ada berapa titik?', 'Satu bingkai penuh isinya sepuluh. Ada berapa titik semuanya?', n, [o, n + 1, n - 1], 1, V().tens20(n)), h);
    if (t === 1) return hint(numQ('belasan', `1 puluhan dan ${o} satuan = ?`, `Satu puluhan dan ${o} satuan sama dengan berapa?`, n, [o + 1, 10 + o + 1, o], 1), h);
    if (t === 2) return hint(numQ('belasan', `${n} = 10 dan ?`, `${n} dipecah jadi sepuluh dan berapa?`, o, [n, o + 1], 0, V().bond(n, 10, '?')), h);
    return hint(optQ('belasan', `Angka 1 pada ${n} bernilai?`, `Pada bilangan ${n}, angka satu di depan bernilai berapa?`, 10,
      [1, 10, o || 2, n].filter((v, i, a) => a.indexOf(v) === i).map(v => ({v, html: String(v)}))), h);
  };
  /** Strategi dobel & hampir dobel: 6 + 6 = 12 → 6 + 7 = 13. */
  GEN.dobel = s => {
    const M = Math.max(10, s.max || 20), a = rand(2, Math.floor(M / 2) - (M >= 20 ? 1 : 0)), near = rand(0, 1) && 2 * a + 1 <= M;
    const b = near ? a + 1 : a, c = a + b;
    return hint(numQ('dobel', near ? `${a} + ${a} = ${2 * a}  →  ${a} + ${b} = ?` : `${a} + ${a} = ?`,
      near ? `${a} tambah ${a} sama dengan ${2 * a}. Jadi ${a} tambah ${b} sama dengan berapa?` : `${a} tambah ${a} sama dengan berapa? Ini dobel!`, c, [2 * a, c + 1], 0),
      () => V().hintNote(near ? `Dobel ${a} + ${a} = ${2 * a}, tambah 1 lagi → ${c}` : `Dobel: ${a} dan ${a} → ${c}`));
  };
  /** Bab 8 — diagram gambar: membaca, paling banyak/sedikit, selisih. */
  GEN.data = () => {
    const kinds = shuffle(FR.slice()).slice(0, 3);
    let counts; do { counts = kinds.map(() => rand(1, 6)); } while (new Set(counts).size < 3);
    const data = kinds.map((k, i) => [k, counts[i]]), view = V().picto(data), t = rand(0, 3), N = id => V().FRUITS[id].n;
    const h = () => V().hintNote(data.map(([k, n]) => `${N(k)} ${n}`).join(' · '));
    const fopts = () => kinds.map(v => ({v, html: `<span class="ansFruit">${V().fruit(v)}</span>`}));
    if (t === 0) { const [k, n] = pick(data); return hint(numQ('data', `Ada berapa ${N(k)}?`, `Lihat diagram gambar. Ada berapa ${N(k)}?`, n, [], 1, view), h); }
    if (t === 1) { const k = data.reduce((m, d) => (d[1] > m[1] ? d : m))[0]; return hint(optQ('data', 'Buah apa paling banyak?', 'Buah apa yang paling banyak?', k, fopts(), view, 3), h); }
    if (t === 2) { const k = data.reduce((m, d) => (d[1] < m[1] ? d : m))[0]; return hint(optQ('data', 'Buah apa paling sedikit?', 'Buah apa yang paling sedikit?', k, fopts(), view, 3), h); }
    const [x, y] = shuffle(data.slice()).slice(0, 2).sort((p, q) => q[1] - p[1]);
    return hint(numQ('data', `${N(x[0])} lebih banyak berapa dari ${N(y[0])}?`, `Berapa lebih banyak ${N(x[0])} daripada ${N(y[0])}?`, x[1] - y[1], [x[1], y[1], x[1] + y[1]], 0, view),
      () => V().hintNote(`${N(x[0])} ${x[1]}, ${N(y[0])} ${y[1]} → ${x[1]} − ${y[1]} = ${x[1] - y[1]}`));
  };
  /** Bab 8 — tabel turus: membaca turus. */
  GEN.turus = () => {
    if (rand(0, 1)) {
      const n = rand(2, 12);
      return hint(numQ('turus', 'Turus ini berapa?', 'Satu ikat turus isinya lima. Turus ini menunjukkan berapa?', n, [n + 1, n - 1, n + 5], 1, V().tally(n)),
        () => V().hintNote(`Satu ikat turus = 5. ${Math.floor(n / 5)} ikat dan ${n % 5} garis → ${n}`));
    }
    const kinds = shuffle(FR.slice()).slice(0, 3), data = kinds.map(k => [k, rand(1, 9)]), [k, n] = pick(data), N = V().FRUITS[k].n;
    return hint(numQ('turus', `Berapa ${N} di tabel?`, `Lihat tabel turus. Ada berapa ${N}?`, n, [n + 1, n - 1, n + 5], 1, V().tallyTable(data)),
      () => V().hintNote(`Satu ikat turus = 5. ${N}: ${n}`));
  };

  /* ===== KELAS 2 — Bab 1: Bilangan sampai 1.000 ===== */
  /** Ratusan, puluhan, satuan → bilangan (blok 100 / 10 / 1). */
  GEN.ratusan = () => {
    const r = rand(1, 9), p = rand(0, 9), s = rand(0, 9), n = r * 100 + p * 10 + s;
    const salah = [r * 100 + s * 10 + p, r * 10 + p + s, n + 100, n - 10].filter(v => v !== n && v > 0);
    return hint(numQ('ratusan', `${r} ratusan, ${p} puluhan, ${s} satuan`, `${r} ratusan, ${p} puluhan, dan ${s} satuan. Bilangan berapa?`, n, salah, 1),
      () => V().hintNote(`${r} ratusan = ${r * 100}, ${p} puluhan = ${p * 10}, ${s} satuan = ${s}. Jadi ${r * 100} + ${p * 10} + ${s} = ${n}`));
  };
  /** Nilai tempat: angka yang diberi tanda bernilai berapa? */
  GEN.nilai = () => {
    let r = rand(1, 9), p = rand(1, 9), s = rand(1, 9);
    while (p === r) p = rand(1, 9);
    while (s === r || s === p) s = rand(1, 9);
    const n = r * 100 + p * 10 + s, pos = rand(0, 2), d = [r, p, s][pos], ans = d * [100, 10, 1][pos];
    const nama = ['ratusan', 'puluhan', 'satuan'][pos]; // angka dibuat berbeda semua, jadi tidak ambigu
    const choices = shuffle([d, d * 10, d * 100, n].filter((v, i, a) => a.indexOf(v) === i)).map(v => ({v: String(v), html: String(v)}));
    return hint({kind: 'nilai', text: `Angka ${d} pada ${n} bernilai?`, speak: `Pada bilangan ${n}, angka ${d} bernilai berapa?`, ans: String(ans), choices, cols: 2},
      () => V().hintNote(`Angka ${d} ada di tempat ${nama}, jadi nilainya ${ans}.`));
  };
  /** Loncat 10 atau 100 (maju/mundur) sampai 1.000. */
  GEN.lompat = s => {
    const step = pick([10, 100, 10, 5, 2]), back = rand(0, 2) === 0, max = s.max || 1000;
    const a = step === 100 ? rand(1, 5) * 100 + pick([0, 0, rand(1, 9) * 10]) : rand(10, Math.floor((max - 5 * step) / step)) * step;
    const seq = [0, 1, 2].map(i => (back ? a + (3 - i) * step : a + i * step)), ans = back ? a : a + 3 * step;
    return hint(numQ('lompat', `${seq.join(', ')}, ?`, `Lanjutkan: ${seq.join(', ')}, lalu berapa?`, ans, [ans + (back ? step : -step), ans + 1, ans - 1], 0),
      () => V().hintSeq(seq, ans, `Setiap kali ${back ? 'mundur −' : 'loncat +'}${step}`));
  };

  /* ===== KELAS 2 — Bab 2: Cara berhitung & penjumlahan bersusun ===== */
  /** Susunan bersusun (angka rata kanan) untuk gambar soal & petunjuk. */
  const susunView = (a, b, op, ans = '?') => `<div class="susun"><span></span><span>${a}</span><span>${op}</span><span>${b}</span>` +
    `<i></i><span></span><span>${ans}</span></div>`;
  /** Penjumlahan bersusun 2 angka (kadang 3 angka), sebagian dengan menyimpan. */
  GEN.bersusun = s => {
    const big = (s.max || 100) > 100 && rand(0, 2) === 0;
    let a, b;
    do { a = big ? rand(100, 600) : rand(11, 79); b = big ? rand(10, 300) : rand(11, 99 - a); } while (a + b > (big ? 999 : 99) || b < 10);
    const c = a + b, carry = (a % 10) + (b % 10) >= 10, lupa = carry ? c - 10 : c + 10; // lupa menyimpan: kesalahan umum
    const sa = a % 10, sb = b % 10, pa = Math.floor(a / 10) % 10, pb = Math.floor(b / 10) % 10;
    return hint(numQ('bersusun', `${a} + ${b} = ?`, `${a} ditambah ${b}. Hitung bersusun, mulai dari satuan.`, c, [lupa], 0, susunView(a, b, '+')),
      () => V().hintNote(`Satuan dulu: ${sa} + ${sb} = ${sa + sb}` + (carry ? `, tulis ${(sa + sb) % 10} simpan 1.` : '.') +
        ` Puluhan: ${pa} + ${pb}${carry ? ' + 1' : ''} = ${pa + pb + (carry ? 1 : 0)}. Jadi ${c}.`));
  };
  /** Cara berhitung cepat: tambah puluhan, tambah 9 (= +10 −1), atau buat puluhan genap. */
  GEN.hitungCepat = () => {
    const t = rand(0, 2);
    if (t === 0) { const a = rand(12, 69), p = rand(1, 3) * 10, c = a + p;
      return hint(numQ('hitungCepat', `${a} + ${p} = ?`, `${a} tambah ${p}. Cukup tambah puluhannya!`, c, [a + p / 10, c + 1]), () => V().hintNote(`Tambah ${p / 10} puluhan: ${a} → ${c}. Satuannya tetap ${a % 10}.`)); }
    if (t === 1) { const a = rand(15, 80), c = a + 9;
      return hint(numQ('hitungCepat', `${a} + 9 = ?`, `${a} tambah 9. Tambah 10 lalu kurang 1.`, c, [a + 10, a + 8]), () => V().hintNote(`${a} + 10 = ${a + 10}, lalu kurang 1 = ${c}.`)); }
    const p = rand(2, 7) * 10 + rand(1, 9), q = 10 - (p % 10), c = p + q + rand(1, 2) * 10, b = c - p;
    return hint(numQ('hitungCepat', `${p} + ${b} = ?`, `${p} tambah ${b}. Coba genapkan ke puluhan dulu.`, c, [c - 10, c + 10]),
      () => V().hintNote(`${p} + ${q} = ${p + q} (genap puluhan), lalu + ${b - q} = ${c}.`));
  };

  /* ===== KELAS 2 — Bab 3: Pengurangan bersusun ===== */
  /** Pengurangan bersusun 2 angka, sebagian dengan meminjam. */
  GEN.kurangSusun = () => {
    let a, b;
    do { a = rand(30, 99); b = rand(11, a - 5); } while (b < 10);
    const c = a - b, pinjam = a % 10 < b % 10;
    const salah = pinjam ? [Math.abs((a % 10) - (b % 10)) + (Math.floor(a / 10) - Math.floor(b / 10)) * 10, c + 10] : [c + 10, c - 10]; // lupa meminjam: satuan dibalik
    const sa = a % 10, sb = b % 10, pa = Math.floor(a / 10), pb = Math.floor(b / 10);
    return hint(numQ('kurangSusun', `${a} − ${b} = ?`, `${a} dikurangi ${b}. Hitung bersusun, mulai dari satuan.`, c, salah.filter(v => v >= 0 && v !== c), 0, susunView(a, b, '−')),
      () => V().hintNote(pinjam ? `Satuan ${sa} kurang dari ${sb}: pinjam 1 puluhan → ${sa + 10} − ${sb} = ${sa + 10 - sb}. Puluhan tinggal ${pa - 1} − ${pb} = ${pa - 1 - pb}. Jadi ${c}.`
                                : `Satuan: ${sa} − ${sb} = ${sa - sb}. Puluhan: ${pa} − ${pb} = ${pa - pb}. Jadi ${c}.`));
  };
  /** Mengurang cepat: kurang puluhan, kurang 9 (= −10 +1), atau mengecek dengan penjumlahan. */
  GEN.kurangCepat = () => {
    const t = rand(0, 2);
    if (t === 0) { const a = rand(35, 99), p = rand(1, Math.min(3, Math.floor(a / 10) - 1)) * 10, c = a - p;
      return hint(numQ('kurangCepat', `${a} − ${p} = ?`, `${a} kurang ${p}. Cukup kurangi puluhannya!`, c, [a - p / 10, c - 1]), () => V().hintNote(`Kurangi ${p / 10} puluhan: ${a} → ${c}. Satuannya tetap ${a % 10}.`)); }
    if (t === 1) { const a = rand(20, 90), c = a - 9;
      return hint(numQ('kurangCepat', `${a} − 9 = ?`, `${a} kurang 9. Kurangi 10 lalu tambah 1.`, c, [a - 10, a - 8]), () => V().hintNote(`${a} − 10 = ${a - 10}, lalu tambah 1 = ${c}.`)); }
    const b = rand(11, 40), c = rand(10, 50), a = b + c;
    return hint(numQ('kurangCepat', `${a} − ${b} = ${c}. Cek: ${c} + ${b} = ?`, `Untuk mengecek pengurangan, jumlahkan lagi. ${c} tambah ${b} sama dengan?`, a, [a + 10, a - 10]),
      () => V().hintNote(`Hasil + pengurang = bilangan awal: ${c} + ${b} = ${a}. Jadi pengurangannya benar.`));
  };

  /* ===== KELAS 2 — Bab 4: Panjang (cm, m) & banyaknya air (L, dL) ===== */
  /** Tanda > < = (urutan tetap agar mudah diingat). */
  const signQ = (kind, text, speak, a, b, note) => {
    const ans = a > b ? '>' : a < b ? '<' : '=';
    return hint({kind, text, speak, ans, cols: 3, choices: ['<', '=', '>'].map(v => ({v, html: v}))}, () => V().hintNote(note));
  };
  /** Panjang dalam cm & m: mengukur, 1 m = 100 cm, selisih, membandingkan. */
  GEN.cm = () => {
    const t = rand(0, 3);
    if (t === 0) { const n = rand(2, 9);
      return hint(numQ('cm', 'Berapa cm? (1 kotak = 1 cm)', 'Satu kotak panjangnya 1 sentimeter. Pensil ini panjangnya berapa sentimeter?', n, [], 1, V().ruler(n)), () => V().hintRuler(n)); }
    if (t === 1) { const m = rand(1, 3), cm = pick([0, 0, rand(1, 9) * 10]), c = m * 100 + cm;
      const text = cm ? `${m} m ${cm} cm = ? cm` : `${m} m = ? cm`;
      return hint(numQ('cm', text, `${m} meter${cm ? ` ${cm} sentimeter` : ''} sama dengan berapa sentimeter?`, c, [m * 10 + cm, m + cm, c + 100].filter(v => v !== c), 1),
        () => V().hintNote(`1 m = 100 cm. Jadi ${m} m = ${m * 100} cm${cm ? `, ditambah ${cm} cm = ${c} cm` : ''}.`)); }
    if (t === 2) { const a = rand(30, 90), b = rand(12, a - 5), c = a - b;
      return hint(numQ('cm', `Tali ${a} cm & ${b} cm. Selisih?`, `Tali merah ${a} sentimeter, tali biru ${b} sentimeter. Selisih panjangnya berapa sentimeter?`, c, [a + b, c + 10].filter(v => v !== c), 0),
        () => V().hintNote(`Selisih = yang panjang − yang pendek: ${a} − ${b} = ${c} cm.`)); }
    const m = rand(1, 2), cm = pick([m * 100, m * 100 - rand(1, 5) * 10, m * 100 + rand(1, 5) * 10]);
    return signQ('cm', `${m} m ○ ${cm} cm`, `${m} meter dan ${cm} sentimeter. Pilih tanda yang benar.`, m * 100, cm, `${m} m = ${m * 100} cm. Bandingkan ${m * 100} dengan ${cm}.`);
  };
  /** Banyaknya air dalam liter (L) & desiliter (dL): 1 L = 10 dL. */
  GEN.air = () => {
    const t = rand(0, 3);
    if (t === 0) { const l = rand(1, 5), c = l * 10;
      return hint(numQ('air', `${l} L = ? dL`, `${l} liter sama dengan berapa desiliter?`, c, [l, l * 100, c + 1], 1), () => V().hintNote(`1 L = 10 dL. Jadi ${l} L = ${c} dL.`)); }
    if (t === 1) { const l = rand(1, 4), d = rand(1, 9), c = l * 10 + d;
      return hint(numQ('air', `${l} L ${d} dL = ? dL`, `${l} liter ${d} desiliter sama dengan berapa desiliter?`, c, [l + d, l * 100 + d, c + 10], 1),
        () => V().hintNote(`${l} L = ${l * 10} dL, ditambah ${d} dL = ${c} dL.`)); }
    if (t === 2) { const a = rand(3, 9), b = rand(2, 9), plus = rand(0, 1) || a <= b, c = plus ? a + b : a - b;
      return hint(numQ('air', plus ? `Botol ${a} dL + ${b} dL = ? dL` : `Botol ${a} dL, diminum ${b} dL. Sisa?`,
        plus ? `Botol berisi ${a} desiliter dan ${b} desiliter. Jumlahnya berapa desiliter?` : `Botol berisi ${a} desiliter, diminum ${b} desiliter. Sisanya berapa desiliter?`, c, plus ? [c + 1, c - 1] : [a + b, c + 1], 0),
        () => V().hintNote(plus ? `${a} + ${b} = ${c} dL` : `${a} − ${b} = ${c} dL`)); }
    const d = pick([10, rand(6, 9), rand(11, 15)]);
    return signQ('air', `1 L ○ ${d} dL`, `1 liter dan ${d} desiliter. Pilih tanda yang benar.`, 10, d, `1 L = 10 dL. Bandingkan 10 dengan ${d}.`);
  };

  /* ===== KELAS 2 — Bab 5: Waktu, durasi & uang ===== */
  const jamTxt = (h, m) => `${h}.${String(m).padStart(2, '0')}`;
  /** Pilihan jawaban berupa teks (mis. jam "3.30" atau "Rp500"). */
  const textQ = (kind, text, speak, ans, wrong, view) =>
    ({kind, text, speak, view, ans, cols: 2, choices: shuffle([ans, ...wrong.filter((v, i, a) => v !== ans && a.indexOf(v) === i).slice(0, 3)]).map(v => ({v, html: v}))});
  /** Membaca jam: tepat, setengah, dan kelipatan 5 menit. */
  GEN.jam = () => {
    const h = rand(1, 12), m = pick([0, 0, 30, 30, 15, 45, rand(1, 11) * 5]), ans = jamTxt(h, m), h2 = h % 12 + 1;
    const wrong = [jamTxt(h, (m + 30) % 60), jamTxt(h2, m), jamTxt(m ? Math.min(12, Math.max(1, m / 5)) : h2, h * 5 % 60), jamTxt(h === 1 ? 12 : h - 1, m)];
    return hint(textQ('jam', 'Pukul berapa?', 'Lihat jamnya. Pukul berapa sekarang?', ans, wrong, V().clock(h, m)),
      () => V().hintNote(`Jarum pendek (merah) menunjuk jam ${h}. Jarum panjang (biru) di angka ${m / 5 || 12} = ${m} menit. Jadi pukul ${ans}.`));
  };
  /** Durasi: lama waktu dalam jam, 1 jam = 60 menit, waktu sesudah. */
  GEN.durasi = () => {
    const t = rand(0, 2);
    if (t === 0) { const a = rand(6, 10), d = rand(1, 4), b = a + d;
      return hint(numQ('durasi', `Pukul ${a}.00 sampai ${b}.00. Berapa jam?`, `Dari pukul ${a} sampai pukul ${b}. Lamanya berapa jam?`, d, [a + b, b], 1), () => V().hintNote(`Hitung loncat jam: ${a} → ${b}, ada ${d} jam.`)); }
    if (t === 1) { const j = rand(1, 3), c = j * 60;
      return hint(numQ('durasi', `${j} jam = ? menit`, `${j} jam sama dengan berapa menit?`, c, [j * 100, j * 10, c + 10], 1), () => V().hintNote(`1 jam = 60 menit. Jadi ${j} jam = ${c} menit.`)); }
    const h = rand(6, 10), add = pick([30, 15, 60]), m = pick([0, 15, 30].filter(x => x + add < 60 || add === 60)), tot = h * 60 + m + add, ans = jamTxt(Math.floor(tot / 60), tot % 60);
    return hint(textQ('durasi', `${add === 60 ? '1 jam' : add + ' menit'} setelah ${jamTxt(h, m)}?`, `${add === 60 ? 'Satu jam' : add + ' menit'} setelah pukul ${jamTxt(h, m)}, pukul berapa?`,
      ans, [jamTxt(h, m), jamTxt(h + 1, (m + add) % 60), jamTxt(Math.floor(tot / 60) + 1, tot % 60), jamTxt(h, (m + 10) % 60)], V().clock(h, m)),
      () => V().hintNote(`Mulai ${jamTxt(h, m)}, tambah ${add} menit → ${ans}.`));
  };
  /** Uang rupiah: menjumlah koin/uang kertas, kembalian, menukar. */
  const rp = n => 'Rp' + n.toLocaleString('id-ID');
  GEN.uang = () => {
    const t = rand(0, 2);
    if (t === 0) { const a = pick([100, 200, 500]) * rand(1, 3), b = pick([100, 200, 500, 1000]), c = a + b;
      return hint(textQ('uang', `${rp(a)} + ${rp(b)} = ?`, `${a} rupiah ditambah ${b} rupiah, jadi berapa rupiah?`, rp(c), [rp(c + 100), rp(c - 100), rp(c + 1000), rp(a * b > 9999 ? c + 500 : c + 200)]),
        () => V().hintNote(`${a} + ${b} = ${c}. Jadi ${rp(c)}.`)); }
    if (t === 1) { const bayar = pick([1000, 2000, 5000]), harga = rand(1, bayar / 100 - 1) * 100, c = bayar - harga;
      return hint(textQ('uang', `Harga ${rp(harga)}, bayar ${rp(bayar)}. Kembalian?`, `Harganya ${harga} rupiah. Kamu bayar ${bayar} rupiah. Kembaliannya berapa?`, rp(c), [rp(c + 100), rp(c - 100 || 50), rp(harga), rp(bayar + harga)]),
        () => V().hintNote(`Kembalian = uang dibayar − harga: ${bayar} − ${harga} = ${c}. Jadi ${rp(c)}.`)); }
    const [besar, kecil] = pick([[1000, 500], [1000, 100], [2000, 1000], [5000, 1000], [500, 100]]), n = besar / kecil;
    return hint(numQ('uang', `${rp(besar)} = berapa uang ${rp(kecil)}?`, `${besar} rupiah sama dengan berapa uang ${kecil} rupiah?`, n, [n * 10, n + 5].filter(v => v !== n), 1),
      () => V().hintNote(`${besar} : ${kecil} = ${n}. Jadi ${rp(besar)} = ${n} × ${rp(kecil)}.`));
  };

  /* ===== KELAS 2 — Bab 6–7: Perkalian ===== */
  const loncat = (n, k) => Array.from({length: k}, (_, i) => n * (i + 1));
  /** Arti perkalian: k kelompok berisi n = k × n (gambar kelompok), atau penjumlahan berulang → perkalian. */
  GEN.kaliArti = () => {
    const k = rand(2, 5), n = rand(2, 5), c = k * n;
    if (rand(0, 1)) return hint(numQ('kaliArti', `${k} × ${n} = ?`, `Ada ${k} kelompok, tiap kelompok ${n}. ${k} kali ${n} sama dengan berapa?`, c, [k + n, c + n, c - n], 1, V().groups(k, n)),
      () => V().hintSeq(loncat(n, k - 1), c, `${k} kelompok isi ${n}: loncat ${n}-${n}`));
    return hint(numQ('kaliArti', `${Array(k).fill(n).join(' + ')} = ? × ${n}`, `${Array(k).fill(n).join(' tambah ')}. Sama dengan berapa kali ${n}?`, k, [n, c, k + 1], 1),
      () => V().hintNote(`Angka ${n} dijumlah ${k} kali, jadi ${k} × ${n}.`));
  };
  /** Perkalian tabel: s.tabel = bilangan yang dikalikan (Peta 6: 2, 5, 3, 4; Peta 7: 6, 7, 8, 9, 1). */
  GEN.kaliTabel = s => {
    const a = pick(s.tabel || [1, 2, 3, 4, 5, 6, 7, 8, 9]), b = rand(1, 9), c = a * b, swap = rand(0, 1);
    const [x, y] = swap ? [b, a] : [a, b]; // kadang ditukar: 3 × 4 = 4 × 3
    return hint(numQ('kaliTabel', `${x} × ${y} = ?`, `${x} kali ${y} sama dengan berapa?`, c, [c + a, c - a, a + b].filter(v => v !== c), 0),
      () => V().hintSeq(loncat(a, Math.max(1, b - 1)).slice(0, b - 1), c, `Loncat ${a}-${a} sebanyak ${b} kali`));
  };
  /** Soal cerita perkalian. */
  GEN.kaliCerita = s => {
    const a = pick(s.tabel || [2, 5, 3, 4]), b = rand(2, 9), c = a * b;
    const [wadah, isi] = pick([['kotak', 'kue'], ['piring', 'apel'], ['kantong', 'kelereng'], ['vas', 'bunga'], ['mobil', 'roda']]);
    const n = wadah === 'mobil' ? 4 : a, tot = wadah === 'mobil' ? 4 * b : c;
    return hint(numQ('kaliCerita', `${b} ${wadah}, tiap ${wadah} ${n} ${isi}. Semua?`, `Ada ${b} ${wadah}. Tiap ${wadah} berisi ${n} ${isi}. Semuanya ada berapa ${isi}?`, tot, [b + n, tot + n, tot - n], 1),
      () => V().hintNote(`${b} ${wadah} × ${n} ${isi} = ${b} × ${n} = ${tot}.`));
  };

  /** Pola perkalian: tambah satu kelompok, urutan ditukar, atau mencari bilangan yang hilang. */
  GEN.kaliPola = s => {
    const a = pick(s.tabel || [6, 7, 8, 9]), b = rand(2, 8), c = a * b, t = rand(0, 2);
    if (t === 0) return hint(numQ('kaliPola', `${a} × ${b} = ${c}, maka ${a} × ${b + 1} = ?`, `${a} kali ${b} sama dengan ${c}. Jadi ${a} kali ${b + 1} sama dengan berapa?`, c + a, [c + 1, c + b, c + a + 1].filter(v => v !== c + a), 0),
      () => V().hintNote(`Kalau dikali bertambah 1, hasilnya bertambah ${a}: ${c} + ${a} = ${c + a}.`));
    if (t === 1) return hint(numQ('kaliPola', `${a} × ${b} = ${b} × ?`, `${a} kali ${b} sama dengan ${b} kali berapa?`, a, [b, c, a + 1].filter(v => v !== a), 1),
      () => V().hintNote(`Urutan perkalian boleh ditukar: ${a} × ${b} = ${b} × ${a} = ${c}.`));
    return hint(numQ('kaliPola', `? × ${a} = ${c}`, `Berapa kali ${a} sama dengan ${c}?`, b, [b + 1, b - 1, a].filter(v => v !== b && v > 0), 1),
      () => V().hintSeq(loncat(a, b - 1), c, `Loncat ${a}-${a} sampai ${c}: ada ${b} loncatan`));
  };

  /* ===== KELAS 2 — Bab 8: Segitiga, segiempat & bentuk kotak ===== */
  const SEGI = {segitiga: {n: 'Segitiga', sisi: 3}, persegi: {n: 'Persegi', sisi: 4}, persegiPanjang: {n: 'Persegi panjang', sisi: 4}};
  /** Segitiga & segiempat: banyak sisi / titik sudut, nama bangun, ciri persegi. */
  GEN.segi = () => {
    const id = pick(Object.keys(SEGI)), B = SEGI[id], t = rand(0, 3), names = ['Segitiga', 'Persegi', 'Persegi panjang', 'Lingkaran'];
    if (t === 0) return hint(numQ('segi', 'Ada berapa sisi?', 'Bangun ini punya berapa sisi?', B.sisi, [B.sisi === 3 ? 4 : 3, 5, 2], 1, V().shape(id)),
      () => V().hintNote(`Sisi = garis lurus di tepi bangun. ${B.n} punya ${B.sisi} sisi.`));
    if (t === 1) return hint(numQ('segi', 'Ada berapa titik sudut?', 'Bangun ini punya berapa titik sudut?', B.sisi, [B.sisi === 3 ? 4 : 3, 5, 2], 1, V().shape(id)),
      () => V().hintNote(`Titik sudut = pojok tempat dua sisi bertemu. ${B.n} punya ${B.sisi} titik sudut.`));
    if (t === 2) return hint(textQ('segi', 'Bangun apa ini?', 'Bangun ini namanya apa?', B.n, names, V().shape(id)),
      () => V().hintNote(B.sisi === 3 ? 'Punya 3 sisi = segitiga.' : id === 'persegi' ? '4 sisi sama panjang = persegi.' : '4 sisi, dua panjang dan dua pendek = persegi panjang.'));
    const p = rand(0, 1);
    return hint(textQ('segi', p ? '4 sisi sama panjang. Bangun apa?' : '3 sisi, 3 titik sudut. Bangun apa?', p ? 'Bangun dengan empat sisi yang sama panjang namanya apa?' : 'Bangun dengan tiga sisi dan tiga titik sudut namanya apa?',
      p ? 'Persegi' : 'Segitiga', names), () => V().hintNote(p ? 'Persegi: 4 sisi sama panjang, 4 sudut siku-siku.' : 'Segitiga: 3 sisi, 3 titik sudut.'));
  };
  /** Bentuk kotak (kubus & balok): banyak sisi, rusuk, titik sudut, bentuk sisinya. */
  GEN.kotak = () => {
    const kubus = rand(0, 1), nama = kubus ? 'Kubus' : 'Balok', t = rand(0, 3), view = kubus ? V().shape('kubus') : undefined;
    if (t === 3) return hint(textQ('kotak', `Sisi ${nama.toLowerCase()} berbentuk?`, `Sisi-sisi ${nama.toLowerCase()} berbentuk apa?`, kubus ? 'Persegi' : 'Persegi panjang', ['Persegi', 'Persegi panjang', 'Segitiga', 'Lingkaran'], view),
      () => V().hintNote(kubus ? 'Semua sisi kubus berbentuk persegi yang sama besar.' : 'Sisi balok berbentuk persegi panjang (kadang ada yang persegi).'));
    const [kata, ans] = [['sisi', 6], ['rusuk', 12], ['titik sudut', 8]][t];
    return hint(numQ('kotak', `${nama} punya berapa ${kata}?`, `${nama} punya berapa ${kata}?`, ans, [6, 8, 12, 4].filter(v => v !== ans), 1, view),
      () => V().hintNote(`${nama}: 6 sisi, 12 rusuk, 8 titik sudut. Sisi = bidang datar, rusuk = garis tepi, titik sudut = pojok.`));
  };

  /* ===== KELAS 2 — Bab 9: Bilangan sampai 10.000 & pecahan ===== */
  const ribu = n => n.toLocaleString('id-ID');
  /** Bilangan 4 angka: nilai tempat ribuan, loncat 1.000/100, membandingkan. */
  GEN.ribuan = () => {
    const t = rand(0, 3);
    if (t === 0) { const r = rand(1, 9), h = rand(0, 9), p = rand(0, 9), s = rand(0, 9), n = r * 1000 + h * 100 + p * 10 + s;
      return hint(textQ('ribuan', `${r} ribuan, ${h} ratusan, ${p} puluhan, ${s} satuan`, `${r} ribuan, ${h} ratusan, ${p} puluhan, ${s} satuan. Bilangan berapa?`, ribu(n),
        [ribu(r * 100 + h * 10 + p + s), ribu(n + 1000), ribu(r * 1000 + p * 100 + h * 10 + s), ribu(n + 100), ribu(n - 10 > 0 ? n - 10 : n + 10)]),
        () => V().hintNote(`${r} ribuan = ${ribu(r * 1000)}, ${h} ratusan = ${h * 100}, ${p} puluhan = ${p * 10}, ${s} satuan. Jadi ${ribu(n)}.`)); }
    if (t === 1) { const step = pick([1000, 100]), a = step === 1000 ? rand(1, 5) * 1000 : rand(10, 60) * 100, seq = [a, a + step, a + 2 * step], c = a + 3 * step;
      return hint(textQ('ribuan', `${seq.map(ribu).join(', ')}, ?`, `Lanjutkan: ${seq.join(', ')}, lalu berapa?`, ribu(c), [ribu(c + step), ribu(c - step), ribu(c + (step === 1000 ? 100 : 1000)), ribu(c + 10)]),
        () => V().hintNote(`Setiap kali loncat +${ribu(step)}.`)); }
    if (t === 2) { const d = rand(1, 9), pos = rand(0, 3), n = [d * 1000 + rand(1, 999), rand(1, 9) * 1000 + d * 100 + rand(0, 99), rand(1, 9) * 1000 + rand(0, 9) * 100 + d * 10 + rand(0, 9), rand(1, 9) * 1000 + rand(0, 99) * 10 + d][pos];
      const val = [1000, 100, 10, 1][pos] * d, digits = String(n);
      if (digits.split('').filter(c => c === String(d)).length > 1) return GEN.ribuan();
      return hint(textQ('ribuan', `Angka ${d} pada ${ribu(n)} bernilai?`, `Pada bilangan ${n}, angka ${d} bernilai berapa?`, ribu(val), [d, d * 10, d * 100, d * 1000].map(ribu)),
        () => V().hintNote(`Angka ${d} ada di tempat ${['ribuan', 'ratusan', 'puluhan', 'satuan'][pos]}, jadi nilainya ${ribu(val)}.`)); }
    const a = rand(1000, 9999), b = rand(0, 2) ? rand(1000, 9999) : a - (a % 1000) + rand(0, 999);
    return signQ('ribuan', `${ribu(a)} ○ ${ribu(b)}`, `${a} dan ${b}. Pilih tanda yang benar.`, a, b, 'Bandingkan dari angka paling kiri (ribuan). Kalau sama, lihat ratusan, lalu puluhan.');
  };
  /** Pecahan sederhana: membaca gambar (½, ¼, ⅓, ⅛ ...) dan "setengah/seperempat dari". */
  GEN.pecahan = () => {
    const t = rand(0, 2);
    if (t < 2) { const n = pick([2, 3, 4, 8]), k = n === 2 ? 1 : rand(1, n - 1), ans = `${k}/${n}`;
      return hint(textQ('pecahan', 'Bagian berwarna?', `Gambar dibagi ${n} bagian sama besar. Yang berwarna berapa bagian?`, ans, [`${n}/${k}`, `${k}/${n + 1}`, `1/${n === 2 ? 4 : 2}`, `${n - k}/${n}`, `${k}/${n * 2}`].filter(f => { const [x, y] = f.split('/'); return x / y !== k / n; }), V().frac(n, k)), // tanpa pecahan senilai (2/4 = 1/2)
        () => V().hintNote(`Dibagi ${n} bagian sama besar, yang berwarna ${k} bagian → ${k}/${n}.`)); }
    const [nm, n] = pick([['Setengah', 2], ['Seperempat', 4]]), x = n * rand(1, n === 2 ? 9 : 5), c = x / n;
    return hint(numQ('pecahan', `${nm} dari ${x} = ?`, `${nm} dari ${x} sama dengan berapa?`, c, [x - c, c * 2, c + 1].filter(v => v !== c), 1),
      () => V().hintNote(`${nm} = dibagi ${n} sama banyak. ${x} dibagi ${n} = ${c}.`));
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
                 pasangan: 'Pasangan bilangan', cerita: 'Soal cerita', teka: 'Teka-teki',
                 posisi: 'Bilangan urutan', berulang: 'Tambah berulang', keluarga: 'Hubungan + dan −', kelompok: 'Mengelompokkan bentuk',
                 susun: 'Menyusun bangun', belasan: 'Bilangan 11–20', dobel: 'Dobel', data: 'Diagram gambar', turus: 'Tabel turus',
                 ratusan: 'Ratusan', nilai: 'Nilai tempat', lompat: 'Loncat 10 & 100', bersusun: 'Tambah bersusun', hitungCepat: 'Berhitung cepat', kurangSusun: 'Kurang bersusun', kurangCepat: 'Mengurang cepat', cm: 'Panjang (cm & m)', air: 'Banyaknya air (L & dL)', jam: 'Membaca jam', durasi: 'Lama waktu', uang: 'Uang', kaliArti: 'Arti perkalian', kaliTabel: 'Perkalian', kaliCerita: 'Cerita perkalian', kaliPola: 'Pola perkalian', segi: 'Segitiga & segiempat', kotak: 'Kubus & balok', ribuan: 'Bilangan sampai 10.000', pecahan: 'Pecahan'};

  return {make, GEN, NAMES, maxFor, specForLevel, nearChoices};
})();
