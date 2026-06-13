import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/assets/icons/logo.png');
const outDir = path.join(__dirname, '../public/assets/icons');

const sizes = [32, 36, 64, 72, 192];

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const base = `logo-${size}`;
  await sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toFile(path.join(outDir, `${base}.webp`));
  await sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9, palette: true }).toFile(path.join(outDir, `${base}.png`));
}

console.log('Optimized logo variants written to public/assets/icons/');
