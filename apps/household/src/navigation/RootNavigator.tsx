import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from '@kabadiwala/ui';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
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

export type RootStackParamList = {
  Login: undefined;
  ProfileSetup: undefined;
  MainTabs: undefined;
  Booking: undefined;
  SelectScrap: undefined;
  SelectSlot: { selectedItems: any[] };
  BookingConfirm: { bookingData: any };
  Tracking: { bookingId: string };
  BookingDetail: { bookingId: string };
  Rating: { bookingId: string; kabadiwalaName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, isAuthenticated, profile } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Starting Kabadiwala..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
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
        </>
      )}
    </Stack.Navigator>
  );
}
