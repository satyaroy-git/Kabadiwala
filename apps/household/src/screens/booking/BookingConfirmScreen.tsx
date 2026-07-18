import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, formatDate, useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { createBooking } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'BookingConfirm'>;

export function BookingConfirmScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { bookingData } = route.params;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleConfirm() {
    setLoading(true);
    try {
      await createBooking({
        scrap_items: bookingData.selectedItems.map((item: any) => ({
          category_id: item.category_id,
          estimated_weight_kg: item.estimated_weight_kg,
        })),
        address_id: bookingData.addressId,
        scheduled_date: bookingData.date,
        time_slot_id: bookingData.timeSlot.start,
        notes: '',
      });
      Alert.alert(
        'Booking Confirmed! ✅',
        'A verified kabadiwala will be assigned shortly. You will receive a notification.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('confirm_booking')}</Text>
        <Text style={styles.subtitle}>{t('review_details')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Date & Time */}
        <Card>
          <Text style={styles.cardTitle}>📅 {t('schedule')}</Text>
          <Text style={styles.cardValue}>{formatDate(bookingData.date)}</Text>
          <Text style={styles.cardSubvalue}>{bookingData.timeSlot?.label}</Text>
        </Card>

        {/* Items */}
        <Card>
          <Text style={styles.cardTitle}>📦 {t('scrap_items')}</Text>
          {bookingData.selectedItems.map((item: any) => (
            <View key={item.category_id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.category_name}</Text>
              <Text style={styles.itemWeight}>~{item.estimated_weight_kg} kg</Text>
            </View>
          ))}
        </Card>

        {/* Info */}
        <Card variant="filled">
          <Text style={styles.infoText}>
            💡 {t('rates_locked_booking')}
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('confirm_pickup')}
          onPress={handleConfirm}
          loading={loading}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.lg, backgroundColor: colors.background.primary },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  cardTitle: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  cardValue: { ...typography.h4, color: colors.text.primary },
  cardSubvalue: { ...typography.body, color: colors.text.secondary, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.body, color: colors.text.primary },
  itemWeight: { ...typography.label, color: colors.primary[700] },
  infoText: { ...typography.bodySmall, color: colors.primary[800] },
  footer: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
});
