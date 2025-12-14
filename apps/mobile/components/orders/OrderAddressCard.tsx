/**
 * OrderAddressCard Component
 *
 * Displays shipping or billing address information for an order.
 * Features elegant styling with icon and formatted address.
 *
 * @module components/orders/OrderAddressCard
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { MapPin, Phone, Mail, Navigation } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '@/constants/designTokens';
import { ShippingAddress } from '@/lib/shared/types';
import { hapticFeedback } from '@/constants/haptics';

// =============================================================================
// TYPES
// =============================================================================

export interface OrderAddressCardProps {
  /** The address to display */
  address: ShippingAddress;
  /** Title for the card */
  title?: string;
  /** Animation delay */
  delay?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function OrderAddressCard({
  address,
  title = 'Adresse de livraison',
  delay = 100,
}: OrderAddressCardProps): JSX.Element {
  const fullName = `${address.firstName} ${address.lastName}`;
  const fullAddress = [
    address.address,
    address.addressLine2,
    `${address.postalCode} ${address.city}`,
    address.country,
  ]
    .filter(Boolean)
    .join('\n');

  const handleOpenMaps = () => {
    hapticFeedback.navigation();
    const query = encodeURIComponent(`${address.address}, ${address.postalCode} ${address.city}, ${address.country}`);
    const url = `https://maps.apple.com/?q=${query}`;
    Linking.openURL(url);
  };

  const handleCallPhone = () => {
    if (address.phone) {
      hapticFeedback.softPress();
      Linking.openURL(`tel:${address.phone}`);
    }
  };

  const handleSendEmail = () => {
    if (address.email) {
      hapticFeedback.softPress();
      Linking.openURL(`mailto:${address.email}`);
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <MapPin size={18} color={COLORS.hermes} strokeWidth={1.5} />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Address Content */}
      <View style={styles.content}>
        {/* Recipient Name */}
        <Text style={styles.recipientName}>{fullName}</Text>

        {/* Address Lines */}
        <Text style={styles.addressText}>{fullAddress}</Text>

        {/* Contact Row */}
        <View style={styles.contactRow}>
          {/* Phone */}
          {address.phone && (
            <Pressable
              onPress={handleCallPhone}
              style={styles.contactButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Phone size={14} color={COLORS.hermes} strokeWidth={1.5} />
              <Text style={styles.contactText}>{address.phone}</Text>
            </Pressable>
          )}

          {/* Email */}
          {address.email && (
            <Pressable
              onPress={handleSendEmail}
              style={styles.contactButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Mail size={14} color={COLORS.hermes} strokeWidth={1.5} />
              <Text style={styles.contactText} numberOfLines={1}>
                {address.email}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Open in Maps Button */}
      <Pressable
        onPress={handleOpenMaps}
        style={({ pressed }) => [
          styles.mapsButton,
          pressed && styles.mapsButtonPressed,
        ]}
      >
        <Navigation size={16} color={COLORS.hermes} strokeWidth={1.5} />
        <Text style={styles.mapsButtonText}>Ouvrir dans Plans</Text>
      </Pressable>
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
    marginBottom: SPACING.sm,
  },

  content: {
    marginBottom: SPACING.sm,
  },

  recipientName: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.charcoal,
    marginBottom: SPACING.xxs,
  },

  addressText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
    lineHeight: FONT_SIZES.small * 1.5,
    marginBottom: SPACING.sm,
  },

  contactRow: {
    gap: SPACING.sm,
  },

  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  contactText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.hermes,
  },

  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.hermesLight,
    borderRadius: RADIUS.sm,
  },

  mapsButtonPressed: {
    opacity: 0.8,
  },

  mapsButtonText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: FONT_SIZES.small,
    color: COLORS.hermes,
  },
});

export default OrderAddressCard;
