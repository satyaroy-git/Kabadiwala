import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '@kabadiwala/ui';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';

// Onboarding screens
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AadhaarScreen } from '../screens/onboarding/AadhaarScreen';
import { SelfieScreen } from '../screens/onboarding/SelfieScreen';
import { VehicleScreen } from '../screens/onboarding/VehicleScreen';
import { PincodeScreen } from '../screens/onboarding/PincodeScreen';
import { PendingVerificationScreen } from '../screens/onboarding/PendingVerificationScreen';

// Main screens
import { MainTabNavigator } from './MainTabNavigator';

// Pickup flow
import { PickupDetailScreen } from '../screens/pickup/PickupDetailScreen';
import { NavigationScreen } from '../screens/pickup/NavigationScreen';
import { WeightEntryScreen } from '../screens/pickup/WeightEntryScreen';
import { BillScreen } from '../screens/pickup/BillScreen';
import { PaymentScreen } from '../screens/pickup/PaymentScreen';

// Phase 2 screens
import { BadgesScreen } from '../screens/main/BadgesScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { LanguageScreen } from '../screens/main/LanguageScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';

export type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string };
  Onboarding: undefined;
  Aadhaar: undefined;
  Selfie: undefined;
  Vehicle: undefined;
  Pincode: undefined;
  PendingVerification: undefined;
  MainTabs: undefined;
  PickupDetail: { bookingId: string };
  Navigation: { bookingId: string; address: any };
  WeightEntry: { bookingId: string; items: any[] };
  Bill: { bookingId: string; transaction: any };
  Payment: { bookingId: string; amount: number; receipt: string };
  Badges: undefined;
  Analytics: undefined;
  LanguageSelect: undefined;
  Chat: { bookingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, isAuthenticated, profile, isVerified } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Starting Kabadiwala Partner..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right',
    }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : !profile ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Aadhaar" component={AadhaarScreen} />
          <Stack.Screen name="Selfie" component={SelfieScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="Pincode" component={PincodeScreen} />
        </>
      ) : !isVerified ? (
        <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="PickupDetail" component={PickupDetailScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
          <Stack.Screen name="WeightEntry" component={WeightEntryScreen} />
          <Stack.Screen name="Bill" component={BillScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Badges" component={BadgesScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="LanguageSelect" component={LanguageScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
