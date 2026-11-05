/* audio.js · efectos de sonido y música, todo generado con WebAudio (no hay archivos de audio) */
import { setSfx } from './util.js';
import { SET } from './state.js';

let AC = null, master, sfxBus, musBus, noiseBuf;

export function unlock() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.connect(AC.destination);
      sfxBus = AC.createGain(); sfxBus.connect(master);
      musBus = AC.createGain(); musBus.connect(master);
      const n = AC.sampleRate * 0.6; noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      applyVol();
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
}
export function applyVol() {
  if (!AC) return;
  master.gain.value = SET.snd ? 1 : 0;
  sfxBus.gain.value = (SET.sfx / 100) * 0.9;
  musBus.gain.value = (SET.mus / 100) * 0.22;
}

function tone(f, dur, type = 'sine', vol = 0.5, o = {}) {
  if (!AC || !SET.snd) return;
  const t0 = AC.currentTime + (o.at || 0), osc = AC.createOscillator(), g = AC.createGain();
  osc.type = type; osc.frequency.setValueAtTime(f, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(o.bus || sfxBus); osc.start(t0); osc.stop(t0 + dur + 0.05);
}
function noise(dur, vol = 0.3, hp = 800, at = 0) {
  if (!AC || !SET.snd) return;
  const t0 = AC.currentTime + at, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t0); s.stop(t0 + dur);
}

const S = {
  click() { tone(660, 0.07, 'triangle', 0.35); tone(990, 0.05, 'sine', 0.2, { at: 0.03 }); },
  deny() { tone(180, 0.18, 'sawtooth', 0.3, { to: 110 }); },
  ping() { tone(1250, 0.09, 'triangle', 0.5); tone(2500, 0.05, 'sine', 0.2); },
  pong() { tone(850, 0.1, 'triangle', 0.5); tone(1700, 0.05, 'sine', 0.2); },
  bounce() { tone(520, 0.07, 'sine', 0.3, { to: 300 }); },
  point() { tone(523, 0.12, 'square', 0.25); tone(784, 0.18, 'square', 0.25, { at: 0.1 }); },
  tick() { tone(880, 0.09, 'sine', 0.45); },
  go() { tone(1320, 0.3, 'triangle', 0.55); tone(1980, 0.3, 'sine', 0.3, { at: 0.02 }); },
  whoosh() { noise(0.5, 0.35, 500); tone(200, 0.5, 'sine', 0.2, { to: 900 }); },
  impact() { noise(0.4, 0.5, 100); tone(90, 0.5, 'sine', 0.7, { to: 30 }); },
  turbo() { tone(300, 0.3, 'sawtooth', 0.3, { to: 1400 }); noise(0.2, 0.2, 2000); },
  coin() { tone(1319, 0.08, 'square', 0.25); tone(1760, 0.22, 'square', 0.25, { at: 0.07 }); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'triangle', 0.45, { at: i * 0.12 })); tone(1047, 0.7, 'sine', 0.35, { at: 0.5 }); },
  lose() { [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.28, { at: i * 0.16, to: f * 0.9 })); },
  hard() { [660, 880, 1320].forEach((f, i) => tone(f, 0.15, 'square', 0.25, { at: i * 0.08 })); },
  fanfare() {
    noise(0.6, 0.35, 300);
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => { tone(f, 0.5, 'triangle', 0.5, { at: i * 0.11 }); tone(f / 2, 0.5, 'sawtooth', 0.18, { at: i * 0.11 }); });
    [1047, 1319, 1568].forEach((f) => tone(f, 1.4, 'sine', 0.4, { at: 0.75 }));
    tone(65, 1.2, 'sine', 0.8, { at: 0.7, to: 40 });
  },
  rank() { [523, 659, 784].forEach((f, i) => tone(f, 0.22, 'triangle', 0.4, { at: i * 0.1 })); },
};
export function sfx(n) { if (S[n]) { if (!AC) unlock(); try { S[n](); } catch (e) { /* nada */ } } }
setSfx(sfx);

/* ---- música: bajo + arpegio, dos estilos ---- */
let mTimer = null, step = 0, mStyle = '';
const SC = { menu: [57, 60, 64, 67, 64, 60, 69, 72], game: [52, 55, 59, 64, 59, 55, 62, 67] };
const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);
export function music(style) {
  if (style === mStyle) return;
  mStyle = style; clearInterval(mTimer); mTimer = null;
  if (!style) return;
  const bpm = style === 'game' ? 132 : 96, ms = (60 / bpm / 2) * 1000;
  mTimer = setInterval(() => {
    if (!AC || !SET.snd || SET.mus <= 0 || document.hidden) return;
    const sc = SC[style], n = sc[step % sc.length];
    tone(mf(n), 0.22, 'triangle', 0.5, { bus: musBus });
    if (step % 4 === 0) tone(mf(sc[0] - 24), 0.5, 'sine', 0.9, { bus: musBus });
    if (style === 'game' && step % 2 === 1) noise(0.04, 0.05, 6000);
    step++;
  }, ms);
}

/* vibración y voz opcional: la voz solo se usa en la intro */
export function say(txt) {
  try {
    if (!SET.snd || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(txt); u.rate = 1.05; u.pitch = 0.9; u.volume = 0.9;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { /* nada */ }
}
