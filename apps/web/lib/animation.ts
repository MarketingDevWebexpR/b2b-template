/**
 * Animation utilities for framer-motion
 * React 19 + framer-motion requires proper typing for ease arrays
 */

/** Standard easeOut curve - used for most UI animations */
export const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/** Standard easeInOut curve */
export const easeInOut = [0.4, 0, 0.2, 1] as [number, number, number, number];

/** Bounce effect */
export const easeBounce = [0.68, -0.55, 0.265, 1.55] as [number, number, number, number];

/** Quick in, slow out */
export const easeQuickOut = [0.19, 1, 0.22, 1] as [number, number, number, number];

/** Default transition config */
export const defaultTransition = {
  duration: 0.5,
  ease: easeOut,
};

/** Stagger children animation config */
export const staggerConfig = {
  staggerChildren: 0.05,
  delayChildren: 0.1,
};

/** Fade in up animation variant */
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
};

/** Fade in animation variant */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: easeOut },
  },
};

/** Scale in animation variant */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: defaultTransition,
  },
};
