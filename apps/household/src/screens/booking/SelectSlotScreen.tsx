import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { BOOKING_TIME_SLOTS, useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getAddresses, addAddress } from '../../services/api';

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
  const { t } = useTranslation();

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    full_address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);

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
      if (data.length > 0) {
        setSelectedAddress(data[0].id);
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setShowAddressForm(true);
    }
  }

  async function handleSaveAddress() {
    if (!newAddress.full_address.trim()) {
      Alert.alert('Error', 'Please enter your full address');
      return;
    }
    if (!newAddress.pincode.trim() || newAddress.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setSavingAddress(true);
    try {
      const saved = await addAddress({
        label: newAddress.label || 'Home',
        full_address: newAddress.full_address.trim(),
        landmark: newAddress.landmark.trim() || null,
        pincode: newAddress.pincode.trim(),
        city: newAddress.city.trim() || 'City',
        state: newAddress.state.trim() || 'State',
        lat: 19.0760, // Default Mumbai coordinates
        lng: 72.8777,
      });
      setAddresses([saved, ...addresses]);
      setSelectedAddress(saved.id);
      setShowAddressForm(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
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
        <Text style={styles.title}>{t('select_date_time')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>{t('pick_date')}</Text>
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
        <Text style={styles.sectionTitle}>{t('pick_time_slot')}</Text>
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

        {/* Address Section */}
        <Text style={styles.sectionTitle}>{t('pickup_address')}</Text>

        {/* Existing addresses */}
        {addresses.map((addr) => (
          <Card
            key={addr.id}
            variant={selectedAddress === addr.id ? 'outlined' : 'elevated'}
            onPress={() => setSelectedAddress(addr.id)}
          >
            <View style={styles.addressRow}>
              <Text style={styles.addressLabel}>📍 {addr.label}</Text>
              <Text style={styles.addressText}>{addr.full_address}</Text>
              <Text style={styles.addressPincode}>{addr.pincode}</Text>
            </View>
          </Card>
        ))}

        {/* Add New Address Form */}
        {showAddressForm ? (
          <Card variant="outlined">
            <Text style={styles.formTitle}>Add Pickup Address</Text>

            <View style={styles.labelRow}>
              {['Home', 'Office', 'Other'].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.labelChip, newAddress.label === label && styles.labelChipActive]}
                  onPress={() => setNewAddress({ ...newAddress, label })}
                >
                  <Text style={[styles.labelChipText, newAddress.label === label && styles.labelChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder={t('full_address')}
              value={newAddress.full_address}
              onChangeText={(text) => setNewAddress({ ...newAddress, full_address: text })}
              multiline
              numberOfLines={2}
            />

            <TextInput
              style={styles.textInput}
              placeholder={t('landmark')}
              value={newAddress.landmark}
              onChangeText={(text) => setNewAddress({ ...newAddress, landmark: text })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder={t('pincode')}
                value={newAddress.pincode}
                onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text.replace(/\D/g, '') })}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder={t('city')}
                value={newAddress.city}
                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
              />
            </View>

            <Button
              title={savingAddress ? "Saving..." : t('save_address')}
              onPress={handleSaveAddress}
              loading={savingAddress}
              disabled={!newAddress.full_address.trim() || newAddress.pincode.length !== 6}
              fullWidth
              size="medium"
            />
          </Card>
        ) : (
          <TouchableOpacity onPress={() => setShowAddressForm(true)} style={styles.addAddressBtn}>
            <Text style={styles.addAddressText}>{t('add_new_address')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title={t('review_booking')}
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
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
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
  addressPincode: { ...typography.caption, color: colors.text.tertiary, marginTop: 2 },
  formTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  labelChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.neutral[100], borderWidth: 1, borderColor: colors.neutral[200] },
  labelChipActive: { backgroundColor: colors.primary[50], borderColor: colors.primary[500] },
  labelChipText: { ...typography.labelSmall, color: colors.text.secondary },
  labelChipTextActive: { color: colors.primary[700] },
  textInput: { borderWidth: 1, borderColor: colors.neutral[300], borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm, fontSize: 14, color: colors.text.primary, backgroundColor: colors.white },
  row: { flexDirection: 'row', gap: spacing.sm },
  halfInput: { flex: 1 },
  addAddressBtn: { padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.primary[300], borderStyle: 'dashed', alignItems: 'center' },
  addAddressText: { ...typography.label, color: colors.primary[500] },
  footer: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopWidth: 1, borderTopColor: colors.neutral[200] },
});
