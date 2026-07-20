import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { VehicleType, VEHICLE_TYPE_LABELS, useTranslation, isValidPincode } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const VEHICLE_OPTIONS: { type: VehicleType; emoji: string }[] = [
  { type: 'bicycle', emoji: '🚲' },
  { type: 'cart', emoji: '🛒' },
  { type: 'auto_rickshaw', emoji: '🛺' },
  { type: 'mini_truck', emoji: '🚛' },
  { type: 'truck', emoji: '🚚' },
];

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, refreshProfile } = useAuth();
  const { t } = useTranslation();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(profile?.vehicle_type || 'cart');
  const [pincodes, setPincodes] = useState<string[]>(profile?.service_pincodes || []);
  const [newPincode, setNewPincode] = useState('');
  const [saving, setSaving] = useState(false);

  function addPincode() {
    if (!isValidPincode(newPincode)) {
      Alert.alert(t('error'), 'Enter a valid 6-digit pincode');
      return;
    }
    if (pincodes.includes(newPincode)) {
      Alert.alert(t('error'), 'Already added');
      return;
    }
    setPincodes([...pincodes, newPincode]);
    setNewPincode('');
  }

  function removePincode(p: string) {
    setPincodes(pincodes.filter((x) => x !== p));
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t('error'), 'Name is required');
      return;
    }
    if (pincodes.length === 0) {
      Alert.alert(t('error'), 'Add at least one service pincode');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('kabadiwala_profiles')
        .update({
          name: name.trim(),
          phone: phone.trim(),
          vehicle_type: vehicleType,
          service_pincodes: pincodes,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('✅', t('save') + ' successful!', [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('failed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>{t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Profile</Text>

      {/* Name */}
      <Card>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />
      </Card>

      {/* Phone */}
      <Card>
        <Text style={styles.label}>{t('phone')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
      </Card>

      {/* Vehicle Type */}
      <Card>
        <Text style={styles.label}>{t('vehicle')}</Text>
        <View style={styles.vehicleGrid}>
          {VEHICLE_OPTIONS.map(({ type, emoji }) => (
            <TouchableOpacity
              key={type}
              style={[styles.vehicleOption, vehicleType === type && styles.vehicleOptionActive]}
              onPress={() => setVehicleType(type)}
            >
              <Text style={styles.vehicleEmoji}>{emoji}</Text>
              <Text style={[styles.vehicleLabel, vehicleType === type && styles.vehicleLabelActive]}>
                {VEHICLE_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Service Pincodes */}
      <Card>
        <Text style={styles.label}>{t('service_pincodes')}</Text>
        
        <View style={styles.pincodeInputRow}>
          <TextInput
            style={styles.pincodeInput}
            value={newPincode}
            onChangeText={(text) => setNewPincode(text.replace(/\D/g, ''))}
            placeholder={t('pincode')}
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addPincode}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pincodeList}>
          {pincodes.map((p) => (
            <View key={p} style={styles.pincodeChip}>
              <Text style={styles.pincodeText}>{p}</Text>
              <TouchableOpacity onPress={() => removePincode(p)}>
                <Text style={styles.removeBtn}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        {pincodes.length === 0 && (
          <Text style={styles.noPincodes}>No pincodes added. Add at least one.</Text>
        )}
      </Card>

      {/* Save Button */}
      <Button
        title={saving ? `${t('save')}...` : `✅ ${t('save')}`}
        onPress={handleSave}
        loading={saving}
        fullWidth
        size="large"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md, paddingBottom: 50 },
  backBtn: { ...typography.label, color: colors.secondary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.neutral[300], borderRadius: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15, color: colors.text.primary, backgroundColor: colors.white },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vehicleOption: { width: '30%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.neutral[100], justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.neutral[200] },
  vehicleOptionActive: { borderColor: colors.secondary[500], backgroundColor: colors.secondary[50] },
  vehicleEmoji: { fontSize: 24, marginBottom: 4 },
  vehicleLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  vehicleLabelActive: { color: colors.secondary[700], fontWeight: '600' },
  pincodeInputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  pincodeInput: { flex: 1, borderWidth: 1, borderColor: colors.neutral[300], borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, backgroundColor: colors.white },
  addBtn: { backgroundColor: colors.secondary[500], paddingHorizontal: spacing.lg, borderRadius: 10, justifyContent: 'center' },
  addBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  pincodeList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pincodeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary[50], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, gap: spacing.sm },
  pincodeText: { ...typography.label, color: colors.secondary[700] },
  removeBtn: { fontSize: 18, color: colors.secondary[700], fontWeight: '700' },
  noPincodes: { ...typography.bodySmall, color: colors.text.tertiary, fontStyle: 'italic' },
});
