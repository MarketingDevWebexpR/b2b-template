import { Tabs } from 'expo-router';
import { Home, Search, Grid3X3, ShoppingBag, User } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { useCart } from '@/context/CartContext';

function TabBarIcon({
  icon: Icon,
  color,
  focused
}: {
  icon: typeof Home;
  color: string;
  focused: boolean;
}) {
  return (
    <View className="items-center justify-center">
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

function CartTabBarIcon({ color, focused }: { color: string; focused: boolean }) {
  const { cart } = useCart();
  const itemCount = cart.totalItems;

  return (
    <View className="items-center justify-center">
      <ShoppingBag size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {itemCount > 0 && (
        <View className="absolute -top-1 -right-2 bg-hermes-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
          <Text className="text-white text-xs font-semibold">
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f67828',
        tabBarInactiveTintColor: '#696969',
        tabBarStyle: {
          backgroundColor: '#fffcf7',
          borderTopColor: '#e2d8ce',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Grid3X3} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <CartTabBarIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
