import { Stack } from 'expo-router';
import { LuxuryBackButton } from '@/components/navigation';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fffcf7' },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => <LuxuryBackButton />,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Medium',
          fontSize: 18,
          color: '#2b333f',
        },
        contentStyle: { backgroundColor: '#fffcf7' },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Créer un compte' }} />
    </Stack>
  );
}
