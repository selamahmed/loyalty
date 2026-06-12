import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* Strength checker */
type Strength = 0 | 1 | 2 | 3 | 4;

function getStrength(pw: string): Strength {
  let score = 0;
  if (pw.length >= 8)                    score++;
  if (/[A-Z]/.test(pw))                  score++;
  if (/[0-9]/.test(pw))                  score++;
  if (/[^A-Za-z0-9]/.test(pw))          score++;
  return Math.min(score, 4) as Strength;
}

const STRENGTH_LABELS = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#9122FF'];

type Phase = 'form' | 'success' | 'invalid';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';

  const [phase, setPhase]       = useState<Phase>(() => token ? 'form' : 'form');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const strength  = getStrength(password);
  const strLabel  = STRENGTH_LABELS[strength];
  const strColor  = STRENGTH_COLORS[strength];
  const match     = confirm.length > 0 && password === confirm;
  const mismatch  = confirm.length > 0 && password !== confirm;

  /* Auto-redirect after success */
  useEffect(() => {
    if (phase !== 'success') return;
    const t = setTimeout(() => navigate('/login', { replace: true }), 4000);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    const { error: supaErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (supaErr) { setError(supaErr.message); return; }
    setPhase('success');
  };

  /* ── Invalid token ──────────────────────────────────────────── */
  if (phase === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-color)' }}>
        <div className="w-full max-w-sm">
          <div className="card p-8 text-center">
            <div style={{
              width: 68, height: 68, borderRadius: 20, margin: '0 auto 20px',
              background: '#ef444418', border: '3px solid #ef4444',
              boxShadow: '0 6px 0 #b91c1c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <XCircle size={30} color="#ef4444" />
            </div>
            <h2 className="font-black text-xl" style={{ color: 'var(--text-dark)', letterSpacing: '-0.02em', marginBottom: 10, textTransform: 'uppercase' }}>
              Geçersiz Bağlantı
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Bu şifre sıfırlama bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı talep edin.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#9122FF', color: 'white',
                border: '3px solid #000', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 14,
                boxShadow: '0 5px 0 #000', cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              Yeni Bağlantı İste <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success state ──────────────────────────────────────────── */
  if (phase === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-color)' }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #9122FF14 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="w-full max-w-sm relative z-10">
          <div className="card p-8 text-center">
            <div style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 20px',
              background: '#C8FF0020', border: '3px solid #000',
              boxShadow: '0 6px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <CheckCircle size={34} color="#22c55e" strokeWidth={2.5} />
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#22c55e18', color: '#22c55e',
              border: '2.5px solid #22c55e', borderRadius: 999,
              padding: '4px 14px', fontSize: 11, fontWeight: 900,
              letterSpacing: '0.06em', boxShadow: '3px 3px 0 #16a34a',
              marginBottom: 18,
            }}>
              ✅ BAŞARILI
            </div>

            <h2 className="font-black text-2xl" style={{ color: 'var(--text-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: 12 }}>
              Şifren Güncellendi!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Yeni şifrenizle artık giriş yapabilirsiniz. 4 saniye içinde yönlendirileceksiniz…
            </p>

            <button
              onClick={() => navigate('/login', { replace: true })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#9122FF', color: 'white',
                border: '3px solid #000', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 14,
                boxShadow: '0 5px 0 #000', cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              Giriş Sayfasına Git <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }`}</style>
      </div>
    );
  }

  /* ── Form state ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-color)' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #9122FF14 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Back */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Girişe dön
        </button>

        <div className="card p-8">
          {/* Icon */}
          <div style={{
            width: 68, height: 68, borderRadius: 20, margin: '0 auto 20px',
            background: '#9122FF', border: '3px solid #000',
            boxShadow: '0 6px 0 #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={28} color="white" />
          </div>

          <h1 className="font-black text-2xl text-center" style={{ color: 'var(--text-dark)', letterSpacing: '-0.03em', marginBottom: 6, textTransform: 'uppercase' }}>
            Yeni Şifre
          </h1>
          {email && (
            <p className="text-center text-xs font-medium" style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              {email} için yeni şifre belirleyin
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* New password */}
            <div>
              <label style={{ display: 'block', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                Yeni Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                  className="input-field"
                  style={{ width: '100%', paddingRight: 48 }}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} style={{
                        flex: 1, height: 5, borderRadius: 99,
                        background: n <= strength ? strColor : 'var(--tab-bg)',
                        border: '1.5px solid var(--dark-border)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 900, color: strColor, letterSpacing: '0.06em' }}>
                    {strLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                Şifre Tekrar
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCf ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  disabled={loading}
                  className="input-field"
                  style={{
                    width: '100%', paddingRight: 48,
                    borderColor: mismatch ? '#ef4444' : match ? '#22c55e' : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowCf(!showCf)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {match && (
                  <CheckCircle size={16} color="#22c55e" style={{ position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                )}
              </div>
              {mismatch && (
                <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginTop: 5 }}>Şifreler eşleşmiyor</p>
              )}
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || mismatch}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#9122FF', color: 'white',
                border: '3px solid #000', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 15,
                boxShadow: '0 5px 0 #000',
                cursor: loading || mismatch ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                opacity: loading || mismatch ? 0.6 : 1,
                transition: 'transform 0.1s, box-shadow 0.1s, opacity 0.2s',
              }}
              onMouseDown={e => { if (!loading && !mismatch) { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; } }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <><Lock size={16} /> Şifremi Güncelle</>
              }
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin   { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes popIn  { from { transform:scale(0.5); opacity:0 } to { transform:scale(1); opacity:1 } }
      `}</style>
    </div>
  );
};

export default ResetPassword;
