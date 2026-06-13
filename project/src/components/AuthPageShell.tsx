import React from 'react';
import { PageStickerBackdrop } from './StickerDecor';

/** Shared auth page shell — stickers in viewport margins only. */
const AuthPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="min-h-screen page-container flex items-center justify-center p-4"
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    <PageStickerBackdrop preset="auth" />
    <div className="w-full max-w-sm space-y-4" style={{ position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default AuthPageShell;
