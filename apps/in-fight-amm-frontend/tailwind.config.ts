import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c8f028',
          dark: '#b0d620',
          light: '#d4f542',
        },
        dark: {
          bg: '#0a0a0a',
          card: '#141414',
          border: '#2a2a2a',
        }
      },
      fontSize: {
        'xs': '0.7rem',
        'sm': '0.8rem',
        'base': '0.875rem',
      }
    },
  },
  plugins: [],
}
export default config

