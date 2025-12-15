import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { hapticFeedback } from '@/constants/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { signIn } = useAuth();
  const { showWelcomeToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    hapticFeedback.formSubmit();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        hapticFeedback.success();

        // Get user name from the result
        const userName = result.user?.name || email.split('@')[0].replace(/[._]/g, ' ');

        // Navigate first
        if (returnTo) {
          // @ts-expect-error - dynamic route from returnTo param
          router.replace(returnTo);
        } else {
          router.replace('/(tabs)');
        }

        // Show welcome toast with a slight delay to allow navigation to complete
        setTimeout(() => {
          showWelcomeToast({
            userName: userName,
            tagline: 'Votre experience joailliere vous attend',
            autoDismissMs: 3500,
          });
        }, 500);
      } else {
        hapticFeedback.error();
        setError(result.error || 'Email ou mot de passe incorrect');
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
        <View className="flex-1 px-6 pt-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="font-serif text-3xl text-text-primary">Bon retour</Text>
            <Text className="font-sans text-text-muted mt-2">
              Connectez-vous pour accéder à votre compte
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
            {/* Email Input */}
            <View>
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
                  autoComplete="password"
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

            {/* Forgot Password */}
            <Pressable className="self-end mt-2" onPressIn={() => hapticFeedback.softPress()}>
              <Text className="font-sans text-sm text-hermes-500">Mot de passe oublié ?</Text>
            </Pressable>

            {/* Submit Button */}
            <Pressable
              onPress={handleLogin}
              onPressIn={() => hapticFeedback.buttonPress()}
              disabled={loading}
              className={`mt-6 py-4 rounded-soft ${loading ? 'bg-hermes-400' : 'bg-hermes-500'}`}
            >
              <Text className="text-white font-sans font-medium text-center">
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </Pressable>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="font-sans text-text-muted">Pas encore de compte ?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable onPressIn={() => hapticFeedback.navigation()}>
                <Text className="font-sans text-hermes-500 ml-1">Créer un compte</Text>
              </Pressable>
            </Link>
          </View>

          {/* Demo Credentials */}
          <View className="mt-8 p-4 bg-background-beige rounded-elegant">
            <Text className="font-sans text-sm text-text-muted text-center mb-1">
              Comptes de test :
            </Text>
            <Text className="font-sans text-xs text-text-muted text-center">
              user / password{'\n'}
              demo@luxuryjewels.com / demo123{'\n'}
              admin@luxuryjewels.com / admin123
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
