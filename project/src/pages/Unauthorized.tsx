import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, dashboardPath, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f5f3ff' }}>
      <div className="max-w-md w-full text-center">
        <div className="p-10 rounded-2xl" style={{ background: 'white', border: '3px solid #1e1b4b', boxShadow: '0px 8px 0px #1e1b4b' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: '#fee2e2', border: '2.5px solid #ef4444', boxShadow: '0px 4px 0px #ef4444' }}>
            <ShieldOff size={36} style={{ color: '#ef4444' }} />
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ color: '#1e1b4b' }}>403</h1>
          <h2 className="text-xl font-black mb-3" style={{ color: '#1e1b4b' }}>Yetkisiz Erişim</h2>
          <p className="font-medium mb-8" style={{ color: '#6b7280' }}>
            Bu sayfaya erişim izniniz bulunmuyor. Lütfen kendi panelinize dönün.
          </p>
          <div className="flex flex-col gap-3">
            {isAuthenticated && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="w-full py-3 px-6 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #7B6EF6, #4F8EF7)', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}
              >
                <ArrowLeft size={18} />
                Panelime Dön
              </button>
            )}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-full py-3 px-6 rounded-xl font-black transition-all active:translate-y-0.5"
              style={{ background: 'white', color: '#6b7280', border: '2px solid #e5e7eb', boxShadow: '0px 3px 0px #e5e7eb' }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
