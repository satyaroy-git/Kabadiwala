import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, formatDate, useTranslation, getLanguage, SCRAP_CATEGORIES } from '@kabadiwala/shared';
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

  function getTranslatedCategoryName(englishName: string): string {
    const lang = getLanguage();
    if (lang === 'en') return englishName;
    const category = SCRAP_CATEGORIES.find((c) => c.name === englishName);
    if (!category) return englishName;
    switch (lang) {
      case 'hi': return category.name_hindi || englishName;
      case 'or': return category.name_odia || englishName;
      case 'mr': return category.name_marathi || englishName;
      case 'ta': return category.name_tamil || englishName;
      case 'te': return category.name_telugu || englishName;
      case 'kn': return category.name_kannada || englishName;
      default: return englishName;
    }
  }

  function getTranslatedTimeSlot(start: string): string {
    switch (start) {
      case '09:00': return t('morning_slot');
      case '12:00': return t('afternoon_slot');
      case '15:00': return t('evening_slot');
      case '18:00': return t('late_evening_slot');
      default: return start;
    }
  }

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
        t('booking_confirmed'),
        t('booking_confirmed_msg'),
        [{ text: t('ok'), onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('failed'));
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
          <Text style={styles.cardSubvalue}>{getTranslatedTimeSlot(bookingData.timeSlot?.start)}</Text>
        </Card>

        {/* Items */}
        <Card>
          <Text style={styles.cardTitle}>📦 {t('scrap_items')}</Text>
          {bookingData.selectedItems.map((item: any) => (
            <View key={item.category_id} style={styles.itemRow}>
              <Text style={styles.itemName}>{getTranslatedCategoryName(item.category_name)}</Text>
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
