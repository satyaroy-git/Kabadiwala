import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { formatWeight } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function ProfileScreen() {
  const navigation = useNavigation();
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

  function handleMenuPress(title: string) {
    Alert.alert(title, 'This feature is coming soon in Phase 2!');
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
        <Text style={styles.email}>{user?.email || ''}</Text>
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
        <MenuItem icon="🌐" title="Language / भाषा" onPress={() => navigation.navigate('LanguageSelect' as never)} />
        <MenuItem icon="🔄" title="Recurring Pickups" onPress={() => navigation.navigate('Recurring' as never)} />
        <MenuItem icon="🌍" title="My Green Impact" onPress={() => navigation.navigate('Impact' as never)} />
        <MenuItem icon="🎮" title="Rewards & Badges" onPress={() => navigation.navigate('Gamification' as never)} />
        <MenuItem icon="🎁" title="Refer & Earn" onPress={() => navigation.navigate('Referral' as never)} />
        <MenuItem icon="📍" title="Saved Addresses" onPress={() => handleMenuPress('Saved Addresses')} />
        <MenuItem icon="📄" title="Transaction History" onPress={() => handleMenuPress('Transaction History')} />
        <MenuItem icon="❓" title="Help & Support" onPress={() => handleMenuPress('Help & Support')} />
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

function MenuItem({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.6}>
      <Text style={menuStyles.icon}>{icon}</Text>
      <Text style={menuStyles.title}>{title}</Text>
      <Text style={menuStyles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  icon: { fontSize: 20, marginRight: spacing.md },
  title: { ...typography.body, color: colors.text.primary, flex: 1 },
  arrow: { fontSize: 22, color: colors.neutral[400] },
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
  email: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: colors.neutral[200] },
  statValue: { ...typography.h3, color: colors.primary[700] },
  statLabel: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 4 },
  version: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.lg },
});
