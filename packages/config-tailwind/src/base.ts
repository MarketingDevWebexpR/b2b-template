import type { Config } from 'tailwindcss';

/**
 * Design System B2B Professionnel
 * Plateforme distributeur B2B - Inspiré Rexel, Sonepar, Setin
 */
export const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // ===== PALETTE B2B PROFESSIONNELLE =====

        // Primaire B2B - Bleu professionnel (actions principales)
        'b2b-primary': {
          DEFAULT: '#0059a1',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0059a1',
          600: '#004d8a',
          700: '#003d6d',
          800: '#002d51',
          900: '#001d35',
        },

        // Accent B2B - Orange action (CTAs, éléments clés)
        'b2b-accent': {
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

        // Succès B2B - Vert (stock disponible, confirmations)
        'b2b-success': {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Danger B2B - Rouge (rupture stock, erreurs, alertes)
        'b2b-danger': {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        // Warning B2B - Orange/Jaune (stock faible, attention)
        'b2b-warning': {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Info B2B - Bleu clair (informations, tips)
        'b2b-info': {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Fonds B2B - Tons neutres professionnels
        'b2b-bg': {
          DEFAULT: '#ffffff',
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          muted: '#e2e8f0',
          dark: '#1e293b',
        },

        // Texte B2B - Lisibilité optimale
        'b2b-text': {
          DEFAULT: '#1e293b',
          primary: '#1e293b',
          secondary: '#475569',
          muted: '#94a3b8',
          light: '#cbd5e1',
          inverse: '#ffffff',
        },

        // Bordures B2B
        'b2b-border': {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          medium: '#cbd5e1',
          dark: '#94a3b8',
        },

        // ===== PALETTE LEGACY (compatibilité) =====

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
        // Accent Hermes (legacy)
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
        // Palette neutre luxe (legacy)
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
        // Bordures (legacy)
        border: {
          DEFAULT: '#e2d8ce',
          light: '#f0ebe3',
          medium: '#d4c9bd',
          dark: '#b8a99a',
        },
      },
      fontFamily: {
        // B2B Professional - Inter for everything
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Legacy (compatibilité)
        serif: ['Playfair Display', 'Georgia', 'serif'],
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
        xs: '0.25rem',      // 4px
        soft: '0.5rem',     // 8px - aligned with mobile
        elegant: '0.75rem', // 12px - aligned with mobile (card radius)
        luxe: '1rem',       // 16px
        xl: '1.25rem',      // 20px - chip radius
        xxl: '1.5rem',      // 24px - modal radius
        pill: '1.75rem',    // 28px - pill button radius
      },
      fontSize: {
        // ===== B2B TYPOGRAPHY (optimisée lisibilité) =====
        'b2b-page-title': ['1.75rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'b2b-section-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.005em' }],
        'b2b-card-title': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        'b2b-body': ['0.875rem', { lineHeight: '1.25rem' }],
        'b2b-body-sm': ['0.8125rem', { lineHeight: '1.125rem' }],
        'b2b-caption': ['0.75rem', { lineHeight: '1rem' }],
        'b2b-label': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.025em' }],
        'b2b-price': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'b2b-price-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'b2b-price-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'b2b-sku': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'b2b-badge': ['0.6875rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.02em' }],

        // ===== LEGACY TYPOGRAPHY (compatibilité) =====
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

// ===== B2B DESIGN TOKENS =====
export const b2bTokens = {
  colors: {
    primary: {
      default: '#0059a1',
      light: '#eff6ff',
      dark: '#003d6d',
    },
    accent: {
      default: '#f67828',
      light: '#fff7ed',
      dark: '#c2410c',
    },
    success: {
      default: '#10b981',
      light: '#ecfdf5',
      dark: '#047857',
    },
    danger: {
      default: '#ef4444',
      light: '#fef2f2',
      dark: '#b91c1c',
    },
    warning: {
      default: '#f59e0b',
      light: '#fffbeb',
      dark: '#b45309',
    },
    info: {
      default: '#3b82f6',
      light: '#eff6ff',
      dark: '#1d4ed8',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      muted: '#e2e8f0',
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    border: {
      light: '#f1f5f9',
      default: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  radii: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  typography: {
    pageTitle: { size: 28, weight: 600, lineHeight: 32 },
    sectionTitle: { size: 20, weight: 600, lineHeight: 28 },
    cardTitle: { size: 16, weight: 500, lineHeight: 24 },
    body: { size: 14, weight: 400, lineHeight: 20 },
    bodySm: { size: 13, weight: 400, lineHeight: 18 },
    caption: { size: 12, weight: 400, lineHeight: 16 },
    label: { size: 12, weight: 500, lineHeight: 16 },
    price: { size: 18, weight: 600, lineHeight: 24 },
    priceLg: { size: 24, weight: 700, lineHeight: 32 },
  },
} as const;

// ===== LEGACY DESIGN TOKENS (compatibilité) =====
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 28,
    full: 9999,
  },
} as const;

export default baseConfig;
