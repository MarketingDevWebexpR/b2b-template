import { Stack } from 'expo-router';

export default function CollectionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fffcf7',
        },
        headerTintColor: '#2b333f',
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-Medium',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
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
