/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'notebook-bg': '#ffffff',
        'notebook-text': '#202124',
        'notebook-accent': '#4f5dff',
        'notebook-border': '#eceff3',
      },
      fontFamily: {
        sans: ['"Google Sans Text"', '"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
