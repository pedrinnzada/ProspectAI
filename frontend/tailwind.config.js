/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { poppins: ['Poppins', 'sans-serif'] },
      colors: {
        brand: { red: '#e5272a', dark: '#b81e21', light: '#fff0f0' }
      }
    }
  },
  plugins: []
}
