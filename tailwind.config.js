/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f1f8f1',
          100: '#dcecdc',
          200: '#bcdabc',
          300: '#8fbf90',
          400: '#5fa062',
          500: '#3f8344',
          600: '#2f6935',
          700: '#27542d',
          800: '#214327',
          900: '#1c3720',
        },
        earth: {
          50:  '#faf7f2',
          100: '#f1ead9',
          200: '#e2d4b3',
          300: '#cdb585',
          400: '#b8955d',
          500: '#a07c44',
          600: '#856536',
          700: '#6c502d',
          800: '#594128',
          900: '#4a3722',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in':   { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop':       { '0%': { transform: 'scale(0.92)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
        'slide-up':  { '0%': { transform: 'translateY(8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
      animation: {
        'fade-in': 'fade-in 240ms ease-out',
        'pop':     'pop 260ms ease-out',
        'slide-up':'slide-up 220ms ease-out',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        soft: '0 8px 24px -12px rgba(31,65,40,0.18)',
      },
    },
  },
  plugins: [],
}
