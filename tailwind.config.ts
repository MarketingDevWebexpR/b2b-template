import type { Config } from 'tailwindcss';

/**
 * Design System Luxe - Inspire Hermes
 *
 * Palette principale :
 * - Fond : blanc creme, beige sable
 * - Texte : charcoal, gris elegant
 * - Accent : orange Hermes (#f67828)
 *
 * Philosophie :
 * - Elegance sobre et raffinee
 * - Espaces genereux (breathing room)
 * - Typographie serif pour les titres
 * - Animations subtiles et fluides
 */

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette de fonds - tons chauds et lumineux
        background: {
          DEFAULT: '#fffcf7',      // Fond principal - blanc creme
          cream: '#fffcf7',         // Blanc creme pur
          beige: '#fcf7f1',         // Beige doux
          warm: '#f6f1eb',          // Gris chaud
          sable: '#e2d8ce',         // Sable/taupe clair
          muted: '#f8f5f0',         // Fond attenue
        },
        // Palette de texte
        text: {
          DEFAULT: '#2b333f',       // Charcoal - texte principal
          primary: '#2b333f',       // Charcoal
          secondary: '#444444',     // Gris moyen
          muted: '#696969',         // Gris secondaire
          light: '#8b8b8b',         // Gris clair
          inverse: '#fffcf7',       // Texte sur fond sombre
        },
        // Accent Hermes
        hermes: {
          DEFAULT: '#f67828',       // Orange Hermes principal
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f67828',           // Couleur principale
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Palette neutre luxe
        luxe: {
          white: '#ffffff',
          cream: '#fffcf7',
          pearl: '#faf8f5',
          sand: '#f0ebe3',
          taupe: '#d4c9bd',
          stone: '#b8a99a',
          bronze: '#a08b76',
          charcoal: '#2b333f',
          noir: '#1a1a1a',
        },
        // Bordures et separateurs
        border: {
          DEFAULT: '#e2d8ce',       // Bordure principale
          light: '#f0ebe3',         // Bordure legere
          medium: '#d4c9bd',        // Bordure moyenne
          dark: '#b8a99a',          // Bordure accentuee
        },
      },
      fontFamily: {
        // Serif elegant pour les titres
        serif: [
          'Playfair Display',
          'Cormorant Garamond',
          'Georgia',
          'Times New Roman',
          'serif',
        ],
        // Sans-serif raffine pour le corps
        sans: [
          'Inter',
          'Helvetica Neue',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        // Display pour les elements d'impact
        display: [
          'Cormorant Garamond',
          'Playfair Display',
          'Georgia',
          'serif',
        ],
      },
      fontSize: {
        // Echelle typographique luxe
        'display-hero': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '300' }],
        'display-1': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '300' }],
        'display-2': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'heading-1': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '400' }],
        'heading-2': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'heading-3': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '500' }],
        'heading-4': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        'heading-5': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.005em', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.01em' }],
        'body': ['1rem', { lineHeight: '1.7', letterSpacing: '0.01em' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.15em', fontWeight: '500' }],
      },
      spacing: {
        // Espacements genereux pour le luxe
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '60': '15rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        'prose-narrow': '55ch',
        'prose': '65ch',
        'prose-wide': '80ch',
        'content': '1200px',
        'content-wide': '1400px',
        'content-full': '1600px',
      },
      animation: {
        // Animations subtiles et elegantes
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-slow': 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-up-slow': 'fadeInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'reveal': 'reveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'float': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'underline-grow': 'underlineGrow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        reveal: {
          '0%': { opacity: '0', clipPath: 'inset(0 100% 0 0)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        underlineGrow: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
      },
      backgroundImage: {
        // Degrades subtils et elegants
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-warm': 'linear-gradient(180deg, #fffcf7 0%, #fcf7f1 50%, #f6f1eb 100%)',
        'gradient-cream': 'linear-gradient(180deg, #fffcf7 0%, #faf8f5 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #fffcf7 0%, #f8f5f0 100%)',
        'gradient-hermes': 'linear-gradient(135deg, #f67828 0%, #fb923c 50%, #f67828 100%)',
        'gradient-hermes-soft': 'linear-gradient(135deg, rgba(246, 120, 40, 0.1) 0%, rgba(246, 120, 40, 0.05) 100%)',
        'hero-overlay-light': 'linear-gradient(to bottom, rgba(255,252,247,0.1), rgba(255,252,247,0.6), rgba(255,252,247,0.95))',
        'hero-overlay-warm': 'linear-gradient(to bottom, rgba(252,247,241,0) 0%, rgba(252,247,241,0.8) 100%)',
        'vignette': 'radial-gradient(ellipse at center, transparent 0%, rgba(43,51,63,0.03) 100%)',
      },
      boxShadow: {
        // Ombres douces et elegantes
        'soft': '0 2px 8px rgba(43, 51, 63, 0.04)',
        'soft-md': '0 4px 16px rgba(43, 51, 63, 0.06)',
        'soft-lg': '0 8px 32px rgba(43, 51, 63, 0.08)',
        'soft-xl': '0 16px 48px rgba(43, 51, 63, 0.1)',
        'elegant': '0 4px 20px rgba(43, 51, 63, 0.05), 0 2px 8px rgba(43, 51, 63, 0.03)',
        'elegant-lg': '0 12px 40px rgba(43, 51, 63, 0.08), 0 4px 12px rgba(43, 51, 63, 0.04)',
        'card': '0 2px 12px rgba(43, 51, 63, 0.04)',
        'card-hover': '0 8px 32px rgba(43, 51, 63, 0.08), 0 2px 8px rgba(43, 51, 63, 0.04)',
        'button': '0 2px 8px rgba(246, 120, 40, 0.2)',
        'button-hover': '0 4px 16px rgba(246, 120, 40, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(43, 51, 63, 0.03)',
      },
      borderRadius: {
        'soft': '0.375rem',
        'elegant': '0.5rem',
        'luxe': '0.75rem',
        'pill': '9999px',
      },
      transitionTimingFunction: {
        'luxe': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'luxe-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'luxe-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      letterSpacing: {
        'luxe': '0.15em',
        'elegant': '0.1em',
        'refined': '0.05em',
      },
      lineHeight: {
        'luxe': '1.8',
        'elegant': '1.7',
        'relaxed': '1.65',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '85': '0.85',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};

export default config;
