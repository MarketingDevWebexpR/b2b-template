/**
 * Luxury Haptic Feedback System
 * =============================
 *
 * A world-class haptic feedback system designed for high-end jewelry e-commerce.
 * Every interaction is crafted to evoke the precision and elegance of fine jewelry.
 *
 * Design Philosophy:
 * - Subtle, refined feedback for navigation and browsing
 * - Confident, satisfying feedback for purchases and confirmations
 * - Delicate, precise feedback for selections (like handling precious gems)
 * - Signature luxury sequences that differentiate the brand experience
 *
 * @module haptics
 * @version 2.0.0
 */

import * as Haptics from 'expo-haptics';
import { Platform, AccessibilityInfo } from 'react-native';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Haptic intensity levels for different contexts
 * - subtle: Nearly imperceptible, for frequent/passive actions
 * - normal: Standard feedback, for most interactions
 * - strong: Pronounced feedback, for important confirmations
 */
export type HapticIntensity = 'subtle' | 'normal' | 'strong';

/**
 * Categories of haptic patterns for organizational clarity
 */
export type HapticCategory =
  | 'navigation'
  | 'button'
  | 'selection'
  | 'gesture'
  | 'feedback'
  | 'list'
  | 'form'
  | 'commerce'
  | 'premium';

/**
 * Impact feedback styles from expo-haptics
 */
export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';

/**
 * Notification feedback types from expo-haptics
 */
export type NotificationType = 'success' | 'warning' | 'error';

/**
 * A single step in a haptic sequence
 */
export interface HapticSequenceStep {
  /** Type of haptic feedback */
  type: 'impact' | 'selection' | 'notification' | 'pause';
  /** Impact style (if type is 'impact') */
  impactStyle?: ImpactStyle;
  /** Notification type (if type is 'notification') */
  notificationType?: NotificationType;
  /** Delay in milliseconds before executing this step */
  delayMs: number;
}

/**
 * Configuration for a single haptic pattern
 */
export interface HapticPatternConfig {
  /** Human-readable description for documentation */
  description: string;
  /** Category for organizational purposes */
  category: HapticCategory;
  /** The haptic execution type */
  type: 'impact' | 'selection' | 'notification' | 'sequence';
  /** Impact style (for impact type) */
  impactStyle?: ImpactStyle;
  /** Notification type (for notification type) */
  notificationType?: NotificationType;
  /** Sequence steps (for sequence type) */
  sequence?: HapticSequenceStep[];
  /** Custom debounce time in ms (default: 50ms) */
  debounceMs?: number;
  /** Whether this pattern is iOS-only (Android fallback provided) */
  iosOptimized?: boolean;
}

/**
 * All available haptic pattern keys
 */
export type HapticPatternKey = keyof typeof HAPTIC_PATTERNS;

/**
 * Options for the useHaptic hook
 */
export interface UseHapticOptions {
  /** Override global enabled state */
  enabled?: boolean;
  /** Default intensity for all patterns */
  defaultIntensity?: HapticIntensity;
  /** Respect system reduce motion setting */
  respectReduceMotion?: boolean;
}

/**
 * Return type for the useHaptic hook
 */
export interface UseHapticReturn {
  /** Trigger a specific haptic pattern */
  trigger: (pattern: HapticPatternKey, intensity?: HapticIntensity) => void;
  /** Trigger a custom haptic sequence */
  triggerSequence: (sequence: HapticSequenceStep[]) => Promise<void>;
  /** Trigger raw haptic types directly */
  triggerRaw: {
    impact: (style: ImpactStyle) => void;
    selection: () => void;
    notification: (type: NotificationType) => void;
  };
  /** Whether haptics are currently enabled */
  isEnabled: boolean;
  /** Toggle haptics on/off */
  setEnabled: (enabled: boolean) => void;
  /** Whether reduce motion is active */
  isReduceMotionEnabled: boolean;
}

/**
 * Options for the useHapticButton hook
 */
export interface UseHapticButtonOptions {
  /** Pattern to use (default: buttonPrimary) */
  pattern?: HapticPatternKey;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Original onPress handler */
  onPress?: () => void;
  /** Original onPressIn handler */
  onPressIn?: () => void;
  /** Haptic intensity */
  intensity?: HapticIntensity;
}

/**
 * Return type for useHapticButton hook
 */
export interface UseHapticButtonReturn {
  /** Handler for press in (triggers haptic) */
  onPressIn: () => void;
  /** Handler for press (calls original + haptic if configured) */
  onPress: () => void;
  /** Accessibility props to spread on the button */
  accessibilityProps: {
    accessibilityRole: 'button';
    accessibilityState: { disabled: boolean };
  };
}

/**
 * Gesture haptic configuration
 */
export interface GestureHapticConfig {
  /** Pattern for swipe left */
  swipeLeft?: HapticPatternKey;
  /** Pattern for swipe right */
  swipeRight?: HapticPatternKey;
  /** Pattern for swipe up */
  swipeUp?: HapticPatternKey;
  /** Pattern for swipe down */
  swipeDown?: HapticPatternKey;
  /** Pattern for long press */
  longPress?: HapticPatternKey;
  /** Pattern for pinch */
  pinch?: HapticPatternKey;
  /** Pattern for pull to refresh */
  pullToRefresh?: HapticPatternKey;
}

/**
 * Options for useHapticGesture hook
 */
export interface UseHapticGestureOptions extends GestureHapticConfig {
  /** Global debounce for all gestures */
  debounceMs?: number;
  /** Whether gestures are enabled */
  enabled?: boolean;
}

/**
 * Return type for useHapticGesture hook
 */
export interface UseHapticGestureReturn {
  /** Trigger haptic for a specific gesture */
  triggerGesture: (gesture: keyof GestureHapticConfig) => void;
  /** Individual gesture handlers */
  handlers: {
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onSwipeUp: () => void;
    onSwipeDown: () => void;
    onLongPress: () => void;
    onPinch: () => void;
    onPullToRefresh: () => void;
  };
}

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

/**
 * Default debounce time to prevent haptic spam
 */
export const DEFAULT_DEBOUNCE_MS = 50;

/**
 * Minimum time between haptic sequences
 */
export const SEQUENCE_COOLDOWN_MS = 100;

/**
 * Intensity multipliers for haptic patterns
 * Used to select appropriate impact style based on intensity level
 */
export const INTENSITY_MAP: Record<HapticIntensity, ImpactStyle> = {
  subtle: 'soft',
  normal: 'light',
  strong: 'medium',
} as const;

/**
 * Platform-specific configuration
 */
export const PLATFORM_CONFIG = {
  ios: {
    supportsAllStyles: true,
    supportsSequences: true,
    minSequenceDelay: 20,
  },
  android: {
    supportsAllStyles: false, // Limited Taptic Engine support
    supportsSequences: true,
    minSequenceDelay: 50, // Android needs longer delays
  },
  web: {
    supportsAllStyles: false,
    supportsSequences: false,
    minSequenceDelay: 0,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - NAVIGATION
// =============================================================================

/**
 * Navigation haptic patterns
 * Designed to be subtle and unobtrusive during browsing
 */
const NAVIGATION_PATTERNS = {
  /** Tab bar selection - delicate, precise */
  navigationTabSwitch: {
    description: 'Subtle feedback when switching bottom tabs',
    category: 'navigation' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Page transition - soft, elegant */
  navigationPageTransition: {
    description: 'Soft feedback during page transitions',
    category: 'navigation' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 150,
    iosOptimized: true,
  },

  /** Back navigation - light confirmation */
  navigationBack: {
    description: 'Light feedback when navigating back',
    category: 'navigation' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Drawer open - soft opening gesture */
  navigationDrawerOpen: {
    description: 'Soft feedback when opening navigation drawer',
    category: 'navigation' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'selection' as const, delayMs: 60 },
    ],
    debounceMs: 200,
  },

  /** Drawer close - matching close gesture */
  navigationDrawerClose: {
    description: 'Soft feedback when closing navigation drawer',
    category: 'navigation' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 200,
  },

  /** Modal present - elegant appearance */
  navigationModalPresent: {
    description: 'Elegant feedback when modal appears',
    category: 'navigation' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 200,
  },

  /** Modal dismiss - soft departure */
  navigationModalDismiss: {
    description: 'Soft feedback when modal dismisses',
    category: 'navigation' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 200,
  },

  /** Search focus - subtle attention */
  navigationSearchFocus: {
    description: 'Subtle feedback when focusing search',
    category: 'navigation' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - BUTTONS
// =============================================================================

/**
 * Button haptic patterns
 * Feedback intensity correlates with button importance
 */
const BUTTON_PATTERNS = {
  /** Primary CTA - confident, satisfying press */
  buttonPrimary: {
    description: 'Confident feedback for primary action buttons',
    category: 'button' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Secondary button - lighter touch */
  buttonSecondary: {
    description: 'Lighter feedback for secondary buttons',
    category: 'button' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Tertiary/text button - minimal feedback */
  buttonTertiary: {
    description: 'Minimal feedback for tertiary/text buttons',
    category: 'button' as const,
    type: 'selection' as const,
    debounceMs: 80,
  },

  /** Icon button - precise, delicate */
  buttonIcon: {
    description: 'Precise feedback for icon buttons',
    category: 'button' as const,
    type: 'selection' as const,
    debounceMs: 80,
  },

  /** Toggle switch on - satisfying activation */
  buttonToggleOn: {
    description: 'Satisfying feedback when toggle activates',
    category: 'button' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 40 },
    ],
    debounceMs: 150,
  },

  /** Toggle switch off - softer deactivation */
  buttonToggleOff: {
    description: 'Softer feedback when toggle deactivates',
    category: 'button' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 150,
  },

  /** Floating action button - prominent action */
  buttonFab: {
    description: 'Prominent feedback for floating action button',
    category: 'button' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Destructive button - warning feel */
  buttonDestructive: {
    description: 'Warning-like feedback for destructive actions',
    category: 'button' as const,
    type: 'impact' as const,
    impactStyle: 'rigid' as const,
    debounceMs: 100,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - SELECTION
// =============================================================================

/**
 * Selection haptic patterns
 * Precise, jewelry-like feedback for choices
 */
const SELECTION_PATTERNS = {
  /** Radio button select - precise click */
  selectionRadio: {
    description: 'Precise click for radio button selection',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Checkbox toggle - satisfying tick */
  selectionCheckbox: {
    description: 'Satisfying tick for checkbox toggle',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Dropdown open - soft expansion */
  selectionDropdownOpen: {
    description: 'Soft feedback when dropdown opens',
    category: 'selection' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Dropdown item select - precise selection */
  selectionDropdownItem: {
    description: 'Precise feedback when selecting dropdown item',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Picker wheel tick - rhythmic scrolling */
  selectionPickerTick: {
    description: 'Rhythmic tick during picker wheel scrolling',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 30,
  },

  /** Picker wheel settle - final selection */
  selectionPickerSettle: {
    description: 'Final feedback when picker wheel settles',
    category: 'selection' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Segment control switch */
  selectionSegment: {
    description: 'Feedback when switching segment control',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Color/variant swatch selection */
  selectionSwatch: {
    description: 'Precise feedback for swatch selection',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Size selection */
  selectionSize: {
    description: 'Feedback for size selection',
    category: 'selection' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - GESTURES
// =============================================================================

/**
 * Gesture haptic patterns
 * Dynamic feedback that responds to user movement
 */
const GESTURE_PATTERNS = {
  /** Swipe action initiated */
  gestureSwipeStart: {
    description: 'Feedback when swipe gesture begins',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Swipe threshold reached */
  gestureSwipeThreshold: {
    description: 'Feedback when swipe reaches action threshold',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Swipe action completed */
  gestureSwipeComplete: {
    description: 'Feedback when swipe action completes',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Pull to refresh trigger */
  gesturePullRefreshTrigger: {
    description: 'Feedback when pull-to-refresh triggers',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 200,
  },

  /** Pull to refresh complete */
  gesturePullRefreshComplete: {
    description: 'Feedback when pull-to-refresh completes',
    category: 'gesture' as const,
    type: 'notification' as const,
    notificationType: 'success' as const,
    debounceMs: 200,
  },

  /** Long press initiated */
  gestureLongPressStart: {
    description: 'Feedback when long press begins',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Long press threshold reached */
  gestureLongPressActivate: {
    description: 'Feedback when long press activates',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Pinch zoom feedback */
  gesturePinchZoom: {
    description: 'Subtle feedback during pinch zoom',
    category: 'gesture' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Double tap */
  gestureDoubleTap: {
    description: 'Feedback for double tap gesture',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Pan/drag start */
  gesturePanStart: {
    description: 'Feedback when pan/drag begins',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Pan/drag end */
  gesturePanEnd: {
    description: 'Feedback when pan/drag ends',
    category: 'gesture' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - FEEDBACK (NOTIFICATIONS)
// =============================================================================

/**
 * Feedback/notification haptic patterns
 * System-level feedback for user actions
 */
const FEEDBACK_PATTERNS = {
  /** Success notification - celebration */
  feedbackSuccess: {
    description: 'Celebratory feedback for successful actions',
    category: 'feedback' as const,
    type: 'notification' as const,
    notificationType: 'success' as const,
    debounceMs: 200,
  },

  /** Error notification - attention required */
  feedbackError: {
    description: 'Attention-grabbing feedback for errors',
    category: 'feedback' as const,
    type: 'notification' as const,
    notificationType: 'error' as const,
    debounceMs: 200,
  },

  /** Warning notification - caution */
  feedbackWarning: {
    description: 'Cautionary feedback for warnings',
    category: 'feedback' as const,
    type: 'notification' as const,
    notificationType: 'warning' as const,
    debounceMs: 200,
  },

  /** Info notification - gentle attention */
  feedbackInfo: {
    description: 'Gentle feedback for informational notices',
    category: 'feedback' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 200,
  },

  /** Toast appear */
  feedbackToast: {
    description: 'Subtle feedback when toast appears',
    category: 'feedback' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 200,
  },

  /** Badge update */
  feedbackBadgeUpdate: {
    description: 'Subtle feedback for badge count update',
    category: 'feedback' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - LIST INTERACTIONS
// =============================================================================

/**
 * List haptic patterns
 * Feedback for list-based interactions
 */
const LIST_PATTERNS = {
  /** Item selection in list */
  listItemSelect: {
    description: 'Feedback when selecting a list item',
    category: 'list' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Item press (before selection) */
  listItemPress: {
    description: 'Feedback when pressing a list item',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 50,
  },

  /** Reorder drag start */
  listReorderStart: {
    description: 'Feedback when starting to reorder item',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Reorder position change */
  listReorderMove: {
    description: 'Feedback when item moves position during reorder',
    category: 'list' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Reorder drag end */
  listReorderEnd: {
    description: 'Feedback when reorder completes',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Delete swipe reveal */
  listDeleteReveal: {
    description: 'Feedback when delete action reveals',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Delete swipe confirm */
  listDeleteConfirm: {
    description: 'Feedback when delete action confirms',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'rigid' as const,
    debounceMs: 100,
  },

  /** Scroll bounce at boundary */
  listScrollBoundary: {
    description: 'Feedback when scrolling hits boundary',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 200,
  },

  /** Section header reached during scroll */
  listSectionReached: {
    description: 'Subtle feedback when passing section header',
    category: 'list' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Infinite scroll load more */
  listLoadMore: {
    description: 'Feedback when loading more items',
    category: 'list' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 300,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - FORM INTERACTIONS
// =============================================================================

/**
 * Form haptic patterns
 * Feedback for form inputs and validation
 */
const FORM_PATTERNS = {
  /** Input field focus */
  formInputFocus: {
    description: 'Subtle feedback when focusing input field',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Input field blur */
  formInputBlur: {
    description: 'Subtle feedback when blurring input field',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },

  /** Text input character (for special fields) */
  formInputCharacter: {
    description: 'Very subtle feedback for character input',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 30,
  },

  /** Validation success */
  formValidationSuccess: {
    description: 'Satisfying feedback for valid input',
    category: 'form' as const,
    type: 'notification' as const,
    notificationType: 'success' as const,
    debounceMs: 200,
  },

  /** Validation error */
  formValidationError: {
    description: 'Attention feedback for invalid input',
    category: 'form' as const,
    type: 'notification' as const,
    notificationType: 'error' as const,
    debounceMs: 200,
  },

  /** Field-level validation pass */
  formFieldValid: {
    description: 'Subtle success for field validation',
    category: 'form' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Field-level validation fail */
  formFieldInvalid: {
    description: 'Warning for field validation fail',
    category: 'form' as const,
    type: 'notification' as const,
    notificationType: 'warning' as const,
    debounceMs: 100,
  },

  /** Form submission initiated */
  formSubmitStart: {
    description: 'Feedback when form submission begins',
    category: 'form' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 200,
  },

  /** Form submission success */
  formSubmitSuccess: {
    description: 'Celebratory feedback for successful submission',
    category: 'form' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 150 },
    ],
    debounceMs: 300,
  },

  /** Form submission error */
  formSubmitError: {
    description: 'Error feedback for failed submission',
    category: 'form' as const,
    type: 'notification' as const,
    notificationType: 'error' as const,
    debounceMs: 200,
  },

  /** Stepper increment */
  formStepperIncrement: {
    description: 'Feedback for stepper increment',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Stepper decrement */
  formStepperDecrement: {
    description: 'Feedback for stepper decrement',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Slider value change */
  formSliderTick: {
    description: 'Tick feedback during slider drag',
    category: 'form' as const,
    type: 'selection' as const,
    debounceMs: 30,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - COMMERCE
// =============================================================================

/**
 * Commerce haptic patterns
 * Specialized feedback for shopping interactions
 */
const COMMERCE_PATTERNS = {
  /** Add to cart press */
  commerceAddToCartPress: {
    description: 'Initial press feedback for add to cart',
    category: 'commerce' as const,
    type: 'impact' as const,
    impactStyle: 'medium' as const,
    debounceMs: 100,
  },

  /** Add to cart success - signature luxury moment */
  commerceAddToCartSuccess: {
    description: 'Luxurious success feedback when item added to cart',
    category: 'commerce' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 80 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
    ],
    debounceMs: 300,
  },

  /** Remove from cart */
  commerceRemoveFromCart: {
    description: 'Feedback when removing item from cart',
    category: 'commerce' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 100,
  },

  /** Quantity increase */
  commerceQuantityIncrease: {
    description: 'Feedback when increasing quantity',
    category: 'commerce' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Quantity decrease */
  commerceQuantityDecrease: {
    description: 'Feedback when decreasing quantity',
    category: 'commerce' as const,
    type: 'selection' as const,
    debounceMs: 50,
  },

  /** Quantity at minimum */
  commerceQuantityMinimum: {
    description: 'Warning when quantity at minimum',
    category: 'commerce' as const,
    type: 'notification' as const,
    notificationType: 'warning' as const,
    debounceMs: 100,
  },

  /** Quantity at maximum */
  commerceQuantityMaximum: {
    description: 'Warning when quantity at maximum',
    category: 'commerce' as const,
    type: 'notification' as const,
    notificationType: 'warning' as const,
    debounceMs: 100,
  },

  /** Wishlist add */
  commerceWishlistAdd: {
    description: 'Delightful feedback when adding to wishlist',
    category: 'commerce' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 80 },
    ],
    debounceMs: 200,
  },

  /** Wishlist remove */
  commerceWishlistRemove: {
    description: 'Feedback when removing from wishlist',
    category: 'commerce' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 100,
  },

  /** Checkout step advance */
  commerceCheckoutStep: {
    description: 'Milestone feedback for checkout progress',
    category: 'commerce' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 0 },
      { type: 'selection' as const, delayMs: 50 },
    ],
    debounceMs: 200,
  },

  /** Checkout complete - signature celebration */
  commerceCheckoutComplete: {
    description: 'Grand celebration for completed purchase',
    category: 'commerce' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 100 },
      { type: 'impact' as const, impactStyle: 'medium' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 80 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
    ],
    debounceMs: 500,
  },

  /** Payment processing */
  commercePaymentProcessing: {
    description: 'Rhythmic feedback during payment processing',
    category: 'commerce' as const,
    type: 'selection' as const,
    debounceMs: 500,
  },

  /** Coupon applied successfully */
  commerceCouponApplied: {
    description: 'Satisfying feedback for successful coupon',
    category: 'commerce' as const,
    type: 'notification' as const,
    notificationType: 'success' as const,
    debounceMs: 200,
  },

  /** Coupon invalid */
  commerceCouponInvalid: {
    description: 'Error feedback for invalid coupon',
    category: 'commerce' as const,
    type: 'notification' as const,
    notificationType: 'error' as const,
    debounceMs: 200,
  },

  /** Free shipping threshold reached */
  commerceFreeShippingReached: {
    description: 'Celebration when free shipping unlocked',
    category: 'commerce' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 100 },
    ],
    debounceMs: 300,
  },

  /** Product out of stock */
  commerceOutOfStock: {
    description: 'Warning feedback for out of stock',
    category: 'commerce' as const,
    type: 'notification' as const,
    notificationType: 'warning' as const,
    debounceMs: 200,
  },
} as const;

// =============================================================================
// HAPTIC PATTERNS - PREMIUM/LUXURY
// =============================================================================

/**
 * Premium haptic patterns
 * Signature luxury experiences unique to the jewelry brand
 */
const PREMIUM_PATTERNS = {
  /** Elegant confirmation - like setting a precious gem */
  premiumElegantConfirm: {
    description: 'Signature elegant confirmation pattern',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 120 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
    ],
    debounceMs: 300,
    iosOptimized: true,
  },

  /** Luxury success - premium celebration */
  premiumLuxurySuccess: {
    description: 'Premium success celebration pattern',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 0 },
      { type: 'selection' as const, delayMs: 60 },
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 60 },
    ],
    debounceMs: 300,
    iosOptimized: true,
  },

  /** Premium transition - silk-like smoothness */
  premiumSilkTransition: {
    description: 'Ultra-smooth transition feedback',
    category: 'premium' as const,
    type: 'impact' as const,
    impactStyle: 'soft' as const,
    debounceMs: 150,
    iosOptimized: true,
  },

  /** Jewelry select - precise gem selection */
  premiumJewelrySelect: {
    description: 'Precise selection like choosing a gem',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'selection' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 40 },
    ],
    debounceMs: 100,
  },

  /** Cart magic - adding luxury to cart */
  premiumCartMagic: {
    description: 'Magical feedback when adding luxury item to cart',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'medium' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 60 },
      { type: 'selection' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 80 },
      { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
    ],
    debounceMs: 400,
    iosOptimized: true,
  },

  /** Checkout milestone - journey progress */
  premiumCheckoutMilestone: {
    description: 'Milestone moment in checkout journey',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 0 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 100 },
    ],
    debounceMs: 250,
  },

  /** VIP moment - exclusive interaction */
  premiumVipMoment: {
    description: 'Exclusive VIP-worthy feedback',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'selection' as const, delayMs: 80 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 80 },
      { type: 'selection' as const, delayMs: 80 },
    ],
    debounceMs: 400,
    iosOptimized: true,
  },

  /** Unboxing anticipation - reveal moment */
  premiumUnboxing: {
    description: 'Anticipation-building reveal feedback',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 150 },
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 150 },
      { type: 'impact' as const, impactStyle: 'medium' as const, delayMs: 0 },
    ],
    debounceMs: 600,
    iosOptimized: true,
  },

  /** Subtle heartbeat - for loading states */
  premiumHeartbeat: {
    description: 'Subtle heartbeat for premium loading states',
    category: 'premium' as const,
    type: 'sequence' as const,
    sequence: [
      { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
      { type: 'pause' as const, delayMs: 100 },
      { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 0 },
    ],
    debounceMs: 800,
  },

  /** Price reveal - dramatic unveiling */
  premiumPriceReveal: {
    description: 'Dramatic feedback for price reveal',
    category: 'premium' as const,
    type: 'impact' as const,
    impactStyle: 'light' as const,
    debounceMs: 200,
  },

  /** Image gallery swipe - smooth browsing */
  premiumGallerySwipe: {
    description: 'Smooth feedback during gallery navigation',
    category: 'premium' as const,
    type: 'selection' as const,
    debounceMs: 80,
  },

  /** 3D model rotation - interactive feedback */
  premiumModelRotation: {
    description: 'Feedback during 3D model interaction',
    category: 'premium' as const,
    type: 'selection' as const,
    debounceMs: 100,
  },
} as const;

// =============================================================================
// COMBINED HAPTIC PATTERNS
// =============================================================================

/**
 * All haptic patterns combined
 * Use HAPTIC_PATTERNS.patternName for type-safe access
 */
export const HAPTIC_PATTERNS = {
  // Navigation
  ...NAVIGATION_PATTERNS,
  // Buttons
  ...BUTTON_PATTERNS,
  // Selections
  ...SELECTION_PATTERNS,
  // Gestures
  ...GESTURE_PATTERNS,
  // Feedback
  ...FEEDBACK_PATTERNS,
  // Lists
  ...LIST_PATTERNS,
  // Forms
  ...FORM_PATTERNS,
  // Commerce
  ...COMMERCE_PATTERNS,
  // Premium
  ...PREMIUM_PATTERNS,
} as const;

// =============================================================================
// CORE HAPTIC EXECUTION FUNCTIONS
// =============================================================================

/** Timestamp of last haptic execution per pattern */
const lastHapticTimes: Map<string, number> = new Map();

/** Active sequence cancellation flags */
const activeSequences: Map<string, boolean> = new Map();

/** Global haptic enabled state */
let globalHapticsEnabled = true;

/** Cached reduce motion preference */
let cachedReduceMotion: boolean | null = null;

/**
 * Check if reduce motion is enabled (with caching)
 */
const checkReduceMotion = async (): Promise<boolean> => {
  if (cachedReduceMotion !== null) {
    return cachedReduceMotion;
  }
  try {
    cachedReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    return cachedReduceMotion;
  } catch {
    return false;
  }
};

/**
 * Subscribe to reduce motion changes
 */
const subscribeToReduceMotion = (callback: (isEnabled: boolean) => void) => {
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    (isEnabled) => {
      cachedReduceMotion = isEnabled;
      callback(isEnabled);
    }
  );
  return () => subscription.remove();
};

/**
 * Convert impact style string to expo-haptics enum
 */
const getImpactStyle = (style: ImpactStyle): Haptics.ImpactFeedbackStyle => {
  const styleMap: Record<ImpactStyle, Haptics.ImpactFeedbackStyle> = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
    soft: Haptics.ImpactFeedbackStyle.Soft,
    rigid: Haptics.ImpactFeedbackStyle.Rigid,
  };
  return styleMap[style];
};

/**
 * Convert notification type string to expo-haptics enum
 */
const getNotificationType = (type: NotificationType): Haptics.NotificationFeedbackType => {
  const typeMap: Record<NotificationType, Haptics.NotificationFeedbackType> = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  };
  return typeMap[type];
};

/**
 * Execute a single haptic step
 */
const executeHapticStep = async (step: HapticSequenceStep): Promise<void> => {
  if (Platform.OS === 'web') return;

  switch (step.type) {
    case 'impact':
      if (step.impactStyle) {
        await Haptics.impactAsync(getImpactStyle(step.impactStyle));
      }
      break;
    case 'selection':
      await Haptics.selectionAsync();
      break;
    case 'notification':
      if (step.notificationType) {
        await Haptics.notificationAsync(getNotificationType(step.notificationType));
      }
      break;
    case 'pause':
      // Just wait, no haptic
      break;
  }
};

/**
 * Execute a haptic sequence with proper timing
 */
const executeHapticSequence = async (
  sequence: HapticSequenceStep[],
  sequenceId: string
): Promise<void> => {
  if (Platform.OS === 'web') return;

  activeSequences.set(sequenceId, true);

  const platformConfig = Platform.OS === 'ios'
    ? PLATFORM_CONFIG.ios
    : PLATFORM_CONFIG.android;

  for (const step of sequence) {
    // Check if sequence was cancelled
    if (!activeSequences.get(sequenceId)) {
      break;
    }

    // Apply minimum delay for platform
    const effectiveDelay = Math.max(step.delayMs, platformConfig.minSequenceDelay);

    if (effectiveDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, effectiveDelay));
    }

    // Check again after delay
    if (!activeSequences.get(sequenceId)) {
      break;
    }

    await executeHapticStep(step);
  }

  activeSequences.delete(sequenceId);
};

/**
 * Cancel an active haptic sequence
 */
export const cancelHapticSequence = (sequenceId: string): void => {
  activeSequences.set(sequenceId, false);
};

/**
 * Cancel all active haptic sequences
 */
export const cancelAllHapticSequences = (): void => {
  activeSequences.forEach((_, key) => {
    activeSequences.set(key, false);
  });
};

/**
 * Apply intensity modifier to a pattern
 */
const applyIntensity = (
  pattern: HapticPatternConfig,
  intensity: HapticIntensity
): HapticPatternConfig => {
  if (pattern.type !== 'impact' || !pattern.impactStyle) {
    return pattern;
  }

  // Map intensity to impact style
  const intensityStyleMap: Record<HapticIntensity, Record<ImpactStyle, ImpactStyle>> = {
    subtle: {
      light: 'soft',
      medium: 'light',
      heavy: 'medium',
      soft: 'soft',
      rigid: 'light',
    },
    normal: {
      light: 'light',
      medium: 'medium',
      heavy: 'heavy',
      soft: 'soft',
      rigid: 'rigid',
    },
    strong: {
      light: 'medium',
      medium: 'heavy',
      heavy: 'heavy',
      soft: 'light',
      rigid: 'rigid',
    },
  };

  const newStyle = intensityStyleMap[intensity][pattern.impactStyle];

  return {
    ...pattern,
    impactStyle: newStyle,
  };
};

// =============================================================================
// PUBLIC API - TRIGGER FUNCTIONS
// =============================================================================

/**
 * Trigger a haptic pattern by key
 *
 * @example
 * ```typescript
 * await triggerHaptic('buttonPrimary');
 * await triggerHaptic('commerceAddToCartSuccess', 'strong');
 * ```
 */
export const triggerHaptic = async (
  patternKey: HapticPatternKey,
  intensity: HapticIntensity = 'normal'
): Promise<void> => {
  // Skip on web or if disabled
  if (Platform.OS === 'web' || !globalHapticsEnabled) return;

  // Check reduce motion preference
  const reduceMotion = await checkReduceMotion();
  if (reduceMotion) return;

  const basePattern = HAPTIC_PATTERNS[patternKey];
  if (!basePattern) {
    console.warn(`[Haptics] Unknown pattern: ${patternKey}`);
    return;
  }

  // Apply debouncing
  const debounceMs = basePattern.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  const now = Date.now();
  const lastTime = lastHapticTimes.get(patternKey) ?? 0;

  if (now - lastTime < debounceMs) {
    return;
  }

  lastHapticTimes.set(patternKey, now);

  // Apply intensity
  const pattern = applyIntensity(basePattern, intensity);

  // Execute based on type
  try {
    switch (pattern.type) {
      case 'impact':
        if (pattern.impactStyle) {
          await Haptics.impactAsync(getImpactStyle(pattern.impactStyle));
        }
        break;

      case 'selection':
        await Haptics.selectionAsync();
        break;

      case 'notification':
        if (pattern.notificationType) {
          await Haptics.notificationAsync(getNotificationType(pattern.notificationType));
        }
        break;

      case 'sequence':
        if (pattern.sequence) {
          const sequenceId = `${patternKey}-${now}`;
          await executeHapticSequence(pattern.sequence, sequenceId);
        }
        break;
    }
  } catch (error) {
    // Silently fail - haptics should never break the app
    if (__DEV__) {
      console.warn(`[Haptics] Failed to execute pattern: ${patternKey}`, error);
    }
  }
};

/**
 * Trigger a custom haptic sequence
 *
 * @example
 * ```typescript
 * await triggerCustomSequence([
 *   { type: 'impact', impactStyle: 'soft', delayMs: 0 },
 *   { type: 'pause', delayMs: 100 },
 *   { type: 'impact', impactStyle: 'light', delayMs: 0 },
 * ]);
 * ```
 */
export const triggerCustomSequence = async (
  sequence: HapticSequenceStep[],
  debounceMs: number = SEQUENCE_COOLDOWN_MS
): Promise<void> => {
  if (Platform.OS === 'web' || !globalHapticsEnabled) return;

  const reduceMotion = await checkReduceMotion();
  if (reduceMotion) return;

  const sequenceKey = 'custom-sequence';
  const now = Date.now();
  const lastTime = lastHapticTimes.get(sequenceKey) ?? 0;

  if (now - lastTime < debounceMs) {
    return;
  }

  lastHapticTimes.set(sequenceKey, now);

  const sequenceId = `custom-${now}`;
  await executeHapticSequence(sequence, sequenceId);
};

/**
 * Trigger raw haptic impact
 */
export const triggerImpact = async (style: ImpactStyle = 'light'): Promise<void> => {
  if (Platform.OS === 'web' || !globalHapticsEnabled) return;

  const reduceMotion = await checkReduceMotion();
  if (reduceMotion) return;

  try {
    await Haptics.impactAsync(getImpactStyle(style));
  } catch {
    // Silently fail
  }
};

/**
 * Trigger raw haptic selection
 */
export const triggerSelection = async (): Promise<void> => {
  if (Platform.OS === 'web' || !globalHapticsEnabled) return;

  const reduceMotion = await checkReduceMotion();
  if (reduceMotion) return;

  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently fail
  }
};

/**
 * Trigger raw haptic notification
 */
export const triggerNotification = async (type: NotificationType = 'success'): Promise<void> => {
  if (Platform.OS === 'web' || !globalHapticsEnabled) return;

  const reduceMotion = await checkReduceMotion();
  if (reduceMotion) return;

  try {
    await Haptics.notificationAsync(getNotificationType(type));
  } catch {
    // Silently fail
  }
};

// =============================================================================
// GLOBAL CONFIGURATION
// =============================================================================

/**
 * Enable or disable haptics globally
 */
export const setHapticsEnabled = (enabled: boolean): void => {
  globalHapticsEnabled = enabled;
  if (!enabled) {
    cancelAllHapticSequences();
  }
};

/**
 * Check if haptics are enabled globally
 */
export const isHapticsEnabled = (): boolean => globalHapticsEnabled;

/**
 * Clear the haptic debounce cache
 * Useful when navigating to a new screen
 */
export const clearHapticDebounceCache = (): void => {
  lastHapticTimes.clear();
};

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * Hook for triggering haptic feedback
 *
 * @example
 * ```typescript
 * const { trigger, isEnabled } = useHaptic();
 *
 * const handlePress = () => {
 *   trigger('buttonPrimary');
 *   // ... handle press
 * };
 * ```
 */
export const useHaptic = (options: UseHapticOptions = {}): UseHapticReturn => {
  const {
    enabled = true,
    defaultIntensity = 'normal',
    respectReduceMotion = true,
  } = options;

  const [isEnabled, setIsEnabledState] = useState(enabled && globalHapticsEnabled);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  // Check reduce motion on mount
  useEffect(() => {
    if (respectReduceMotion) {
      checkReduceMotion().then(setIsReduceMotionEnabled);
      return subscribeToReduceMotion(setIsReduceMotionEnabled);
    }
  }, [respectReduceMotion]);

  // Sync with global state
  useEffect(() => {
    setIsEnabledState(enabled && globalHapticsEnabled);
  }, [enabled]);

  const setEnabled = useCallback((value: boolean) => {
    setIsEnabledState(value);
  }, []);

  const trigger = useCallback(
    (pattern: HapticPatternKey, intensity?: HapticIntensity) => {
      if (!isEnabled || (respectReduceMotion && isReduceMotionEnabled)) return;
      triggerHaptic(pattern, intensity ?? defaultIntensity);
    },
    [isEnabled, isReduceMotionEnabled, respectReduceMotion, defaultIntensity]
  );

  const triggerSequence = useCallback(
    async (sequence: HapticSequenceStep[]) => {
      if (!isEnabled || (respectReduceMotion && isReduceMotionEnabled)) return;
      await triggerCustomSequence(sequence);
    },
    [isEnabled, isReduceMotionEnabled, respectReduceMotion]
  );

  const triggerRaw = useMemo(
    () => ({
      impact: (style: ImpactStyle) => {
        if (!isEnabled || (respectReduceMotion && isReduceMotionEnabled)) return;
        triggerImpact(style);
      },
      selection: () => {
        if (!isEnabled || (respectReduceMotion && isReduceMotionEnabled)) return;
        triggerSelection();
      },
      notification: (type: NotificationType) => {
        if (!isEnabled || (respectReduceMotion && isReduceMotionEnabled)) return;
        triggerNotification(type);
      },
    }),
    [isEnabled, isReduceMotionEnabled, respectReduceMotion]
  );

  return {
    trigger,
    triggerSequence,
    triggerRaw,
    isEnabled,
    setEnabled,
    isReduceMotionEnabled,
  };
};

/**
 * Hook for adding haptic feedback to buttons
 *
 * @example
 * ```typescript
 * const { onPressIn, onPress, accessibilityProps } = useHapticButton({
 *   pattern: 'buttonPrimary',
 *   onPress: handleSubmit,
 * });
 *
 * return (
 *   <Pressable
 *     onPressIn={onPressIn}
 *     onPress={onPress}
 *     {...accessibilityProps}
 *   >
 *     <Text>Submit</Text>
 *   </Pressable>
 * );
 * ```
 */
export const useHapticButton = (options: UseHapticButtonOptions = {}): UseHapticButtonReturn => {
  const {
    pattern = 'buttonPrimary',
    disabled = false,
    onPress: originalOnPress,
    onPressIn: originalOnPressIn,
    intensity = 'normal',
  } = options;

  const { trigger } = useHaptic();

  const onPressIn = useCallback(() => {
    if (!disabled) {
      trigger(pattern, intensity);
      originalOnPressIn?.();
    }
  }, [disabled, trigger, pattern, intensity, originalOnPressIn]);

  const onPress = useCallback(() => {
    if (!disabled) {
      originalOnPress?.();
    }
  }, [disabled, originalOnPress]);

  const accessibilityProps = useMemo(
    () => ({
      accessibilityRole: 'button' as const,
      accessibilityState: { disabled },
    }),
    [disabled]
  );

  return {
    onPressIn,
    onPress,
    accessibilityProps,
  };
};

/**
 * Hook for gesture-based haptic feedback
 *
 * @example
 * ```typescript
 * const { handlers, triggerGesture } = useHapticGesture({
 *   swipeLeft: 'gestureSwipeComplete',
 *   swipeRight: 'gestureSwipeComplete',
 *   longPress: 'gestureLongPressActivate',
 * });
 *
 * // Use with gesture handler
 * const onSwipeLeft = () => {
 *   handlers.onSwipeLeft();
 *   // Handle swipe
 * };
 * ```
 */
export const useHapticGesture = (options: UseHapticGestureOptions = {}): UseHapticGestureReturn => {
  const {
    swipeLeft = 'gestureSwipeComplete',
    swipeRight = 'gestureSwipeComplete',
    swipeUp = 'gestureSwipeThreshold',
    swipeDown = 'gestureSwipeThreshold',
    longPress = 'gestureLongPressActivate',
    pinch = 'gesturePinchZoom',
    pullToRefresh = 'gesturePullRefreshTrigger',
    debounceMs = 100,
    enabled = true,
  } = options;

  const { trigger } = useHaptic({ enabled });
  const lastTriggerRef = useRef<Map<string, number>>(new Map());

  const triggerWithDebounce = useCallback(
    (pattern: HapticPatternKey, gestureKey: string) => {
      const now = Date.now();
      const lastTime = lastTriggerRef.current.get(gestureKey) ?? 0;

      if (now - lastTime >= debounceMs) {
        lastTriggerRef.current.set(gestureKey, now);
        trigger(pattern);
      }
    },
    [trigger, debounceMs]
  );

  const triggerGesture = useCallback(
    (gesture: keyof GestureHapticConfig) => {
      const patternMap: Record<keyof GestureHapticConfig, HapticPatternKey | undefined> = {
        swipeLeft,
        swipeRight,
        swipeUp,
        swipeDown,
        longPress,
        pinch,
        pullToRefresh,
      };

      const pattern = patternMap[gesture];
      if (pattern) {
        triggerWithDebounce(pattern, gesture);
      }
    },
    [swipeLeft, swipeRight, swipeUp, swipeDown, longPress, pinch, pullToRefresh, triggerWithDebounce]
  );

  const handlers = useMemo(
    () => ({
      onSwipeLeft: () => triggerGesture('swipeLeft'),
      onSwipeRight: () => triggerGesture('swipeRight'),
      onSwipeUp: () => triggerGesture('swipeUp'),
      onSwipeDown: () => triggerGesture('swipeDown'),
      onLongPress: () => triggerGesture('longPress'),
      onPinch: () => triggerGesture('pinch'),
      onPullToRefresh: () => triggerGesture('pullToRefresh'),
    }),
    [triggerGesture]
  );

  return {
    triggerGesture,
    handlers,
  };
};

// =============================================================================
// LEGACY COMPATIBILITY LAYER
// =============================================================================

/**
 * Legacy haptic feedback object for backward compatibility
 * @deprecated Use triggerHaptic() or useHaptic() instead
 */
export const hapticFeedback = {
  /** @deprecated Use triggerHaptic('formStepperIncrement') */
  quantityButtonPress: () => triggerHaptic('formStepperIncrement'),

  /** @deprecated Use triggerHaptic('commerceQuantityIncrease') */
  quantityChange: () => triggerHaptic('commerceQuantityIncrease'),

  /** @deprecated Use triggerHaptic('commerceAddToCartPress') */
  addToCartPress: () => triggerHaptic('commerceAddToCartPress'),

  /** @deprecated Use triggerHaptic('commerceAddToCartSuccess') */
  addToCartSuccess: () => triggerHaptic('commerceAddToCartSuccess'),

  /** @deprecated Use triggerHaptic('commerceQuantityMinimum') */
  quantityAtMinimum: () => triggerHaptic('commerceQuantityMinimum'),

  /** @deprecated Use triggerHaptic('feedbackError') */
  error: () => triggerHaptic('feedbackError'),

  /** @deprecated Use triggerHaptic('premiumElegantConfirm') */
  softConfirm: () => triggerHaptic('premiumElegantConfirm'),

  /** @deprecated Use triggerImpact('rigid') */
  rigidConfirm: () => triggerImpact('rigid'),

  /** @deprecated Use triggerImpact('heavy') */
  heavyImpact: () => triggerImpact('heavy'),

  /** @deprecated Use triggerHaptic('navigationSearchFocus') */
  voiceSearchStart: () => triggerHaptic('navigationSearchFocus'),

  /** @deprecated Use triggerHaptic('feedbackSuccess') */
  voiceSearchSuccess: () => triggerHaptic('feedbackSuccess'),

  /** @deprecated Use triggerHaptic('feedbackError') */
  voiceSearchError: () => triggerHaptic('feedbackError'),

  /** @deprecated Use triggerHaptic('selectionSegment') */
  voiceSearchStateChange: () => triggerHaptic('selectionSegment'),

  // New legacy mappings for recently added haptics
  /** @deprecated Use triggerHaptic('buttonPrimary') */
  buttonPress: () => triggerHaptic('buttonPrimary'),

  /** @deprecated Use triggerHaptic('premiumSilkTransition') */
  softPress: () => triggerHaptic('premiumSilkTransition'),

  /** @deprecated Use triggerHaptic('navigationTabSwitch') */
  tabSwitch: () => triggerHaptic('navigationTabSwitch'),

  /** @deprecated Use triggerHaptic('navigationBack') */
  navigation: () => triggerHaptic('navigationBack'),

  /** @deprecated Use triggerHaptic('buttonToggleOn') */
  toggleSwitch: () => triggerHaptic('buttonToggleOn'),

  /** @deprecated Use triggerHaptic('selectionRadio') */
  selection: () => triggerHaptic('selectionRadio'),

  /** @deprecated Use triggerHaptic('feedbackSuccess') */
  success: () => triggerHaptic('feedbackSuccess'),

  /** @deprecated Use triggerHaptic('feedbackWarning') */
  warning: () => triggerHaptic('feedbackWarning'),

  /** @deprecated Use triggerHaptic('gesturePullRefreshTrigger') */
  pullRefresh: () => triggerHaptic('gesturePullRefreshTrigger'),

  /** @deprecated Use triggerHaptic('listItemSelect') */
  listItemSelect: () => triggerHaptic('listItemSelect'),

  /** @deprecated Use triggerHaptic('formSubmitStart') */
  formSubmit: () => triggerHaptic('formSubmitStart'),
} as const;

/**
 * Legacy debounced haptic function
 * @deprecated Use triggerHaptic() which has built-in debouncing
 */
export const debouncedHaptic = (
  hapticFn: () => Promise<void>,
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): void => {
  const key = 'legacy-debounced';
  const now = Date.now();
  const lastTime = lastHapticTimes.get(key) ?? 0;

  if (now - lastTime >= debounceMs) {
    lastHapticTimes.set(key, now);
    hapticFn();
  }
};

// =============================================================================
// PATTERN HELPERS & UTILITIES
// =============================================================================

/**
 * Get all patterns in a specific category
 */
export const getPatternsByCategory = (category: HapticCategory): HapticPatternKey[] => {
  return (Object.entries(HAPTIC_PATTERNS) as [HapticPatternKey, HapticPatternConfig][])
    .filter(([_, config]) => config.category === category)
    .map(([key]) => key);
};

/**
 * Get pattern configuration by key
 */
export const getPatternConfig = (key: HapticPatternKey): HapticPatternConfig => {
  return HAPTIC_PATTERNS[key];
};

/**
 * Check if platform supports sequences
 */
export const platformSupportsSequences = (): boolean => {
  if (Platform.OS === 'ios') return PLATFORM_CONFIG.ios.supportsSequences;
  if (Platform.OS === 'android') return PLATFORM_CONFIG.android.supportsSequences;
  return false;
};

/**
 * Check if platform supports all impact styles
 */
export const platformSupportsAllStyles = (): boolean => {
  if (Platform.OS === 'ios') return PLATFORM_CONFIG.ios.supportsAllStyles;
  return false;
};

// =============================================================================
// PREDEFINED SEQUENCES FOR COMMON USE CASES
// =============================================================================

/**
 * Predefined haptic sequences for common scenarios
 */
export const HAPTIC_SEQUENCES = {
  /** Double tap confirmation */
  doubleTap: [
    { type: 'selection' as const, delayMs: 0 },
    { type: 'selection' as const, delayMs: 80 },
  ],

  /** Triple pulse for important alerts */
  triplePulse: [
    { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 0 },
    { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 100 },
    { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 100 },
  ],

  /** Success crescendo */
  successCrescendo: [
    { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
    { type: 'impact' as const, impactStyle: 'light' as const, delayMs: 60 },
    { type: 'impact' as const, impactStyle: 'medium' as const, delayMs: 60 },
  ],

  /** Error shake */
  errorShake: [
    { type: 'impact' as const, impactStyle: 'rigid' as const, delayMs: 0 },
    { type: 'impact' as const, impactStyle: 'rigid' as const, delayMs: 100 },
  ],

  /** Smooth scroll tick */
  scrollTick: [
    { type: 'selection' as const, delayMs: 0 },
  ],

  /** Luxury reveal */
  luxuryReveal: [
    { type: 'impact' as const, impactStyle: 'soft' as const, delayMs: 0 },
    { type: 'pause' as const, delayMs: 200 },
    { type: 'notification' as const, notificationType: 'success' as const, delayMs: 0 },
  ],
} as const;

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  // Patterns
  HAPTIC_PATTERNS,
  HAPTIC_SEQUENCES,

  // Trigger functions
  triggerHaptic,
  triggerCustomSequence,
  triggerImpact,
  triggerSelection,
  triggerNotification,

  // Hooks
  useHaptic,
  useHapticButton,
  useHapticGesture,

  // Configuration
  setHapticsEnabled,
  isHapticsEnabled,
  clearHapticDebounceCache,
  cancelHapticSequence,
  cancelAllHapticSequences,

  // Utilities
  getPatternsByCategory,
  getPatternConfig,
  platformSupportsSequences,
  platformSupportsAllStyles,

  // Constants
  DEFAULT_DEBOUNCE_MS,
  SEQUENCE_COOLDOWN_MS,
  INTENSITY_MAP,
  PLATFORM_CONFIG,

  // Legacy (deprecated)
  hapticFeedback,
  debouncedHaptic,
};
