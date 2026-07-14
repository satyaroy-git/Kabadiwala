import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, Booking, EarningsSummary } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { setOnlineStatus, getMyActivePickups, getEarningsSummary } from '../../services/api';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const [isOnline, setIsOnline] = useState(profile?.is_online || false);
  const [activePickups, setActivePickups] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pickups, earn] = await Promise.all([
        getMyActivePickups(),
        getEarningsSummary(),
      ]);
      setActivePickups(pickups);
      setEarnings(earn);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }

  async function handleToggleOnline(value: boolean) {
    setIsOnline(value);
    try {
      await setOnlineStatus(value);
    } catch {
      setIsOnline(!value); // Revert
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with online toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {profile?.name || 'Partner'}!</Text>
          <Text style={styles.ratingText}>
            ★ {profile?.rating?.toFixed(1) || 'New'} • {profile?.total_pickups || 0} pickups
          </Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={[styles.onlineLabel, isOnline && styles.onlineLabelActive]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ true: colors.primary[500], false: colors.neutral[300] }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Today's Earnings */}
      <Card>
        <Text style={styles.cardTitle}>Today's Earnings</Text>
        <Text style={styles.earningsValue}>{formatCurrency(earnings?.today || 0)}</Text>
        <View style={styles.earningsRow}>
          <View style={styles.earningStat}>
            <Text style={styles.earnLabel}>This Week</Text>
            <Text style={styles.earnValue}>{formatCurrency(earnings?.this_week || 0)}</Text>
          </View>
          <View style={styles.earningStat}>
            <Text style={styles.earnLabel}>This Month</Text>
            <Text style={styles.earnValue}>{formatCurrency(earnings?.this_month || 0)}</Text>
          </View>
        </View>
      </Card>

      {/* Active Pickups */}
      {activePickups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Pickups ({activePickups.length})</Text>
          {activePickups.map((pickup) => (
            <Card key={pickup.id} onPress={() => navigation.navigate('PickupDetail', { bookingId: pickup.id })}>
              <View style={styles.pickupRow}>
                <View style={styles.pickupInfo}>
                  <Text style={styles.pickupName}>
                    📍 {(pickup as any).address?.full_address || 'Pickup'}
                  </Text>
                  <Text style={styles.pickupItems}>
                    {pickup.scrap_items.map((i) => i.category_name).join(', ')}
                  </Text>
                </View>
                <Badge
                  text={pickup.status.replace('_', ' ')}
                  variant={pickup.status === 'en_route' ? 'info' : 'success'}
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      <Card variant="filled">
        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.total_pickups || 0}</Text>
            <Text style={styles.statLabel}>Total Pickups</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(earnings?.total || 0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.service_pincodes?.length || 0}</Text>
            <Text style={styles.statLabel}>Pincodes</Text>
          </View>
        </View>
      </Card>

      {!isOnline && (
        <Card variant="filled">
          <Text style={styles.offlineNote}>
            🔴 You're offline. Go online to receive pickup requests.
          </Text>
        </Card>
      )}

      {/* Phase 2: Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.quickRow}>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Badges' as never)}>
            <Text style={styles.quickEmoji}>⭐</Text>
            <Text style={styles.quickLabel}>Rating & Badges</Text>
          </Card>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Analytics' as never)}>
            <Text style={styles.quickEmoji}>📊</Text>
            <Text style={styles.quickLabel}>Analytics</Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...typography.h3, color: colors.text.primary },
  ratingText: { ...typography.body, color: colors.text.secondary, marginTop: 2 },
  onlineToggle: { alignItems: 'center', gap: 4 },
  onlineLabel: { ...typography.labelSmall, color: colors.text.tertiary },
  onlineLabelActive: { color: colors.primary[600] },
  cardTitle: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm },
  earningsValue: { ...typography.currencyLarge, color: colors.primary[700] },
  earningsRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing['3xl'] },
  earningStat: {},
  earnLabel: { ...typography.bodySmall, color: colors.text.tertiary },
  earnValue: { ...typography.h4, color: colors.text.primary, marginTop: 2 },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text.primary },
  pickupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickupInfo: { flex: 1 },
  pickupName: { ...typography.label, color: colors.text.primary },
  pickupItems: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h4, color: colors.secondary[700] },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  offlineNote: { ...typography.body, color: colors.error, textAlign: 'center' },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, alignItems: 'center', padding: spacing.lg },
  quickEmoji: { fontSize: 28, marginBottom: spacing.sm },
  quickLabel: { ...typography.label, color: colors.text.primary, textAlign: 'center' },
});
