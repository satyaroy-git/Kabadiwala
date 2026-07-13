import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, formatWeight } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function ProfileScreen() {
  const { profile, user } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Sign out error:', error);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.name || 'User'}</Text>
        <Text style={styles.phone}>{user?.phone || ''}</Text>
      </View>

      {/* Stats */}
      <Card>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.total_pickups || 0}</Text>
            <Text style={styles.statLabel}>Pickups</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {formatWeight(profile?.total_recycled_kg || 0)}
            </Text>
            <Text style={styles.statLabel}>Recycled</Text>
          </View>
        </View>
      </Card>

      {/* Menu Items */}
      <Card>
        <MenuItem icon="📍" title="Saved Addresses" />
        <MenuItem icon="📄" title="Transaction History" />
        <MenuItem icon="🔔" title="Notifications" />
        <MenuItem icon="❓" title="Help & Support" />
        <MenuItem icon="📋" title="Terms & Conditions" />
        <MenuItem icon="🔒" title="Privacy Policy" />
      </Card>

      {/* Sign Out */}
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        fullWidth
      />

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={menuStyles.item}>
      <Text style={menuStyles.icon}>{icon}</Text>
      <Text style={menuStyles.title}>{title}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </View>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  icon: { fontSize: 20, marginRight: spacing.md },
  title: { ...typography.body, color: colors.text.primary, flex: 1 },
  arrow: { fontSize: 20, color: colors.neutral[400] },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primary[100],
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary[700] },
  name: { ...typography.h3, color: colors.text.primary },
  phone: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: colors.neutral[200] },
  statValue: { ...typography.h3, color: colors.primary[700] },
  statLabel: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 4 },
  version: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.lg },
});
