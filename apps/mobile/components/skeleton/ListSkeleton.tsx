/**
 * ListSkeleton Component
 * Generic skeleton placeholder for list screens (addresses, payment methods, settings, etc.)
 */

import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Skeleton,
  SkeletonCircle,
  SkeletonButton,
  SKELETON_COLORS,
} from './Skeleton';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  white: '#ffffff',
  borderLight: '#f0ebe3',
};

// ============================================================================
// GENERIC LIST ITEM SKELETON
// ============================================================================

export interface ListItemSkeletonProps {
  delay?: number;
  showIcon?: boolean;
  showChevron?: boolean;
}

export const ListItemSkeleton = memo(function ListItemSkeleton({
  delay = 0,
  showIcon = true,
  showChevron = true,
}: ListItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.listItem}
    >
      {showIcon && <SkeletonCircle size={40} />}
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={16} radius="sm" style={{ marginBottom: 4 }} />
        <Skeleton width="50%" height={12} radius="sm" />
      </View>
      {showChevron && <Skeleton width={20} height={20} radius="sm" />}
    </Animated.View>
  );
});

// ============================================================================
// CARD LIST ITEM SKELETON (for addresses, payment methods)
// ============================================================================

export interface CardListItemSkeletonProps {
  delay?: number;
}

export const CardListItemSkeleton = memo(function CardListItemSkeleton({
  delay = 0,
}: CardListItemSkeletonProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <SkeletonCircle size={40} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={120} height={16} radius="sm" style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={20} radius="full" shimmerStyle="warm" />
        </View>
      </View>
      <View style={styles.cardContent}>
        <Skeleton width="90%" height={14} radius="sm" style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={14} radius="sm" style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={14} radius="sm" />
      </View>
      <View style={styles.cardActions}>
        <Skeleton width={80} height={32} radius="md" />
        <Skeleton width={80} height={32} radius="md" />
      </View>
    </Animated.View>
  );
});

// ============================================================================
// LIST SKELETON (Generic full page)
// ============================================================================

export interface ListSkeletonProps {
  /** Title skeleton width */
  titleWidth?: number;
  /** Number of items */
  itemCount?: number;
  /** Item variant */
  variant?: 'simple' | 'card';
  /** Show add button at bottom */
  showAddButton?: boolean;
}

export const ListSkeleton = memo(function ListSkeleton({
  titleWidth = 160,
  itemCount = 3,
  variant = 'card',
  showAddButton = true,
}: ListSkeletonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <Skeleton width={titleWidth} height={32} radius="sm" />
        <Skeleton width={80} height={14} radius="sm" style={{ marginTop: 8 }} />
      </Animated.View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: showAddButton ? 100 : Math.max(insets.bottom + 24, 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {variant === 'card' ? (
          <View style={styles.cardsContainer}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <CardListItemSkeleton key={index} delay={100 + index * 80} />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <ListItemSkeleton key={index} delay={100 + index * 60} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add button */}
      {showAddButton && (
        <Animated.View
          entering={FadeIn.delay(400).duration(300)}
          style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <SkeletonButton height={56} />
        </Animated.View>
      )}
    </View>
  );
});

// ============================================================================
// SETTINGS SKELETON
// ============================================================================

export const SettingsSkeleton = memo(function SettingsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <Skeleton width={140} height={32} radius="sm" />
      </Animated.View>

      {/* Settings sections */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section 1 */}
        <View style={styles.settingsSection}>
          <Skeleton width={100} height={12} radius="sm" style={{ marginBottom: 12, marginLeft: 24 }} />
          <View style={styles.settingsGroup}>
            {Array.from({ length: 3 }).map((_, index) => (
              <ListItemSkeleton key={index} delay={100 + index * 60} />
            ))}
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.settingsSection}>
          <Skeleton width={120} height={12} radius="sm" style={{ marginBottom: 12, marginLeft: 24 }} />
          <View style={styles.settingsGroup}>
            {Array.from({ length: 2 }).map((_, index) => (
              <ListItemSkeleton key={index} delay={300 + index * 60} />
            ))}
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.settingsSection}>
          <Skeleton width={80} height={12} radius="sm" style={{ marginBottom: 12, marginLeft: 24 }} />
          <View style={styles.settingsGroup}>
            {Array.from({ length: 2 }).map((_, index) => (
              <ListItemSkeleton key={index} delay={450 + index * 60} showChevron={false} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

// ============================================================================
// PROFILE SKELETON
// ============================================================================

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header with avatar */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.profileHeader}
      >
        <SkeletonCircle size={100} />
        <Skeleton width={150} height={24} radius="sm" style={{ marginTop: 16 }} />
        <Skeleton width={200} height={14} radius="sm" style={{ marginTop: 8 }} />
      </Animated.View>

      {/* Form fields */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(200 + index * 60).duration(300)}
              style={styles.formField}
            >
              <Skeleton width={100} height={12} radius="sm" style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={48} radius="md" />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Save button */}
      <Animated.View
        entering={FadeIn.delay(500).duration(300)}
        style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        <SkeletonButton height={56} />
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  // List items
  listContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },

  // Card items
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  // Settings
  settingsSection: {
    marginBottom: 24,
  },
  settingsGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 24,
    overflow: 'hidden',
  },

  // Profile
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  formSection: {
    gap: 20,
  },
  formField: {
    marginBottom: 4,
  },

  // Bottom container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});

export default ListSkeleton;
