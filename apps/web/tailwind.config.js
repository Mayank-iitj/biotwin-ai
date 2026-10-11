/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#ffffff',
          600: '#e5e5e5',
          700: '#737373',
          800: '#262626',
          900: '#000000',
        },
        med: {
          dark: '#000000',
          lime: '#ffffff',
          cream: '#ffffff',
          'gray-green': '#a3a3a3',
          olive: '#525252',
        },
        biotech: {
          50: '#ffffff',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#ffffff',
          500: '#e5e5e5',
          600: '#a3a3a3',
          700: '#737373',
          800: '#404040',
          900: '#171717',
        },
        risk: {
          low: '#737373',
          moderate: '#a3a3a3',
          high: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['var(--font-work-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-instrument-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}