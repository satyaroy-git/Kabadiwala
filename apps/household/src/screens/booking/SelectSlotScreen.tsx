import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { BOOKING_TIME_SLOTS, formatDate } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getAddresses } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'SelectSlot'>;

export function SelectSlotScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { selectedItems } = route.params;

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const data = await getAddresses();
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0].id);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  }

  function handleContinue() {
    navigation.navigate('BookingConfirm', {
      bookingData: {
        selectedItems,
        date: selectedDate,
        timeSlot: BOOKING_TIME_SLOTS.find((s) => s.start === selectedSlot),
        addressId: selectedAddress,
      },
    });
  }

  const canProceed = selectedDate && selectedSlot && selectedAddress;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Date & Time</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Pick a Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dates.map((date) => {
            const d = new Date(date);
            const isSelected = selectedDate === date;
            return (
              <TouchableOpacity
                key={date}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                  {d.toLocaleDateString('en', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                  {d.getDate()}
                </Text>
                <Text style={[styles.dateMonth, isSelected && styles.dateMonthSelected]}>
                  {d.toLocaleDateString('en', { month: 'short' })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slot Selection */}
        <Text style={styles.sectionTitle}>Pick a Time Slot</Text>
        <View style={styles.slotsGrid}>
          {BOOKING_TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot.start;
            return (
              <TouchableOpacity
                key={slot.start}
                style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                onPress={() => setSelectedSlot(slot.start)}
              >
                <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Address Selection */}
        <Text style={styles.sectionTitle}>Pickup Address</Text>
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            variant={selectedAddress === addr.id ? 'outlined' : 'elevated'}
            onPress={() => setSelectedAddress(addr.id)}
          >
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>{addr.label}</Text>
              <Text style={styles.addressText}>{addr.full_address}</Text>
            </View>
          </Card>
        ))}
        {addresses.length === 0 && (
          <Card variant="filled">
            <Text style={styles.noAddress}>
              No saved addresses. You'll be asked to add one.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Review Booking"
          onPress={handleContinue}
          disabled={!canProceed}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.md, backgroundColor: colors.background.primary },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginTop: spacing.md },
  dateCard: { width: 64, height: 80, borderRadius: 12, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm, borderWidth: 1, borderColor: colors.neutral[200] },
  dateCardSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  dateDay: { ...typography.bodySmall, color: colors.text.secondary },
  dateDaySelected: { color: colors.white },
  dateNum: { ...typography.h3, color: colors.text.primary },
  dateNumSelected: { color: colors.white },
  dateMonth: { ...typography.caption, color: colors.text.secondary },
  dateMonthSelected: { color: colors.white },
  slotsGrid: { gap: spacing.sm },
  slotCard: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.neutral[200] },
  slotCardSelected: { backgroundColor: colors.primary[50], borderColor: colors.primary[500] },
  slotText: { ...typography.label, color: colors.text.secondary, textAlign: 'center' },
  slotTextSelected: { color: colors.primary[700] },
  addressRow: { gap: 4 },
  addressLabel: { ...typography.label, color: colors.text.primary },
  addressText: { ...typography.bodySmall, color: colors.text.secondary },
  noAddress: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  footer: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
});
