# Checkout UI Components - Bijoux Luxury Mobile App

> Design System Documentation pour le tunnel d'achat haut de gamme
> Version 1.0 | React Native / Expo SDK 52

---

## Table des matieres

1. [Design Tokens](#design-tokens)
2. [CheckoutStepIndicator](#1-checkoutstepindicator)
3. [LuxuryTextInput](#2-luxurytextinput)
4. [AddressCard](#3-addresscard)
5. [ShippingOptionCard](#4-shippingoptioncard)
6. [PaymentMethodSelector](#5-paymentmethodselector)
7. [OrderSummaryCard](#6-ordersummarycard)
8. [SecurePaymentBadge](#7-securepaymentbadge)
9. [CheckoutButton](#8-checkoutbutton)
10. [OrderConfirmationOverlay](#9-orderconfirmationoverlay)

---

## Design Tokens

### Couleurs

```typescript
const CHECKOUT_COLORS = {
  // Brand
  hermes: '#f67828',
  hermesDark: '#ea580c',
  hermesLight: '#fff7ed',
  hermesLightAlpha: 'rgba(246, 120, 40, 0.15)',

  // Background
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  backgroundGlass: 'rgba(255, 252, 247, 0.85)',

  // Text
  charcoal: '#2b333f',
  textSecondary: '#444444',
  textMuted: '#696969',

  // Neutral
  white: '#ffffff',
  stone: '#b8a99a',
  taupe: '#d4c9bd',
  sand: '#f0ebe3',
  gold: '#d4a574',

  // Borders
  border: '#e2d8ce',
  borderLight: '#f0ebe3',

  // Semantic
  success: '#059669',
  successLight: '#ecfdf5',
  error: '#dc2626',
  errorLight: '#fef2f2',
  warning: '#d97706',
  warningLight: '#fffbeb',
};
```

### Typographie

```typescript
const FONTS = {
  display: 'PlayfairDisplay-Regular',
  displayMedium: 'PlayfairDisplay-Medium',
  displaySemiBold: 'PlayfairDisplay-SemiBold',
  displayBold: 'PlayfairDisplay-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
};
```

### Animations

```typescript
const springConfigs = {
  button: { damping: 15, mass: 1, stiffness: 200 },
  gentle: { damping: 25, mass: 1, stiffness: 100 },
  celebration: { damping: 12, mass: 1, stiffness: 180 },
  snap: { damping: 20, mass: 0.5, stiffness: 300 },
};
```

---

## 1. CheckoutStepIndicator

> Indicateur de progression elegant pour les 3 etapes du tunnel d'achat

### Apercu visuel

```
  [1] -------- [2] -------- [3]
 Livraison   Paiement  Confirmation
```

### Structure JSX

```tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { springConfigs } from '@/constants/animations';
import { COLORS, FONTS, SPACING, SHADOWS } from '@/constants/designTokens';

type Step = 'shipping' | 'payment' | 'confirmation';

interface CheckoutStepIndicatorProps {
  currentStep: Step;
  completedSteps: Step[];
}

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'shipping', label: 'Livraison', number: 1 },
  { key: 'payment', label: 'Paiement', number: 2 },
  { key: 'confirmation', label: 'Confirmation', number: 3 },
];

export function CheckoutStepIndicator({
  currentStep,
  completedSteps,
}: CheckoutStepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <View style={styles.container}>
      {/* Background Line */}
      <View style={styles.lineContainer}>
        <View style={styles.lineBackground} />
        <Animated.View
          style={[
            styles.lineProgress,
            { width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }
          ]}
        />
      </View>

      {/* Steps */}
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

interface StepNodeProps {
  number: number;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  index: number;
}

function StepNode({ number, label, isCompleted, isCurrent, index }: StepNodeProps) {
  // Animation values
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isCompleted) {
      progress.value = withTiming(1, { duration: 300 });
      checkScale.value = withDelay(
        150,
        withSpring(1, springConfigs.celebration)
      );
    } else {
      progress.value = withTiming(0, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }

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
      // Entrance animation
      scale.value = withSequence(
        withTiming(1.15, { duration: 200 }),
        withSpring(1, springConfigs.button)
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isCompleted, isCurrent]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      isCurrent ? [COLORS.hermes, COLORS.hermes] : [COLORS.sand, COLORS.success]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      isCurrent ? [COLORS.hermes, COLORS.hermes] : [COLORS.taupe, COLORS.success]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.4 }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      isCurrent ? [COLORS.charcoal, COLORS.charcoal] : [COLORS.textMuted, COLORS.charcoal]
    ),
  }));

  return (
    <View style={styles.stepNode}>
      {/* Glow Effect */}
      {isCurrent && (
        <Animated.View style={[styles.glow, glowStyle]} />
      )}

      {/* Circle */}
      <Animated.View style={[styles.circle, circleStyle]}>
        {isCompleted ? (
          <Animated.View style={checkmarkStyle}>
            <Check size={18} color={COLORS.white} strokeWidth={3} />
          </Animated.View>
        ) : (
          <Text style={[
            styles.number,
            { color: isCurrent ? COLORS.white : COLORS.textMuted }
          ]}>
            {number}
          </Text>
        )}
      </Animated.View>

      {/* Label */}
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
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
    ...SHADOWS.sm,
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
});
```

### Etats et variantes

| Etat | Cercle | Ligne | Label |
|------|--------|-------|-------|
| **Default** | `sand` bg, `taupe` border, numero gris | Gris | `textMuted` |
| **Current** | `hermes` bg, pulsation glow | Orange jusqu'a ce point | `charcoal`, bold |
| **Completed** | `success` bg, checkmark anime | Vert | `charcoal` |

### Animations

1. **Transition vers etape courante**
   - Scale: 1 -> 1.15 -> 1 (spring)
   - Glow pulsant: opacity 0.2 <-> 0.6 (1.5s cycle)

2. **Completion d'etape**
   - Progress bar: slide de gauche a droite (300ms)
   - Cercle: color morph vers success (300ms)
   - Checkmark: scale 0 -> 1.2 -> 1 (spring celebration)

### Accessibilite

```tsx
accessibilityRole="progressbar"
accessibilityLabel={`Etape ${currentIndex + 1} sur ${STEPS.length}: ${currentStep}`}
accessibilityValue={{
  min: 0,
  max: STEPS.length,
  now: currentIndex + 1,
}}
```

---

## 2. LuxuryTextInput

> Champ de formulaire premium avec label flottant et animations elegantes

### Apercu visuel

```
  ___________________________________
 |                                   |
 |  [Label flottant]                 |
 |  Valeur saisie                    |
 |___________________________________|
```

### Structure JSX

```tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react-native';
import { springConfigs, timingConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

interface LuxuryTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LuxuryTextInput({
  label,
  value,
  onChangeText,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  required,
  disabled,
  showPasswordToggle,
  secureTextEntry,
  ...textInputProps
}: LuxuryTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animation values
  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(0);

  // Determine if label should float
  const shouldFloat = isFocused || value.length > 0;

  useEffect(() => {
    labelPosition.value = withSpring(
      shouldFloat ? 1 : 0,
      springConfigs.gentle
    );
  }, [shouldFloat]);

  useEffect(() => {
    if (isFocused) {
      borderProgress.value = withTiming(1, { duration: 200 });
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused]);

  // Error shake animation
  useEffect(() => {
    if (error) {
      hapticFeedback.error();
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  // Success animation
  useEffect(() => {
    if (success) {
      successScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      );
      hapticFeedback.softConfirm();
    } else {
      successScale.value = withTiming(0, { duration: 150 });
    }
  }, [success]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    hapticFeedback.softConfirm();
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const togglePassword = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
    hapticFeedback.quantityButtonPress();
  }, []);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => {
    const translateY = labelPosition.value * -24;
    const scale = 1 - labelPosition.value * 0.15;

    return {
      transform: [
        { translateY },
        { scale },
      ],
      color: interpolateColor(
        borderProgress.value,
        [0, 1],
        error ? [COLORS.error, COLORS.error] : [COLORS.textMuted, COLORS.hermes]
      ),
    };
  });

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      error
        ? [COLORS.error, COLORS.error]
        : success
          ? [COLORS.success, COLORS.success]
          : [COLORS.border, COLORS.hermes]
    ),
    borderWidth: isFocused ? 2 : 1,
    backgroundColor: disabled ? COLORS.sand : COLORS.white,
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    scaleX: borderProgress.value,
    backgroundColor: error ? COLORS.error : COLORS.hermes,
  }));

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  // Determine icon color
  const getIconColor = () => {
    if (error) return COLORS.error;
    if (success) return COLORS.success;
    if (isFocused) return COLORS.hermes;
    return COLORS.stone;
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Input Container */}
      <AnimatedPressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputContainer, borderStyle]}
        disabled={disabled}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {React.cloneElement(leftIcon as React.ReactElement, {
              color: getIconColor(),
              size: 20,
            })}
          </View>
        )}

        {/* Input Wrapper */}
        <View style={styles.inputWrapper}>
          {/* Floating Label */}
          <Animated.Text
            style={[
              styles.label,
              labelStyle,
              leftIcon && styles.labelWithIcon,
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle || success) && styles.inputWithRightIcon,
              disabled && styles.inputDisabled,
            ]}
            editable={!disabled}
            placeholderTextColor={COLORS.stone}
            selectionColor={COLORS.hermes}
            secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
            {...textInputProps}
          />
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          {/* Success Icon */}
          {success && (
            <Animated.View style={[styles.successIcon, successIconStyle]}>
              <Check size={18} color={COLORS.success} strokeWidth={2.5} />
            </Animated.View>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && (
            <Pressable
              onPress={togglePassword}
              style={styles.passwordToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color={COLORS.stone} />
              ) : (
                <Eye size={20} color={COLORS.stone} />
              )}
            </Pressable>
          )}

          {/* Custom Right Icon */}
          {rightIcon && !showPasswordToggle && !success && (
            <View style={styles.rightIconContainer}>
              {rightIcon}
            </View>
          )}
        </View>

        {/* Bottom Accent Line */}
        <Animated.View style={[styles.underline, underlineStyle]} />
      </AnimatedPressable>

      {/* Helper/Error Text */}
      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error && (
            <AlertCircle
              size={14}
              color={COLORS.error}
              style={styles.errorIcon}
            />
          )}
          <Text style={[
            styles.helperText,
            error && styles.errorText,
          ]}>
            {error || helperText}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
  },
  leftIconContainer: {
    marginRight: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 8,
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 18,
    fontFamily: FONTS.body,
    fontSize: 15,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  labelWithIcon: {
    left: 0,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.charcoal,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingTop: 12,
    paddingBottom: 8,
  },
  inputWithLeftIcon: {},
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputDisabled: {
    color: COLORS.textMuted,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    marginLeft: SPACING.xs,
  },
  passwordToggle: {
    padding: SPACING.xs,
  },
  rightIconContainer: {
    marginLeft: SPACING.xs,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.md,
    right: SPACING.md,
    height: 2,
    transformOrigin: 'left',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: SPACING.md,
  },
  errorIcon: {
    marginRight: 4,
  },
  helperText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  errorText: {
    color: COLORS.error,
  },
});
```

### Etats et variantes

| Etat | Bordure | Label | Icone droite |
|------|---------|-------|--------------|
| **Default** | 1px `border` | Position basse, `textMuted` | - |
| **Focused** | 2px `hermes` | Flotte en haut, `hermes` | - |
| **Filled** | 1px `border` | Flotte en haut, `textMuted` | - |
| **Error** | 2px `error` | Flotte en haut, `error` | AlertCircle |
| **Success** | 1px `success` | Flotte en haut, `textMuted` | Check anime |
| **Disabled** | 1px `border` | Grise | - |

### Animations

1. **Label flottant**
   - TranslateY: 0 -> -24px
   - Scale: 1 -> 0.85
   - Duration: spring gentle

2. **Focus**
   - Border color morph: 200ms
   - Underline scaleX: 0 -> 1 (from center)

3. **Error shake**
   - TranslateX: sequence(-8, 8, -6, 6, 0)
   - Duration: 250ms total
   - Haptic: error notification

4. **Success checkmark**
   - Scale: 0 -> 1.2 -> 1 (spring celebration)
   - Haptic: soft confirm

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | Label du champ |
| `value` | string | required | Valeur actuelle |
| `onChangeText` | function | required | Callback on change |
| `error` | string | undefined | Message d'erreur |
| `success` | boolean | false | Affiche l'etat success |
| `helperText` | string | undefined | Texte d'aide |
| `leftIcon` | ReactNode | undefined | Icone a gauche |
| `required` | boolean | false | Champ obligatoire |
| `disabled` | boolean | false | Champ desactive |
| `showPasswordToggle` | boolean | false | Toggle visibilite mot de passe |

---

## 3. AddressCard

> Carte d'adresse selectionnable avec animation de selection elegante

### Apercu visuel

```
  ___________________________________________
 |  [Radio]  Maison                    [Edit]|
 |          Jean Dupont                      |
 |          123 Rue de la Paix               |
 |          75001 Paris, France              |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Home, Briefcase, MapPin, Edit3, Check } from 'lucide-react-native';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

type AddressType = 'home' | 'work' | 'other';

interface Address {
  id: string;
  type: AddressType;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ADDRESS_ICONS = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

export function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
}: AddressCardProps) {
  // Animation values
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const radioScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const Icon = ADDRESS_ICONS[address.type];

  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withTiming(1, { duration: 200 });
      radioScale.value = withSpring(1, springConfigs.celebration);
      checkScale.value = withDelay(100, withSpring(1, springConfigs.button));
      glowOpacity.value = withTiming(1, { duration: 200 });
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      radioScale.value = withTiming(0, { duration: 150 });
      checkScale.value = withTiming(0, { duration: 150 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    hapticFeedback.softConfirm();
    onSelect();
  }, [onSelect]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.borderLight, COLORS.hermes]
    ),
    borderWidth: borderProgress.value > 0.5 ? 2 : 1,
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.white, COLORS.hermesLight]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.15,
  }));

  const radioOuterStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.stone, COLORS.hermes]
    ),
  }));

  const radioInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.sand, COLORS.hermesLightAlpha]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, containerStyle]}
    >
      {/* Glow Effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Header Row */}
        <View style={styles.header}>
          {/* Radio Button */}
          <Animated.View style={[styles.radioOuter, radioOuterStyle]}>
            <Animated.View style={[styles.radioInner, radioInnerStyle]} />
          </Animated.View>

          {/* Type Icon */}
          <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
            <Icon size={16} color={isSelected ? COLORS.hermes : COLORS.stone} />
          </Animated.View>

          {/* Label */}
          <View style={styles.labelContainer}>
            <Text style={[
              styles.label,
              isSelected && styles.labelSelected
            ]}>
              {address.label}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Par defaut</Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          {onEdit && (
            <Pressable
              onPress={onEdit}
              style={styles.editButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit3 size={16} color={COLORS.stone} />
            </Pressable>
          )}
        </View>

        {/* Address Details */}
        <View style={styles.details}>
          <Text style={styles.name}>{address.name}</Text>
          <Text style={styles.addressLine}>{address.line1}</Text>
          {address.line2 && (
            <Text style={styles.addressLine}>{address.line2}</Text>
          )}
          <Text style={styles.addressLine}>
            {address.postalCode} {address.city}, {address.country}
          </Text>
        </View>

        {/* Selection Checkmark */}
        {isSelected && (
          <Animated.View style={[styles.checkContainer]}>
            <Check size={14} color={COLORS.white} strokeWidth={3} />
          </Animated.View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.hermes,
  },
  card: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    position: 'relative',
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.hermes,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  labelSelected: {
    color: COLORS.hermes,
  },
  defaultBadge: {
    backgroundColor: COLORS.sand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: SPACING.xs,
  },
  details: {
    paddingLeft: 34, // Align with label (radio width + margin)
  },
  name: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  addressLine: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  checkContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.hermes,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Etats

| Etat | Border | Background | Radio | Icone |
|------|--------|------------|-------|-------|
| **Default** | 1px `borderLight` | `white` | Vide | `stone` |
| **Selected** | 2px `hermes` | `hermesLight` | Rempli `hermes` | `hermes` |
| **Pressed** | - | - | - | Scale 0.98 |

### Animations

1. **Selection**
   - Border color: fade 200ms
   - Background color: fade 200ms
   - Radio inner: spring scale 0 -> 1
   - Glow: opacity 0 -> 0.15

2. **Press**
   - Scale: 1 -> 0.98 -> 1 (spring)

---

## 4. ShippingOptionCard

> Options de livraison avec radio buttons elegants et indicateur de rapidite

### Apercu visuel

```
  ___________________________________________
 |  (o) Livraison Standard              9,90€|
 |      3-5 jours ouvrables                  |
 |___________________________________________|

  ___________________________________________
 |  ( ) Livraison Express    [RAPIDE]  19,90€|
 |      1-2 jours ouvrables                  |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { Truck, Zap, Package, Clock } from 'lucide-react-native';
import { formatPrice } from '@bijoux/utils';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

type ShippingSpeed = 'standard' | 'express' | 'overnight' | 'pickup';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  speed: ShippingSpeed;
  isFree?: boolean;
  isEco?: boolean;
}

interface ShippingOptionCardProps {
  option: ShippingOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SHIPPING_ICONS = {
  standard: Truck,
  express: Zap,
  overnight: Clock,
  pickup: Package,
};

const SPEED_BADGES = {
  express: { label: 'Rapide', color: COLORS.hermes },
  overnight: { label: 'Demain', color: COLORS.success },
};

export function ShippingOptionCard({
  option,
  isSelected,
  onSelect,
  disabled,
}: ShippingOptionCardProps) {
  // Animation values
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const radioScale = useSharedValue(0);
  const priceScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);

  const Icon = SHIPPING_ICONS[option.speed];
  const speedBadge = SPEED_BADGES[option.speed as keyof typeof SPEED_BADGES];

  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withTiming(1, { duration: 200 });
      radioScale.value = withSpring(1, springConfigs.celebration);

      // Price pop animation
      priceScale.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withSpring(1, springConfigs.button)
      );

      // Icon bounce
      iconRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withSpring(0, springConfigs.button)
      );
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      radioScale.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.98, springConfigs.button);
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    if (disabled) return;
    hapticFeedback.softConfirm();
    onSelect();
  }, [disabled, onSelect]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.borderLight, COLORS.hermes]
    ),
    borderWidth: borderProgress.value > 0.5 ? 2 : 1,
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.white, COLORS.hermesLight]
    ),
  }));

  const radioOuterStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.stone, COLORS.hermes]
    ),
  }));

  const radioInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radioScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const priceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: priceScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={`${option.name}, ${option.estimatedDays}, ${option.isFree ? 'Gratuit' : formatPrice(option.price)}`}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {/* Radio Button */}
          <Animated.View style={[styles.radioOuter, radioOuterStyle]}>
            <Animated.View style={[styles.radioInner, radioInnerStyle]} />
          </Animated.View>

          {/* Icon */}
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <Icon
              size={20}
              color={isSelected ? COLORS.hermes : COLORS.stone}
            />
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <View style={styles.nameRow}>
              <Text style={[
                styles.name,
                isSelected && styles.nameSelected
              ]}>
                {option.name}
              </Text>

              {speedBadge && (
                <View style={[
                  styles.speedBadge,
                  { backgroundColor: speedBadge.color + '20' }
                ]}>
                  <Text style={[
                    styles.speedBadgeText,
                    { color: speedBadge.color }
                  ]}>
                    {speedBadge.label}
                  </Text>
                </View>
              )}

              {option.isEco && (
                <View style={styles.ecoBadge}>
                  <Text style={styles.ecoBadgeText}>ECO</Text>
                </View>
              )}
            </View>

            <Text style={styles.description}>{option.estimatedDays}</Text>
          </View>
        </View>

        {/* Price */}
        <Animated.View style={priceStyle}>
          {option.isFree ? (
            <View style={styles.freeContainer}>
              <Text style={styles.freeText}>Gratuit</Text>
            </View>
          ) : (
            <Text style={[
              styles.price,
              isSelected && styles.priceSelected
            ]}>
              {formatPrice(option.price)}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.hermes,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  textContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  nameSelected: {
    color: COLORS.hermes,
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  speedBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ecoBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ecoBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  freeContainer: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.success,
  },
  price: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.charcoal,
  },
  priceSelected: {
    color: COLORS.hermes,
  },
});
```

---

## 5. PaymentMethodSelector

> Selection du moyen de paiement avec Apple Pay, Google Pay et carte bancaire

### Apercu visuel

```
  ___________________________________________
 |  [Apple Pay Logo]                         |
 |  Apple Pay                          (o)  |
 |___________________________________________|

  ___________________________________________
 |  [Card Icon]                              |
 |  Carte bancaire                     ( )  |
 |  **** **** **** 4242                      |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { CreditCard, Plus, Check } from 'lucide-react-native';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

type PaymentType = 'apple_pay' | 'google_pay' | 'card' | 'new_card';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  lastFourDigits?: string;
  brand?: 'visa' | 'mastercard' | 'amex';
  expiryDate?: string;
  isDefault?: boolean;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_BRANDS = {
  visa: require('@/assets/images/visa.png'),
  mastercard: require('@/assets/images/mastercard.png'),
  amex: require('@/assets/images/amex.png'),
};

export function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
  onAddNew,
}: PaymentMethodSelectorProps) {
  return (
    <View style={styles.container}>
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          isSelected={selectedId === method.id}
          onSelect={() => onSelect(method.id)}
        />
      ))}

      {onAddNew && (
        <AddNewCardButton onPress={onAddNew} />
      )}
    </View>
  );
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

function PaymentMethodCard({
  method,
  isSelected,
  onSelect,
}: PaymentMethodCardProps) {
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const shimmerX = useSharedValue(-200);

  const isWallet = method.type === 'apple_pay' || method.type === 'google_pay';

  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withTiming(1, { duration: 200 });
      checkScale.value = withSpring(1, springConfigs.celebration);

      // Shimmer effect for wallet options
      if (isWallet) {
        shimmerX.value = withSequence(
          withTiming(-200, { duration: 0 }),
          withTiming(400, { duration: 800 })
        );
      }
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    hapticFeedback.softConfirm();
    onSelect();
  }, [onSelect]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.borderLight, COLORS.hermes]
    ),
    borderWidth: borderProgress.value > 0.5 ? 2 : 1,
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.white, COLORS.hermesLight]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const renderIcon = () => {
    if (method.type === 'apple_pay') {
      return (
        <View style={styles.walletIcon}>
          <Image
            source={require('@/assets/images/apple-pay.png')}
            style={styles.walletLogo}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (method.type === 'google_pay') {
      return (
        <View style={styles.walletIcon}>
          <Image
            source={require('@/assets/images/google-pay.png')}
            style={styles.walletLogo}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (method.brand && CARD_BRANDS[method.brand]) {
      return (
        <View style={styles.cardIconContainer}>
          <Image
            source={CARD_BRANDS[method.brand]}
            style={styles.cardBrandLogo}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View style={styles.cardIconContainer}>
        <CreditCard size={24} color={COLORS.stone} />
      </View>
    );
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.methodContainer, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={method.label}
    >
      <Animated.View style={[styles.methodCard, cardStyle]}>
        {/* Shimmer Effect */}
        {isWallet && isSelected && (
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        )}

        {/* Icon */}
        {renderIcon()}

        {/* Content */}
        <View style={styles.methodContent}>
          <Text style={[
            styles.methodLabel,
            isSelected && styles.methodLabelSelected
          ]}>
            {method.label}
          </Text>

          {method.lastFourDigits && (
            <Text style={styles.cardDetails}>
              **** **** **** {method.lastFourDigits}
              {method.expiryDate && ` - Exp. ${method.expiryDate}`}
            </Text>
          )}

          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Par defaut</Text>
            </View>
          )}
        </View>

        {/* Selection Indicator */}
        <Animated.View style={[styles.checkContainer, checkStyle]}>
          <Check size={16} color={COLORS.white} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
}

function AddNewCardButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfigs.button);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.addNewContainer, containerStyle]}
    >
      <View style={styles.addNewCard}>
        <View style={styles.addNewIcon}>
          <Plus size={20} color={COLORS.hermes} />
        </View>
        <Text style={styles.addNewText}>Ajouter une carte</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  methodContainer: {
    marginBottom: 0,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  walletIcon: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  walletLogo: {
    width: 48,
    height: 24,
  },
  cardIconContainer: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.sand,
    borderRadius: 6,
  },
  cardBrandLogo: {
    width: 32,
    height: 20,
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  methodLabelSelected: {
    color: COLORS.hermes,
  },
  cardDetails: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: COLORS.sand,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  defaultText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.hermes,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewContainer: {
    marginTop: SPACING.xs,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundBeige,
  },
  addNewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.hermesLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  addNewText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.hermes,
  },
});
```

---

## 6. OrderSummaryCard

> Recapitulatif de commande collapsible avec animation elegante

### Apercu visuel

```
  ___________________________________________
 |  Recapitulatif            [v] (collapse) |
 |-------------------------------------------|
 |  [img] Bague Diamant x1          1 250,00€|
 |  [img] Collier Perle x2            890,00€|
 |-------------------------------------------|
 |  Sous-total                      2 140,00€|
 |  Livraison                         Gratuit|
 |  Reduction                         -100,00€|
 |-------------------------------------------|
 |  TOTAL                           2 040,00€|
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, LayoutAnimation } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ChevronDown, Tag, Truck, Percent } from 'lucide-react-native';
import { formatPrice } from '@bijoux/utils';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  discountCode?: string;
  total: number;
  initiallyExpanded?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OrderSummaryCard({
  items,
  subtotal,
  shippingCost,
  discount = 0,
  discountCode,
  total,
  initiallyExpanded = true,
}: OrderSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  // Animation values
  const rotation = useSharedValue(initiallyExpanded ? 180 : 0);
  const contentHeight = useSharedValue(initiallyExpanded ? 1 : 0);
  const headerScale = useSharedValue(1);

  const toggleExpand = useCallback(() => {
    hapticFeedback.softConfirm();

    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    rotation.value = withSpring(newExpanded ? 180 : 0, springConfigs.button);
    contentHeight.value = withTiming(newExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const handleHeaderPressIn = () => {
    headerScale.value = withSpring(0.98, springConfigs.button);
  };

  const handleHeaderPressOut = () => {
    headerScale.value = withSpring(1, springConfigs.button);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    maxHeight: interpolate(
      contentHeight.value,
      [0, 1],
      [0, 1000],
      Extrapolate.CLAMP
    ),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <AnimatedPressable
        onPress={toggleExpand}
        onPressIn={handleHeaderPressIn}
        onPressOut={handleHeaderPressOut}
        style={[styles.header, headerStyle]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Recapitulatif</Text>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>
              {items.reduce((acc, item) => acc + item.quantity, 0)} articles
            </Text>
          </View>
        </View>

        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={COLORS.charcoal} />
        </Animated.View>
      </AnimatedPressable>

      {/* Collapsible Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Items List */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.variant && (
                  <Text style={styles.itemVariant}>{item.variant}</Text>
                )}
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Summary Lines */}
        <View style={styles.summaryLines}>
          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          {/* Shipping */}
          <View style={styles.summaryRow}>
            <View style={styles.labelWithIcon}>
              <Truck size={14} color={COLORS.textMuted} />
              <Text style={styles.summaryLabel}>Livraison</Text>
            </View>
            <Text style={[
              styles.summaryValue,
              shippingCost === 0 && styles.freeValue
            ]}>
              {shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}
            </Text>
          </View>

          {/* Discount */}
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.labelWithIcon}>
                <Tag size={14} color={COLORS.success} />
                <Text style={[styles.summaryLabel, styles.discountLabel]}>
                  {discountCode ? `Code: ${discountCode}` : 'Reduction'}
                </Text>
              </View>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundBeige,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
  },
  itemCountBadge: {
    backgroundColor: COLORS.sand,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  content: {
    overflow: 'hidden',
  },
  itemsList: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.sand,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemName: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  itemVariant: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  itemQuantity: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.stone,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  summaryLines: {
    paddingHorizontal: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.charcoal,
  },
  freeValue: {
    color: COLORS.success,
    fontFamily: FONTS.bodySemiBold,
  },
  discountLabel: {
    color: COLORS.success,
  },
  discountValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.success,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.charcoal,
  },
  totalLabel: {
    fontFamily: FONTS.displayMedium,
    fontSize: 16,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.hermes,
  },
});
```

---

## 7. SecurePaymentBadge

> Badge de securite anime inspirant confiance

### Apercu visuel

```
  ___________________________________________
 |  [Shield] Paiement 100% securise          |
 |          Vos donnees sont protegees       |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Shield, Lock, CheckCircle } from 'lucide-react-native';
import { springConfigs } from '@/constants/animations';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

interface SecurePaymentBadgeProps {
  variant?: 'default' | 'compact' | 'prominent';
  animated?: boolean;
}

export function SecurePaymentBadge({
  variant = 'default',
  animated = true,
}: SecurePaymentBadgeProps) {
  // Animation values
  const shieldScale = useSharedValue(0);
  const shieldGlow = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      // Entry animation sequence
      shieldScale.value = withSpring(1, springConfigs.celebration);

      checkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, springConfigs.celebration),
          withSpring(1, springConfigs.button)
        )
      );

      textOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

      // Continuous glow pulse
      shieldGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle scale pulse
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      shieldScale.value = 1;
      checkScale.value = 1;
      textOpacity.value = 1;
    }
  }, [animated]);

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: shieldGlow.value * 0.4,
    transform: [{ scale: pulseScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <Lock size={14} color={COLORS.success} />
        <Text style={styles.compactText}>Paiement securise</Text>
      </View>
    );
  }

  if (variant === 'prominent') {
    return (
      <View style={styles.prominentContainer}>
        {/* Glow Effect */}
        <Animated.View style={[styles.prominentGlow, glowStyle]} />

        {/* Content */}
        <Animated.View style={[styles.prominentContent, shieldStyle]}>
          <View style={styles.prominentIconContainer}>
            <Shield size={32} color={COLORS.success} strokeWidth={1.5} />
            <Animated.View style={[styles.prominentCheck, checkStyle]}>
              <CheckCircle size={14} color={COLORS.success} fill={COLORS.successLight} />
            </Animated.View>
          </View>

          <Animated.View style={textStyle}>
            <Text style={styles.prominentTitle}>Paiement 100% Securise</Text>
            <Text style={styles.prominentSubtitle}>
              Protection SSL 256 bits - Vos donnees sont cryptees
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Trust Indicators */}
        <View style={styles.trustIndicators}>
          <TrustItem icon="visa" />
          <TrustItem icon="mastercard" />
          <TrustItem icon="amex" />
          <TrustItem icon="stripe" />
        </View>
      </View>
    );
  }

  // Default variant
  return (
    <View style={styles.container}>
      {/* Glow Effect */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Shield Icon */}
      <Animated.View style={[styles.iconContainer, shieldStyle]}>
        <Shield size={24} color={COLORS.success} strokeWidth={1.5} />
        <Animated.View style={[styles.checkBadge, checkStyle]}>
          <CheckCircle size={12} color={COLORS.white} fill={COLORS.success} />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.title}>Paiement securise</Text>
        <Text style={styles.subtitle}>Vos donnees sont protegees</Text>
      </Animated.View>
    </View>
  );
}

function TrustItem({ icon }: { icon: string }) {
  return (
    <View style={styles.trustItem}>
      <Image
        source={require(`@/assets/images/${icon}.png`)}
        style={styles.trustLogo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Default variant
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.success,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.success,
  },

  // Prominent variant
  prominentContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.successLight,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  prominentGlow: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    backgroundColor: COLORS.successLight,
    borderRadius: 100,
  },
  prominentContent: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  prominentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  prominentCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  prominentTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
    textAlign: 'center',
  },
  prominentSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  trustItem: {
    opacity: 0.6,
  },
  trustLogo: {
    width: 40,
    height: 24,
  },
});
```

---

## 8. CheckoutButton

> Bouton CTA principal avec etats loading, success et animations premium

### Apercu visuel

```
  ___________________________________________
 |                                           |
 |      [Icon]  Payer 2 040,00 EUR           |
 |                                           |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect, useCallback } from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolateColor,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { ArrowRight, Check, Lock, Loader2 } from 'lucide-react-native';
import { formatPrice } from '@bijoux/utils';
import { springConfigs, timingConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface CheckoutButtonProps {
  amount: number;
  onPress: () => Promise<void> | void;
  state?: ButtonState;
  disabled?: boolean;
  label?: string;
  showSecureIcon?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CheckoutButton({
  amount,
  onPress,
  state = 'idle',
  disabled = false,
  label,
  showSecureIcon = true,
}: CheckoutButtonProps) {
  // Animation values
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  // Icon animations
  const arrowX = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const lockScale = useSharedValue(1);

  // Content opacity
  const idleContentOpacity = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  // Idle glow animation
  useEffect(() => {
    if (state === 'idle' && !disabled) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Subtle arrow hint animation
      arrowX.value = withRepeat(
        withSequence(
          withDelay(3000, withTiming(4, { duration: 200 })),
          withSpring(0, springConfigs.button)
        ),
        -1,
        false
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
      arrowX.value = 0;
    }
  }, [state, disabled]);

  // State transitions
  useEffect(() => {
    switch (state) {
      case 'idle':
        colorProgress.value = withTiming(0, { duration: 200 });
        idleContentOpacity.value = withTiming(1, { duration: 200 });
        loadingOpacity.value = withTiming(0, { duration: 150 });
        successOpacity.value = withTiming(0, { duration: 150 });
        break;

      case 'loading':
        idleContentOpacity.value = withTiming(0, { duration: 150 });
        loadingOpacity.value = withDelay(100, withTiming(1, { duration: 150 }));
        spinnerRotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1,
          false
        );
        break;

      case 'success':
        colorProgress.value = withTiming(1, { duration: 300 });
        loadingOpacity.value = withTiming(0, { duration: 100 });
        successOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
        checkScale.value = withDelay(
          150,
          withSequence(
            withSpring(1.3, springConfigs.celebration),
            withSpring(1, springConfigs.button)
          )
        );

        // Success button pop
        scale.value = withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1.03, springConfigs.celebration),
          withSpring(1, springConfigs.gentle)
        );

        hapticFeedback.addToCartSuccess();
        break;

      case 'error':
        // Shake animation
        scale.value = withSequence(
          withTiming(0.98, { duration: 50 }),
          ...Array(4).fill(null).flatMap(() => [
            withTiming(1.02, { duration: 50 }),
            withTiming(0.98, { duration: 50 }),
          ]),
          withSpring(1, springConfigs.button)
        );
        hapticFeedback.error();
        break;
    }
  }, [state]);

  const handlePressIn = useCallback(() => {
    if (disabled || state !== 'idle') return;
    scale.value = withSpring(0.96, springConfigs.button);
    lockScale.value = withSpring(0.9, springConfigs.button);
    glowOpacity.value = withTiming(0, { duration: 100 });
    hapticFeedback.addToCartPress();
  }, [disabled, state]);

  const handlePressOut = useCallback(() => {
    if (disabled || state !== 'idle') return;
    scale.value = withSpring(1, springConfigs.button);
    lockScale.value = withSpring(1, springConfigs.button);

    // Ripple effect
    rippleScale.value = 0;
    rippleScale.value = withTiming(3, { duration: 600, easing: Easing.out(Easing.ease) });
    rippleOpacity.value = 0.3;
    rippleOpacity.value = withTiming(0, { duration: 600 });
  }, [disabled, state]);

  const handlePress = useCallback(() => {
    if (disabled || state !== 'idle') return;
    onPress();
  }, [disabled, state, onPress]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorProgress.value,
      [0, 1],
      [COLORS.hermes, COLORS.success]
    ),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: idleContentOpacity.value,
  }));

  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
    opacity: idleContentOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: idleContentOpacity.value,
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
    opacity: loadingOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: successOpacity.value,
  }));

  const successTextStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
  }));

  const buttonLabel = label || `Payer ${formatPrice(amount)}`;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || state !== 'idle'}
      style={[styles.container, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityState={{ disabled: disabled || state !== 'idle' }}
    >
      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        {/* Glow */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Ripple */}
        <Animated.View style={[styles.ripple, rippleStyle]} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Idle State */}
        <View style={styles.idleContent}>
          {showSecureIcon && (
            <Animated.View style={lockStyle}>
              <Lock size={18} color={COLORS.white} strokeWidth={2} />
            </Animated.View>
          )}

          <Animated.Text style={[styles.label, textStyle]}>
            {buttonLabel}
          </Animated.Text>

          <Animated.View style={arrowStyle}>
            <ArrowRight size={20} color={COLORS.white} strokeWidth={2} />
          </Animated.View>
        </View>

        {/* Loading State */}
        <Animated.View style={[styles.stateOverlay, spinnerStyle]}>
          <Loader2 size={24} color={COLORS.white} strokeWidth={2} />
        </Animated.View>

        {/* Success State */}
        <Animated.View style={[styles.stateOverlay, styles.successContent]}>
          <Animated.View style={checkStyle}>
            <Check size={24} color={COLORS.white} strokeWidth={3} />
          </Animated.View>
          <Animated.Text style={[styles.successLabel, successTextStyle]}>
            Paiement accepte
          </Animated.Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.pill,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: COLORS.hermes,
    borderRadius: RADIUS.pill + 20,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderRadius: 50,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  stateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  successLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
```

### Etats

| Etat | Background | Contenu | Animation |
|------|------------|---------|-----------|
| **Idle** | `hermes` | Lock + Label + Arrow | Glow pulse, arrow hint |
| **Loading** | `hermes` | Spinner | Rotation continue |
| **Success** | `success` | Check + "Paiement accepte" | Pop + morph couleur |
| **Error** | `hermes` | Label | Shake horizontal |
| **Disabled** | `hermes` 50% | Label | Aucune |

---

## 9. OrderConfirmationOverlay

> Overlay de celebration apres paiement reussi avec animations premium

### Apercu visuel

```
  ___________________________________________
 |                                           |
 |              [Confetti]                   |
 |                                           |
 |            [Success Circle]               |
 |               [Check]                     |
 |                                           |
 |          Commande confirmee !             |
 |          Merci pour votre achat           |
 |                                           |
 |          Commande #MB-12345678            |
 |                                           |
 |     [Voir ma commande]  [Continuer]       |
 |___________________________________________|
```

### Structure JSX

```tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Check, Package, ShoppingBag, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { springConfigs, timingConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Particle configuration
const PARTICLE_COUNT = 20;
const PARTICLE_COLORS = [
  COLORS.hermes,
  COLORS.gold,
  '#fed7aa',
  '#fde68a',
  COLORS.success,
  '#a5f3fc',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  delay: number;
  type: 'circle' | 'square' | 'diamond';
}

// Pre-generate particles
const PARTICLES: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
  y: -(100 + Math.random() * 200),
  size: 4 + Math.random() * 8,
  rotation: Math.random() * 360,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  delay: Math.random() * 300,
  type: ['circle', 'square', 'diamond'][Math.floor(Math.random() * 3)] as Particle['type'],
}));

interface OrderConfirmationOverlayProps {
  visible: boolean;
  orderNumber: string;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}

export function OrderConfirmationOverlay({
  visible,
  orderNumber,
  onViewOrder,
  onContinueShopping,
}: OrderConfirmationOverlayProps) {
  // Animation values
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const successCircleScale = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const orderNumberScale = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(30);

  // Particle animations
  const particleAnimations = PARTICLES.map(() => ({
    translateY: useSharedValue(0),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    rotation: useSharedValue(0),
  }));

  useEffect(() => {
    if (visible) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }, [visible]);

  const showOverlay = useCallback(() => {
    // Haptic feedback
    hapticFeedback.addToCartSuccess();

    // Reset values
    cardScale.value = 0.8;
    successCircleScale.value = 0;
    checkScale.value = 0;
    titleOpacity.value = 0;
    titleY.value = 20;

    // Backdrop fade in
    backdropOpacity.value = withTiming(1, { duration: 300 });

    // Card entrance
    cardScale.value = withSpring(1, springConfigs.celebration);
    cardOpacity.value = withTiming(1, { duration: 200 });

    // Success circle pop
    successCircleScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    // Glow pulse
    glowScale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Checkmark bounce
    checkScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.4, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      )
    );

    // Title slide up
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    titleY.value = withDelay(500, withSpring(0, springConfigs.gentle));

    // Subtitle
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));

    // Order number
    orderNumberScale.value = withDelay(
      700,
      withSequence(
        withSpring(1.1, springConfigs.button),
        withSpring(1, springConfigs.gentle)
      )
    );

    // Buttons
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));
    buttonsY.value = withDelay(800, withSpring(0, springConfigs.gentle));

    // Particles (confetti)
    particleAnimations.forEach((anim, i) => {
      const particle = PARTICLES[i];
      anim.opacity.value = withDelay(
        300 + particle.delay,
        withSequence(
          withTiming(1, { duration: 100 }),
          withDelay(800, withTiming(0, { duration: 600 }))
        )
      );
      anim.scale.value = withDelay(
        300 + particle.delay,
        withSequence(
          withSpring(1, springConfigs.celebration),
          withDelay(800, withTiming(0, { duration: 400 }))
        )
      );
      anim.translateY.value = withDelay(
        300 + particle.delay,
        withTiming(particle.y, { duration: 1200, easing: Easing.out(Easing.quad) })
      );
      anim.rotation.value = withDelay(
        300 + particle.delay,
        withTiming(particle.rotation + 180, { duration: 1200 })
      );
    });
  }, []);

  const hideOverlay = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.9, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 200 });
  }, []);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const successCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successCircleScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: interpolate(glowScale.value, [1, 1.3], [0.5, 0.2], Extrapolate.CLAMP),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const orderNumberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orderNumberScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {PARTICLES.map((particle, i) => (
          <ParticleView
            key={particle.id}
            particle={particle}
            animation={particleAnimations[i]}
          />
        ))}
      </View>

      {/* Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Success Circle */}
        <View style={styles.successContainer}>
          {/* Glow */}
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Circle */}
          <Animated.View style={[styles.successCircle, successCircleStyle]}>
            <Animated.View style={checkStyle}>
              <Check size={48} color={COLORS.success} strokeWidth={3} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Text Content */}
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Commande confirmee !</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Merci pour votre achat. Vous recevrez un email de confirmation.
        </Animated.Text>

        {/* Order Number */}
        <Animated.View style={[styles.orderNumberContainer, orderNumberStyle]}>
          <Package size={16} color={COLORS.stone} />
          <Text style={styles.orderNumberLabel}>Commande</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonsContainer, buttonsStyle]}>
          <Pressable
            onPress={onViewOrder}
            style={styles.secondaryButton}
          >
            <ShoppingBag size={18} color={COLORS.hermes} />
            <Text style={styles.secondaryButtonText}>Voir ma commande</Text>
          </Pressable>

          <Pressable
            onPress={onContinueShopping}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Continuer</Text>
            <ArrowRight size={18} color={COLORS.white} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// Particle component
interface ParticleViewProps {
  particle: Particle;
  animation: {
    translateY: Animated.SharedValue<number>;
    scale: Animated.SharedValue<number>;
    opacity: Animated.SharedValue<number>;
    rotation: Animated.SharedValue<number>;
  };
}

function ParticleView({ particle, animation }: ParticleViewProps) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.x },
      { translateY: animation.translateY.value },
      { rotate: `${animation.rotation.value}deg` },
      { scale: animation.scale.value },
    ],
    opacity: animation.opacity.value,
  }));

  const shapeStyle = {
    width: particle.size,
    height: particle.size,
    backgroundColor: particle.color,
    borderRadius: particle.type === 'circle' ? particle.size / 2 :
                  particle.type === 'diamond' ? 0 : 2,
    transform: particle.type === 'diamond' ? [{ rotate: '45deg' }] : [],
  };

  return (
    <Animated.View style={[styles.particle, style]}>
      <View style={shapeStyle} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 51, 63, 0.5)',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
  card: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.xxl,
  },
  successContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.successLight,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.success,
    ...SHADOWS.md,
  },
  title: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 26,
    color: COLORS.charcoal,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.sand,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  orderNumberLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  orderNumber: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.charcoal,
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    backgroundColor: COLORS.hermesLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.hermes,
  },
  secondaryButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.hermes,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    backgroundColor: COLORS.hermes,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  primaryButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.white,
  },
});
```

---

## Implementation Notes

### Imports requis

```typescript
// Package dependencies
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
  Easing,
  runOnJS,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Local imports
import { springConfigs, timingConfigs, durations } from '@/constants/animations';
import { hapticFeedback, debouncedHaptic } from '@/constants/haptics';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  SIZES,
} from '@/constants/designTokens';
```

### Structure de fichiers recommandee

```
components/
  checkout/
    CheckoutStepIndicator.tsx
    LuxuryTextInput.tsx
    AddressCard.tsx
    ShippingOptionCard.tsx
    PaymentMethodSelector.tsx
    OrderSummaryCard.tsx
    SecurePaymentBadge.tsx
    CheckoutButton.tsx
    OrderConfirmationOverlay.tsx
    index.ts
```

### Export index.ts

```typescript
export { CheckoutStepIndicator } from './CheckoutStepIndicator';
export { LuxuryTextInput } from './LuxuryTextInput';
export { AddressCard } from './AddressCard';
export { ShippingOptionCard } from './ShippingOptionCard';
export { PaymentMethodSelector } from './PaymentMethodSelector';
export { OrderSummaryCard } from './OrderSummaryCard';
export { SecurePaymentBadge } from './SecurePaymentBadge';
export { CheckoutButton } from './CheckoutButton';
export { OrderConfirmationOverlay } from './OrderConfirmationOverlay';
```

---

## Accessibility Checklist

Chaque composant respecte ces standards d'accessibilite :

- [ ] Touch targets minimum 44x44px
- [ ] Contraste couleur WCAG AA (4.5:1 pour texte, 3:1 pour elements UI)
- [ ] `accessibilityRole` defini (button, radio, progressbar, etc.)
- [ ] `accessibilityLabel` descriptif
- [ ] `accessibilityState` pour les etats (selected, disabled, checked)
- [ ] Support VoiceOver/TalkBack
- [ ] Feedback haptique pour les actions importantes
- [ ] Animations desactivables via `prefers-reduced-motion`

---

## Performance Considerations

1. **Animations sur UI thread** : Utilisation exclusive de `react-native-reanimated` pour les animations performantes
2. **Memoisation** : `useMemo` et `useCallback` pour eviter les re-renders inutiles
3. **Composants purs** : Separation des sous-composants pour optimiser le rendering
4. **Images optimisees** : Utilisation de `resizeMode="contain"` et dimensions fixes
5. **Debounced haptics** : Prevention des feedbacks haptiques excessifs

---

*Document genere pour Bijoux Mobile App - Design System v1.0*
*Derniere mise a jour : Decembre 2024*
