/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Branding Colors
        'skill-dark': '#065f46',    // Deep Forest Green
        'skill-primary': '#10b981', // Emerald Green
        'skill-light': '#ecfdf5',   // Mint Background
        
        // Neutral extensions for better Dark Mode contrast
        'dark-bg': '#0f172a',       // Slate 900
        'dark-card': '#1e293b',     // Slate 800
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}