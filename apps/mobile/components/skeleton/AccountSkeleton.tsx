/**
 * AccountSkeleton Component
 * Elegant skeleton placeholder for account/profile screens
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  SkeletonLines,
  SKELETON_COLORS,
} from './Skeleton';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  white: '#ffffff',
  borderLight: '#f0ebe3',
};

// ============================================================================
// ACCOUNT HEADER SKELETON (Profile section)
// ============================================================================

export const AccountHeaderSkeleton = memo(function AccountHeaderSkeleton() {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={styles.headerSection}
    >
      {/* Avatar */}
      <SkeletonCircle size={80} />
      
      {/* Name and email */}
      <View style={styles.headerInfo}>
        <Skeleton width={150} height={24} radius="sm" style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={14} radius="sm" />
      </View>
    </Animated.View>
  );
});

// ============================================================================
// MENU ITEM SKELETON
// ============================================================================

export interface MenuItemSkeletonProps {
  delay?: number;
}

export const MenuItemSkeleton = memo(function MenuItemSkeleton({
  delay = 0,
}: MenuItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.menuItem}
    >
      <SkeletonCircle size={40} />
      <Skeleton width="60%" height={16} radius="sm" style={{ marginLeft: 16 }} />
      <View style={{ flex: 1 }} />
      <Skeleton width={20} height={20} radius="sm" />
    </Animated.View>
  );
});

// ============================================================================
// MENU SECTION SKELETON
// ============================================================================

export interface MenuSectionSkeletonProps {
  itemCount?: number;
  baseDelay?: number;
}

export const MenuSectionSkeleton = memo(function MenuSectionSkeleton({
  itemCount = 3,
  baseDelay = 0,
}: MenuSectionSkeletonProps) {
  return (
    <View style={styles.menuSection}>
      {/* Section title */}
      <Animated.View
        entering={FadeInDown.delay(baseDelay).duration(300)}
        style={styles.sectionTitleContainer}
      >
        <Skeleton width={120} height={12} radius="sm" />
      </Animated.View>
      
      {/* Menu items */}
      <View style={styles.menuItemsContainer}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <MenuItemSkeleton
            key={index}
            delay={baseDelay + 50 + index * 60}
          />
        ))}
      </View>
    </View>
  );
});

// ============================================================================
// ACCOUNT SKELETON (Full page)
// ============================================================================

export const AccountSkeleton = memo(function AccountSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(insets.bottom + 100, 120) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header/Profile section */}
      <AccountHeaderSkeleton />

      {/* Menu Sections */}
      <MenuSectionSkeleton itemCount={3} baseDelay={100} />
      <MenuSectionSkeleton itemCount={2} baseDelay={300} />
      <MenuSectionSkeleton itemCount={2} baseDelay={450} />
    </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: 24,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 16,
  },

  // Menu Section
  menuSection: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    marginBottom: 12,
  },
  menuItemsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
});

export default AccountSkeleton;
