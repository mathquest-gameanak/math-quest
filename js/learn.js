/* Math Quest — 🎓 Kelas & Istirahat Pahlawan (2026-11-26).
   Tampil sebagai ruang kelas: materi di papan tulis, Kakek Bilang menunjuk papan, pahlawan duduk di depan
   bersama beberapa monster yang sudah pernah ditemui (ikut belajar & bersorak saat jawaban benar).
   Materi singkat bergambar per jenis soal (kartu penjelasan → latihan tanpa waktu, jawab benar N kali).
   Saat HP habis, pahlawan PINGSAN: semua pertarungan terkunci selama balance.knockout.lockMin menit DAN
   sampai anak menyelesaikan pelajaran tentang jenis soal yang paling sering salah di pertarungan itu.
   Kelas juga bisa dibuka kapan saja dari ikon 🎓 Kelas di beranda. */
'use strict';
window.MQ = window.MQ || {};

MQ.Learn = (() => {
  const {State, UI, Questions, Audio} = MQ;
  const S = State.S, V = () => MQ.Vis, $ = id => document.getElementById(id);
  const sfx = Audio.sfx, BAL = () => MQ.Balance.knockout;

  /* ===== Materi: tiap jenis soal = beberapa kartu {t: teks, v: () => gambar HTML} ===== */
  const LESSONS = {
    hitung: {title: 'Menghitung Benda', icon: '🍎', cards: [
      {t: 'Tunjuk bendanya satu per satu sambil menyebut angka: satu, dua, tiga, ...', v: () => V().hintCount('apple', 5)},
      {t: 'Angka TERAKHIR yang kamu sebut adalah jumlahnya. Jangan ada yang dihitung dua kali!', v: () => V().count('star', 7) + '<p class="lvCap">Ada 7 bintang</p>'}]},
    banding: {title: 'Lebih Besar, Lebih Kecil', icon: '🐊', cards: [
      {t: 'Tanda > dan < seperti mulut buaya yang lapar. Mulutnya selalu MEMBUKA ke bilangan yang lebih besar.', v: () => V().hintCompare(7, 4, '>')},
      {t: '3 < 6 dibaca "3 lebih kecil dari 6". Mulut buaya membuka ke 6.', v: () => V().hintCompare(3, 6, '<')},
      {t: 'Kalau sama banyak, pakai tanda sama dengan =', v: () => V().hintCompare(5, 5, '=')}]},
    tambah: {title: 'Penjumlahan', icon: '➕', cards: [
      {t: 'Tambah artinya DIGABUNG. 3 titik kuning digabung 2 titik biru, lalu hitung semuanya: 5.', v: () => V().hintAdd(3, 2, 5)},
      {t: 'Cara cepat: mulai dari angka yang besar, lalu hitung maju. 6 + 2 → mulai dari 6: tujuh, delapan!', v: () => V().hintSeq([6, 7], 8, '6 + 2 = 8')},
      {t: 'Lewat 10? Penuhi dulu sampai 10! 8 + 5: 8 butuh 2 lagi jadi 10, sisanya 3. Jadi 10 + 3 = 13.', v: () => V().hintMake10(8, 5)},
      {t: 'Ditambah 0 tidak bertambah: 6 + 0 = 6.', v: () => V().hintNote('6 + 0 = 6 · 0 + 4 = 4')}]},
    kurang: {title: 'Pengurangan', icon: '➖', cards: [
      {t: 'Kurang artinya DIAMBIL. Ada 7, diambil 3. Coret yang diambil, hitung sisanya.', v: () => V().hintSub(7, 3, 4)},
      {t: 'Cara cepat: hitung mundur. 9 − 2 → dari 9 mundur 2 langkah: delapan, tujuh!', v: () => V().hintSeq([9, 8], 7, '9 − 2 = 7')},
      {t: 'Dikurangi 0 = tidak ada yang diambil. 5 − 0 = 5. Kalau diambil semua: 5 − 5 = 0.', v: () => V().hintNote('5 − 0 = 5 · 5 − 5 = 0')}]},
    isi: {title: 'Mengisi Kotak Kosong', icon: '□', cards: [
      {t: '3 + □ = 5. Kotak itu angka yang hilang. Dari 3, butuh berapa lagi supaya jadi 5?', v: () => V().hintAdd(3, 2, 5)},
      {t: 'Cek lagi: masukkan jawabanmu ke kotak. 3 + 2 = 5. Benar!', v: () => V().hintNote('3 + 2 = 5 ✔')}]},
    pasangan: {title: 'Pasangan Bilangan', icon: '🔗', cards: [
      {t: 'Satu bilangan bisa dipecah jadi dua bagian. 7 bisa jadi 3 dan 4.', v: () => V().bond(7, 3, 4)},
      {t: 'Kalau satu bagian hilang: 7 dipecah jadi 3 dan berapa? Hitung dari 3 sampai 7: empat!', v: () => V().hintBond(7, 3, 4)},
      {t: 'Teman 10: lihat bingkai sepuluh. Kotak yang kosong adalah pasangannya.', v: () => V().hintTen(6)}]},
    cerita: {title: 'Soal Cerita', icon: '📖', cards: [
      {t: 'Baca pelan-pelan. Cari angkanya, lalu cari kata kuncinya.', v: () => V().hintNote('"memberi lagi", "semuanya" → TAMBAH +')},
      {t: 'Kalau ada yang dimakan, hilang, atau diberikan → yang tersisa lebih sedikit, jadi KURANG.', v: () => V().hintNote('"dimakan", "sisa" → KURANG −')},
      {t: 'Gambar batangnya! Kiki punya 4, diberi 3 lagi. Semua = 4 + 3 = 7.',
       v: () => V().hintBar([{n: 4, label: 4, c: '#ffcd75'}, {n: 3, label: 3, c: '#73eff7'}], 'semua = 7', '4 + 3 = 7')}]},
    bentuk: {title: 'Mengenal Bentuk', icon: '🔺', cards: [
      {t: 'Bangun datar (rata seperti kertas): lingkaran, segitiga, persegi, persegi panjang.',
       v: () => `<div class="lvRow">${['lingkaran', 'segitiga', 'persegi', 'persegiPanjang'].map(s => `<span>${V().shape(s)}<small>${V().SHAPES[s].name}</small></span>`).join('')}</div>`},
      {t: 'Bangun ruang (bisa dipegang): kubus seperti dadu, bola, tabung seperti kaleng, kerucut seperti topi ulang tahun.',
       v: () => `<div class="lvRow">${['kubus', 'bola', 'tabung', 'kerucut'].map(s => `<span>${V().shape(s)}<small>${V().SHAPES[s].name}</small></span>`).join('')}</div>`}]},
    pola: {title: 'Pola', icon: '🔴', cards: [
      {t: 'Pola adalah urutan yang BERULANG. Cari bagian yang diulang-ulang.', v: () => V().patternRow(['merah-lingkaran', 'biru-kotak', 'merah-lingkaran', 'biru-kotak', 'merah-lingkaran'])},
      {t: 'Di sini yang berulang: merah, biru, merah, biru, ... jadi berikutnya BIRU.', v: () => V().hintNote('merah → biru → merah → biru → merah → ?  BIRU')}]},
    panjang: {title: 'Panjang & Pendek', icon: '✏️', cards: [
      {t: 'Untuk membandingkan, ujung kiri harus sejajar. Lihat ujung kanannya: yang lebih jauh = lebih panjang.', v: () => V().pencils(8, 5)},
      {t: 'Pensil A lebih panjang. Pensil B lebih pendek.', v: () => V().hintNote('A lebih panjang · B lebih pendek')}]},
    ukur: {title: 'Mengukur', icon: '📏', cards: [
      {t: 'Mengukur = menghitung berapa kotak yang ditutupi benda, dari ujung ke ujung.', v: () => V().hintRuler(5)}]},
    puluhan: {title: 'Puluhan & Satuan', icon: '🥢', cards: [
      {t: 'Satu ikat berisi 10 lidi = 1 puluhan.', v: () => V().lidi(1, 0)},
      {t: 'Hitung ikatannya dulu (puluhan), lalu lidi lepasnya (satuan). 1 ikat + 3 lepas = 13.', v: () => V().lidi(1, 3) + V().hintTens(1, 3)}]},
    posisi: {title: 'Bilangan Urutan', icon: '🚩', cards: [
      {t: 'Hitung dari bendera: yang paling dekat bendera adalah yang PERTAMA, lalu kedua, ketiga, ...', v: () => V().queue(['jamur', 'kelelawar', 'kepiting', 'lendirBatu', 'hantuKertas'], true)},
      {t: 'Kepiting ada di urutan ke-3 (ketiga) dari bendera.', v: () => V().hintNote('pertama · kedua · KETIGA · keempat · kelima')}]},
    berulang: {title: 'Penjumlahan Berulang', icon: '🔁', cards: [
      {t: 'Ada 3 kelompok, tiap kelompok 2. Jumlahkan berulang: 2 + 2 + 2 = 6.', v: () => V().groups(3, 2)},
      {t: 'Cara cepat: hitung loncat. 2, 4, 6!', v: () => V().hintSeq([2, 4], 6, 'Loncat 2-2: 2, 4, 6')}]},
    keluarga: {title: 'Hubungan Tambah & Kurang', icon: '🔄', cards: [
      {t: '3, 4, dan 7 adalah satu keluarga bilangan. 3 + 4 = 7.', v: () => V().bond(7, 3, 4)},
      {t: 'Dari satu keluarga kita dapat 4 kalimat: 3 + 4 = 7, 4 + 3 = 7, 7 − 4 = 3, 7 − 3 = 4.', v: () => V().hintNote('3 + 4 = 7 → 7 − 4 = 3')}]},
    kelompok: {title: 'Mengelompokkan Bentuk', icon: '🔷', cards: [
      {t: 'Kelompokkan menurut BENTUK, bukan warna. Semua ini segitiga walau warnanya berbeda.',
       v: () => V().shapeRow([['segitiga', '#e43b44'], ['segitiga', '#41a6f6'], ['segitiga', '#38b764']])},
      {t: 'Yang ini lingkaran, jadi masuk kelompok lain.', v: () => V().shapeRow([['segitiga', '#ffcd75'], ['segitiga', '#b06fd0'], ['lingkaran', '#ffcd75']])}]},
    susun: {title: 'Menyusun Bangun Datar', icon: '🧩', cards: [
      {t: 'Dua segitiga siku-siku bisa disusun menjadi satu persegi.', v: () => V().pieces('tt') + V().split('sq2t')},
      {t: 'Persegi besar ini disusun dari 4 persegi kecil. Hitung tiap warnanya!', v: () => V().split('sq4s')}]},
    belasan: {title: 'Bilangan 11–20', icon: '🔟', cards: [
      {t: 'Satu bingkai penuh = 10 (1 puluhan). Bingkai kedua berisi 4 (satuan). Jadi 14.', v: () => V().tens20(14)},
      {t: 'Bilangan belasan = 10 dan sisanya. 14 = 10 dan 4. Angka 1 di depan bernilai 10.', v: () => V().bond(14, 10, 4)}]},
    dobel: {title: 'Dobel', icon: '👯', cards: [
      {t: 'Dobel = menambah bilangan yang sama. 6 + 6 = 12.', v: () => V().hintAdd(6, 6, 12)},
      {t: 'Hampir dobel: 6 + 7 = dobel 6 lalu tambah 1 → 13.', v: () => V().hintNote('6 + 6 = 12 → 6 + 7 = 13')}]},
    data: {title: 'Diagram Gambar', icon: '📊', cards: [
      {t: 'Tiap gambar = 1 buah. Hitung gambar di setiap baris.', v: () => V().picto([['apel', 4], ['jeruk', 2], ['pisang', 5]])},
      {t: 'Baris paling panjang = paling banyak (pisang 5). Baris paling pendek = paling sedikit (jeruk 2).', v: () => V().hintNote('pisang 5 > apel 4 > jeruk 2')}]},
    turus: {title: 'Tabel Turus', icon: '🖊️', cards: [
      {t: 'Turus dipakai untuk mencatat. Garis kelima dibuat miring, jadi satu ikat turus = 5.', v: () => V().tally(5)},
      {t: 'Satu ikat (5) dan 2 garis = 7.', v: () => V().tally(7)}]},
    urutan: {title: 'Urutan Bilangan', icon: '🔢', cards: [
      {t: 'Bilangan SESUDAH = tambah satu. Sesudah 14 adalah 15.', v: () => V().hintLine(14, 15)},
      {t: 'Bilangan SEBELUM = kurang satu. Sebelum 20 adalah 19.', v: () => V().hintLine(20, 19)}]},
    kali: {title: 'Perkalian', icon: '✖️', cards: [
      {t: 'Kali = tambah berulang. 3 × 2 artinya 3 sebanyak 2 kali: 3 + 3 = 6.', v: () => V().hintAdd(3, 3, 6)}]},
    teka: {title: 'Teka-teki Bilangan', icon: '📜', cards: [
      {t: '"Aku lebih dari 5 dan kurang dari 7." Bilangan yang ada di antara 5 dan 7 adalah 6.', v: () => V().hintLine(6, 6)},
      {t: 'Pola loncat: lihat berapa yang ditambah setiap kali. 2, 4, 6, 8 → loncat 2.', v: () => V().hintSeq([2, 4, 6, 8], 10, 'Setiap kali +2')}]}
  };
  // urutan mengikuti bab buku Matematika Kelas 1: bilangan 1–10, tambah, kurang, bangun datar, 11–20, tambah-kurang 20, panjang, diagram
  const ORDER = ['hitung', 'banding', 'urutan', 'posisi', 'tambah', 'pasangan', 'berulang', 'isi', 'kurang', 'keluarga', 'cerita',
                 'bentuk', 'kelompok', 'susun', 'pola', 'belasan', 'puluhan', 'dobel', 'panjang', 'ukur', 'data', 'turus', 'teka'];

  /* ===== Istirahat (pingsan) ===== */
  const leftMs = () => (S.rest ? Math.max(0, S.rest.until - Date.now()) : 0);
  /** Masih istirahat? (waktu belum habis ATAU pelajaran belum selesai). Selesai keduanya → istirahat dihapus. */
  function resting() {
    if (!S.rest) return false;
    if (leftMs() <= 0 && S.rest.learned) { S.rest = null; State.save(); return false; }
    return true;
  }
  const clock = ms => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  /** Pahlawan pingsan: catat waktu istirahat & pelajaran yang harus diselesaikan. */
  function knockOut(kind, max) {
    const K = BAL();
    if (!K.lockMin && !K.mustLearn) return false;
    S.rest = {until: Date.now() + K.lockMin * 60000, kind: LESSONS[kind] ? kind : 'tambah', max: max || 10, learned: !K.mustLearn};
    State.save();
    return true;
  }
  /** Teks status istirahat untuk pesan. */
  function restText() {
    const ms = leftMs(), L = LESSONS[S.rest.kind];
    return (ms > 0 ? `Pahlawan masih istirahat ${clock(ms)} lagi. ` : 'Waktu istirahat sudah selesai. ') +
           (S.rest.learned ? 'Pelajaran sudah selesai, hebat!' : `Sambil menunggu, selesaikan dulu pelajaran "${L.title}".`);
  }
  /** Dipanggil sebelum bertarung: true = boleh bertarung. Bila tidak, tampilkan pesan istirahat. */
  function gate() {
    if (!resting()) return true;
    if (!S.rest.learned) UI.overlay({icon: '💤', title: 'Pahlawan Istirahat', text: restText(), btn: '🎓 Belajar', cb: openRest, btn2: 'Nanti'});
    else UI.overlay({icon: '💤', title: 'Pahlawan Istirahat', text: restText() + ' Tunggu sebentar lagi ya.'});
    return false;
  }
  const openRest = () => open(S.rest.kind, S.rest.max, true);

  /* ===== Ruang kelas: murid-murid ===== */
  let mates = null; // monster teman sekelas (dipilih sekali tiap masuk kelas)
  const monImg = id => { const m = MQ.Data.monsters[id]; return MQ.Pix.has(id) ? MQ.Pix.url(id, 3) : MQ.Sprites.url(m.sprite, m.pal); };
  function renderSeats() {
    if (!mates) {
      const met = Object.keys(MQ.Data.monsters).filter(id => (S.bestiary[id] || 0) > 0 && id !== 'naga');
      const pool = met.length >= 4 ? met : ['lendir', 'jamur', 'kelelawar', 'lendirAir', 'jamurUngu'];
      mates = pool.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    }
    const seat = (src, cls, d) => `<div class="seat ${cls}" style="animation-delay:${d}s"><img src="${src}" alt=""><i class="desk"></i></div>`;
    $('clsSeats').innerHTML =
      `<div class="seatRow rowBack">${seat(monImg(mates[2]), 'mon', 0.3)}${seat(monImg(mates[3]), 'mon', 0.6)}</div>` +
      `<div class="seatRow rowFront">${seat(monImg(mates[0]), 'mon', 0.1)}${seat(MQ.Hero.current(), 'hero', 0)}${seat(monImg(mates[1]), 'mon', 0.45)}</div>`;
    $('clsTeacher').src = MQ.Pix.url('kakekTunjuk', 3);
  }
  /** Murid-murid bersorak (melompat) saat jawaban benar. */
  function cheer() { const s = $('clsSeats'); s.classList.remove('cheer'); void s.offsetWidth; s.classList.add('cheer'); }

  /* ===== Layar kelas ===== */
  let L = null; // {kind, max, rest, step, ok, q, done}
  function open(kind, max, rest = false) {
    L = {kind: LESSONS[kind] ? kind : 'tambah', max: max || 10, rest, step: 0, ok: 0, q: null, done: false};
    UI.show('learn');
  }
  const need = () => BAL().practice;

  function render() {
    renderSeats();
    if (!L) return renderList();
    const les = LESSONS[L.kind], cards = les.cards;
    $('learnTitle').textContent = `🎓 Kelas · ${les.title}`;
    $('learnAnswers').innerHTML = ''; $('learnAnswers').className = '';
    $('learnRest').hidden = !L.rest;
    if (L.rest) $('learnRest').textContent = S.rest && leftMs() > 0 ? `💤 Istirahat ${clock(leftMs())}` : '💤 Istirahat selesai';
    const next = $('learnNext');
    if (L.done) {
      cheer();
      $('learnStep').textContent = '🎉 Selesai!';
      $('learnBody').innerHTML = `<p class="lvText">Hebat! Kamu sudah belajar ${les.title}.</p>` +
        (L.rest ? `<p class="lvText">${leftMs() > 0 ? `Pahlawan masih istirahat ${clock(leftMs())} lagi. Nanti kembali ya!` : 'Pahlawan sudah segar lagi. Ayo bertualang!'}</p>` : '');
      next.hidden = false; next.textContent = L.rest && leftMs() <= 0 ? '⚔️ Ke Peta' : '🏠 Beranda';
      return;
    }
    if (L.step < cards.length) { // kartu penjelasan
      const c = cards[L.step];
      $('learnStep').textContent = `Materi ${L.step + 1} dari ${cards.length}`;
      $('learnBody').innerHTML = `<div class="lvVis">${c.v()}</div><p class="lvText">${c.t}</p>`;
      next.hidden = false; next.textContent = L.step + 1 < cards.length ? 'Lanjut ▶' : 'Ayo latihan! ▶';
      return;
    }
    // Latihan: tanpa waktu, salah → petunjuk & coba lagi
    next.hidden = true;
    if (!L.q) L.q = Questions.make({kinds: [L.kind], max: L.max});
    const q = L.q;
    $('learnStep').textContent = `Latihan: benar ${L.ok} dari ${need()}`;
    $('learnBody').innerHTML = (q.view ? `<div class="lvVis">${q.view}</div>` : '') + `<p class="lvQ${q.story ? ' story' : ''}">${q.text}</p><div id="learnHint"></div>`;
    const box = $('learnAnswers');
    box.className = 'learnAns cols' + q.cols + (q.choices[0].html.startsWith('<svg') ? ' pics' : '');
    q.choices.forEach(c => {
      const b = document.createElement('button');
      b.className = 'ans'; b.innerHTML = c.html;
      b.addEventListener('click', () => {
        if (b.disabled) return;
        const st = S.stats[q.kind] || (S.stats[q.kind] = {b: 0, s: 0});
        if (c.v === q.ans) {
          st.b++; State.logDay('b', 1); if (MQ.Daily) MQ.Daily.onCorrect(); sfx.correct(); b.classList.add('benar'); cheer();
          box.querySelectorAll('button').forEach(x => (x.disabled = true));
          L.ok++; L.q = null;
          setTimeout(() => {
            if (L.ok >= need()) { L.done = true; S.lessonsDone = (S.lessonsDone || 0) + 1; if (MQ.Quests) MQ.Quests.track('learn'); if (L.rest && S.rest) { S.rest.learned = true; } State.save(); sfx.levelUp(); }
            render();
          }, 800);
        } else {
          st.s++; State.logDay('s', 1); sfx.wrong(); b.classList.add('salah'); b.disabled = true;
          const h = q.hint && q.hint();
          if (h) $('learnHint').innerHTML = h;
        }
      });
      box.appendChild(b);
    });
  }
  $('learnNext').addEventListener('click', () => {
    if (!L) return;
    if (L.done) { const toMap = L.rest && leftMs() <= 0; L = null; mates = null; resting(); return UI.show(toMap ? 'map' : 'home'); }
    L.step++; render();
  });
  $('learnBack').addEventListener('click', () => { const was = L; L = null; if (was && !was.rest) return render(); mates = null; UI.show('home'); });

  /** Daftar semua pelajaran (dibuka dari ikon 🎓 Kelas di beranda), ditulis di papan tulis. */
  function renderList() {
    $('learnTitle').textContent = '🎓 Kelas';
    $('learnStep').textContent = 'Hari ini mau belajar apa?';
    $('learnRest').hidden = !resting();
    if (S.rest) $('learnRest').textContent = '💤 ' + restText();
    $('learnNext').hidden = true;
    $('learnAnswers').innerHTML = ''; $('learnAnswers').className = '';
    $('learnBody').innerHTML = `<div class="lvList">${ORDER.map(k => `<button class="lvPick${S.rest && !S.rest.learned && S.rest.kind === k ? ' must' : ''}" data-k="${k}">` +
      `<span>${LESSONS[k].icon}</span>${LESSONS[k].title}</button>`).join('')}</div>`;
    $('learnBody').querySelectorAll('.lvPick').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k, rest = !!(S.rest && !S.rest.learned && S.rest.kind === k);
      open(k, rest ? S.rest.max : 20, rest);
    }));
  }
  UI.renderers.learn = render;

  // Hitung mundur istirahat (di layar pelajaran & beranda)
  setInterval(() => {
    if (!S.rest) { $('restBanner').hidden = true; return; }
    const on = resting();
    $('restBanner').hidden = !on;
    if (on) $('restBanner').textContent = `💤 Istirahat ${leftMs() > 0 ? clock(leftMs()) : ''}${S.rest.learned ? '' : ' · 🎓 belajar dulu'}`;
    if (L && L.rest && $('scr-learn').classList.contains('on') && !L.done) $('learnRest').textContent = leftMs() > 0 ? `💤 Istirahat ${clock(leftMs())}` : '💤 Istirahat selesai';
  }, 1000);
  $('restBanner').addEventListener('click', () => (S.rest && !S.rest.learned ? openRest() : gate()));

  return {open, gate, knockOut, resting, restText, openRest, LESSONS};
})();
