import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { hapticFeedback } from '@/constants/haptics';

export default function RegisterScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    hapticFeedback.formSubmit();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      hapticFeedback.error();
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      hapticFeedback.error();
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      hapticFeedback.error();
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(name, email, password);

      if (result.success) {
        hapticFeedback.success();
        if (returnTo) {
          // @ts-expect-error - dynamic route from returnTo param
          router.replace(returnTo);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        hapticFeedback.error();
        setError(result.error || "Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      hapticFeedback.error();
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8 pb-8">
            {/* Header */}
            <View className="mb-8">
              <Text className="font-serif text-3xl text-text-primary">Créer un compte</Text>
              <Text className="font-sans text-text-muted mt-2">
                Rejoignez Maison Bijoux pour une expérience personnalisée
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-soft p-3 mb-4">
                <Text className="text-red-600 font-sans text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View className="space-y-4">
              {/* Name Input */}
              <View>
                <Text className="font-sans text-sm text-text-secondary mb-2">Nom complet</Text>
                <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                  <User size={20} color="#696969" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Jean Dupont"
                    autoCapitalize="words"
                    autoComplete="name"
                    className="flex-1 ml-3 font-sans text-text-primary"
                    placeholderTextColor="#8b8b8b"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mt-4">
                <Text className="font-sans text-sm text-text-secondary mb-2">Email</Text>
                <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                  <Mail size={20} color="#696969" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="flex-1 ml-3 font-sans text-text-primary"
                    placeholderTextColor="#8b8b8b"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mt-4">
                <Text className="font-sans text-sm text-text-secondary mb-2">Mot de passe</Text>
                <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                  <Lock size={20} color="#696969" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                    className="flex-1 ml-3 font-sans text-text-primary"
                    placeholderTextColor="#8b8b8b"
                  />
                  <Pressable onPress={() => {
                    hapticFeedback.toggleSwitch();
                    setShowPassword(!showPassword);
                  }}>
                    {showPassword ? (
                      <EyeOff size={20} color="#696969" />
                    ) : (
                      <Eye size={20} color="#696969" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View className="mt-4">
                <Text className="font-sans text-sm text-text-secondary mb-2">
                  Confirmer le mot de passe
                </Text>
                <View className="flex-row items-center border border-border rounded-soft px-4 py-3 bg-white">
                  <Lock size={20} color="#696969" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-3 font-sans text-text-primary"
                    placeholderTextColor="#8b8b8b"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleRegister}
                onPressIn={() => hapticFeedback.buttonPress()}
                disabled={loading}
                className={`mt-6 py-4 rounded-soft ${loading ? 'bg-hermes-400' : 'bg-hermes-500'}`}
              >
                <Text className="text-white font-sans font-medium text-center">
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Text>
              </Pressable>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="font-sans text-text-muted">Déjà un compte ?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable onPressIn={() => hapticFeedback.navigation()}>
                  <Text className="font-sans text-hermes-500 ml-1">Se connecter</Text>
                </Pressable>
              </Link>
            </View>

            {/* Terms */}
            <Text className="font-sans text-xs text-text-muted text-center mt-6 px-4">
              En créant un compte, vous acceptez nos Conditions Générales d'Utilisation et notre
              Politique de Confidentialité.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
