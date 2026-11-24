/* Math Quest — efek suara chiptune dengan Web Audio API (tanpa file suara). */
'use strict';
window.MQ = window.MQ || {};

MQ.Audio = (() => {
  let ac = null;

  /** Panggil di setiap ketukan: browser hanya mengizinkan suara setelah interaksi pengguna. */
  function unlock() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) { ac = null; }
  }

  function tone(freq, dur, type = 'square', delay = 0, vol = 0.12) {
    if (!ac) return;
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const sfx = {
    correct: () => { tone(660, .12); tone(990, .18, 'square', .1); },
    crit:    () => { tone(660, .1); tone(990, .1, 'square', .08); tone(1320, .25, 'square', .16); },
    hurt:    () => { tone(180, .12, 'square', 0, .12); tone(120, .15, 'square', .06, .12); },
    wrong:   () => { tone(330, .2, 'sawtooth', 0, .1); tone(220, .35, 'sawtooth', .15, .1); },
    defeat:  () => [784, 523, 392, 262].forEach((f, i) => tone(f, .14, 'triangle', i * .07, .2)),
    levelUp: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'square', i * .12))
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

  return {unlock, sfx, speak};
})();
