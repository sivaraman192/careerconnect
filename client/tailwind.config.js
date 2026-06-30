/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(21, 28, 44, 0.4)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
        brandBlue: '#3b82f6',
        brandPurple: '#8b5cf6',
        brandIndigo: '#6366f1',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
