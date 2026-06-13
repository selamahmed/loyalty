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
};

type DuoProgressPathProps = {
  levels: DuoLevel[];
  tierColor: string;
  currentRef: React.RefObject<HTMLButtonElement>;
  selectedLevel: number | null;
  onSelect: (level: number) => void;
};

const PATH_W = 320;
const NODE_GAP = 152;
const TOP_PAD = 36;
const BOTTOM_PAD = 48;
const SLOT_X = [160, 248, 160, 72];

function badgeWidth(lvl: DuoLevel) {
  if (lvl.isCurrent) return 84;
  if (lvl.unlocked) return 76;
  return 68;
}

function nodePos(index: number) {
  return {
    x: SLOT_X[index % SLOT_X.length],
    y: TOP_PAD + index * NODE_GAP,
  };
}

function buildTrail(levelCount: number): string {
  if (levelCount < 2) return '';
  let d = '';
  for (let i = 0; i < levelCount - 1; i += 1) {
    const a = nodePos(i);
    const b = nodePos(i + 1);
    const midY = (a.y + b.y) / 2;
    if (i === 0) d += `M ${a.x} ${a.y} `;
    d += `C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y} `;
  }
  return d;
}

function buildProgressTrail(levels: DuoLevel[]): string {
  const currentIdx = levels.findIndex(l => l.isCurrent);
  const endIdx = currentIdx >= 0 ? currentIdx : levels.reduce((acc, l, i) => (l.unlocked ? i : acc), 0);
  if (endIdx <= 0 || levels.length < 2) return '';
  let d = '';
  for (let i = 0; i < endIdx; i += 1) {
    const a = nodePos(i);
    const b = nodePos(i + 1);
    const midY = (a.y + b.y) / 2;
    if (i === 0) d += `M ${a.x} ${a.y} `;
    d += `C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y} `;
  }
  return d;
}

const DuoProgressPath: React.FC<DuoProgressPathProps> = ({
  levels,
  tierColor,
  currentRef,
  selectedLevel,
  onSelect,
}) => {
  const height = levels.length > 0
    ? TOP_PAD + (levels.length - 1) * NODE_GAP + BOTTOM_PAD
    : 120;

  const trail = useMemo(() => buildTrail(levels.length), [levels.length]);
  const progressTrail = useMemo(() => buildProgressTrail(levels), [levels]);

  return (
    <div className="duo-path" style={{ ['--duo-tier-color' as string]: tierColor }}>
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
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.2}
              />
              {progressTrail && (
                <path
                  d={progressTrail}
                  fill="none"
                  stroke={tierColor}
                  strokeWidth={5}
                  strokeLinecap="round"
                  className="duo-path__trail-active"
                />
              )}
            </>
          )}
        </svg>

        {levels.map((lvl, i) => {
          const { x, y } = nodePos(i);
          const locked = !lvl.unlocked && !lvl.isCurrent;
          const state = lvl.isCurrent ? 'current' : lvl.unlocked ? 'done' : 'locked';
          const xPct = (x / PATH_W) * 100;
          const w = badgeWidth(lvl);

          return (
            <div
              key={lvl.level}
              className="duo-path__station"
              style={{ left: `${xPct}%`, top: y }}
            >
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
                  {lvl.unlocked || lvl.isCurrent ? lvl.reward : `${lvl.xp.toLocaleString()} XP`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DuoProgressPath;
