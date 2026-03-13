/**
 * Sound effects & haptic feedback for emergency actions.
 * Uses Web Audio API (no external files) and Vibration API.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

/** Urgent ascending alarm — SOS button pressed */
export function playSOSSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Three ascending tones
  [440, 587, 740].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.25, now + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);
    osc.connect(g).connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.25);
  });
}

/** Countdown tick sound */
export function playCountdownTick() {
  playTone(800, 0.1, "sine", 0.2);
}

/** Broadcast/relay hop sound */
export function playRelayHop() {
  playTone(1200, 0.08, "sine", 0.15);
}

/** Success chime — alert resolved / SOS delivered */
export function playSuccessSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.2, now + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.3);
  });
}

/** Haptic: short vibration burst */
export function vibrateShort() {
  try { navigator.vibrate?.(50); } catch {}
}

/** Haptic: SOS pattern (... --- ...) */
export function vibrateSOSPattern() {
  try {
    navigator.vibrate?.([
      100, 50, 100, 50, 100,  // S: ...
      200, 50,                 // gap
      200, 50, 200, 50, 200,  // O: ---
      200, 50,                 // gap
      100, 50, 100, 50, 100,  // S: ...
    ]);
  } catch {}
}

/** Haptic: double pulse for success */
export function vibrateSuccess() {
  try { navigator.vibrate?.([80, 60, 120]); } catch {}
}

/** Haptic: single strong pulse */
export function vibrateStrong() {
  try { navigator.vibrate?.(150); } catch {}
}
