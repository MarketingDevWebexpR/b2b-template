import type { Config } from 'tailwindcss';

/**
 * Design System Unifié - Maison Bijoux B2B
 * E-commerce professionnel style Leroy Merlin avec identité luxe bijouterie
 */
export const baseConfig: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // ===== PALETTE E-COMMERCE PROFESSIONNELLE =====

        // Primaire - Gris neutre ultra-minimaliste (navigation, liens, éléments clés)
        primary: {
          DEFAULT: '#737373',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // Accent - Orange Hermès (CTAs, promotions, éléments d'action)
        accent: {
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

        // Or - Identité luxe bijouterie (badges premium, éléments prestigieux)
        gold: {
          DEFAULT: '#d4a84b',
          50: '#fdfaf3',
          100: '#fbf3e1',
          200: '#f6e5bf',
          300: '#efd292',
          400: '#e6bc65',
          500: '#d4a84b',
          600: '#c08c30',
          700: '#9d6f28',
          800: '#7d5726',
          900: '#674822',
        },

        // Succès - Vert (stock disponible, confirmations, livraison)
        success: {
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

        // Danger - Rouge (rupture stock, erreurs, alertes urgentes)
        danger: {
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

        // Warning - Orange/Jaune (stock faible, attention, promos)
        warning: {
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

        // Info - Bleu clair (informations, tips, aide)
        info: {
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

        // Promo - Rouge vif (promotions, soldes, offres spéciales)
        promo: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          dark: '#991b1b',
        },

        // ===== FONDS E-COMMERCE =====
        'surface': {
          DEFAULT: '#ffffff',
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          muted: '#e2e8f0',
          dark: '#1e293b',
          header: '#ffffff',
          nav: '#f8fafc',
          promo: '#1e293b',
        },

        // ===== TEXTE =====
        'content': {
          DEFAULT: '#1e293b',
          primary: '#1e293b',
          secondary: '#475569',
          muted: '#94a3b8',
          light: '#cbd5e1',
          inverse: '#ffffff',
          link: '#525252',
          'link-hover': '#171717',
        },

        // ===== BORDURES =====
        'stroke': {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          medium: '#cbd5e1',
          dark: '#94a3b8',
          focus: '#525252',
        },

        // ===== PALETTE LEGACY (compatibilité B2C) =====
        background: {
          DEFAULT: '#fffcf7',
          cream: '#fffcf7',
          beige: '#fcf7f1',
          warm: '#f6f1eb',
          sable: '#e2d8ce',
          muted: '#f8f5f0',
        },
        text: {
          DEFAULT: '#2b333f',
          primary: '#2b333f',
          secondary: '#444444',
          muted: '#696969',
          light: '#8b8b8b',
          inverse: '#fffcf7',
        },
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
        border: {
          DEFAULT: '#e2d8ce',
          light: '#f0ebe3',
          medium: '#d4c9bd',
          dark: '#b8a99a',
        },
      },
      fontFamily: {
        // E-commerce Professional
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Legacy (compatibilité B2C)
        serif: ['DM Serif Display', 'Playfair Display', 'Georgia', 'serif'],
        display: ['DM Serif Display', 'Cormorant Garamond', 'Georgia', 'serif'],
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
        // ===== E-COMMERCE TYPOGRAPHY =====
        // Hero & Display
        'hero-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '400', letterSpacing: '-0.02em' }],
        'hero': ['2.75rem', { lineHeight: '1.15', fontWeight: '400', letterSpacing: '-0.015em' }],
        'hero-sm': ['2rem', { lineHeight: '1.2', fontWeight: '400', letterSpacing: '-0.01em' }],

        // Section Titles
        'section-xl': ['2rem', { lineHeight: '1.25', fontWeight: '500', letterSpacing: '-0.01em' }],
        'section': ['1.5rem', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '-0.005em' }],
        'section-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],

        // Product & Card Titles
        'product-title': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'card-title': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'card-title-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],

        // Prices
        'price-hero': ['2.5rem', { lineHeight: '1', fontWeight: '700' }],
        'price-xl': ['1.75rem', { lineHeight: '1', fontWeight: '700' }],
        'price-lg': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'price': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'price-sm': ['1rem', { lineHeight: '1.3', fontWeight: '600' }],
        'price-xs': ['0.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'price-old': ['0.875rem', { lineHeight: '1.3', fontWeight: '400' }],

        // Body
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body': ['0.875rem', { lineHeight: '1.5' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],

        // UI Elements
        'nav': ['0.875rem', { lineHeight: '1', fontWeight: '500' }],
        'nav-sm': ['0.75rem', { lineHeight: '1', fontWeight: '500' }],
        'label': ['0.75rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.02em' }],
        'badge': ['0.6875rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.02em' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'overline': ['0.6875rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.1em' }],

        // ===== LEGACY TYPOGRAPHY (compatibilité B2C) =====
        'display-hero': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '300' }],
        'display-1': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '300' }],
        'display-2': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'heading-1': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '400' }],
        'heading-2': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'heading-3': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.005em', fontWeight: '500' }],
        'heading-4': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        'heading-5': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.005em', fontWeight: '500' }],
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
      default: '#737373',
      light: '#fafafa',
      dark: '#404040',
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
