/**
 * Design Tokens
 * Centralized design system tokens for the Bijoux mobile app
 * All components should import colors, typography, spacing from here
 */

// =============================================================================
// COLORS
// =============================================================================

export const COLORS = {
  // Primary Brand Colors
  hermes: '#f67828',
  hermesDark: '#ea580c',
  hermesLight: '#fff7ed',
  hermesLightAlpha: 'rgba(246, 120, 40, 0.15)',

  // Background Colors
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  backgroundGlass: 'rgba(255, 252, 247, 0.85)',
  backgroundGlassStrong: 'rgba(255, 252, 247, 0.95)',

  // Text Colors
  charcoal: '#2b333f',
  textPrimary: '#2b333f',
  textSecondary: '#444444',
  textMuted: '#696969',

  // Neutral Colors
  white: '#ffffff',
  whiteTranslucent: 'rgba(255, 255, 255, 0.9)',
  stone: '#b8a99a',
  taupe: '#d4c9bd',
  sand: '#f0ebe3',
  gold: '#d4a574',

  // Border Colors
  border: '#e2d8ce',
  borderLight: '#f0ebe3',

  // Semantic Colors - Success
  success: '#059669',
  successDark: '#047857',
  successLight: '#ecfdf5',
  successGlow: 'rgba(5, 150, 105, 0.5)',

  // Semantic Colors - Error
  error: '#dc2626',
  errorLight: '#fef2f2',

  // Overlay Colors
  overlay: 'rgba(43, 51, 63, 0.6)',
  overlayDark: 'rgba(43, 51, 63, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Glow Colors
  accentGlow: 'rgba(246, 120, 40, 0.5)',
} as const;

// Type for COLORS keys
export type ColorKey = keyof typeof COLORS;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const FONTS = {
  // Display (Headlines, Titles)
  display: 'PlayfairDisplay-Regular',
  displayMedium: 'PlayfairDisplay-Medium',
  displaySemiBold: 'PlayfairDisplay-SemiBold',
  displayBold: 'PlayfairDisplay-Bold',

  // Body (Text, Labels, Buttons)
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
} as const;

export const FONT_SIZES = {
  // Display sizes
  hero: 40,
  title: 32,
  heading: 24,
  subheading: 20,
  sectionTitle: 18,

  // Body sizes
  large: 17,
  body: 15,
  small: 14,
  caption: 12,
  tiny: 11,
  micro: 10,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.2,   // For large headlines
  normal: 1.4,  // For body text
  relaxed: 1.6, // For readable paragraphs
} as const;

export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
  widest: 1.5,
} as const;

// =============================================================================
// SPACING
// =============================================================================

// 8-point grid spacing scale
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// Semantic spacing aliases
export const PADDING = {
  screen: SPACING.lg,      // 20 - standard screen padding
  card: SPACING.md,        // 16 - card internal padding
  section: SPACING.xl,     // 24 - section padding
  button: SPACING.md,      // 16 - button padding
  input: SPACING.sm,       // 12 - input padding
} as const;

export const GAP = {
  xs: SPACING.xs,   // 8
  sm: SPACING.sm,   // 12
  md: SPACING.md,   // 16
  lg: SPACING.lg,   // 20
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 28,     // For pill-shaped buttons
  round: 9999,  // For circular elements
} as const;

// Semantic radius aliases
export const BORDER_RADIUS = {
  button: RADIUS.pill,     // 28
  card: RADIUS.md,         // 12
  modal: RADIUS.xxl,       // 24
  input: RADIUS.md,        // 12
  chip: RADIUS.xl,         // 20
  avatar: RADIUS.round,    // circular
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  // Colored shadows for special effects
  hermesShadow: {
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Semantic shadow aliases
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string = COLORS.success, opacity: number = 0.4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: 20,
    elevation: 10,
  }),
} as const;

// =============================================================================
// SIZES
// =============================================================================

export const SIZES = {
  // Touch targets (minimum 44px for accessibility)
  touchTarget: 44,
  touchTargetSmall: 36,
  touchTargetLarge: 56,

  // Icons
  iconXs: 14,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  iconXxl: 48,

  // Avatar sizes
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  avatarXl: 88,

  // Button heights
  buttonSm: 36,
  buttonMd: 44,
  buttonLg: 52,
  buttonXl: 56,
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  overlay: 400,
  toast: 500,
} as const;

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

// Search components
export const SEARCH_TOKENS = {
  barHeight: 52,
  barBorderRadius: RADIUS.xxl,
  filterButtonSize: SIZES.touchTarget,
  scannerOverlayColor: COLORS.overlayDark,
} as const;

// Scanner components
export const SCANNER_TOKENS = {
  cornerSize: 24,
  cornerThickness: 3,
  scanLineHeight: 2,
  scanAreaMaxWidth: 280,
} as const;

// Cart components
export const CART_TOKENS = {
  itemImageSize: 100,
  itemImageRadius: RADIUS.md,
  freeShippingThreshold: 500,
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

// Default export for convenience
export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  LINE_HEIGHTS,
  LETTER_SPACING,
  SPACING,
  PADDING,
  GAP,
  RADIUS,
  BORDER_RADIUS,
  SHADOWS,
  SIZES,
  Z_INDEX,
  SEARCH_TOKENS,
  SCANNER_TOKENS,
  CART_TOKENS,
};
