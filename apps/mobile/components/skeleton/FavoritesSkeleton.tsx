/**
 * FavoritesSkeleton Component
 * Elegant skeleton placeholder for favorites/wishlist page
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Skeleton,
  SKELETON_COLORS,
} from './Skeleton';
import { ProductCardSkeleton } from './ProductCardSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Design tokens
const COLORS = {
  background: '#fffcf7',
};

// ============================================================================
// FAVORITES SKELETON
// ============================================================================

export interface FavoritesSkeletonProps {
  /** Number of product skeletons */
  productCount?: number;
  /** Number of columns */
  columns?: number;
}

export const FavoritesSkeleton = memo(function FavoritesSkeleton({
  productCount = 4,
  columns = 2,
}: FavoritesSkeletonProps) {
  const cardWidth = (SCREEN_WIDTH - 48 - (columns - 1) * 12) / columns;

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

      {/* Product Grid */}
      <View style={styles.grid}>
        {Array.from({ length: productCount }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(100 + index * 80).duration(300)}
            style={[styles.gridItem, { width: cardWidth }]}
          >
            <ProductCardSkeleton showBadge={false} delay={0} />
          </Animated.View>
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  gridItem: {
    marginBottom: 12,
  },
});

export default FavoritesSkeleton;
