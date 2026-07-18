import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography, MapPlaceholder } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { broadcastLocation, updateBookingStatus } from '../../services/api';
// import * as Location from 'expo-location';

type RouteType = RouteProp<RootStackParamList, 'Navigation'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NavigationScreen() {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { bookingId, address } = route.params;
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentLat, setCurrentLat] = useState(19.0760);
  const [currentLng, setCurrentLng] = useState(72.8777);

  useEffect(() => {
    startLocationBroadcast();
    return () => {
      if (locationInterval.current) clearInterval(locationInterval.current);
    };
  }, []);

  async function startLocationBroadcast() {
    // In production: use expo-location for real GPS
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // Start broadcasting every 5 seconds
    locationInterval.current = setInterval(() => {
      // Simulate location broadcast
      const lat = 19.0760 + Math.random() * 0.01;
      const lng = 72.8777 + Math.random() * 0.01;
      setCurrentLat(lat);
      setCurrentLng(lng);
      broadcastLocation(bookingId, lat, lng);
    }, 5000);
  }

  async function handleArrived() {
    if (locationInterval.current) clearInterval(locationInterval.current);
    await updateBookingStatus(bookingId, 'arrived');
    navigation.navigate('PickupDetail', { bookingId });
  }

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <MapPlaceholder
          latitude={currentLat}
          longitude={currentLng}
          label={t('navigation_active')}
          destLatitude={address?.lat || 19.0800}
          destLongitude={address?.lng || 72.8800}
          destLabel={address?.full_address?.slice(0, 20) || 'Destination'}
        />
      </View>

      {/* Destination */}
      <View style={styles.bottomSheet}>
        <Card>
          <Text style={styles.destLabel}>{t('navigating_to')}</Text>
          <Text style={styles.destAddress}>{address?.full_address || 'Address'}</Text>
          <Text style={styles.destPincode}>📍 {address?.pincode}</Text>
        </Card>

        <Button
          title={`✅ ${t('ive_arrived')}`}
          onPress={handleArrived}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  mapArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' },
  mapEmoji: { fontSize: 64, marginBottom: spacing.md },
  mapText: { ...typography.h3, color: colors.info },
  mapSubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm },
  bottomSheet: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: spacing.md },
  destLabel: { ...typography.label, color: colors.text.secondary },
  destAddress: { ...typography.h4, color: colors.text.primary, marginTop: 4 },
  destPincode: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
});
