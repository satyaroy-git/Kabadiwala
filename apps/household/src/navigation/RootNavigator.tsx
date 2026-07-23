import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '@kabadiwala/ui';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';

// Main screens
import { MainTabNavigator } from './MainTabNavigator';

// Booking flow
import { BookingScreen } from '../screens/booking/BookingScreen';
import { SelectScrapScreen } from '../screens/booking/SelectScrapScreen';
import { SelectSlotScreen } from '../screens/booking/SelectSlotScreen';
import { BookingConfirmScreen } from '../screens/booking/BookingConfirmScreen';

// Tracking
import { TrackingScreen } from '../screens/tracking/TrackingScreen';

// Booking detail
import { BookingDetailScreen } from '../screens/booking/BookingDetailScreen';

// Rating
import { RatingScreen } from '../screens/rating/RatingScreen';

// Phase 2 screens
import { ImpactScreen } from '../screens/main/ImpactScreen';
import { ReferralScreen } from '../screens/main/ReferralScreen';
import { RecurringScreen } from '../screens/main/RecurringScreen';
import { GamificationScreen } from '../screens/main/GamificationScreen';
import { LanguageScreen } from '../screens/main/LanguageScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { SavedAddressesScreen } from '../screens/main/SavedAddressesScreen';
import { TransactionHistoryScreen } from '../screens/main/TransactionHistoryScreen';
import { HelpSupportScreen } from '../screens/main/HelpSupportScreen';
import { WeightConfirmationScreen } from '../screens/booking/WeightConfirmationScreen';

export type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string };
  ProfileSetup: undefined;
  MainTabs: undefined;
  Booking: undefined;
  SelectScrap: undefined;
  SelectSlot: { selectedItems: any[] };
  BookingConfirm: { bookingData: any };
  Tracking: { bookingId: string };
  BookingDetail: { bookingId: string };
  Rating: { bookingId: string; kabadiwalaName: string };
  Impact: undefined;
  Referral: undefined;
  Recurring: undefined;
  Gamification: undefined;
  LanguageSelect: undefined;
  Chat: { bookingId: string };
  WeightConfirmation: { bookingId: string };
  SavedAddresses: undefined;
  TransactionHistory: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, isAuthenticated, profile } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Starting Kabadiwala..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right',
    }}>
      {!isAuthenticated ? (
        // Auth flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : !profile ? (
        // Profile setup
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        // Main app
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="SelectScrap" component={SelectScrapScreen} />
          <Stack.Screen name="SelectSlot" component={SelectSlotScreen} />
          <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
          <Stack.Screen
            name="Tracking"
            component={TrackingScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
          <Stack.Screen name="Rating" component={RatingScreen} />
          <Stack.Screen name="Impact" component={ImpactScreen} />
          <Stack.Screen name="Referral" component={ReferralScreen} />
          <Stack.Screen name="Recurring" component={RecurringScreen} />
          <Stack.Screen name="Gamification" component={GamificationScreen} />
          <Stack.Screen name="LanguageSelect" component={LanguageScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="WeightConfirmation" component={WeightConfirmationScreen} />
          <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
