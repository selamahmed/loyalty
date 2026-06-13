/**
 * Neo-Brutalism Avatar Generator
 * ─────────────────────────────────────────────────────────────
 * Deterministic, offline, SVG-based avatar system.
 * Same seed → same avatar every time, no external API needed.
 */

/* ── PRNG ────────────────────────────────────────────────────── */

/** Mulberry32 — fast seeded PRNG, reproducible */
function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash: string → stable uint32 */
function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Pick element using a 0-1 float from the PRNG */
function pick<T>(arr: T[], rand: number): T {
  return arr[Math.floor(rand * arr.length)];
}

/* ── Palette (Neo-Brutalism spec) ────────────────────────────── */
const BG_COLORS     = ['#FFDE59', '#FF6B6B', '#4ECDC4', '#6C63FF'];
const HAIR_COLORS   = ['#1C1C2E', '#2D2D44', '#6C63FF', '#FF6B6B', '#4ECDC4', '#FFDE59'];
const SKIN_TONES    = ['#FDDBB4', '#F5C89A', '#E0A87C', '#C4744A', '#8D5524', '#FFE8CE'];
const SHIRT_COLORS  = ['#FF6B6B', '#4ECDC4', '#6C63FF', '#FFDE59', '#1C1C2E', '#2D2D44'];
const ACCENT_COLORS = ['#FFDE59', '#FF6B6B', '#4ECDC4', '#6C63FF'];
const GLASS_COLORS  = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFDE59', '#000000'];

/* ── SVG Parts ───────────────────────────────────────────────── */

/*
  Coordinate system: 100×100 viewBox
  Face: cx=50, cy=54, rx=25, ry=28   → top y=26, bottom y=82, sides x=25-75
  Eyes: left cx=37 cy=47, right cx=63 cy=47
  Brows: y≈33-37
  Nose: y=61
  Mouth: y=68-79
  Hair: y=0–28 (overlaps face top)
  Neck: y=80-91
  Shirt: y=83-100
*/

function buildHairBehind(style: number, hair: string): string {
  if (style !== 3) return '';
  return `
    <rect x="18" y="27" width="10" height="43" fill="${hair}" stroke="#000" stroke-width="2.5" rx="5"/>
    <rect x="72" y="27" width="10" height="43" fill="${hair}" stroke="#000" stroke-width="2.5" rx="5"/>
  `;
}

function buildEars(skin: string, accent: string, hasEarring: boolean): string {
  return `
    <ellipse cx="24" cy="53" rx="5.5" ry="7" fill="${skin}" stroke="#000" stroke-width="2.5"/>
    <ellipse cx="76" cy="53" rx="5.5" ry="7" fill="${skin}" stroke="#000" stroke-width="2.5"/>
    ${hasEarring
      ? `<circle cx="76" cy="57.5" r="3.2" fill="${accent}" stroke="#000" stroke-width="1.5"/>
         <circle cx="76" cy="57.5" r="1.2" fill="#fff"/>`
      : ''}
  `;
}

function buildHairFront(style: number, hair: string): string {
  const b = `fill="${hair}" stroke="#000" stroke-width="3" stroke-linejoin="round"`;
  const styles = [
    // 0 – smooth dome
    `<path d="M26,53 Q25,15 50,13 Q75,15 74,53 Q65,27 50,24 Q35,27 26,53Z" ${b}/>`,
    // 1 – spiky
    `<path d="M26,53 L33,23 L39,44 L45,17 L50,40 L55,15 L61,40 L67,22 L74,53
              Q65,27 50,24 Q35,27 26,53Z" ${b}/>`,
    // 2 – flat-top (undercut)
    `<rect x="23" y="11" width="54" height="22" fill="${hair}" stroke="#000" stroke-width="3" rx="4"/>`,
    // 3 – long (sides are in hairBehind, here just the top dome)
    `<ellipse cx="50" cy="26" rx="28" ry="16" fill="${hair}" stroke="#000" stroke-width="3"/>`,
    // 4 – side-swept
    `<path d="M26,55 Q22,9 50,9 Q71,9 74,27 L72,55 Q62,30 48,30 Q34,28 26,55Z" ${b}/>`,
    // 5 – top-knot / bun
    `<circle cx="50" cy="9" r="14" fill="${hair}" stroke="#000" stroke-width="3"/>
     <path d="M36,21 Q50,15 64,21" fill="${hair}" stroke="#000" stroke-width="2.5"/>`,
  ];
  return styles[style] ?? styles[0];
}

function buildEyes(style: number, skin: string, accent: string, hasGlasses: boolean, glassC: string): string {
  const glasses = hasGlasses
    ? `<rect x="27" y="39" width="19" height="17" fill="none" stroke="${glassC}" stroke-width="3" rx="4"/>
       <rect x="54" y="39" width="19" height="17" fill="none" stroke="${glassC}" stroke-width="3" rx="4"/>
       <line x1="46" y1="47.5" x2="54" y2="47.5" stroke="${glassC}" stroke-width="2.5"/>
       <line x1="20" y1="47" x2="27" y2="47" stroke="${glassC}" stroke-width="2"/>
       <line x1="73" y1="47" x2="80" y2="47" stroke="${glassC}" stroke-width="2"/>`
    : '';

  const styles = [
    // 0 – large round eyes
    `<ellipse cx="37" cy="47" rx="8.5" ry="9.5" fill="#fff" stroke="#000" stroke-width="2.5"/>
     <circle cx="37.5" cy="49" r="5.2" fill="#000"/>
     <circle cx="40" cy="46" r="2" fill="#fff"/>
     <ellipse cx="63" cy="47" rx="8.5" ry="9.5" fill="#fff" stroke="#000" stroke-width="2.5"/>
     <circle cx="63.5" cy="49" r="5.2" fill="#000"/>
     <circle cx="66" cy="46" r="2" fill="#fff"/>
     ${glasses}`,

    // 1 – square geo eyes
    `<rect x="27.5" y="38" width="19" height="19" fill="#fff" stroke="#000" stroke-width="2.5" rx="2.5"/>
     <rect x="31.5" y="42" width="10" height="10" fill="#000" rx="1.5"/>
     <circle cx="37" cy="44.5" r="1.8" fill="#fff"/>
     <rect x="53.5" y="38" width="19" height="19" fill="#fff" stroke="#000" stroke-width="2.5" rx="2.5"/>
     <rect x="57.5" y="42" width="10" height="10" fill="#000" rx="1.5"/>
     <circle cx="63" cy="44.5" r="1.8" fill="#fff"/>
     ${glasses}`,

    // 2 – sparkle eyes (accent highlight)
    `<ellipse cx="37" cy="47" rx="8.5" ry="9.5" fill="#fff" stroke="#000" stroke-width="2.5"/>
     <circle cx="37" cy="49" r="5" fill="#000"/>
     <circle cx="40.5" cy="44.5" r="3" fill="${accent}"/>
     <circle cx="39.5" cy="46" r="1.3" fill="#fff"/>
     <ellipse cx="63" cy="47" rx="8.5" ry="9.5" fill="#fff" stroke="#000" stroke-width="2.5"/>
     <circle cx="63" cy="49" r="5" fill="#000"/>
     <circle cx="66.5" cy="44.5" r="3" fill="${accent}"/>
     <circle cx="65.5" cy="46" r="1.3" fill="#fff"/>
     ${glasses}`,
  ];

  // use skin param only to keep TS happy (no "unused" warning)
  void skin;
  return styles[style] ?? styles[0];
}

function buildBrows(style: number, hair: string): string {
  const c = hair === '#FFDE59' ? '#1C1C2E' : hair; // yellow hair → dark brows
  const b = `stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"`;
  const styles = [
    // 0 – flat neutral
    `<line x1="28" y1="35.5" x2="44" y2="34.5" ${b}/>
     <line x1="56" y1="34.5" x2="72" y2="35.5" ${b}/>`,
    // 1 – arched / friendly
    `<path d="M28,38 Q36,31 44,34.5" ${b}/>
     <path d="M56,34.5 Q64,31 72,38" ${b}/>`,
    // 2 – stern angled
    `<line x1="28" y1="37" x2="44" y2="32" ${b}/>
     <line x1="56" y1="32" x2="72" y2="37" ${b}/>`,
  ];
  return styles[style] ?? styles[0];
}

function buildNose(skin: string): string {
  return `
    <circle cx="46" cy="61" r="2" fill="${skin}" stroke="#000" stroke-width="1.5"/>
    <circle cx="54" cy="61" r="2" fill="${skin}" stroke="#000" stroke-width="1.5"/>
  `;
}

function buildMouth(style: number): string {
  const styles = [
    // 0 – happy curve
    `<path d="M40,70 Q50,80 60,70" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>`,
    // 1 – neutral line
    `<line x1="41" y1="70" x2="59" y2="70" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>`,
    // 2 – smirk
    `<path d="M42,70 Q50,75 58,68" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>`,
    // 3 – open smile with teeth
    `<path d="M39,68 Q50,81 61,68Z" fill="#fff" stroke="#000" stroke-width="2.5"/>
     <line x1="50" y1="68" x2="50" y2="77" stroke="#000" stroke-width="1.5"/>
     <path d="M39,68 Q50,68 61,68" fill="none" stroke="#000" stroke-width="2"/>`,
  ];
  return styles[style] ?? styles[0];
}

function buildBlush(accent: string): string {
  return `
    <ellipse cx="30" cy="62" rx="7" ry="4.5" fill="${accent}" opacity="0.28"/>
    <ellipse cx="70" cy="62" rx="7" ry="4.5" fill="${accent}" opacity="0.28"/>
  `;
}

function buildFreckles(accent: string): string {
  return `
    <circle cx="33" cy="59.5" r="2"   fill="${accent}"/>
    <circle cx="37" cy="63"   r="1.5" fill="${accent}"/>
    <circle cx="63" cy="59.5" r="2"   fill="${accent}"/>
    <circle cx="67" cy="63"   r="1.5" fill="${accent}"/>
    <circle cx="40" cy="57.5" r="1.5" fill="${accent}"/>
  `;
}

function buildBody(skin: string, shirt: string): string {
  return `
    <rect x="43" y="80" width="14" height="12" fill="${skin}" stroke="#000" stroke-width="2.5"/>
    <path d="M14,100 Q16,83 50,83 Q84,83 86,100Z" fill="${shirt}" stroke="#000" stroke-width="3"/>
  `;
}

/* ── Main Export ─────────────────────────────────────────────── */

/**
 * Returns a fully self-contained SVG string for the given seed.
 * The same seed always produces the same avatar.
 */
export function generateNeoAvatar(seed: string): string {
  const norm = (seed || 'user').toLowerCase().trim();
  const rng  = mulberry32(fnv1a(norm));
  const r    = () => rng();

  // Pick palette choices
  const bg     = pick(BG_COLORS,    r());
  const hair   = pick(HAIR_COLORS,  r());
  const skin   = pick(SKIN_TONES,   r());
  const shirt  = pick(SHIRT_COLORS, r());
  const accent = pick(ACCENT_COLORS, r());
  const glassC = pick(GLASS_COLORS,  r());

  // Pick style variants
  const hairStyle  = Math.floor(r() * 6);
  const eyeStyle   = Math.floor(r() * 3);
  const browStyle  = Math.floor(r() * 3);
  const mouthStyle = Math.floor(r() * 4);

  // Pick boolean traits
  const hasGlasses  = r() > 0.66;
  const hasBlush    = r() > 0.50;
  const hasFreckles = r() > 0.72;
  const hasEarring  = r() > 0.74;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">`,
    // Background (inset by 1.5 so the 3px stroke stays inside viewBox)
    `<rect x="1.5" y="1.5" width="97" height="97" fill="${bg}" stroke="#000" stroke-width="3"/>`,
    buildHairBehind(hairStyle, hair),
    buildEars(skin, accent, hasEarring),
    // Face
    `<ellipse cx="50" cy="54" rx="25" ry="28" fill="${skin}" stroke="#000" stroke-width="3"/>`,
    buildHairFront(hairStyle, hair),
    buildEyes(eyeStyle, skin, accent, hasGlasses, glassC),
    buildBrows(browStyle, hair),
    buildNose(skin),
    buildMouth(mouthStyle),
    hasBlush    ? buildBlush(accent)    : '',
    hasFreckles ? buildFreckles(accent) : '',
    buildBody(skin, shirt),
    `</svg>`,
  ];

  return parts.join('\n');
}

/**
 * Get 1-2 initials from a name or email (used as last-resort fallback label).
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'U';
}

/**
 * Deterministic background color for the initials fallback.
 * Uses a simple hash of the seed string.
 */
export function getInitialsBg(seed: string): string {
  const colors = ['#FFDE59', '#FF6B6B', '#4ECDC4', '#6C63FF'];
  let h = fnv1a((seed || 'u').toLowerCase());
  return colors[h % colors.length];
}
