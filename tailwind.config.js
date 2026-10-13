/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0a0d14',
          900: '#0f141f',
          850: '#141b2a',
          800: '#1a2336',
          700: '#25324d',
          600: '#344569',
        },
        net: {
          green: '#10b981', // Success
          cyan: '#06b6d4',  // Channel active / data
          amber: '#f59e0b', // Backoff / waiting
          red: '#ef4444',   // Collision
          purple: '#a855f7' // Sensed / carrier
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
