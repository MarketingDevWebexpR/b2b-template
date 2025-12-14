import { useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, Link } from 'expo-router';
import { MapPin, Plus, Check, Home, Building2, Phone, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { ListSkeleton } from '@/components/skeleton';

/**
 * Address type definition
 */
type AddressType = 'home' | 'office' | 'other';

/**
 * Address interface
 */
interface Address {
  id: string;
  label: string;
  type: AddressType;
  firstName: string;
  lastName: string;
  street: string;
  complement?: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/**
 * Address type configuration with icons and labels
 */
const addressTypeConfig: Record<AddressType, {
  label: string;
  icon: typeof Home;
}> = {
  home: {
    label: 'Domicile',
    icon: Home,
  },
  office: {
    label: 'Bureau',
    icon: Building2,
  },
  other: {
    label: 'Autre',
    icon: MapPin,
  },
};

/**
 * Mock addresses data
 */
const mockAddresses: Address[] = [
  {
    id: 'addr_1',
    label: 'Domicile',
    type: 'home',
    firstName: 'Marie',
    lastName: 'Dupont',
    street: '15 rue de la Paix',
    complement: 'Appartement 3B',
    postalCode: '75002',
    city: 'Paris',
    country: 'France',
    phone: '+33 6 12 34 56 78',
    isDefault: true,
  },
  {
    id: 'addr_2',
    label: 'Bureau',
    type: 'office',
    firstName: 'Marie',
    lastName: 'Dupont',
    street: '42 avenue des Champs-Élysées',
    postalCode: '75008',
    city: 'Paris',
    country: 'France',
    phone: '+33 1 23 45 67 89',
    isDefault: false,
  },
  {
    id: 'addr_3',
    label: 'Maison secondaire',
    type: 'other',
    firstName: 'Marie',
    lastName: 'Dupont',
    street: '8 chemin des Oliviers',
    postalCode: '06000',
    city: 'Nice',
    country: 'France',
    phone: '+33 6 98 76 54 32',
    isDefault: false,
  },
];

/**
 * Default Badge Component
 */
function DefaultBadge() {
  return (
    <View className="flex-row items-center px-2.5 py-1 rounded-full bg-hermes-100">
      <Check size={12} color="#f67828" />
      <Text className="ml-1 font-sans text-xs font-medium text-hermes-600">
        Par défaut
      </Text>
    </View>
  );
}

/**
 * Address Card Component
 */
function AddressCard({ address }: { address: Address }) {
  const router = useRouter();
  const config = addressTypeConfig[address.type];
  const Icon = config.icon;

  const handlePress = () => {
    // TODO: Navigate to address edit page
    console.log('Edit address:', address.id);
  };

  const fullName = `${address.firstName} ${address.lastName}`;
  const fullAddress = [
    address.street,
    address.complement,
    `${address.postalCode} ${address.city}`,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-elegant border border-border-light mb-4 overflow-hidden active:opacity-90"
    >
      {/* Card Header */}
      <View className="px-4 py-3 border-b border-border-light flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-background-beige items-center justify-center mr-3">
            <Icon size={16} color="#696969" />
          </View>
          <Text className="font-serif text-base text-text-primary">{address.label}</Text>
        </View>
        {address.isDefault && <DefaultBadge />}
      </View>

      {/* Card Content */}
      <View className="px-4 py-4">
        {/* Name */}
        <Text className="font-sans text-sm font-medium text-text-primary mb-1">
          {fullName}
        </Text>

        {/* Full Address */}
        <Text className="font-sans text-sm text-text-muted mb-3" numberOfLines={2}>
          {fullAddress}
        </Text>

        {/* Phone */}
        <View className="flex-row items-center">
          <Phone size={14} color="#8b8b8b" />
          <Text className="font-sans text-sm text-text-muted ml-2">{address.phone}</Text>
        </View>

        {/* Edit indicator */}
        <View className="absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronRight size={20} color="#b8a99a" />
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Add Address Button Component
 */
function AddAddressButton() {
  const router = useRouter();

  const handlePress = () => {
    // TODO: Navigate to add address page
    console.log('Add new address');
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-elegant border border-dashed border-hermes-300 mb-4 overflow-hidden active:opacity-90"
    >
      <View className="px-4 py-6 items-center justify-center">
        <View className="w-12 h-12 rounded-full bg-hermes-100 items-center justify-center mb-3">
          <Plus size={24} color="#f67828" />
        </View>
        <Text className="font-sans text-sm font-medium text-hermes-500">
          Ajouter une adresse
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  const router = useRouter();

  const handleAddAddress = () => {
    // TODO: Navigate to add address page
    console.log('Add new address from empty state');
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
        <MapPin size={36} color="#696969" />
      </View>
      <Text className="font-serif text-2xl text-text-primary text-center mb-2">
        Aucune adresse
      </Text>
      <Text className="font-sans text-text-muted text-center mb-6">
        Vous n'avez pas encore ajouté d'adresse.{'\n'}
        Ajoutez une adresse pour faciliter vos commandes.
      </Text>
      <Pressable
        onPress={handleAddAddress}
        className="bg-hermes-500 px-8 py-4 rounded-soft flex-row items-center"
      >
        <Plus size={20} color="#ffffff" />
        <Text className="text-white font-sans font-medium ml-2">
          Ajouter une adresse
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Unauthenticated State Component
 */
function UnauthenticatedState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
        <MapPin size={36} color="#696969" />
      </View>
      <Text className="font-serif text-2xl text-text-primary mb-2">Mes adresses</Text>
      <Text className="font-sans text-text-muted text-center mb-6">
        Connectez-vous pour gérer vos adresses de livraison
      </Text>

      <Link href="/(auth)/login" asChild>
        <Pressable className="bg-hermes-500 px-8 py-4 rounded-soft w-full mb-3">
          <Text className="text-white font-sans font-medium text-center">Se connecter</Text>
        </Pressable>
      </Link>

      <Link href="/(auth)/register" asChild>
        <Pressable className="border border-hermes-500 px-8 py-4 rounded-soft w-full">
          <Text className="text-hermes-500 font-sans font-medium text-center">Créer un compte</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/**
 * Addresses Page - "Mes adresses"
 *
 * Features:
 * - Header with title
 * - List of saved addresses with FlatList for performance
 * - Address cards showing: label, type icon, name, full address, phone
 * - Default address badge
 * - Add new address button
 * - Empty state when no addresses
 * - Redirect to login if not authenticated
 */
export default function AddressesScreen() {
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
            headerTitle: 'Mes adresses',
            headerBackTitle: 'Retour',
            headerStyle: { backgroundColor: '#fffcf7' },
            headerTintColor: '#2b333f',
          }}
        />
        <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
          <ListSkeleton titleWidth={140} itemCount={2} variant="card" />
        </SafeAreaView>
      </>
    );
  }

  // Not authenticated - show unauthenticated state or redirect
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Mes adresses',
            headerBackTitle: 'Retour',
            headerStyle: { backgroundColor: '#fffcf7' },
            headerTintColor: '#2b333f',
          }}
        />
        <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
          <UnauthenticatedState />
        </SafeAreaView>
      </>
    );
  }

  // Use mock addresses for now
  // TODO: Replace with actual API call to fetch user addresses
  const addresses = mockAddresses;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Mes adresses',
          headerBackTitle: 'Retour',
          headerStyle: { backgroundColor: '#fffcf7' },
          headerTintColor: '#2b333f',
        }}
      />
      <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
        {addresses.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AddressCard address={item} />}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View className="mb-4">
                <Text className="font-serif text-3xl text-text-primary">Mes adresses</Text>
                <Text className="font-sans text-text-muted mt-1">
                  {addresses.length} adresse{addresses.length > 1 ? 's' : ''} enregistrée{addresses.length > 1 ? 's' : ''}
                </Text>
              </View>
            }
            ListFooterComponent={
              <View className="mt-2">
                <AddAddressButton />
                <View className="h-4" />
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}
