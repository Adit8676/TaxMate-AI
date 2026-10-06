/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0e17',
          surface: '#111827',
          card: '#1e293b',
          emerald: '#10b981',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
