import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoggedIn(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
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
          </div>

          {/* Tab toggle */}
          <div
            className="relative flex rounded-button p-1"
            style={{
              background: 'var(--tab-bg)',
              border: '2.5px solid var(--dark-border)',
            }}
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
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm transition-colors"
              style={{ color: tab === 'signup' ? 'var(--text-dark)' : 'var(--text-muted)' }}
            >
              Sign Up
            </button>
          </div>

          {/* Google button */}
          <button className="btn-secondary w-full flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 divider-dashed" />
            <span style={{ color: 'var(--text-muted)' }} className="text-sm">or</span>
            <div className="flex-1 divider-dashed" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Password</label>
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{ color: 'var(--text-muted)' }}
                className="text-sm font-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div
                className="p-3 rounded-button border-2.5 text-sm font-600"
                style={{
                  background: 'var(--tab-bg)',
                  borderColor: '#ef4444',
                  color: '#ef4444',
                }}
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
                'Welcome Back →'
              )}
            </button>
          </form>

          <p style={{ color: 'var(--text-muted)' }} className="text-center text-sm">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} style={{ color: 'var(--primary-blue)' }} className="font-black hover:underline">
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
