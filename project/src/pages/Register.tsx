import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../lib/activityLogger';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const STRENGTH_LABELS  = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'];
const STRENGTH_COLORS  = ['', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, register } = useAuth();
  const [form, setForm]     = useState({ username: '', email: '', password: '', confirm: '', terms: false });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username.trim()) e.username = 'Kullanıcı adı zorunludur';
    if (!form.email.trim())    e.email    = 'E-posta zorunludur';
    if (form.password.length < 6) e.password = 'En az 6 karakter';
    if (form.password !== form.confirm) e.confirm = 'Şifreler eşleşmiyor';
    if (!form.terms) e.terms = 'Şartları kabul etmelisiniz';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await register(form.email, form.password, form.username);
    setLoading(false);
    if (!result.success) { setErrors({ submit: result.error ?? 'Kayıt başarısız.' }); return; }
    activityLogService.logActivity({
      username: form.username, email: form.email, role: 'customer',
      action: 'Yeni kullanıcı kaydı', actionType: 'login',
      details: { method: 'email' },
    });
    setSuccessMsg('Hesabınız oluşturuldu! Lütfen e-postanızı doğrulayın.');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await loginWithGoogle();
    setGoogleLoading(false);
    navigate('/app', { replace: true });
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)          s++;
    if (p.length >= 10)         s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="brand-mark">
            <img src="/assets/icons/logo.png" alt="NexReward" className="w-10 h-10 object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <span className="brand-fallback font-display">N</span>
          </div>
          <h1 className="mt-4 font-display text-2xl" style={{ color: 'var(--text)' }}>NexReward</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Hesap Oluştur</p>
        </div>

        {/* Auth card */}
        <div className="auth-card">

          {/* Tab */}
          <div className="tab-row">
            <div className="tab-pill">
              <div className="tab-active-bg tab-indicator" style={{ left: 'calc(50% + 0px)' }} />
              <button className="tab-btn" onClick={() => navigate('/login')}>Giriş Yap</button>
              <button className="tab-btn tab-btn--active">Kayıt Ol</button>
            </div>
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogle} disabled={googleLoading || loading} className="google-btn">
            {googleLoading ? <div className="spinner" /> : <GoogleIcon />}
            Google ile Kayıt Ol
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">veya</span>
            <span className="auth-divider-line" />
          </div>

          {/* Form */}
          {successMsg ? (
            <div className="success-box">
              <Check size={20} color="#16a34a" />
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#16a34a', lineHeight: 1.4 }}>{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field-group">
                <label className="field-label">Kullanıcı Adı</label>
                <input type="text" placeholder="harikabirkadi" value={form.username}
                  onChange={e => set('username')(e.target.value)} className="input-field" autoComplete="username" />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">E-posta</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email')(e.target.value)} className="input-field" autoComplete="email" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Şifre</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={e => set('password')(e.target.value)} className="input-field"
                    style={{ paddingRight: 44 }} autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 999,
                          background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--border-subtle)',
                          transition: 'background 0.2s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, marginTop: 4, fontWeight: 700, color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </p>
                  </div>
                )}
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Şifreyi Onayla</label>
                <input type="password" placeholder="••••••••" value={form.confirm}
                  onChange={e => set('confirm')(e.target.value)} className="input-field" autoComplete="new-password" />
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>

              {/* Terms checkbox */}
              <label className="terms-row">
                <button type="button"
                  onClick={() => set('terms')(!form.terms)}
                  className="checkbox"
                  style={{ background: form.terms ? 'linear-gradient(160deg,var(--brand-light),var(--brand))' : 'var(--surface-raised)' }}
                >
                  {form.terms && <Check size={11} color="white" strokeWidth={3} />}
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <button type="button" className="terms-link">Kullanım Şartları</button>
                  {' '}ve{' '}
                  <button type="button" className="terms-link">Gizlilik Politikası</button>
                  {' '}kabul ediyorum
                </span>
              </label>
              {errors.terms && <span className="field-error">{errors.terms}</span>}

              {errors.submit && (
                <div className="error-box" role="alert">
                  <span>⚠</span> {errors.submit}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full" style={{ marginTop: 4 }}>
                {loading
                  ? <div className="spinner spinner--white" />
                  : <><span>Hesap Oluştur</span><ArrowRight size={16} /></>
                }
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
          Zaten hesabın var mı?{' '}
          <button onClick={() => navigate('/login')} style={{ color: 'var(--brand)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Giriş Yap
          </button>
        </p>
      </div>

      <style>{`
        .brand-mark {
          width:64px;height:64px;border-radius:var(--r-lg);
          background:linear-gradient(145deg,var(--brand-light),var(--brand));
          border:2px solid var(--border);box-shadow:var(--shadow-md);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .brand-fallback{display:none;color:white;font-size:28px;font-weight:900;}

        .auth-card{
          background:var(--surface);border:2px solid var(--border);
          border-radius:var(--r-xl);box-shadow:var(--shadow-lg);
          padding:28px 24px;display:flex;flex-direction:column;gap:18px;
        }

        .tab-row{display:flex;}
        .tab-pill{
          position:relative;display:flex;width:100%;
          background:var(--surface-raised);border:2px solid var(--border);
          border-radius:var(--r-md);padding:4px;
        }
        .tab-active-bg{
          position:absolute;top:4px;bottom:4px;
          width:calc(50% - 4px);
          background:var(--surface);border:1.5px solid var(--border);
          box-shadow:var(--shadow-xs);
          border-radius:calc(var(--r-md) - 4px);
        }
        .tab-btn{
          position:relative;z-index:1;flex:1;padding:9px 0;
          background:none;border:none;cursor:pointer;
          font-weight:700;font-size:13px;color:var(--text-secondary);
          border-radius:calc(var(--r-md)-4px);font-family:inherit;
          transition:color 0.15s;
        }
        .tab-btn--active{color:var(--text);font-weight:900;}

        .google-btn{
          width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
          padding:11px 16px;background:var(--surface);
          border:2px solid var(--border);border-radius:var(--r-md);
          box-shadow:var(--shadow-sm);font-weight:700;font-size:14px;
          color:var(--text);cursor:pointer;font-family:inherit;
          transition:background-color 0.15s,transform 0.1s,box-shadow 0.1s;
        }
        .google-btn:hover:not(:disabled){background:var(--surface-raised);}
        .google-btn:active:not(:disabled){transform:translateY(2px);box-shadow:var(--shadow-xs);}
        .google-btn:disabled{opacity:0.55;cursor:not-allowed;}

        .auth-divider{display:flex;align-items:center;gap:10px;}
        .auth-divider-line{flex:1;height:1.5px;background:var(--border-subtle);}
        .auth-divider-text{font-size:12px;font-weight:600;color:var(--text-secondary);}

        .auth-form{display:flex;flex-direction:column;gap:14px;}
        .field-group{display:flex;flex-direction:column;gap:6px;}
        .field-label{font-size:13px;font-weight:700;color:var(--text);}
        .field-error{font-size:11px;color:var(--red);font-weight:600;margin-top:2px;}

        .eye-btn{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:var(--text-secondary);display:flex;align-items:center;padding:4px;
        }

        .error-box{
          padding:10px 14px;background:rgba(220,38,38,0.06);
          border:1.5px solid var(--red);border-radius:var(--r-sm);
          color:var(--red);font-size:13px;font-weight:600;
          display:flex;align-items:flex-start;gap:8px;line-height:1.4;
        }
        .success-box{
          padding:20px;background:rgba(22,163,74,0.07);
          border:1.5px solid #16a34a;border-radius:var(--r-lg);
          display:flex;align-items:flex-start;gap:12px;
        }

        .spinner{
          width:18px;height:18px;border-radius:50%;
          border:2.5px solid var(--border-subtle);border-top-color:var(--brand);
          animation:spin-slow 0.7s linear infinite;flex-shrink:0;
        }
        .spinner--white{border-color:rgba(255,255,255,0.3);border-top-color:white;}

        .terms-row{display:flex;align-items:flex-start;gap:10px;cursor:pointer;}
        .checkbox{
          width:20px;height:20px;flex-shrink:0;margin-top:1px;
          border:2px solid var(--border);border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:background 0.15s;
        }
        .terms-link{
          color:var(--brand);font-weight:700;background:none;
          border:none;cursor:pointer;font-family:inherit;font-size:inherit;
          padding:0;
        }
        .terms-link:hover{text-decoration:underline;}
      `}</style>
    </div>
  );
};

export default Register;
