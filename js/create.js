/* Math Quest — layar Buat Karakter: muncul saat pertama main (S.hero kosong),
   dan bisa dibuka lagi dari Karakter → "Ubah penampilan". */
'use strict';
window.MQ = window.MQ || {};

MQ.Create = (() => {
  const {Hero, State, UI} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  let look = null, back = 'home';

  /** Buka layar. from = layar tujuan setelah selesai. */
  function open(from = 'home') {
    back = from;
    look = Object.assign({}, S.hero || Hero.DEFAULT);
    $('heroName').value = look.name;
    $('createCancel').hidden = !S.hero; // pertama kali: wajib selesai
    UI.show('create');
  }

  UI.renderers.create = () => {
    if (!look) look = Object.assign({}, Hero.DEFAULT);
    $('createPreview').src = Hero.url(look, S.equip);
    const pickBtn = (k, v, inner, extra = '') =>
      `<button class="pick${look[k] === v ? ' on' : ''}" data-k="${k}" data-v="${v}" ${extra}>${inner}</button>`;
    const preview = changes => `<img src="${Hero.url(Object.assign({}, look, changes))}" alt="">`;
    $('optHair').innerHTML = Hero.OPTIONS.hair.map(([v, label]) => pickBtn('hair', v, preview({hair: v}) + `<small>${label}</small>`)).join('');
    $('optOutfit').innerHTML = Hero.OPTIONS.outfit.map(([v, label]) => pickBtn('outfit', v, preview({outfit: v}) + `<small>${label}</small>`)).join('');
    const sw = k => Hero.OPTIONS[k].map(c => pickBtn(k, c, '', `style="background:${c}" aria-label="Warna"`)).join('');
    $('optHairColor').innerHTML = sw('hairColor');
    $('optSkin').innerHTML = sw('skin');
    $('optOutfitColor').innerHTML = sw('outfitColor');
  };

  $('scr-create').addEventListener('click', e => {
    const b = e.target.closest('.pick');
    if (!b) return;
    look[b.dataset.k] = b.dataset.v;
    MQ.Audio.sfx.correct();
    UI.renderers.create();
  });
  $('heroName').addEventListener('input', () => { look.name = $('heroName').value.slice(0, 12); });

  $('createDone').addEventListener('click', () => {
    look.name = ($('heroName').value.trim() || 'Pahlawan').slice(0, 12);
    S.hero = Hero.sanitize(look);
    State.save();
    MQ.Audio.sfx.levelUp();
    UI.show(back);
    MQ.Cutscene.playOnce('prolog'); // pemain baru: cerita pembuka
  });
  $('createCancel').addEventListener('click', () => UI.show(back));

  return {open};
})();
