/**
 * CheckoutSkeleton Component
 * Loading skeleton for checkout flow screens
 *
 * Matches the layout of app/checkout screens
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Skeleton,
  SkeletonImage,
  SkeletonText,
  SkeletonStack,
  SkeletonRow,
  SkeletonButton,
  SkeletonCircle,
  getStaggeredDelay,
  SKELETON_COLORS,
  SKELETON_RADIUS,
} from './Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

export interface CheckoutSkeletonProps {
  /** Checkout step: summary, shipping, or payment */
  step?: 'summary' | 'shipping' | 'payment';
  /** Number of cart items to show */
  itemCount?: number;
  /** Enable/disable animation */
  animated?: boolean;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Step Indicator Skeleton
 */
const StepIndicatorSkeleton = memo(function StepIndicatorSkeleton({
  animated = true,
}: {
  animated?: boolean;
}) {
  return (
    <View style={styles.stepIndicator}>
      <SkeletonRow gap={8} style={styles.stepRow}>
        {['Recapitulatif', 'Livraison', 'Paiement'].map((_, index) => (
          <React.Fragment key={index}>
            <SkeletonCircle
              size={32}
              animated={animated}
              delay={index * 50}
            />
            {index < 2 && (
              <Skeleton
                width={40}
                height={2}
                radius="round"
                animated={animated}
                delay={50 + index * 50}
              />
            )}
          </React.Fragment>
        ))}
      </SkeletonRow>
    </View>
  );
});

/**
 * Section Title Skeleton
 */
const SectionTitleSkeleton = memo(function SectionTitleSkeleton({
  width = 120,
  animated = true,
  delay = 0,
}: {
  width?: number;
  animated?: boolean;
  delay?: number;
}) {
  return (
    <Skeleton
      width={width}
      height={24}
      radius="xs"
      animated={animated}
      delay={delay}
      style={styles.sectionTitle}
    />
  );
});

/**
 * Cart Item Row Skeleton (compact version for checkout)
 */
const CheckoutItemSkeleton = memo(function CheckoutItemSkeleton({
  index = 0,
  animated = true,
}: {
  index?: number;
  animated?: boolean;
}) {
  const delay = getStaggeredDelay(index, 150);

  return (
    <View style={styles.checkoutItem}>
      {/* Image */}
      <SkeletonImage
        width={80}
        height={80}
        radius="sm"
        animated={animated}
        delay={delay}
      />

      {/* Details */}
      <View style={styles.itemDetails}>
        <SkeletonStack gap={4}>
          <Skeleton
            width="85%"
            height={15}
            radius="xs"
            animated={animated}
            delay={delay + 50}
          />
          <Skeleton
            width={60}
            height={11}
            radius="xs"
            animated={animated}
            delay={delay + 100}
            shimmerStyle="warm"
          />
        </SkeletonStack>

        <SkeletonRow style={styles.itemPriceRow}>
          <Skeleton
            width={50}
            height={13}
            radius="xs"
            animated={animated}
            delay={delay + 150}
          />
          <Skeleton
            width={70}
            height={15}
            radius="xs"
            animated={animated}
            delay={delay + 200}
          />
        </SkeletonRow>
      </View>
    </View>
  );
});

/**
 * Delivery Info Badge Skeleton
 */
const DeliveryBadgeSkeleton = memo(function DeliveryBadgeSkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View style={styles.deliveryBadge}>
      <SkeletonCircle size={40} animated={animated} delay={delay} />
      <SkeletonStack gap={4} style={styles.deliveryText}>
        <Skeleton
          width={100}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay + 50}
        />
        <Skeleton
          width={80}
          height={12}
          radius="xs"
          animated={animated}
          delay={delay + 100}
        />
      </SkeletonStack>
    </View>
  );
});

/**
 * Order Summary Card Skeleton
 */
const OrderSummarySkeleton = memo(function OrderSummarySkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View style={styles.summaryCard}>
      {/* Title */}
      <Skeleton
        width={110}
        height={18}
        radius="xs"
        animated={animated}
        delay={delay}
        style={styles.summaryTitle}
      />

      {/* Subtotal */}
      <SkeletonRow style={styles.summaryRow}>
        <Skeleton
          width={100}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay + 50}
        />
        <Skeleton
          width={70}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay + 100}
        />
      </SkeletonRow>

      {/* Shipping */}
      <SkeletonRow style={styles.summaryRow}>
        <Skeleton
          width={60}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay + 150}
        />
        <Skeleton
          width={50}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay + 200}
        />
      </SkeletonRow>

      {/* Divider */}
      <View style={styles.summaryDivider} />

      {/* Total */}
      <SkeletonRow style={styles.totalRow}>
        <Skeleton
          width={50}
          height={18}
          radius="xs"
          animated={animated}
          delay={delay + 250}
        />
        <Skeleton
          width={100}
          height={24}
          radius="xs"
          animated={animated}
          delay={delay + 300}
          shimmerStyle="warm"
        />
      </SkeletonRow>
    </View>
  );
});

/**
 * Security Badge Skeleton
 */
const SecurityBadgeSkeleton = memo(function SecurityBadgeSkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View style={styles.securityBadge}>
      <SkeletonRow gap={8}>
        <Skeleton
          width={16}
          height={16}
          radius="xs"
          animated={animated}
          delay={delay}
        />
        <Skeleton
          width={120}
          height={12}
          radius="xs"
          animated={animated}
          delay={delay + 50}
        />
      </SkeletonRow>
    </View>
  );
});

/**
 * Address Form Skeleton
 */
const AddressFormSkeleton = memo(function AddressFormSkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  const fields: { label: number; input: `${number}%`; secondInput?: `${number}%` }[] = [
    { label: 80, input: '100%' },
    { label: 60, input: '100%' },
    { label: 100, input: '100%' },
    { label: 90, input: '45%', secondInput: '45%' }, // City + Postal code
    { label: 50, input: '100%' },
  ];

  return (
    <View style={styles.formContainer}>
      {fields.map((field, index) => (
        <View key={index} style={styles.formField}>
          <Skeleton
            width={field.label}
            height={14}
            radius="xs"
            animated={animated}
            delay={delay + index * 80}
            style={styles.fieldLabel}
          />
          <SkeletonRow gap={12}>
            <Skeleton
              width={field.input}
              height={48}
              radius="md"
              animated={animated}
              delay={delay + index * 80 + 40}
            />
            {field.secondInput && (
              <Skeleton
                width={field.secondInput}
                height={48}
                radius="md"
                animated={animated}
                delay={delay + index * 80 + 80}
              />
            )}
          </SkeletonRow>
        </View>
      ))}
    </View>
  );
});

/**
 * Shipping Options Skeleton
 */
const ShippingOptionsSkeleton = memo(function ShippingOptionsSkeleton({
  animated = true,
  delay = 0,
  count = 3,
}: {
  animated?: boolean;
  delay?: number;
  count?: number;
}) {
  return (
    <View style={styles.shippingOptions}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.shippingOption}>
          <SkeletonCircle
            size={24}
            animated={animated}
            delay={delay + index * 100}
          />
          <View style={styles.shippingOptionContent}>
            <SkeletonStack gap={4}>
              <Skeleton
                width={120}
                height={16}
                radius="xs"
                animated={animated}
                delay={delay + index * 100 + 50}
              />
              <Skeleton
                width={80}
                height={12}
                radius="xs"
                animated={animated}
                delay={delay + index * 100 + 100}
              />
            </SkeletonStack>
            <Skeleton
              width={60}
              height={16}
              radius="xs"
              animated={animated}
              delay={delay + index * 100 + 150}
              shimmerStyle="warm"
            />
          </View>
        </View>
      ))}
    </View>
  );
});

/**
 * Payment Form Skeleton
 */
const PaymentFormSkeleton = memo(function PaymentFormSkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View style={styles.paymentForm}>
      {/* Card Number */}
      <View style={styles.formField}>
        <Skeleton
          width={100}
          height={14}
          radius="xs"
          animated={animated}
          delay={delay}
          style={styles.fieldLabel}
        />
        <Skeleton
          width="100%"
          height={52}
          radius="md"
          animated={animated}
          delay={delay + 50}
        />
      </View>

      {/* Expiry and CVC */}
      <SkeletonRow gap={16} style={styles.paymentRow}>
        <View style={styles.halfField}>
          <Skeleton
            width={60}
            height={14}
            radius="xs"
            animated={animated}
            delay={delay + 100}
            style={styles.fieldLabel}
          />
          <Skeleton
            width="100%"
            height={52}
            radius="md"
            animated={animated}
            delay={delay + 150}
          />
        </View>
        <View style={styles.halfField}>
          <Skeleton
            width={40}
            height={14}
            radius="xs"
            animated={animated}
            delay={delay + 200}
            style={styles.fieldLabel}
          />
          <Skeleton
            width="100%"
            height={52}
            radius="md"
            animated={animated}
            delay={delay + 250}
          />
        </View>
      </SkeletonRow>

      {/* Card Icons */}
      <SkeletonRow gap={8} style={styles.cardIcons}>
        {[0, 1, 2, 3].map((_, index) => (
          <Skeleton
            key={index}
            width={40}
            height={26}
            radius="xs"
            animated={animated}
            delay={delay + 300 + index * 50}
          />
        ))}
      </SkeletonRow>
    </View>
  );
});

/**
 * Continue Button Skeleton
 */
const ContinueButtonSkeleton = memo(function ContinueButtonSkeleton({
  animated = true,
  delay = 0,
}: {
  animated?: boolean;
  delay?: number;
}) {
  return (
    <View style={styles.buttonContainer}>
      <Skeleton
        width="100%"
        height={56}
        radius="xl"
        animated={animated}
        delay={delay}
        shimmerStyle="warm"
      />
    </View>
  );
});

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

/**
 * Checkout Summary Skeleton
 */
export const CheckoutSummarySkeleton = memo(function CheckoutSummarySkeleton({
  itemCount = 2,
  animated = true,
}: {
  itemCount?: number;
  animated?: boolean;
}) {
  return (
    <View style={styles.container}>
      <StepIndicatorSkeleton animated={animated} />

      <View style={styles.content}>
        <SectionTitleSkeleton width={120} animated={animated} delay={100} />

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <CheckoutItemSkeleton
              key={index}
              index={index}
              animated={animated}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <DeliveryBadgeSkeleton animated={animated} delay={400} />

        <OrderSummarySkeleton animated={animated} delay={500} />

        <SecurityBadgeSkeleton animated={animated} delay={700} />
      </View>

      <ContinueButtonSkeleton animated={animated} delay={800} />
    </View>
  );
});

/**
 * Checkout Shipping Skeleton
 */
export const CheckoutShippingSkeleton = memo(function CheckoutShippingSkeleton({
  animated = true,
}: {
  animated?: boolean;
}) {
  return (
    <View style={styles.container}>
      <StepIndicatorSkeleton animated={animated} />

      <View style={styles.content}>
        <SectionTitleSkeleton width={140} animated={animated} delay={100} />

        <AddressFormSkeleton animated={animated} delay={200} />

        <View style={styles.divider} />

        <SectionTitleSkeleton width={150} animated={animated} delay={600} />

        <ShippingOptionsSkeleton animated={animated} delay={700} />
      </View>

      <ContinueButtonSkeleton animated={animated} delay={1000} />
    </View>
  );
});

/**
 * Checkout Payment Skeleton
 */
export const CheckoutPaymentSkeleton = memo(function CheckoutPaymentSkeleton({
  animated = true,
}: {
  animated?: boolean;
}) {
  return (
    <View style={styles.container}>
      <StepIndicatorSkeleton animated={animated} />

      <View style={styles.content}>
        <SectionTitleSkeleton width={130} animated={animated} delay={100} />

        <PaymentFormSkeleton animated={animated} delay={200} />

        <View style={styles.divider} />

        {/* Order Summary (compact) */}
        <SkeletonRow style={styles.compactSummary}>
          <Skeleton
            width={60}
            height={16}
            radius="xs"
            animated={animated}
            delay={600}
          />
          <Skeleton
            width={100}
            height={20}
            radius="xs"
            animated={animated}
            delay={650}
            shimmerStyle="warm"
          />
        </SkeletonRow>

        <SecurityBadgeSkeleton animated={animated} delay={700} />
      </View>

      <ContinueButtonSkeleton animated={animated} delay={800} />
    </View>
  );
});

/**
 * Main CheckoutSkeleton component
 * Renders the appropriate skeleton based on checkout step
 */
export const CheckoutSkeleton = memo(function CheckoutSkeleton({
  step = 'summary',
  itemCount = 2,
  animated = true,
}: CheckoutSkeletonProps) {
  switch (step) {
    case 'shipping':
      return <CheckoutShippingSkeleton animated={animated} />;
    case 'payment':
      return <CheckoutPaymentSkeleton animated={animated} />;
    default:
      return <CheckoutSummarySkeleton itemCount={itemCount} animated={animated} />;
  }
});

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcf7',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },

  // Step Indicator
  stepIndicator: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  stepRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: SKELETON_COLORS.base,
    marginVertical: 24,
  },

  // Checkout Items
  itemsContainer: {
    gap: 16,
  },

  checkoutItem: {
    flexDirection: 'row',
    backgroundColor: SKELETON_COLORS.card,
    borderRadius: SKELETON_RADIUS.md,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },

  itemPriceRow: {
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // Delivery Badge
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SKELETON_COLORS.card,
    borderRadius: SKELETON_RADIUS.md,
    padding: 16,
    marginBottom: 24,
  },

  deliveryText: {
    marginLeft: 16,
    flex: 1,
  },

  // Order Summary
  summaryCard: {
    backgroundColor: SKELETON_COLORS.card,
    borderRadius: SKELETON_RADIUS.lg,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryTitle: {
    marginBottom: 16,
  },

  summaryRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: SKELETON_COLORS.base,
    marginVertical: 12,
  },

  totalRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  compactSummary: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: SKELETON_COLORS.base,
    marginTop: 24,
  },

  // Security
  securityBadge: {
    alignItems: 'center',
    marginTop: 24,
  },

  // Forms
  formContainer: {
    gap: 20,
  },

  formField: {},

  fieldLabel: {
    marginBottom: 8,
  },

  halfField: {
    flex: 1,
  },

  // Shipping Options
  shippingOptions: {
    gap: 12,
  },

  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SKELETON_COLORS.card,
    borderRadius: SKELETON_RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: SKELETON_COLORS.base,
  },

  shippingOptionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },

  // Payment Form
  paymentForm: {
    gap: 20,
  },

  paymentRow: {
    marginTop: 4,
  },

  cardIcons: {
    justifyContent: 'center',
    marginTop: 16,
  },

  // Button
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#fffcf7',
    borderTopWidth: 1,
    borderTopColor: SKELETON_COLORS.base,
  },
});

export default CheckoutSkeleton;
