import type { Config } from 'tailwindcss';

/**
 * Design System Luxe - Shared across Web and Mobile
 * Hermes-inspired luxury jewelry e-commerce
 */
export const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Palette de fonds - tons chauds et lumineux
        background: {
          DEFAULT: '#fffcf7',
          cream: '#fffcf7',
          beige: '#fcf7f1',
          warm: '#f6f1eb',
          sable: '#e2d8ce',
          muted: '#f8f5f0',
        },
        // Palette de texte
        text: {
          DEFAULT: '#2b333f',
          primary: '#2b333f',
          secondary: '#444444',
          muted: '#696969',
          light: '#8b8b8b',
          inverse: '#fffcf7',
        },
        // Accent Hermes
        hermes: {
          DEFAULT: '#f67828',
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
        // Bordures
        border: {
          DEFAULT: '#e2d8ce',
          light: '#f0ebe3',
          medium: '#d4c9bd',
          dark: '#b8a99a',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      spacing: {
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
      borderRadius: {
        soft: '0.375rem',
        elegant: '0.5rem',
        luxe: '0.75rem',
      },
      fontSize: {
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
      maxWidth: {
        'prose-narrow': '55ch',
        'prose': '65ch',
        'prose-wide': '80ch',
        'content': '1200px',
        'content-wide': '1400px',
        'content-full': '1600px',
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
    },
  },
};

// Platform-agnostic design tokens for use in both web and native
export const designTokens = {
  colors: {
    background: {
      primary: '#fffcf7',
      secondary: '#fcf7f1',
      tertiary: '#f6f1eb',
    },
    text: {
      primary: '#2b333f',
      secondary: '#696969',
      muted: '#8b8b8b',
    },
    accent: {
      primary: '#f67828',
      secondary: '#fb923c',
    },
    border: {
      light: '#f0ebe3',
      default: '#e2d8ce',
      dark: '#b8a99a',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
} as const;

export default baseConfig;
