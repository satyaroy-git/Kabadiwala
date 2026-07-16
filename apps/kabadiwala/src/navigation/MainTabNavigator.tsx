import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';

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
    Earnings: '📋',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {icons[name] || '📱'}
    </Text>
  );
}

function TranslatedTabLabel({ translationKey, focused }: { translationKey: string; focused: boolean }) {
  const { t } = useTranslation();
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '500',
      color: focused ? colors.secondary[500] : colors.neutral[500],
    }}>
      {t(translationKey as any)}
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
          paddingBottom: 20,
          paddingTop: 8,
          height: 70,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: ({ focused }) => <TranslatedTabLabel translationKey="home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{ tabBarLabel: ({ focused }) => <TranslatedTabLabel translationKey="active_pickups" focused={focused} /> }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ tabBarLabel: ({ focused }) => <TranslatedTabLabel translationKey="transaction_history" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: ({ focused }) => <TranslatedTabLabel translationKey="profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
