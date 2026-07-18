/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
        },
        secondary: {
          50: '#FFF3E0',
          500: '#FF9800',
          700: '#F57C00',
        },
      },
    },
  },
  plugins: [],
};
