/**
 * Renders the app icon, adaptive icon layers, splash icon and favicon as PNG files
 * without any image dependencies (simple supersampled vector shapes + zlib PNG encoder).
 *
 * Motif: a golden crescent and an eight-pointed star (Rub el Hizb) on a night-sky gradient.
 *
 * Usage: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets');
const NIGHT_TOP = [20, 23, 58];
const NIGHT_BOTTOM = [52, 58, 128];
const GOLD = [242, 181, 68];
const GOLD_LIGHT = [255, 214, 122];

// ---------- PNG encoding ----------
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writePng(file, size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(OUT, file), png);
  console.log(`wrote ${file} (${size}x${size})`);
}

// ---------- shapes (unit coordinates: 0..1) ----------
function inCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
function inStar8(x, y, cx, cy, s) {
  const dx = x - cx;
  const dy = y - cy;
  const square = Math.abs(dx) <= s && Math.abs(dy) <= s;
  const diamond = Math.abs(dx + dy) / Math.SQRT2 <= s && Math.abs(dx - dy) / Math.SQRT2 <= s;
  return square || diamond;
}

/** Motif inside a box of the given scale (1 = full canvas), centred. */
function motif(x, y, scale) {
  const u = 0.5 + (x - 0.5) / scale;
  const v = 0.5 + (y - 0.5) / scale;
  const crescent = inCircle(u, v, 0.46, 0.5, 0.3) && !inCircle(u, v, 0.56, 0.44, 0.26);
  const star = inStar8(u, v, 0.63, 0.47, 0.07);
  const starCore = inCircle(u, v, 0.63, 0.47, 0.035);
  if (starCore) return 'core';
  if (crescent || star) return 'gold';
  return null;
}

function render(size, { background, scale, monochrome = false, transparent = false, rounded = false }) {
  const buf = Buffer.alloc(size * size * 4);
  const SS = 4;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          if (rounded && !inRoundedSquare(x, y, 0.2)) continue;
          const m = motif(x, y, scale);
          let c = null;
          if (m) c = monochrome ? [255, 255, 255] : m === 'core' ? NIGHT_TOP : mix(GOLD_LIGHT, GOLD, y);
          else if (!transparent && background) c = mix(NIGHT_TOP, NIGHT_BOTTOM, y);
          if (m === 'core' && monochrome) c = null;
          if (c) {
            r += c[0];
            g += c[1];
            b += c[2];
            a += 1;
          }
        }
      }
      const i = (py * size + px) * 4;
      const n = SS * SS;
      buf[i] = a ? Math.round(r / a) : 0;
      buf[i + 1] = a ? Math.round(g / a) : 0;
      buf[i + 2] = a ? Math.round(b / a) : 0;
      buf[i + 3] = Math.round((a / n) * 255);
    }
  }
  return buf;
}

function inRoundedSquare(x, y, radius) {
  const dx = Math.max(Math.abs(x - 0.5) - (0.5 - radius), 0);
  const dy = Math.max(Math.abs(y - 0.5) - (0.5 - radius), 0);
  return dx * dx + dy * dy <= radius * radius;
}

function mix(c1, c2, t) {
  return [0, 1, 2].map((i) => Math.round(c1[i] + (c2[i] - c1[i]) * t));
}

function solid(size, top, bottom) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const c = mix(top, bottom, y / size);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      buf[i] = c[0];
      buf[i + 1] = c[1];
      buf[i + 2] = c[2];
      buf[i + 3] = 255;
    }
  }
  return buf;
}

fs.mkdirSync(OUT, { recursive: true });
writePng('icon.png', 1024, render(1024, { background: true, scale: 0.9 }));
// Adaptive icon: Android masks the outer third, so the motif is drawn smaller.
writePng('android-icon-foreground.png', 1024, render(1024, { transparent: true, scale: 0.62 }));
writePng('android-icon-background.png', 1024, solid(1024, NIGHT_TOP, NIGHT_BOTTOM));
writePng('android-icon-monochrome.png', 1024, render(1024, { transparent: true, scale: 0.62, monochrome: true }));
writePng('splash-icon.png', 512, render(512, { transparent: true, scale: 1 }));
writePng('favicon.png', 64, render(64, { background: true, scale: 0.95, rounded: true }));
