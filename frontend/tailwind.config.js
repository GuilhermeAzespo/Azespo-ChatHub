/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6d28d9', // Roxo Azespo
        dark: '#0f172a', // Background escuro
        card: '#1e293b' // Background dos cards
      }
    },
  },
  plugins: [],
}
