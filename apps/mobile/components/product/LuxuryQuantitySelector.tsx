/**
 * LuxuryQuantitySelector Component
 * An elegant quantity selector with smooth animations and haptic feedback
 * Designed for a premium jewelry e-commerce experience
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { springConfigs, timingConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  taupe: '#d4c9bd',
  stone: '#b8a99a',
  sand: '#f0ebe3',
};

interface LuxuryQuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LuxuryQuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: LuxuryQuantitySelectorProps) {
  // Local state for immediate UI feedback
  const [displayValue, setDisplayValue] = useState(value);

  // Sync with prop changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Animation values - Minus button
  const minusScale = useSharedValue(1);
  const minusBgOpacity = useSharedValue(0);

  // Animation values - Plus button
  const plusScale = useSharedValue(1);
  const plusBgOpacity = useSharedValue(0);

  // Animation values - Number display
  const numberScale = useSharedValue(1);
  const numberTranslateY = useSharedValue(0);
  const numberOpacity = useSharedValue(1);

  // Derived state
  const isAtMin = displayValue <= min;
  const isAtMax = displayValue >= max;

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (disabled || isAtMin) {
      // Shake animation for feedback
      debouncedHaptic(hapticFeedback.quantityAtMinimum);
      numberTranslateY.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-2, { duration: 50 }),
        withTiming(2, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }

    const newValue = displayValue - 1;
    setDisplayValue(newValue);
    onChange(newValue);

    // Number animation
    debouncedHaptic(hapticFeedback.quantityChange);
    numberScale.value = withSequence(
      withTiming(1.1, { duration: 80 }),
      withSpring(1, springConfigs.number)
    );
    numberTranslateY.value = withSequence(
      withTiming(8, { duration: 60 }),
      withTiming(-8, { duration: 0 }),
      withSpring(0, springConfigs.number)
    );
  }, [displayValue, disabled, isAtMin, min, onChange]);

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (disabled || isAtMax) {
      return;
    }

    const newValue = displayValue + 1;
    setDisplayValue(newValue);
    onChange(newValue);

    // Number animation
    debouncedHaptic(hapticFeedback.quantityChange);
    numberScale.value = withSequence(
      withTiming(1.1, { duration: 80 }),
      withSpring(1, springConfigs.number)
    );
    numberTranslateY.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 0 }),
      withSpring(0, springConfigs.number)
    );
  }, [displayValue, disabled, isAtMax, max, onChange]);

  // Button press handlers - Minus
  const onMinusPressIn = useCallback(() => {
    if (disabled) return;
    minusScale.value = withSpring(0.9, springConfigs.button);
    minusBgOpacity.value = withTiming(1, timingConfigs.micro);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [disabled]);

  const onMinusPressOut = useCallback(() => {
    minusScale.value = withSpring(1, springConfigs.button);
    minusBgOpacity.value = withTiming(0, timingConfigs.standard);
  }, []);

  // Button press handlers - Plus
  const onPlusPressIn = useCallback(() => {
    if (disabled) return;
    plusScale.value = withSpring(0.9, springConfigs.button);
    plusBgOpacity.value = withTiming(1, timingConfigs.micro);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [disabled]);

  const onPlusPressOut = useCallback(() => {
    plusScale.value = withSpring(1, springConfigs.button);
    plusBgOpacity.value = withTiming(0, timingConfigs.standard);
  }, []);

  // Animated styles
  const minusButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }));

  const minusBgStyle = useAnimatedStyle(() => ({
    opacity: minusBgOpacity.value,
  }));

  const plusButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const plusBgStyle = useAnimatedStyle(() => ({
    opacity: plusBgOpacity.value,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: numberScale.value },
      { translateY: numberTranslateY.value },
    ],
    opacity: numberOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Section Label */}
      <Text style={styles.label}>Quantité</Text>

      <View style={styles.selectorRow}>
        {/* Minus Button */}
        <AnimatedPressable
          onPressIn={onMinusPressIn}
          onPressOut={onMinusPressOut}
          onPress={handleDecrement}
          disabled={disabled}
          style={[styles.button, minusButtonStyle, isAtMin && styles.buttonDisabled]}
          accessibilityLabel="Diminuer la quantité"
          accessibilityRole="button"
          accessibilityState={{ disabled: isAtMin || disabled }}
        >
          {/* Background highlight */}
          <Animated.View style={[styles.buttonBg, minusBgStyle]} />

          {/* Border */}
          <View style={[styles.buttonBorder, isAtMin && styles.buttonBorderDisabled]} />

          {/* Icon */}
          <Minus
            size={20}
            color={isAtMin ? COLORS.stone : COLORS.charcoal}
            strokeWidth={1.5}
          />
        </AnimatedPressable>

        {/* Quantity Display */}
        <View style={styles.numberContainer}>
          <Animated.Text style={[styles.number, numberStyle]}>
            {displayValue}
          </Animated.Text>
        </View>

        {/* Plus Button */}
        <AnimatedPressable
          onPressIn={onPlusPressIn}
          onPressOut={onPlusPressOut}
          onPress={handleIncrement}
          disabled={disabled || isAtMax}
          style={[styles.button, plusButtonStyle, isAtMax && styles.buttonDisabled]}
          accessibilityLabel="Augmenter la quantité"
          accessibilityRole="button"
          accessibilityState={{ disabled: isAtMax || disabled }}
        >
          {/* Background highlight */}
          <Animated.View style={[styles.buttonBg, plusBgStyle]} />

          {/* Border */}
          <View style={[styles.buttonBorder, isAtMax && styles.buttonBorderDisabled]} />

          {/* Icon */}
          <Plus
            size={20}
            color={isAtMax ? COLORS.stone : COLORS.charcoal}
            strokeWidth={1.5}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  label: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
    marginBottom: 12,
  },

  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  buttonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.taupe,
  },

  buttonBorderDisabled: {
    borderColor: COLORS.sand,
  },

  buttonBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.hermesLight,
    borderRadius: 24,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  numberContainer: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  number: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.charcoal,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default LuxuryQuantitySelector;
