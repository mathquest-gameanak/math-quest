/* Math Quest — ikon item gaya baru (2026-11-26): 24×24 piksel, berbayang (terang kiri-atas, gelap kanan-bawah),
   garis tepi gelap otomatis, kilau putih. Digambar dari bentuk dengan MQ.Pix.grid seperti monster & tokoh.
   MQ.ItemArt.url(id) = data-URL gambar diperbesar; id = id item di data.js (+ 'coin' untuk koin).
   Item tanpa gambar di sini otomatis memakai ikon lama (sprites.js). */
'use strict';
window.MQ = window.MQ || {};

MQ.ItemArt = (() => {
  const {grid} = MQ.Pix, W = '#f4f4f4';
  const N = 24;

  /* ===== Bentuk dasar ===== */
  /** Pedang miring (gagang kiri-bawah, ujung kanan-atas). b = [terang, tengah, gelap] bilah. */
  function sword(b, guard, guardD, grip, gem) {
    const P = grid(N, N);
    for (let k = 0; k < 14; k++) { P.px(6 + k, 16 - k, b[0]).px(7 + k, 16 - k, b[0]).px(8 + k, 16 - k, b[1]).px(9 + k, 16 - k, b[1]).px(10 + k, 16 - k, b[2]); }
    P.rect(20, 1, 2, 2, b[1]).px(22, 1, b[0]).px(21, 0, b[0]);                    // ujung runcing
    for (let k = 1; k < 12; k++) P.px(7 + k, 16 - k, k % 4 === 1 ? W : b[0]);   // kilau bilah
    for (let j = -4; j <= 4; j++) P.px(7 + j, 17 + j, guard).px(8 + j, 17 + j, guardD); // pelindung tangan
    for (let k = 0; k < 4; k++) P.px(5 - k, 19 + k, grip).px(6 - k, 19 + k, grip);   // gagang
    P.recolor(grip, '#3b2a17', (x, y) => (x + y) % 3 === 0);
    P.rect(1, 22, 2, 2, gem || guard);
    if (gem) P.px(8, 17, gem);
    return P.outline();
  }
  /** Perisai layang-layang. rim = bingkai, f = [terang, gelap] muka, emblem(P) = hiasan. */
  function kite(rim, f, emblem) {
    const P = grid(N, N);
    for (let y = 1; y < 23; y++) {
      const hw = y < 13 ? 10 : Math.round(10 * (22 - y) / 9);
      if (hw < 0) continue;
      P.rect(12 - hw, y, hw * 2, 1, rim);
      if (y > 2 && hw > 1) { P.rect(13 - hw, y, hw - 1, 1, f[0]); P.rect(12, y, hw - 1, 1, f[1]); }
    }
    P.rect(4, 3, 3, 1, W).rect(4, 4, 1, 3, W);
    if (emblem) emblem(P);
    return P.outline();
  }
  /** Cincin dengan permata. */
  function ring(metal, metalD, gem, gemD) {
    const P = grid(N, N);
    P.ell(12, 15, 8, 7.5, metal).ell(12, 15, 4.6, 4.2, null);
    P.recolor(metal, metalD, (x, y) => x > 13 && y > 14);
    P.ell(12, 7, 4.5, 4.5, gem).recolor(gem, gemD, (x, y) => x > 12 && y > 7);
    P.px(10, 5, W).px(11, 5, W).px(10, 6, W).px(5, 13, W).px(5, 14, W);
    return P.outline();
  }
  /** Kalung dengan liontin: tali melengkung + bentuk liontin (fn). */
  function pendant(cord, fn) {
    const P = grid(N, N);
    for (let k = 0; k < 9; k++) { P.px(3 + k, 1 + k, cord); P.px(20 - k, 1 + k, cord); }     // tali berbentuk V
    P.rect(11, 9, 2, 1, cord);
    fn(P);
    return P.outline();
  }
  function crown(gold, goldD, gems) {
    const P = grid(N, N);
    P.rect(3, 12, 18, 8, gold);
    [[3, 4], [10, 2], [18, 4]].forEach(([x, top]) => { for (let y = top; y < 12; y++) { const w = Math.max(1, Math.round((y - top) * 0.6) + 1); P.rect(x + 1.5 - w / 2 + (x === 10 ? 1 : 0), y, w + 1, 1, gold); } });
    P.recolor(gold, goldD, (x, y) => y > 16 || x > 17);
    P.rect(3, 17, 18, 1, goldD);
    gems.forEach((g, i) => { P.rect(5 + i * 6, 13, 3, 3, g); P.px(5 + i * 6, 13, W); });
    P.px(4, 12, W).px(5, 12, W);
    return P.outline();
  }

  const DRAW = {
    /* ----- bahan ----- */
    lendir() {
      const P = grid(N, N);
      P.ell(12, 15, 9.5, 7.5, '#38b764').ell(12, 10, 5, 4, '#38b764');
      P.recolor('#38b764', '#257179', (x, y) => y > 17 || x > 17);
      P.ell(8, 11, 2.2, 1.6, '#a7f070').px(7, 10, W).px(8, 10, W);
      P.rect(5, 21, 2, 2, '#257179').rect(17, 21, 2, 1, '#257179');
      P.px(10, 15, '#1a1c2c').px(14, 15, '#1a1c2c');
      return P.outline();
    },
    spora() {
      const P = grid(N, N);
      P.rect(9, 13, 6, 8, '#ffe4c4').rect(13, 13, 2, 8, '#d4a373');
      P.ell(12, 11, 10, 7, '#e43b44', (x, y) => y <= 12).recolor('#e43b44', '#b13e53', (x, y) => x > 15 && y > 7);
      [[8, 8], [14, 6], [16, 10], [10, 11]].forEach(([x, y]) => P.rect(x, y, 2, 2, W));
      [[3, 3], [20, 4], [21, 16], [2, 15]].forEach(([x, y]) => P.px(x, y, '#ffcd75'));        // spora berkilau
      return P.outline();
    },
    sayap() {
      const P = grid(N, N);
      // sayap kelelawar: tulang lengan di atas, selaput bergelombang di bawah, tulang jari
      // bahu di kiri-bawah, ujung sayap di kanan-atas, tepi bawah bergelombang 3 lengkung
      for (let x = 3; x < 23; x++) {
        const u = (x - 3) / 19, top = Math.round(12 - u * 10);
        const bot = Math.round(15 + u * 2 - 4.5 * Math.abs(Math.sin(u * Math.PI * 3)));
        if (bot > top) P.rect(x, top, 1, bot - top, u > 0.5 ? '#5d275d' : '#b06fd0');
        P.px(x, top, '#3b2a5d').px(x, top + 1, '#3b2a5d');                                  // tulang lengan
      }
      [[9, 7, 4], [15, 5, 3]].forEach(([x0, y0, dx]) => { for (let k = 0; k < 9; k++) P.px(x0 + Math.round(k * dx / 9), y0 + k, '#3b2a5d'); }); // tulang jari
      P.rect(2, 11, 3, 3, '#8a4a8a').px(22, 1, '#3b2a5d');
      P.px(6, 13, '#f4a3c8').px(7, 12, '#f4a3c8');
      return P.outline();
    },
    batu() {
      const P = grid(N, N);
      // kotak batu sedikit miring: muka depan, sisi kanan gelap, atas terang
      for (let y = 3; y < 8; y++) P.rect(3 + (8 - y), y, 14, 1, '#c7d3de');
      P.rect(3, 8, 14, 13, '#94b0c2');
      for (let x = 17; x < 22; x++) P.rect(x, 8 - (x - 16), 1, 13, '#566c86');
      P.px(6, 12, '#566c86').px(10, 16, '#566c86').px(13, 11, '#566c86').px(19, 12, '#333c57').px(18, 17, '#333c57');
      P.rect(4, 9, 3, 1, W).px(4, 10, W);
      return P.outline();
    },
    kayu() {
      const P = grid(N, N);
      P.rect(4, 8, 15, 9, '#ab5236').rect(4, 14, 15, 3, '#6d4b27');
      P.rect(6, 10, 4, 1, '#6d4b27').rect(11, 12, 5, 1, '#6d4b27');
      P.ell(19, 12.5, 3.6, 4.8, '#d4a373').ell(19, 12.5, 2, 2.8, '#ffcd75').px(19, 12, '#ab5236');
      P.rect(8, 6, 2, 2, '#38b764').px(10, 5, '#a7f070');                                    // tunas ajaib
      P.px(5, 9, W).px(6, 9, W);
      return P.outline();
    },
    mahkota: () => crown('#ffcd75', '#ef7d57', ['#e43b44', '#41a6f6', '#38b764']),
    kristalPola() {
      const P = grid(N, N);
      for (let y = 1; y < 23; y++) { const hw = Math.round(y < 8 ? y * 0.9 : (23 - y) * 0.47); P.rect(12 - hw, y, hw * 2 + 1, 1, '#b06fd0'); }
      P.recolor('#b06fd0', '#f4a3c8', (x, y) => x < 11);
      P.recolor('#b06fd0', '#5d275d', (x, y) => x > 13 && y > 9);
      P.rect(11, 3, 1, 14, W);
      P.px(3, 4, '#f4a3c8').px(20, 6, '#f4a3c8').px(19, 19, W);
      return P.outline();
    },
    mutiara() {
      const P = grid(N, N);
      P.ell(12, 18, 10, 5, '#f4a3c8', (x, y) => y >= 15).ell(12, 18, 8, 3, '#ffe4c4', (x, y) => y >= 16);
      for (let x = 4; x < 21; x += 3) P.rect(x, 19, 1, 3, '#d47a9a');
      P.ell(12, 12, 5.5, 5.5, '#c7f0ff').recolor('#c7f0ff', '#73a8c8', (x, y) => x > 13 && y > 12);
      P.rect(9, 9, 2, 2, W).px(11, 9, W);
      return P.outline();
    },
    tinta() {
      const P = grid(N, N);
      P.ell(12, 15, 8, 7, '#3b5dc9').recolor('#3b5dc9', '#29366f', (x, y) => x > 14 && y > 14);
      P.rect(9, 4, 6, 5, '#94b0c2').rect(8, 3, 8, 2, '#c7d3de');
      P.rect(16, 1, 2, 4, '#ab5236').px(18, 0, W);                                        // pena bulu
      const s = [[12, 11], [11, 13], [12, 13], [13, 13], [10, 14], [14, 14], [12, 14], [11, 15], [13, 15], [10, 16], [14, 16]];
      s.forEach(([x, y]) => P.px(x, y, '#ffcd75'));
      P.px(7, 12, W).px(7, 13, W).px(8, 11, '#73eff7');
      return P.outline();
    },
    ramuan() {
      const P = grid(N, N);
      P.ell(12, 15, 8, 7.5, '#c7f0ff');
      P.ell(12, 15, 7, 6.5, '#e43b44', (x, y) => y >= 13).recolor('#e43b44', '#b13e53', (x, y) => x > 14);
      P.rect(10, 4, 5, 5, '#c7f0ff').rect(9, 2, 7, 3, '#ab5236').rect(9, 2, 7, 1, '#d4a373');
      P.px(7, 12, W).px(7, 13, W).px(8, 11, W).px(14, 17, '#f68aa5').px(10, 19, '#f68aa5');
      P.rect(16, 9, 2, 1, '#e43b44');                                                        // gelembung
      return P.outline();
    },
    coin() {
      const P = grid(N, N);
      P.ell(12, 12, 9.5, 9.5, '#ffcd75').recolor('#ffcd75', '#ef7d57', (x, y) => x + y > 27);
      P.ell(12, 12, 6, 6, '#fff3b0', (x, y) => x + y < 24).ell(12, 12, 4.5, 4.5, '#ffcd75');
      P.rect(11, 8, 2, 8, '#ef7d57').rect(10, 9, 4, 1, '#ef7d57').rect(10, 14, 4, 1, '#ef7d57');
      P.px(6, 7, W).px(7, 6, W).px(6, 8, W);
      return P.outline();
    },

    /* ----- senjata ----- */
    pedangKayu: () => sword(['#f0c590', '#d4a373', '#ab5236'], '#6d4b27', '#3b2a17', '#ab5236'),
    pedangPenjumlah: () => {
      const P = sword(['#c7f0ff', '#73eff7', '#41a6f6'], '#ffcd75', '#ef7d57', '#3b5dc9', '#38b764');
      P.rect(17, 17, 5, 1, '#38b764').rect(19, 15, 1, 5, '#38b764');                       // tanda +
      return P.outline();
    },
    kapakPengurang() {
      const P = grid(N, N);
      for (let k = 0; k < 16; k++) P.px(3 + k, 21 - k, '#ab5236').px(4 + k, 21 - k, '#6d4b27');
      P.ell(16, 7, 8, 7.5, '#f4a3c8', (x, y) => x + y >= 20 && x - y >= 1);
      P.recolor('#f4a3c8', '#d47a9a', (x, y) => y > 8);
      P.ell(16, 7, 7, 6.5, '#ffe4f0', (x, y) => x + y >= 21 && x - y >= 2 && (x - 16) * (x - 16) + (y - 7) * (y - 7) > 30);
      P.rect(3, 18, 4, 1, '#e43b44');                                                        // tanda −
      return P.outline();
    },
    tongkatBentuk() {
      const P = grid(N, N);
      P.rect(11, 9, 2, 14, '#ab5236').rect(12, 9, 1, 14, '#6d4b27');
      P.rect(9, 9, 6, 2, '#ffcd75');
      P.ell(12, 5, 4.5, 4.5, '#38b764').recolor('#38b764', '#257179', (x, y) => x > 12 && y > 5);
      P.px(10, 3, W).px(11, 3, W).px(10, 4, W);
      P.rect(2, 3, 3, 3, '#41a6f6').px(20, 2, '#e43b44').rect(19, 3, 3, 1, '#e43b44');      // kotak & segitiga melayang
      P.ell(20, 12, 1.8, 1.8, '#ffcd75');
      return P.outline();
    },
    paluPuluhan() {
      const P = grid(N, N);
      P.rect(11, 11, 3, 12, '#ab5236').rect(13, 11, 1, 12, '#6d4b27');
      P.rect(3, 3, 18, 9, '#94b0c2').rect(3, 9, 18, 3, '#566c86').rect(3, 3, 18, 1, '#c7d3de');
      P.rect(2, 4, 1, 7, '#ffcd75').rect(21, 4, 1, 7, '#ffcd75');
      // angka 10 di kepala palu
      P.rect(7, 5, 1, 5, '#1a1c2c').rect(10, 5, 4, 1, '#1a1c2c').rect(10, 9, 4, 1, '#1a1c2c').rect(10, 5, 1, 5, '#1a1c2c').rect(13, 5, 1, 5, '#1a1c2c');
      P.px(4, 4, W).px(5, 4, W);
      return P.outline();
    },
    pedangKristal: () => sword(['#f4d3f0', '#f4a3c8', '#b06fd0'], '#c7d3de', '#566c86', '#5d275d', '#b06fd0'),
    pedangPahlawan: () => {
      const P = sword(['#ffffff', '#c7d3de', '#94b0c2'], '#ffcd75', '#ef7d57', '#b13e53', '#e43b44');
      [[19, 9], [14, 2], [22, 6]].forEach(([x, y]) => P.px(x, y, '#ffcd75'));                // kilau sakti
      return P.outline();
    },

    /* ----- pelindung ----- */
    perisaiKayu() {
      const P = grid(N, N);
      P.ell(12, 12, 10.5, 10.5, '#6d4b27').ell(12, 12, 9, 9, '#d4a373');
      for (let x = 6; x < 20; x += 4) P.rect(x, 3, 1, 18, '#ab5236');
      P.recolor('#d4a373', '#ab5236', (x, y) => x + y > 28);
      P.ell(12, 12, 3, 3, '#94b0c2').px(11, 11, W);
      P.px(6, 6, W).px(7, 5, W);
      return P.outline();
    },
    perisaiBatu: () => kite('#333c57', ['#94b0c2', '#566c86'], P => { P.rect(9, 8, 6, 6, '#c7d3de').rect(12, 8, 3, 6, '#94b0c2'); }),
    perisaiMutiara: () => kite('#3b5dc9', ['#c7f0ff', '#73eff7'], P => { P.ell(12, 10, 3.5, 3.5, W).recolor(W, '#c7d3de', (x, y) => x > 12 && y > 10); P.px(11, 8, W); }),
    zirahPahlawan: () => kite('#ef7d57', ['#ffcd75', '#e4a030'], P => {
      P.rect(10, 5, 4, 12, '#e43b44').rect(6, 8, 12, 4, '#e43b44'); P.rect(11, 6, 1, 10, '#f68aa5');
    }),

    /* ----- aksesori ----- */
    kalungKoin: () => pendant('#94b0c2', P => {
      P.ell(12, 15, 5.5, 5.5, '#ffcd75').recolor('#ffcd75', '#ef7d57', (x, y) => x + y > 28).rect(11, 13, 2, 5, '#ef7d57'); P.px(9, 12, W);
    }),
    cincinBintang: () => {
      const P = ring('#ffcd75', '#ef7d57', '#73eff7', '#41a6f6');
      P.px(3, 3, '#ffcd75').px(20, 2, '#ffcd75').px(21, 3, '#ffcd75');
      return P.outline();
    },
    jimatKilat: () => pendant('#ab5236', P => {
      for (let y = 9; y < 22; y++) { const hw = Math.round(y < 15 ? (y - 9) * 0.9 : (22 - y) * 0.75); P.rect(12 - hw, y, hw * 2 + 1, 1, '#73eff7'); }
      [[13, 10], [12, 11], [11, 12], [10, 13], [11, 14], [12, 14], [13, 14], [12, 15], [11, 16], [10, 17]].forEach(([x, y]) => P.px(x, y, '#ffcd75'));
    }),
    jimatTinta: () => pendant('#5d275d', P => {
      P.ell(12, 15, 6, 6.5, '#3b5dc9').recolor('#3b5dc9', '#29366f', (x, y) => x > 13 && y > 15);
      P.ell(12, 15, 2.5, 2.5, '#73eff7').px(9, 12, W).px(10, 11, W);
    }),
    mahkotaBijak: () => crown('#73eff7', '#41a6f6', ['#b06fd0', '#ffcd75', '#b06fd0']),

    /* ----- ikon menu (2026-11-26) ----- */
    /** Logo pahlawan tetap: helm kesatria berjambul merah (tidak ikut berubah penampilan). */
    ui_hero() {
      const P = grid(N, N);
      for (let k = 0; k < 7; k++) P.rect(13 + k, 1 + Math.round(k * 0.6), 3, 4 - Math.round(k * 0.3), k < 3 ? '#e43b44' : '#b13e53'); // jambul
      P.ell(12, 13, 8.5, 9, '#c7d3de', (x, y) => y <= 18).rect(4, 13, 17, 6, '#c7d3de');
      P.recolor('#c7d3de', '#94b0c2', (x, y) => x > 14);
      P.rect(6, 11, 13, 3, '#1a1c2c').rect(11, 14, 3, 5, '#1a1c2c');                    // celah mata & hidung
      P.px(8, 12, '#73eff7').px(15, 12, '#73eff7');                                      // mata bersinar
      P.rect(11, 4, 2, 7, '#ffcd75').rect(3, 19, 19, 2, '#ffcd75').rect(3, 20, 19, 1, '#ef7d57'); // garis & kerah emas
      P.px(7, 7, W).px(8, 6, W).px(6, 9, W);
      return P.outline();
    },
    ui_bag() {
      const P = grid(N, N);
      P.ell(12, 15, 9, 7.5, '#ab5236').rect(4, 10, 17, 6, '#ab5236');
      P.recolor('#ab5236', '#6d4b27', (x, y) => x > 15 || y > 19);
      P.rect(8, 4, 9, 2, '#6d4b27').rect(8, 4, 2, 6, '#6d4b27').rect(15, 4, 2, 6, '#6d4b27'); // tali
      P.rect(5, 10, 15, 4, '#d4a373').rect(11, 12, 3, 4, '#ffcd75').px(12, 14, '#1a1c2c');   // tutup & kancing
      P.rect(7, 17, 4, 3, '#d4a373');                                                         // kantong
      P.px(6, 11, W).px(7, 11, W);
      return P.outline();
    },
    ui_home() {
      const P = grid(N, N);
      P.rect(4, 11, 16, 11, '#ffe4c4').rect(14, 11, 6, 11, '#d4a373');
      for (let y = 2; y < 12; y++) { const w = (y - 2) * 1.3; P.rect(12 - w - 1, y, w * 2 + 3, 1, '#e43b44'); }
      P.recolor('#e43b44', '#b13e53', (x, y) => x > 13);
      P.rect(10, 15, 4, 7, '#ab5236').px(13, 18, '#ffcd75');                                  // pintu
      P.rect(5, 13, 3, 3, '#73eff7').rect(16, 13, 3, 3, '#73eff7');                           // jendela
      P.rect(16, 3, 3, 5, '#566c86');                                                         // cerobong
      P.px(9, 5, W).px(10, 4, W);
      return P.outline();
    },
    ui_dungeon() {
      const P = grid(N, N);
      P.rect(2, 6, 20, 17, '#94b0c2');
      for (let y = 6; y < 23; y += 4) for (let x = 2 + ((y / 4) % 2) * 3; x < 22; x += 6) P.rect(x, y, 1, 4, '#566c86');
      for (let y = 6; y < 23; y += 4) P.rect(2, y, 20, 1, '#566c86');
      [2, 8, 14, 20].forEach(x => P.rect(x, 3, 2, 3, '#94b0c2'));                             // gerigi
      P.ell(12, 16, 5, 7, '#1a1c2c', (x, y) => y >= 9).rect(7, 16, 10, 7, '#1a1c2c');           // pintu gelap
      P.px(10, 15, '#ffcd75').px(13, 15, '#ffcd75');                                          // mata mengintip
      P.recolor('#94b0c2', '#7a92a8', (x, y) => x > 16);
      P.px(3, 7, W).px(4, 7, W);
      return P.outline();
    },
    ui_shop() {
      const P = grid(N, N);
      for (let x = 2; x < 22; x++) P.rect(x, 4, 1, 6, Math.floor((x - 2) / 3) % 2 ? '#f4f4f4' : '#e43b44');  // tenda bergaris
      for (let x = 2; x < 22; x += 3) P.ell(x + 1.5, 10, 1.6, 1.6, Math.floor((x - 2) / 3) % 2 ? '#f4f4f4' : '#e43b44');
      P.rect(3, 12, 18, 10, '#d4a373').rect(3, 12, 18, 2, '#ab5236').rect(15, 14, 6, 8, '#ab5236');
      P.ell(9, 17, 3, 3, '#ffcd75').px(8, 16, '#fff3b0');                                     // koin di meja
      P.rect(13, 16, 3, 4, '#e43b44').rect(13, 15, 3, 1, '#c7f0ff');                          // ramuan
      return P.outline();
    },
    ui_book() {
      const P = grid(N, N);
      P.rect(4, 3, 16, 19, '#3b5dc9').rect(4, 3, 3, 19, '#29366f').rect(18, 4, 3, 17, '#f4f4f4');
      P.ell(13, 12, 4.5, 4, '#38b764', (x, y) => y <= 14).rect(9, 13, 9, 3, '#38b764');      // lendir di sampul
      P.px(11, 12, '#1a1c2c').px(15, 12, '#1a1c2c').px(11, 11, W).px(15, 11, W);
      P.rect(9, 18, 8, 1, '#ffcd75');
      P.px(8, 5, W).px(9, 5, W);
      return P.outline();
    },
    ui_quest() {
      const P = grid(N, N);
      P.rect(5, 4, 14, 16, '#ffe4c4').ell(5, 12, 2, 8, '#d4a373').ell(19, 12, 2, 8, '#d4a373');
      P.rect(3, 4, 4, 2, '#ab5236').rect(17, 18, 4, 2, '#ab5236');
      for (let y = 8; y < 17; y += 3) P.rect(8, y, 6, 1, '#d4a373');
      // bintang
      [[16, 7], [15, 8], [16, 8], [17, 8], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [15, 10], [16, 10], [17, 10], [15, 11], [17, 11]].forEach(([x, y]) => P.px(x, y, '#ffcd75'));
      return P.outline();
    },
    ui_medal() {
      const P = grid(N, N);
      for (let k = 0; k < 8; k++) { P.rect(5 + k * 0.5, k, 4, 1, '#41a6f6'); P.rect(15 - k * 0.5, k, 4, 1, '#e43b44'); } // pita
      P.ell(12, 15, 7.5, 7.5, '#ffcd75').recolor('#ffcd75', '#ef7d57', (x, y) => x + y > 28);
      P.ell(12, 15, 4.5, 4.5, '#fff3b0').ell(12, 15, 3, 3, '#ffcd75');
      P.px(12, 13, '#ef7d57').px(11, 15, '#ef7d57').px(13, 15, '#ef7d57').px(12, 16, '#ef7d57');
      P.px(7, 11, W).px(8, 10, W);
      return P.outline();
    },
    ui_smith() {
      const P = grid(N, N);
      P.rect(3, 13, 18, 4, '#566c86').rect(2, 12, 6, 3, '#566c86').rect(8, 17, 8, 3, '#333c57').rect(6, 20, 12, 3, '#566c86'); // landasan
      P.rect(3, 13, 18, 1, '#94b0c2');
      for (let k = 0; k < 9; k++) P.px(9 + k, 11 - k, '#ab5236').px(10 + k, 11 - k, '#6d4b27');   // gagang palu
      P.rect(14, 1, 7, 5, '#94b0c2').rect(14, 4, 7, 2, '#566c86');                                 // kepala palu
      [[5, 9], [3, 7], [7, 7], [20, 10]].forEach(([x, y]) => P.px(x, y, '#ffcd75'));               // percikan
      return P.outline();
    },
    ui_class() {
      const P = grid(N, N);
      for (let y = 4; y < 12; y++) { const hw = y < 8 ? (y - 4) * 2.5 + 1 : (12 - y) * 2.5 + 1; P.rect(12 - hw, y, hw * 2, 1, '#333c57'); } // topi toga
      P.recolor('#333c57', '#566c86', (x, y) => y < 7);
      P.rect(7, 11, 10, 5, '#29366f').ell(12, 16, 5, 2, '#29366f');
      P.rect(18, 8, 1, 8, '#ffcd75').rect(17, 16, 3, 3, '#ffcd75');                                // rumbai
      P.rect(4, 19, 16, 3, '#f4f4f4').rect(4, 21, 16, 1, '#c7d3de').rect(3, 19, 1, 3, '#e43b44');  // buku
      return P.outline();
    },
    ui_music() {
      const P = grid(N, N);
      P.rect(8, 4, 2, 14, '#ffcd75').rect(17, 2, 2, 14, '#ffcd75').rect(8, 2, 11, 3, '#ef7d57');
      P.ell(6.5, 18, 3.5, 2.8, '#ffcd75').ell(15.5, 16, 3.5, 2.8, '#ffcd75').px(5, 17, W).px(14, 15, W);
      P.recolor('#ffcd75', '#ef7d57', (x, y) => y > 18);
      return P.outline();
    },
    ui_mute() {
      const P = DRAW.ui_music();
      for (let k = 0; k < 20; k++) P.px(2 + k, 2 + k, '#e43b44').px(3 + k, 2 + k, '#e43b44');
      return P;
    },
    ui_parent() {
      const P = grid(N, N);
      P.ell(8, 6, 3.5, 3.5, '#ffd8b0').ell(8, 16, 5.5, 7, '#41a6f6', (x, y) => y >= 11);           // orang tua
      P.ell(17, 11, 2.8, 2.8, '#ffd8b0').ell(17, 18, 4, 5, '#e43b44', (x, y) => y >= 15);          // anak
      P.rect(6, 3, 5, 2, '#6d4b27').rect(15, 8, 4, 2, '#ab5236');
      P.px(7, 6, '#1a1c2c').px(9, 6, '#1a1c2c').px(16, 11, '#1a1c2c').px(18, 11, '#1a1c2c');
      P.ell(13, 3, 2, 1.6, '#e43b44').px(12, 4, '#e43b44');                                         // hati
      return P.outline();
    }
  };

  const urls = {};
  /** Data-URL ikon item (null bila belum ada gambar baru). */
  function url(id, scale = 4) {
    if (!DRAW[id]) return null;
    const key = id + '|' + scale;
    if (urls[key]) return urls[key];
    const src = DRAW[id]().canvas(), c = document.createElement('canvas');
    c.width = src.width * scale; c.height = src.height * scale;
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, c.width, c.height);
    return (urls[key] = c.toDataURL());
  }
  return {url, has: id => !!DRAW[id], DRAW};
})();
