import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../src/pages/LandingPage.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('/* ══ TICKER 1 ══ */'));
const endIdx = lines.findIndex(l => l.includes('/* ══ GLOBAL STYLES ══ */'));

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found', { startIdx, endIdx });
  process.exit(1);
}

const replacement = [
  '        <Suspense fallback={null}>',
  '          <LandingBelowFold',
  '            t={t}',
  '            isDark={isDark}',
  '            card={card}',
  '            hovered={hovered}',
  '            setHovered={setHovered}',
  '            scrollTo={scrollTo}',
  '          />',
  '        </Suspense>',
  '',
];

const next = [...lines.slice(0, startIdx), ...replacement, ...lines.slice(endIdx)];
fs.writeFileSync(filePath, next.join('\n'));
console.log('Replaced below-fold section', startIdx, '->', endIdx);
