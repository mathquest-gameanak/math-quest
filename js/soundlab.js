/* Math Quest — 🎧 Coba Suara (untuk orang tua).
   Dengarkan kandidat efek suara (Kenney, CC0) di HP lalu pilih. Pilihan disimpan di HP ini (MQ.Audio.choose)
   dan langsung dipakai di game. Tanda ★ = pilihan bawaan; "Suara lama" = suara buatan kode / rekaman sebelumnya. */
'use strict';
window.MQ = window.MQ || {};

MQ.SoundLab = (() => {
  const {UI} = MQ;
  const $ = id => document.getElementById(id);
  const C = () => MQ.Audio.choose;

  /* [efek, judul, keterangan, [[idFile, label], ...]] — file di audio/pilihan/<id>.mp3 */
  const SLOTS = [
    ['correct', '✅ Jawaban benar', 'berbunyi sangat sering', [['nes01', '8-bit 1'], ['nes09', '8-bit 2'], ['nes14', '8-bit 3'], ['pizzi01', 'Petik'], ['steel01', 'Steel drum'], ['pep1', 'Pep'], ['highUp', 'Naik']]],
    ['wrong', '❌ Jawaban salah', 'sebaiknya lembut, tidak menakutkan', [['lowDown', 'Turun'], ['phaserDown1', 'Phaser'], ['nes04', '8-bit'], ['pizzi03', 'Petik'], ['twoTone1', 'Dua nada']]],
    ['slash', '⚔️ Pahlawan menyerang', '', [['punchM', 'Pukul'], ['punchH', 'Pukul keras'], ['woodM', 'Kayu'], ['softH', 'Empuk']]],
    ['crit', '⚡ Kritikal / KILAT', '', [['powerUp1', 'Power 1'], ['powerUp5', 'Power 2'], ['zap1', 'Zap'], ['phaserUp1', 'Phaser'], ['bellH', 'Lonceng']]],
    ['hurt', '💥 Pahlawan terkena', '', [['punchH2', 'Pukul'], ['softM', 'Empuk'], ['plateL', 'Logam']]],
    ['defeat', '👾 Monster kalah', '', [['nes05', '8-bit 1'], ['nes07', '8-bit 2'], ['phaseJump1', 'Lompat']]],
    ['levelUp', '⬆️ Naik level', '', [['nes00', '8-bit panjang'], ['nes13', '8-bit'], ['pizzi13', 'Petik'], ['steel13', 'Steel drum'], ['sax13', 'Saksofon'], ['powerUp10', 'Power']]],
    ['fanfare', '🏅 Medali / hadiah besar', '', [['nes12', '8-bit 1'], ['nes11', '8-bit 2'], ['steel12', 'Steel drum'], ['hit12', 'Hentak']]],
    ['chest', '🎁 Buka peti / misi', '', [['nes06', '8-bit'], ['pizzi06', 'Petik'], ['threeTone1', 'Tiga nada']]],
    ['coin', '🪙 Dapat koin', '', [['glassL', 'Kaca'], ['nes15', '8-bit'], ['pep3', 'Pep'], ['metalL', 'Logam']]],
    ['click', '👆 Tombol menu', 'berbunyi sangat sering', [['uiClick1', 'Klik 1'], ['uiClick3', 'Klik 2'], ['uiSwitch2', 'Saklar'], ['uiRoll1', 'Halus']]],
    ['potion', '🧪 Minum ramuan', '', [['powerUp2', 'Power'], ['phaserUp3', 'Phaser']]]
  ];

  function render() {
    const picks = C().get(), defs = C().defaults();
    $('soundList').innerHTML = SLOTS.map(([slot, title, desc, opts]) => {
      const cur = picks[slot] || '', def = defs[slot] || '';
      const chip = (id, label) => `<button class="sChip${cur === id ? ' on' : ''}" data-slot="${slot}" data-id="${id}">▶ ${label}${def === id ? ' ★' : ''}</button>`;
      return `<div class="panel box soundSlot"><h3>${title}</h3>${desc ? `<p class="note left">${desc}</p>` : ''}` +
        `<div class="sChips">${chip('', 'Suara lama')}${opts.map(([id, l]) => chip(id, l)).join('')}</div></div>`;
    }).join('');
    const n = C().changed();
    $('soundMsg').textContent = n ? `${n} suara berbeda dari bawaan (★).` : 'Semua memakai suara bawaan (★).';
  }
  UI.renderers.sound = render;

  $('soundList').addEventListener('click', e => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    C().set(b.dataset.slot, b.dataset.id);
    C().preview(b.dataset.slot, b.dataset.id);
    render();
  });
  $('soundCopy').addEventListener('click', async () => {
    const text = JSON.stringify(C().get());
    try { await navigator.clipboard.writeText(text); $('soundMsg').textContent = 'Pilihan disalin. Kirim ke pengembang untuk dijadikan bawaan.'; }
    catch (e) { $('soundMsg').textContent = text; }
  });
  $('soundReset').addEventListener('click', () => {
    UI.overlay({icon: '🎧', title: 'Kembali ke suara bawaan?', btn: 'Ya', btn2: 'Batal', text: 'Semua efek kembali ke pilihan bertanda ★.',
      cb: () => { C().reset(); UI.show('sound'); }});
  });

  return {SLOTS};
})();
