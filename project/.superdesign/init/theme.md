# Theme and design tokens

NexReward uses a playful neo-brutalist system. Light theme is the default. Space Grotesk is the body font and Archivo Black is the display font. The main customer shell combines pastel surfaces, near-black outlines, rounded corners, compressed shadows, and sticker imagery.

Because `src/index.css` is 8,550 lines, the raw context below includes the complete token/base block plus every QR scanner and customer-shell selector relevant to the target page.

## Tailwind configuration (full)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bgColor: 'var(--bg-color)',
        cardBg: 'var(--card-bg)',
        primaryBlue: 'var(--primary-blue)',
        darkBorder: 'var(--dark-border)',
        textDark: 'var(--text-dark)',
        textMuted: 'var(--text-muted)',
        inputBg: 'var(--input-bg)',
        tabBg: 'var(--tab-bg)',
        dividerDash: 'var(--divider-dash)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Archivo Black', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'brutalish': '32px',
        'button': '16px',
      },
      boxShadow: {
        brutal: '0px 8px 0px var(--dark-border)',
        'brutal-btn': '0px 5px 0px var(--dark-border)',
        'brutal-sm': '0px 2px 0px var(--dark-border)',
        'brutal-focus': '0px 4px 0px var(--dark-border)',
      },
      keyframes: {
        'confetti-fall': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        confetti: 'confetti-fall 2.5s ease-in forwards',
      },
    },
  },
  plugins: [],
};

```

## Theme provider (full)

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  });

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, isDarkMode]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

```

## Global CSS: tokens, base rules, QR page, and customer shell

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }

  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }

  body {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  :root {
    --bg-color: #FFF8F0;
    --card-bg: #ffffff;
    --primary-blue: #9122FF;
    --gradient-start: #B44AFF;
    --gradient-end: #9122FF;
    --dark-border: #000000;
    --text-dark: #000000;
    --text-muted: #444444;
    --input-bg: #F0E8FF;
    --tab-bg: #F5F0FF;
    --divider-dash: #CCCCCC;
    --neo-lime: #C8FF00;
    --neo-pink: #FF3E9D;
    --neo-orange: #FF6B35;
    --neo-yellow: #FFE500;
    --neo-sky: #56C8FF;
  }

  [data-theme="dark"] {
    --bg-color: #1A0A2E;
    --card-bg: #2A1045;
    --primary-blue: #B44AFF;
    --gradient-start: #C86BFF;
    --gradient-end: #9122FF;
    --dark-border: #000000;
    --text-dark: #FFFFFF;
    --text-muted: #C4B5D8;
    --input-bg: #3D1F66;
    --tab-bg: #351A58;
    --divider-dash: #5A3D7A;
    --neo-lime: #C8FF00;
    --neo-pink: #FF6AD5;
    --neo-orange: #FF8C5A;
    --neo-yellow: #FFE500;
    --neo-sky: #56C8FF;
  }

  html {
    background-color: var(--bg-color);
    color: var(--text-dark);
  }

  body {
    background-color: var(--bg-color);
    background-image: radial-gradient(circle, rgba(145,34,255,0.08) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    color: var(--text-dark);
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    isolation: isolate;
  }

  [data-theme="dark"] body {
    background-image: radial-gradient(circle, rgba(200,255,0,0.06) 1.5px, transparent 1.5px);
    background-size: 24px 24px;
  }

  .font-display {
    font-family: 'Archivo Black', 'Space Grotesk', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }
}

@layer components {
  .card {
    background-color: var(--card-bg);
    border: 2px solid var(--dark-border);
    border-radius: 24px;
    box-shadow: 0px 6px 0px var(--dark-border);
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    max-width: 100%;
  }

  @media (min-width: 640px) {
    .card {
      border-width: 3px;
      border-radius: 32px;
      box-shadow: 0px 8px 0px var(--dark-border);
    }
  }

  .btn-primary {
    background: linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    color: white;
    font-weight: 700;
    border: 2.5px solid var(--dark-border);
    border-radius: 16px;
    padding: 0.75rem 1.5rem;
    box-shadow: 0px 5px 0px var(--dark-border);
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .btn-primary:active {
    transform: translateY(3px);
    box-shadow: 0px 2px 0px var(--dark-border);
  }

  .btn-primary:hover {
    opacity: 0.95;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: var(--card-bg);
    color: var(--text-dark);
    font-weight: 600;
    border: 2.5px solid var(--dark-border);
    border-radius: 16px;
    padding: 0.75rem 1.5rem;
    box-shadow: 0px 5px 0px var(--dark-border);
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .btn-secondary:active {
    transform: translateY(3px);
    box-shadow: 0px 2px 0px var(--dark-border);
  }

  .btn-secondary:hover {
    background-color: var(--tab-bg);
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-danger {
    background-color: #ef4444;
    color: white;
    font-weight: 700;
    border: 2.5px solid var(--dark-border);
    border-radius: 16px;
    padding: 0.75rem 1.5rem;
    box-shadow: 0px 5px 0px var(--dark-border);
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .btn-danger:active {
    transform: translateY(3px);
    box-shadow: 0px 2px 0px var(--dark-border);
  }

  .btn-danger:hover {
    background-color: #dc2626;
  }

  .input-field {
    width: 100%;
    background-color: var(--input-bg);
    border: 2.5px solid var(--dark-border);
    border-radius: 16px;
    padding: 0.75rem 1rem;
    color: var(--text-dark);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 1rem;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .input-field::placeholder {
    color: var(--text-muted);
  }

  .input-field:focus {
    outline: none;
    transform: translateY(-2px);
    box-shadow: 0px 4px 0px var(--dark-border);
    border-color: var(--primary-blue);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 2px solid var(--dark-border);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .page-container {
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-dark);
  }
}

.qr-page-title__icon {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--dark-border);
  border-radius: 15px;
  background: linear-gradient(180deg, #a78bfa, #6d28d9);
  box-shadow: 0 3px 0 var(--dark-border);
  font-size: 22px;
}

.qr-scanner-panel {
  width: 100%;
}

.qr-camera-viewport {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 4 / 3;
  margin: 0 auto 12px;
  overflow: hidden;
  border: 2.5px solid var(--dark-border);
  border-radius: 20px;
  background: #0f172a;
  box-shadow: 0 5px 0 var(--dark-border), 0 16px 32px rgba(0, 0, 0, 0.16);
}

.qr-camera-viewport--idle {
  aspect-ratio: 16 / 10;
}

.qr-scanner-actions {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.qr-camera-primary {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 16px;
  border: 2.5px solid var(--dark-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  box-shadow: 0 4px 0 var(--dark-border), 0 12px 24px color-mix(in srgb, var(--primary-blue) 22%, transparent);
  color: #fff;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}

.qr-camera-primary:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--dark-border);
}

.qr-camera-primary:focus-visible {
  outline: 3px solid var(--neo-yellow);
  outline-offset: 3px;
}

.qr-inventory-link {
  position: relative;
  isolation: isolate;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 0;
  padding: 12px clamp(92px, 24vw, 120px) 12px 18px;
  overflow: visible;
  text-align: left;
  border: 3px solid var(--dark-border);
  border-radius: 20px;
  box-shadow: 0 6px 0 var(--dark-border);
  background: linear-gradient(135deg, var(--neo-lime) 0%, #b8ef00 100%);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.qr-inventory-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 88% 42%, rgba(255, 255, 255, 0.28) 0%, transparent 52%),
    radial-gradient(circle at 12% 88%, rgba(0, 0, 0, 0.06) 0%, transparent 42%);
  pointer-events: none;
  z-index: 0;
}

.qr-inventory-link > * {
  position: relative;
  z-index: 1;
}

.qr-inventory-link:hover:not(:active) {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 var(--dark-border);
}

.qr-inventory-link:focus-visible {
  outline: 3px solid var(--primary-blue);
  outline-offset: 3px;
}

.qr-inventory-link__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  padding-right: 4px;
}

.qr-inventory-link__heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.qr-inventory-link__title {
  font-weight: 900;
  font-size: clamp(18px, 4vw, 22px);
  color: rgba(69, 30, 128, 1);
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

.qr-inventory-link__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  color: var(--neo-lime);
  background: rgba(69, 30, 128, 1);
  border: 2px solid rgba(0, 0, 0, 0.18);
  box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.14);
}

.qr-inventory-link__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  width: 100%;
}

.qr-inventory-link__subtitle {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.62);
  margin: 0;
  line-height: 1.35;
}

.qr-inventory-link__cta {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
  margin-top: 0;
  padding: 5px 9px 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: var(--primary-blue);
  background: rgba(255, 255, 255, 0.88);
  border: 2px solid rgba(0, 0, 0, 0.22);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.qr-inventory-link:hover:not(:active) .qr-inventory-link__cta {
  transform: translateY(-1px);
  background: #fff;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.14);
}

.qr-inventory-link__visual {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.qr-inventory-link__sticker {
  width: clamp(104px, 28vw, 144px) !important;
  height: auto !important;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  transition: transform 0.2s ease;
  filter:
    drop-shadow(2px 0 0 #fff)
    drop-shadow(-2px 0 0 #fff)
    drop-shadow(0 2px 0 #fff)
    drop-shadow(0 -2px 0 #fff)
    drop-shadow(0 10px 20px rgba(0, 0, 0, 0.22));
}

.qr-inventory-link:hover:not(:active) .qr-inventory-link__sticker {
  transform: scale(1.06) rotate(-4deg);
}

/* QR scanner â€” camera idle state */
.qr-scanner-idle {
  position: absolute;
  inset: 0;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 14px 20px;
  background: linear-gradient(145deg, #5b21b6 0%, #7c3aed 52%, #9f45ee 100%);
  background-size: 220% 220%;
  animation: qr-scanner-idle-bg 8s ease-in-out infinite;
  transition: filter 0.25s ease;
}

.qr-scanner-idle::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.16) 0%, transparent 42%),
    radial-gradient(circle at 82% 88%, rgba(76, 29, 149, 0.45) 0%, transparent 48%);
  pointer-events: none;
}

.qr-scanner-idle:hover {
  filter: brightness(1.06) saturate(1.08);
}

@keyframes qr-scanner-idle-bg {
  0%, 100% {
    background-position: 0% 38%;
  }
  50% {
    background-position: 100% 62%;
  }
}

.qr-scanner-idle__sticker {
  position: relative;
  z-index: 1;
  width: clamp(104px, 30vw, 132px) !important;
  height: auto !important;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1), filter 0.28s ease;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.45));
}

@media (hover: hover) {
  .qr-scanner-idle:hover .qr-scanner-idle__sticker {
    transform: scale(1.1) rotate(-5deg) translateY(-4px);
    filter:
      drop-shadow(0 16px 28px rgba(145, 34, 255, 0.45))
      drop-shadow(0 0 28px rgba(180, 74, 255, 0.35));
  }
}

@media (prefers-reduced-motion: reduce) {
  .qr-scanner-idle {
    animation: none;
    background-size: auto;
  }

  .qr-scanner-idle__sticker {
    transition: none;
  }

  .qr-scanner-idle:hover .qr-scanner-idle__sticker {
    transform: none;
  }
}

.qr-scanner-idle__hint {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  max-width: 250px;
  line-height: 1.4;
  transition: color 0.25s ease, transform 0.25s ease;
}

.qr-scanner-idle:hover .qr-scanner-idle__hint {
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

/* QR scanner â€” manual code entry */
.qr-manual-entry {
  padding: 18px 20px;
  background: var(--card-bg);
  border: 2px solid color-mix(in srgb, var(--dark-border) 78%, transparent);
  border-radius: 20px;
  box-shadow: 0 3px 0 var(--dark-border), 0 12px 24px rgba(0, 0, 0, 0.08);
}

.qr-manual-entry__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.qr-manual-entry__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: var(--primary-blue);
  background: rgba(145, 34, 255, 0.1);
  border: 2px solid rgba(145, 34, 255, 0.22);
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.08);
}

.qr-manual-entry__intro {
  flex: 1;
  min-width: 0;
}

.qr-manual-entry__title {
  margin: 0;
  font-weight: 900;
  font-size: 15px;
  color: var(--text-dark);
  line-height: 1.2;
}

.qr-manual-entry__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.35;
}

.qr-manual-entry__row {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.qr-manual-entry__input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: var(--tab-bg);
  border: 2.5px solid var(--dark-border);
  box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.04);
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.qr-manual-entry__input::placeholder {
  color: var(--text-muted);
  opacity: 0.72;
  font-weight: 600;
}

.qr-manual-entry__input:focus {
  border-color: var(--primary-blue);
  background: #fff;
  box-shadow:
    inset 0 2px 0 rgba(0, 0, 0, 0.03),
    0 0 0 3px rgba(145, 34, 255, 0.14);
}

.qr-manual-entry__submit {
  flex-shrink: 0;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
  border: 3px solid var(--dark-border);
  box-shadow: 0 4px 0 var(--dark-border);
  cursor: pointer;
  transition: opacity 0.15s ease, filter 0.15s ease;
}

.qr-manual-entry__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.qr-manual-entry__submit:disabled:active {
  transform: none !important;
  box-shadow: 0 4px 0 var(--dark-border) !important;
}

.qr-manual-entry__hint {
  margin: 10px 0 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.35;
}

.qr-manual-entry__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.08);
  border: 2px solid rgba(239, 68, 68, 0.35);
}

.customer-shell {
  background:
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary-blue) 22%, transparent), transparent 32%),
    radial-gradient(circle at 8% 28%, color-mix(in srgb, var(--neo-lime) 10%, transparent), transparent 24%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-color) 94%, #ffffff 6%), var(--bg-color));
}

.customer-app-header {
  margin: 10px clamp(10px, 2vw, 16px) 0;
  padding: 8px 12px !important;
  border: 3px solid var(--dark-border) !important;
  border-radius: 22px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 94%, #ffffff 6%), color-mix(in srgb, var(--card-bg) 88%, var(--primary-blue) 12%)) !important;
  box-shadow:
    0 7px 0 var(--dark-border),
    0 18px 38px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px);
}

.customer-main {
  padding-top: 8px;
}

.customer-bottom-nav {
  margin-inline: clamp(8px, 2vw, 14px);
  margin-bottom: 0;
  left: 0 !important;
  right: 0 !important;
  bottom: 10px !important;
  border: 3px solid var(--dark-border) !important;
  border-radius: 28px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 96%, #ffffff 4%), var(--card-bg)) !important;
  box-shadow:
    0 7px 0 var(--dark-border),
    0 18px 38px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: visible;
}

.customer-bottom-nav__icon-pill {
  border-radius: 14px;
  background: transparent;
  box-shadow: none;
}

.customer-bottom-nav__icon-pill--active {
  background: linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 96%, #ffffff 4%), var(--card-bg)) !important;
  box-shadow:
    0 4px 0 var(--dark-border),
    inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
}

.customer-shell .card:not(.auth-card):not(.auth-admin-card),
.customer-shell .profile-stat-card,
.customer-shell .inventory-steps-card,
.customer-shell .inventory-empty-state,
.customer-shell .np-card,
.customer-shell .progress-journey__hero,
.customer-shell .progress-journey__sheet,
.customer-shell .progress-journey__stats div {
  border: 3px solid var(--dark-border) !important;
  border-radius: 28px !important;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 94%, #ffffff 6%), color-mix(in srgb, var(--card-bg) 88%, var(--primary-blue) 12%)) !important;
  box-shadow:
    0 8px 0 var(--dark-border),
    0 22px 44px rgba(0, 0, 0, 0.18) !important;
}

.customer-shell .press-card:not(.inventory-wallet-card):not(.shop-product-card):not(.qr-manual-entry__submit),
.customer-shell .event-chip,
.customer-shell .lb-event-chip {
  border: 3px solid var(--dark-border) !important;
  border-radius: 24px !important;
  box-shadow:
    0 6px 0 var(--dark-border),
    0 16px 34px rgba(0, 0, 0, 0.16) !important;
}

.customer-shell .hero-card-brand,
.customer-shell .sticker-hero,
.customer-shell .event-lb,
.customer-shell .lb-podium,
.customer-shell .qr-inventory-link {
  border: 3px solid var(--dark-border) !important;
  border-radius: 28px !important;
  box-shadow:
    0 8px 0 var(--dark-border),
    0 22px 44px rgba(0, 0, 0, 0.2) !important;
}

.customer-shell .hero-card-brand,
.customer-shell .sticker-hero,
.customer-shell .event-lb,
.customer-shell .lb-podium {
  overflow: visible;
}

.customer-shell .shop-product-card,
.customer-shell .inventory-wallet-card {
  border-radius: 22px !important;
  box-shadow:
    0 7px 0 var(--dark-border),
    0 18px 34px rgba(0, 0, 0, 0.18) !important;
}

.customer-shell .input-field,
.customer-shell input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
.customer-shell textarea,
.customer-shell select {
  border-width: 3px !important;
  border-color: var(--dark-border) !important;
  border-radius: 20px !important;
  background: color-mix(in srgb, var(--input-bg) 86%, var(--card-bg) 14%) !important;
  box-shadow: none !important;
}

.customer-shell .input-field:focus,
.customer-shell input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):focus,
.customer-shell textarea:focus,
.customer-shell select:focus {
  border-color: var(--primary-blue) !important;
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--primary-blue) 22%, transparent),
    0 5px 0 var(--dark-border) !important;
}

.customer-shell .card::before,
.customer-shell .card::after,
.customer-shell .hero-card-brand::before,
.customer-shell .sticker-hero::before,
.customer-shell .sticker-hero::after,
.customer-shell .profile-stat-card::before,
.customer-shell .inventory-wallet-card::after,
.customer-shell .home-stat-card::before,
.customer-shell .home-quick-action::before {
  border: 0 !important;
  box-shadow: none !important;
  outline: none !important;
}

.customer-shell .lb-podium {
  box-shadow:
    0 8px 0 var(--dark-border),
    0 22px 44px rgba(0, 0, 0, 0.18) !important;
}

.customer-shell .lb-podium__block {
  box-shadow: 0 5px 0 rgba(8, 29, 53, 0.2) !important;
}

@media (min-width: 1024px) {
  .customer-bottom-nav {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .customer-app-header {
    border-radius: 20px;
    box-shadow: 0 5px 0 var(--dark-border), 0 14px 28px rgba(0, 0, 0, 0.2);
  }

  .customer-shell .card:not(.auth-card):not(.auth-admin-card),
  .customer-shell .hero-card-brand,
  .customer-shell .sticker-hero,
  .customer-shell .event-lb,
  .customer-shell .lb-podium {
    border-radius: 24px !important;
    box-shadow: 0 6px 0 var(--dark-border), 0 16px 30px rgba(0, 0, 0, 0.18) !important;
  }
}

/* Profile page - match login/signup card language */
.customer-shell:has(.qr-auth-page),
.customer-shell:has(.games-auth-page),
.customer-shell:has(.lb-page) {
  background:
    radial-gradient(circle at 50% -6%, color-mix(in srgb, var(--primary-blue) 34%, transparent), transparent 38%),
    radial-gradient(circle at 8% 78%, color-mix(in srgb, var(--neo-pink) 13%, transparent), transparent 28%),
    radial-gradient(circle at 92% 18%, color-mix(in srgb, var(--neo-sky) 12%, transparent), transparent 24%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg-color) 88%, #ffffff 12%), var(--bg-color));
}

.customer-shell:has(.qr-auth-page) .customer-app-header,
.customer-shell:has(.games-auth-page) .customer-app-header,
.customer-shell:has(.lb-page) .customer-app-header {
  width: min(100% - 24px, 960px);
  margin: 12px auto 0;
  border-radius: 32px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, #ffffff 10%), color-mix(in srgb, var(--card-bg) 84%, var(--primary-blue) 16%)) !important;
  box-shadow:
    0 8px 0 var(--dark-border),
    0 24px 58px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(22px) saturate(1.18);
}

.customer-header-icon-button {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px;
}

.customer-header-icon-button:focus-visible,
.customer-bottom-nav__item:focus-visible,
.customer-bottom-nav__scan:focus-visible {
  outline: 3px solid var(--neo-yellow);
  outline-offset: 3px;
}

.customer-bottom-nav__item {
  border-radius: 16px;
  min-width: 0;
}

.customer-bottom-nav__label {
  font-size: 11px !important;
  line-height: 1.15 !important;
}

.home-stat-card__label {
  font-size: 11px !important;
  line-height: 1.2 !important;
}

.home-auth-content .home-quick-action__label {
  font-size: 14px !important;
  line-height: 1.2 !important;
}

.home-auth-content .home-quick-action__hint {
  font-size: 11px !important;
  line-height: 1.35 !important;
  opacity: 1 !important;
}

.shop-product-card__title {
  font-size: 15px !important;
}

.shop-product-card__desc {
  font-size: 12px !important;
}

@media (max-width: 640px) {
  .app-main-with-nav {
    padding-bottom: 112px !important;
  }

  .shop-products-grid,
  .shop-auth-content .shop-products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .home-auth-content .home-hero-card .page-main-sticker--hero-card {
    opacity: 0.72 !important;
  }
}
```
