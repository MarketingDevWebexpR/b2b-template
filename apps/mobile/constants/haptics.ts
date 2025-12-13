/**
 * Haptic Feedback Configuration
 * Maps UI interactions to appropriate haptic feedback types
 */

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback types for different interactions
 */
export const hapticFeedback = {
  /** Light tap for quantity button press */
  quantityButtonPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Selection feedback when quantity value changes */
  quantityChange: () => Haptics.selectionAsync(),

  /** Medium impact for add to cart button press */
  addToCartPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /** Success notification when item added to cart */
  addToCartSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** Warning when trying to go below minimum quantity */
  quantityAtMinimum: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  /** Error feedback for out of stock or other errors */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  /** Soft impact for subtle confirmations */
  softConfirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),

  /** Rigid impact for definitive actions */
  rigidConfirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),

  /** Heavy impact for important actions */
  heavyImpact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Voice Search Haptics
  /** Light impact when starting voice recording */
  voiceSearchStart: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Success notification when transcript is ready */
  voiceSearchSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** Error notification on voice search failure */
  voiceSearchError: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  /** Selection feedback during voice search state changes */
  voiceSearchStateChange: () => Haptics.selectionAsync(),
} as const;

/**
 * Debounced haptic to prevent rapid-fire feedback
 */
let lastHapticTime = 0;
const HAPTIC_DEBOUNCE_MS = 50;

export const debouncedHaptic = (
  hapticFn: () => Promise<void>,
  debounceMs: number = HAPTIC_DEBOUNCE_MS
): void => {
  const now = Date.now();
  if (now - lastHapticTime >= debounceMs) {
    lastHapticTime = now;
    hapticFn();
  }
};
