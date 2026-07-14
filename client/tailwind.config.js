/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#BAFF39',
        'primary-dark': '#9de022',
        'primary-light': '#d4ff7a',
        secondary: '#1a1a1a',
        accent: '#BAFF39',
        dark: '#0a0a0a',
        'surface': '#f2f0eb',
        'surface-card': '#ffffff',
        'text-main': '#1a1a1a',
        'text-light': '#6b6b6b',
        'text-muted': '#a0a0a0',
        'border-custom': '#e2e0db',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 30px rgba(186,255,57,0.4)',
      },
    },
  },
  plugins: [],
}
