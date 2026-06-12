import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Store, ScanLine, ArrowRight, Lock, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../context/AuthContext';

/* ─── Role tabs ─────────────────────────────────────────────── */
type AdminRole = 'super_admin' | 'store_admin' | 'cashier';

const ROLES: {
  id: AdminRole;
  label: string;
  sublabel: string;
  color: string;
  shadow: string;
  icon: React.ElementType;
  email: string;
  badge: string;
}[] = [
  {
    id: 'super_admin',
    label: 'Süper Admin',
    sublabel: 'Tüm sisteme tam erişim',
    color: '#9122FF',
    shadow: '#6b19c0',
    icon: ShieldCheck,
    email: 'admin@nexreward.com',
    badge: '⚡ SÜPER ADMIN',
  },
  {
    id: 'store_admin',
    label: 'Mağaza Yöneticisi',
    sublabel: 'Mağaza ve stok yönetimi',
    color: '#22c55e',
    shadow: '#16a34a',
    icon: Store,
    email: 'store@nexreward.com',
    badge: '🏪 MAĞAZA',
  },
  {
    id: 'cashier',
    label: 'Kasiyer',
    sublabel: 'QR tarama ve ödeme',
    color: '#f59e0b',
    shadow: '#d97706',
    icon: ScanLine,
    email: 'cashier@nexreward.com',
    badge: '💳 KASİYER',
  },
];

/* ─── Decorative shape ───────────────────────────────────────── */
const BgShape = ({ color }: { color: string }) => (
  <svg width="320" height="320" viewBox="0 0 56 56" fill="none"
    style={{ position: 'absolute', right: -80, top: -80, opacity: 0.07, pointerEvents: 'none', transition: 'all 0.4s' }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

/* ─── Main component ─────────────────────────────────────────── */
const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState<AdminRole>('super_admin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const role = ROLES.find(r => r.id === activeRole)!;
  const Icon = role.icon;

  const selectRole = (id: AdminRole) => {
    setActiveRole(id);
    setEmail('');
    setPassword('');
    setError('');
  };

  const fillDemo = () => {
    setEmail(role.email);
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
      return;
    }
    navigate(getDashboardPath(activeRole), { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-color)', transition: 'background 0.3s' }}
    >
      {/* Subtle dot grid via body CSS — add an additional top-layer tint */}
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${role.color}12 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.4s' }} />

      <div className="w-full max-w-md relative z-10">

        {/* ── Back link ── */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 mb-6 font-black text-sm transition-all hover:gap-3"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
        >
          <ArrowLeft size={16} /> Giriş sayfasına dön
        </button>

        {/* ── Header ── */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 68, height: 68, borderRadius: 20,
              background: role.color, border: '3px solid var(--dark-border)',
              boxShadow: `0 6px 0 var(--dark-border)`,
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            <Lock size={28} color="white" />
          </div>
          <h1
            className="font-black text-2xl uppercase tracking-tight"
            style={{ color: 'var(--text-dark)', letterSpacing: '-0.03em', margin: '0 0 4px' }}
          >
            Yönetici Girişi
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Devam etmek için rolünüzü seçin
          </p>
        </div>

        {/* ── Role selector ── */}
        <div className="card p-3 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROLES.map(r => {
            const RIcon = r.icon;
            const active = r.id === activeRole;
            return (
              <button
                key={r.id}
                onClick={() => selectRole(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                  border: `2.5px solid ${active ? r.color : 'transparent'}`,
                  background: active ? `${r.color}14` : 'var(--tab-bg)',
                  boxShadow: active ? `0 4px 0 ${r.shadow}` : `0 2px 0 var(--dark-border)`,
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = `${r.color}55`; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: active ? r.color : `${r.color}18`,
                  border: `2px solid ${active ? 'var(--dark-border)' : `${r.color}40`}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  <RIcon size={18} color={active ? 'white' : r.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, color: active ? r.color : 'var(--text-dark)', margin: 0, lineHeight: 1.2 }}>{r.label}</p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', margin: '2px 0 0' }}>{r.sublabel}</p>
                </div>
                {active && (
                  <div style={{
                    flexShrink: 0, background: r.color, color: 'white',
                    borderRadius: 8, padding: '2px 10px', fontSize: 10, fontWeight: 900,
                    border: '2px solid var(--dark-border)', boxShadow: '2px 2px 0 var(--dark-border)',
                    letterSpacing: '0.04em',
                  }}>
                    SEÇİLDİ
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Login form card ── */}
        <div
          className="card p-6 relative overflow-hidden"
          style={{ transition: 'box-shadow 0.3s' }}
        >
          <BgShape color={role.color} />

          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 20,
            background: `${role.color}18`, color: role.color,
            border: `2.5px solid ${role.color}`,
            borderRadius: 999, padding: '5px 14px',
            fontSize: 11, fontWeight: 900, letterSpacing: '0.06em',
            boxShadow: `3px 3px 0 ${role.shadow}`,
            transition: 'all 0.3s',
          }}>
            <Icon size={13} /> {role.badge}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                E-posta Adresi
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>
                  Şifre
                </label>
                <button
                  type="button"
                  onClick={() => navigate(`/forgot-password`)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 11, color: role.color, fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="input-field"
                  style={{ width: '100%', paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: role.color, color: 'white',
                border: '3px solid var(--dark-border)', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 15,
                boxShadow: `0 5px 0 var(--dark-border)`,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.65 : 1,
                transition: 'transform 0.1s, box-shadow 0.1s, background 0.3s',
              }}
              onMouseDown={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 var(--dark-border)'; } }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 5px 0 var(--dark-border)`; }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <><span>Giriş Yap</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* Demo fill */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '2px dashed var(--divider-dash)' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Demo Bilgileri (şifre: 123456)
            </p>
            <button
              onClick={fillDemo}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                background: `${role.color}10`, border: `2px solid ${role.color}`,
                boxShadow: `0 3px 0 ${role.shadow}`,
                fontFamily: 'inherit', transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 1px 0 ${role.shadow}`; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 3px 0 ${role.shadow}`; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="white" />
              </div>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 12, color: role.color, margin: 0 }}>{role.label} Demo</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.email}</p>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: role.color }}>Doldur →</div>
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20, fontWeight: 500 }}>
          Müşteri girişi için{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 900, fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}
          >
            buraya tıklayın
          </button>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;

