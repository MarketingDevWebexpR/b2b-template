import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Info,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { SettingsSkeleton } from '@/components/skeleton';
import { hapticFeedback } from '@/constants/haptics';

// Small red spinner for delete action
function DeleteSpinner() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withRepeat(
      withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#dc2626',
          borderTopColor: 'transparent',
        },
        animatedStyle,
      ]}
    />
  );
}

// App configuration
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

// Language options
const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SettingToggle({ label, description, value, onValueChange }: SettingToggleProps) {
  const handleValueChange = (newValue: boolean) => {
    hapticFeedback.toggleSwitch();
    onValueChange(newValue);
  };

  return (
    <View className="flex-row items-center justify-between py-4 border-b border-border-light">
      <View className="flex-1 mr-4">
        <Text className="font-sans text-text-primary">{label}</Text>
        {description && (
          <Text className="font-sans text-xs text-text-muted mt-1">{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={handleValueChange}
        trackColor={{ false: '#d4d4d4', true: '#f67828' }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d4d4d4"
      />
    </View>
  );
}

interface SettingLinkProps {
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function SettingLink({ label, value, onPress, showChevron = true }: SettingLinkProps) {
  const handlePress = () => {
    hapticFeedback.listItemSelect();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center justify-between py-4 border-b border-border-light"
    >
      <Text className="font-sans text-text-primary">{label}</Text>
      <View className="flex-row items-center">
        {value && <Text className="font-sans text-text-muted mr-2">{value}</Text>}
        {showChevron && <ChevronRight size={20} color="#b8a99a" />}
      </View>
    </Pressable>
  );
}

interface SectionHeaderProps {
  icon: typeof Bell;
  title: string;
}

function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center mt-8 mb-4">
      <View className="w-10 h-10 rounded-full bg-background-beige items-center justify-center">
        <Icon size={20} color="#f67828" />
      </View>
      <Text className="font-serif text-lg text-text-primary ml-3">{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut } = useAuth();

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Privacy settings
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Language settings
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('fr');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Deleting account state
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    hapticFeedback.warning();
    Alert.alert(
      'Supprimer mon compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Simulate API call for account deletion
              await new Promise((resolve) => setTimeout(resolve, 1500));
              // Sign out and redirect
              hapticFeedback.success();
              await signOut();
              router.replace('/');
            } catch (error) {
              hapticFeedback.error();
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du compte.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir le lien.");
    });
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    hapticFeedback.selection();
    setSelectedLanguage(code);
    setShowLanguageSelector(false);
    // In a real app, this would update the app's locale
  };

  const getLanguageLabel = (code: LanguageCode): string => {
    return LANGUAGES.find((lang) => lang.code === code)?.label || 'Français';
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <SettingsSkeleton />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Pressable
            onPress={() => {
              hapticFeedback.navigation();
              router.back();
            }}
            className="flex-row items-center mb-4"
          >
            <ChevronLeft size={24} color="#1a1a1a" />
            <Text className="font-sans text-text-primary ml-1">Retour</Text>
          </Pressable>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-background-beige items-center justify-center">
              <Settings size={24} color="#f67828" />
            </View>
            <View className="ml-4">
              <Text className="font-serif text-3xl text-text-primary">Paramètres</Text>
            </View>
          </View>
        </View>

        {/* Settings Content */}
        <View className="px-6">
          {/* Notifications Section */}
          <SectionHeader icon={Bell} title="Notifications" />
          <View className="bg-white rounded-soft border border-border-light px-4">
            <SettingToggle
              label="Notifications push"
              description="Recevez des alertes sur votre téléphone"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <SettingToggle
              label="Notifications par email"
              description="Promotions et nouveautés"
              value={emailEnabled}
              onValueChange={setEmailEnabled}
            />
            <SettingToggle
              label="Notifications SMS"
              description="Suivi de commande par SMS"
              value={smsEnabled}
              onValueChange={setSmsEnabled}
            />
          </View>

          {/* Privacy Section */}
          <SectionHeader icon={Shield} title="Confidentialité" />
          <View className="bg-white rounded-soft border border-border-light px-4">
            <SettingToggle
              label="Statistiques d'utilisation"
              description="Aidez-nous à améliorer l'application"
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
            />
          </View>

          {/* Language Section */}
          <SectionHeader icon={Globe} title="Langue" />
          <View className="bg-white rounded-soft border border-border-light px-4">
            {showLanguageSelector ? (
              <View>
                {LANGUAGES.map((language) => (
                  <Pressable
                    key={language.code}
                    onPress={() => handleLanguageSelect(language.code)}
                    className="flex-row items-center justify-between py-4 border-b border-border-light last:border-b-0"
                  >
                    <Text
                      className={`font-sans ${
                        selectedLanguage === language.code
                          ? 'text-hermes-500 font-medium'
                          : 'text-text-primary'
                      }`}
                    >
                      {language.label}
                    </Text>
                    {selectedLanguage === language.code && <Check size={20} color="#f67828" />}
                  </Pressable>
                ))}
              </View>
            ) : (
              <SettingLink
                label="Langue de l'application"
                value={getLanguageLabel(selectedLanguage)}
                onPress={() => setShowLanguageSelector(true)}
              />
            )}
          </View>

          {/* About Section */}
          <SectionHeader icon={Info} title="À propos" />
          <View className="bg-white rounded-soft border border-border-light px-4">
            <View className="flex-row items-center justify-between py-4 border-b border-border-light">
              <Text className="font-sans text-text-primary">Version de l'application</Text>
              <Text className="font-sans text-text-muted">
                {APP_VERSION} ({BUILD_NUMBER})
              </Text>
            </View>
            <SettingLink
              label="Conditions générales d'utilisation"
              onPress={() => handleOpenLink('https://example.com/terms')}
            />
            <SettingLink
              label="Politique de confidentialité"
              onPress={() => handleOpenLink('https://example.com/privacy')}
              showChevron={true}
            />
          </View>

          {/* Danger Zone */}
          <View className="mt-10 mb-8">
            <Text className="font-sans text-xs text-red-500 uppercase tracking-wider mb-4">
              Zone de danger
            </Text>
            <View className="bg-red-50 rounded-soft border border-red-200 px-4">
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-row items-center justify-between py-4"
              >
                <View className="flex-row items-center">
                  <Trash2 size={20} color="#dc2626" />
                  <View className="ml-3">
                    <Text className="font-sans text-red-600 font-medium">
                      Supprimer mon compte
                    </Text>
                    <Text className="font-sans text-xs text-red-400 mt-0.5">
                      Cette action est irréversible
                    </Text>
                  </View>
                </View>
                {isDeleting ? (
                  <DeleteSpinner />
                ) : (
                  <ChevronRight size={20} color="#dc2626" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="font-serif text-lg text-hermes-500">Maison Bijoux</Text>
            <Text className="font-sans text-xs text-text-muted mt-1">
              Joaillerie d'exception depuis 1892
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
