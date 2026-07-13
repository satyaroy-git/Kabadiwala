import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { VehicleType, VEHICLE_TYPE_LABELS } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Vehicle'>;

const VEHICLE_OPTIONS: { type: VehicleType; emoji: string }[] = [
  { type: 'bicycle', emoji: '🚲' },
  { type: 'cart', emoji: '🛒' },
  { type: 'auto_rickshaw', emoji: '🛺' },
  { type: 'mini_truck', emoji: '🚛' },
  { type: 'truck', emoji: '🚚' },
];

export function VehicleScreen({ navigation }: Props) {
  const [selectedType, setSelectedType] = useState<VehicleType | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Vehicle</Text>
      <Text style={styles.subtitle}>Select your vehicle type and take a photo</Text>

      {/* Vehicle Type Selection */}
      <View style={styles.grid}>
        {VEHICLE_OPTIONS.map(({ type, emoji }) => (
          <TouchableOpacity
            key={type}
            style={[styles.vehicleCard, selectedType === type && styles.vehicleCardSelected]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={styles.vehicleEmoji}>{emoji}</Text>
            <Text style={[styles.vehicleLabel, selectedType === type && styles.vehicleLabelSelected]}>
              {VEHICLE_TYPE_LABELS[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Vehicle Photo */}
      <TouchableOpacity style={styles.photoBox} onPress={() => setPhotoTaken(true)}>
        {photoTaken ? (
          <Text style={styles.photoDone}>✅ Vehicle photo taken</Text>
        ) : (
          <Text style={styles.photoPlaceholder}>📷 Tap to take vehicle photo</Text>
        )}
      </TouchableOpacity>

      <Button
        title="Continue"
        onPress={() => navigation.navigate('Pincode')}
        disabled={!selectedType || !photoTaken}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['3xl'] },
  vehicleCard: { width: '30%', aspectRatio: 1, borderRadius: 12, backgroundColor: colors.neutral[100], justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.neutral[200] },
  vehicleCardSelected: { borderColor: colors.secondary[500], backgroundColor: colors.secondary[50] },
  vehicleEmoji: { fontSize: 28, marginBottom: 4 },
  vehicleLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  vehicleLabelSelected: { color: colors.secondary[700], fontWeight: '600' },
  photoBox: { padding: spacing['3xl'], borderRadius: 12, backgroundColor: colors.neutral[100], alignItems: 'center', marginBottom: spacing['3xl'], borderWidth: 2, borderColor: colors.neutral[300], borderStyle: 'dashed' },
  photoPlaceholder: { ...typography.label, color: colors.text.secondary },
  photoDone: { ...typography.label, color: colors.primary[700] },
});
