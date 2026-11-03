/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        surface: '#13151F',
        card: {
          DEFAULT: '#13151F',
          secondary: '#161926',
          elevated: '#1C1F2E',
        },
        border: {
          DEFAULT: '#24283B',
          subtle: '#2A2F45',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          purple: '#A855F7',
        },
        brand: {
          dark: '#090A0F',
          surface: '#0D0E15',
          card: '#13151F',
          cardAlt: '#161926',
          elevated: '#1C1F2E',
          border: '#24283B',
          indigo: '#6366F1',
          purple: '#A855F7',
          success: '#10B981',
          warning: '#F59E0B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
      },
    },
  },
  plugins: [],
};
