/* Math Quest — layar Orang Tua: gerbang (soal perkalian untuk orang dewasa), laporan perkembangan, pengaturan.
   Semua data hanya dari HP ini (localStorage), tidak dikirim ke mana pun. */
'use strict';
window.MQ = window.MQ || {};

MQ.Parent = (() => {
  const {rand, Data, State, UI, Questions} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  let gateAns = 0, openUntil = 0; // setelah lolos gerbang, tetap terbuka 10 menit (mis. kembali dari Atur Angka)

  /* ===== Gerbang orang tua ===== */
  UI.renderers.parent = () => {
    if (Date.now() < openUntil) { $('parentGate').hidden = true; $('parentBody').hidden = false; renderReport(); return; }
    const a = rand(12, 19), b = rand(3, 9);
    gateAns = a * b;
    $('gateQ').textContent = `Berapa ${a} × ${b}?`;
    $('gateIn').value = ''; $('gateMsg').textContent = '';
    $('parentGate').hidden = false; $('parentBody').hidden = true;
  };
  $('parentGate').addEventListener('submit', e => { // #parentGate adalah <form>
    e.preventDefault();
    if (Number($('gateIn').value) === gateAns) { openUntil = Date.now() + 10 * 60000; $('parentGate').hidden = true; $('parentBody').hidden = false; renderReport(); }
    else $('gateMsg').textContent = 'Jawaban kurang tepat. Coba lagi.';
  });

  /* ===== Laporan ===== */
  const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  /** Area tempat melatih suatu jenis soal. */
  const whereKind = k => {
    const f = Data.fields.filter(x => x.spec && x.spec.kinds.includes(k)).map(x => x.name);
    return f.length ? f.join(' / ') : 'Arena Latihan';
  };

  function renderReport() {
    // Ringkasan
    const tot = Object.values(S.stats).reduce((a, s) => ({b: a.b + s.b, s: a.s + s.s}), {b: 0, s: 0});
    const acc = tot.b + tot.s ? Math.round(tot.b / (tot.b + tot.s) * 100) + '%' : '–';
    const areas = `${State.mainFields().filter(f => S.cleared.includes(f.id)).length} / ${State.mainFields().length}`;
    $('repSummary').innerHTML = [
      ['Kelas', S.grade > 1 ? 'Lulus Kelas 1' : 'Kelas 1'], ['Level', S.level], ['Area selesai', areas],
      ['Ujian terbaik', S.examBest ? `${S.examBest} / 12` : 'belum'], ['Soal dijawab', tot.b + tot.s], ['Ketepatan', acc]
    ].map(([k, v]) => `<div class="sumBox"><small>${k}</small><b>${v}</b></div>`).join('');

    // 7 hari terakhir: menit bermain & soal benar
    const rows = [];
    let maxMin = 1;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const v = S.days[State.dateKey(d)] || {t: 0, b: 0, s: 0}, min = Math.round(v.t / 60);
      maxMin = Math.max(maxMin, min);
      rows.push({label: `${DAY[d.getDay()]} ${d.getDate()}`, min, v});
    }
    $('repDays').innerHTML = rows.map(r =>
      `<div class="dayRow"><span>${r.label}</span><div class="dayBar"><div style="width:${r.min / maxMin * 100}%"></div></div>` +
      `<small>${r.min} mnt · ${r.v.b}✓ ${r.v.s}✗</small></div>`).join('');

    // Kemampuan per jenis soal, yang terlemah di atas
    const skills = Object.entries(S.stats).filter(([, s]) => s.b + s.s > 0)
      .map(([k, s]) => ({k, n: s.b + s.s, p: Math.round(s.b / (s.b + s.s) * 100)}))
      .sort((a, b) => a.p - b.p);
    const level = sk => sk.n < 5 ? ['few', 'Data sedikit'] : sk.p < 70 ? ['low', 'Perlu latihan'] : sk.p < 85 ? ['mid', 'Cukup'] : ['high', 'Mahir'];
    $('repSkills').innerHTML = skills.length ? skills.map(sk => {
      const [cls, label] = level(sk);
      return `<div class="skRow"><span><b>${Questions.NAMES[sk.k] || sk.k}</b><small>${sk.n} soal · ${sk.p}% benar</small></span><em class="tag ${cls}">${label}</em></div>`;
    }).join('') : '<p class="note">Belum ada data. Ajak anak bermain dulu.</p>';

    // Saran
    const weak = skills.filter(sk => sk.n >= 5 && sk.p < 70).slice(0, 2);
    $('repAdvice').textContent = weak.length
      ? weak.map(sk => `${Questions.NAMES[sk.k] || sk.k} masih ${sk.p}% benar: ajak berlatih di ${whereKind(sk.k)}.`).join(' ')
      : skills.length ? 'Bagus! Semua jenis soal yang sudah cukup sering dikerjakan berada di atas 70% benar.' : 'Belum ada saran.';

    renderSettings();
    const n = MQ.Tuner ? MQ.Tuner.changedCount() : 0;
    $('tunBadge').textContent = n ? `${n} angka sedang diubah` : '';
  }

  /* ===== Pengaturan ===== */
  const SETTINGS = [
    ['santai', 'Mode Santai', 'Musuh tidak menyerang berwaktu. Cocok saat anak lelah atau belajar materi baru.'],
    ['autoSpeak', 'Bacakan soal otomatis', 'Setiap soal langsung dibacakan (untuk anak yang belum lancar membaca).']
  ];
  const VOLUMES = [['music', '🎵 Musik'], ['sfx', '🔔 Efek suara']];
  function renderSettings() {
    $('repVolumes').innerHTML = VOLUMES.map(([k, label]) =>
      `<label class="volRow"><span>${label}</span><input type="range" min="0" max="100" step="10" value="${Math.round(S.settings[k] * 100)}" data-vol="${k}">` +
      `<b>${Math.round(S.settings[k] * 100)}</b></label>`).join('');
    $('repSettings').innerHTML = SETTINGS.map(([k, label, desc]) =>
      `<div class="setRow"><span><b>${label}</b><small>${desc}</small></span>` +
      `<button class="toggle ${S.settings[k] ? 'on' : ''}" data-set="${k}" aria-pressed="${S.settings[k]}">${S.settings[k] ? 'Nyala' : 'Mati'}</button></div>`).join('');
  }
  $('repVolumes').addEventListener('input', e => {
    const r = e.target.closest('[data-vol]');
    if (!r) return;
    S.settings[r.dataset.vol] = Number(r.value) / 100;
    r.nextElementSibling.textContent = r.value;
    MQ.Audio.setVolumes(S.settings.music, S.settings.sfx);
    State.save();
  });
  $('repVolumes').addEventListener('change', () => MQ.Audio.sfx.coin()); // contoh bunyi setelah menggeser
  $('repSettings').addEventListener('click', e => {
    const b = e.target.closest('[data-set]');
    if (!b) return;
    S.settings[b.dataset.set] = !S.settings[b.dataset.set];
    State.save(); renderSettings();
  });

  /* ===== Data permainan: cadangkan, pulihkan, hapus ===== */
  const msg = t => ($('dataMsg').textContent = t);
  $('btnBackupCopy').addEventListener('click', async () => {
    State.save();
    const code = MQ.Save.exportCode();
    $('backupText').value = code;
    try { await navigator.clipboard.writeText(code); msg('Kode cadangan disalin. Simpan di catatan/WhatsApp.'); }
    catch (e) { $('backupText').select(); msg('Kode ada di kotak di atas. Tekan lama untuk menyalin.'); }
  });
  $('btnBackupFile').addEventListener('click', () => {
    State.save();
    try {
      const blob = new Blob([MQ.Save.exportCode()], {type: 'text/plain'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `math-quest-cadangan-${State.today()}.txt`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      msg('File cadangan diunduh.');
    } catch (e) { msg('Tidak bisa mengunduh di sini. Pakai "Salin kode cadangan".'); }
  });
  /** Pulihkan lalu muat ulang game agar semua layar memakai data baru. */
  function restore(text) {
    if (!MQ.Save.importCode(text)) return msg('Kode/file cadangan tidak dikenali.');
    msg('Berhasil dipulihkan. Memuat ulang...');
    setTimeout(() => location.reload(), 600);
  }
  $('btnRestore').addEventListener('click', () => {
    const t = $('backupText').value.trim();
    if (!t) return msg('Tempel kode cadangan dulu di kotak di atas.');
    UI.overlay({icon: '♻️', title: 'Pulihkan progress?', btn: 'Ya, pulihkan', btn2: 'Batal', cb: () => restore(t),
      text: 'Progress yang sekarang akan diganti dengan isi cadangan.'});
  });
  $('restoreFile').addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(t => UI.overlay({icon: '♻️', title: 'Pulihkan progress?', btn: 'Ya, pulihkan', btn2: 'Batal', cb: () => restore(t),
      text: `Progress yang sekarang akan diganti dengan isi file "${f.name}".`}));
    e.target.value = '';
  });
  /* Kembalikan semua poin status yang sudah dibagi, supaya bisa dibagi ulang */
  $('btnRespec').addEventListener('click', () => {
    const used = S.alloc.hp + S.alloc.atk + S.alloc.def;
    if (!used) return msg('Belum ada poin status yang dibagi.');
    UI.overlay({icon: '🔄', title: 'Atur ulang poin status?', btn: 'Ya, atur ulang', btn2: 'Batal',
      text: `${used} poin dikembalikan dan bisa dibagi lagi di halaman Karakter.`,
      cb: () => { S.points += used; S.alloc = {hp: 0, atk: 0, def: 0}; S.hp = Math.min(S.hp, State.maxHp()); State.save(); msg(`${used} poin dikembalikan.`); }});
  });
  $('btnReset').addEventListener('click', () => {
    UI.overlay({icon: '⚠️', title: 'Hapus semua progress?', btn: 'Batal', btn2: 'Ya, hapus semua',
      text: 'Level, item, koin, dan karakter akan hilang dan game mulai dari awal. Tidak bisa dibatalkan, kecuali kamu sudah menyimpan cadangan.',
      cb2: () => { MQ.Save.reset(); msg('Semua progress dihapus. Memuat ulang...'); setTimeout(() => location.reload(), 600); }});
  });

  return {};
})();
