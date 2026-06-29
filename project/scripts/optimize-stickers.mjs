/**
 * Right-size oversized "colorful" sticker SVGs.
 *
 * Several brand stickers are exported as ~1080x1350 PNGs base64-embedded inside
 * an SVG wrapper (~0.5-1.3 MB each), yet they never render larger than ~268px
 * on screen. This script decodes every embedded raster, downscales it to a
 * retina-safe maximum dimension, re-encodes it as high-quality WebP, and writes
 * the SVG back in place. The SVG structure, <image> geometry, ids and file
 * names are preserved, so nothing in the loading/catalog pipeline changes.
 *
 * Run:  node scripts/optimize-stickers.mjs            (optimize, in place)
 *       node scripts/optimize-stickers.mjs --dry      (report only)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COLORFUL_DIR = join(ROOT, 'src/assets/stickers/colorful');
const BACKUP_DIR = join(ROOT, 'src/assets/stickers/.original-backup');

// Largest on-screen render is ~268px (hero-card) / ~300px (landing). 768px gives
// generous >2.5x retina headroom while still slashing byte size.
const MAX_DIM = 768;
const WEBP_QUALITY = 82;
// Only touch files above this size — small stickers are already fine as-is.
const MIN_FILE_BYTES = 400 * 1024;

const DRY = process.argv.includes('--dry');

const DATA_URI_RE = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/g;

const targets = [
  'logosticker.svg', 'TICKETS.svg', 'RANKING.svg', 'qrcode.svg',
  'cardboardbox.svg', 'GAMES.svg', 'TROPHY.svg', 'logo.svg',
];

async function processFile(file) {
  const path = join(COLORFUL_DIR, file);
  if (!existsSync(path)) {
    console.warn(`skip (missing): ${file}`);
    return;
  }
  const before = readFileSync(path, 'utf8');
  if (Buffer.byteLength(before) < MIN_FILE_BYTES) {
    console.log(`skip (small): ${file}`);
    return;
  }

  const matches = [...before.matchAll(DATA_URI_RE)];
  if (matches.length === 0) {
    console.log(`skip (no raster): ${file}`);
    return;
  }

  let out = '';
  let cursor = 0;
  let imgIndex = 0;
  const notes = [];

  for (const m of matches) {
    const [full, , b64] = m;
    const start = m.index;
    out += before.slice(cursor, start);

    const input = Buffer.from(b64, 'base64');
    try {
      const meta = await sharp(input).metadata();
      const longest = Math.max(meta.width || 0, meta.height || 0);
      const resizeOpts =
        longest > MAX_DIM
          ? { width: meta.width >= meta.height ? MAX_DIM : null, height: meta.height > meta.width ? MAX_DIM : null, fit: 'inside', withoutEnlargement: true }
          : null;

      let pipeline = sharp(input);
      if (resizeOpts) pipeline = pipeline.resize(resizeOpts);
      const webp = await pipeline.webp({ quality: WEBP_QUALITY, effort: 6 }).toBuffer();

      // Only adopt the WebP if it actually shrinks the payload.
      if (webp.length < input.length) {
        out += `data:image/webp;base64,${webp.toString('base64')}`;
        notes.push(`#${imgIndex} ${meta.width}x${meta.height} ${(input.length / 1024) | 0}KB->${(webp.length / 1024) | 0}KB`);
      } else {
        out += full;
        notes.push(`#${imgIndex} kept (${(input.length / 1024) | 0}KB)`);
      }
    } catch {
      out += full;
      notes.push(`#${imgIndex} decode-fail (kept)`);
    }
    cursor = start + full.length;
    imgIndex += 1;
  }
  out += before.slice(cursor);

  const beforeKB = (Buffer.byteLength(before) / 1024) | 0;
  const afterKB = (Buffer.byteLength(out) / 1024) | 0;
  console.log(`${file.padEnd(18)} ${beforeKB}KB -> ${afterKB}KB  [${notes.join(' ; ')}]`);

  if (!DRY && afterKB < beforeKB) {
    if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });
    const backup = join(BACKUP_DIR, basename(file));
    if (!existsSync(backup)) copyFileSync(path, backup);
    writeFileSync(path, out, 'utf8');
  }
}

const run = async () => {
  console.log(DRY ? '== DRY RUN ==' : '== Optimizing stickers ==');
  for (const f of targets) await processFile(f);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
