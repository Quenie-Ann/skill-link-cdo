/** @type {import('tailwindcss').Config} *//** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'skill-dark': '#065f46', // Deep Forest Green
        'skill-primary': '#10b981', // Emerald Green
        'skill-light': '#ecfdf5', // Mint Background
      },
    },
  },
  plugins: [],
}