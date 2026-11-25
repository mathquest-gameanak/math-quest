/* Math Quest — latar khusus tiap tempat (tahap 4 grafik baru, 2026-11-25).
   Setiap tempat boleh punya lapisan: sky2 (hiasan langit), far (pengganti bukit jauh), mid (lapisan tengah),
   floor (pengganti tanah & jalan), front (di depan tokoh). noMidHills = tanpa bukit tengah bawaan.
   H = alat dari scene.js: R(warna, x, y, w, h), circle(cx, cy, r, warna), hash(n), each(jarak, paralaks, cb),
   VW/VH (ukuran layar dunia), GY (garis kaki), camX (kamera), t (detik), midY(wx), K (warna tepi). */
'use strict';
window.MQ = window.MQ || {};

MQ.Backdrops = (() => {
  /* ===== Bagian bersama ===== */
  /** Deretan pegunungan segitiga (bersalju bila snow). */
  function peaks(H, f, base, color, shade, snow, step = 34, hgt = 26) {
    H.each(step, f, (sx, k) => {
      const h = hgt * (0.65 + H.hash(k + 11) * 0.5), w = step * 0.85, x0 = sx + H.hash(k) * 8;
      for (let i = 0; i <= w; i++) {
        const top = base - h + Math.abs(i - w / 2) / (w / 2) * h;
        H.R(i < w / 2 ? color : shade, x0 + i, top, 1, base - top + 40);
        if (snow && top < base - h * 0.72) H.R('#f4f4f4', x0 + i, top, 1, Math.max(1, Math.round((base - h * 0.72) - top)));
      }
    }, 40);
  }
  /** Tanah datar dengan warna atas, isi, dan garis-garis papan (lantai kayu / batu). */
  function flatFloor(H, top, fill, line, plank) {
    H.R(top, 0, H.GY - 6, H.VW, 1); H.R(fill, 0, H.GY - 5, H.VW, H.VH);
    if (plank) for (let y = H.GY - 1; y < H.VH; y += 5) H.R(line, 0, y, H.VW, 1);
    H.each(plank || 12, 1, (sx, k) => H.R(line, sx, H.GY - 5 + ((k & 1) ? 5 : 0), 1, 5));
  }
  const flicker = (H, k) => (Math.floor(H.t * 6 + k) % 3 ? 1 : 0);

  return {
    /* Padang: pagar kayu & kupu-kupu */
    padang: {
      mid(H) {
        H.each(9, 0.75, (sx, k) => { const y = H.GY - 16; H.R('#1a1c2c', sx - 1, y - 1, 4, 11); H.R('#ab5236', sx, y, 2, 9); H.R('#d4a373', sx - 7, y + 2, 9, 1); H.R('#d4a373', sx - 7, y + 5, 9, 1); });
      },
      front(H) {
        for (let i = 0; i < 3; i++) {
          const x = ((H.hash(i + 4) * 300 + H.t * (6 + i * 3)) % (H.VW + 20)) - 10, y = H.GY - 28 - i * 9 + Math.sin(H.t * 3 + i) * 3;
          const c = ['#ffcd75', '#f4a3c8', '#73eff7'][i], open = Math.floor(H.t * 8 + i) % 2;
          H.R(c, x - (open ? 2 : 1), y, open ? 2 : 1, 2); H.R(c, x + 1, y, open ? 2 : 1, 2); H.R('#1a1c2c', x, y, 1, 2);
        }
      }
    },

    /* Hutan: hutan rapat di jauh, batang pohon tinggi, berkas cahaya, kunang-kunang */
    hutan: {
      far(H) {
        H.R('#1a4c4f', 0, H.GY - 40, H.VW, H.VH);
        H.each(10, 0.25, (sx, k) => { const r = 6 + H.hash(k) * 4; H.circle(sx, H.GY - 40, Math.round(r), '#1a4c4f'); H.circle(sx - 2, H.GY - 42, Math.round(r) - 3, '#257179'); }, 20);
      },
      mid(H) {
        H.each(22, 0.55, (sx, k) => {
          if (H.hash(k + 2) < 0.3) return;
          const w = 4 + Math.round(H.hash(k) * 2);
          H.R('#1a1c2c', sx - 1, 0, w + 2, H.GY); H.R('#5d275d', sx, 0, w, H.GY); H.R('#8a4b6a', sx, 0, 1, H.GY);
          H.circle(sx + 2, 4 + H.hash(k + 5) * 6, 9, '#257179'); H.circle(sx, 2, 7, '#38b764');
        }, 30);
        for (let i = 0; i < 3; i++) { // berkas cahaya miring
          const x0 = ((i * 53 - H.camX * 0.4) % (H.VW + 60) + H.VW + 60) % (H.VW + 60) - 30;
          for (let y = 0; y < H.GY - 6; y += 2) H.R('#a7f07022', x0 + y * 0.4, y, 6, 2);
        }
      },
      front(H) {
        for (let i = 0; i < 6; i++) {
          const x = (H.hash(i) * 400 - H.camX * 0.9) % H.VW, y = H.GY - 20 - H.hash(i + 7) * 30 + Math.sin(H.t * 2 + i) * 4;
          if (Math.floor(H.t * 3 + i * 1.7) % 4) H.R('#fff3b0', (x + H.VW) % H.VW, y, 1, 1);
        }
      }
    },

    /* Bukit: gunung bersalju di jauh, batu besar */
    bukit: {
      far(H) { peaks(H, 0.18, H.GY - 18, '#94b0c2', '#566c86', true, 38, 34); peaks(H, 0.3, H.GY - 14, '#8fbf6a', '#6aa35a', false, 30, 18); }
    },

    /* Danau: air berkilau dengan riak, teratai, pulau kecil berpohon */
    danau: {
      noMidHills: true,
      far(H) {
        for (let sx = 0; sx < H.VW; sx++) { const wx = sx + H.camX * 0.2, y = Math.round(H.GY - 34 + 3 * Math.sin(wx / 17)); H.R('#4fbf6e', sx, y, 1, H.VH); H.R('#7fdc84', sx, y, 1, 1); }
        H.each(16, 0.2, (sx, k) => { if (H.hash(k) > 0.5) { H.circle(sx, H.GY - 36, 3, '#257179'); } }, 10);
      },
      mid(H) {
        const top = H.GY - 26;
        H.R('#41a6f6', 0, top, H.VW, H.VH); H.R('#73eff7', 0, top, H.VW, 1);
        for (let r = 0; r < 6; r++) { // riak bergerak
          const y = top + 3 + r * 3, off = (H.t * (4 + r) + r * 13 - H.camX * (0.4 + r * 0.05)) % 24;
          for (let x = -24; x < H.VW; x += 24) H.R(r % 2 ? '#73eff7' : '#c7f0ff', x + off + (r * 7) % 24, y, 5, 1);
        }
        H.each(31, 0.5, (sx, k) => { if (H.hash(k + 3) < 0.5) { const y = top + 6 + H.hash(k) * 10; H.R('#38b764', sx, y, 5, 2); H.R('#257179', sx + 3, y, 1, 1); if (H.hash(k) > 0.7) H.R('#f4a3c8', sx + 1, y - 1, 2, 1); } });
        H.each(97, 0.45, (sx, k) => { H.R('#ffcd75', sx - 6, top + 2, 14, 2); H.R('#5d275d', sx, top - 6, 2, 8); H.circle(sx + 1, top - 9, 4, '#257179'); H.circle(sx, top - 10, 2, '#38b764'); });
      }
    },

    /* Lembah Ukur: tebing berlapis, tongkat ukur bergaris di sepanjang jalan */
    lembah: {
      far(H) {
        H.each(46, 0.22, (sx, k) => { // mesa (bukit datar bertingkat)
          const h = 18 + H.hash(k) * 12, w = 30 + H.hash(k + 1) * 14, y = H.GY - 14 - h;
          H.R('#c28553', sx, y, w, h + 20); H.R('#d9a066', sx, y, w, 2); H.R('#ab5236', sx, y + Math.round(h * 0.5), w, 2); H.R('#ab5236', sx + w - 4, y, 4, h + 20);
        }, 40);
      },
      mid(H) {
        H.each(37, 0.75, (sx, k) => { // tongkat ukur merah-putih
          if (H.hash(k + 9) < 0.35) return;
          const y = H.GY - 22;
          H.R('#1a1c2c', sx - 1, y - 1, 4, 18);
          for (let i = 0; i < 8; i++) H.R(i % 2 ? '#f4f4f4' : '#e43b44', sx, y + i * 2, 2, 2);
        });
      }
    },

    /* Menara Seratus: bulan besar, menara tinggi berjendela menyala, lentera di jalan */
    menara: {
      far(H) {
        H.R('#29366f', 0, H.GY - 26, H.VW, H.VH);
        const tx = H.VW * 0.62 - H.camX * 0.05;
        H.R('#1a1c2c', tx - 7, 6, 14, H.GY); H.R('#333c57', tx - 6, 7, 12, H.GY); H.R('#e43b44', tx - 8, 3, 16, 4); H.R('#b13e53', tx - 6, 0, 12, 3);
        for (let y = 12; y < H.GY - 20; y += 7) H.R(Math.floor(H.t * 2 + y) % 5 ? '#ffcd75' : '#ef7d57', tx - 1, y, 2, 3);
        H.each(24, 0.3, (sx, k) => { const h = 8 + H.hash(k) * 10; H.R('#1a1c2c', sx, H.GY - 22 - h, 10, h + 30); if (H.hash(k + 4) > 0.4) H.R('#ffcd75', sx + 4, H.GY - 18 - h, 2, 2); }, 20);
      },
      front(H) {
        H.each(53, 1, (sx, k) => { const y = H.GY - 24; H.R('#1a1c2c', sx, y, 2, 22); H.R('#566c86', sx - 2, y - 1, 6, 2); H.R(flicker(H, k) ? '#ffcd75' : '#ef7d57', sx - 1, y + 1, 4, 3); H.R('#fff3b066', sx - 3, y - 1, 8, 7); });
      }
    },

    /* Kastil: kastil besar berbendera di langit senja, obor menyala */
    kastil: {
      far(H) {
        const cx = H.VW * 0.55 - H.camX * 0.06, base = H.GY - 14;
        H.R('#333c57', cx - 34, base - 22, 68, 40);
        for (let x = cx - 34; x < cx + 34; x += 6) H.R('#333c57', x, base - 25, 4, 3);
        [[-34, 38], [26, 38], [-8, 50]].forEach(([dx, h]) => {
          H.R('#29366f', cx + dx, base - h, 10, h); H.R('#1a1c2c', cx + dx - 1, base - h - 3, 12, 3);
          H.R('#1a1c2c', cx + dx + 4, base - h - 10, 1, 7); H.R('#e43b44', cx + dx + 5, base - h - 10 + (Math.floor(H.t * 3) % 2), 6, 3);
          H.R('#ffcd75', cx + dx + 4, base - h + 8, 2, 3);
        });
        H.R('#1a1c2c', cx - 5, base - 12, 10, 12);
      },
      front(H) {
        H.each(61, 1, (sx, k) => { const y = H.GY - 20; H.R('#5d275d', sx, y, 2, 18); H.R(flicker(H, k) ? '#ffcd75' : '#ef7d57', sx - 1, y - 4, 4, 4); H.R('#e43b44', sx, y - 6 + flicker(H, k), 2, 2); });
      }
    },

    /* Arena Latihan: tribun penonton & panji-panji */
    arena: {
      far(H) {
        H.R('#ab5236', 0, H.GY - 36, H.VW, H.VH);
        for (let row = 0; row < 4; row++) {
          H.R('#8a4b2a', 0, H.GY - 36 + row * 6, H.VW, 1);
          H.each(4, 0.25, (sx, k) => H.R(['#e43b44', '#41a6f6', '#ffcd75', '#38b764', '#f4a3c8', '#f4f4f4'][(k + row * 3) % 6], sx, H.GY - 34 + row * 6 - (Math.floor(H.t * 2 + k) % 7 ? 0 : 1), 2, 3), 10);
        }
      },
      noMidHills: true,
      mid(H) {
        H.R('#d4a373', 0, H.GY - 13, H.VW, 3); H.R('#5d275d', 0, H.GY - 10, H.VW, 4);
        H.each(30, 0.6, (sx, k) => { H.R('#1a1c2c', sx, H.GY - 30, 1, 20); H.R(['#e43b44', '#3b5dc9', '#38b764'][k % 3], sx + 1, H.GY - 30, 6, 4); H.R(['#e43b44', '#3b5dc9', '#38b764'][k % 3], sx + 1, H.GY - 26, 3, 2); });
      }
    },

    /* Gua Pola: dinding gua, kristal bercahaya berpola, stalaktit di depan */
    guaPola: {
      far(H) {
        H.R('#222533', 0, 0, H.VW, H.VH);
        H.each(9, 0.25, (sx, k) => { H.R('#2a2f40', sx, H.hash(k) * 60, 5, 3); H.R('#333c57', sx + 2, 20 + H.hash(k + 1) * 50, 4, 2); }, 10);
      },
      mid(H) {
        H.each(29, 0.55, (sx, k) => {
          if (H.hash(k + 6) < 0.3) return;
          const c = ['#b06fd0', '#73eff7', '#a7f070', '#ffcd75'][k & 3], y = H.midY(k * 29) + 2, glow = Math.sin(H.t * 2 + k) > 0;
          [[0, 9], [-3, 6], [3, 7]].forEach(([dx, h]) => { H.R('#1a1c2c', sx + dx - 1, y - h - 1, 4, h + 1); H.R(c, sx + dx, y - h, 2, h); H.R('#f4f4f4', sx + dx, y - h, 1, 2); });
          if (glow) H.R(c + '33', sx - 6, y - 14, 14, 14);
        });
      },
      front(H) {
        H.each(13, 1.1, (sx, k) => { const h = 4 + H.hash(k) * 10; for (let i = 0; i < h; i++) H.R(i < 1 ? '#1a1c2c' : '#566c86', sx + i * 0.25, i, Math.max(1, 4 - i * 0.35), 1); }, 10);
      }
    },

    /* Kapal Karam: berkas cahaya dari permukaan, kapal tenggelam, rumput laut bergoyang, ikan, gelembung */
    kapalKaram: {
      sky2(H) { for (let i = 0; i < 4; i++) { const x = ((i * 41 - H.camX * 0.1) % (H.VW + 40) + H.VW + 40) % (H.VW + 40) - 20; for (let y = 0; y < H.GY; y += 2) H.R('#c7f0ff18', x + y * 0.25, y, 5, 2); } },
      far(H) {
        for (let sx = 0; sx < H.VW; sx++) { const wx = sx + H.camX * 0.25, y = Math.round(H.GY - 18 + 3 * Math.sin(wx / 19)); H.R('#29366f', sx, y, 1, H.VH); }
        const x = 40 - H.camX * 0.2;
        H.R('#1a1c2c', x, H.GY - 30, 46, 14); H.R('#3b2a17', x + 1, H.GY - 29, 44, 12); H.R('#1a1c2c', x + 14, H.GY - 52, 2, 24); H.R('#5d4128', x + 16, H.GY - 50, 10, 8);
        for (let i = 0; i < 5; i++) H.R('#5d4128', x + 4 + i * 8, H.GY - 25, 4, 2);
      },
      mid(H) {
        H.each(17, 0.6, (sx, k) => { // rumput laut
          if (H.hash(k) < 0.35) return;
          const h = 10 + H.hash(k + 2) * 14, base = H.GY - 6;
          for (let i = 0; i < h; i++) H.R(i % 4 < 2 ? '#257179' : '#38b764', sx + Math.round(Math.sin(H.t * 2 + k + i * 0.3) * 2), base - i, 2, 1);
        });
        for (let i = 0; i < 3; i++) { // ikan
          const span = H.VW + 40, x = ((H.hash(i + 20) * span + H.t * (8 + i * 4)) % span) - 20, y = 14 + i * 12 + Math.sin(H.t + i) * 2;
          const c = ['#ffcd75', '#ef7d57', '#f4a3c8'][i];
          H.R(c, x, y, 5, 3); H.R(c, x - 2, y - 1 + (Math.floor(H.t * 6) % 2), 2, 2); H.R('#1a1c2c', x + 3, y, 1, 1);
        }
      },
      floor(H) {
        H.R('#d4a373', 0, H.GY - 6, H.VW, H.VH); H.R('#e8c49a', 0, H.GY - 6, H.VW, 1);
        H.each(11, 1, (sx, k) => { if (H.hash(k) > 0.6) H.R('#ab5236', sx, H.GY + 2 + H.hash(k + 1) * 8, 2, 1); if (H.hash(k + 5) > 0.85) { H.R('#f4a3c8', sx, H.GY - 7, 3, 2); H.R('#f4f4f4', sx + 1, H.GY - 7, 1, 1); } });
      },
      front(H) {
        for (let i = 0; i < 8; i++) { const x = (H.hash(i) * 500 - H.camX * 0.8) % H.VW, y = H.VH - ((H.t * (10 + i * 2) + i * 30) % (H.VH + 10)); H.R('#c7f0ff', (x + H.VW) % H.VW, y, 2, 2); }
      }
    },

    /* Perpustakaan Tua: dinding berjendela bulan, lampu gantung, lantai kayu, halaman beterbangan */
    perpustakaan: {
      far(H) {
        H.R('#4a3420', 0, 0, H.VW, H.VH);
        H.each(6, 0.2, (sx) => H.R('#3b2a17', sx, 0, 1, H.VH), 6);
        H.each(54, 0.2, (sx, k) => { const y = 10; H.R('#1a1c2c', sx - 1, y - 1, 16, 24); H.R('#29366f', sx, y, 14, 22); H.circle(sx + 9, y + 6, 3, '#f4f4f4'); H.R('#6d4b27', sx + 6, y, 2, 22); H.R('#6d4b27', sx, y + 10, 14, 2); }, 30);
      },
      noMidHills: true,
      floor(H) { flatFloor(H, '#d4a373', '#ab5236', '#8a4b2a', 14); },
      front(H) {
        H.each(48, 1, (sx, k) => { H.R('#1a1c2c', sx, 0, 1, 8); H.R('#ffcd75', sx - 2, 8, 5, 3); H.R('#fff3b044', sx - 5, 6, 11, 9); }, 10);
        for (let i = 0; i < 4; i++) { const x = ((H.hash(i + 3) * 300 + H.t * (5 + i * 2)) % (H.VW + 20)) - 10, y = 12 + i * 10 + Math.sin(H.t * 2 + i) * 4; H.R('#ffe4c4', x, y, 4, 3); H.R('#d4a373', x, y + 1, 4, 1); }
      }
    }
  };
})();
