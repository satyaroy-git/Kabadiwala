import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { isValidPincode } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { createKabadiwalaProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Pincode'>;

export function PincodeScreen({ navigation }: Props) {
  const { refreshProfile } = useAuth();
  const [pincode, setPincode] = useState('');
  const [pincodes, setPincodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addPincode() {
    if (!isValidPincode(pincode)) {
      setError('Enter a valid 6-digit pincode');
      return;
    }
    if (pincodes.includes(pincode)) {
      setError('Already added');
      return;
    }
    setPincodes([...pincodes, pincode]);
    setPincode('');
    setError('');
  }

  function removePincode(p: string) {
    setPincodes(pincodes.filter((x) => x !== p));
  }

  async function handleComplete() {
    if (pincodes.length === 0) {
      setError('Add at least one service pincode');
      return;
    }
    setLoading(true);
    try {
      // In full implementation, collect all onboarding data
      await createKabadiwalaProfile({
        name: '', // collected from Aadhaar step
        phone: '',
        aadhaar_consent: true,
        selfie_uri: '',
        vehicle_photo_uri: '',
        vehicle_type: 'cart',
        service_pincodes: pincodes,
        availability: {
          monday: [{ start: '09:00', end: '18:00' }],
          tuesday: [{ start: '09:00', end: '18:00' }],
          wednesday: [{ start: '09:00', end: '18:00' }],
          thursday: [{ start: '09:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '18:00' }],
          saturday: [{ start: '09:00', end: '18:00' }],
          sunday: [],
        },
      });
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Area</Text>
      <Text style={styles.subtitle}>
        Add pincodes where you want to receive pickup requests.
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.inputWrap}>
          <Input
            placeholder="Enter pincode"
            keyboardType="number-pad"
            maxLength={6}
            value={pincode}
            onChangeText={(t) => { setPincode(t.replace(/\D/g, '')); setError(''); }}
            error={error}
          />
        </View>
        <Button title="Add" onPress={addPincode} size="medium" />
      </View>

      {/* Added Pincodes */}
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
        <Card variant="filled">
          <Text style={styles.hint}>
            💡 Start with your local area. You can add more pincodes later.
          </Text>
        </Card>
      )}

      <Button
        title="Complete Registration"
        onPress={handleComplete}
        loading={loading}
        disabled={pincodes.length === 0}
        fullWidth
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['3xl'] },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  inputWrap: { flex: 1 },
  pincodeList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.lg },
  pincodeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary[50], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, gap: spacing.sm },
  pincodeText: { ...typography.label, color: colors.secondary[700] },
  removeBtn: { fontSize: 18, color: colors.secondary[700], fontWeight: '700' },
  hint: { ...typography.bodySmall, color: colors.secondary[800] },
});
