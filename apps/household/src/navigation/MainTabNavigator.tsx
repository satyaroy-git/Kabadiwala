import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '@kabadiwala/ui';

import { HomeScreen } from '../screens/main/HomeScreen';
import { RateCardScreen } from '../screens/main/RateCardScreen';
import { BookingsScreen } from '../screens/main/BookingsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Rates: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Rates: '📊',
    Bookings: '📋',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {icons[name] || '📱'}
    </Text>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          paddingBottom: 20,
          paddingTop: 8,
          height: 70,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Rates" component={RateCardScreen} options={{ title: 'Rates' }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: 'My Pickups' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
