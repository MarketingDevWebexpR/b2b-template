/**
 * CheckoutStepIndicator Component
 * An elegant 3-step progress indicator for the checkout flow
 * Features animated transitions, pulsing glow effects, and smooth state changes
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolateColor,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING, RADIUS } from '../../constants/designTokens';

const COLORS = {
  background: DESIGN_COLORS.background,
  hermes: DESIGN_COLORS.hermes,
  hermesLightAlpha: DESIGN_COLORS.hermesLightAlpha,
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  sand: DESIGN_COLORS.sand,
  taupe: DESIGN_COLORS.taupe,
  borderLight: DESIGN_COLORS.borderLight,
  success: DESIGN_COLORS.success,
};

const FONTS = {
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
  bodyMedium: DESIGN_FONTS.bodyMedium,
};

// Step type definition
type Step = 'shipping' | 'payment' | 'confirmation';

interface CheckoutStepIndicatorProps {
  /** Current active step */
  currentStep: Step;
  /** Array of completed steps */
  completedSteps: Step[];
}

// Step configuration
const STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'shipping', label: 'Livraison', number: 1 },
  { key: 'payment', label: 'Paiement', number: 2 },
  { key: 'confirmation', label: 'Confirmation', number: 3 },
];

/**
 * Animated progress line connecting the steps
 */
function ProgressLine({ progress }: { progress: number }) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, springConfigs.gentle);
  }, [progress]);

  const lineStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  return (
    <View style={styles.lineContainer}>
      <View style={styles.lineBackground} />
      <Animated.View style={[styles.lineProgress, lineStyle]} />
    </View>
  );
}

/**
 * Individual step node with animations
 */
interface StepNodeProps {
  number: number;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  index: number;
}

function StepNode({ number, label, isCompleted, isCurrent, index }: StepNodeProps) {
  // Animation shared values
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Completed state animation
    if (isCompleted) {
      progress.value = withTiming(1, { duration: 300 });
      checkScale.value = withDelay(
        150,
        withSpring(1, springConfigs.celebration)
      );
      hapticFeedback.softConfirm();
    } else {
      progress.value = withTiming(0, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }

    // Current state animation with pulsing glow
    if (isCurrent) {
      // Pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 })
        ),
        -1,
        true
      );
      // Entrance animation - scale bounce
      scale.value = withSequence(
        withTiming(1.15, { duration: 200 }),
        withSpring(1, springConfigs.button)
      );
      hapticFeedback.softConfirm();
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isCompleted, isCurrent]);

  // Animated circle style
  const circleStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      isCurrent ? [COLORS.hermes, COLORS.hermes] : [COLORS.sand, COLORS.success]
    );
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      isCurrent ? [COLORS.hermes, COLORS.hermes] : [COLORS.taupe, COLORS.success]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
      borderColor,
    };
  });

  // Glow effect style
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.4 }],
  }));

  // Checkmark animation style
  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  // Label color animation
  const labelStyle = useAnimatedStyle(() => {
    const color = isCurrent
      ? COLORS.charcoal
      : isCompleted
        ? COLORS.charcoal
        : COLORS.textMuted;
    return { color };
  });

  return (
    <View
      style={styles.stepNode}
      accessibilityRole="text"
      accessibilityLabel={`Étape ${number}: ${label}${isCompleted ? ', terminée' : isCurrent ? ', en cours' : ''}`}
    >
      {/* Glow Effect - only for current step */}
      {isCurrent && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}

      {/* Circle with number or checkmark */}
      <Animated.View style={[styles.circle, circleStyle]}>
        {isCompleted ? (
          <Animated.View style={checkmarkStyle}>
            <Check size={18} color={COLORS.white} strokeWidth={3} />
          </Animated.View>
        ) : (
          <Text
            style={[
              styles.number,
              { color: isCurrent ? COLORS.white : COLORS.textMuted },
            ]}
          >
            {number}
          </Text>
        )}
      </Animated.View>

      {/* Step Label */}
      <Animated.Text
        style={[
          styles.label,
          labelStyle,
          isCurrent && styles.labelBold,
        ]}
      >
        {label}
      </Animated.Text>
    </View>
  );
}

/**
 * Main CheckoutStepIndicator component
 */
export function CheckoutStepIndicator({
  currentStep,
  completedSteps,
}: CheckoutStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Calculate progress for the line (0 to 1)
  const lineProgress = currentIndex / (STEPS.length - 1);

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Étape ${currentIndex + 1} sur ${STEPS.length}: ${currentStep}`}
      accessibilityValue={{
        min: 0,
        max: STEPS.length,
        now: currentIndex + 1,
      }}
    >
      {/* Progress Line */}
      <ProgressLine progress={lineProgress} />

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isPast = index < currentIndex;

          return (
            <StepNode
              key={step.key}
              number={step.number}
              label={step.label}
              isCompleted={isCompleted || isPast}
              isCurrent={isCurrent}
              index={index}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  lineContainer: {
    position: 'absolute',
    top: 36,
    left: 60,
    right: 60,
    height: 2,
  },
  lineBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.sand,
    borderRadius: 1,
  },
  lineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 2,
    backgroundColor: COLORS.hermes,
    borderRadius: 1,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepNode: {
    alignItems: 'center',
    width: 80,
  },
  glow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.hermesLightAlpha,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  number: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 8,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  labelBold: {
    fontFamily: FONTS.bodySemiBold,
  },
});

export default CheckoutStepIndicator;
