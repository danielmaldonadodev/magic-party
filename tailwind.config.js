/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Magic: The Gathering color identities
        white: {
          mana: '#F8F6D8',
          DEFAULT: '#ffffff',
          accent: '#e9e7ca',
        },
        blue: {
          mana: '#0E68AB',
          light: '#c1e0ff',
          DEFAULT: '#0E68AB',
          dark: '#06365a',
        },
        black: {
          mana: '#150B00',
          light: '#333333',
          DEFAULT: '#150B00',
          dark: '#000000',
        },
        red: {
          mana: '#D3202A',
          light: '#ff6b6b',
          DEFAULT: '#D3202A',
          dark: '#8a0000',
        },
        green: {
          mana: '#00733D',
          light: '#7ed957',
          DEFAULT: '#00733D',
          dark: '#004d29',
        },
        colorless: '#CCCBC3',
        multicolor: '#DAC383',
      },
      fontFamily: {
        'magical': ['Beleren', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 10px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.22)',
        'mana': '0 0 15px rgba(255, 255, 255, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'mana-glow': 'mana-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'mana-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'magic-texture': "url('/src/assets/backgrounds/magic-texture.png')",
      },
      borderRadius: {
        'card': '4.75% / 3.5%',
      },
    },
  },
  plugins: [],
}
