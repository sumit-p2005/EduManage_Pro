/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Blue
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#7C3AED', // Purple
          light: '#8B5CF6',
          dark: '#6D28D9',
        },
        success: {
          DEFAULT: '#22C55E', // Green
          light: '#4ADE80',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#F97316', // Orange
          light: '#FB923C',
          dark: '#EA580C',
        },
        bgLight: '#F8FAFC',
        bgDark: '#0F172A',
        cardLight: '#FFFFFF',
        cardDark: '#1E293B',
        borderLight: '#E2E8F0',
        borderDark: '#334155'
      },
      borderRadius: {
        'large': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.2)',
        'glow-secondary': '0 0 20px rgba(124, 58, 237, 0.2)',
      }
    },
  },
  plugins: [],
}
