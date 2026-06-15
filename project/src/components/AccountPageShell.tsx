import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { playSound } from '../lib/sounds';

export const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  background: 'var(--tab-bg)',
  color: 'var(--text-dark)',
  border: '2.5px solid var(--dark-border)',
  boxShadow: '0 3px 0 var(--dark-border)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => { playSound('click'); onChange(!value); }}
    style={{
      position: 'relative', width: 48, height: 26, borderRadius: 999, flexShrink: 0,
      border: '2.5px solid var(--dark-border)',
      background: value ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)',
      cursor: 'pointer', transition: 'background 0.2s',
      boxShadow: '0 2px 0 var(--dark-border)',
    }}
  >
    <div style={{
      position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: 'white',
      transition: 'left 0.2s', left: value ? 26 : 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }} />
  </button>
);

export const Section: React.FC<{ title: string; emoji: string; children: React.ReactNode }> = ({ title, emoji, children }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingLeft: 4 }}>
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0 }}>{title}</p>
    </div>
    <div style={{ ...card, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

export const SaveButton: React.FC<{ label: string; loading?: boolean; onClick: () => void; color?: string }> = ({
  label, loading, onClick, color = '#7B6EF6',
}) => (
  <button
    onClick={() => { if (!loading) { playSound('click'); onClick(); } }}
    disabled={loading}
    style={{
      width: '100%', ...card,
      border: `3px solid ${color}`, boxShadow: `0 6px 0 ${color}cc`,
      padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: loading ? 'not-allowed' : 'pointer',
      background: `${color}12`, transition: 'transform 0.1s, box-shadow 0.1s',
      opacity: loading ? 0.7 : 1,
    }}
    onMouseDown={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 0 ${color}cc`; } }}
    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 0 ${color}cc`; }}
  >
    <span style={{ fontWeight: 900, fontSize: 15, color }}>{loading ? 'Kaydediliyor…' : label}</span>
  </button>
);

type AccountPageShellProps = {
  watermark: string;
  emoji: string;
  gradient: string;
  title: string;
  subtitle: string;
  backPath?: string;
  backLabel?: string;
  maxWidth?: 'lg' | '2xl' | '4xl';
  children: React.ReactNode;
};

const AccountPageShell: React.FC<AccountPageShellProps> = ({
  watermark, emoji, gradient, title, subtitle,
  backPath = '/settings', backLabel = 'Ayarları Dön', maxWidth = 'lg', children,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>{watermark}</div>
      </div>

      <div className={`p-3 sm:p-4 lg:p-6 space-y-5 mx-auto overflow-x-hidden ${maxWidth === '4xl' ? 'max-w-4xl' : maxWidth === '2xl' ? 'max-w-2xl' : 'max-w-lg'}`} style={{ position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => { playSound('click'); navigate(backPath); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            cursor: 'pointer', padding: '4px 0', color: 'var(--text-muted)', fontWeight: 900, fontSize: 12,
          }}
        >
          <ArrowLeft size={16} /> {backLabel}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: gradient,
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>{emoji}</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>{subtitle}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AccountPageShell;
