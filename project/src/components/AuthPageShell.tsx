import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PageStickerBackdrop } from './StickerDecor';

/** Shared auth page shell — stickers in viewport margins only. */
const AuthPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen page-container auth-shell flex"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <button
        type="button"
        onClick={toggleTheme}
        className="auth-theme-toggle"
        aria-label={isDarkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
        title={isDarkMode ? 'Açık tema' : 'Koyu tema'}
      >
        {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <PageStickerBackdrop preset="auth" />
      <div className="w-full max-w-[430px] auth-shell__content" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default AuthPageShell;
