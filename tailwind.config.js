/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'phosphor': '#00ff41',
        'phosphor-dark': '#00cc33',
        'god-red': '#ff0000',
        'terminal': '#010101',
        'crt-amber': '#ffb000',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.27861' },
          '20%': { opacity: '0.34769' },
          '40%': { opacity: '0.23692' },
          '60%': { opacity: '0.90626' },
          '80%': { opacity: '0.18128' },
          '100%': { opacity: '0.83891' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
          '100%': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
}