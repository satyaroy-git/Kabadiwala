import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  const [booking, setBooking] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);

  useEffect(() => { loadBooking(); }, []);

  async function loadBooking() {
    try {
      // Fetch booking without FK joins
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', route.params.bookingId)
        .single();

      if (error || !bookingData) {
        console.error('Error loading booking:', error);
        return;
      }
      setBooking(bookingData);

      // Fetch address separately
      if (bookingData.address_id) {
        const { data: addrData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', bookingData.address_id)
          .single();
        setAddress(addrData);
      }
    } catch (err) {
      console.error('PickupDetail error:', err);
    }
  }

  async function handleStartNavigation() {
    await updateBookingStatus(route.params.bookingId, 'en_route');
    navigation.navigate('Navigation', {
      bookingId: route.params.bookingId,
      address: address,
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

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 100, color: colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Pickup Details</Text>
        <Badge text={booking.status.replace('_', ' ')} variant="info" />
      </View>

      <Card>
        <Text style={styles.label}>📅 Scheduled</Text>
        <Text style={styles.value}>{formatDate(booking.scheduled_date)}</Text>
        <Text style={styles.subvalue}>{booking.time_slot?.label || ''}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>📍 Pickup Address</Text>
        <Text style={styles.value}>{address?.full_address || 'Loading...'}</Text>
        {address?.landmark && <Text style={styles.subvalue}>Landmark: {address.landmark}</Text>}
        <Text style={styles.subvalue}>Pincode: {address?.pincode || ''} • {address?.city || ''}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>📦 Items</Text>
        {booking.scrap_items?.map((item: any) => (
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

      <Button title="← Go Back" onPress={() => navigation.goBack()} variant="ghost" fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.secondary[500], marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.text.primary },
  label: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  value: { ...typography.h4, color: colors.text.primary },
  subvalue: { ...typography.body, color: colors.text.secondary, marginTop: 2 },
  itemText: { ...typography.body, color: colors.text.primary, marginBottom: 4 },
  estimate: { ...typography.h4, color: colors.primary[700], marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
});
