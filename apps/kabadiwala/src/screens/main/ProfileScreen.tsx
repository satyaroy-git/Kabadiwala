import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, Rating, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { VEHICLE_TYPE_LABELS, useTranslation } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { t } = useTranslation();

  function handleSignOut() {
    Alert.alert(t('sign_out'), t('are_you_sure'), [
      { text: t('cancel') },
      { text: t('sign_out'), style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <Card>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Badge
            text={profile?.status === 'verified' ? `✓ ${t('verified')}` : 'Pending'}
            variant={profile?.status === 'verified' ? 'success' : 'warning'}
          />
          <View style={styles.ratingRow}>
            <Rating value={profile?.rating || 0} readonly size="small" showValue />
          </View>
        </View>
      </Card>

      <Button title="✏️ Edit Profile" onPress={() => navigation.navigate('EditProfile' as never)} variant="outline" fullWidth />

      {/* Details */}
      <Card>
        <DetailRow label={t('vehicle')} value={VEHICLE_TYPE_LABELS[profile?.vehicle_type || ''] || 'N/A'} />
        <DetailRow label={t('phone')} value={profile?.phone || ''} />
        <DetailRow label={t('total_pickups')} value={String(profile?.total_pickups || 0)} />
        <DetailRow label={t('service_pincodes')} value={profile?.service_pincodes?.join(', ') || 'None'} />
      </Card>

      {/* Settings */}
      <Card>
        <Text style={styles.sectionTitle}>{t('settings')}</Text>
        <DetailRow label={`🔔 ${t('notifications')}`} value={t('on')} />
        <DetailRow label={`📍 ${t('location_sharing')}`} value={t('while_online')} />
        <DetailRow label={`🗓️ ${t('availability')}`} value="Mon-Sat, 9am-6pm" />
        <DetailRow label={`🌐 ${t('language')}`} value={t('tap_to_change')} />
      </Card>

      <Button title={`🌐 ${t('change_language')}`} onPress={() => navigation.navigate('LanguageSelect' as never)} variant="outline" fullWidth />

      <Button title={t('sign_out')} onPress={handleSignOut} variant="outline" fullWidth />
      <Text style={styles.version}>Kabadiwala Partner v1.0.0</Text>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  label: { ...typography.body, color: colors.text.secondary },
  value: { ...typography.label, color: colors.text.primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.lg },
  profileHeader: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.secondary[100], justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.secondary[700] },
  name: { ...typography.h3, color: colors.text.primary },
  ratingRow: { marginTop: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm },
  version: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center' },
});
