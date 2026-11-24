/* Math Quest — titik mulai. */
'use strict';
MQ.UI.init();
MQ.UI.show('home');

/* Main offline (PWA): daftarkan service worker jika diizinkan (HTTPS / localhost).
   Di tempat yang tidak mengizinkan (mis. pratinjau artifact), gagal diam-diam: game tetap jalan online. */
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
