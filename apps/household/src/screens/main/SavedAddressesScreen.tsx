import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';
import { getAddresses } from '../../services/api';
import { supabase } from '../../services/supabase';

export function SavedAddressesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAddresses(); }, []);

  async function loadAddresses() {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert(t('are_you_sure'), 'Delete this address?', [
      { text: t('cancel') },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          await supabase.from('addresses').delete().eq('id', id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>{t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📍 {t('saved_addresses')}</Text>

      {addresses.length === 0 && !loading && (
        <Card variant="filled">
          <Text style={styles.emptyText}>No saved addresses yet. Add one when booking a pickup.</Text>
        </Card>
      )}

      {addresses.map((addr) => (
        <Card key={addr.id}>
          <View style={styles.addressRow}>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>📍 {addr.label}</Text>
              <Text style={styles.addressText}>{addr.full_address}</Text>
              {addr.landmark && <Text style={styles.addressLandmark}>Landmark: {addr.landmark}</Text>}
              <Text style={styles.addressPincode}>{addr.pincode} • {addr.city}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {loading && <Text style={styles.loadingText}>{t('loading')}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressInfo: { flex: 1 },
  addressLabel: { ...typography.label, color: colors.text.primary, marginBottom: 4 },
  addressText: { ...typography.body, color: colors.text.secondary },
  addressLandmark: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 2 },
  addressPincode: { ...typography.bodySmall, color: colors.text.tertiary, marginTop: 4 },
  deleteBtn: { padding: spacing.sm },
  deleteBtnText: { fontSize: 20 },
  loadingText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
