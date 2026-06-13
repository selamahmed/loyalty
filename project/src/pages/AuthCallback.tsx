import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../context/AuthContext';
import { fetchMyAccountStatus, isRestrictedStatus } from '../services/accountStatus';

/**
 * Landing page for the Supabase OAuth callback (PKCE flow).
 * URL pattern after Google sign-in:
 *   http://localhost:5173/?code=XXX#/auth/callback
 *
 * HashRouter shows this page; detectSessionInUrl exchanges the code;
 * onAuthStateChange fires; this component then redirects to the dashboard.
 *
 * Also registered in Supabase → Authentication → Redirect URLs:
 *   http://localhost:5173
 *   https://loyalty-bmfq.vercel.app
 *   https://loyalty-bmfq.vercel.app/#/auth/callback
 */
const AuthCallback: React.FC = () => {
  const { authUser, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timedOut && !authUser) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isLoading && authUser) {
      void (async () => {
        const status = await fetchMyAccountStatus(authUser.id);
        if (status === 'deleted') {
          sessionStorage.setItem('oauth_error', 'Hesabınız yasaklandı.');
          await logout();
          navigate('/login', { replace: true });
          return;
        }
        if (isRestrictedStatus(status) && authUser.role === 'customer') {
          navigate('/home', { replace: true });
          return;
        }
        navigate(getDashboardPath(authUser.role), { replace: true });
      })();
    }
  }, [authUser, isLoading, timedOut, navigate, logout]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-color, #0c0c0e)',
        gap: 20,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '4px solid #7B6EF6',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p
        style={{
          color: '#7B6EF6',
          fontWeight: 900,
          fontSize: 14,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        {timedOut ? 'Yönlendiriliyor…' : 'Giriş yapılıyor…'}
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AuthCallback;
