/**
 * Shipping Screen
 * Step 1: Address selection/creation and shipping options
 * Luxury jewelry e-commerce checkout experience
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Check } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  CheckoutStepIndicator,
  ShippingOptionCard,
  AddressSelector,
  type ShippingOption,
  type SavedAddress as AddressSelectorAddress,
  type NewAddress,
  type AddressLabel,
} from '@/components/checkout';
import { useCheckout } from '@/hooks/useCheckout';
import {
  useAddresses,
  type SavedAddress as HookSavedAddress,
  type AddressInput,
} from '@/hooks/useAddresses';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback, debouncedHaptic } from '@/constants/haptics';
import {
  COLORS as DESIGN_COLORS,
  FONTS as DESIGN_FONTS,
  SPACING as DESIGN_SPACING,
  RADIUS as DESIGN_RADIUS,
  SHADOWS,
} from '@/constants/designTokens';

// =============================================================================
// LOCAL DESIGN TOKENS
// =============================================================================

const COLORS = {
  background: DESIGN_COLORS.background,
  backgroundBeige: DESIGN_COLORS.backgroundBeige,
  charcoal: DESIGN_COLORS.charcoal,
  hermes: DESIGN_COLORS.hermes,
  hermesLight: DESIGN_COLORS.hermesLight,
  white: DESIGN_COLORS.white,
  textMuted: DESIGN_COLORS.textMuted,
  borderLight: DESIGN_COLORS.borderLight,
  border: DESIGN_COLORS.border,
  success: DESIGN_COLORS.success,
  error: DESIGN_COLORS.error,
  sand: DESIGN_COLORS.sand,
  stone: DESIGN_COLORS.stone,
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
  md: DESIGN_RADIUS.md,
  lg: DESIGN_RADIUS.lg,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =============================================================================
// SHIPPING OPTIONS
// =============================================================================

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Livraison Standard',
    description: 'Livraison gratuite',
    price: 0,
    estimatedDays: '5-7 jours ouvrables',
    speed: 'standard',
    isFree: true,
    isEco: true,
  },
  {
    id: 'express',
    name: 'Livraison Express',
    description: 'Livraison rapide',
    price: 15,
    estimatedDays: '2-3 jours ouvrables',
    speed: 'express',
  },
  {
    id: 'overnight',
    name: 'Livraison Premium',
    description: 'Livraison le lendemain',
    price: 25,
    estimatedDays: 'Demain avant 13h',
    speed: 'overnight',
  },
];

// =============================================================================
// TYPE CONVERSION UTILITIES
// =============================================================================

/**
 * Convert hook's SavedAddress to AddressSelector's SavedAddress format
 */
function toAddressSelectorFormat(address: HookSavedAddress): AddressSelectorAddress {
  const labelMap: Record<string, AddressLabel> = {
    Maison: 'home',
    Bureau: 'work',
    maison: 'home',
    bureau: 'work',
    home: 'home',
    work: 'work',
  };

  return {
    id: address.id,
    label: labelMap[address.label] || 'other',
    firstName: address.firstName,
    lastName: address.lastName,
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
    phone: address.phone,
    isDefault: address.isDefault,
  };
}

/**
 * Convert AddressLabel to display string
 */
function labelToString(label: AddressLabel): string {
  const map: Record<AddressLabel, string> = {
    home: 'Maison',
    work: 'Bureau',
    other: 'Autre',
  };
  return map[label];
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

function SectionHeader({ title, step }: { title: string; step: number }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ShippingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Auth hook - get user email
  const { user } = useAuth();

  // Checkout hook
  const { setShippingAddress, setShippingOption } = useCheckout();

  // Addresses hook
  const { addresses, isLoading: isLoadingAddresses, actions } = useAddresses();

  // Selected address state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<HookSavedAddress | null>(null);

  // Selected shipping option
  const [selectedShipping, setSelectedShipping] = useState<string>('standard');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Button animation
  const buttonScale = useSharedValue(1);

  // Set default address on load
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setSelectedAddress(defaultAddr);
    }
  }, [addresses, selectedAddressId]);

  // Convert addresses for the selector
  const selectorAddresses = useMemo(() => {
    return addresses.map(toAddressSelectorFormat);
  }, [addresses]);

  // Handle address selection
  const handleSelectAddress = useCallback((address: AddressSelectorAddress) => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setSelectedAddressId(address.id);

    // Find the original address from hook
    const original = addresses.find((a) => a.id === address.id);
    if (original) {
      setSelectedAddress(original);
    }
  }, [addresses]);

  // Handle address creation
  const handleCreateAddress = useCallback(
    async (newAddress: NewAddress, save: boolean, setDefault: boolean) => {
      debouncedHaptic(hapticFeedback.addToCartSuccess);

      if (save) {
        try {
          // Convert to hook format
          const addressInput: AddressInput = {
            label: labelToString(newAddress.label),
            firstName: newAddress.firstName,
            lastName: newAddress.lastName,
            address: newAddress.address,
            city: newAddress.city,
            postalCode: newAddress.postalCode,
            phone: newAddress.phone,
            country: 'France',
          };

          const savedAddr = await actions.addAddress(addressInput, setDefault);
          setSelectedAddressId(savedAddr.id);
          setSelectedAddress(savedAddr);
        } catch (error) {
          console.error('Error saving address:', error);
          Alert.alert('Erreur', "Impossible de sauvegarder l'adresse.");
        }
      } else {
        // Create a temporary address object for this session
        const tempAddress: HookSavedAddress = {
          id: `temp_${Date.now()}`,
          label: labelToString(newAddress.label),
          firstName: newAddress.firstName,
          lastName: newAddress.lastName,
          address: newAddress.address,
          city: newAddress.city,
          postalCode: newAddress.postalCode,
          phone: newAddress.phone,
          country: 'France',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setSelectedAddressId(tempAddress.id);
        setSelectedAddress(tempAddress);
      }
    },
    [actions]
  );

  // Handle shipping option selection
  const handleShippingSelect = useCallback((optionId: string) => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setSelectedShipping(optionId);
  }, []);

  // Handle continue button press
  const handleContinue = useCallback(async () => {
    // Check if we have a selected address
    if (!selectedAddress) {
      hapticFeedback.error();
      Alert.alert(
        'Adresse requise',
        'Veuillez sélectionner ou créer une adresse de livraison.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    debouncedHaptic(hapticFeedback.addToCartSuccess);

    try {
      // Save shipping data (email from authenticated user)
      const shippingAddressData = {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        email: user?.email || '',
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        addressLine2: selectedAddress.address2,
        address1: selectedAddress.address,
        address2: selectedAddress.address2,
        city: selectedAddress.city,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      };
      setShippingAddress(shippingAddressData);

      const selectedOption = SHIPPING_OPTIONS.find((opt) => opt.id === selectedShipping);
      if (selectedOption) {
        setShippingOption(selectedOption);
      }

      // Navigate to payment
      router.push('/checkout/payment');
    } catch (error) {
      console.error('Error saving shipping:', error);
      hapticFeedback.error();
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    selectedAddress,
    selectedShipping,
    setShippingAddress,
    setShippingOption,
    router,
  ]);

  // Button press handlers
  const handlePressIn = useCallback(() => {
    buttonScale.value = withSpring(0.96, springConfigs.button);
    debouncedHaptic(hapticFeedback.addToCartPress);
  }, []);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(1, springConfigs.button);
  }, []);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Selected shipping option details
  const selectedShippingOption = useMemo(
    () => SHIPPING_OPTIONS.find((opt) => opt.id === selectedShipping),
    [selectedShipping]
  );

  // Check if form is complete
  const isFormComplete = selectedAddress !== null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Step Indicator */}
      <CheckoutStepIndicator currentStep="shipping" completedSteps={[]} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Address Selection Section */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.addressSection}
          >
            <SectionHeader title="Adresse de livraison" step={1} />

            <View style={styles.addressContainer}>
              <AddressSelector
                savedAddresses={selectorAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={handleSelectAddress}
                onCreateAddress={handleCreateAddress}
                isLoading={isLoadingAddresses || isLoading}
              />
            </View>
          </Animated.View>

          {/* Shipping Options Section */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.shippingOptionsSection}
          >
            <SectionHeader title="Mode de livraison" step={2} />

            <View style={styles.shippingOptionsContainer}>
              {SHIPPING_OPTIONS.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(200 + index * 50).duration(400)}
                >
                  <ShippingOptionCard
                    option={option}
                    isSelected={selectedShipping === option.id}
                    onSelect={() => handleShippingSelect(option.id)}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Selected shipping summary */}
          {selectedShippingOption && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(400)}
              style={styles.shippingSummary}
            >
              <View style={styles.summaryCheck}>
                <Check size={16} color={COLORS.success} strokeWidth={2.5} />
              </View>
              <Text style={styles.summaryText}>
                {selectedShippingOption.name} - {selectedShippingOption.estimatedDays}
              </Text>
            </Animated.View>
          )}

          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Continue Button */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
        <AnimatedPressable
          onPress={handleContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLoading}
          style={[
            styles.continueButton,
            buttonAnimatedStyle,
            isLoading && styles.buttonDisabled,
            !isFormComplete && styles.buttonIncomplete,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continuer vers le paiement"
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Chargement...' : 'Continuer vers le paiement'}
          </Text>
          {!isLoading && <ArrowRight size={20} color={COLORS.white} strokeWidth={2} />}
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.hermes,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepNumber: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.white,
  },
  sectionTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
  },

  // Address section
  addressSection: {
    marginTop: SPACING.sm,
  },
  addressContainer: {
    marginHorizontal: SPACING.md,
  },

  // Shipping options
  shippingOptionsSection: {
    marginTop: SPACING.lg,
  },
  shippingOptionsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  // Summary
  shippingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.success,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 40,
  },

  // Bottom container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.hermes,
    paddingVertical: 18,
    borderRadius: 28,
    gap: SPACING.sm,
    ...SHADOWS.hermesShadow,
  },
  continueButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIncomplete: {
    opacity: 0.85,
  },
});
