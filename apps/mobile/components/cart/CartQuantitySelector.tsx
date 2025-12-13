/**
 * CartQuantitySelector Component
 * A compact quantity selector designed for cart items
 * Features subtle animations and haptic feedback
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
  backgroundBeige: '#fcf7f1',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  taupe: '#d4c9bd',
  stone: '#b8a99a',
  sand: '#f0ebe3',
  border: '#e2d8ce',
};

interface CartQuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CartQuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: CartQuantitySelectorProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Animation values
  const minusScale = useSharedValue(1);
  const plusScale = useSharedValue(1);
  const numberScale = useSharedValue(1);
  const containerScale = useSharedValue(1);

  const isAtMin = displayValue <= min;
  const isAtMax = displayValue >= max;

  const handleDecrement = useCallback(() => {
    if (disabled || isAtMin) {
      debouncedHaptic(hapticFeedback.quantityAtMinimum);
      containerScale.value = withSequence(
        withTiming(0.98, { duration: 50 }),
        withSpring(1, springConfigs.button)
      );
      return;
    }

    const newValue = displayValue - 1;
    setDisplayValue(newValue);
    onChange(newValue);

    debouncedHaptic(hapticFeedback.quantityChange);
    numberScale.value = withSequence(
      withTiming(1.15, { duration: 80 }),
      withSpring(1, springConfigs.number)
    );
  }, [displayValue, disabled, isAtMin, onChange]);

  const handleIncrement = useCallback(() => {
    if (disabled || isAtMax) return;

    const newValue = displayValue + 1;
    setDisplayValue(newValue);
    onChange(newValue);

    debouncedHaptic(hapticFeedback.quantityChange);
    numberScale.value = withSequence(
      withTiming(1.15, { duration: 80 }),
      withSpring(1, springConfigs.number)
    );
  }, [displayValue, disabled, isAtMax, onChange]);

  const onMinusPressIn = useCallback(() => {
    if (disabled) return;
    minusScale.value = withSpring(0.85, springConfigs.button);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [disabled]);

  const onMinusPressOut = useCallback(() => {
    minusScale.value = withSpring(1, springConfigs.button);
  }, []);

  const onPlusPressIn = useCallback(() => {
    if (disabled) return;
    plusScale.value = withSpring(0.85, springConfigs.button);
    debouncedHaptic(hapticFeedback.quantityButtonPress);
  }, [disabled]);

  const onPlusPressOut = useCallback(() => {
    plusScale.value = withSpring(1, springConfigs.button);
  }, []);

  const minusButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }));

  const plusButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Minus Button */}
      <AnimatedPressable
        onPressIn={onMinusPressIn}
        onPressOut={onMinusPressOut}
        onPress={handleDecrement}
        disabled={disabled}
        style={[styles.button, minusButtonStyle, isAtMin && styles.buttonDisabled]}
        accessibilityLabel="Diminuer la quantité"
        accessibilityRole="button"
      >
        <Minus
          size={14}
          color={isAtMin ? COLORS.stone : COLORS.charcoal}
          strokeWidth={2}
        />
      </AnimatedPressable>

      {/* Quantity Display */}
      <Animated.Text style={[styles.number, numberStyle]}>
        {displayValue}
      </Animated.Text>

      {/* Plus Button */}
      <AnimatedPressable
        onPressIn={onPlusPressIn}
        onPressOut={onPlusPressOut}
        onPress={handleIncrement}
        disabled={disabled || isAtMax}
        style={[styles.button, plusButtonStyle, isAtMax && styles.buttonDisabled]}
        accessibilityLabel="Augmenter la quantité"
        accessibilityRole="button"
      >
        <Plus
          size={14}
          color={isAtMax ? COLORS.stone : COLORS.charcoal}
          strokeWidth={2}
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: 'transparent',
  },

  number: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.charcoal,
    minWidth: 32,
    textAlign: 'center',
  },
});

export default CartQuantitySelector;
