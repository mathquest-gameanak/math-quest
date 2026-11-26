/* Math Quest — langit & latar atas yang lebih kaya (2026-11-26).
   Sejak dunia tarung penuh layar, ruang di atas tokoh jadi luas. Lapisan ini mengisinya per tempat:
     back(H) = di belakang bukit/pohon (langit: awan berlapis, burung, balon, pelangi, gunung bersalju, ...)
     over(H) = di depan lapisan tengah tapi di belakang tokoh (langit-langit gua, ikan, lampu gantung, ...)
   H = alat dari scene.js (R, circle, hash, each, VW, VH, GY, camX, t, K) + ST = baris dunia teratas yang terlihat
   (di bawah HUD). Semua dalam piksel dunia. */
'use strict';
window.MQ = window.MQ || {};

MQ.SkyArt = (() => {
  const K = '#1a1c2c';
  /** Ulang posisi x melingkar (paralaks f, kecepatan v piksel/detik). */
  const wrap = (H, x0, f, v = 0, m = 40) => { const span = H.VW + m * 2; return (((x0 - H.camX * f + H.t * v) % span) + span) % span - m; };
  /** Awan gembung: lebar ±w, warna terang & bayangan bawah. */
  function cloud(H, x, y, w, c = '#f4f4f4', sh = '#c7d3de') {
    const r = Math.max(3, Math.round(w / 5));
    H.circle(x, y + 2, r, sh); H.circle(x + r * 1.6, y - 1, r + 2, sh); H.circle(x + r * 3.2, y + 2, r, sh);
    H.circle(x, y + 1, r, c); H.circle(x + r * 1.6, y - 2, r + 1, c); H.circle(x + r * 3.2, y + 1, r, c);
    H.R(c, x - r, y + 1, r * 4.4, r);
    H.R(sh, x - r + 1, y + r, r * 4.2, 1);
  }
  /** Dua lapis awan (jauh kecil pucat, dekat besar) di ruang langit yang terlihat. */
  function clouds(H, top, bottom, cFar = '#e8f4fa', cNear = '#f4f4f4', shNear = '#c7d3de', n = 3) {
    const span = Math.max(8, bottom - top);
    for (let i = 0; i < n + 1; i++) cloud(H, wrap(H, i * 61 + 17, 0.05, 1.2 + i * 0.3), top + 4 + H.hash(i + 30) * span * 0.45, 12, cFar, cFar);
    for (let i = 0; i < n; i++) cloud(H, wrap(H, i * 83, 0.12, 2.5 + i * 0.6), top + span * 0.25 + H.hash(i + 40) * span * 0.55, 20 + H.hash(i) * 8, cNear, shNear);
  }
  /** Kawanan burung berbentuk V yang mengepak, melintas berkala. */
  function birds(H, top, n = 4, c = K, speed = 9) {
    const x0 = wrap(H, 0, 0.1, speed, 60);
    for (let i = 0; i < n; i++) {
      const x = x0 - i * 6, y = top + 8 + Math.abs(i - 1) * 3 + Math.sin(H.t * 2 + i) * 1.5, up = Math.floor(H.t * 6 + i) % 2;
      H.R(c, x - 2, y + (up ? -1 : 1), 2, 1); H.R(c, x, y, 1, 1); H.R(c, x + 1, y + (up ? -1 : 1), 2, 1);
    }
  }
  /** Bintang berkelip berbentuk salib + bintang jatuh sesekali. */
  function stars(H, top, bottom, n = 22) {
    for (let i = 0; i < n; i++) {
      const x = wrap(H, H.hash(i + 70) * 400, 0.03), y = top + H.hash(i + 71) * (bottom - top), tw = Math.floor(H.t * 2 + i * 0.7) % 6;
      H.R(i % 5 ? '#c7d3de' : '#ffcd75', x, y, 1, 1);
      if (tw === 0 && i % 3 === 0) { H.R('#f4f4f4', x - 1, y, 3, 1); H.R('#f4f4f4', x, y - 1, 1, 3); }
    }
    const c = H.t % 7;
    if (c < 0.6) { const k = c / 0.6, x = H.VW * 0.2 + k * H.VW * 0.5, y = top + 6 + k * 14; for (let j = 0; j < 8; j++) H.R(j ? '#c7d3de' : '#f4f4f4', x - j * 2, y - j * 0.6, 2, 1); }
  }

  const ART = {
    padang: {
      back(H) {
        clouds(H, H.ST, H.GY - 36);
        birds(H, H.ST + 4);
        // balon udara melayang pelan
        const x = wrap(H, 40, 0.08, 1.5, 30), y = H.ST + 14 + Math.sin(H.t * 0.8) * 3;
        H.circle(x, y, 7, K); H.circle(x, y, 6, '#e43b44'); H.R('#ffcd75', x - 2, y - 6, 4, 12); H.R('#f4f4f4', x - 4, y - 3, 1, 2);
        H.R(K, x - 3, y + 6, 1, 4); H.R(K, x + 3, y + 6, 1, 4); H.R(K, x - 3, y + 10, 7, 4); H.R('#ab5236', x - 2, y + 11, 5, 2);
      }
    },
    hutan: {
      back(H) { clouds(H, H.ST, H.GY - 40, '#d6f1fa', '#f4f4f4', '#a6d4e0', 2); },
      over(H) {
        // kanopi daun menggantung di atas + sulur
        H.each(14, 0.6, (sx, k) => {
          const r = 7 + Math.round(H.hash(k + 50) * 4), y = H.ST - 2 + H.hash(k + 51) * 5;
          H.circle(sx, y, r + 1, K); H.circle(sx, y, r, '#257179'); H.circle(sx - 2, y - 2, r - 3, '#38b764');
          if (H.hash(k + 52) > 0.55) { const L = 10 + H.hash(k + 53) * 18; H.R('#257179', sx + 3, y + r - 1, 1, L); H.R('#a7f070', sx + 3, y + r + L - 1, 2, 2); }
        }, 20);
        // daun berguguran
        for (let i = 0; i < 6; i++) {
          const p = (H.t * 0.12 + H.hash(i + 60)) % 1, x = wrap(H, H.hash(i + 61) * 300 + Math.sin(H.t * 1.5 + i) * 6, 0.6), y = H.ST + 8 + p * (H.GY - H.ST - 10);
          H.R(i % 2 ? '#a7f070' : '#ffcd75', x, y, 2, 1); H.R(i % 2 ? '#38b764' : '#ef7d57', x + 1, y + 1, 1, 1);
        }
      }
    },
    bukit: {
      back(H) {
        // gunung besar bersalju di kejauhan
        H.each(70, 0.06, (sx, k) => {
          const h = 34 + H.hash(k + 80) * 18, base = H.GY - 26, w = 60;
          for (let i = 0; i <= w; i++) {
            const top = base - h + Math.abs(i - w / 2) / (w / 2) * h;
            H.R(i < w / 2 ? '#94b0c2' : '#7a92a8', sx + i, top, 1, base - top);
            if (top < base - h * 0.7) H.R('#f4f4f4', sx + i, top, 1, Math.max(1, Math.round(base - h * 0.7 - top)));
          }
        }, 60);
        clouds(H, H.ST, H.GY - 50, '#e8f4fa', '#f4f4f4', '#c7d3de', 2);
        // awan berbentuk bangun datar (Bukit Bentuk!)
        const sh = [['c', '#f4a3c8'], ['t', '#ffcd75'], ['s', '#73eff7']];
        sh.forEach(([s, c], i) => {
          const x = wrap(H, i * 70 + 30, 0.09, 1.8), y = H.ST + 10 + i * 9 + Math.sin(H.t + i) * 2;
          if (s === 'c') { H.circle(x, y, 6, '#f4f4f4'); H.circle(x, y, 4, c); }
          else if (s === 's') { H.R('#f4f4f4', x - 6, y - 6, 12, 12); H.R(c, x - 4, y - 4, 8, 8); }
          else for (let j = 0; j < 10; j++) { H.R('#f4f4f4', x - j / 1.4 - 1, y - 6 + j, j * 1.4 + 2, 1); if (j > 1 && j < 9) H.R(c, x - j / 1.4 + 1, y - 6 + j, Math.max(1, j * 1.4 - 2), 1); }
        });
        // elang berputar
        const a = H.t * 0.7, ex = H.VW * 0.5 + Math.cos(a) * 18, ey = H.ST + 16 + Math.sin(a) * 5, up = Math.floor(H.t * 4) % 2;
        H.R('#5d275d', ex - 4, ey + (up ? -1 : 0), 4, 1); H.R('#5d275d', ex + 1, ey + (up ? -1 : 0), 4, 1); H.R('#ab5236', ex, ey, 1, 2);
      }
    },
    danau: {
      back(H) {
        // pelangi samar
        const cx = H.VW * 0.35 - H.camX * 0.04, cy = H.GY - 30, cols = ['#e43b4466', '#ef7d5766', '#ffcd7566', '#a7f07066', '#73eff766', '#b06fd066'];
        cols.forEach((c, i) => { const r = 46 - i * 2; for (let a = Math.PI; a <= Math.PI * 2; a += 0.03) H.R(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.75, 2, 2); });
        clouds(H, H.ST, H.GY - 36);
        birds(H, H.ST + 10, 3, '#f4f4f4', 12); // camar putih
      }
    },
    lembah: {
      back(H) {
        // bukit karang tinggi (mesa) di kejauhan
        H.each(48, 0.08, (sx, k) => {
          const h = 26 + H.hash(k + 90) * 22, w = 18 + H.hash(k + 91) * 14, base = H.GY - 24;
          H.R('#c28553', sx, base - h, w, h + 30); H.R('#d9a066', sx, base - h, w, 2); H.R('#ab5236', sx + w - 3, base - h, 3, h + 30);
          for (let y = base - h + 6; y < base; y += 7) H.R('#ab5236', sx + 2, y, w - 5, 1);
        }, 40);
        clouds(H, H.ST, H.GY - 52, '#fbe9c0', '#fff3e0', '#f0c590', 2);
        // burung elang & debu angin
        birds(H, H.ST + 6, 2, '#5d275d', 7);
        for (let i = 0; i < 5; i++) { const x = wrap(H, i * 47, 0.3, 26), y = H.GY - 30 - i * 6; H.R('#f9dca2', x, y, 6, 1); }
      }
    },
    menara: {
      back(H) {
        stars(H, H.ST, H.GY - 30, 26);
        // bulan besar dengan kawah & cahaya
        const mx = 22 - H.camX * 0.02, my = H.ST + 16;
        H.circle(mx, my, 13, '#3b4a8a'); H.circle(mx, my, 10, '#fff3b0'); H.circle(mx - 3, my - 2, 2, '#e8d890'); H.circle(mx + 4, my + 3, 3, '#e8d890');
        // lentera kertas melayang naik
        for (let i = 0; i < 4; i++) {
          const p = (H.t * 0.05 + H.hash(i + 100)) % 1, x = wrap(H, H.hash(i + 101) * 260, 0.15) + Math.sin(H.t + i) * 3, y = H.GY - 30 - p * (H.GY - 30 - H.ST);
          H.R(K, x - 2, y - 3, 5, 6); H.R(Math.floor(H.t * 4 + i) % 3 ? '#ffcd75' : '#ef7d57', x - 1, y - 2, 3, 4);
        }
      }
    },
    kastil: {
      back(H) {
        // awan badai gelap bergulung + kilat sesekali + kelelawar
        const c = H.t % 5;
        if (c < 0.15) H.R('#f4f4f455', 0, H.ST, H.VW, H.GY - H.ST);
        clouds(H, H.ST, H.GY - 50, '#7a3466', '#5d275d', '#3b2a5d', 3);
        birds(H, H.ST + 12, 3, K, 14);
      }
    },
    arena: {
      back(H) {
        clouds(H, H.ST, H.GY - 40);
        // tali bendera warna-warni
        for (let row = 0; row < 2; row++) {
          const y0 = H.ST + 4 + row * 14;
          for (let x = -2; x < H.VW + 2; x++) H.R('#5d275d', x, y0 + Math.round(Math.sin((x + row * 20) / H.VW * Math.PI) * 4), 1, 1);
          for (let x = 4 + row * 5; x < H.VW; x += 10) {
            const y = y0 + Math.round(Math.sin((x + row * 20) / H.VW * Math.PI) * 4), c = ['#e43b44', '#ffcd75', '#41a6f6', '#38b764'][(x / 10 + row) & 3];
            const sway = Math.floor(H.t * 3 + x) % 2;
            for (let j = 0; j < 5; j++) H.R(c, x - 2 + j / 2 + sway * 0, y + 1 + j, Math.max(1, 5 - j), 1);
          }
        }
      }
    },
    guaPola: {
      over(H) {
        // langit-langit gua: stalaktit, tetesan air, kristal di atap
        H.R('#1a1c2c', 0, 0, H.VW, H.ST + 4);
        H.each(9, 0.5, (sx, k) => {
          const L = 6 + H.hash(k + 110) * 16;
          for (let j = 0; j < L; j++) H.R(j < L * 0.3 ? '#333c57' : '#2a2f40', sx - (L - j) / L * 3, H.ST + 2 + j, Math.max(1, (L - j) / L * 6), 1);
          if (H.hash(k + 111) > 0.7) { const p = (H.t * 0.6 + H.hash(k)) % 1; H.R('#73eff7', sx, H.ST + 2 + L + p * 40, 1, 2); }
          if (H.hash(k + 112) > 0.8) { const c = ['#b06fd0', '#73eff7', '#a7f070'][k % 3]; H.R(c, sx + 3, H.ST + 2, 2, 5); H.R('#f4f4f4', sx + 3, H.ST + 2, 1, 1); }
        }, 10);
      }
    },
    kapalKaram: {
      over(H) {
        // kawanan ikan berenang & ubur-ubur & gelembung naik
        for (let s = 0; s < 2; s++) {
          const x0 = wrap(H, s * 90, 0.2, s ? -8 : 10, 50), y0 = H.ST + 14 + s * 22;
          for (let i = 0; i < 5; i++) {
            const x = x0 + (i % 3) * 6 * (s ? -1 : 1), y = y0 + Math.floor(i / 2) * 4 + Math.sin(H.t * 3 + i) * 1, c = s ? '#ffcd75' : '#ef7d57';
            H.R(c, x, y, 4, 2); H.R(c, x + (s ? 4 : -2), y - 1 + (Math.floor(H.t * 6 + i) % 2), 2, 1); H.R(c, x + (s ? 4 : -2), y + 2 - (Math.floor(H.t * 6 + i) % 2), 2, 1); H.R(K, x + (s ? 0 : 3), y, 1, 1);
          }
        }
        const jx = wrap(H, 120, 0.15, 1.5), jy = H.ST + 22 + Math.sin(H.t * 1.3) * 6;
        H.circle(jx, jy, 5, '#f4a3c8'); H.R('#f4a3c8', jx - 5, jy, 11, 3); H.R('#ffe4f0', jx - 2, jy - 3, 2, 2);
        for (let i = 0; i < 4; i++) H.R('#f4a3c8', jx - 4 + i * 3, jy + 3 + (Math.floor(H.t * 3 + i) % 2), 1, 5);
        for (let i = 0; i < 8; i++) { const p = (H.t * 0.15 + H.hash(i + 120)) % 1; H.R('#c7f0ff', wrap(H, H.hash(i + 121) * 300, 0.4), H.GY - 10 - p * (H.GY - H.ST), 2, 2); }
      }
    },
    perpustakaan: {
      over(H) {
        // lampu gantung bergoyang & halaman buku melayang
        H.R('#2a1a2e', 0, 0, H.VW, H.ST + 2);
        H.each(46, 0.5, (sx, k) => {
          const sw = Math.round(Math.sin(H.t * 1.4 + k) * 2), L = 10 + H.hash(k + 130) * 6;
          H.R(K, sx, H.ST, 1, L); H.R(K, sx - 6 + sw, H.ST + L, 13, 3); H.R('#ffcd75', sx - 5 + sw, H.ST + L, 11, 1);
          [-4, 0, 4].forEach((d, i) => { H.R('#f4f4f4', sx + d + sw, H.ST + L - 3, 1, 3); H.R(Math.floor(H.t * 8 + i + k) % 3 ? '#ffcd75' : '#ef7d57', sx + d + sw, H.ST + L - 5, 1, 2); });
        }, 30);
        for (let i = 0; i < 4; i++) {
          const x = wrap(H, H.hash(i + 140) * 260, 0.3, 4 + i), y = H.ST + 20 + H.hash(i + 141) * 30 + Math.sin(H.t * 2 + i) * 4, f = Math.floor(H.t * 5 + i) % 2;
          H.R('#ffe4c4', x, y, 5, f ? 3 : 4); H.R('#d4a373', x + 1, y + 1, 3, 1);
        }
      }
    }
  };
  ART.desa = {back: ART.padang.back};
  ART.malam = {back: ART.menara.back};
  return {hasBack: id => !!(ART[id] && ART[id].back), back: (id, H) => ART[id] && ART[id].back && ART[id].back(H), over: (id, H) => ART[id] && ART[id].over && ART[id].over(H)};
})();
