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
          50: '#fcfef7',
          100: '#f4fae9',
          200: '#e7f5ce',
          300: '#d7f0af',
          400: '#c2eb8c',
          500: '#cfff92', // Medureon lime
          600: '#bceb7f',
          700: '#99d253',
          800: '#7cb539',
          900: '#0f1901', // Medureon dark as primary-900 fallback
        },
        med: {
          dark: '#0f1901',
          lime: '#cfff92',
          cream: '#fdfdfc',
          'gray-green': '#e9ebe0',
          olive: '#555f4a',
        },
        biotech: {
          50: '#f6fdf5',
          100: '#e5fae3',
          200: '#cbf5c7',
          300: '#a5eba0',
          400: '#cfff92', // align biotech with theme
          500: '#a3e660',
          600: '#7cbd37',
          700: '#5c9424',
          800: '#3e6a14',
          900: '#25440a',
        },
        risk: {
          low: '#cfff92', // map healthy/low risk to lime green
          moderate: '#eab308',
          high: '#ef4444',
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