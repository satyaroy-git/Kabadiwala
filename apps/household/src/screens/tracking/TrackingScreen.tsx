import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatETA, formatDistance, useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getBookingById, subscribeToKabadiwalaLocation, subscribeToBookingStatus } from '../../services/api';

type RouteType = RouteProp<RootStackParamList, 'Tracking'>;

export function TrackingScreen() {
  const route = useRoute<RouteType>();
  const { bookingId } = route.params;
  const { t } = useTranslation();
  const [kabadiwalaLocation, setKabadiwalaLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('en_route');
  const [kabadiwalaInfo, setKabadiwalaInfo] = useState<any>(null);

  useEffect(() => {
    loadBookingDetails();

    // Subscribe to real-time location updates
    const unsubLocation = subscribeToKabadiwalaLocation(bookingId, (location) => {
      setKabadiwalaLocation(location);
    });

    // Subscribe to booking status changes
    const unsubStatus = subscribeToBookingStatus(bookingId, (status) => {
      setBookingStatus(status);
    });

    return () => {
      unsubLocation();
      unsubStatus();
    };
  }, [bookingId]);

  async function loadBookingDetails() {
    try {
      const booking = await getBookingById(bookingId);
      setBookingStatus(booking.status);
      setKabadiwalaInfo((booking as any).kabadiwala);
    } catch (err) {
      console.error('Error loading booking:', err);
    }
  }

  function getStatusMessage() {
    switch (bookingStatus) {
      case 'accepted': return '🕐 Kabadiwala will start soon';
      case 'en_route': return t('kabadiwala_on_way');
      case 'arrived': return t('kabadiwala_arrived');
      case 'weighing': return t('weighing_progress');
      default: return `📍 ${t('tracking')}...`;
    }
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>🗺️</Text>
          <Text style={styles.mapLabel}>Live Map</Text>
          {kabadiwalaLocation && (
            <Text style={styles.mapCoords}>
              📍 {kabadiwalaLocation.lat.toFixed(4)}, {kabadiwalaLocation.lng.toFixed(4)}
            </Text>
          )}
          <Text style={styles.mapNote}>
            (Mapbox integration - shows live kabadiwala location)
          </Text>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.bottomSheet}>
        <View style={styles.statusBar}>
          <Badge
            text={getStatusMessage()}
            variant={bookingStatus === 'arrived' ? 'success' : 'info'}
            size="medium"
          />
        </View>

        {/* Kabadiwala Info */}
        {kabadiwalaInfo && (
          <Card>
            <View style={styles.kabadiwalaRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {kabadiwalaInfo.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.kabadiwalaDetails}>
                <Text style={styles.kabadiwalaName}>{kabadiwalaInfo.name}</Text>
                <Text style={styles.kabadiwalaRating}>
                  ★ {kabadiwalaInfo.rating?.toFixed(1) || 'New'} • {kabadiwalaInfo.vehicle_type}
                </Text>
              </View>
              <View style={styles.callBtn}>
                <Text style={styles.callIcon}>📞</Text>
              </View>
            </View>
          </Card>
        )}

        {bookingStatus === 'arrived' && (
          <Card variant="filled">
            <Text style={styles.arrivedText}>
              Your kabadiwala has arrived! Please meet them at your door with the scrap items.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  mapContainer: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5E9' },
  mapText: { fontSize: 64, marginBottom: spacing.md },
  mapLabel: { ...typography.h3, color: colors.primary[700] },
  mapCoords: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm },
  mapNote: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: spacing.xs },
  bottomSheet: { backgroundColor: colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg, gap: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  statusBar: { alignItems: 'center' },
  kabadiwalaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary[100], justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.primary[700] },
  kabadiwalaDetails: { flex: 1 },
  kabadiwalaName: { ...typography.label, color: colors.text.primary },
  kabadiwalaRating: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary[50], justifyContent: 'center', alignItems: 'center' },
  callIcon: { fontSize: 20 },
  arrivedText: { ...typography.body, color: colors.primary[800], textAlign: 'center' },
});
