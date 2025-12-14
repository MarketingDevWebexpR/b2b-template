/**
 * Order Detail Screen
 *
 * Displays comprehensive order information including:
 * - Order header with number, date, and status
 * - Status timeline showing order progress
 * - List of ordered products
 * - Shipping address
 * - Payment summary
 * - Action buttons
 *
 * @module app/orders/[id]
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  Package,
  Truck,
  MessageCircle,
  RefreshCw,
  Share2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react-native';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
} from '@/constants/designTokens';
import { springConfigs } from '@/constants/animations';
import { hapticFeedback } from '@/constants/haptics';
import { formatPrice } from '@bijoux/utils';
import {
  OrderStatusTimeline,
  OrderProductItem,
  OrderSummaryCard,
  OrderAddressCard,
} from '@/components/orders';
import type { Order, OrderStatus, ShippingAddress, OrderItem } from '@/lib/shared/types';

// =============================================================================
// TYPES
// =============================================================================

type LocalOrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface MockOrderDetail extends Omit<Order, 'status' | 'items'> {
  status: LocalOrderStatus;
  items: OrderItem[];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockOrdersDetail: Record<string, MockOrderDetail> = {
  ord_1: {
    id: 'ord_1',
    orderNumber: 'ORD-2024-001',
    userId: 'user_1',
    status: 'delivered',
    items: [
      {
        productId: 'prod_1',
        productReference: 'SOL-ET-001',
        productName: 'Solitaire Éternité',
        productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500,
      },
    ],
    totals: {
      subtotal: 8500,
      shipping: 0,
      tax: 1700,
      discount: 0,
      total: 8500,
    },
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dubois',
      address: '15 Avenue des Champs-Élysées',
      addressLine2: 'Appartement 4B',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 6 12 34 56 78',
      email: 'marie.dubois@email.com',
    },
    paymentInfo: {
      method: 'card',
      status: 'completed',
      lastFourDigits: '4242',
      cardBrand: 'visa',
      paidAt: '2024-02-15T10:32:00Z',
    },
    trackingNumber: 'FR123456789',
    notes: 'Merci de sonner au 4B',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-18T14:00:00Z',
    shippedAt: '2024-02-16T09:00:00Z',
    deliveredAt: '2024-02-18T14:00:00Z',
  },
  ord_2: {
    id: 'ord_2',
    orderNumber: 'ORD-2024-002',
    userId: 'user_1',
    status: 'shipped',
    items: [
      {
        productId: 'prod_2',
        productReference: 'CRE-DIA-002',
        productName: 'Créoles Diamantées',
        productImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
      },
      {
        productId: 'prod_3',
        productReference: 'PEN-GOU-003',
        productName: "Pendentif Goutte d'Or",
        productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
        quantity: 1,
        unitPrice: 7200,
        totalPrice: 7200,
      },
    ],
    totals: {
      subtotal: 11400,
      shipping: 0,
      tax: 2280,
      discount: 0,
      total: 11400,
    },
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dubois',
      address: '15 Avenue des Champs-Élysées',
      addressLine2: 'Appartement 4B',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 6 12 34 56 78',
    },
    paymentInfo: {
      method: 'card',
      status: 'completed',
      lastFourDigits: '5678',
      cardBrand: 'mastercard',
      paidAt: '2024-03-01T14:47:00Z',
    },
    trackingNumber: 'FR987654321',
    createdAt: '2024-03-01T14:45:00Z',
    updatedAt: '2024-03-02T10:00:00Z',
    shippedAt: '2024-03-02T10:00:00Z',
  },
  ord_3: {
    id: 'ord_3',
    orderNumber: 'ORD-2024-003',
    userId: 'user_1',
    status: 'processing',
    items: [
      {
        productId: 'prod_4',
        productReference: 'BRA-TEN-004',
        productName: 'Bracelet Tennis Diamants',
        productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
    totals: {
      subtotal: 15000,
      shipping: 0,
      tax: 3000,
      discount: 0,
      total: 15000,
    },
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dubois',
      address: '15 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 6 12 34 56 78',
    },
    paymentInfo: {
      method: 'apple_pay',
      status: 'completed',
      paidAt: '2024-03-10T11:22:00Z',
    },
    createdAt: '2024-03-10T11:20:00Z',
    updatedAt: '2024-03-10T11:22:00Z',
  },
  ord_4: {
    id: 'ord_4',
    orderNumber: 'ORD-2024-004',
    userId: 'user_1',
    status: 'pending',
    items: [
      {
        productId: 'prod_5',
        productReference: 'ALL-ROY-005',
        productName: 'Alliance Royale',
        productImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        quantity: 2,
        unitPrice: 3200,
        totalPrice: 6400,
      },
    ],
    totals: {
      subtotal: 6400,
      shipping: 15,
      tax: 1280,
      discount: 0,
      total: 6415,
    },
    shippingAddress: {
      firstName: 'Marie',
      lastName: 'Dubois',
      address: '15 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      phone: '+33 6 12 34 56 78',
    },
    paymentInfo: {
      method: 'card',
      status: 'pending',
    },
    createdAt: '2024-03-12T09:00:00Z',
    updatedAt: '2024-03-12T09:00:00Z',
  },
};

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_CONFIG: Record<LocalOrderStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
  icon: typeof Clock;
}> = {
  pending: {
    label: 'En attente',
    bgColor: '#fef9c3',
    textColor: '#a16207',
    iconColor: '#a16207',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmée',
    bgColor: '#dbeafe',
    textColor: '#1d4ed8',
    iconColor: '#1d4ed8',
    icon: CheckCircle,
  },
  processing: {
    label: 'En préparation',
    bgColor: '#dbeafe',
    textColor: '#1d4ed8',
    iconColor: '#1d4ed8',
    icon: Package,
  },
  shipped: {
    label: 'Expédiée',
    bgColor: '#ffedd5',
    textColor: '#c2410c',
    iconColor: '#c2410c',
    icon: Truck,
  },
  delivered: {
    label: 'Livrée',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    iconColor: '#15803d',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulée',
    bgColor: '#fee2e2',
    textColor: '#b91c1c',
    iconColor: '#b91c1c',
    icon: AlertCircle,
  },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: 'Carte bancaire',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  bank_transfer: 'Virement bancaire',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StatusBadgeProps {
  status: LocalOrderStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Icon size={14} color={config.iconColor} strokeWidth={2} />
      <Text style={[styles.statusText, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  icon: typeof Package;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

function ActionButton({ icon: Icon, label, onPress, variant = 'secondary' }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springConfigs.button);
    hapticFeedback.buttonPress();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.button);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.actionButton,
        variant === 'primary' && styles.actionButtonPrimary,
        animatedStyle,
      ]}
    >
      <Icon
        size={18}
        color={variant === 'primary' ? COLORS.white : COLORS.hermes}
        strokeWidth={1.5}
      />
      <Text
        style={[
          styles.actionButtonText,
          variant === 'primary' && styles.actionButtonTextPrimary,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Get order data
  const order = id ? mockOrdersDetail[id] : null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticFeedback.pullRefresh();
    // Simulate API refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    hapticFeedback.success();
  }, []);

  const handleTrackShipment = () => {
    hapticFeedback.navigation();
    if (order?.trackingNumber) {
      // Open tracking URL (using La Poste as example)
      const url = `https://www.laposte.fr/outils/suivre-vos-envois?code=${order.trackingNumber}`;
      Linking.openURL(url);
    }
  };

  const handleCopyTracking = async () => {
    if (order?.trackingNumber) {
      hapticFeedback.success();
      // In a real app, use Clipboard API
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleContactSupport = () => {
    hapticFeedback.navigation();
    Linking.openURL('mailto:support@maisonbijoux.fr?subject=Question commande ' + order?.orderNumber);
  };

  const handleReorder = () => {
    hapticFeedback.addToCartSuccess();
    // In a real app, add items to cart
    router.push('/(tabs)/cart');
  };

  const handleShare = async () => {
    hapticFeedback.softPress();
    if (order) {
      try {
        await Share.share({
          message: `Ma commande ${order.orderNumber} chez Maison Bijoux - Total: ${formatPrice(order.totals.total)}`,
        });
      } catch (error) {
        console.log('Share error:', error);
      }
    }
  };

  // Not found state
  if (!order) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Commande',
            headerBackTitle: 'Retour',
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.charcoal,
          }}
        />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.notFoundContainer}>
            <Package size={48} color={COLORS.stone} strokeWidth={1.2} />
            <Text style={styles.notFoundTitle}>Commande introuvable</Text>
            <Text style={styles.notFoundText}>
              Cette commande n'existe pas ou vous n'y avez pas accès.
            </Text>
            <Pressable
              style={styles.notFoundButton}
              onPress={() => {
                hapticFeedback.navigation();
                router.back();
              }}
            >
              <Text style={styles.notFoundButtonText}>Retour aux commandes</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const paymentMethodLabel = PAYMENT_METHOD_LABELS[order.paymentInfo.method] || order.paymentInfo.method;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: order.orderNumber,
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.charcoal,
          headerTitleStyle: {
            fontFamily: FONTS.displayMedium,
            fontSize: FONT_SIZES.sectionTitle,
          },
          headerRight: () => (
            <Pressable
              onPress={handleShare}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginRight: SPACING.xs }}
            >
              <Share2 size={22} color={COLORS.charcoal} strokeWidth={1.5} />
            </Pressable>
          ),
        }}
      />

      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.hermes}
            />
          }
        >
          {/* Order Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.headerCard}
          >
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderDate}>
                  Commandé le {formatDate(order.createdAt)}
                </Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <View style={styles.trackingContainer}>
                <View style={styles.trackingInfo}>
                  <Truck size={16} color={COLORS.textMuted} strokeWidth={1.5} />
                  <Text style={styles.trackingLabel}>Numéro de suivi :</Text>
                  <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
                </View>
                <View style={styles.trackingActions}>
                  <Pressable
                    onPress={handleCopyTracking}
                    style={styles.trackingAction}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {copiedTracking ? (
                      <CheckCircle size={18} color={COLORS.success} strokeWidth={1.5} />
                    ) : (
                      <Copy size={18} color={COLORS.hermes} strokeWidth={1.5} />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={handleTrackShipment}
                    style={styles.trackingAction}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <ExternalLink size={18} color={COLORS.hermes} strokeWidth={1.5} />
                  </Pressable>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Status Timeline */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Suivi de commande</Text>
            <View style={styles.timelineCard}>
              <OrderStatusTimeline
                status={order.status}
                createdAt={order.createdAt}
                shippedAt={order.shippedAt}
                deliveredAt={order.deliveredAt}
              />
            </View>
          </Animated.View>

          {/* Products */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>
              {order.items.length} article{order.items.length > 1 ? 's' : ''}
            </Text>
            {order.items.map((item, index) => (
              <OrderProductItem
                key={`${item.productId}-${index}`}
                productId={item.productId}
                productName={item.productName}
                productImage={item.productImage}
                quantity={item.quantity}
                unitPrice={item.unitPrice}
                totalPrice={item.totalPrice}
                index={index}
              />
            ))}
          </Animated.View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Livraison</Text>
            <OrderAddressCard
              address={order.shippingAddress}
              delay={300}
            />
          </View>

          {/* Order Notes */}
          {order.notes && (
            <Animated.View
              entering={FadeInUp.delay(350).duration(400)}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>Instructions</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </Animated.View>
          )}

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paiement</Text>
            <OrderSummaryCard
              totals={order.totals}
              paymentMethod={paymentMethodLabel}
              cardLastFour={order.paymentInfo.lastFourDigits}
            />
          </View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.actionsSection}
          >
            {/* Track Shipment - only if shipped/delivered */}
            {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
              <ActionButton
                icon={Truck}
                label="Suivre mon colis"
                onPress={handleTrackShipment}
                variant="primary"
              />
            )}

            {/* Contact Support */}
            <ActionButton
              icon={MessageCircle}
              label="Contacter le support"
              onPress={handleContactSupport}
            />

            {/* Reorder - only if delivered */}
            {order.status === 'delivered' && (
              <ActionButton
                icon={RefreshCw}
                label="Commander à nouveau"
                onPress={handleReorder}
              />
            )}
          </Animated.View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  // Header Card
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  orderNumber: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZES.heading,
    color: COLORS.charcoal,
    marginBottom: SPACING.xxs,
  },

  orderDate: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
    gap: 6,
  },

  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.caption,
  },

  // Tracking
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },

  trackingLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  trackingNumber: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.small,
    color: COLORS.charcoal,
  },

  trackingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  trackingAction: {
    padding: SPACING.xs,
  },

  // Sections
  section: {
    marginBottom: SPACING.lg,
  },

  sectionTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: FONT_SIZES.sectionTitle,
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
  },

  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Notes
  notesCard: {
    backgroundColor: COLORS.backgroundBeige,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },

  notesText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.small * 1.5,
  },

  // Actions
  actionsSection: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.hermes,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  actionButtonPrimary: {
    backgroundColor: COLORS.hermes,
    borderColor: COLORS.hermes,
  },

  actionButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.hermes,
  },

  actionButtonTextPrimary: {
    color: COLORS.white,
  },

  // Not Found
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  notFoundTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: FONT_SIZES.heading,
    color: COLORS.charcoal,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  notFoundText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  notFoundButton: {
    backgroundColor: COLORS.hermes,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.pill,
  },

  notFoundButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.white,
  },

  bottomSpacer: {
    height: SPACING.xxl,
  },
});
