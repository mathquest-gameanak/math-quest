/* Math Quest — pemutar cutscene (adegan cerita bergerak).
   Memainkan MQ.Story.SCENES[id]: latar pixel, tokoh masuk/berjalan/keluar, efek (getar, kilat, kilau, kristal pecah),
   teks muncul huruf demi huruf. Ketuk layar = lanjut (atau tampilkan teks penuh dulu), tombol "Lewati" = selesai.
   Suara: rekaman audio/vo/<id>.mp3 bila terdaftar di MQ.Story.VO; jika tidak dan "Bacakan soal otomatis" nyala → suara HP. */
'use strict';
window.MQ = window.MQ || {};

MQ.Cutscene = (() => {
  const {Story, Sprites, Data, State, Audio} = MQ;
  const S = State.S;
  const $ = id => document.getElementById(id);
  const els = {root: $('cutscene'), stage: $('csStage'), bg: $('csBg'), actors: $('csActors'), fx: $('csFx'),
               name: $('csName'), text: $('csText'), portrait: $('csPortrait'), skip: $('csSkip')};
  let steps = [], idx = 0, sceneId = '', onDone = null, typing = null, voice = null, bgNow = '', fullText = '';

  const heroName = () => (S.hero && S.hero.name) || 'Pahlawan';
  /** Gambar tokoh: pahlawan (sesuai penampilan & equipment), tokoh cerita, item, atau monster. */
  function actorSrc(name) {
    if (name === 'hero') return MQ.Hero.current();
    if (Story.ACTORS[name]) return Sprites.url(Story.ACTORS[name].sprite, Story.ACTORS[name].pal);
    if (Sprites.DATA[name]) return Sprites.url(name);
    const m = Data.monsters[name];
    return m ? Sprites.url(m.sprite, m.pal) : '';
  }

  /** Sudah pernah ditonton? (adegan cerita utama hanya diputar otomatis sekali) */
  const seen = id => !!S.story.seen[id];
  /** Putar adegan sekali saja; jika sudah pernah atau tidak ada, langsung lanjut. */
  function playOnce(id, done) {
    if (!Story.SCENES[id] || seen(id)) { if (done) done(); return; }
    play(id, done);
  }

  function play(id, done) {
    if (!Story.SCENES[id]) { if (done) done(); return; }
    steps = Story.SCENES[id]; idx = 0; sceneId = id; onDone = done || null; bgNow = '';
    els.actors.innerHTML = ''; els.fx.innerHTML = '';
    els.root.hidden = false;
    Audio.music.play(/^(kastil-intro|menara-shard)$/.test(id) ? 'boss' : 'home'); // adegan menegangkan pakai musik bos
    show();
  }

  /** Tampilkan satu langkah. */
  function show() {
    const st = steps[idx];
    if (st.bg && st.bg !== bgNow) { Story.drawBg(els.bg, st.bg); bgNow = st.bg; }
    if (st.actors) for (const [name, pos] of Object.entries(st.actors)) setActor(name, pos);
    if (st.fx) fx(st.fx);
    // Pembicara: nama, potret, dan tokohnya bergoyang
    const name = Story.speakerName(st.who, heroName());
    els.name.textContent = name; els.name.hidden = !name;
    const pSrc = st.who === 'narator' ? '' : actorSrc(st.who);
    els.portrait.hidden = !pSrc; if (pSrc) els.portrait.src = pSrc;
    els.actors.querySelectorAll('.csActor').forEach(a => a.classList.toggle('talk', a.dataset.a === st.who));
    // Teks huruf demi huruf (nama pemain dipasang lewat textContent → aman)
    fullText = st.text.replace(/\{nama\}/g, heroName());
    els.text.textContent = '';
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      i += 1; els.text.textContent = fullText.slice(0, i);
      if (i >= fullText.length) { clearInterval(typing); typing = null; }
    }, 28);
    // Suara
    stopVoice();
    const vid = `${sceneId}-${idx + 1}`;
    // window.Audio = pemutar suara bawaan browser (berbeda dari MQ.Audio)
    if (Story.VO.has(vid)) { voice = new window.Audio(`audio/vo/${vid}.mp3`); voice.play().catch(() => {}); }
    else if (S.settings.autoSpeak) Audio.speak(fullText);
  }

  /** Tokoh masuk dari samping, berjalan ke posisi baru, atau keluar (pos = null). */
  function setActor(name, pos) {
    let el = els.actors.querySelector(`[data-a="${name}"]`);
    if (pos === null) {
      if (el) { el.dataset.a = ''; el.classList.add('leave'); setTimeout(() => el.remove(), 500); }
      return;
    }
    if (!el) {
      el = new Image();
      el.alt = ''; el.dataset.a = name;
      el.className = 'csActor enter' + (name === 'crystal' || name === 'shard' ? ' item' : '') + (name === 'naga' ? ' big' : '') + (name === 'hero' ? ' heroNew' : '');
      el.src = actorSrc(name);
      el.style.left = (pos < 50 ? -25 : 125) + '%';
      els.actors.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.left = pos + '%'; el.classList.remove('enter'); }));
    } else el.style.left = pos + '%';
  }

  /** Efek layar. */
  function fx(kind) {
    const once = (cls, ms) => { els.stage.classList.remove(cls); void els.stage.offsetWidth; els.stage.classList.add(cls); setTimeout(() => els.stage.classList.remove(cls), ms); };
    if (kind === 'shake') { once('shake', 600); Audio.sfx.enemy('rock'); }
    if (kind === 'dark') once('dark', 1500);
    if (kind === 'flash') {
      const f = document.createElement('div'); f.className = 'csFlash'; els.fx.appendChild(f); setTimeout(() => f.remove(), 700);
      Audio.sfx.crit();
    }
    if (kind === 'sparkle') {
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('i'); s.className = 'csSpark';
        s.style.left = (10 + Math.random() * 80) + '%'; s.style.top = (20 + Math.random() * 60) + '%'; s.style.animationDelay = (Math.random() * 0.6) + 's';
        els.fx.appendChild(s); setTimeout(() => s.remove(), 1800);
      }
      Audio.sfx.chest();
    }
    if (kind === 'shards') { // kristal pecah: 6 kepingan terbang ke segala arah
      const src = Sprites.url('shard');
      for (let i = 0; i < 6; i++) {
        const img = new Image(); img.className = 'csShard'; img.src = src; img.alt = '';
        const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
        img.style.setProperty('--dx', Math.cos(ang) * 150 + 'px'); img.style.setProperty('--dy', Math.sin(ang) * 110 + 'px');
        els.fx.appendChild(img); setTimeout(() => img.remove(), 1600);
      }
      once('shake', 600);
      Audio.sfx.wrong();
    }
  }

  function stopVoice() {
    if (voice) { voice.pause(); voice = null; }
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  }

  /** Ketuk: tampilkan teks penuh dulu bila belum selesai, lalu lanjut ke langkah berikutnya. */
  function next() {
    if (typing) { clearInterval(typing); typing = null; els.text.textContent = fullText; return; }
    idx++;
    if (idx >= steps.length) end(); else show();
  }
  function end() {
    clearInterval(typing); typing = null; stopVoice();
    els.root.hidden = true;
    S.story.seen[sceneId] = true; State.save();
    const cb = onDone; onDone = null;
    if (cb) cb();
  }

  els.root.addEventListener('click', e => { if (e.target.closest('#csSkip')) return; Audio.unlock(); next(); });
  els.skip.addEventListener('click', () => { Audio.sfx.click(); end(); });

  const isOpen = () => !els.root.hidden;
  return {play, playOnce, seen, isOpen};
})();
