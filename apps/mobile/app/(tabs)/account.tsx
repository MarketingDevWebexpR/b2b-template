import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
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

const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#fcf7f1',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  hermes100: '#fff7ed',
  hermes500: '#f67828',
  hermes600: '#ea580c',
  white: '#ffffff',
  muted: '#696969',
  borderLight: '#f0ebe3',
  danger: '#dc2626',
  stone: '#b8a99a',
};

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
    <View style={styles.menuItem}>
      <View style={styles.menuIconContainer}>
        <Icon size={20} color={danger ? COLORS.danger : COLORS.muted} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color={COLORS.stone} />}
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
      <SafeAreaView style={styles.container}>
        <LoadingAnimation variant="fullScreen" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthContainer}>
          <View style={styles.notAuthIconContainer}>
            <User size={36} color={COLORS.muted} />
          </View>
          <Text style={styles.notAuthTitle}>Mon compte</Text>
          <Text style={styles.notAuthSubtitle}>
            Connectez-vous pour accéder à votre espace personnel
          </Text>

          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Créer un compte</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon compte</Text>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>
            Mes achats
          </Text>
          <MenuItem icon={Package} label="Mes commandes" href="/orders" />
          <MenuItem icon={Heart} label="Mes favoris" href="/favorites" />

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Mon compte
          </Text>
          <MenuItem icon={User} label="Informations personnelles" href="/profile" />
          <MenuItem icon={MapPin} label="Mes adresses" href="/addresses" />
          <MenuItem icon={CreditCard} label="Moyens de paiement" href="/payment-methods" />

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
            Aide
          </Text>
          <MenuItem icon={HelpCircle} label="Centre d'aide" href="/help" />
          <MenuItem icon={Settings} label="Paramètres" href="/settings" />

          <View style={styles.logoutSection}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32,
    color: COLORS.charcoal,
    letterSpacing: 0.3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.hermes100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 20,
    color: COLORS.hermes600,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontFamily: 'PlayfairDisplay-Medium',
    fontSize: 18,
    color: COLORS.charcoal,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Menu
  menuContainer: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.charcoal,
  },
  menuLabelDanger: {
    color: COLORS.danger,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionTitleSpaced: {
    marginTop: 24,
  },
  logoutSection: {
    marginTop: 24,
    marginBottom: 32,
  },

  // Not authenticated
  notAuthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  notAuthIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundBeige,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  notAuthTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 26,
    color: COLORS.charcoal,
    marginBottom: 8,
  },
  notAuthSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.hermes500,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
    textAlign: 'center',
  },
  registerButton: {
    borderWidth: 1,
    borderColor: COLORS.hermes500,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  registerButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.hermes500,
    textAlign: 'center',
  },
});
