/**
 * OrderSummary Component
 * Collapsible order summary card with items list and price breakdown
 * Features smooth expand/collapse animation and elegant typography
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
} from 'react-native-reanimated';
import { ChevronDown, Tag, Truck } from 'lucide-react-native';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens - Import from centralized file for consistency
import { COLORS as DESIGN_COLORS, FONTS as DESIGN_FONTS, SPACING as DESIGN_SPACING, RADIUS as DESIGN_RADIUS, SHADOWS } from '../../constants/designTokens';

const COLORS = {
  hermes: DESIGN_COLORS.hermes,
  charcoal: DESIGN_COLORS.charcoal,
  textMuted: DESIGN_COLORS.textMuted,
  white: DESIGN_COLORS.white,
  stone: DESIGN_COLORS.stone,
  sand: DESIGN_COLORS.sand,
  borderLight: DESIGN_COLORS.borderLight,
  backgroundBeige: DESIGN_COLORS.backgroundBeige,
  success: DESIGN_COLORS.success,
};

const FONTS = {
  body: DESIGN_FONTS.body,
  bodyMedium: DESIGN_FONTS.bodyMedium,
  bodySemiBold: DESIGN_FONTS.bodySemiBold,
  displayMedium: DESIGN_FONTS.displayMedium,
  displayBold: DESIGN_FONTS.displayBold,
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

// Cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface OrderSummaryProps {
  /** List of cart items */
  items: CartItem[];
  /** Cart subtotal before shipping/discounts */
  subtotal: number;
  /** Shipping cost (0 for free shipping) */
  shippingCost: number;
  /** Discount amount if applicable */
  discount?: number;
  /** Discount code if used */
  discountCode?: string;
  /** Final total */
  total: number;
  /** Whether to start expanded */
  initiallyExpanded?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Default fallback image for products
const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max';

/**
 * Format price for display in EUR
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Individual cart item row
 */
function CartItemRow({ item }: { item: CartItem }) {
  const [imageError, setImageError] = useState(false);

  // Get valid image URL - filter out empty strings
  const rawImageUrl = item.image;
  const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : DEFAULT_PRODUCT_IMAGE;
  const displayUrl = imageError ? DEFAULT_PRODUCT_IMAGE : imageUrl;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <View style={styles.itemRow}>
      <Image
        source={{ uri: displayUrl }}
        style={styles.itemImage}
        accessibilityLabel={item.name}
        onError={handleImageError}
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
  );
}

/**
 * Summary line component (subtotal, shipping, discount)
 */
interface SummaryLineProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isDiscount?: boolean;
  isFree?: boolean;
}

function SummaryLine({ label, value, icon, isDiscount, isFree }: SummaryLineProps) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.labelWithIcon}>
        {icon}
        <Text
          style={[
            styles.summaryLabel,
            isDiscount && styles.discountLabel,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.summaryValue,
          isFree && styles.freeValue,
          isDiscount && styles.discountValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  discount = 0,
  discountCode,
  total,
  initiallyExpanded = true,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  // Animation values
  const rotation = useSharedValue(initiallyExpanded ? 180 : 0);
  const contentHeight = useSharedValue(initiallyExpanded ? 1 : 0);
  const headerScale = useSharedValue(1);

  // Total item count
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Toggle expand/collapse
  const toggleExpand = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);

    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    rotation.value = withSpring(newExpanded ? 180 : 0, springConfigs.button);
    contentHeight.value = withTiming(newExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  // Header press animations
  const handleHeaderPressIn = () => {
    headerScale.value = withSpring(0.98, springConfigs.button);
  };

  const handleHeaderPressOut = () => {
    headerScale.value = withSpring(1, springConfigs.button);
  };

  // Animated styles
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    maxHeight: interpolate(
      contentHeight.value,
      [0, 1],
      [0, 1000],
      Extrapolation.CLAMP
    ),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.container}
    >
      {/* Header - Always visible */}
      <AnimatedPressable
        onPress={toggleExpand}
        onPressIn={handleHeaderPressIn}
        onPressOut={handleHeaderPressOut}
        style={[styles.header, headerStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Récapitulatif de commande, ${itemCount} articles, ${isExpanded ? 'appuyez pour réduire' : 'appuyez pour développer'}`}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Récapitulatif</Text>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>
              {itemCount} article{itemCount > 1 ? 's' : ''}
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
            <CartItemRow key={item.id} item={item} />
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Summary Lines */}
        <View style={styles.summaryLines}>
          {/* Subtotal */}
          <SummaryLine
            label="Sous-total"
            value={formatPrice(subtotal)}
          />

          {/* Shipping */}
          <SummaryLine
            label="Livraison"
            value={shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}
            icon={<Truck size={14} color={COLORS.textMuted} />}
            isFree={shippingCost === 0}
          />

          {/* Discount */}
          {discount > 0 && (
            <SummaryLine
              label={discountCode ? `Code: ${discountCode}` : 'Réduction'}
              value={`-${formatPrice(discount)}`}
              icon={<Tag size={14} color={COLORS.success} />}
              isDiscount
            />
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card, // Use consistent shadow from design tokens
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
    borderRadius: RADIUS.md, // Use consistent 12px radius
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
    borderRadius: RADIUS.md, // Use consistent 12px radius
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
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: COLORS.hermes,
  },
});

export default OrderSummary;
