/**
 * OrderProductItem Component
 *
 * Displays a single product from an order with image, name, quantity, and price.
 * Features elegant styling and optional tap-to-view functionality.
 *
 * @module components/orders/OrderProductItem
 */

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Package } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '@/constants/designTokens';
import { formatPrice } from '@bijoux/utils';
import { hapticFeedback } from '@/constants/haptics';

// =============================================================================
// TYPES
// =============================================================================

export interface OrderProductItemProps {
  /** Product ID for navigation */
  productId: string;
  /** Product name */
  productName: string;
  /** Product image URL */
  productImage?: string;
  /** Quantity ordered */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
  /** Total price for this line item */
  totalPrice: number;
  /** Animation delay index */
  index?: number;
  /** Whether to allow navigation to product */
  allowNavigation?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OrderProductItem({
  productId,
  productName,
  productImage,
  quantity,
  unitPrice,
  totalPrice,
  index = 0,
  allowNavigation = true,
}: OrderProductItemProps): JSX.Element {
  const router = useRouter();

  const handlePress = () => {
    if (allowNavigation) {
      hapticFeedback.navigation();
      router.push(`/product/${productId}`);
    }
  };

  const Container = allowNavigation ? Pressable : View;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={styles.container}
    >
      <Container
        onPress={allowNavigation ? handlePress : undefined}
        style={({ pressed }: { pressed?: boolean }) => [
          styles.inner,
          pressed && allowNavigation && styles.pressed,
        ]}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Package size={24} color={COLORS.stone} strokeWidth={1.5} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.quantity}>Quantité : {quantity}</Text>
            {quantity > 1 && (
              <Text style={styles.unitPrice}>
                {formatPrice(unitPrice)} / unité
              </Text>
            )}
          </View>

          <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
        </View>
      </Container>
    </Animated.View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },

  inner: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  pressed: {
    opacity: 0.9,
    backgroundColor: COLORS.backgroundBeige,
  },

  imageContainer: {
    marginRight: SPACING.sm,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundBeige,
  },

  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  productName: {
    fontFamily: FONTS.displayMedium,
    fontSize: FONT_SIZES.body,
    color: COLORS.charcoal,
    lineHeight: FONT_SIZES.body * 1.3,
    marginBottom: SPACING.xxs,
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },

  quantity: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  unitPrice: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.caption,
    color: COLORS.stone,
  },

  totalPrice: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.hermes,
    marginTop: SPACING.xxs,
  },
});

export default OrderProductItem;
