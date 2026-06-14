import React, { useMemo } from 'react';
import { playSound } from '../lib/sounds';
import LevelBadge from './LevelBadge';
import { getLevelBadge } from '../lib/levelBadges';

export type DuoLevel = {
  level: number;
  title: string;
  xp: number;
  reward: string;
  bonus: number;
  unlocked: boolean;
  isCurrent: boolean;
  tierLabel?: string;
  tierEmoji?: string;
  tierColor?: string;
  isTierStart?: boolean;
};

type DuoProgressPathProps = {
  levels: DuoLevel[];
  currentRef: React.RefObject<HTMLButtonElement>;
  selectedLevel: number | null;
  onSelect: (level: number) => void;
};

const PATH_W = 320;
const NODE_GAP = 136;
const TOP_PAD = 24;
const BOTTOM_PAD = 40;
const TIER_MARKER_H = 44;
const SLOT_X = [160, 248, 160, 72];

function badgeWidth(lvl: DuoLevel) {
  if (lvl.isCurrent) return 80;
  if (lvl.unlocked) return 72;
  return 64;
}

function computeLayout(levels: DuoLevel[]) {
  let y = TOP_PAD;
  return levels.map((lvl, i) => {
    if (i > 0 && lvl.isTierStart) y += TIER_MARKER_H;
    const pos = { x: SLOT_X[i % SLOT_X.length], y };
    y += NODE_GAP;
    return pos;
  });
}

function buildTrail(positions: { x: number; y: number }[]): string {
  if (positions.length < 2) return '';
  let d = '';
  for (let i = 0; i < positions.length - 1; i += 1) {
    const a = positions[i];
    const b = positions[i + 1];
    const midY = (a.y + b.y) / 2;
    if (i === 0) d += `M ${a.x} ${a.y} `;
    d += `C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y} `;
  }
  return d;
}

function buildProgressTrail(levels: DuoLevel[], positions: { x: number; y: number }[]): string {
  const currentIdx = levels.findIndex(l => l.isCurrent);
  const endIdx = currentIdx >= 0
    ? currentIdx
    : levels.reduce((acc, l, i) => (l.unlocked ? i : acc), 0);
  if (endIdx <= 0 || positions.length < 2) return '';
  let d = '';
  for (let i = 0; i < endIdx; i += 1) {
    const a = positions[i];
    const b = positions[i + 1];
    const midY = (a.y + b.y) / 2;
    if (i === 0) d += `M ${a.x} ${a.y} `;
    d += `C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y} `;
  }
  return d;
}

const DuoProgressPath: React.FC<DuoProgressPathProps> = ({
  levels,
  currentRef,
  selectedLevel,
  onSelect,
}) => {
  const positions = useMemo(() => computeLayout(levels), [levels]);
  const height = positions.length > 0
    ? positions[positions.length - 1].y + BOTTOM_PAD
    : 120;

  const trail = useMemo(() => buildTrail(positions), [positions]);
  const progressTrail = useMemo(() => buildProgressTrail(levels, positions), [levels, positions]);

  const activeColor = levels.find(l => l.isCurrent)?.tierColor ?? 'var(--gradient-start)';

  return (
    <div className="duo-path">
      <div className="duo-path__canvas" style={{ height }}>
        <svg
          className="duo-path__svg"
          width={PATH_W}
          height={height}
          viewBox={`0 0 ${PATH_W} ${height}`}
          aria-hidden
        >
          {trail && (
            <>
              <path
                d={trail}
                fill="none"
                stroke="var(--dark-border)"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.12}
              />
              {progressTrail && (
                <path
                  d={progressTrail}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth={4}
                  strokeLinecap="round"
                  className="duo-path__trail-active"
                />
              )}
            </>
          )}
        </svg>

        {levels.map((lvl, i) => {
          const { x, y } = positions[i];
          const locked = !lvl.unlocked && !lvl.isCurrent;
          const state = lvl.isCurrent ? 'current' : lvl.unlocked ? 'done' : 'locked';
          const xPct = (x / PATH_W) * 100;
          const w = badgeWidth(lvl);
          const tierTop = i > 0 && lvl.isTierStart ? y - NODE_GAP / 2 - TIER_MARKER_H / 2 : null;

          return (
            <React.Fragment key={lvl.level}>
              {lvl.isTierStart && tierTop != null && (
                <div
                  className="duo-path__tier-marker"
                  style={{ left: '50%', top: tierTop, ['--tier-color' as string]: lvl.tierColor ?? 'var(--gradient-start)' }}
                >
                  <span className="duo-path__tier-marker-pill">
                    {lvl.tierEmoji} {lvl.tierLabel}
                  </span>
                </div>
              )}
              {lvl.isTierStart && i === 0 && (
                <div
                  className="duo-path__tier-marker duo-path__tier-marker--start"
                  style={{ left: '50%', top: Math.max(8, y - NODE_GAP * 0.55), ['--tier-color' as string]: lvl.tierColor ?? 'var(--gradient-start)' }}
                >
                  <span className="duo-path__tier-marker-pill">
                    {lvl.tierEmoji} {lvl.tierLabel}
                  </span>
                </div>
              )}

              <div className="duo-path__station" style={{ left: `${xPct}%`, top: y }}>
                {lvl.isCurrent && <span className="duo-path__now">ŞU AN</span>}

                <button
                  type="button"
                  ref={lvl.isCurrent ? currentRef : undefined}
                  className={[
                    'duo-path__node',
                    `duo-path__node--${state}`,
                    selectedLevel === lvl.level ? 'duo-path__node--selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => { playSound('click'); onSelect(lvl.level); }}
                  aria-label={`${lvl.title}, ${getLevelBadge(lvl.level).label}`}
                >
                  {lvl.unlocked && !lvl.isCurrent && (
                    <span className="duo-path__check" aria-hidden>✓</span>
                  )}
                  {locked && <span className="duo-path__lock" aria-hidden>🔒</span>}
                  <LevelBadge
                    level={lvl.level}
                    width={w}
                    dimmed={locked}
                    locked={locked}
                    className="duo-path__badge"
                  />
                </button>

                {lvl.bonus > 0 && (
                  <span className="duo-path__bonus">+{lvl.bonus}</span>
                )}

                <div className="duo-path__label">
                  <p className="duo-path__title">{lvl.title}</p>
                  <p className="duo-path__meta">
                    {lvl.unlocked || lvl.isCurrent
                      ? (lvl.reward || 'Ödül açıldı')
                      : `${lvl.xp.toLocaleString('tr-TR')} XP`}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DuoProgressPath;
