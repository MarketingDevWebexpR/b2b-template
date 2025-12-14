import type { Config } from 'tailwindcss';
import { baseConfig } from './base';

/**
 * Web-specific Tailwind configuration
 * Includes animations and CSS-specific features
 */
export const webConfig: Config = {
  content: [], // Will be set by consuming app
  presets: [baseConfig as Config],
  theme: {
    extend: {
      animation: {
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

export default webConfig;
