/**
 * ProductDetailSkeleton Component
 * Full-page skeleton for product detail screen
 * Matches the layout of app/product/[id].tsx
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonText,
  SkeletonLines,
  SkeletonCircle,
  SkeletonButton,
  SkeletonRow,
  SkeletonStack,
  SKELETON_COLORS,
} from './Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Design tokens
const COLORS = {
  background: '#fffcf7',
  white: '#ffffff',
  borderLight: '#f0ebe3',
};

// ============================================================================
// PRODUCT DETAIL SKELETON
// ============================================================================

export interface ProductDetailSkeletonProps {
  /** Show specifications section */
  showSpecifications?: boolean;
}

export const ProductDetailSkeleton = memo(function ProductDetailSkeleton({
  showSpecifications = true,
}: ProductDetailSkeletonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.imageSection}>
          <Skeleton
            width={SCREEN_WIDTH}
            height={SCREEN_WIDTH * 1.1}
            radius={0}
          />
          
          {/* Gallery indicators */}
          <View style={styles.galleryIndicators}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                width={index === 0 ? 24 : 8}
                height={8}
                radius="full"
                style={{ opacity: index === 0 ? 1 : 0.5 }}
              />
            ))}
          </View>
          
          {/* Favorite button */}
          <View style={styles.favoriteButton}>
            <Skeleton width={44} height={44} radius="full" />
          </View>
        </Animated.View>

        {/* Product Info */}
        <Animated.View
          entering={FadeIn.delay(100).duration(300)}
          style={styles.infoSection}
        >
          {/* Collection badge */}
          <View style={styles.collectionBadge}>
            <Skeleton width={100} height={24} radius="full" shimmerStyle="warm" />
          </View>

          {/* Product name */}
          <View style={styles.nameContainer}>
            <Skeleton width="85%" height={32} radius="sm" style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={32} radius="sm" />
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Skeleton width={120} height={28} radius="sm" shimmerStyle="warm" />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Quantity selector */}
          <View style={styles.quantitySection}>
            <Skeleton width={80} height={16} radius="sm" />
            <View style={styles.quantitySelector}>
              <Skeleton width={36} height={36} radius="full" />
              <Skeleton width={40} height={24} radius="sm" />
              <Skeleton width={36} height={36} radius="full" />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Skeleton width={100} height={20} radius="sm" style={{ marginBottom: 12 }} />
            <SkeletonLines lines={4} lastLineWidth="80%" spacing={10} />
          </View>

          {/* Specifications */}
          {showSpecifications && (
            <>
              <View style={styles.divider} />
              <View style={styles.specificationsSection}>
                <Skeleton width={140} height={20} radius="sm" style={{ marginBottom: 16 }} />
                
                {Array.from({ length: 4 }).map((_, index) => (
                  <View key={index} style={styles.specRow}>
                    <Skeleton width="35%" height={14} radius="sm" />
                    <Skeleton width="55%" height={14} radius="sm" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Shipping info */}
          <View style={styles.shippingSection}>
            <View style={styles.shippingItem}>
              <SkeletonCircle size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="60%" height={14} radius="sm" style={{ marginBottom: 4 }} />
                <Skeleton width="80%" height={12} radius="sm" />
              </View>
            </View>
            <View style={styles.shippingItem}>
              <SkeletonCircle size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="50%" height={14} radius="sm" style={{ marginBottom: 4 }} />
                <Skeleton width="70%" height={12} radius="sm" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Add to Cart Bar */}
      <Animated.View
        entering={FadeIn.delay(200).duration(300)}
        style={[styles.addToCartBar, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        <View style={styles.addToCartContent}>
          <View style={styles.totalSection}>
            <Skeleton width={50} height={12} radius="sm" />
            <Skeleton width={80} height={24} radius="sm" shimmerStyle="warm" />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonButton height={52} />
          </View>
        </View>
      </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Image section
  imageSection: {
    position: 'relative',
  },
  galleryIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },

  // Info section
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  collectionBadge: {
    marginBottom: 12,
  },
  nameContainer: {
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 20,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },

  // Quantity section
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Description
  descriptionSection: {
    marginTop: 4,
  },

  // Specifications
  specificationsSection: {
    marginTop: 4,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Shipping
  shippingSection: {
    marginTop: 24,
    backgroundColor: SKELETON_COLORS.baseLight,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  shippingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Add to Cart Bar
  addToCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  addToCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalSection: {
    gap: 4,
  },
});

export default ProductDetailSkeleton;
