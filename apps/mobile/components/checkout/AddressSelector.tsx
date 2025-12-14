/**
 * AddressSelector Component
 * Elegant address selection and creation component with animated interactions
 * Features saved address cards, collapsible new address form, and touch-friendly validation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  LayoutAnimation,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  FadeIn,
  FadeOut,
  SlideInDown,
  Layout,
} from 'react-native-reanimated';
import {
  Home,
  Briefcase,
  MapPin,
  Plus,
  Check,
  ChevronDown,
  AlertCircle,
  User,
  Phone,
} from 'lucide-react-native';
import { springConfigs, timingConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
import {
  COLORS as DESIGN_COLORS,
  FONTS as DESIGN_FONTS,
  SPACING as DESIGN_SPACING,
  RADIUS as DESIGN_RADIUS,
  SHADOWS,
} from '../../constants/designTokens';

// =============================================================================
// LOCAL DESIGN TOKENS
// =============================================================================

const COLORS = {
  background: DESIGN_COLORS.background,
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  hermesLightAlpha: 'rgba(246, 120, 40, 0.15)',
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  textSecondary: DESIGN_COLORS.textSecondary,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  border: DESIGN_COLORS.border,
  borderLight: DESIGN_COLORS.borderLight,
  success: DESIGN_COLORS.success,
  successLight: DESIGN_COLORS.successLight,
  error: DESIGN_COLORS.error,
  errorLight: DESIGN_COLORS.errorLight,
  accentGlow: DESIGN_COLORS.accentGlow,
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
  xl: DESIGN_RADIUS.xl,
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Address label types */
export type AddressLabel = 'home' | 'work' | 'other';

/** Saved address structure */
export interface SavedAddress {
  id: string;
  label: AddressLabel;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

/** New address creation structure */
export interface NewAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  label: AddressLabel;
}

/** Component props */
interface AddressSelectorProps {
  /** List of saved addresses */
  savedAddresses: SavedAddress[];
  /** Currently selected address ID */
  selectedAddressId: string | null;
  /** Callback when a saved address is selected */
  onSelectAddress: (address: SavedAddress) => void;
  /** Callback when a new address is created */
  onCreateAddress: (address: NewAddress, save: boolean, setDefault: boolean) => void;
  /** Loading state */
  isLoading?: boolean;
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Icon mapping for address labels */
const LABEL_ICONS: Record<AddressLabel, typeof Home> = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

/** Label display names */
const LABEL_NAMES: Record<AddressLabel, string> = {
  home: 'Maison',
  work: 'Bureau',
  other: 'Autre',
};

// =============================================================================
// ADDRESS CARD COMPONENT
// =============================================================================

interface AddressCardProps {
  address: SavedAddress;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function AddressCard({ address, isSelected, onSelect, disabled }: AddressCardProps) {
  const scale = useSharedValue(1);
  const borderProgress = useSharedValue(isSelected ? 1 : 0);
  const radioScale = useSharedValue(isSelected ? 1 : 0);
  const glowOpacity = useSharedValue(0);

  const Icon = LABEL_ICONS[address.label];

  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withTiming(1, { duration: 200 });
      radioScale.value = withSpring(1, springConfigs.celebration);
      glowOpacity.value = withSequence(
        withTiming(0.6, { duration: 150 }),
        withTiming(0.3, { duration: 300 })
      );
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
      radioScale.value = withTiming(0, { duration: 150 });
      glowOpacity.value = withTiming(0, { duration: 200 });
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
    debouncedHaptic(hapticFeedback.softConfirm);
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
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

  const fullName = `${address.firstName} ${address.lastName}`;
  const fullAddress = `${address.address}, ${address.postalCode} ${address.city}`;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.addressCardContainer, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={`${LABEL_NAMES[address.label]}, ${fullName}, ${fullAddress}`}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.cardGlow, glowStyle]} />

      <Animated.View style={[styles.addressCard, cardStyle]}>
        {/* Radio Button */}
        <Animated.View style={[styles.radioOuter, radioOuterStyle]}>
          <Animated.View style={[styles.radioInner, radioInnerStyle]} />
        </Animated.View>

        {/* Icon */}
        <View
          style={[
            styles.labelIconContainer,
            isSelected && styles.labelIconContainerSelected,
          ]}
        >
          <Icon size={20} color={isSelected ? COLORS.hermes : COLORS.stone} />
        </View>

        {/* Content */}
        <View style={styles.addressContent}>
          <View style={styles.addressHeader}>
            <Text style={[styles.addressLabel, isSelected && styles.addressLabelSelected]}>
              {LABEL_NAMES[address.label]}
            </Text>
            {address.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Par défaut</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressName}>{fullName}</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {fullAddress}
          </Text>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
}

// =============================================================================
// LUXURY TEXT INPUT COMPONENT
// =============================================================================

interface LuxuryInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  touched?: boolean;
  leftIcon?: React.ReactNode;
  required?: boolean;
}

function LuxuryInput({
  label,
  value,
  onChangeText,
  error,
  touched,
  leftIcon,
  required,
  onBlur,
  ...textInputProps
}: LuxuryInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const shouldFloat = isFocused || value.length > 0;
  const showError = touched && error;

  useEffect(() => {
    labelPosition.value = withSpring(shouldFloat ? 1 : 0, springConfigs.gentle);
  }, [shouldFloat]);

  useEffect(() => {
    if (isFocused) {
      borderProgress.value = withTiming(1, { duration: 200 });
    } else {
      borderProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused]);

  // Shake animation on error (only after touch)
  useEffect(() => {
    if (showError) {
      debouncedHaptic(hapticFeedback.error);
      shakeX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [showError, error]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    debouncedHaptic(hapticFeedback.softConfirm);
  }, []);

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

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
        showError ? [COLORS.error, COLORS.error] : [COLORS.textMuted, COLORS.hermes]
      ),
    };
  });

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      showError
        ? [COLORS.error, COLORS.error]
        : [COLORS.border, COLORS.hermes]
    ),
    borderWidth: isFocused ? 2 : 1,
  }));

  const getIconColor = () => {
    if (showError) return COLORS.error;
    if (isFocused) return COLORS.hermes;
    return COLORS.stone;
  };

  return (
    <Animated.View style={[styles.inputContainer, containerStyle]}>
      <AnimatedPressable
        onPress={() => inputRef.current?.focus()}
        style={[styles.inputWrapper, borderStyle]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {React.cloneElement(leftIcon as React.ReactElement, {
              color: getIconColor(),
              size: 20,
            })}
          </View>
        )}

        <View style={styles.inputArea}>
          <Animated.Text
            style={[styles.label, labelStyle, leftIcon ? styles.labelWithIcon : undefined]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
            placeholderTextColor={COLORS.stone}
            selectionColor={COLORS.hermes}
            accessibilityLabel={label}
            accessibilityHint={showError ? error : undefined}
            {...textInputProps}
          />
        </View>
      </AnimatedPressable>

      {showError && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.errorContainer}
        >
          <AlertCircle size={14} color={COLORS.error} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// =============================================================================
// ANIMATED CHECKBOX COMPONENT
// =============================================================================

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}

function AnimatedCheckbox({ checked, onToggle, label, disabled }: AnimatedCheckboxProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(checked ? 1 : 0);
  const backgroundProgress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (checked) {
      checkScale.value = withSpring(1, springConfigs.celebration);
      backgroundProgress.value = withTiming(1, { duration: 200 });
    } else {
      checkScale.value = withTiming(0, { duration: 150 });
      backgroundProgress.value = withTiming(0, { duration: 200 });
    }
  }, [checked]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    debouncedHaptic(hapticFeedback.softConfirm);
    onToggle();
  }, [disabled, onToggle]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springConfigs.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [COLORS.white, COLORS.hermes]
    ),
    borderColor: interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [COLORS.border, COLORS.hermes]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.checkboxContainer, containerStyle]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.checkboxBox, boxStyle]}>
        <Animated.View style={checkStyle}>
          <Check size={14} color={COLORS.white} strokeWidth={3} />
        </Animated.View>
      </Animated.View>
      <Text style={[styles.checkboxLabel, disabled && styles.checkboxLabelDisabled]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// LABEL SELECTOR COMPONENT
// =============================================================================

interface LabelSelectorProps {
  selected: AddressLabel;
  onSelect: (label: AddressLabel) => void;
}

function LabelSelector({ selected, onSelect }: LabelSelectorProps) {
  const labels: AddressLabel[] = ['home', 'work', 'other'];

  return (
    <View style={styles.labelSelectorContainer}>
      <Text style={styles.labelSelectorTitle}>Type d'adresse</Text>
      <View style={styles.labelOptions}>
        {labels.map((labelType) => {
          const Icon = LABEL_ICONS[labelType];
          const isSelected = selected === labelType;

          return (
            <LabelOption
              key={labelType}
              icon={Icon}
              label={LABEL_NAMES[labelType]}
              isSelected={isSelected}
              onSelect={() => {
                debouncedHaptic(hapticFeedback.softConfirm);
                onSelect(labelType);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

interface LabelOptionProps {
  icon: typeof Home;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

function LabelOption({ icon: Icon, label, isSelected, onSelect }: LabelOptionProps) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isSelected ? 1 : 0, springConfigs.button);
  }, [isSelected]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.sand, COLORS.hermesLightAlpha]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [COLORS.sand, COLORS.hermes]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={() => {
        scale.value = withSpring(0.95, springConfigs.button);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springConfigs.button);
      }}
      style={[styles.labelOption, containerStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
    >
      <Icon size={18} color={isSelected ? COLORS.hermes : COLORS.textMuted} />
      <Text style={[styles.labelOptionText, isSelected && styles.labelOptionTextSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// NEW ADDRESS FORM COMPONENT
// =============================================================================

interface NewAddressFormProps {
  onSubmit: (address: NewAddress, save: boolean, setDefault: boolean) => void;
  isLoading?: boolean;
}

function NewAddressForm({ onSubmit, isLoading }: NewAddressFormProps) {
  const [formData, setFormData] = useState<NewAddress>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    label: 'home',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saveAddress, setSaveAddress] = useState(true);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const updateField = useCallback(
    (field: keyof NewAddress) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const markTouched = useCallback(
    (field: keyof NewAddress) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  // Validation
  const errors: Partial<Record<keyof NewAddress, string>> = {};
  if (!formData.firstName.trim()) errors.firstName = 'Prénom requis';
  if (!formData.lastName.trim()) errors.lastName = 'Nom requis';
  if (!formData.address.trim()) errors.address = 'Adresse requise';
  if (!formData.city.trim()) errors.city = 'Ville requise';
  if (!formData.postalCode.trim()) {
    errors.postalCode = 'Code postal requis';
  } else if (!/^\d{5}$/.test(formData.postalCode)) {
    errors.postalCode = 'Code postal invalide';
  }
  if (!formData.phone.trim()) {
    errors.phone = 'Téléphone requis';
  } else if (!/^(\+33|0)[1-9](\d{2}){4}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Numéro invalide';
  }

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (isValid) {
      debouncedHaptic(hapticFeedback.addToCartSuccess);
      onSubmit(formData, saveAddress, setAsDefault);
    } else {
      debouncedHaptic(hapticFeedback.error);
    }
  }, [formData, isValid, onSubmit, saveAddress, setAsDefault]);

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(150)}
      style={styles.formContainer}
    >
      {/* Name Row */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <LuxuryInput
            label="Prénom"
            value={formData.firstName}
            onChangeText={updateField('firstName')}
            onBlur={markTouched('firstName')}
            error={errors.firstName}
            touched={touched.firstName}
            leftIcon={<User />}
            required
            autoCapitalize="words"
            textContentType="givenName"
          />
        </View>
        <View style={styles.halfField}>
          <LuxuryInput
            label="Nom"
            value={formData.lastName}
            onChangeText={updateField('lastName')}
            onBlur={markTouched('lastName')}
            error={errors.lastName}
            touched={touched.lastName}
            required
            autoCapitalize="words"
            textContentType="familyName"
          />
        </View>
      </View>

      {/* Address */}
      <LuxuryInput
        label="Adresse"
        value={formData.address}
        onChangeText={updateField('address')}
        onBlur={markTouched('address')}
        error={errors.address}
        touched={touched.address}
        leftIcon={<MapPin />}
        required
        autoCapitalize="words"
        textContentType="streetAddressLine1"
      />

      {/* City and Postal Code */}
      <View style={styles.row}>
        <View style={styles.twoThirdField}>
          <LuxuryInput
            label="Ville"
            value={formData.city}
            onChangeText={updateField('city')}
            onBlur={markTouched('city')}
            error={errors.city}
            touched={touched.city}
            required
            autoCapitalize="words"
            textContentType="addressCity"
          />
        </View>
        <View style={styles.thirdField}>
          <LuxuryInput
            label="Code postal"
            value={formData.postalCode}
            onChangeText={updateField('postalCode')}
            onBlur={markTouched('postalCode')}
            error={errors.postalCode}
            touched={touched.postalCode}
            required
            keyboardType="numeric"
            textContentType="postalCode"
            maxLength={5}
          />
        </View>
      </View>

      {/* Phone */}
      <LuxuryInput
        label="Téléphone"
        value={formData.phone}
        onChangeText={updateField('phone')}
        onBlur={markTouched('phone')}
        error={errors.phone}
        touched={touched.phone}
        leftIcon={<Phone />}
        required
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />

      {/* Label Selector */}
      <LabelSelector
        selected={formData.label}
        onSelect={(label) => setFormData((prev) => ({ ...prev, label }))}
      />

      {/* Options */}
      <View style={styles.optionsContainer}>
        <AnimatedCheckbox
          checked={saveAddress}
          onToggle={() => setSaveAddress(!saveAddress)}
          label="Sauvegarder cette adresse"
        />
        <AnimatedCheckbox
          checked={setAsDefault}
          onToggle={() => setSetAsDefault(!setAsDefault)}
          label="Définir comme adresse par défaut"
          disabled={!saveAddress}
        />
      </View>

      {/* Submit Button */}
      <SubmitButton
        onPress={handleSubmit}
        isLoading={isLoading}
        disabled={isLoading}
      />
    </Animated.View>
  );
}

// =============================================================================
// SUBMIT BUTTON COMPONENT
// =============================================================================

interface SubmitButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

function SubmitButton({ onPress, isLoading, disabled }: SubmitButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.96, springConfigs.button);
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.6 : 1,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.submitButton, buttonStyle]}
      accessibilityRole="button"
      accessibilityLabel="Utiliser cette adresse"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.submitButtonText}>
        {isLoading ? 'Chargement...' : 'Utiliser cette adresse'}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// NEW ADDRESS BUTTON COMPONENT
// =============================================================================

interface NewAddressButtonProps {
  isExpanded: boolean;
  onPress: () => void;
}

function NewAddressButton({ isExpanded, onPress }: NewAddressButtonProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0, springConfigs.button);
  }, [isExpanded]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.button);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.newAddressButton, containerStyle]}
      accessibilityRole="button"
      accessibilityLabel={isExpanded ? 'Fermer le formulaire' : 'Ajouter une nouvelle adresse'}
      accessibilityState={{ expanded: isExpanded }}
    >
      <Animated.View style={iconStyle}>
        {isExpanded ? (
          <ChevronDown size={20} color={COLORS.hermes} />
        ) : (
          <Plus size={20} color={COLORS.hermes} />
        )}
      </Animated.View>
      <Text style={styles.newAddressButtonText}>
        {isExpanded ? 'Annuler' : 'Nouvelle adresse'}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AddressSelector({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onCreateAddress,
  isLoading = false,
}: AddressSelectorProps) {
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const toggleForm = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormExpanded((prev) => !prev);
  }, []);

  const handleSelectAddress = useCallback(
    (address: SavedAddress) => {
      if (isFormExpanded) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsFormExpanded(false);
      }
      onSelectAddress(address);
    },
    [isFormExpanded, onSelectAddress]
  );

  const handleCreateAddress = useCallback(
    (address: NewAddress, save: boolean, setDefault: boolean) => {
      onCreateAddress(address, save, setDefault);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsFormExpanded(false);
    },
    [onCreateAddress]
  );

  const hasSavedAddresses = savedAddresses.length > 0;

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Adresse de livraison</Text>

      {/* Saved Addresses List */}
      {hasSavedAddresses && (
        <Animated.View layout={Layout.springify()} style={styles.addressList}>
          {savedAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={() => handleSelectAddress(address)}
              disabled={isLoading}
            />
          ))}
        </Animated.View>
      )}

      {/* New Address Section */}
      <View style={styles.newAddressSection}>
        <NewAddressButton isExpanded={isFormExpanded} onPress={toggleForm} />

        {isFormExpanded && (
          <NewAddressForm onSubmit={handleCreateAddress} isLoading={isLoading} />
        )}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 20,
    color: COLORS.charcoal,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  addressList: {
    marginBottom: SPACING.md,
  },

  // Address Card
  addressCardContainer: {
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accentGlow,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.subtle,
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
  labelIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  labelIconContainerSelected: {
    backgroundColor: COLORS.hermesLightAlpha,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addressLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.charcoal,
  },
  addressLabelSelected: {
    color: COLORS.hermes,
  },
  defaultBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  defaultBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressName: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  addressText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // New Address Button
  newAddressSection: {
    marginTop: SPACING.xs,
  },
  newAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.hermes,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
  },
  newAddressButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 15,
    color: COLORS.hermes,
    marginLeft: SPACING.sm,
  },

  // Form Container
  formContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.sand,
    borderRadius: RADIUS.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 0.4,
  },
  twoThirdField: {
    flex: 0.6,
  },

  // Input Styles
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: SPACING.xs,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.error,
  },

  // Label Selector
  labelSelectorContainer: {
    marginBottom: SPACING.md,
  },
  labelSelectorTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
  },
  labelOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  labelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  labelOptionText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  labelOptionTextSelected: {
    color: COLORS.hermes,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.charcoal,
    flex: 1,
  },
  checkboxLabelDisabled: {
    color: COLORS.textMuted,
  },

  // Options
  optionsContainer: {
    marginBottom: SPACING.md,
  },

  // Submit Button
  submitButton: {
    backgroundColor: COLORS.hermes,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  submitButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default AddressSelector;
