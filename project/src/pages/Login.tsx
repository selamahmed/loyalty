import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../lib/activityLogger';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, dashboardPath, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState('');

  // Pick up OAuth error message stored by OAuthErrorInterceptor
  useEffect(() => {
    const oauthErr = sessionStorage.getItem('oauth_error');
    if (oauthErr) {
      sessionStorage.removeItem('oauth_error');
      setError(`Google girişi başarısız: ${oauthErr}`);
    }
  }, []);

  // If already authenticated (e.g. page refresh), redirect immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(dashboardPath, { replace: true });
    }
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
    // If error, show it. On success the browser navigates away to Google.
    if (!result.success) {
      setGoogleLoading(false);
      setError('Google ile giriş başarısız. Tekrar deneyin.');
    }
    // Don't reset loading — the page will be replaced by Google's OAuth screen.
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="card p-8 space-y-6">

          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img
              src="/assets/icons/logo.png"
              alt="NexReward"
              className="w-16 h-16 object-contain rounded-2xl"
              style={{ border: '3px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)' }}
              onError={e => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute('style');
              }}
            />
            <div
              className="w-16 h-16 rounded-2xl items-center justify-center font-black text-2xl"
              style={{ display: 'none', background: 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0px 6px 0px var(--dark-border)' }}
            >
              N
            </div>
            <div className="text-center">
              <h1 className="font-black text-xl" style={{ color: 'var(--text-dark)' }}>NexReward</h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sadakat Platformu</p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="relative flex rounded-button p-1" style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)' }}>
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl tab-indicator"
              style={{ left: '4px', background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)' }}
            />
            <button onClick={() => {}} className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm" style={{ color: 'var(--text-dark)' }}>
              Giriş Yap
            </button>
            <button onClick={() => navigate('/register')} className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm" style={{ color: 'var(--text-muted)' }}>
              Kayıt Ol
            </button>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', color: 'var(--text-dark)' }}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google ile Giriş Yap
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 divider-dashed" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>veya</span>
            <div className="flex-1 divider-dashed" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">E-posta Adresi</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ color: 'var(--text-dark)' }} className="font-black text-sm">Şifre</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-black hover:underline"
                  style={{ color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-button text-sm font-600" style={{ background: 'var(--tab-bg)', border: '2px solid #ef4444', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Giriş Yap →'}
            </button>
          </form>
        </div>

        {/* Admin login link */}
        <div className="card p-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-sm" style={{ color: 'var(--text-dark)', margin: 0 }}>Yönetici veya Kasiyer misiniz?</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', margin: '2px 0 0' }}>Ayrı bir giriş sayfası mevcuttur.</p>
          </div>
          <button
            onClick={() => navigate('/admin-login')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
              background: '#9122FF18', color: '#9122FF',
              border: '2.5px solid #9122FF', fontWeight: 900, fontSize: 12,
              boxShadow: '0 3px 0 #6b19c0', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 #6b19c0'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 #6b19c0'; }}
          >
            🔐 Admin Giriş
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;

