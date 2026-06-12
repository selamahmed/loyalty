import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';

/* Mock accounts that have registered emails */
const MOCK_EMAILS = [
  'customer@nexreward.com',
  'admin@nexreward.com',
  'store@nexreward.com',
  'cashier@nexreward.com',
];

type Phase = 'form' | 'sent';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase]       = useState<Phase>('form');
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [resending, setResend]  = useState(false);
  const [resent, setResent]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Lütfen e-posta adresinizi girin.'); return; }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) { setError('Geçerli bir e-posta adresi girin.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setPhase('sent');
  };

  const handleResend = async () => {
    setResend(true);
    await new Promise(r => setTimeout(r, 1000));
    setResend(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.+)(@.+)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
    : '';

  /* ── Sent state ─────────────────────────────────────────────── */
  if (phase === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg-color)' }}>
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #9122FF14 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="w-full max-w-sm relative z-10">
          <div className="card p-8" style={{ textAlign: 'center' }}>
            {/* Success icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 22, margin: '0 auto 20px',
              background: '#C8FF0020', border: '3px solid #000',
              boxShadow: '0 6px 0 #000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              ✉️ E-POSTA GÖNDERİLDİ
            </div>

            <h2 className="font-black text-xl" style={{ color: 'var(--text-dark)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Gelen kutunuzu kontrol edin
            </h2>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 6 }}>
              Şifre sıfırlama bağlantısı
            </p>
            <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-dark)', marginBottom: 20 }}>
              {maskedEmail}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              adresine gönderildi. Bağlantı <strong style={{ color: 'var(--text-dark)' }}>15 dakika</strong> geçerlidir.
            </p>

            {/* Simulate opening reset link */}
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=demo`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#9122FF', color: 'white',
                border: '3px solid #000', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 14,
                boxShadow: '0 5px 0 #000', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'transform 0.1s, box-shadow 0.1s', marginBottom: 12,
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              Şifreyi Sıfırla <ArrowRight size={16} />
            </button>

            <div style={{ paddingTop: 18, borderTop: '2px dashed var(--divider-dash)', marginTop: 4 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                E-posta gelmediyse spam klasörünü kontrol edin veya
              </p>
              <button
                onClick={handleResend}
                disabled={resending || resent}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: resent ? 'default' : 'pointer',
                  fontWeight: 900, fontSize: 13, fontFamily: 'inherit',
                  color: resent ? '#22c55e' : '#9122FF', padding: 0,
                }}
              >
                {resending
                  ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Gönderiliyor…</>
                  : resent
                    ? <>✓ Tekrar gönderildi!</>
                    : <>tekrar gönderin →</>
                }
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, margin: '16px auto 0',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', padding: 0,
            }}
          >
            <ArrowLeft size={14} /> Girişe dön
          </button>
        </div>

        <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  /* ── Form state ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-color)' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #9122FF14 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="w-full max-w-sm relative z-10">

        {/* Back */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'inherit', padding: 0,
            transition: 'gap 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '10px'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '6px'; }}
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
            <Mail size={28} color="white" />
          </div>

          <h1 className="font-black text-2xl text-center" style={{ color: 'var(--text-dark)', letterSpacing: '-0.03em', marginBottom: 8, textTransform: 'uppercase' }}>
            Şifremi Unuttum
          </h1>
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', marginBottom: 8 }}>
                E-posta Adresi
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                className="input-field"
                style={{ width: '100%' }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#9122FF', color: 'white',
                border: '3px solid #000', borderRadius: 16,
                padding: '13px 24px', fontWeight: 900, fontSize: 15,
                boxShadow: '0 5px 0 #000',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                opacity: loading ? 0.65 : 1,
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #000'; } }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <><Mail size={16} /> Bağlantı Gönder</>
              }
            </button>
          </form>

          {/* Demo hint */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '2px dashed var(--divider-dash)' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Demo E-postalar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MOCK_EMAILS.map(em => (
                <button
                  key={em}
                  onClick={() => { setEmail(em); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    background: email === em ? '#9122FF14' : 'var(--tab-bg)',
                    border: `2px solid ${email === em ? '#9122FF' : 'var(--dark-border)'}`,
                    fontFamily: 'inherit', transition: 'all 0.12s',
                    color: email === em ? '#9122FF' : 'var(--text-muted)',
                    fontWeight: email === em ? 900 : 600, fontSize: 12,
                    boxShadow: email === em ? '0 2px 0 #6b19c0' : '0 2px 0 var(--dark-border)',
                  }}
                >
                  <Mail size={12} /> {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
};

export default ForgotPassword;
