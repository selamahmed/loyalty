import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../lib/tr';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useApp();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', terms: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username) e.username = 'Username is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.terms) e.terms = 'You must accept the terms';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoggedIn(true);
    navigate('/');
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
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

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
            className="relative flex rounded-button border-2.5 p-1"
            style={{
              background: 'var(--tab-bg)',
              borderColor: 'var(--dark-border)',
              borderWidth: '2.5px',
            }}
          >
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl border-2.5 tab-indicator"
              style={{
                left: 'calc(50% + 4px)',
                background: 'white',
                borderColor: 'var(--dark-border)',
                boxShadow: '0px 2px 0px var(--dark-border)',
              }}
            />
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Log In
            </button>
            <button className="relative z-10 flex-1 py-2.5 rounded-button font-black text-sm" style={{ color: 'var(--text-dark)' }}>
              Sign Up
            </button>
          </div>

          {/* Google */}
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
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Username</label>
              <input
                type="text"
                placeholder="CoolPlayer123"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="input-field"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="input-field"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
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
              <label style={{ color: 'var(--text-dark)' }} className="block font-black text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm({...form, confirm: e.target.value})}
                className="input-field"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm({...form, terms: !form.terms})}
                className="w-5 h-5 mt-0.5 rounded-button border-2.5 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: 'var(--dark-border)',
                  background: form.terms ? 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)' : 'var(--input-bg)',
                  boxShadow: '0px 2px 0px var(--dark-border)',
                }}
              >
                {form.terms && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
              <span style={{ color: 'var(--text-dark)' }} className="text-sm">
                I agree to the{' '}
                <button type="button" style={{ color: 'var(--primary-blue)' }} className="font-black hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" style={{ color: 'var(--primary-blue)' }} className="font-black hover:underline">Privacy Policy</button>
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2.5 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account →'}
            </button>
          </form>

          <p style={{ color: 'var(--text-muted)' }} className="text-center text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} style={{ color: 'var(--primary-blue)' }} className="font-black hover:underline">Log in</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
