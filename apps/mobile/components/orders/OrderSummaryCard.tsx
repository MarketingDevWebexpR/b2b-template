/**
 * OrderSummaryCard Component
 *
 * Displays the order pricing summary including subtotal, shipping, and total.
 * Features elegant styling consistent with the luxury brand.
 *
 * @module components/orders/OrderSummaryCard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Receipt } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '@/constants/designTokens';
import { formatPrice } from '@bijoux/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax?: number;
  discount?: number;
  total: number;
}

export interface OrderSummaryCardProps {
  /** Order totals */
  totals: OrderTotals;
  /** Payment method label */
  paymentMethod?: string;
  /** Card last 4 digits */
  cardLastFour?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OrderSummaryCard({
  totals,
  paymentMethod,
  cardLastFour,
}: OrderSummaryCardProps): JSX.Element {
  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(400)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Receipt size={18} color={COLORS.hermes} strokeWidth={1.5} />
        <Text style={styles.headerTitle}>Récapitulatif</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Price Lines */}
      <View style={styles.priceLines}>
        {/* Subtotal */}
        <View style={styles.priceLine}>
          <Text style={styles.priceLabel}>Sous-total</Text>
          <Text style={styles.priceValue}>{formatPrice(totals.subtotal)}</Text>
        </View>

        {/* Shipping */}
        <View style={styles.priceLine}>
          <Text style={styles.priceLabel}>Livraison</Text>
          <Text style={[styles.priceValue, totals.shipping === 0 && styles.freeShipping]}>
            {totals.shipping === 0 ? 'Gratuite' : formatPrice(totals.shipping)}
          </Text>
        </View>

        {/* Tax if present */}
        {totals.tax !== undefined && totals.tax > 0 && (
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>TVA incluse</Text>
            <Text style={styles.priceValue}>{formatPrice(totals.tax)}</Text>
          </View>
        )}

        {/* Discount if present */}
        {totals.discount !== undefined && totals.discount > 0 && (
          <View style={styles.priceLine}>
            <Text style={styles.priceLabel}>Réduction</Text>
            <Text style={[styles.priceValue, styles.discountValue]}>
              -{formatPrice(totals.discount)}
            </Text>
          </View>
        )}
      </View>

      {/* Total Divider */}
      <View style={styles.totalDivider} />

      {/* Total */}
      <View style={styles.totalLine}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
      </View>

      {/* Payment Method */}
      {paymentMethod && (
        <>
          <View style={styles.divider} />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Payé par</Text>
            <Text style={styles.paymentValue}>
              {paymentMethod}
              {cardLastFour && ` •••• ${cardLastFour}`}
            </Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  headerTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.charcoal,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },

  priceLines: {
    gap: SPACING.xs,
  },

  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  priceValue: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.charcoal,
  },

  freeShipping: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.success,
  },

  discountValue: {
    color: COLORS.success,
  },

  totalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },

  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: FONT_SIZES.sectionTitle,
    color: COLORS.charcoal,
  },

  totalValue: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZES.subheading,
    color: COLORS.hermes,
  },

  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  paymentValue: {
    fontFamily: FONTS.bodyMedium,
    fontSize: FONT_SIZES.small,
    color: COLORS.charcoal,
  },
});

export default OrderSummaryCard;
