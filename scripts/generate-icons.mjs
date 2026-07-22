/**
 * Generates Kuytu's PWA icons with zero image dependencies.
 *
 * Renders a gold "K" monogram on the deep-night background at 2x supersampling,
 * downsamples for smooth edges, and encodes PNGs by hand (zlib + CRC32).
 * Outputs the files referenced by app/manifest.ts under public/icons/.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

// Brand colors.
const BG_TOP = [0x16, 0x16, 0x1e]; // slightly raised night
const BG_BOTTOM = [0x0b, 0x0b, 0x0e]; // kuytu-black
const GOLD = [0xd4, 0xaf, 0x37]; // kuytu-gold

const SS = 2; // supersampling factor

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

/** Shortest distance from point p to segment ab. */
function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const len2 = abx * abx + aby * aby || 1;
  const t = clamp01((apx * abx + apy * aby) / len2);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

/** Rounded-rectangle signed distance (negative inside). */
function roundedRectSDF(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

/**
 * Renders one icon into an RGBA buffer.
 * @param {number} size final pixel size
 * @param {boolean} maskable full-bleed background (no rounded corners) + inset K
 */
function renderIcon(size, maskable) {
  const S = size * SS;
  const rgba = Buffer.alloc(S * S * 4);

  // "K" geometry in normalized [0,1] coordinates. For maskable icons the mark
  // is scaled toward center to stay within the launcher safe zone.
  const inset = maskable ? 0.62 : 0.78; // fraction of canvas the K spans
  const c = 0.5;
  const map = (nx, ny) => [c + (nx - 0.5) * inset, c + (ny - 0.5) * inset];

  const stem = [map(0.32, 0.16), map(0.32, 0.84)];
  const upper = [map(0.32, 0.52), map(0.74, 0.16)];
  const lower = [map(0.36, 0.5), map(0.76, 0.84)];
  const strokeHalf = (maskable ? 0.052 : 0.066) * 1.0; // half stroke width (norm)
  const aa = 1.6 / S; // ~1px anti-alias band in normalized units

  const cornerR = maskable ? 0 : 0.22;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const nx = (x + 0.5) / S;
      const ny = (y + 0.5) / S;

      // Background: vertical gradient.
      const g = ny;
      let r = lerp(BG_TOP[0], BG_BOTTOM[0], g);
      let gr = lerp(BG_TOP[1], BG_BOTTOM[1], g);
      let b = lerp(BG_TOP[2], BG_BOTTOM[2], g);

      // Background alpha (rounded corners for non-maskable).
      let bgAlpha = 1;
      if (!maskable) {
        const d = roundedRectSDF(nx, ny, 0.5, 0.5, 0.5, 0.5, cornerR);
        bgAlpha = 1 - smoothstep(-aa, aa, d);
      }

      // Gold "K": min distance across the three strokes.
      const d = Math.min(
        distToSegment(nx, ny, stem[0][0], stem[0][1], stem[1][0], stem[1][1]),
        distToSegment(nx, ny, upper[0][0], upper[0][1], upper[1][0], upper[1][1]),
        distToSegment(nx, ny, lower[0][0], lower[0][1], lower[1][0], lower[1][1]),
      );
      const kCoverage = 1 - smoothstep(strokeHalf - aa, strokeHalf + aa, d);

      // Composite gold over background.
      r = lerp(r, GOLD[0], kCoverage);
      gr = lerp(gr, GOLD[1], kCoverage);
      b = lerp(b, GOLD[2], kCoverage);

      const i = (y * S + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = gr;
      rgba[i + 2] = b;
      rgba[i + 3] = Math.round(bgAlpha * 255);
    }
  }

  return downsample(rgba, S, SS);
}

/** Box-filter downsample by factor f → final size (S/f). */
function downsample(src, S, f) {
  const out = S / f;
  const dst = Buffer.alloc(out * out * 4);
  for (let y = 0; y < out; y++) {
    for (let x = 0; x < out; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const si = ((y * f + dy) * S + (x * f + dx)) * 4;
          r += src[si];
          g += src[si + 1];
          b += src[si + 2];
          a += src[si + 3];
        }
      }
      const n = f * f;
      const di = (y * out + x) * 4;
      dst[di] = Math.round(r / n);
      dst[di + 1] = Math.round(g / n);
      dst[di + 2] = Math.round(b / n);
      dst[di + 3] = Math.round(a / n);
    }
  }
  return dst;
}

// ---- Minimal PNG encoder ----

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(rgba, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Add a per-scanline filter byte (0 = none).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- SVG master (crisp, scalable) ----

function buildSVG() {
  const s = 512;
  const inset = 0.78;
  const map = (nx, ny) => [
    (0.5 + (nx - 0.5) * inset) * s,
    (0.5 + (ny - 0.5) * inset) * s,
  ];
  const p = (pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
  const stem = [map(0.32, 0.16), map(0.32, 0.84)];
  const upper = [map(0.32, 0.52), map(0.74, 0.16)];
  const lower = [map(0.36, 0.5), map(0.76, 0.84)];
  const w = (0.066 * 2 * s).toFixed(1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16161e"/>
      <stop offset="1" stop-color="#0B0B0E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <g stroke="#D4AF37" stroke-width="${w}" stroke-linecap="round" fill="none">
    <path d="M ${p(stem[0])} L ${p(stem[1])}"/>
    <path d="M ${p(upper[0])} L ${p(upper[1])}"/>
    <path d="M ${p(lower[0])} L ${p(lower[1])}"/>
  </g>
</svg>
`;
}

// ---- Run ----

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, maskable: true },
];

for (const t of targets) {
  const rgba = renderIcon(t.size, t.maskable);
  const png = encodePNG(rgba, t.size);
  writeFileSync(join(OUT_DIR, t.file), png);
  console.log(`✓ ${t.file} (${t.size}x${t.size}, ${png.length} bytes)`);
}

writeFileSync(join(OUT_DIR, "icon.svg"), buildSVG());
console.log("✓ icon.svg (master)");
