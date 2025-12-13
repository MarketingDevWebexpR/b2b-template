/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        hermes: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f67828',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        background: {
          DEFAULT: '#fffcf7',
          beige: '#f5f0e8',
        },
        text: {
          primary: '#2b333f',
          secondary: '#696969',
          muted: '#8b8b8b',
        },
        border: {
          DEFAULT: '#e5e5e5',
          light: '#f0f0f0',
        },
      },
      fontFamily: {
        sans: ['Inter-Regular'],
        'sans-medium': ['Inter-Medium'],
        'sans-semibold': ['Inter-SemiBold'],
        'sans-bold': ['Inter-Bold'],
        serif: ['PlayfairDisplay-Regular'],
        'serif-medium': ['PlayfairDisplay-Medium'],
        'serif-semibold': ['PlayfairDisplay-SemiBold'],
        'serif-bold': ['PlayfairDisplay-Bold'],
        display: ['CormorantGaramond-Regular'],
        'display-medium': ['CormorantGaramond-Medium'],
        'display-semibold': ['CormorantGaramond-SemiBold'],
        'display-bold': ['CormorantGaramond-Bold'],
      },
      borderRadius: {
        soft: '8px',
        elegant: '12px',
      },
    },
  },
  plugins: [],
};
