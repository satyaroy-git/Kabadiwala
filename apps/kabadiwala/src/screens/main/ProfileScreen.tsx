import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, Rating, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { VEHICLE_TYPE_LABELS } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
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
            text={profile?.status === 'verified' ? '✓ Verified' : 'Pending'}
            variant={profile?.status === 'verified' ? 'success' : 'warning'}
          />
          <View style={styles.ratingRow}>
            <Rating value={profile?.rating || 0} readonly size="small" showValue />
          </View>
        </View>
      </Card>

      {/* Details */}
      <Card>
        <DetailRow label="Vehicle" value={VEHICLE_TYPE_LABELS[profile?.vehicle_type || ''] || 'N/A'} />
        <DetailRow label="Phone" value={profile?.phone || ''} />
        <DetailRow label="Total Pickups" value={String(profile?.total_pickups || 0)} />
        <DetailRow label="Service Pincodes" value={profile?.service_pincodes?.join(', ') || 'None'} />
      </Card>

      {/* Settings */}
      <Card>
        <Text style={styles.sectionTitle}>Settings</Text>
        <DetailRow label="🔔 Notifications" value="On" />
        <DetailRow label="📍 Location Sharing" value="While online" />
        <DetailRow label="🗓️ Availability" value="Mon-Sat, 9am-6pm" />
        <DetailRow label="🌐 Language" value="Tap to change" />
      </Card>

      <Button title="🌐 Change Language" onPress={() => navigation.navigate('LanguageSelect' as never)} variant="outline" fullWidth />

      <Button title="Sign Out" onPress={handleSignOut} variant="outline" fullWidth />
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
