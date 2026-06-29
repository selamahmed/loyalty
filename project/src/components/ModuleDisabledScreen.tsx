import React from 'react';
import { useNavigate } from 'react-router-dom';

type ModuleDisabledScreenProps = {
  title: string;
  message: string;
};

const card: React.CSSProperties = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/** Shown when an admin-disabled module is opened directly via URL. */
const ModuleDisabledScreen: React.FC<ModuleDisabledScreenProps> = ({ title, message }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div style={{ ...card, padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, margin: '0 0 10px' }}>⏸️</p>
        <h1 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 8px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
        <button type="button" className="lbtn-primary-sm" onClick={() => navigate('/home')}>
          Ana sayfaya dön
        </button>
      </div>
    </div>
  );
};

export default ModuleDisabledScreen;
