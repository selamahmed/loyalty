import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/fonts');

const files = [
  ['node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2', 'archivo-black-latin-400.woff2'],
  ['node_modules/@fontsource/archivo-black/files/archivo-black-latin-ext-400-normal.woff2', 'archivo-black-latin-ext-400.woff2'],
  ['node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2', 'space-grotesk-latin-400.woff2'],
  ['node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2', 'space-grotesk-latin-700.woff2'],
  ['node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-ext-400-normal.woff2', 'space-grotesk-latin-ext-400.woff2'],
  ['node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2', 'space-grotesk-latin-500.woff2'],
  ['node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2', 'space-grotesk-latin-600.woff2'],
];

await mkdir(outDir, { recursive: true });
for (const [src, dest] of files) {
  await copyFile(path.join(root, src), path.join(outDir, dest));
}
console.log('Critical fonts copied to public/fonts/');
