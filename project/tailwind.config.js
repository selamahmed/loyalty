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
