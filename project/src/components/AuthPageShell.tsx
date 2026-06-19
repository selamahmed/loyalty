import React from 'react';
import { PageStickerBackdrop } from './StickerDecor';

/** Shared auth page shell — stickers in viewport margins only. */
const AuthPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="min-h-screen page-container auth-shell flex"
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    <PageStickerBackdrop preset="auth" />
    <div className="w-full max-w-[430px] auth-shell__content" style={{ position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default AuthPageShell;
