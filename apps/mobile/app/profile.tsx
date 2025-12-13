import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, ChevronLeft, Check } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      // Phone is not in the current User interface, but we handle it for the form
      setPhone('');
    }
  }, [user]);

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    setSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In a real app, this would call an API to update the user profile
      // For now, we just show success feedback
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (userName: string): string => {
    if (!userName) return 'U';
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#f67828" />
      </SafeAreaView>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center mb-4"
            >
              <ChevronLeft size={24} color="#1a1a1a" />
              <Text className="font-sans text-text-primary ml-1">Retour</Text>
            </Pressable>
            <Text className="font-serif text-3xl text-text-primary">Mon profil</Text>
            <Text className="font-sans text-text-muted mt-2">
              Modifiez vos informations personnelles
            </Text>
          </View>

          {/* Avatar Section */}
          <View className="items-center py-6">
            <View className="w-24 h-24 rounded-full bg-hermes-100 items-center justify-center mb-3">
              <Text className="font-serif text-3xl text-hermes-600">
                {getInitials(name || user.name)}
              </Text>
            </View>
            <Text className="font-serif text-lg text-text-primary">{name || user.name}</Text>
          </View>

          {/* Form */}
          <View className="px-6 pb-8">
            {/* Success Message */}
            {success && (
              <View className="bg-green-50 border border-green-200 rounded-soft p-3 mb-4 flex-row items-center">
                <Check size={18} color="#16a34a" />
                <Text className="text-green-600 font-sans text-sm ml-2">
                  Vos informations ont ete mises a jour
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-soft p-3 mb-4">
                <Text className="text-red-600 font-sans text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View className="mb-4">
              <Text className="font-sans text-sm text-text-secondary mb-2">Nom complet</Text>
              <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                <User size={20} color="#696969" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Votre nom"
                  autoCapitalize="words"
                  autoComplete="name"
                  className="flex-1 ml-3 font-sans text-text-primary"
                  placeholderTextColor="#8b8b8b"
                />
              </View>
            </View>

            {/* Email Input (readonly) */}
            <View className="mb-4">
              <Text className="font-sans text-sm text-text-secondary mb-2">
                Email <Text className="text-text-muted">(non modifiable)</Text>
              </Text>
              <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-background-beige">
                <Mail size={20} color="#8b8b8b" />
                <TextInput
                  value={email}
                  editable={false}
                  className="flex-1 ml-3 font-sans text-text-muted"
                />
              </View>
            </View>

            {/* Phone Input (optional) */}
            <View className="mb-6">
              <Text className="font-sans text-sm text-text-secondary mb-2">
                Telephone <Text className="text-text-muted">(optionnel)</Text>
              </Text>
              <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                <Phone size={20} color="#696969" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+33 6 12 34 56 78"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  className="flex-1 ml-3 font-sans text-text-primary"
                  placeholderTextColor="#8b8b8b"
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={loading}
              className={`py-4 rounded-soft ${loading ? 'bg-hermes-400' : 'bg-hermes-500'}`}
            >
              <Text className="text-white font-sans font-medium text-center">
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
