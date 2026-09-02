/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050609',
          900: '#080A10',
          850: '#0E111B',
          800: '#141824',
          700: '#1E2436',
        },
        gradient: {
          magenta: '#FF007A',
          pink: '#FF2A6D',
          purple: '#7928CA',
          violet: '#8B5CF6',
          coral: '#FF5722',
          amber: '#FFB703',
          yellow: '#FFD000',
        },
        carbon: {
          950: '#05060A',
          900: '#0A0D14',
          850: '#0F131D',
          800: '#161B28',
          700: '#202638',
        },
        flame: {
          400: '#FF7A29',
          500: '#FF570A',
          600: '#E64600',
          700: '#CC3800',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'laser-scan': 'laserScan 3.5s ease-in-out infinite alternate',
        'blob-float-1': 'blobFloat1 18s ease-in-out infinite alternate',
        'blob-float-2': 'blobFloat2 22s ease-in-out infinite alternate',
        'blob-float-3': 'blobFloat3 16s ease-in-out infinite alternate',
      },
      keyframes: {
        laserScan: {
          '0%': { transform: 'translateY(-10%) scaleX(0.8)', opacity: '0.4' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(110%) scaleX(1.2)', opacity: '0.4' },
        },
        blobFloat1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(60px, -40px) scale(1.15)' },
          '100%': { transform: 'translate(-30px, 50px) scale(0.95)' },
        },
        blobFloat2: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-50px, 60px) scale(1.12)' },
          '100%': { transform: 'translate(40px, -30px) scale(0.92)' },
        },
        blobFloat3: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, 50px) scale(1.18)' },
          '100%': { transform: 'translate(-60px, -40px) scale(0.9)' },
        },
      }
    },
  },
  plugins: [],
}
