/* Math Quest — titik mulai. */
'use strict';
MQ.Audio.setVolumes(MQ.State.S.settings.music, MQ.State.S.settings.sfx);
MQ.UI.init();
// Pertama kali main (belum ada pahlawan) → Buat Karakter dulu
if (MQ.State.S.hero) { MQ.UI.show('home'); MQ.Cutscene.playOnce('prolog'); } // pemain lama juga menonton prolog sekali
else MQ.Create.open('home');

/* Main offline (PWA): daftarkan service worker jika diizinkan (HTTPS / localhost).
   Di tempat yang tidak mengizinkan (mis. pratinjau artifact), gagal diam-diam: game tetap jalan online. */
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
