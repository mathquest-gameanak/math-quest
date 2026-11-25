/* Math Quest — tokoh cerita baru 32×32 (2026-11-25): Kakek Bilang, Kiki, Penyihir Kusut, Momo, Kapten Kumis,
   Hantu Buku, serta Kristal Angka & kepingannya. Digambar dari bentuk (MQ.Pix) seperti pahlawan & monster,
   lalu didaftarkan ke MQ.Pix.MONSTERS sehingga MQ.Pix.url(nama) dipakai cutscene. */
'use strict';
window.MQ = window.MQ || {};

(() => {
  const {grid} = MQ.Pix, K = MQ.Pix.K, W = '#f4f4f4';
  const eyes = (P, x1, x2, y, h = 2) => { P.rect(x1, y, 2, h, K).rect(x2, y, 2, h, K); P.px(x1, y, W).px(x2, y, W); };

  /** Kakek Bilang: kepala desa, botak berjanggut putih, jubah hijau, tongkat kayu. */
  function kakek() {
    const P = grid(32, 32), cx = 15, SK = '#ffd8b0', G = '#38b764', GS = '#257179';
    P.rect(cx + 8, 9, 2, 21, '#ab5236').rect(cx + 7, 8, 3, 2, '#ab5236').px(cx + 6, 9, '#ab5236');     // tongkat
    P.ell(cx, 23, 7.5, 8, G, (x, y) => y >= 15);                                                       // jubah
    P.rect(cx - 5, 15, 10, 3, G); P.recolor(G, GS, (x, y) => x >= cx + 3 && y >= 17);
    P.rect(cx - 6, 22, 12, 1, '#ffcd75'); P.rect(cx - 1, 23, 2, 6, '#a7f070');                          // sabuk & hiasan
    P.ell(cx + 7, 18, 1.6, 1.6, SK);                                                                    // tangan di tongkat
    P.ell(cx, 10, 6, 5.6, SK);                                                                          // kepala botak
    P.px(cx - 3, 5, W).px(cx - 2, 5, W);                                                                // kilau botak
    P.ell(cx - 5.6, 10, 1.6, 2.6, W).ell(cx + 5.6, 10, 1.6, 2.6, W);                                    // rambut samping
    P.rect(cx - 4, 8, 3, 1, W).rect(cx + 1, 8, 3, 1, W);                                                // alis putih tebal
    P.px(cx - 3, 10, K).px(cx - 2, 10, K).px(cx + 2, 10, K).px(cx + 3, 10, K);                          // mata tersenyum
    P.ell(cx, 16, 5, 5.5, W, (x, y) => y >= 12);                                                        // janggut
    P.rect(cx - 3, 12, 6, 1, W); P.px(cx - 1, 13, '#b13e53').px(cx, 13, '#b13e53');                    // kumis & mulut
    P.px(cx - 5, 11, '#f68aa5').px(cx + 4, 11, '#f68aa5');
    P.rect(cx - 3, 29, 2, 1, '#5d275d').rect(cx + 1, 29, 2, 1, '#5d275d');
    return P.outline();
  }

  /** Kakek Bilang mengajar (layar Kelas): tangan terangkat, penunjuk kayu berujung kapur ke kiri-atas. */
  function kakekTunjuk() {
    const P = grid(32, 32), cx = 17, SK = '#ffd8b0', G = '#38b764', GS = '#257179';
    for (let k = 0; k < 10; k++) P.px(Math.round(cx - 10 - k * 0.65), 10 - k, '#d4a373');             // penunjuk
    P.px(cx - 16, 1, W).px(cx - 16, 0, W);                                                             // ujung kapur
    P.ell(cx, 23, 7.5, 8, G, (x, y) => y >= 15);                                                       // jubah
    P.rect(cx - 5, 15, 10, 3, G); P.recolor(G, GS, (x, y) => x >= cx + 3 && y >= 17);
    P.rect(cx - 9, 14, 4, 3, G).rect(cx - 10, 12, 3, 3, G);                                           // lengan terangkat
    P.ell(cx - 10, 11, 1.6, 1.6, SK);                                                                  // tangan
    P.rect(cx - 6, 22, 12, 1, '#ffcd75'); P.rect(cx - 1, 23, 2, 6, '#a7f070');                          // sabuk & hiasan
    P.ell(cx + 6, 21, 1.6, 1.6, SK);                                                                   // tangan satunya
    P.ell(cx, 10, 6, 5.6, SK);                                                                          // kepala botak
    P.px(cx - 3, 5, W).px(cx - 2, 5, W);
    P.ell(cx - 5.6, 10, 1.6, 2.6, W).ell(cx + 5.6, 10, 1.6, 2.6, W);
    P.rect(cx - 4, 8, 3, 1, W).rect(cx + 1, 8, 3, 1, W);
    P.rect(cx - 3, 10, 2, 2, K).rect(cx + 2, 10, 2, 2, K).px(cx - 3, 10, W).px(cx + 2, 10, W);         // mata terbuka (sedang menjelaskan)
    P.ell(cx, 16, 5, 5.5, W, (x, y) => y >= 12);
    P.rect(cx - 3, 12, 6, 1, W); P.rect(cx - 1, 13, 3, 2, '#b13e53');                                  // mulut berbicara
    P.px(cx - 5, 12, '#f68aa5').px(cx + 4, 12, '#f68aa5');
    P.rect(cx - 3, 29, 2, 1, '#5d275d').rect(cx + 1, 29, 2, 1, '#5d275d');
    return P.outline();
  }

  /** Kakek Bilang mengajar (layar Kelas): tangan terangkat, penunjuk kayu berujung kapur ke kiri-atas. */
  function kakekTunjuk() {
    const P = grid(32, 32), cx = 17, SK = '#ffd8b0', G = '#38b764', GS = '#257179';
    for (let k = 0; k < 10; k++) P.px(Math.round(cx - 10 - k * 0.65), 10 - k, '#d4a373');             // penunjuk
    P.px(cx - 16, 1, W).px(cx - 16, 0, W);                                                             // ujung kapur
    P.ell(cx, 23, 7.5, 8, G, (x, y) => y >= 15);                                                       // jubah
    P.rect(cx - 5, 15, 10, 3, G); P.recolor(G, GS, (x, y) => x >= cx + 3 && y >= 17);
    P.rect(cx - 9, 14, 4, 3, G).rect(cx - 10, 12, 3, 3, G);                                           // lengan terangkat
    P.ell(cx - 10, 11, 1.6, 1.6, SK);                                                                  // tangan
    P.rect(cx - 6, 22, 12, 1, '#ffcd75'); P.rect(cx - 1, 23, 2, 6, '#a7f070');                          // sabuk & hiasan
    P.ell(cx + 6, 21, 1.6, 1.6, SK);                                                                   // tangan satunya
    P.ell(cx, 10, 6, 5.6, SK);                                                                          // kepala botak
    P.px(cx - 3, 5, W).px(cx - 2, 5, W);
    P.ell(cx - 5.6, 10, 1.6, 2.6, W).ell(cx + 5.6, 10, 1.6, 2.6, W);
    P.rect(cx - 4, 8, 3, 1, W).rect(cx + 1, 8, 3, 1, W);
    P.rect(cx - 3, 10, 2, 2, K).rect(cx + 2, 10, 2, 2, K).px(cx - 3, 10, W).px(cx + 2, 10, W);         // mata terbuka (sedang menjelaskan)
    P.ell(cx, 16, 5, 5.5, W, (x, y) => y >= 12);
    P.rect(cx - 3, 12, 6, 1, W); P.rect(cx - 1, 13, 3, 2, '#b13e53');                                  // mulut berbicara
    P.px(cx - 5, 12, '#f68aa5').px(cx + 4, 12, '#f68aa5');
    P.rect(cx - 3, 29, 2, 1, '#5d275d').rect(cx + 1, 29, 2, 1, '#5d275d');
    return P.outline();
  }

  /** Kiki: burung hantu kecil cokelat, mata besar, perut krem bermotif, jambul telinga. */
  function kiki() {
    const P = grid(32, 32), cx = 15, B = '#ab5236', BS = '#5d275d', C = '#ffe4c4';
    P.ell(cx, 19, 8, 9.5, B);
    P.px(cx - 7, 9, B).rect(cx - 7, 10, 2, 2, B).px(cx + 6, 9, B).rect(cx + 5, 10, 2, 2, B);            // jambul
    P.ell(cx - 7.5, 21, 2.4, 5, BS).ell(cx + 7.5, 21, 2.4, 5, BS);                                     // sayap
    P.ell(cx, 23, 5, 5.5, C);
    for (let y = 20; y < 28; y += 3) [-2, 1].forEach(dx => P.px(cx + dx, y, '#d4a373').px(cx + dx + 1, y + 1, '#d4a373'));
    P.ell(cx - 3, 15, 3, 3, W).ell(cx + 3, 15, 3, 3, W);                                               // mata besar
    P.rect(cx - 4, 14, 2, 3, K).rect(cx + 2, 14, 2, 3, K).px(cx - 4, 14, W).px(cx + 2, 14, W);
    P.px(cx - 1, 18, '#ffcd75').px(cx, 18, '#ffcd75').px(cx - 1, 19, '#ef7d57');                      // paruh
    P.rect(cx - 4, 28, 2, 1, '#ffcd75').rect(cx + 2, 28, 2, 1, '#ffcd75');                              // kaki
    return P.outline();
  }

  /** Penyihir Kusut: topi ungu runcing berbintang, kulit hijau, jubah ungu, tongkat sihir bintang. Lucu, tidak seram. */
  function penyihir() {
    const P = grid(32, 32), cx = 14, PU = '#b06fd0', PS = '#5d275d', SK = '#a7f070';
    P.rect(cx + 8, 12, 1, 15, '#5d275d'); P.px(cx + 8, 9, '#ffcd75').rect(cx + 7, 10, 3, 1, '#ffcd75').px(cx + 8, 11, '#ffcd75'); // tongkat
    P.ell(cx, 24, 7.5, 7, PU, (x, y) => y >= 17);                                                      // jubah
    P.rect(cx - 5, 17, 10, 3, PU); P.recolor(PU, PS, (x, y) => x >= cx + 3 && y >= 19);
    P.px(cx - 3, 23, '#ffcd75').px(cx + 1, 26, '#ffcd75');                                              // bintang di jubah
    P.ell(cx + 6.5, 20, 1.5, 1.5, SK);
    P.ell(cx, 13, 5.5, 4.8, SK);                                                                        // wajah
    P.ell(cx - 5.5, 15, 1.8, 3.5, '#333c57').ell(cx + 5.5, 15, 1.8, 3.5, '#333c57');                   // rambut kusut
    P.px(cx - 7, 17, '#333c57').px(cx + 7, 18, '#333c57');
    P.ell(cx, 9, 8.5, 1.6, PU);                                                                         // pinggir topi
    for (let i = 0; i < 7; i++) P.rect(cx - 4 + Math.round(i * 0.45), 8 - i, Math.max(1, 8 - Math.round(i * 1.2)), 1, PU);
    P.px(cx + 3, 1, PU).px(cx + 4, 1, PU).px(cx + 5, 2, PU);
    P.rect(cx - 4, 7, 8, 1, '#ffcd75'); P.px(cx - 1, 4, '#ffcd75');                                     // pita & bintang topi
    P.recolor(PU, PS, (x, y) => x >= cx + 1 && y < 7 && y > 1);
    P.px(cx - 4, 11, K).px(cx - 3, 12, K).px(cx + 3, 11, K).px(cx + 2, 12, K);                          // alis jahil
    eyes(P, cx - 4, cx + 2, 13);
    P.rect(cx - 2, 16, 4, 1, '#e43b44').px(cx + 2, 15, '#e43b44');                                      // senyum licik
    return P.outline();
  }

  /** Momo: tikus tanah cokelat dengan helm tambang kuning berlampu, hidung merah muda. */
  function momo() {
    const P = grid(32, 32), cx = 15, B = '#8a5a3c', BL = '#d4a373';
    P.ell(cx, 21, 8.5, 8.5, B);
    P.ell(cx, 23, 5.5, 5.5, BL);
    P.ell(cx - 8, 22, 2.2, 1.6, '#f4a3c8').ell(cx + 8, 22, 2.2, 1.6, '#f4a3c8');                       // cakar
    P.ell(cx, 13, 7, 5, '#ffcd75', (x, y) => y <= 13);                                                  // helm
    P.rect(cx - 8, 13, 16, 1, '#ef7d57');
    P.ell(cx, 9, 2, 2, W).px(cx, 9, '#fff3b0');                                                         // lampu helm
    P.px(cx - 3, 10, '#fff3b0');
    P.rect(cx - 4, 16, 2, 2, K).rect(cx + 2, 16, 2, 2, K).px(cx - 4, 16, W).px(cx + 2, 16, W);          // mata kecil
    P.ell(cx, 19.5, 1.6, 1.2, '#f4a3c8');                                                               // hidung
    P.px(cx - 1, 21, K).px(cx, 21, K);
    P.px(cx - 6, 19, '#f68aa5').px(cx + 5, 19, '#f68aa5');
    P.rect(cx - 4, 29, 3, 1, '#5d275d').rect(cx + 1, 29, 3, 1, '#5d275d');
    return P.outline();
  }

  /** Kapten Kumis: kucing oranye bajak laut, topi tricorn bertengkorak, penutup mata, jas merah berkancing emas. */
  function kapten() {
    const P = grid(32, 32), cx = 15, O = '#ef7d57', R = '#b13e53', RS = '#5d275d';
    P.ell(cx, 24, 7, 6.5, R, (x, y) => y >= 18);                                                        // jas
    P.rect(cx - 5, 18, 10, 3, R); P.recolor(R, RS, (x, y) => x >= cx + 3 && y >= 20);
    [20, 23, 26].forEach(y => P.px(cx - 1, y, '#ffcd75'));                                              // kancing
    P.rect(cx - 6, 25, 12, 1, K); P.px(cx, 25, '#ffcd75');                                              // sabuk
    P.ell(cx, 13, 6.5, 5.5, O);                                                                         // kepala
    P.px(cx - 6, 7, O).rect(cx - 6, 8, 2, 2, O).px(cx + 5, 7, O).rect(cx + 4, 8, 2, 2, O);              // telinga
    P.ell(cx, 15.5, 3.2, 2.2, W);                                                                       // moncong
    P.px(cx - 1, 14, '#f4a3c8').px(cx, 14, '#f4a3c8');                                                  // hidung
    P.px(cx - 1, 16, K).px(cx, 16, K);
    [[-9, 14], [-9, 16], [8, 14], [8, 16]].forEach(([dx, y]) => P.rect(cx + dx, y, 3, 1, W));           // kumis panjang
    P.rect(cx - 4, 11, 2, 2, K).px(cx - 4, 11, W);                                                      // mata
    P.rect(cx + 1, 10, 4, 3, K); P.rect(cx - 6, 10, 13, 1, K);                                          // penutup mata
    P.ell(cx, 7, 8, 1.8, '#333c57'); P.rect(cx - 5, 3, 10, 4, '#333c57');                               // topi
    P.px(cx - 1, 4, W).px(cx, 4, W).px(cx - 1, 5, '#94b0c2').px(cx, 5, '#94b0c2');                     // tengkorak
    P.rect(cx - 5, 3, 10, 1, '#566c86');
    P.rect(cx - 4, 29, 3, 1, K).rect(cx + 1, 29, 3, 1, K);
    return P.outline();
  }

  /** Hantu Buku: hantu putih ramah berkacamata yang memeluk buku. */
  function hantuBuku() {
    const P = grid(28, 30), cx = 14, B = '#f4f4f4', BS = '#c7d3de';
    P.ell(cx, 11, 9, 9, B); P.rect(cx - 9, 11, 18, 12, B);
    for (let x = cx - 8; x < cx + 9; x++) P.rect(x, 22, 1, 2 + Math.round(Math.sin(x * 1.3) * 1.5), B);
    P.recolor(B, BS, (x) => x > cx + 4);
    [cx - 5, cx + 1].forEach(x => { P.rect(x, 8, 4, 1, K).rect(x, 12, 4, 1, K).rect(x, 9, 1, 3, K).rect(x + 3, 9, 1, 3, K); });
    P.px(cx - 1, 10, K); P.rect(cx - 3, 10, 1, 2, K).rect(cx + 2, 10, 1, 2, K);                          // kacamata & mata
    P.rect(cx - 1, 14, 2, 1, K);
    P.rect(cx - 6, 16, 12, 6, '#3b5dc9'); P.rect(cx - 5, 17, 5, 4, W).rect(cx + 1, 17, 4, 4, W).rect(cx, 16, 1, 6, '#29366f');  // buku terbuka
    P.rect(cx - 4, 18, 3, 1, BS).rect(cx + 2, 18, 2, 1, BS);
    return P.outline();
  }

  /** Kristal Angka: permata besar bersegi dengan kilau. */
  function crystal() {
    const P = grid(26, 32), cx = 13, C = '#73eff7', CS = '#41a6f6', CL = '#c7f0ff';
    for (let y = 2; y < 30; y++) {
      const hw = y < 10 ? Math.round((y - 2) * 1.35) + 1 : Math.round((30 - y) * 0.55);
      P.rect(cx - hw, y, hw * 2, 1, C);
    }
    P.recolor(C, CS, (x, y) => x >= cx + 2);
    P.recolor(C, CL, (x, y) => x < cx - 3 && y < 16);
    P.rect(cx - 9, 10, 18, 1, CS);                                                                       // garis segi
    for (let y = 3; y < 28; y++) P.px(cx, y, y < 10 ? CL : C);
    P.px(cx - 5, 6, W).px(cx - 6, 7, W).px(cx - 4, 7, W).px(cx - 5, 8, W);                              // kilau bintang
    return P.outline();
  }
  function shard() {
    const P = grid(12, 14), cx = 6;
    for (let y = 1; y < 13; y++) { const hw = y < 5 ? y : Math.round((13 - y) * 0.6); P.rect(cx - hw, y, hw * 2, 1, '#73eff7'); }
    P.recolor('#73eff7', '#41a6f6', x => x >= cx + 1); P.px(cx - 2, 3, W).px(cx - 3, 4, W);
    return P.outline();
  }

  /** Peti Teka-teki: peti kayu bersabuk emas dengan gembok bertanda tanya. */
  function peti() {
    const P = grid(28, 24), Y = '#ffcd75', YD = '#d4a373', WD = '#8a5a3c', WL = '#b86f50';
    P.ell(14, 8, 12, 5, WL); P.rect(2, 8, 24, 4, WL);                       // tutup melengkung
    P.rect(2, 12, 24, 10, WD);                                              // badan
    P.recolor(WD, '#5d3a28', (x, y) => x > 21);
    P.rect(2, 12, 24, 1, K);                                                // celah tutup
    [5, 20].forEach(x => P.rect(x, 3, 3, 19, Y).rect(x + 2, 3, 1, 19, YD)); // sabuk emas
    P.rect(2, 20, 24, 2, '#5d3a28');
    P.rect(10, 9, 8, 8, Y); P.rect(10, 15, 8, 2, YD);                       // gembok
    P.px(13, 10, K).px(14, 10, K).px(15, 11, K).px(14, 12, K).px(14, 14, K); // tanda ?
    P.px(4, 6, W).px(5, 5, W);                                              // kilau
    return P.outline();
  }

  /** Peti harta TERBUKA: tutup terangkat ke belakang, isi berkilau emas. */
  function petiBuka() {
    const P = grid(28, 24), Y = '#ffcd75', YD = '#d4a373', WD = '#8a5a3c', WL = '#b86f50';
    P.rect(3, 1, 22, 5, WL).rect(3, 1, 22, 1, '#d4886a');                  // tutup terbuka (terlihat dalamnya)
    P.rect(3, 5, 22, 2, '#5d3a28');
    [6, 19].forEach(x => P.rect(x, 1, 3, 6, Y));
    P.ell(14, 12, 11, 4, '#fff3b0'); P.ell(14, 12, 9, 3, Y);                // tumpukan emas berkilau
    P.px(9, 11, W).px(16, 10, W).px(20, 12, W).px(12, 13, '#ef7d57');
    P.rect(2, 13, 24, 9, WD); P.recolor(WD, '#5d3a28', (x, y) => x > 21);   // badan
    [5, 20].forEach(x => P.rect(x, 13, 3, 9, Y).rect(x + 2, 13, 1, 9, YD));
    P.rect(2, 20, 24, 2, '#5d3a28');
    P.rect(11, 14, 6, 5, Y).rect(13, 16, 2, 2, K);                          // gembok terbuka
    return P.outline();
  }

  Object.assign(MQ.Pix.MONSTERS, {kakek, kakekTunjuk, kiki, penyihir, momo, kapten, hantuBuku, crystal, shard, peti, petiBuka});
})();
