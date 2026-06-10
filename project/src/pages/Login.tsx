import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Müşteri',          email: 'customer@nexreward.com', role: 'customer',    color: '#7B6EF6' },
  { label: 'Süper Admin',      email: 'admin@nexreward.com',    role: 'super_admin', color: '#ef4444' },
  { label: 'Mağaza Yöneticisi',email: 'store@nexreward.com',   role: 'store_admin', color: '#22c55e' },
  { label: 'Kasiyer',          email: 'cashier@nexreward.com', role: 'cashier',     color: '#f59e0b' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, dashboardPath } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Giriş başarısız.');
      return;
    }
    navigate(dashboardPath, { replace: true });
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="card p-8 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-button flex items-center justify-center font-black text-2xl"
              style={{
                background: 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                color: 'white',
                border: '3px solid var(--dark-border)',
                boxShadow: '0px 6px 0px var(--dark-border)',
              }}
            >
              N
            </div>
            <div className="text-center">
              <h1 className="font-black text-xl" style={{ color: 'var(--text-dark)' }}>NexReward</h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Sadakat Platformu</p>
            </div>
          </div>

          {/* Tab toggle */}
          <div
            className="relative flex rounded-button p-1"
            style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)' }}
          >
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl tab-indicator"
              style={{
                left: tab === 'login' ? '4px' : 'calc(50% + 4px)',
                background: 'var(--card-bg)',
                border: '2px solid var(--dark-border)',
                boxShadow: '0px 2px 0px var(--dark-border)',
              }}
            />
            <button
              onClick={() => setTab('login')}
              className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm transition-colors"
              style={{ color: tab === 'login' ? 'var(--text-dark)' : 'var(--text-muted)' }}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => navigate('/register')}
              className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm transition-colors"
              style={{ color: tab === 'signup' ? 'var(--text-dark)' : 'var(--text-muted)' }}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">E-posta Adresi</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="p-3 rounded-button text-sm font-600"
                style={{ background: 'var(--tab-bg)', border: '2px solid #ef4444', color: '#ef4444' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2.5 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Giriş Yap →'
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="card p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: 'var(--text-muted)' }}>
            Demo Hesaplar (şifre: 123456)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc.email)}
                className="px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `${acc.color}14`,
                  border: `2px solid ${acc.color}`,
                  boxShadow: `0px 2px 0px ${acc.color}`,
                }}
              >
                <p className="font-black text-xs" style={{ color: acc.color }}>{acc.label}</p>
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>{acc.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
