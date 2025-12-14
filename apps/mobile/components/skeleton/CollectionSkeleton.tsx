/**
 * CollectionSkeleton Component
 * Elegant skeleton placeholder for collection/category pages
 * Matches the layout of collections/[slug].tsx
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonText,
  SkeletonLines,
  SKELETON_COLORS,
} from './Skeleton';
import { ProductCardSkeleton } from './ProductCardSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Design tokens
const COLORS = {
  background: '#fffcf7',
  borderLight: '#f0ebe3',
};

// ============================================================================
// COLLECTION HEADER SKELETON
// ============================================================================

export const CollectionHeaderSkeleton = memo(function CollectionHeaderSkeleton() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.header}
    >
      {/* Collection name */}
      <Skeleton width="60%" height={28} radius="sm" />
      
      {/* Description */}
      <Skeleton width="90%" height={14} radius="sm" style={{ marginTop: 8 }} />
      
      {/* Product count */}
      <Skeleton width={100} height={14} radius="sm" style={{ marginTop: 12 }} />
    </Animated.View>
  );
});

// ============================================================================
// COLLECTION SKELETON (Full page)
// ============================================================================

export interface CollectionSkeletonProps {
  /** Number of product skeletons */
  productCount?: number;
  /** Number of columns */
  columns?: number;
}

export const CollectionSkeleton = memo(function CollectionSkeleton({
  productCount = 6,
  columns = 2,
}: CollectionSkeletonProps) {
  const cardWidth = (SCREEN_WIDTH - 32 - (columns - 1) * 12) / columns;

  return (
    <View style={styles.container}>
      {/* Header */}
      <CollectionHeaderSkeleton />

      {/* Product Grid */}
      <View style={styles.grid}>
        {Array.from({ length: productCount }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(100 + index * 60).duration(300)}
            style={[styles.gridItem, { width: cardWidth }]}
          >
            <ProductCardSkeleton
              showBadge={index % 3 === 0}
              delay={0}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
});

// ============================================================================
// COLLECTIONS LIST SKELETON (For main collections page)
// ============================================================================

export interface CollectionListItemSkeletonProps {
  delay?: number;
}

export const CollectionListItemSkeleton = memo(function CollectionListItemSkeleton({
  delay = 0,
}: CollectionListItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.collectionItem}
    >
      {/* Collection Image */}
      <Skeleton width="100%" height={180} radius="md" />
      
      {/* Collection Info */}
      <View style={styles.collectionInfo}>
        <Skeleton width="70%" height={20} radius="sm" style={{ marginBottom: 4 }} />
        <Skeleton width={80} height={14} radius="sm" />
      </View>
    </Animated.View>
  );
});

export interface CollectionsListSkeletonProps {
  /** Number of collection items */
  count?: number;
}

export const CollectionsListSkeleton = memo(function CollectionsListSkeleton({
  count = 4,
}: CollectionsListSkeletonProps) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <CollectionListItemSkeleton key={index} delay={index * 80} />
      ))}
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
    paddingTop: 16,
    paddingBottom: 16,
  },

  // Product Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    marginBottom: 12,
  },

  // Collection List (for main collections page)
  listContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  collectionItem: {
    backgroundColor: SKELETON_COLORS.baseLight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  collectionInfo: {
    padding: 16,
  },
});

export default CollectionSkeleton;
