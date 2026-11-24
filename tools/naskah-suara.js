/* Membuat docs/naskah-suara.md dari js/story.js: daftar baris cerita bernomor untuk direkam.
   Jalankan: node tools/naskah-suara.js */
global.window = global; global.MQ = {};
const root = __dirname + '/..';
require(root + '/js/data.js'); require(root + '/js/story.js');
const {SCENES, speakerName} = MQ.Story;
const fs = require('fs');
let md = '# Naskah Suara (voiceover) Math Quest\n\n' +
  'Rekam setiap baris sebagai file **MP3** bernama sesuai kolom *File*, simpan di folder `audio/vo/`, lalu kirim daftar file-nya ke Claude ' +
  'agar didaftarkan di `MQ.Story.VO` (js/story.js).\n\n' +
  '- Baris dengan **(nama pahlawan)**: rekam tanpa menyebut nama, mis. "Halo, Pahlawan!" — teks di layar tetap memakai nama anak.\n' +
  '- Saran: suara ceria & pelan, 1–2 detik jeda di akhir. Naskah dibuat otomatis dari js/story.js; jangan diedit manual.\n';
for (const [id, steps] of Object.entries(SCENES)) {
  md += `\n## ${id}\n\n| File | Tokoh | Kalimat |\n|---|---|---|\n`;
  steps.forEach((st, i) => {
    const who = st.who === 'hero' ? 'Pahlawan (anak)' : speakerName(st.who, '') || 'Narator';
    md += `| ${id}-${i + 1}.mp3 | ${who} | ${st.text.replace(/\{nama\}/g, '(nama pahlawan)')} |\n`;
  });
}
fs.writeFileSync(root + '/docs/naskah-suara.md', md);
console.log('docs/naskah-suara.md dibuat:', Object.values(SCENES).reduce((n, s) => n + s.length, 0), 'baris');
