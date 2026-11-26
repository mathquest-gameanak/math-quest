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

  /** Tokoh cerita 32×32 (characters.js): ditampilkan seukuran pahlawan. */
  const CHARS = new Set(['kakek', 'kiki', 'penyihir', 'momo', 'kapten', 'hantuBuku']);
  const heroName = () => (S.hero && S.hero.name) || 'Pahlawan';
  /** Gambar tokoh: pahlawan (sesuai penampilan & equipment), tokoh cerita, item, atau monster. */
  function actorSrc(name) {
    if (name === 'hero') return MQ.Hero.current();
    if (MQ.Pix.has(name)) return MQ.Pix.url(name, 4); // tokoh cerita, kristal & monster bergambar baru
    if (Story.ACTORS[name]) return Sprites.url(Story.ACTORS[name].sprite, Story.ACTORS[name].pal);
    if (Sprites.DATA[name]) return Sprites.url(name);
    const m = Data.monsters[name];
    if (m && MQ.Pix.has(name)) return MQ.Pix.url(name, 4);   // gambar monster baru
    return m ? Sprites.url(m.sprite, m.pal) : '';
  }

  /** Sudah pernah ditonton? (adegan cerita utama hanya diputar otomatis sekali) */
  const seen = id => !!S.story.seen[id];
  /** Putar adegan sekali saja; jika sudah pernah atau tidak ada, langsung lanjut. */
  function playOnce(id, done) {
    if (!Story.SCENES[id] || seen(id)) { if (done) done(); return; }
    play(id, done);
  }

  /** Musik bawaan adegan sesuai suasananya; langkah cerita dengan "music" menggantinya di tengah adegan (story.js). */
  function sceneMusic(id) {
    if (/-(shard|key|end)$/.test(id) || id === 'ending') return 'csWin';     // menang, kepingan, harta
    if (/^(guaPola|kapalKaram|perpustakaan)-intro$/.test(id)) return 'dungeon'; // dungeon: misterius
    if (id === 'kastil-intro') return 'csVillain';
    return 'csCalm';                                                            // pembuka area, prolog
  }
  /* Latar cutscene = mesin latar pertarungan (scene.js + backgrounds.js + skyart.js): bergerak & lebih detail.
     Kamera bergeser pelan (efek film), skala piksel mengikuti lebar layar (HP 3×, iPad 5×). */
  const BGMAP = {desa: 'desa', malam: 'malam', padang: 'padang', hutan: 'hutan', bukit: 'bukit', danau: 'danau', lembah: 'lembah',
                 menara: 'menara', kastil: 'kastil', gua: 'guaPola', kapal: 'kapalKaram', perpus: 'perpustakaan'};
  let bgT0 = 0, lastBg = 0;
  const csScale = () => Math.max(3, Math.min(6, Math.round(els.stage.clientWidth / 110)));
  function paintBg(ms) {
    if (!bgNow || !MQ.Scene.renderBg) return;
    const t = ms / 1000;
    MQ.Scene.renderBg(els.bg, BGMAP[bgNow] || 'padang', t, {sc: csScale(), ground: 0.87, cam: (t - bgT0) * 3});
  }
  (function loop(ms) {
    requestAnimationFrame(loop);
    if (els.root.hidden || document.hidden || ms - lastBg < 66) return;
    lastBg = ms; paintBg(ms);
  })(0);
  function setBg(kind) {
    bgNow = kind; bgT0 = performance.now() / 1000;
    els.stage.style.setProperty('--csK', csScale() / 3);
    els.stage.classList.remove('fadeIn'); void els.stage.offsetWidth; els.stage.classList.add('fadeIn'); // muncul dari gelap
    if (!MQ.Scene.renderBg) Story.drawBg(els.bg, kind); else paintBg(performance.now());
  }

  function play(id, done) {
    if (!Story.SCENES[id]) { if (done) done(); return; }
    steps = Story.SCENES[id]; idx = 0; sceneId = id; onDone = done || null; bgNow = '';
    els.actors.innerHTML = ''; els.fx.innerHTML = '';
    els.root.hidden = false;
    Audio.music.play(steps[0].music || sceneMusic(id));
    show();
  }

  /** Tampilkan satu langkah. */
  function show() {
    const st = steps[idx];
    if (st.bg && st.bg !== bgNow) setBg(st.bg);
    if (st.actors) for (const [name, pos] of Object.entries(st.actors)) setActor(name, pos);
    if (st.fx) fx(st.fx);
    if (st.music && idx > 0) Audio.music.play(st.music); // suasana berganti di tengah adegan
    // Pembicara: nama, potret, dan tokohnya bergoyang
    const name = Story.speakerName(st.who, heroName());
    els.name.textContent = name; els.name.hidden = !name;
    const pSrc = st.who === 'narator' ? '' : actorSrc(st.who);
    els.portrait.hidden = !pSrc; if (pSrc) els.portrait.src = pSrc;
    els.actors.querySelectorAll('.csActor').forEach(a => a.classList.toggle('talk', a.dataset.a === st.who));
    els.actors.classList.toggle('speaking', !!els.actors.querySelector('.csActor.talk')); // yang tidak bicara sedikit redup
    els.root.querySelector('.csBox').classList.toggle('narr', st.who === 'narator');
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
      el.className = 'csActor enter' + (name === 'crystal' || name === 'shard' ? ' item' : '') + (name === 'naga' ? ' big' : '') + (name === 'hero' || CHARS.has(name) ? ' heroNew' : '');
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
      const src = MQ.Pix.url('shard', 4);
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
    // kembalikan musik layar di belakang adegan (pertarungan mengatur musiknya sendiri)
    const scr = document.querySelector('.screen.on');
    if (scr && scr.id !== 'scr-battle') Audio.music.play(scr.id === 'scr-map' ? 'map' : 'home');
    if (cb) cb();
  }

  els.root.addEventListener('click', e => { if (e.target.closest('#csSkip')) return; Audio.unlock(); next(); });
  els.skip.addEventListener('click', () => { Audio.sfx.click(); end(); });

  const isOpen = () => !els.root.hidden;
  return {play, playOnce, seen, isOpen};
})();
