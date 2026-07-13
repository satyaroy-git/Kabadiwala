import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '@kabadiwala/ui';

import { DashboardScreen } from '../screens/main/DashboardScreen';
import { RequestsScreen } from '../screens/main/RequestsScreen';
import { EarningsScreen } from '../screens/main/EarningsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Requests: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Requests: '📥',
    Earnings: '💰',
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
        tabBarActiveTintColor: colors.secondary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Requests" component={RequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Earnings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
