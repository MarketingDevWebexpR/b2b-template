import { Stack } from 'expo-router';
import { LuxuryBackButton } from '@/components/navigation';

export default function CollectionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fffcf7',
        },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => <LuxuryBackButton />,
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
      <Stack.Screen
        name="[slug]"
        options={{
          headerTitle: 'Collection',
        }}
      />
    </Stack>
  );
}
