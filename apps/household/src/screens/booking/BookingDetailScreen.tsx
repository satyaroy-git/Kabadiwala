import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, formatDate, formatBookingStatus, Booking } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getBookingById, cancelBooking } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'BookingDetail'>;

export function BookingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      const data = await getBookingById(route.params.bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    Alert.alert('Cancel Pickup', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking(route.params.bookingId, 'Cancelled by user');
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Failed to cancel');
          }
        },
      },
    ]);
  }

  if (!booking) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Pickup Details</Text>
        <Badge
          text={formatBookingStatus(booking.status)}
          variant={booking.status === 'cancelled' ? 'error' : booking.status === 'completed' ? 'success' : 'info'}
        />
      </View>

      <Card>
        <Text style={styles.label}>📅 Scheduled</Text>
        <Text style={styles.value}>{formatDate(booking.scheduled_date)}</Text>
        <Text style={styles.subvalue}>{booking.time_slot.label}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>📦 Items</Text>
        {booking.scrap_items.map((item) => (
          <View key={item.category_id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.category_name}</Text>
            <Text style={styles.itemValue}>
              {item.actual_weight_kg || item.estimated_weight_kg} kg × {formatCurrency(item.locked_rate_per_kg)}/kg
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {booking.status === 'completed' && booking.actual_amount ? 'Amount Received' : 'Estimated Total'}
          </Text>
          <Text style={styles.totalValue}>
            {formatCurrency(booking.actual_amount || booking.total_estimated_amount)}
          </Text>
        </View>
        {booking.status === 'completed' && booking.actual_amount && booking.actual_amount !== booking.total_estimated_amount && (
          <Text style={{ ...typography.caption, color: colors.text.tertiary, marginTop: 4 }}>
            (Estimated was {formatCurrency(booking.total_estimated_amount)})
          </Text>
        )}
      </Card>

      {/* Actions */}
      {['en_route', 'arrived'].includes(booking.status) && (
        <Button
          title="Track Kabadiwala"
          onPress={() => navigation.navigate('Tracking', { bookingId: booking.id })}
          fullWidth
          size="large"
        />
      )}

      {booking.status === 'completed' && (
        <Button
          title="Rate Kabadiwala"
          onPress={() => navigation.navigate('Rating', {
            bookingId: booking.id,
            kabadiwalaName: (booking as any).kabadiwala?.name || 'Kabadiwala',
          })}
          fullWidth
        />
      )}

      {['pending', 'assigned', 'accepted'].includes(booking.status) && (
        <Button
          title="Cancel Pickup"
          onPress={handleCancel}
          variant="outline"
          fullWidth
        />
      )}

      {/* Always show a back button */}
      <Button
        title="← Go Back"
        onPress={() => navigation.goBack()}
        variant="ghost"
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backButton: { marginBottom: spacing.sm },
  backText: { ...typography.label, color: colors.primary[500] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.text.primary },
  label: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  value: { ...typography.h4, color: colors.text.primary },
  subvalue: { ...typography.body, color: colors.text.secondary, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.body, color: colors.text.primary },
  itemValue: { ...typography.bodySmall, color: colors.text.secondary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[200], marginTop: spacing.sm },
  totalLabel: { ...typography.label, color: colors.text.primary },
  totalValue: { ...typography.h4, color: colors.primary[700] },
});
