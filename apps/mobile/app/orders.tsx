import { View, Text, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, Link } from 'expo-router';
import { useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@bijoux/utils';

/**
 * Order status type
 */
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Order item type
 */
interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Order type
 */
interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
}

/**
 * Status configuration with colors and labels
 */
const statusConfig: Record<OrderStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: typeof Clock;
}> = {
  pending: {
    label: 'En attente',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    icon: Clock,
  },
  processing: {
    label: 'En preparation',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: Package,
  },
  shipped: {
    label: 'Expediee',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: Truck,
  },
  delivered: {
    label: 'Livree',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Annulee',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: AlertCircle,
  },
};

/**
 * Mock orders data
 */
const mockOrders: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2024-001',
    items: [
      {
        productId: 'prod_1',
        productName: 'Solitaire Eternite',
        productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200',
        quantity: 1,
        unitPrice: 8500,
        totalPrice: 8500,
      },
    ],
    total: 8500,
    status: 'delivered',
    createdAt: '2024-02-15T10:30:00Z',
    trackingNumber: 'FR123456789',
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-2024-002',
    items: [
      {
        productId: 'prod_2',
        productName: 'Creoles Diamantees',
        productImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200',
        quantity: 1,
        unitPrice: 4200,
        totalPrice: 4200,
      },
      {
        productId: 'prod_3',
        productName: "Pendentif Goutte d'Or",
        productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200',
        quantity: 1,
        unitPrice: 7200,
        totalPrice: 7200,
      },
    ],
    total: 11400,
    status: 'shipped',
    createdAt: '2024-03-01T14:45:00Z',
    trackingNumber: 'FR987654321',
  },
  {
    id: 'ord_3',
    orderNumber: 'ORD-2024-003',
    items: [
      {
        productId: 'prod_4',
        productName: 'Bracelet Tennis Diamants',
        productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
    total: 15000,
    status: 'processing',
    createdAt: '2024-03-10T11:20:00Z',
  },
  {
    id: 'ord_4',
    orderNumber: 'ORD-2024-004',
    items: [
      {
        productId: 'prod_5',
        productName: 'Alliance Royale',
        productImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
        quantity: 2,
        unitPrice: 3200,
        totalPrice: 6400,
      },
    ],
    total: 6400,
    status: 'pending',
    createdAt: '2024-03-12T09:00:00Z',
  },
];

/**
 * Format date to French locale
 */
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <Icon size={14} color={config.textColor === 'text-yellow-700' ? '#a16207' :
                            config.textColor === 'text-blue-700' ? '#1d4ed8' :
                            config.textColor === 'text-orange-700' ? '#c2410c' :
                            config.textColor === 'text-green-700' ? '#15803d' : '#b91c1c'} />
      <Text className={`ml-1.5 font-sans text-xs font-medium ${config.textColor}`}>
        {config.label}
      </Text>
    </View>
  );
}

/**
 * Product Thumbnails Component
 */
function ProductThumbnails({ items }: { items: OrderItem[] }) {
  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <View className="flex-row -space-x-2">
      {displayItems.map((item, index) => (
        <View
          key={`${item.productId}-${index}`}
          className="w-12 h-12 rounded-soft border-2 border-white overflow-hidden bg-background-beige"
          style={{ zIndex: 3 - index }}
        >
          {item.productImage ? (
            <Image
              source={{ uri: item.productImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Package size={16} color="#696969" />
            </View>
          )}
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          className="w-12 h-12 rounded-soft border-2 border-white bg-background-beige items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <Text className="font-sans text-xs text-text-muted">+{remainingCount}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * Order Card Component
 */
function OrderCard({ order }: { order: Order }) {
  const router = useRouter();

  const handlePress = () => {
    // TODO: Navigate to order detail page
    // router.push(`/orders/${order.id}`);
    console.log('Navigate to order:', order.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-elegant border border-border-light mb-4 overflow-hidden active:opacity-90"
    >
      {/* Order Header */}
      <View className="px-4 py-3 border-b border-border-light flex-row items-center justify-between">
        <View>
          <Text className="font-serif text-base text-text-primary">{order.orderNumber}</Text>
          <Text className="font-sans text-xs text-text-muted mt-0.5">
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Order Content */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          {/* Product Thumbnails */}
          <View className="flex-row items-center flex-1">
            <ProductThumbnails items={order.items} />
            <View className="ml-3 flex-1">
              <Text className="font-sans text-sm text-text-primary" numberOfLines={1}>
                {order.items.length === 1
                  ? order.items[0].productName
                  : `${order.items.length} articles`}
              </Text>
              {order.items.length > 1 && (
                <Text className="font-sans text-xs text-text-muted mt-0.5" numberOfLines={1}>
                  {order.items.map((item) => item.productName).join(', ')}
                </Text>
              )}
            </View>
          </View>

          {/* Total and Chevron */}
          <View className="flex-row items-center ml-2">
            <Text className="font-serif text-lg text-hermes-500">{formatPrice(order.total)}</Text>
            <ChevronRight size={20} color="#b8a99a" className="ml-2" />
          </View>
        </View>

        {/* Tracking Number */}
        {order.trackingNumber && (
          <View className="mt-3 pt-3 border-t border-border-light">
            <Text className="font-sans text-xs text-text-muted">
              Numero de suivi :{' '}
              <Text className="font-medium text-text-primary">{order.trackingNumber}</Text>
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
        <Package size={36} color="#696969" />
      </View>
      <Text className="font-serif text-2xl text-text-primary text-center mb-2">
        Aucune commande
      </Text>
      <Text className="font-sans text-text-muted text-center mb-6">
        Vous n'avez pas encore passe de commande.{'\n'}
        Decouvrez nos collections et trouvez la piece qui vous correspond.
      </Text>
      <Link href="/collections" asChild>
        <Pressable className="bg-hermes-500 px-8 py-4 rounded-soft">
          <Text className="text-white font-sans font-medium">Decouvrir nos collections</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/**
 * Orders Page - "Mes Commandes"
 *
 * Features:
 * - Header with title
 * - List of orders with FlatList for performance
 * - Order cards showing: order number, date, status badge, product thumbnails, total
 * - Status colors: pending=yellow, processing=blue, shipped=orange, delivered=green
 * - Empty state when no orders
 * - Redirect to login if not authenticated
 */
export default function OrdersScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Mes commandes',
            headerBackTitle: 'Retour',
            headerStyle: { backgroundColor: '#fffcf7' },
            headerTintColor: '#2b333f',
          }}
        />
        <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['bottom']}>
          <ActivityIndicator size="large" color="#f67828" />
        </SafeAreaView>
      </>
    );
  }

  // Not authenticated - show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Use mock orders for now
  // TODO: Replace with actual API call to fetch user orders
  const orders = mockOrders;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Mes commandes',
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: '#fffcf7' },
          headerTintColor: '#2b333f',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderCard order={item} />}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="font-serif text-3xl text-text-primary">Mes commandes</Text>
                <Text className="font-sans text-text-muted mt-1">
                  {orders.length} commande{orders.length > 1 ? 's' : ''}
                </Text>
              </View>
            }
            ListFooterComponent={<View className="h-4" />}
          />
        )}
      </SafeAreaView>
    </>
  );
}
