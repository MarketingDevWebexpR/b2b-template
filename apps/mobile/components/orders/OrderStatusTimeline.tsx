/**
 * OrderStatusTimeline Component
 *
 * An elegant vertical timeline showing order progress through different stages.
 * Features smooth animations, luxury styling, and French labels.
 *
 * @module components/orders/OrderStatusTimeline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Clock, CheckCircle, Package, Truck, MapPin, XCircle } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '@/constants/designTokens';

// =============================================================================
// TYPES
// =============================================================================

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderStatusTimelineProps {
  /** Current order status */
  status: OrderStatus;
  /** Order creation date */
  createdAt?: string;
  /** Date when order was shipped */
  shippedAt?: string;
  /** Date when order was delivered */
  deliveredAt?: string;
}

interface TimelineStep {
  key: OrderStatus;
  label: string;
  description: string;
  icon: typeof Clock;
  date?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; description: string; icon: typeof Clock }> = {
  pending: {
    label: 'En attente',
    description: 'Commande reçue',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmée',
    description: 'Paiement validé',
    icon: CheckCircle,
  },
  processing: {
    label: 'En préparation',
    description: 'Votre commande est préparée',
    icon: Package,
  },
  shipped: {
    label: 'Expédiée',
    description: 'En cours de livraison',
    icon: Truck,
  },
  delivered: {
    label: 'Livrée',
    description: 'Commande livrée',
    icon: MapPin,
  },
  cancelled: {
    label: 'Annulée',
    description: 'Commande annulée',
    icon: XCircle,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function getStatusIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STATUS_ORDER.indexOf(status);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TimelineStepItemProps {
  step: TimelineStep;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
  index: number;
}

function TimelineStepItem({ step, isCompleted, isCurrent, isLast, index }: TimelineStepItemProps) {
  const Icon = step.icon;
  const pulseOpacity = useSharedValue(1);

  // Pulse animation for current step
  React.useEffect(() => {
    if (isCurrent) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isCurrent, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: isCurrent ? pulseOpacity.value : 1,
  }));

  const getIconColor = () => {
    if (isCompleted) return COLORS.success;
    if (isCurrent) return COLORS.hermes;
    return COLORS.taupe;
  };

  const getLineColor = () => {
    if (isCompleted) return COLORS.success;
    return COLORS.borderLight;
  };

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 100).duration(400)}
      style={styles.stepContainer}
    >
      {/* Icon and Line Column */}
      <View style={styles.iconColumn}>
        <Animated.View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isCompleted
                ? COLORS.successLight
                : isCurrent
                ? COLORS.hermesLight
                : COLORS.backgroundBeige,
              borderColor: getIconColor(),
            },
            pulseStyle,
          ]}
        >
          <Icon
            size={18}
            color={getIconColor()}
            strokeWidth={isCompleted || isCurrent ? 2 : 1.5}
          />
        </Animated.View>

        {/* Connecting Line */}
        {!isLast && (
          <View style={[styles.line, { backgroundColor: getLineColor() }]} />
        )}
      </View>

      {/* Content Column */}
      <View style={styles.contentColumn}>
        <Text
          style={[
            styles.stepLabel,
            {
              color: isCompleted || isCurrent ? COLORS.charcoal : COLORS.textMuted,
              fontFamily: isCompleted || isCurrent ? FONTS.bodySemiBold : FONTS.body,
            },
          ]}
        >
          {step.label}
        </Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        {step.date && (
          <Text style={styles.stepDate}>{step.date}</Text>
        )}
      </View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function OrderStatusTimeline({
  status,
  createdAt,
  shippedAt,
  deliveredAt,
}: OrderStatusTimelineProps): JSX.Element {
  const currentIndex = getStatusIndex(status);
  const isCancelled = status === 'cancelled';

  // Build timeline steps with dates
  const steps: TimelineStep[] = STATUS_ORDER.map((statusKey) => {
    const config = STATUS_CONFIG[statusKey];
    let date: string | undefined;

    if (statusKey === 'pending' || statusKey === 'confirmed') {
      date = formatDate(createdAt);
    } else if (statusKey === 'shipped') {
      date = formatDate(shippedAt);
    } else if (statusKey === 'delivered') {
      date = formatDate(deliveredAt);
    }

    return {
      key: statusKey,
      ...config,
      date,
    };
  });

  // If cancelled, show cancelled state
  if (isCancelled) {
    return (
      <View style={styles.container}>
        <View style={styles.cancelledContainer}>
          <View style={styles.cancelledIconCircle}>
            <XCircle size={24} color={COLORS.error} strokeWidth={1.5} />
          </View>
          <View style={styles.cancelledContent}>
            <Text style={styles.cancelledLabel}>Commande annulée</Text>
            <Text style={styles.cancelledDescription}>
              Cette commande a été annulée
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <TimelineStepItem
          key={step.key}
          step={step}
          isCompleted={index < currentIndex}
          isCurrent={index === currentIndex}
          isLast={index === steps.length - 1}
          index={index}
        />
      ))}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },

  stepContainer: {
    flexDirection: 'row',
    minHeight: 72,
  },

  iconColumn: {
    width: 44,
    alignItems: 'center',
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  line: {
    width: 2,
    flex: 1,
    marginVertical: SPACING.xxs,
  },

  contentColumn: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  stepLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.charcoal,
    marginBottom: 2,
  },

  stepDescription: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },

  stepDate: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.caption,
    color: COLORS.stone,
    marginTop: 4,
  },

  // Cancelled state
  cancelledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
  },

  cancelledIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  cancelledContent: {
    flex: 1,
  },

  cancelledLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: FONT_SIZES.body,
    color: COLORS.error,
    marginBottom: 2,
  },

  cancelledDescription: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.small,
    color: COLORS.textMuted,
  },
});

export default OrderStatusTimeline;
