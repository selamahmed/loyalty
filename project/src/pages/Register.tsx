import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, ChevronDown, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../lib/activityLogger';
import AuthPageShell from '../components/AuthPageShell';
import AppLogo from '../components/AppLogo';
import StickerAccent from '../components/StickerAccent';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, register, dashboardPath, isAuthenticated, isLoading } = useAuth();
  const [form, setForm]     = useState({ username: '', email: '', password: '', confirm: '', terms: false });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [consentExpanded, setConsentExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(dashboardPath, { replace: true });
    }
  }, [dashboardPath, isAuthenticated, isLoading, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = 'Kullanıcı adı zorunludur';
    if (!form.email) e.email = 'E-posta zorunludur';
    if (form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalıdır';
    if (form.password !== form.confirm) e.confirm = 'Şifreler eşleşmiyor';
    if (!form.terms) e.terms = 'Şartları kabul etmelisiniz';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    const result = await register(form.email, form.password, form.username);
    setLoading(false);
    if (!result.success) {
      setErrors({ submit: result.error ?? 'Kayıt başarısız.' });
      return;
    }
    activityLogService.logActivity({
      username: form.username, email: form.email, role: 'customer',
      action: 'Yeni kullanıcı kaydı', actionType: 'login',
      details: { method: 'email' },
    });
    setSuccessMsg(result.signedIn ? 'Hesabınız oluşturuldu! Giriş yapılıyor...' : 'Hesabınız oluşturuldu! Lütfen e-postanızı doğrulayın.');
  };

  const handleGoogle = async () => {
    if (!form.terms) {
      setErrors({ terms: 'Kayıt olmak için şartları kabul etmelisiniz' });
      return;
    }
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setGoogleLoading(false);
      setErrors({ submit: result.error ?? 'Google ile kayıt başarısız. Tekrar deneyin.' });
    }
  };

  const openLegal = (path: '/terms' | '/privacy') => {
    navigate(path);
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabel  = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'][strength];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

  return (
    <AuthPageShell>
        <div className="card auth-card auth-card--register p-7 sm:p-8 space-y-5" style={{ position: 'relative', overflow: 'visible' }}>
          <StickerAccent seed="register-card-accent" variant="shape" size={36} rotate={10} style={{ position: 'absolute', top: -10, right: -6, zIndex: 2 }} />

          {/* Logo */}
          <div className="auth-brand flex flex-col items-center gap-3">
            <AppLogo
              size={72}
              className="auth-brand__logo"
              priority
            />
            <div className="text-center">
              <h1 className="auth-brand__title font-black text-xl" style={{ color: 'var(--text-dark)' }}>NEŞVENEXT</h1>
              <p className="auth-brand__subtitle text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sadakat Platformu</p>
            </div>
          </div>

          {/* Tab toggle */}
          <div
            className="auth-tabs relative flex rounded-button p-1"
            style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)' }}
          >
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl tab-indicator"
              style={{
                left: 'calc(50% + 4px)',
                background: 'var(--card-bg)',
                border: '2px solid var(--dark-border)',
                boxShadow: '0px 2px 0px var(--dark-border)',
              }}
            />
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Giriş Yap
            </button>
            <button className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm" style={{ color: 'var(--text-dark)' }}>
              Kayıt Ol
            </button>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="auth-google w-full flex items-center justify-center gap-3 py-3 rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', color: 'var(--text-dark)' }}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google ile Kayıt Ol
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 divider-dashed" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>veya</span>
            <div className="flex-1 divider-dashed" />
          </div>

          <form onSubmit={handleSubmit} className="auth-form space-y-4">
            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Kullanıcı Adı</label>
              <input
                type="text"
                placeholder="HarikaBirKullanici"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="input-field auth-input"
                autoComplete="username"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">E-posta Adresi</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="input-field auth-input"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field auth-input pr-12"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye-button absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ background: i <= strength ? strengthColors[strength] : 'var(--tab-bg)' }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strengthColors[strength] || 'var(--text-muted)' }}>{strengthLabel}</p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Şifreyi Onayla</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm({...form, confirm: e.target.value})}
                className="input-field auth-input"
                autoComplete="new-password"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <section className={`auth-consent-card${consentExpanded ? ' auth-consent-card--expanded' : ''}${errors.terms ? ' auth-consent-card--error' : ''}`} aria-labelledby="consent-title">
              <button
                type="button"
                className="auth-consent-card__header"
                onClick={() => setConsentExpanded(current => !current)}
                aria-expanded={consentExpanded}
                aria-controls="consent-documents"
              >
                <span className="auth-consent-card__icon" aria-hidden><ShieldCheck size={19} /></span>
                <span className="auth-consent-card__heading">
                  <strong id="consent-title">Gizlilik ve sözleşmeler</strong>
                  <small>{consentExpanded ? 'Belgeleri aşağıdan inceleyebilirsiniz.' : 'Belgeleri görüntülemek için dokunun.'}</small>
                </span>
                <span className="auth-consent-card__header-end">
                  <span className="auth-consent-card__required">Zorunlu</span>
                  <ChevronDown className="auth-consent-card__chevron" size={17} aria-hidden />
                </span>
              </button>

              <div id="consent-documents" className="auth-consent-documents" hidden={!consentExpanded}>
                <button type="button" onClick={() => openLegal('/privacy')} className="auth-consent-document">
                  <span className="auth-consent-document__icon" aria-hidden><ShieldCheck size={17} /></span>
                  <span className="auth-consent-document__copy">
                    <strong>Gizlilik Politikası ve KVKK</strong>
                    <small>Verilerinizin nasıl işlendiğini öğrenin</small>
                  </span>
                  <ChevronRight size={17} aria-hidden />
                </button>
                <button type="button" onClick={() => openLegal('/terms')} className="auth-consent-document">
                  <span className="auth-consent-document__icon" aria-hidden><FileText size={17} /></span>
                  <span className="auth-consent-document__copy">
                    <strong>Kullanım Şartları</strong>
                    <small>Hizmet ve platform kurallarını inceleyin</small>
                  </span>
                  <ChevronRight size={17} aria-hidden />
                </button>
              </div>

              <button
                type="button"
                role="checkbox"
                aria-checked={form.terms}
                onClick={() => {
                  setForm({ ...form, terms: !form.terms });
                  if (errors.terms) setErrors(current => ({ ...current, terms: '' }));
                }}
                className="auth-consent-check"
              >
                <span className={`auth-checkbox${form.terms ? ' auth-checkbox--checked' : ''}`} aria-hidden>
                  {form.terms && <Check size={14} strokeWidth={3.5} />}
                </span>
                <span>
                  <strong>Kabul ediyorum</strong>
                  <small>Kullanım Şartları’nı kabul ediyor; Gizlilik Politikası ve KVKK Aydınlatma Metni’ni okuduğumu onaylıyorum.</small>
                </span>
              </button>
              {errors.terms && <p className="auth-consent-error" role="alert">{errors.terms}</p>}
            </section>

            {errors.submit && <p className="auth-error text-red-500 text-xs p-2 rounded" style={{ background: '#ef444422', border: '1px solid #ef4444' }}>{errors.submit}</p>}

            {successMsg ? (
              <div className="auth-success p-3 rounded-button text-sm font-600 text-center" style={{ background: '#22c55e22', border: '2px solid #22c55e', color: '#22c55e' }}>
                {successMsg}
              </div>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="auth-submit btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Hesap Oluştur →'}
              </button>
            )}
          </form>

          <p style={{ color: 'var(--text-muted)' }} className="auth-switch-copy text-center text-sm">
            Zaten hesabın var mı?{' '}
            <button onClick={() => navigate('/login')} style={{ color: 'var(--primary-blue)' }} className="font-black hover:underline">Giriş Yap</button>
          </p>
        </div>
    </AuthPageShell>
  );
};

export default Register;

