import { Stack } from 'expo-router';
import { LuxuryBackButton } from '@/components/navigation';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Mon Compte',
        headerBackVisible: false,
        headerLeft: () => <LuxuryBackButton />,
        headerStyle: { backgroundColor: '#fffcf7' },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Medium',
          fontSize: 18,
          color: '#2b333f',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="orders" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
