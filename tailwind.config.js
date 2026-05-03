/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080808', surface: '#111111', border: '#1e1e1e', muted: '#2a2a2a',
        accent: { DEFAULT: '#7c3aed', light: '#a855f7', dark: '#6d28d9' },
        success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
