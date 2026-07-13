import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '@kabadiwala/ui';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';

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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, isAuthenticated, profile, isVerified } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Starting Kabadiwala Partner..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
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
        </>
      )}
    </Stack.Navigator>
  );
}
