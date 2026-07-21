import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { formatWeight, useTranslation, useTheme } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const { toggleTheme, isDark, colors: themeColors } = useTheme();

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

  async function handleToggleDarkMode() {
    toggleTheme();
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={[styles.name, { color: themeColors.text }]}>{profile?.name || 'User'}</Text>
        <Text style={[styles.email, { color: themeColors.textSecondary }]}>{user?.email || ''}</Text>
      </View>

      {/* Stats */}
      <Card style={{ backgroundColor: themeColors.card }}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{profile?.total_pickups || 0}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pickups</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: themeColors.text }]}>
              {formatWeight(profile?.total_recycled_kg || 0)}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Recycled</Text>
          </View>
        </View>
      </Card>

      {/* Menu Items */}
      <Card style={{ backgroundColor: themeColors.card }}>
        <MenuItem icon="🌐" title="Language / भाषा" onPress={() => navigation.navigate('LanguageSelect' as never)} />
        <MenuItem icon={isDark ? "☀️" : "🌙"} title={isDark ? "Light Mode" : "Dark Mode"} onPress={handleToggleDarkMode} />
        <MenuItem icon="🔄" title={t('recurring_pickups')} onPress={() => navigation.navigate('Recurring' as never)} />
        <MenuItem icon="🌍" title={t('my_impact')} onPress={() => navigation.navigate('Impact' as never)} />
        <MenuItem icon="🎮" title={t('rewards_badges')} onPress={() => navigation.navigate('Gamification' as never)} />
        <MenuItem icon="🎁" title={t('refer_earn')} onPress={() => navigation.navigate('Referral' as never)} />
        <MenuItem icon="📍" title={t('saved_addresses')} onPress={() => navigation.navigate('SavedAddresses' as never)} />
        <MenuItem icon="📄" title={t('transaction_history')} onPress={() => navigation.navigate('TransactionHistory' as never)} />
        <MenuItem icon="❓" title={t('help_support')} onPress={() => navigation.navigate('HelpSupport' as never)} />
      </Card>

      {/* Sign Out */}
      <Button
        title={t('sign_out')}
        onPress={handleSignOut}
        variant="outline"
        fullWidth
      />

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  const { colors: tc } = useTheme();
  return (
    <TouchableOpacity style={[menuStyles.item, { borderBottomColor: tc.border }]} onPress={onPress} activeOpacity={0.6}>
      <Text style={menuStyles.icon}>{icon}</Text>
      <Text style={[menuStyles.title, { color: tc.text }]}>{title}</Text>
      <Text style={[menuStyles.arrow, { color: tc.textSecondary }]}>›</Text>
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
