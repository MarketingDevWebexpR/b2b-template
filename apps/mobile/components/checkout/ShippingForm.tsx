/**
 * ShippingForm Component
 * A premium shipping address form with animated floating labels
 * Features smooth focus transitions, error shaking, and haptic feedback
 */

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  FadeIn,
} from 'react-native-reanimated';
import {
  AlertCircle,
  Check,
  User,
  Phone,
  MapPin,
  Building,
  Home,
} from 'lucide-react-native';
import { springConfigs, timingConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS } from '../../constants/designTokens';

const COLORS = {
  background: DESIGN_COLORS.background,
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  border: DESIGN_COLORS.border,
  borderLight: DESIGN_COLORS.borderLight,
  success: DESIGN_COLORS.success,
  successLight: DESIGN_COLORS.successLight,
  error: DESIGN_COLORS.error,
  errorLight: DESIGN_COLORS.errorLight,
};

const FONTS = {
  body: DESIGN_FONTS.body,
  bodyMedium: DESIGN_FONTS.bodyMedium,
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
  displayMedium: DESIGN_FONTS.displayMedium,
};

const SPACING = {
  xs: DESIGN_SPACING.xxs,
  sm: DESIGN_SPACING.xs,
  md: DESIGN_SPACING.md,
  lg: DESIGN_SPACING.xl,
  xl: DESIGN_SPACING.xxl,
};

const RADIUS = {
  sm: DESIGN_RADIUS.sm,
  md: DESIGN_RADIUS.md,
  lg: DESIGN_RADIUS.lg,
};

// Address interface
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
}

interface ShippingFormProps {
  /** Initial address values */
  initialValues?: Partial<ShippingAddress>;
  /** Callback when form is submitted with valid data */
  onSubmit: (address: ShippingAddress) => void;
  /** Field-level errors from validation */
  errors?: Partial<Record<keyof ShippingAddress, string>>;
  /** Whether the form is in loading state */
  isLoading?: boolean;
}

/** Ref handle for ShippingForm imperative methods */
export interface ShippingFormRef {
  /** Mark all fields as touched to show validation errors */
  touchAllFields: () => void;
  /** Get current form data */
  getFormData: () => ShippingAddress;
}

// Animated text input with floating label
interface LuxuryTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onFieldBlur?: () => void;
  error?: string;
  showError?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function LuxuryTextInput({
  label,
  value,
  onChangeText,
  onFieldBlur,
  error,
  showError = true,
  success,
  leftIcon,
  required,
  disabled,
  ...textInputProps
}: LuxuryTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Track if error was previously shown (for shake animation)
  const wasErrorShown = useRef(false);

  // Animation values
  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(0);

  // Determine if we should display the error
  const displayError = showError && error;

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

  // Error shake animation - only trigger when error first appears
  useEffect(() => {
    if (displayError && !wasErrorShown.current) {
      // Error just appeared - trigger shake and haptic
      hapticFeedback.error();
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    wasErrorShown.current = !!displayError;
  }, [displayError]);

  // Success animation
  useEffect(() => {
    if (success) {
      successScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, springConfigs.celebration),
        withSpring(1, springConfigs.button)
      );
      debouncedHaptic(hapticFeedback.softConfirm);
    } else {
      successScale.value = withTiming(0, { duration: 150 });
    }
  }, [success]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onFieldBlur?.();
  }, [onFieldBlur]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const labelStyle = useAnimatedStyle(() => {
    const translateY = labelPosition.value * -24;
    const scale = 1 - labelPosition.value * 0.15;

    return {
      transform: [{ translateY }, { scale }],
      color: interpolateColor(
        borderProgress.value,
        [0, 1],
        displayError ? [COLORS.error, COLORS.error] : [COLORS.textMuted, COLORS.hermes]
      ),
    };
  });

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      displayError
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
    backgroundColor: displayError ? COLORS.error : COLORS.hermes,
  }));

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value,
  }));

  // Icon color based on state
  const getIconColor = () => {
    if (displayError) return COLORS.error;
    if (success) return COLORS.success;
    if (isFocused) return COLORS.hermes;
    return COLORS.stone;
  };

  return (
    <Animated.View style={[styles.inputContainer, containerStyle]}>
      <AnimatedPressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputWrapper, borderStyle]}
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

        {/* Input Area */}
        <View style={styles.inputArea}>
          {/* Floating Label */}
          <Animated.Text
            style={[
              styles.label,
              labelStyle,
              leftIcon ? styles.labelWithIcon : undefined,
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
              (success) && styles.inputWithRightIcon,
              disabled && styles.inputDisabled,
            ]}
            editable={!disabled}
            placeholderTextColor={COLORS.stone}
            selectionColor={COLORS.hermes}
            accessibilityLabel={label}
            accessibilityHint={error || undefined}
            {...textInputProps}
          />
        </View>

        {/* Right Side - Success Icon */}
        <View style={styles.rightContainer}>
          {success && (
            <Animated.View style={[styles.successIcon, successIconStyle]}>
              <Check size={18} color={COLORS.success} strokeWidth={2.5} />
            </Animated.View>
          )}
        </View>

        {/* Bottom Accent Line */}
        <Animated.View style={[styles.underline, underlineStyle]} />
      </AnimatedPressable>

      {/* Helper/Error Text */}
      {displayError && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.helperContainer}
        >
          <AlertCircle
            size={14}
            color={COLORS.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * Main ShippingForm component
 */
export const ShippingForm = forwardRef<ShippingFormRef, ShippingFormProps>(
  function ShippingForm(
    {
      initialValues = {},
      onSubmit,
      errors = {},
      isLoading = false,
    },
    ref
  ) {
  // Form state
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: initialValues.firstName || '',
    lastName: initialValues.lastName || '',
    phone: initialValues.phone || '',
    address1: initialValues.address1 || '',
    address2: initialValues.address2 || '',
    city: initialValues.city || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || 'France',
  });

  // Track which fields have been touched (blurred at least once)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update a specific field
  const updateField = useCallback(
    (field: keyof ShippingAddress) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle blur to mark field as touched
  const handleFieldBlur = useCallback(
    (field: keyof ShippingAddress) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  // Touch all fields (useful for form submission)
  const touchAllFields = useCallback(() => {
    const allTouched: Record<string, boolean> = {};
    (Object.keys(formData) as Array<keyof ShippingAddress>).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
  }, [formData]);

  // Check if error should be shown (field touched and has error)
  const shouldShowError = (field: keyof ShippingAddress): boolean => {
    return Boolean(touched[field] && errors[field]);
  };

  // Check if a field is valid (touched, has value, and no error)
  const isFieldValid = (field: keyof ShippingAddress): boolean => {
    return Boolean(touched[field] && formData[field] && !errors[field]);
  };

  // Expose imperative methods to parent via ref
  useImperativeHandle(ref, () => ({
    touchAllFields,
    getFormData: () => formData,
  }), [touchAllFields, formData]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.formContainer}
      >
        {/* Section Title */}
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>

        {/* Name Row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <LuxuryTextInput
              label="Prénom"
              value={formData.firstName}
              onChangeText={updateField('firstName')}
              onFieldBlur={handleFieldBlur('firstName')}
              error={errors.firstName}
              showError={shouldShowError('firstName')}
              success={isFieldValid('firstName')}
              leftIcon={<User />}
              required
              autoCapitalize="words"
              textContentType="givenName"
            />
          </View>
          <View style={styles.halfField}>
            <LuxuryTextInput
              label="Nom"
              value={formData.lastName}
              onChangeText={updateField('lastName')}
              onFieldBlur={handleFieldBlur('lastName')}
              error={errors.lastName}
              showError={shouldShowError('lastName')}
              success={isFieldValid('lastName')}
              required
              autoCapitalize="words"
              textContentType="familyName"
            />
          </View>
        </View>

        {/* Phone */}
        <LuxuryTextInput
          label="Téléphone"
          value={formData.phone}
          onChangeText={updateField('phone')}
          onFieldBlur={handleFieldBlur('phone')}
          error={errors.phone}
          showError={shouldShowError('phone')}
          success={isFieldValid('phone')}
          leftIcon={<Phone />}
          required
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Address Line 1 */}
        <LuxuryTextInput
          label="Adresse"
          value={formData.address1}
          onChangeText={updateField('address1')}
          onFieldBlur={handleFieldBlur('address1')}
          error={errors.address1}
          showError={shouldShowError('address1')}
          success={isFieldValid('address1')}
          leftIcon={<MapPin />}
          required
          autoCapitalize="words"
          textContentType="streetAddressLine1"
        />

        {/* Address Line 2 */}
        <LuxuryTextInput
          label="Complément d'adresse (optionnel)"
          value={formData.address2 || ''}
          onChangeText={updateField('address2')}
          onFieldBlur={handleFieldBlur('address2')}
          error={errors.address2}
          showError={shouldShowError('address2')}
          leftIcon={<Building />}
          autoCapitalize="words"
          textContentType="streetAddressLine2"
        />

        {/* City and Postal Code Row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <LuxuryTextInput
              label="Ville"
              value={formData.city}
              onChangeText={updateField('city')}
              onFieldBlur={handleFieldBlur('city')}
              error={errors.city}
              showError={shouldShowError('city')}
              success={isFieldValid('city')}
              leftIcon={<Home />}
              required
              autoCapitalize="words"
              textContentType="addressCity"
            />
          </View>
          <View style={styles.halfField}>
            <LuxuryTextInput
              label="Code postal"
              value={formData.postalCode}
              onChangeText={updateField('postalCode')}
              onFieldBlur={handleFieldBlur('postalCode')}
              error={errors.postalCode}
              showError={shouldShowError('postalCode')}
              success={isFieldValid('postalCode')}
              required
              keyboardType="numeric"
              textContentType="postalCode"
            />
          </View>
        </View>

        {/* Country - Fixed for now */}
        <LuxuryTextInput
          label="Pays"
          value={formData.country}
          onChangeText={updateField('country')}
          onFieldBlur={handleFieldBlur('country')}
          error={errors.country}
          showError={shouldShowError('country')}
          success={isFieldValid('country')}
          required
          disabled
          textContentType="countryName"
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    color: COLORS.charcoal,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfField: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.lg,
  },
  // Input styles
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputWrapper: {
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
  inputArea: {
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
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.error,
  },
});

export default ShippingForm;
