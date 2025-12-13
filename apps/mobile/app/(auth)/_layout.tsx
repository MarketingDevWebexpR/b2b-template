import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fffcf7' },
        headerTintColor: '#2b333f',
        headerBackTitle: 'Retour',
        contentStyle: { backgroundColor: '#fffcf7' },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Créer un compte' }} />
    </Stack>
  );
}
