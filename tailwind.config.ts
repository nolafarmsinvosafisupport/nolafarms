import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#102818',
          dark: '#183020',
          primary: '#1E3C28',
          mid: '#2D4A1E',
          leaf: '#486018',
        },
        cream: {
          primary: '#FAF5F0',
          secondary: '#F5F5EB',
          warm: '#FAF5EB',
        },
        gold: {
          light: '#F0D2A5',
          mid: '#E6C8AA',
          warm: '#D4A76A',
        },
        farm: {
          dark: '#0F1A12',
          text: '#102818',
          muted: '#7A8C7E',
          border: '#D2C8B4',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 70px rgba(212, 167, 106, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
