/**
 * OrdersSkeleton Component
 * Elegant skeleton placeholder for orders list
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonCircle,
  SKELETON_COLORS,
} from './Skeleton';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  white: '#ffffff',
  borderLight: '#f0ebe3',
};

// ============================================================================
// ORDER ITEM SKELETON
// ============================================================================

export interface OrderItemSkeletonProps {
  delay?: number;
}

export const OrderItemSkeleton = memo(function OrderItemSkeleton({
  delay = 0,
}: OrderItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.orderCard}
    >
      {/* Header row - order number & date */}
      <View style={styles.headerRow}>
        <View>
          <Skeleton width={140} height={14} radius="sm" style={{ marginBottom: 4 }} />
          <Skeleton width={100} height={12} radius="sm" />
        </View>
        <Skeleton width={80} height={24} radius="full" shimmerStyle="warm" />
      </View>

      {/* Product item */}
      <View style={styles.productRow}>
        <Skeleton width={80} height={80} radius="md" />
        <View style={styles.productInfo}>
          <Skeleton width="80%" height={16} radius="sm" style={{ marginBottom: 8 }} />
          <Skeleton width={60} height={12} radius="sm" style={{ marginBottom: 8 }} />
          <Skeleton width={80} height={16} radius="sm" shimmerStyle="warm" />
        </View>
      </View>

      {/* Footer - total & action */}
      <View style={styles.footerRow}>
        <View>
          <Skeleton width={60} height={12} radius="sm" style={{ marginBottom: 4 }} />
          <Skeleton width={100} height={18} radius="sm" shimmerStyle="warm" />
        </View>
        <Skeleton width={100} height={36} radius="md" />
      </View>
    </Animated.View>
  );
});

// ============================================================================
// ORDERS SKELETON
// ============================================================================

export interface OrdersSkeletonProps {
  count?: number;
}

export const OrdersSkeleton = memo(function OrdersSkeleton({
  count = 3,
}: OrdersSkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <Skeleton width={160} height={32} radius="sm" />
        <Skeleton width={80} height={14} radius="sm" style={{ marginTop: 8 }} />
      </Animated.View>

      {/* Orders list */}
      <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <OrderItemSkeleton key={index} delay={100 + index * 100} />
        ))}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default OrdersSkeleton;
