import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatDate, formatCurrency, Booking } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { updateBookingStatus } from '../../services/api';
import { supabase } from '../../services/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'PickupDetail'>;

export function PickupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => { loadBooking(); }, []);

  async function loadBooking() {
    const { data } = await supabase
      .from('bookings')
      .select('*, household:household_profiles(name, phone), address:addresses(*)')
      .eq('id', route.params.bookingId)
      .single();
    setBooking(data);
  }

  async function handleStartNavigation() {
    await updateBookingStatus(route.params.bookingId, 'en_route');
    navigation.navigate('Navigation', {
      bookingId: route.params.bookingId,
      address: booking?.address,
    });
  }

  async function handleMarkArrived() {
    await updateBookingStatus(route.params.bookingId, 'arrived');
    await loadBooking();
  }

  async function handleStartWeighing() {
    await updateBookingStatus(route.params.bookingId, 'weighing');
    navigation.navigate('WeightEntry', {
      bookingId: route.params.bookingId,
      items: booking?.scrap_items || [],
    });
  }

  if (!booking) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pickup #{booking.id.slice(0, 8)}</Text>
      <Badge text={booking.status.replace('_', ' ')} variant="info" />

      <Card>
        <Text style={styles.label}>👤 Household</Text>
        <Text style={styles.value}>{(booking as any).household?.name}</Text>
        <Text style={styles.subvalue}>📞 {(booking as any).household?.phone}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>📍 Address</Text>
        <Text style={styles.value}>{booking.address?.full_address}</Text>
        <Text style={styles.subvalue}>Pincode: {booking.address?.pincode}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>📦 Items</Text>
        {booking.scrap_items.map((item) => (
          <Text key={item.category_id} style={styles.itemText}>
            • {item.category_name} (~{item.estimated_weight_kg} kg) @ {formatCurrency(item.locked_rate_per_kg)}/kg
          </Text>
        ))}
        <Text style={styles.estimate}>
          Est. Total: {formatCurrency(booking.total_estimated_amount)}
        </Text>
      </Card>

      {/* Action buttons based on status */}
      {booking.status === 'accepted' && (
        <Button title="🚗 Start Navigation" onPress={handleStartNavigation} fullWidth size="large" />
      )}
      {booking.status === 'en_route' && (
        <Button title="✅ I've Arrived" onPress={handleMarkArrived} fullWidth size="large" />
      )}
      {booking.status === 'arrived' && (
        <Button title="⚖️ Start Weighing" onPress={handleStartWeighing} fullWidth size="large" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  label: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  value: { ...typography.h4, color: colors.text.primary },
  subvalue: { ...typography.body, color: colors.text.secondary, marginTop: 2 },
  itemText: { ...typography.body, color: colors.text.primary, marginBottom: 4 },
  estimate: { ...typography.h4, color: colors.primary[700], marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
});
