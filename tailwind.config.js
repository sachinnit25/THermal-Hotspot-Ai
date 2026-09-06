/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // Deep aerospace / mission-control backgrounds
        obsidian: {
          950: '#05080D',
          900: '#080C12',
          850: '#0B1118',
          800: '#111923',
          700: '#1B2935',
        },

        // System / thermal intelligence palette
        gradient: {
          cyan: '#38BDF8',
          blue: '#0EA5E9',
          orange: '#FF8A00',
          red: '#FF3B30',
          green: '#22C55E',
        },

        // Dark interface surfaces
        carbon: {
          950: '#05080D',
          900: '#080C12',
          850: '#0B1118',
          800: '#111923',
          700: '#1B2935',
        },

        // Thermal / fire detection
        flame: {
          400: '#FFB347',
          500: '#FF8A00',
          600: '#FF5A00',
          700: '#FF3B30',
        },

        // Aerospace telemetry / satellite data
        telemetry: {
          400: '#7DD3FC',
          500: '#38BDF8',
          600: '#0EA5E9',
          700: '#0284C7',
        },

        // Critical alerts
        critical: {
          400: '#FF6B63',
          500: '#FF3B30',
          600: '#E52B23',
          700: '#C9211A',
        },

        // Operational / safe state
        success: {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
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

        // Kept for compatibility with existing components.
        // The old colorful mesh blobs are disabled in index.css.
        'blob-float-1': 'blobFloat1 18s ease-in-out infinite alternate',
        'blob-float-2': 'blobFloat2 22s ease-in-out infinite alternate',
        'blob-float-3': 'blobFloat3 16s ease-in-out infinite alternate',
      },

      keyframes: {
        laserScan: {
          '0%': {
            transform: 'translateY(-10%) scaleX(0.8)',
            opacity: '0.4',
          },
          '50%': {
            opacity: '0.8',
          },
          '100%': {
            transform: 'translateY(110%) scaleX(1.2)',
            opacity: '0.4',
          },
        },

        blobFloat1: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '50%': {
            transform: 'translate(60px, -40px) scale(1.15)',
          },
          '100%': {
            transform: 'translate(-30px, 50px) scale(0.95)',
          },
        },

        blobFloat2: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '50%': {
            transform: 'translate(-50px, 60px) scale(1.12)',
          },
          '100%': {
            transform: 'translate(40px, -30px) scale(0.92)',
          },
        },

        blobFloat3: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '50%': {
            transform: 'translate(40px, 50px) scale(1.18)',
          },
          '100%': {
            transform: 'translate(-60px, -40px) scale(0.9)',
          },
        },
      },
    },
  },

  plugins: [],
}