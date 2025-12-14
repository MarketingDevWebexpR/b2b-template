/**
 * ProductCardSkeleton Component
 * Elegant skeleton placeholder for product cards
 * Matches the layout of ProductCard component
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonText,
  SkeletonStack,
  SKELETON_COLORS,
} from './Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// PRODUCT CARD SKELETON
// ============================================================================

export interface ProductCardSkeletonProps {
  /** Show badge skeleton */
  showBadge?: boolean;
  /** Stagger delay for animation */
  delay?: number;
}

export const ProductCardSkeleton = memo(function ProductCardSkeleton({
  showBadge = false,
  delay = 0,
}: ProductCardSkeletonProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={styles.card}
    >
      {/* Image container */}
      <View style={styles.imageContainer}>
        <Skeleton width="100%" height={180} radius="md" />
        
        {/* Badge placeholder */}
        {showBadge && (
          <View style={styles.badge}>
            <Skeleton width={60} height={20} radius="sm" shimmerStyle="warm" />
          </View>
        )}
        
        {/* Favorite button placeholder */}
        <View style={styles.favoriteButton}>
          <Skeleton width={32} height={32} radius="full" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Collection/Brand */}
        <SkeletonText width="40%" style={{ marginBottom: 4 }} />
        
        {/* Product name */}
        <SkeletonText width="90%" style={{ marginBottom: 4 }} />
        <SkeletonText width="70%" style={{ marginBottom: 12 }} />
        
        {/* Price */}
        <Skeleton width={80} height={18} radius="sm" shimmerStyle="warm" />
      </View>
    </Animated.View>
  );
});

// ============================================================================
// PRODUCT CARD SKELETON GRID
// ============================================================================

export interface ProductCardSkeletonGridProps {
  /** Number of skeleton cards */
  count?: number;
  /** Number of columns */
  columns?: number;
  /** Show badges on cards */
  showBadges?: boolean;
}

export const ProductCardSkeletonGrid = memo(function ProductCardSkeletonGrid({
  count = 6,
  columns = 2,
  showBadges = false,
}: ProductCardSkeletonGridProps) {
  const cardWidth = (SCREEN_WIDTH - 48 - (columns - 1) * 12) / columns;

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 80).duration(300)}
          style={[styles.gridItem, { width: cardWidth }]}
        >
          <ProductCardSkeleton
            showBadge={showBadges && index % 3 === 0}
            delay={0}
          />
        </Animated.View>
      ))}
    </View>
  );
});

// ============================================================================
// PRODUCT CARD SKELETON ROW (Horizontal scroll)
// ============================================================================

export interface ProductCardSkeletonRowProps {
  /** Number of skeleton cards */
  count?: number;
  /** Card width */
  cardWidth?: number;
}

export const ProductCardSkeletonRow = memo(function ProductCardSkeletonRow({
  count = 4,
  cardWidth = 160,
}: ProductCardSkeletonRowProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * 80).duration(300)}
          style={[styles.rowItem, { width: cardWidth }]}
        >
          <View style={styles.rowCard}>
            {/* Image */}
            <Skeleton width="100%" height={140} radius="md" />
            
            {/* Content */}
            <View style={styles.rowCardContent}>
              <SkeletonText width="80%" style={{ marginBottom: 4 }} />
              <Skeleton width={60} height={16} radius="sm" shimmerStyle="warm" />
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: SKELETON_COLORS.baseLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  content: {
    padding: 12,
  },

  // Grid layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  gridItem: {
    marginBottom: 12,
  },

  // Row layout (horizontal scroll)
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  rowItem: {},
  rowCard: {
    backgroundColor: SKELETON_COLORS.baseLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rowCardContent: {
    padding: 10,
  },
});

export default ProductCardSkeleton;
