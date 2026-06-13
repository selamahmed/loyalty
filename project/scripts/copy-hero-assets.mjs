import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/assets/hero');

await mkdir(outDir, { recursive: true });
await copyFile(
  path.join(root, 'src/assets/stickers/colorful/Group 72.svg'),
  path.join(outDir, 'group-72.svg'),
);
console.log('LCP hero SVG copied to public/assets/hero/group-72.svg');
