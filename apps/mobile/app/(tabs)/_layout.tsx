import { Tabs } from 'expo-router';
import { Home, Search, Grid3X3, User } from 'lucide-react-native';
import { View } from 'react-native';
import { AnimatedCartIcon } from '@/components/navigation';
import { hapticFeedback } from '@/constants/haptics';

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
      screenListeners={{
        tabPress: () => {
          hapticFeedback.tabSwitch();
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
            <AnimatedCartIcon color={color} focused={focused} />
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
