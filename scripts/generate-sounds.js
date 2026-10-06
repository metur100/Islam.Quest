/**
 * Generates the app's subtle UI sounds as 16-bit mono WAV files.
 * Sounds are synthesized (soft sine tones and filtered noise) so the app ships
 * without third-party audio assets and without music.
 *
 * Usage: node scripts/generate-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(name, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  });
  fs.writeFileSync(path.join(OUT_DIR, name), buffer);
  console.log(`wrote ${name} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

/** Soft bell-like tone: sine + quiet octave, exponential decay, short attack. */
function tone(freq, duration, { volume = 0.4, decay = 6, attack = 0.005 } = {}) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    out[i] =
      volume *
      env *
      (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(2 * Math.PI * freq * 2 * t));
  }
  return out;
}

function mix(length, parts) {
  const out = new Float32Array(Math.floor(SAMPLE_RATE * length));
  for (const { offset, samples } of parts) {
    const start = Math.floor(SAMPLE_RATE * offset);
    for (let i = 0; i < samples.length && start + i < out.length; i++) {
      out[start + i] += samples[i];
    }
  }
  return out;
}

function fadeEdges(samples, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  for (let i = 0; i < n; i++) {
    const g = i / n;
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
  return samples;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// UI click: very short, soft tick.
writeWav('click.wav', tone(1200, 0.06, { volume: 0.25, decay: 70 }));

// Success: two rising notes (perfect fifth).
writeWav(
  'success.wav',
  mix(0.5, [
    { offset: 0, samples: tone(660, 0.35, { volume: 0.3, decay: 9 }) },
    { offset: 0.1, samples: tone(990, 0.4, { volume: 0.3, decay: 8 }) },
  ]),
);

// Failure: gentle, low and short — never harsh.
writeWav(
  'failure.wav',
  mix(0.45, [
    { offset: 0, samples: tone(392, 0.25, { volume: 0.25, decay: 10 }) },
    { offset: 0.12, samples: tone(330, 0.3, { volume: 0.22, decay: 9 }) },
  ]),
);

// Reward: soft ascending chime.
writeWav(
  'reward.wav',
  mix(1.2, [
    { offset: 0, samples: tone(523, 0.8, { volume: 0.22, decay: 5 }) },
    { offset: 0.12, samples: tone(659, 0.8, { volume: 0.22, decay: 5 }) },
    { offset: 0.24, samples: tone(784, 0.8, { volume: 0.22, decay: 5 }) },
    { offset: 0.36, samples: tone(1047, 0.8, { volume: 0.2, decay: 4 }) },
  ]),
);

// Ambient: slowly swelling, low-passed noise like a soft desert wind (no melody).
(function ambient() {
  const seconds = 12;
  const n = SAMPLE_RATE * seconds;
  const out = new Float32Array(n);
  let lp1 = 0;
  let lp2 = 0;
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  };
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    lp1 += 0.02 * (rand() - lp1);
    lp2 += 0.05 * (lp1 - lp2);
    // Swell period divides the loop length exactly so the loop is seamless.
    const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * t) / (seconds / 2));
    out[i] = lp2 * 6 * swell;
  }
  writeWav('ambient.wav', fadeEdges(out, 0.4));
})();
