/**
 * CartSkeleton Component
 * Elegant skeleton placeholder for cart items
 * Matches the layout of the cart screen
 */

import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonButton,
  SKELETON_COLORS,
} from './Skeleton';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  white: '#ffffff',
  borderLight: '#f0ebe3',
};

// ============================================================================
// CART ITEM SKELETON
// ============================================================================

export interface CartItemSkeletonProps {
  /** Stagger delay for animation */
  delay?: number;
}

export const CartItemSkeleton = memo(function CartItemSkeleton({
  delay = 0,
}: CartItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={styles.cartItem}
    >
      {/* Product Image */}
      <Skeleton width={100} height={100} radius="md" />

      {/* Product Info */}
      <View style={styles.itemInfo}>
        {/* Product name */}
        <View style={styles.nameContainer}>
          <Skeleton width="90%" height={16} radius="sm" style={{ marginBottom: 4 }} />
          <Skeleton width="60%" height={16} radius="sm" />
        </View>

        {/* Collection badge */}
        <Skeleton width={80} height={12} radius="sm" shimmerStyle="warm" style={{ marginTop: 8 }} />

        {/* Price */}
        <Skeleton width={100} height={18} radius="sm" shimmerStyle="warm" style={{ marginTop: 8 }} />

        {/* Actions row (quantity + remove) */}
        <View style={styles.actionsRow}>
          <View style={styles.quantitySelector}>
            <Skeleton width={28} height={28} radius="full" />
            <Skeleton width={30} height={20} radius="sm" />
            <Skeleton width={28} height={28} radius="full" />
          </View>
          <Skeleton width={32} height={32} radius="sm" />
        </View>
      </View>
    </Animated.View>
  );
});

// ============================================================================
// CART SKELETON (Full cart loading state)
// ============================================================================

export interface CartSkeletonProps {
  /** Number of items to show */
  itemCount?: number;
  /** Show shipping banner */
  showShippingBanner?: boolean;
}

export const CartSkeleton = memo(function CartSkeleton({
  itemCount = 3,
  showShippingBanner = true,
}: CartSkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <Skeleton width={180} height={32} radius="sm" />
        <Skeleton width={80} height={14} radius="sm" style={{ marginTop: 8 }} />
      </Animated.View>

      {/* Shipping Banner */}
      {showShippingBanner && (
        <Animated.View
          entering={FadeIn.delay(100).duration(300)}
          style={styles.shippingBanner}
        >
          <SkeletonCircle size={36} />
          <View style={styles.shippingContent}>
            <Skeleton width="80%" height={14} radius="sm" />
            <Skeleton width="100%" height={4} radius="full" style={{ marginTop: 8 }} />
          </View>
        </Animated.View>
      )}

      {/* Cart Items */}
      <View style={styles.itemsContainer}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <CartItemSkeleton key={index} delay={150 + index * 80} />
        ))}
      </View>

      {/* Bottom Summary */}
      <View style={styles.summaryContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={styles.blurView}>
            <View style={styles.blurOverlay} />
          </BlurView>
        ) : (
          <View style={styles.androidBackground} />
        )}

        <View style={styles.topBorder} />

        <Animated.View
          entering={FadeIn.delay(400).duration(300)}
          style={styles.summaryContent}
        >
          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Skeleton width={80} height={14} radius="sm" />
            <Skeleton width={100} height={14} radius="sm" />
          </View>

          {/* Shipping */}
          <View style={styles.summaryRow}>
            <Skeleton width={70} height={14} radius="sm" />
            <Skeleton width={120} height={14} radius="sm" />
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Skeleton width={60} height={20} radius="sm" />
            <Skeleton width={100} height={24} radius="sm" shimmerStyle="warm" />
          </View>

          {/* Checkout Button */}
          <SkeletonButton height={56} />
        </Animated.View>
      </View>
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },

  // Shipping Banner
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: 16,
    gap: 12,
  },
  shippingContent: {
    flex: 1,
  },

  // Cart Items
  itemsContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 16,
  },
  itemInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Summary
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 247, 0.3)',
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 252, 247, 0.95)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default CartSkeleton;
