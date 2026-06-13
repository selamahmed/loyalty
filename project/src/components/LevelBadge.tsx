import React from 'react';
import { getLevelBadge } from '../lib/levelBadges';

/** New hex badges are roughly square PNGs. */
export const BADGE_ASPECT = 1;

type LevelBadgeProps = {
  level: number;
  /** Badge width in px; height follows portrait ratio. */
  width?: number;
  /** @deprecated Use `width` — kept for existing call sites. */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  dimmed?: boolean;
  locked?: boolean;
  title?: string;
};

/** Rank badge — bare artwork, no frame. */
const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  width,
  size,
  className = '',
  style,
  dimmed = false,
  locked = false,
  title,
}) => {
  const badge = getLevelBadge(level);
  if (!badge.url) return null;

  const w = width ?? size ?? 40;
  const classes = [
    'level-badge',
    dimmed || locked ? 'level-badge--dimmed' : '',
    locked ? 'level-badge--locked' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <img
      src={badge.url}
      alt={title ?? badge.label}
      title={title ?? badge.label}
      draggable={false}
      className={classes}
      style={{
        ['--badge-w' as string]: `${w}px`,
        ...style,
      }}
    />
  );
};

/** Badge + optional label row for hero sections. */
export const LevelBadgeRow: React.FC<{
  level: number;
  width?: number;
  showLabel?: boolean;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ level, width = 64, showLabel = true, subtitle, className, style }) => {
  const badge = getLevelBadge(level);
  return (
    <div className={['level-badge-row', className].filter(Boolean).join(' ')} style={style}>
      <LevelBadge level={level} width={width} />
      {showLabel && (
        <div className="level-badge-row__text">
          <span className="level-badge-row__title">{badge.label}</span>
          {subtitle && <span className="level-badge-row__subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default LevelBadge;
