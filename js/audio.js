/* Math Quest — semua suara dibuat dari kode (Web Audio API), tanpa file suara.
   - MQ.Audio.sfx.*  : efek suara pendek
   - MQ.Audio.music  : musik latar chiptune (lead kotak, bass segitiga, drum dari derau)
   - MQ.Audio.speak  : membacakan soal (suara bawaan HP)
   Volume musik & efek terpisah (setVolumes), diatur di layar Orang Tua / tombol 🎵. */
'use strict';
window.MQ = window.MQ || {};

MQ.Audio = (() => {
  let ac = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let vol = {music: 0.6, sfx: 0.8};

  /** Panggil di setiap ketukan: browser hanya mengizinkan suara setelah interaksi pengguna. */
  function unlock() {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        sfxBus = ac.createGain(); sfxBus.connect(ac.destination);
        musicBus = ac.createGain(); musicBus.connect(ac.destination);
        applyVolumes();
        // derau putih 1 detik untuk drum, tebasan, dsb.
        noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        if (wanted) music.play(wanted);
      }
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { ac = null; }
  }
  function applyVolumes() {
    if (!ac) return;
    sfxBus.gain.value = vol.sfx;
    musicBus.gain.value = vol.music * 0.5; // musik dibuat lebih pelan dari efek
  }
  function setVolumes(music, sfx) { vol = {music, sfx}; applyVolumes(); }
  // Aplikasi disembunyikan → suara berhenti; tampil lagi → lanjut
  document.addEventListener('visibilitychange', () => {
    if (!ac) return;
    if (document.hidden) ac.suspend(); else ac.resume();
  });

  /** Nada tunggal. freqEnd = nada meluncur (opsional). */
  function tone(freq, dur, type = 'square', delay = 0, v = 0.12, freqEnd = 0, bus = sfxBus) {
    if (!ac) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  /** Derau tersaring (desis, tebasan, dentum). */
  function noise(dur, {type = 'bandpass', freq = 1000, freqEnd = 0, v = 0.2, delay = 0, bus = sfxBus} = {}) {
    if (!ac || !noiseBuf) return;
    const t = ac.currentTime + delay, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf;
    f.type = type; f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(bus);
    src.start(t); src.stop(t + dur + 0.02);
  }
  const arp = (notes, step, type = 'square', v = 0.1, len = step * 1.5) => notes.forEach((f, i) => tone(f, len, type, i * step, v));

  /* ===== Efek suara ===== */
  const sfx = {
    correct: () => { tone(660, .12); tone(990, .18, 'square', .1); },
    crit:    () => { tone(660, .1); tone(990, .1, 'square', .08); tone(1320, .25, 'square', .16); },
    slash:   () => noise(.16, {freq: 3200, freqEnd: 700, v: .25}),
    wrong:   () => { tone(330, .2, 'sawtooth', 0, .1); tone(220, .35, 'sawtooth', .15, .1); },
    hurt:    () => { tone(180, .12, 'square', 0, .12); tone(120, .15, 'square', .06, .12); },
    defeat:  () => [784, 523, 392, 262].forEach((f, i) => tone(f, .14, 'triangle', i * .07, .2)),
    levelUp: () => arp([523, 659, 784, 1047, 1319], .12, 'square', .12, .22),
    /** Serangan musuh, berbeda per jenis tubuh. */
    enemy(kind) {
      if (kind === 'bat') { tone(1400, .08, 'square', 0, .06, 2300); tone(1700, .08, 'square', .07, .05, 2600); }
      else if (kind === 'slime') tone(520, .2, 'sine', 0, .3, 110);
      else if (kind === 'mushroom') noise(.2, {type: 'lowpass', freq: 1400, freqEnd: 300, v: .35});
      else if (kind === 'rock') { tone(95, .3, 'sine', 0, .4, 45); noise(.22, {type: 'lowpass', freq: 500, v: .3}); }
      else if (kind === 'dragon') { tone(120, .45, 'sawtooth', 0, .12, 65); tone(127, .45, 'sawtooth', 0, .08, 70); noise(.4, {type: 'lowpass', freq: 600, v: .2}); }
      else tone(300, .15, 'square', 0, .1, 150);
    },
    coin:    () => { tone(988, .07, 'square', 0, .07); tone(1319, .16, 'square', .07, .07); },
    loot:    () => { tone(784, .08, 'triangle', 0, .18); tone(1175, .14, 'triangle', .08, .18); },
    potion:  () => [0, .12, .24].forEach(d => tone(380, .12, 'sine', d, .22, 760)),
    buy:     () => { sfx.coin(); tone(2093, .35, 'triangle', .16, .12); },
    craft:   () => [0, .2, .4].forEach(d => { tone(1800, .14, 'triangle', d, .14, 1500); noise(.05, {type: 'highpass', freq: 3000, v: .2, delay: d}); }),
    equip:   () => { tone(300, .06, 'square', 0, .1); tone(450, .1, 'square', .05, .1); },
    click:   () => tone(700, .03, 'square', 0, .035),
    chest:   () => arp([523, 659, 784, 1047, 1319, 1568], .07, 'triangle', .18, .2),
    fanfare: () => { [523, 523, 523, 659].forEach((f, i) => tone(f, .12, 'square', i * .13, .11)); tone(784, .2, 'square', .52, .11); tone(1047, .6, 'square', .72, .12); }
  };

  /* ===== Musik ===== */
  /* Lagu ditulis per not 1/8: 'C5' = nada, '.' = tahan nada sebelumnya, '-' = diam.
     Drum: k = kick, s = snare, h = hi-hat, '-' = diam. Semua lagu adalah karya orisinal untuk game ini. */
  const SONGS = {
    home: {bpm: 112, // ceria, C mayor
      lead: 'C5 . E5 . G5 . E5 . F5 . A5 . G5 . E5 . D5 . F5 . E5 . C5 . D5 . . . G4 . . . ' +
            'C5 . E5 . G5 . C6 . A5 . G5 . F5 . E5 . D5 . E5 . F5 . D5 . C5 . . . - . - . ',
      bass: 'C3 . G3 . C3 . G3 . F3 . C4 . C3 . G3 . D3 . A3 . C3 . G3 . G2 . D3 . G2 . B2 . ' +
            'C3 . G3 . E3 . G3 . F3 . C4 . C3 . G3 . G2 . D3 . G2 . B2 . C3 . G3 . C3 . - . ',
      drum: 'k - h - s - h - '},
    field: {bpm: 132, // petualangan bersemangat, G mayor
      lead: 'G4 . B4 . D5 . G5 . F#5 . E5 . D5 . B4 . C5 . E5 . G5 . E5 . D5 . . . . . - - ' +
            'G4 . B4 . D5 . G5 . A5 . G5 . F#5 . E5 . D5 . C5 . B4 . A4 . G4 . . . - . - . ',
      bass: 'G2 . D3 . G2 . D3 . D3 . A3 . D3 . A3 . C3 . G3 . C3 . G3 . D3 . A3 . D3 . F#3 . ' +
            'G2 . D3 . G2 . D3 . E3 . B3 . C3 . G3 . D3 . A3 . D3 . A3 . G2 . D3 . G2 . - . ',
      drum: 'k h s h k k s h '},
    boss: {bpm: 152, // tegang, A minor
      lead: 'A4 . C5 . E5 . A4 . G4 . B4 . E5 . G4 . F4 . A4 . C5 . F4 . E4 . G#4 . B4 . E5 . ' +
            'A4 A4 C5 . E5 E5 A5 . G5 . E5 . D5 . B4 . C5 . A4 . F4 . A4 . G#4 . . . E4 . . . ',
      bass: 'A2 A2 A2 A2 A2 A2 A2 A2 G2 G2 G2 G2 G2 G2 G2 G2 F2 F2 F2 F2 F2 F2 F2 F2 E2 E2 E2 E2 E2 E2 E2 E2 ' +
            'A2 A2 A2 A2 A2 A2 A2 A2 G2 G2 G2 G2 G2 G2 G2 G2 F2 F2 F2 F2 F2 F2 F2 F2 E2 E2 E2 E2 E2 E2 E2 E2 ',
      drum: 'k h s h k h s s '},
    dungeon: {bpm: 96, // misterius, D minor
      lead: 'D5 . . . F5 . . . E5 . . . A4 . . . D5 . . . F5 . G5 . A5 . . . . . . . ' +
            'C5 . . . E5 . . . D5 . . . A4 . . . F5 . E5 . D5 . C5 . D5 . . . . . . . ',
      bass: 'D3 . . . A2 . . . C3 . . . A2 . . . D3 . . . A2 . . . D3 . . . A2 . . . ' +
            'C3 . . . G2 . . . D3 . . . A2 . . . A#2 . . . C3 . . . D3 . . . . . . . ',
      drum: 'k - - - h - - - '},
    exam: {bpm: 88, // tenang, F mayor (tanpa drum agar fokus)
      lead: 'F5 . . . A5 . . . G5 . . . E5 . . . F5 . . . C5 . . . D5 . . . C5 . . . ' +
            'A4 . . . C5 . . . A#4 . . . D5 . . . C5 . . . E5 . . . F5 . . . . . . . ',
      bass: 'F2 . . . C3 . . . C3 . . . G2 . . . F2 . . . A2 . . . A#2 . . . C3 . . . ' +
            'F2 . . . C3 . . . A#2 . . . F2 . . . C3 . . . G2 . . . F2 . . . . . . . ',
      drum: ''}
  };

  const SEMI = {C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11};
  const freqOf = n => { const m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, (12 * (+m[2] + 1) + SEMI[m[1]] - 69) / 12); };
  /** Ubah teks not menjadi daftar {pos, freq, len} (len dalam langkah 1/8). */
  function parse(str) {
    const tok = str.trim().split(/\s+/), out = [];
    tok.forEach((t, i) => {
      if (t === '.' || t === '-') return;
      let len = 1;
      while (tok[i + len] === '.') len++;
      out.push({pos: i, freq: freqOf(t), len});
    });
    return {notes: out, steps: tok.length};
  }
  const parsed = {};
  for (const [id, s] of Object.entries(SONGS)) {
    const lead = parse(s.lead), bass = parse(s.bass);
    parsed[id] = {bpm: s.bpm, lead: lead.notes, bass: bass.notes, steps: lead.steps, drum: s.drum.trim().split(/\s+/).filter(Boolean)};
  }

  let wanted = null, current = null, timer = null, nextT = 0, step = 0;
  /** Jadwalkan not yang akan berbunyi sebentar lagi (cara standar agar tempo stabil). */
  function schedule() {
    const song = parsed[current], st = 60 / song.bpm / 2; // durasi 1 langkah (not 1/8)
    while (nextT < ac.currentTime + 0.15) {
      const delay = nextT - ac.currentTime;
      song.lead.filter(n => n.pos === step).forEach(n => tone(n.freq, n.len * st * 0.95, 'square', delay, 0.06, 0, musicBus));
      song.bass.filter(n => n.pos === step).forEach(n => tone(n.freq, n.len * st * 0.95, 'triangle', delay, 0.16, 0, musicBus));
      if (song.drum.length) {
        const d = song.drum[step % song.drum.length];
        if (d === 'k') tone(140, .12, 'sine', delay, .35, 45, musicBus);
        else if (d === 's') noise(.1, {freq: 1800, v: .12, delay, bus: musicBus});
        else if (d === 'h') noise(.03, {type: 'highpass', freq: 7000, v: .06, delay, bus: musicBus});
      }
      nextT += st;
      step = (step + 1) % song.steps;
    }
  }
  const music = {
    /** Mainkan lagu (id dari SONGS). Lagu yang sama tidak diulang dari awal. */
    play(id) {
      wanted = id;
      if (!ac || current === id) return;
      this.stop(); wanted = id;
      current = id; step = 0; nextT = ac.currentTime + 0.08;
      timer = setInterval(schedule, 40);
    },
    stop() { clearInterval(timer); timer = null; current = null; },
    get current() { return current; }
  };

  /** Bacakan teks dengan suara bawaan HP/komputer (Bahasa Indonesia bila tersedia). */
  function speak(text) {
    try {
      const synth = window.speechSynthesis;
      if (!synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID'; u.rate = 0.9;
      const voice = synth.getVoices().find(v => /^id/i.test(v.lang));
      if (voice) u.voice = voice;
      synth.speak(u);
    } catch (e) { /* suara tidak tersedia */ }
  }

  return {unlock, sfx, music, speak, setVolumes, SONGS};
})();
