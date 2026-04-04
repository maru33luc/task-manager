/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#03070e',
          900: '#060c16',
          800: '#0a121d',
          700: '#0f1a27',
          600: '#152233',
          500: '#1d2f44',
          400: '#273d56',
          300: '#365470',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#451a03',
        },
        jade: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        azure: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'spin-slow':  'spin 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
