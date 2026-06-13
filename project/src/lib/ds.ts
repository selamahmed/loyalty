/**
 * Design System — shared style tokens
 * Use these instead of defining `const card = {...}` in every component.
 */

import type { CSSProperties } from 'react';

/* ── Card ── */
export const cardStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '2px solid var(--border)',
  borderRadius: 'var(--r-lg)',      /* 18px */
  boxShadow: 'var(--shadow-md)',    /* 0 4px 0 border */
};

/** Elevated / hero variant */
export const cardElevated: CSSProperties = {
  ...cardStyle,
  boxShadow: 'var(--shadow-lg)',   /* 0 6px 0 border */
};

/** Interactive — use with press-card class */
export const cardInteractive: CSSProperties = {
  ...cardStyle,
  cursor: 'pointer',
  transition: 'transform 0.1s, box-shadow 0.1s',
};

/* ── Buttons (inline style objects when className="btn-primary" isn't suitable) ── */
export const btnPrimary: CSSProperties = {
  background: 'linear-gradient(160deg, var(--brand-light), var(--brand))',
  color: 'white',
  fontWeight: 700,
  border: '2px solid var(--border)',
  borderRadius: 'var(--r-md)',
  boxShadow: 'var(--shadow-md)',
  cursor: 'pointer',
  padding: '10px 20px',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export const btnSecondary: CSSProperties = {
  background: 'var(--surface)',
  color: 'var(--text)',
  fontWeight: 600,
  border: '2px solid var(--border)',
  borderRadius: 'var(--r-md)',
  boxShadow: 'var(--shadow-sm)',
  cursor: 'pointer',
  padding: '10px 20px',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export const btnGhost: CSSProperties = {
  background: 'transparent',
  color: 'var(--brand)',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

/* ── Icon box ── */
export const iconBox = (size = 44, color = 'var(--brand)', bg = 'rgba(123,63,245,0.1)'): CSSProperties => ({
  width: size,
  height: size,
  borderRadius: 'var(--r-sm)',
  background: bg,
  border: `1.5px solid ${color}33`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

/* ── Input ── */
export const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--surface-raised)',
  border: '2px solid var(--border)',
  borderRadius: 'var(--r-md)',
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  outline: 'none',
  boxSizing: 'border-box' as const,
};

/* ── Pill badge ── */
export const pillBadge = (color: string, bg: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  borderRadius: 'var(--r-pill)',
  fontSize: 10,
  fontWeight: 900,
  color,
  background: bg,
  border: `1.5px solid ${color}`,
  whiteSpace: 'nowrap' as const,
});

/* ── Divider ── */
export const divider: CSSProperties = {
  borderBottom: '1.5px dashed var(--border-subtle)',
};
