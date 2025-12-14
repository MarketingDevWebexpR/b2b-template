import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { CheckoutProvider } from '@/context/CheckoutContext';
import { WishlistProvider } from '@/context/WishlistContext';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Medium': require('../assets/fonts/PlayfairDisplay-Medium.ttf'),
    'PlayfairDisplay-SemiBold': require('../assets/fonts/PlayfairDisplay-SemiBold.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'CormorantGaramond-Regular': require('../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Medium': require('../assets/fonts/CormorantGaramond-Medium.ttf'),
    'CormorantGaramond-SemiBold': require('../assets/fonts/CormorantGaramond-SemiBold.ttf'),
    'CormorantGaramond-Bold': require('../assets/fonts/CormorantGaramond-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CategoryProvider>
            <CartProvider>
              <WishlistProvider>
                <CheckoutProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: '#fffcf7' },
                    }}
                  >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="product/[id]"
                      options={{
                        headerShown: true,
                        headerTitle: '',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="collection/[slug]"
                      options={{
                        headerShown: true,
                        headerTitle: '',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="checkout"
                      options={{
                        headerShown: false,
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                      }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="about"
                      options={{
                        headerShown: true,
                        headerTitle: 'Notre Histoire',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="orders"
                      options={{
                        headerShown: true,
                        headerTitle: 'Mes commandes',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="favorites"
                      options={{
                        headerShown: true,
                        headerTitle: 'Mes favoris',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="profile"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="settings"
                      options={{
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="addresses"
                      options={{
                        headerShown: true,
                        headerTitle: 'Mes adresses',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="payment-methods"
                      options={{
                        headerShown: true,
                        headerTitle: 'Moyens de paiement',
                        headerBackTitle: 'Retour',
                        headerStyle: { backgroundColor: '#fffcf7' },
                        headerTintColor: '#2b333f',
                      }}
                    />
                    <Stack.Screen
                      name="help"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                  <StatusBar style="dark" />
                </CheckoutProvider>
              </WishlistProvider>
            </CartProvider>
          </CategoryProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
