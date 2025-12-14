/**
 * LuxuryBackButton - Elegant back navigation component
 *
 * A refined back button that matches the luxury jewelry brand aesthetic.
 * Features custom typography, subtle animations, and haptic feedback.
 */

import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { hapticFeedback } from '@/constants/haptics';
import { springConfigs } from '@/constants/animations';

// Design tokens
const COLORS = {
  charcoal: '#2b333f',
  hermes: '#f67828',
  stone: '#b8a99a',
  white: '#ffffff',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LuxuryBackButtonProps {
  /**
   * Custom text to display. Defaults to "Retour"
   */
  label?: string;
  /**
   * Color variant for the button
   */
  variant?: 'default' | 'light' | 'accent';
  /**
   * Whether to show the label text
   */
  showLabel?: boolean;
  /**
   * Custom onPress handler. If not provided, uses router.back()
   */
  onPress?: () => void;
}

export function LuxuryBackButton({
  label = 'Retour',
  variant = 'default',
  showLabel = true,
  onPress,
}: LuxuryBackButtonProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const getColors = () => {
    switch (variant) {
      case 'light':
        return { icon: COLORS.white, text: COLORS.white };
      case 'accent':
        return { icon: COLORS.hermes, text: COLORS.hermes };
      default:
        return { icon: COLORS.charcoal, text: COLORS.stone };
    }
  };

  const colors = getColors();

  const handlePress = () => {
    hapticFeedback.softConfirm();
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfigs.button);
    pressed.value = withSpring(1, springConfigs.button);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
    pressed.value = withSpring(0, springConfigs.button);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      pressed.value,
      [0, 1],
      [colors.text, COLORS.hermes]
    ),
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(pressed.value * -2, springConfigs.button) },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedContainerStyle]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Animated.View style={animatedIconStyle}>
        <ChevronLeft
          size={22}
          color={colors.icon}
          strokeWidth={1.8}
        />
      </Animated.View>
      {showLabel && (
        <Animated.Text style={[styles.label, animatedTextStyle]}>
          {label}
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
}

/**
 * Minimal variant - just the icon in a circular button
 * Similar to the CheckoutHeader style
 */
export function LuxuryBackButtonMinimal({
  onPress,
  variant = 'default',
}: Pick<LuxuryBackButtonProps, 'onPress' | 'variant'>) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const getIconColor = () => {
    switch (variant) {
      case 'light':
        return COLORS.white;
      case 'accent':
        return COLORS.hermes;
      default:
        return COLORS.charcoal;
    }
  };

  const handlePress = () => {
    hapticFeedback.softConfirm();
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.9, springConfigs.button);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springConfigs.button);
      }}
      style={[styles.minimalContainer, animatedStyle]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel="Retour"
    >
      <ChevronLeft
        size={24}
        color={getIconColor()}
        strokeWidth={2}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  minimalContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
