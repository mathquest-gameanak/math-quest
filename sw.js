/* Math Quest — service worker: menyimpan semua file game di HP supaya bisa dimainkan offline.
   Strategi: ambil dari simpanan dulu (cepat & offline), sambil diam-diam mengambil versi terbaru dari internet
   untuk dipakai saat game dibuka berikutnya.
   PENTING: naikkan VERSION setiap kali file game diubah, supaya HP mengganti simpanan lama. */
const VERSION = 'mq-v57';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css', './css/skin-kenney.css',
  './js/questions.js', './js/save.js', './js/audio.js', './js/sprites.js', './js/visuals.js', './js/data.js',
  './js/balance.js', './js/hero.js', './js/state.js', './js/screens.js', './js/pixelart.js', './js/monsters.js', './js/characters.js', './js/itemart.js', './js/scene.js', './js/backgrounds.js', './js/skyart.js', './js/battle.js', './js/shop.js',
  './js/quests.js', './js/parent.js', './js/tuner.js', './js/soundlab.js', './js/create.js', './js/story.js', './js/cutscene.js', './js/collection.js', './js/map.js', './js/learn.js', './js/dungeonart.js', './js/dungeon.js', './js/daily.js', './js/kiki.js', './js/village.js', './js/homescene.js', './js/main.js',
  './audio/sfx/back1.mp3', './audio/sfx/book1.mp3', './audio/sfx/book2.mp3', './audio/sfx/book3.mp3', './audio/sfx/bookOpen1.mp3', './audio/sfx/chest1.mp3', './audio/sfx/click1.mp3', './audio/sfx/click2.mp3', './audio/sfx/coin1.mp3', './audio/sfx/coin2.mp3', './audio/sfx/confirm1.mp3', './audio/sfx/confirm2.mp3', './audio/sfx/craft1.mp3', './audio/sfx/craft2.mp3', './audio/sfx/craft3.mp3', './audio/sfx/door1.mp3', './audio/sfx/door2.mp3', './audio/sfx/equip1.mp3', './audio/sfx/equip2.mp3', './audio/sfx/equip3.mp3', './audio/sfx/loot1.mp3', './audio/sfx/slash1.mp3', './audio/sfx/slash2.mp3', './audio/sfx/toggle1.mp3', './audio/sfx/toggle2.mp3',
  './ui/btn-blue.png', './ui/btn-cyan.png', './ui/btn-green.png', './ui/btn-lime.png', './ui/btn-pink.png', './ui/btn-red.png', './ui/btn-yellow.png', './ui/panel.png', './ui/ribbon.png', './ui/steel-light.png', './ui/steel.png', './ui/wood.png',
  './audio/pilihan/bellH.mp3', './audio/pilihan/glassL.mp3', './audio/pilihan/highUp.mp3', './audio/pilihan/hit12.mp3', './audio/pilihan/lowDown.mp3', './audio/pilihan/metalL.mp3', './audio/pilihan/nes00.mp3', './audio/pilihan/nes01.mp3', './audio/pilihan/nes04.mp3', './audio/pilihan/nes05.mp3', './audio/pilihan/nes06.mp3', './audio/pilihan/nes07.mp3', './audio/pilihan/nes09.mp3', './audio/pilihan/nes11.mp3', './audio/pilihan/nes12.mp3', './audio/pilihan/nes13.mp3', './audio/pilihan/nes14.mp3', './audio/pilihan/nes15.mp3', './audio/pilihan/pep1.mp3', './audio/pilihan/pep3.mp3', './audio/pilihan/phaseJump1.mp3', './audio/pilihan/phaserDown1.mp3', './audio/pilihan/phaserUp1.mp3', './audio/pilihan/phaserUp3.mp3', './audio/pilihan/pizzi01.mp3', './audio/pilihan/pizzi03.mp3', './audio/pilihan/pizzi06.mp3', './audio/pilihan/pizzi13.mp3', './audio/pilihan/plateL.mp3', './audio/pilihan/powerUp1.mp3', './audio/pilihan/powerUp10.mp3', './audio/pilihan/powerUp2.mp3', './audio/pilihan/powerUp5.mp3', './audio/pilihan/punchH.mp3', './audio/pilihan/punchH2.mp3', './audio/pilihan/punchM.mp3', './audio/pilihan/sax13.mp3', './audio/pilihan/softH.mp3', './audio/pilihan/softM.mp3', './audio/pilihan/steel01.mp3', './audio/pilihan/steel12.mp3', './audio/pilihan/steel13.mp3', './audio/pilihan/threeTone1.mp3', './audio/pilihan/twoTone1.mp3', './audio/pilihan/uiClick1.mp3', './audio/pilihan/uiClick3.mp3', './audio/pilihan/uiRoll1.mp3', './audio/pilihan/uiSwitch2.mp3', './audio/pilihan/woodM.mp3', './audio/pilihan/zap1.mp3',
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
