/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d6e3f0',
          200: '#b8cce0',
          300: '#94b3d0',
          400: '#7399bc',
          500: '#4a6fa1',
          600: '#3c5a8c',
          700: '#324c73',
          800: '#2a3f5f',
          900: '#233651',
        }
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
