import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  LogIn,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface MenuItemProps {
  icon: typeof User;
  label: string;
  href?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, href, onPress, showChevron = true, danger }: MenuItemProps) {
  const content = (
    <View className="flex-row items-center py-4 border-b border-border-light">
      <View className="w-10 h-10 rounded-full bg-background-beige items-center justify-center">
        <Icon size={20} color={danger ? '#dc2626' : '#696969'} />
      </View>
      <Text className={`flex-1 ml-3 font-sans ${danger ? 'text-red-600' : 'text-text-primary'}`}>
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color="#b8a99a" />}
    </View>
  );

  if (href) {
    return (
      <Link href={href as any} asChild>
        <Pressable>{content}</Pressable>
      </Link>
    );
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function AccountScreen() {
  const { isAuthenticated, user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingAnimation variant="fullScreen" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-background-beige items-center justify-center mb-6">
            <User size={36} color="#696969" />
          </View>
          <Text className="font-serif text-2xl text-text-primary mb-2">Mon compte</Text>
          <Text className="font-sans text-text-muted text-center mb-6">
            Connectez-vous pour accéder à votre espace personnel
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Text className="font-serif text-3xl text-text-primary">Mon compte</Text>
          <View className="flex-row items-center mt-4">
            <View className="w-14 h-14 rounded-full bg-hermes-100 items-center justify-center">
              <Text className="font-serif text-xl text-hermes-600">
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="font-serif text-lg text-text-primary">{user?.name}</Text>
              <Text className="font-sans text-sm text-text-muted">{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mb-2">
            Mes achats
          </Text>
          <MenuItem icon={Package} label="Mes commandes" href="/orders" />
          <MenuItem icon={Heart} label="Mes favoris" href="/favorites" />

          <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mt-6 mb-2">
            Mon compte
          </Text>
          <MenuItem icon={User} label="Informations personnelles" href="/profile" />
          <MenuItem icon={MapPin} label="Mes adresses" href="/addresses" />
          <MenuItem icon={CreditCard} label="Moyens de paiement" href="/payment-methods" />

          <Text className="font-sans text-xs text-text-muted uppercase tracking-wider mt-6 mb-2">
            Aide
          </Text>
          <MenuItem icon={HelpCircle} label="Centre d'aide" href="/help" />
          <MenuItem icon={Settings} label="Paramètres" href="/settings" />

          <View className="mt-6 mb-8">
            <MenuItem
              icon={LogOut}
              label="Se déconnecter"
              onPress={handleSignOut}
              showChevron={false}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
