import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, Link } from 'expo-router';
import { CreditCard, Plus, Check, Shield, Trash2, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

/**
 * Card type enumeration
 */
type CardType = 'visa' | 'mastercard' | 'amex' | 'cb';

/**
 * Payment method interface
 */
interface PaymentMethod {
  id: string;
  cardType: CardType;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
}

/**
 * Card type configuration with display info
 */
const cardTypeConfig: Record<CardType, { label: string; color: string }> = {
  visa: { label: 'Visa', color: '#1A1F71' },
  mastercard: { label: 'Mastercard', color: '#EB001B' },
  amex: { label: 'American Express', color: '#006FCF' },
  cb: { label: 'Carte Bancaire', color: '#1D4ED8' },
};

/**
 * Mock payment methods data
 */
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    cardType: 'visa',
    lastFourDigits: '4242',
    expiryMonth: '12',
    expiryYear: '2026',
    isDefault: true,
    cardholderName: 'Marie Dupont',
  },
  {
    id: 'pm_2',
    cardType: 'mastercard',
    lastFourDigits: '8888',
    expiryMonth: '06',
    expiryYear: '2025',
    isDefault: false,
    cardholderName: 'Marie Dupont',
  },
  {
    id: 'pm_3',
    cardType: 'amex',
    lastFourDigits: '1234',
    expiryMonth: '03',
    expiryYear: '2027',
    isDefault: false,
    cardholderName: 'Marie Dupont',
  },
];

/**
 * Card Type Icon Component
 * Displays a styled icon based on card type
 */
function CardTypeIcon({ cardType }: { cardType: CardType }) {
  const config = cardTypeConfig[cardType];

  return (
    <View
      className="w-12 h-8 rounded items-center justify-center"
      style={{ backgroundColor: config.color }}
    >
      <Text className="font-sans text-xs font-bold text-white">
        {cardType === 'visa' && 'VISA'}
        {cardType === 'mastercard' && 'MC'}
        {cardType === 'amex' && 'AMEX'}
        {cardType === 'cb' && 'CB'}
      </Text>
    </View>
  );
}

/**
 * Default Badge Component
 */
function DefaultBadge() {
  return (
    <View className="flex-row items-center bg-green-100 px-2.5 py-1 rounded-full">
      <Check size={12} color="#16a34a" />
      <Text className="font-sans text-xs font-medium text-green-700 ml-1">
        Par défaut
      </Text>
    </View>
  );
}

/**
 * Payment Method Card Component
 */
function PaymentMethodCard({
  paymentMethod,
  onSetDefault,
  onDelete,
}: {
  paymentMethod: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = cardTypeConfig[paymentMethod.cardType];

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette carte ?',
      `Voulez-vous vraiment supprimer la carte ${config.label} se terminant par ${paymentMethod.lastFourDigits} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDelete(paymentMethod.id),
        },
      ]
    );
  };

  const handleSetDefault = () => {
    if (!paymentMethod.isDefault) {
      onSetDefault(paymentMethod.id);
    }
  };

  return (
    <View className="bg-white rounded-elegant border border-border-light mb-4 overflow-hidden">
      {/* Card Header */}
      <View className="px-4 py-4 flex-row items-center">
        <CardTypeIcon cardType={paymentMethod.cardType} />
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="font-serif text-base text-text-primary">
              {config.label}
            </Text>
            {paymentMethod.isDefault && (
              <View className="ml-2">
                <DefaultBadge />
              </View>
            )}
          </View>
          <Text className="font-sans text-sm text-text-muted mt-0.5">
            **** **** **** {paymentMethod.lastFourDigits}
          </Text>
        </View>
      </View>

      {/* Card Details */}
      <View className="px-4 py-3 border-t border-border-light bg-background-beige/50">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-sans text-xs text-text-muted">
              Expire le
            </Text>
            <Text className="font-sans text-sm text-text-primary mt-0.5">
              {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
            </Text>
          </View>
          <View>
            <Text className="font-sans text-xs text-text-muted text-right">
              Titulaire
            </Text>
            <Text className="font-sans text-sm text-text-primary mt-0.5 text-right">
              {paymentMethod.cardholderName}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Actions */}
      <View className="px-4 py-3 border-t border-border-light flex-row justify-between items-center">
        {!paymentMethod.isDefault ? (
          <Pressable
            onPress={handleSetDefault}
            className="flex-row items-center"
          >
            <Check size={16} color="#f67828" />
            <Text className="font-sans text-sm text-hermes-500 ml-1.5">
              Définir par défaut
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable
          onPress={handleDelete}
          className="flex-row items-center"
        >
          <Trash2 size={16} color="#dc2626" />
          <Text className="font-sans text-sm text-red-600 ml-1.5">
            Supprimer
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
        <CreditCard size={36} color="#696969" />
      </View>
      <Text className="font-serif text-2xl text-text-primary text-center mb-2">
        Aucun moyen de paiement
      </Text>
      <Text className="font-sans text-text-muted text-center mb-6">
        Ajoutez une carte bancaire pour faciliter{'\n'}vos prochains achats.
      </Text>
      <Pressable className="bg-hermes-500 px-8 py-4 rounded-soft flex-row items-center">
        <Plus size={20} color="#ffffff" />
        <Text className="text-white font-sans font-medium ml-2">
          Ajouter une carte
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Security Note Component
 */
function SecurityNote() {
  return (
    <View className="bg-background-beige border border-border-light rounded-elegant p-4 mt-4 flex-row">
      <Shield size={20} color="#696969" />
      <View className="flex-1 ml-3">
        <Text className="font-serif text-sm text-text-primary mb-1">
          Vos données sont protégées
        </Text>
        <Text className="font-sans text-xs text-text-muted leading-relaxed">
          Toutes vos informations de paiement sont chiffrées et sécurisées.
          Nous ne stockons jamais vos numéros de carte complets conformément
          aux normes PCI-DSS.
        </Text>
      </View>
    </View>
  );
}

/**
 * Add Payment Method Button Component
 */
function AddPaymentMethodButton() {
  const handleAddCard = () => {
    // TODO: Navigate to add payment method screen or show modal
    Alert.alert(
      'Ajouter une carte',
      'Cette fonctionnalité sera bientôt disponible.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Pressable
      onPress={handleAddCard}
      className="bg-hermes-500 rounded-soft py-4 flex-row items-center justify-center mt-4"
    >
      <Plus size={20} color="#ffffff" />
      <Text className="text-white font-sans font-medium ml-2">
        Ajouter un moyen de paiement
      </Text>
    </Pressable>
  );
}

/**
 * Payment Methods Page - "Moyens de paiement"
 *
 * Features:
 * - Header with title
 * - List of saved payment methods
 * - Each card shows: card type icon, last 4 digits, expiry date, default badge
 * - Add new payment method button
 * - Empty state when no payment methods
 * - Security note about data protection
 * - Authentication check with redirect
 */
export default function PaymentMethodsScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Local state for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle set default payment method
  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
  };

  // Handle delete payment method
  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => {
      const filtered = prev.filter((pm) => pm.id !== id);
      // If we deleted the default, make the first remaining one default
      if (filtered.length > 0 && !filtered.some((pm) => pm.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Moyens de paiement',
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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Moyens de paiement',
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: '#fffcf7' },
          headerTintColor: '#2b333f',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {paymentMethods.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={paymentMethods}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PaymentMethodCard
                paymentMethod={item}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="font-serif text-3xl text-text-primary">
                  Moyens de paiement
                </Text>
                <Text className="font-sans text-text-muted mt-1">
                  {paymentMethods.length} carte{paymentMethods.length > 1 ? 's' : ''} enregistrée{paymentMethods.length > 1 ? 's' : ''}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View>
                <AddPaymentMethodButton />
                <SecurityNote />
                <View className="h-8" />
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}
