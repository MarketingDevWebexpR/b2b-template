/**
 * Checkout Flow Layout
 * Modal presentation with custom header and smooth transitions
 * Luxury jewelry e-commerce checkout experience
 */

import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X, ChevronLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  charcoal: '#2b333f',
  hermes: '#f67828',
  white: '#ffffff',
  textMuted: '#696969',
  borderLight: '#f0ebe3',
};

const FONTS = {
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  displayMedium: 'PlayfairDisplay-Medium',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Custom header component for checkout flow
 */
function CheckoutHeader({
  title,
  showBack = true,
  showClose = true,
}: {
  title: string;
  showBack?: boolean;
  showClose?: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const backScale = useSharedValue(1);
  const closeScale = useSharedValue(1);

  const handleBackPress = useCallback(() => {
    hapticFeedback.softConfirm();
    router.back();
  }, [router]);

  const handleClosePress = useCallback(() => {
    hapticFeedback.softConfirm();
    // Navigate to cart or home, dismissing the modal
    router.dismissAll();
  }, [router]);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      {/* Blur Background for iOS */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Background overlay */}
      <View style={styles.headerBackground} />

      <View style={styles.headerContent}>
        {/* Back Button */}
        <View style={styles.headerSide}>
          {showBack && (
            <AnimatedPressable
              onPress={handleBackPress}
              onPressIn={() => {
                backScale.value = withSpring(0.9, springConfigs.button);
              }}
              onPressOut={() => {
                backScale.value = withSpring(1, springConfigs.button);
              }}
              style={[styles.headerButton, backAnimatedStyle]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Retour"
            >
              <ChevronLeft size={24} color={COLORS.charcoal} strokeWidth={2} />
            </AnimatedPressable>
          )}
        </View>

        {/* Title */}
        <Animated.Text
          entering={FadeIn.duration(300)}
          style={styles.headerTitle}
        >
          {title}
        </Animated.Text>

        {/* Close Button */}
        <View style={styles.headerSide}>
          {showClose && (
            <AnimatedPressable
              onPress={handleClosePress}
              onPressIn={() => {
                closeScale.value = withSpring(0.9, springConfigs.button);
              }}
              onPressOut={() => {
                closeScale.value = withSpring(1, springConfigs.button);
              }}
              style={[styles.headerButton, closeAnimatedStyle]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <X size={22} color={COLORS.charcoal} strokeWidth={2} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {/* Bottom border */}
      <View style={styles.headerBorder} />
    </View>
  );
}

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Commande',
          header: () => (
            <CheckoutHeader title="Commande" showBack={false} showClose={true} />
          ),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="shipping"
        options={{
          title: 'Livraison',
          header: () => (
            <CheckoutHeader title="Livraison" showBack={true} showClose={true} />
          ),
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Paiement',
          header: () => (
            <CheckoutHeader title="Paiement" showBack={true} showClose={true} />
          ),
          headerShown: true,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: 'Confirmation',
          header: () => (
            <CheckoutHeader title="Confirmation" showBack={false} showClose={false} />
          ),
          headerShown: true,
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.background,
    position: 'relative',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 252, 247, 0.85)'
      : COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: FONTS.displayMedium,
    fontSize: 18,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
  },
  headerBorder: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
