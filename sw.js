/* Math Quest — service worker: menyimpan semua file game di HP supaya bisa dimainkan offline.
   Strategi: ambil dari simpanan dulu (cepat & offline), sambil diam-diam mengambil versi terbaru dari internet
   untuk dipakai saat game dibuka berikutnya.
   PENTING: naikkan VERSION setiap kali file game diubah, supaya HP mengganti simpanan lama. */
const VERSION = 'mq-v4';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/questions.js', './js/save.js', './js/audio.js', './js/sprites.js', './js/visuals.js', './js/data.js',
  './js/balance.js', './js/hero.js', './js/state.js', './js/screens.js', './js/battle.js', './js/shop.js',
  './js/quests.js', './js/parent.js', './js/create.js', './js/map.js', './js/main.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' → ambil langsung dari server, bukan dari cache browser yang mungkin sudah usang
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => { // hapus simpanan versi lama
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, {ignoreSearch: true});
    // Pakai url saja: permintaan 'navigate' tidak boleh diberi opsi tambahan
    const fresh = fetch(e.request.url, {cache: 'no-cache'})
      .then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
      .catch(() => cached);
    return cached || fresh;
  }));
});
