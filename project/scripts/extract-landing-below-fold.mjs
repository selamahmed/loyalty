import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, '../src/pages/LandingPage.tsx');
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
const body = lines.slice(299, 668).join('\n');

const header = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Check, ChevronRight, Zap, Gift, Gamepad2, Target, Trophy, Users } from 'lucide-react';
import { SectionBadge } from '../components/neo/NeoBrutalDecor';
import StickerAccent from '../components/StickerAccent';
import { SectionStickerDecor, StickerSectionDivider } from '../components/StickerDecor';
import { LANDING_BANNER_STICKERS, LANDING_LIFESTYLE_STICKERS, LANDING_CTA_STICKERS } from '../lib/pageStickers';
import { LANDING_TESTIMONIAL_AVATARS } from '../lib/landingDemoAvatars';
import AppLogo from '../components/AppLogo';
import { features, banners, testimonials, steps, tickerHero, TickerStrip, NBolt, NStar5, NDiamond, NHeart, NBurst, NStar4 } from './landingShared';

export type LandingTheme = {
  pageBg: string; heroText: string; navBg: string; cardBg: string; cardBg2: string;
  textPrimary: string; textSecondary: string; textMuted: string; pillBg: string;
  footerBg: string; footerText: string; howBg: string;
  cssVars: React.CSSProperties;
};

type Props = {
  t: LandingTheme;
  isDark: boolean;
  card: React.CSSProperties;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  scrollTo: (id: string) => void;
};

const LandingBelowFold: React.FC<Props> = ({ t, isDark, card, hovered, setHovered, scrollTo }) => {
  const navigate = useNavigate();
`;

const footer = `\n};\n\nexport default LandingBelowFold;\n`;
fs.writeFileSync(path.join(__dirname, '../src/pages/LandingBelowFold.tsx'), header + body + footer);
console.log('LandingBelowFold.tsx written');
