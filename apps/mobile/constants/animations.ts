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
 * Success overlay animation timing (V1 - auto-dismiss)
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

/**
 * Success overlay animation timing (V2 - user-controlled dismiss)
 * Used by AddToCartSuccessOverlayV2 component
 * @deprecated Use flyToCartTiming instead
 */
export const successOverlayV2Timing = {
  // Entry sequence (total ~550ms)
  entry: {
    backdropFadeIn: 200,
    modalDelay: 100,
    modalDuration: 250,
    circleDelay: 150,
    checkmarkDelay: 250,
    checkmarkDuration: 150,
    contentBaseDelay: 300,
    contentDuration: 200,
    contentStagger: 50, // Between each content section
    particleDelay: 200,
    particleDuration: 500,
  },
  // Exit sequence (~250ms)
  exit: {
    duration: 200,
  },
  // No auto-dismiss - user must interact
  autoDismiss: null,
} as const;

/**
 * Fly-to-cart animation timing
 * Premium animation where product thumbnail flies from button to cart icon
 */
export const flyToCartTiming = {
  // Phase 1: Launch - thumbnail appears and scales up
  launch: {
    duration: 100,
    scaleFrom: 0.3,
    scaleTo: 0.8,
  },
  // Phase 2: Flight - follows Bezier curve path
  flight: {
    duration: 450,
    scaleFrom: 0.8,
    scaleTo: 0.35,
    rotation: -15, // Subtle rotation during flight
    curveHeight: 120, // How high the curve rises above start/end points
  },
  // Phase 3: Landing - fade out and trigger badge bounce
  landing: {
    duration: 150,
  },
  // Total animation time
  total: 700,
} as const;
