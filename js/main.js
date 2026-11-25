/* Math Quest — titik mulai. */
'use strict';
MQ.Audio.setVolumes(MQ.State.S.settings.music, MQ.State.S.settings.sfx);
/* Tampilan "Petualangan" (ubin Kenney) = bawaan. Tampilan lama (biru) bisa dipilih di Orang Tua → Pengaturan,
   atau lewat alamat: ?skin=k (Petualangan) / ?skin=0 (lama). Disimpan 'lama' hanya bila memilih tampilan lama. */
MQ.Skin = (() => {
  const KEY = 'mathQuest.skin';
  const get = () => { try { return localStorage.getItem(KEY) !== 'lama'; } catch (e) { return true; } };
  const set = on => { try { localStorage.setItem(KEY, on ? 'k' : 'lama'); } catch (e) { /* abaikan */ } document.body.classList.toggle('skinK', on); };
  const q = new URLSearchParams(location.search).get('skin');
  set(q === null ? get() : q === 'k');
  return {get, set};
})();
MQ.UI.init();
// Pertama kali main (belum ada pahlawan) → Buat Karakter dulu
if (MQ.State.S.hero) { MQ.UI.show('home'); MQ.Cutscene.playOnce('prolog'); } // pemain lama juga menonton prolog sekali
else MQ.Create.open('home');

/* Main offline (PWA): daftarkan service worker jika diizinkan (HTTPS / localhost).
   Di tempat yang tidak mengizinkan (mis. pratinjau artifact), gagal diam-diam: game tetap jalan online. */
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
