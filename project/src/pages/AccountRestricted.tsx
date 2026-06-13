import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Ban, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Props = {
  status: 'suspended' | 'deleted';
};

const AccountRestricted: React.FC<Props> = ({ status }) => {
  const { profile, authUser, logout } = useAuth();
  const navigate = useNavigate();

  const isBanned = status === 'deleted';

  const handleLogout = () => {
    logout().finally(() => navigate('/login', { replace: true }));
  };

  return (
    <div className="min-h-screen page-container flex items-center justify-center p-4">
      <div
        style={{
          maxWidth: 440,
          width: '100%',
          background: 'var(--card-bg)',
          border: '3px solid var(--dark-border)',
          boxShadow: '0 8px 0 var(--dark-border)',
          borderRadius: 24,
          padding: '28px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 18px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isBanned ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            border: `3px solid ${isBanned ? '#ef4444' : '#f59e0b'}`,
          }}
        >
          {isBanned ? <Ban size={34} color="#ef4444" /> : <AlertTriangle size={34} color="#f59e0b" />}
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 24, color: 'var(--text-dark)', margin: '0 0 8px' }}>
          {isBanned ? 'Hesabınız Yasaklandı' : 'Hesabınız Askıya Alındı'}
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 20px' }}>
          {isBanned
            ? 'Bu hesaba erişim kalıcı olarak kapatıldı. Bir hata olduğunu düşünüyorsanız destek ekibimizle iletişime geçin.'
            : 'Hesabınız geçici olarak askıya alındı. Puan kazanma, oyun oynama ve ödül kullanımı devre dışı. Destek ile iletişime geçebilirsiniz.'}
        </p>

        <div
          style={{
            background: 'var(--tab-bg)',
            border: '2.5px solid var(--dark-border)',
            borderRadius: 16,
            padding: '14px 16px',
            marginBottom: 20,
            textAlign: 'left',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hesap Bilgisi
          </p>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 4px' }}>
            {profile?.username ?? authUser?.name ?? 'Kullanıcı'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px' }}>
            {profile?.email ?? authUser?.email}
          </p>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              background: isBanned ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              color: isBanned ? '#dc2626' : '#d97706',
              border: `2px solid ${isBanned ? '#ef4444' : '#f59e0b'}`,
            }}
          >
            {isBanned ? 'Yasaklı' : 'Askıda'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/support')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 14,
              fontWeight: 900,
              fontSize: 14,
              background: '#7B6EF6',
              color: 'white',
              border: '3px solid var(--dark-border)',
              boxShadow: '0 4px 0 var(--dark-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <MessageCircle size={16} />
            Destek ile İletişime Geç
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 14,
              fontWeight: 900,
              fontSize: 14,
              background: 'var(--card-bg)',
              color: 'var(--text-dark)',
              border: '3px solid var(--dark-border)',
              boxShadow: '0 4px 0 var(--dark-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountRestricted;
