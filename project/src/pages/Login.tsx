import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, dashboardPath, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const oauthErr = sessionStorage.getItem('oauth_error');
    if (oauthErr) {
      sessionStorage.removeItem('oauth_error');
      setError(`Google girişi başarısız: ${oauthErr}`);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(dashboardPath, { replace: true });
  }, [isAuthenticated, isLoading, dashboardPath, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Giriş başarısız.');
      activityLogService.logActivity({
        username: email.split('@')[0], email, role: 'customer',
        action: 'Başarısız giriş denemesi', actionType: 'login',
        details: { reason: result.error }, riskLevel: 'medium',
      });
      return;
    }
    activityLogService.logActivity({
      username: email.split('@')[0], email, role: 'customer',
      action: 'Kullanıcı giriş yaptı', actionType: 'login',
      details: { method: 'email' },
    });
    navigate(dashboardPath, { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setGoogleLoading(false);
      setError('Google ile giriş başarısız. Tekrar deneyin.');
    }
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* ── Brand mark ── */}
        <div className="flex flex-col items-center mb-8">
          <div className="brand-mark">
            <img
              src="/assets/icons/logo.png"
              alt="NexReward"
              className="w-10 h-10 object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="brand-fallback font-display">N</span>
          </div>
          <h1 className="mt-4 font-display text-2xl" style={{ color: 'var(--text)' }}>NexReward</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Sadakat & Ödül Platformu
          </p>
        </div>

        {/* ── Auth card ── */}
        <div className="auth-card">

          {/* Tab switcher */}
          <div className="tab-row">
            <div className="tab-pill">
              <div className="tab-active-bg tab-indicator" />
              <button className="tab-btn tab-btn--active">Giriş Yap</button>
              <button className="tab-btn" onClick={() => navigate('/register')}>Kayıt Ol</button>
            </div>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="google-btn"
          >
            {googleLoading
              ? <div className="spinner" />
              : <GoogleIcon />
            }
            Google ile Giriş Yap
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">veya</span>
            <span className="auth-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label className="field-label">E-posta</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label">Şifre</label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => navigate('/forgot-password')}
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
                  className="input-field"
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-box" role="alert">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={{ marginTop: 4 }}
            >
              {loading
                ? <div className="spinner spinner--white" />
                : <><span>Giriş Yap</span> <ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        {/* ── Admin link ── */}
        <button
          onClick={() => navigate('/admin-login')}
          className="admin-link-btn"
        >
          <Shield size={13} />
          Yönetici / Kasiyer Girişi
        </button>

      </div>

      {/* ════ Scoped styles ════ */}
      <style>{`
        /* Brand mark */
        .brand-mark {
          width: 64px; height: 64px;
          border-radius: var(--r-lg);
          background: linear-gradient(145deg, var(--brand-light), var(--brand));
          border: 2px solid var(--border);
          box-shadow: var(--shadow-md);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .brand-fallback {
          display: none; color: white; font-size: 28px; font-weight: 900;
        }
        img[style*="display: none"] + .brand-fallback { display: block; }

        /* Auth card */
        .auth-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--r-xl);
          box-shadow: var(--shadow-lg);
          padding: 28px 24px;
          display: flex; flex-direction: column; gap: 18px;
        }

        /* Tab row */
        .tab-row { display: flex; justify-content: center; }
        .tab-pill {
          position: relative;
          display: flex;
          background: var(--surface-raised);
          border: 2px solid var(--border);
          border-radius: var(--r-md);
          padding: 4px;
          gap: 0;
          width: 100%;
        }
        .tab-active-bg {
          position: absolute; top: 4px; bottom: 4px;
          width: calc(50% - 4px); left: 4px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          box-shadow: var(--shadow-xs);
          border-radius: calc(var(--r-md) - 4px);
        }
        .tab-btn {
          position: relative; z-index: 1;
          flex: 1; padding: 9px 0;
          background: none; border: none; cursor: pointer;
          font-weight: 700; font-size: 13px;
          color: var(--text-secondary);
          border-radius: calc(var(--r-md) - 4px);
          transition: color 0.15s;
          font-family: inherit;
        }
        .tab-btn--active { color: var(--text); font-weight: 900; }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px 16px;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--r-md);
          box-shadow: var(--shadow-sm);
          font-weight: 700; font-size: 14px;
          color: var(--text);
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s, box-shadow 0.1s;
          font-family: inherit;
        }
        .google-btn:hover:not(:disabled)  { background: var(--surface-raised); }
        .google-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: var(--shadow-xs); }
        .google-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 10px;
        }
        .auth-divider-line {
          flex: 1; height: 1.5px; background: var(--border-subtle);
        }
        .auth-divider-text {
          font-size: 12px; font-weight: 600; color: var(--text-secondary);
        }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 14px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 13px; font-weight: 700; color: var(--text);
        }
        .field-label-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .forgot-link {
          font-size: 12px; font-weight: 700; color: var(--brand);
          background: none; border: none; cursor: pointer; padding: 0;
          font-family: inherit;
        }
        .forgot-link:hover { text-decoration: underline; }

        /* Eye toggle */
        .eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); display: flex; align-items: center;
          padding: 4px;
        }

        /* Error */
        .error-box {
          padding: 10px 14px;
          background: rgba(220,38,38,0.06);
          border: 1.5px solid var(--red);
          border-radius: var(--r-sm);
          color: var(--red);
          font-size: 13px; font-weight: 600;
          display: flex; align-items: flex-start; gap: 8px;
          line-height: 1.4;
        }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2.5px solid var(--border-subtle);
          border-top-color: var(--brand);
          animation: spin-slow 0.7s linear infinite;
          flex-shrink: 0;
        }
        .spinner--white {
          border-color: rgba(255,255,255,0.3);
          border-top-color: white;
        }

        /* Admin link */
        .admin-link-btn {
          width: 100%; margin-top: 12px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 16px;
          background: none;
          border: 1.5px dashed var(--border-subtle);
          border-radius: var(--r-md);
          font-size: 12px; font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .admin-link-btn:hover {
          color: var(--brand);
          border-color: var(--brand);
          background: rgba(123,63,245,0.05);
        }
      `}</style>
    </div>
  );
};

export default Login;
