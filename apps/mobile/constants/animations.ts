/**
 * Animation Configuration Constants
 * Luxury jewelry e-commerce - Premium feel animations
 */

import { Easing } from 'react-native-reanimated';

/**
 * Spring configurations for different animation contexts
 * Tuned for a premium, responsive feel
 */
export const springConfigs = {
  /** Responsive, snappy feel for button interactions */
  button: {
    damping: 15,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
  },

  /** Smooth, elegant transitions for number/text changes */
  number: {
    damping: 20,
    mass: 0.8,
    stiffness: 150,
  },

  /** Bouncy, celebratory feel for success states */
  celebration: {
    damping: 12,
    mass: 1,
    stiffness: 180,
  },

  /** Gentle, subtle for layout changes */
  gentle: {
    damping: 25,
    mass: 1,
    stiffness: 100,
  },

  /** Quick snap for micro-interactions */
  snap: {
    damping: 20,
    mass: 0.5,
    stiffness: 300,
  },
} as const;

/**
 * Timing configurations with custom easing curves
 */
export const timingConfigs = {
  /** Ultra-quick micro-interactions (150ms) */
  micro: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },

  /** Standard transitions (300ms) */
  standard: {
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },

  /** Slow, luxurious reveals (500ms) */
  elegant: {
    duration: 500,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  },

  /** Very slow for dramatic effect (800ms) */
  dramatic: {
    duration: 800,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  },
} as const;

/**
 * Animation durations in milliseconds
 */
export const durations = {
  instant: 0,
  micro: 150,
  fast: 200,
  normal: 300,
  slow: 500,
  dramatic: 800,
  reveal: 1000,
} as const;

/**
 * Pre-configured easing curves for common use cases
 */
export const easings = {
  /** Standard ease-out for most animations */
  standard: Easing.bezier(0.4, 0, 0.2, 1),

  /** Decelerate - quick start, slow end */
  decelerate: Easing.bezier(0, 0, 0.2, 1),

  /** Accelerate - slow start, quick end */
  accelerate: Easing.bezier(0.4, 0, 1, 1),

  /** Sharp - emphasis on the end */
  sharp: Easing.bezier(0.4, 0, 0.6, 1),

  /** Elegant - luxury feel with overshoot */
  elegant: Easing.bezier(0.16, 1, 0.3, 1),

  /** Bounce effect */
  bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

/**
 * Scale values for button press states
 */
export const scales = {
  pressed: 0.92,
  slightlyPressed: 0.96,
  normal: 1,
  expanded: 1.05,
  emphasized: 1.08,
} as const;

/**
 * Opacity values for various states
 */
export const opacities = {
  transparent: 0,
  subtle: 0.1,
  light: 0.3,
  medium: 0.5,
  heavy: 0.7,
  opaque: 1,
} as const;

/**
 * Success overlay animation timing
 */
export const successOverlayTiming = {
  backdropFadeIn: 200,
  circleScale: 300,
  checkmarkDraw: 400,
  textFadeIn: 300,
  textDelay: 200,
  particleBurst: 600,
  autoDismiss: 1500,
} as const;
