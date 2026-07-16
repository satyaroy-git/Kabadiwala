import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, TouchableOpacity } from 'react-native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { formatWeight, useTranslation } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getBookings } from '../../services/api';

interface ImpactStats {
  totalRecycledKg: number;
  co2SavedKg: number;
  treesEquivalent: number;
  waterSavedLiters: number;
  energySavedKwh: number;
  totalPickups: number;
  streakDays: number;
}

// Conversion factors (approximate)
const CO2_PER_KG_RECYCLED = 2.5; // kg CO₂ saved per kg recycled
const TREES_PER_TON_CO2 = 45; // trees needed to absorb 1 ton CO₂/year
const WATER_PER_KG_RECYCLED = 20; // liters saved per kg paper recycled
const ENERGY_PER_KG_RECYCLED = 4.5; // kWh saved per kg recycled

export function ImpactScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [stats, setStats] = useState<ImpactStats>({
    totalRecycledKg: 0,
    co2SavedKg: 0,
    treesEquivalent: 0,
    waterSavedLiters: 0,
    energySavedKwh: 0,
    totalPickups: 0,
    streakDays: 0,
  });

  useEffect(() => {
    calculateImpact();
  }, []);

  async function calculateImpact() {
    try {
      const bookings = await getBookings();
      const completedBookings = bookings.filter((b) => b.status === 'completed');

      const totalKg = profile?.total_recycled_kg || 0;
      const totalPickups = profile?.total_pickups || completedBookings.length;

      setStats({
        totalRecycledKg: totalKg,
        co2SavedKg: totalKg * CO2_PER_KG_RECYCLED,
        treesEquivalent: Math.round((totalKg * CO2_PER_KG_RECYCLED) / 1000 * TREES_PER_TON_CO2 * 10) / 10,
        waterSavedLiters: totalKg * WATER_PER_KG_RECYCLED,
        energySavedKwh: totalKg * ENERGY_PER_KG_RECYCLED,
        totalPickups,
        streakDays: Math.min(totalPickups * 7, 365), // Approximate streak
      });
    } catch (error) {
      console.error('Error calculating impact:', error);
    }
  }

  async function handleShare() {
    const message = `🌱 My Green Impact with Kabadiwala!\n\n` +
      `♻️ Recycled: ${formatWeight(stats.totalRecycledKg)}\n` +
      `🌍 CO₂ Saved: ${stats.co2SavedKg.toFixed(1)} kg\n` +
      `🌳 Trees Equivalent: ${stats.treesEquivalent} trees\n` +
      `💧 Water Saved: ${stats.waterSavedLiters.toFixed(0)} liters\n\n` +
      `Join me in making the planet greener! Download Kabadiwala app 🚀`;

    try {
      await Share.share({
        message,
        title: 'My Green Impact - Kabadiwala',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ ...typography.label, color: colors.primary[500], marginBottom: spacing.md }}>← {t('back')}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🌱 {t('my_impact')}</Text>
      <Text style={styles.subtitle}>Every pickup makes a difference!</Text>

      {/* Main Impact Card */}
      <Card>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatEmoji}>🌍</Text>
          <Text style={styles.mainStatValue}>{stats.co2SavedKg.toFixed(1)} kg</Text>
          <Text style={styles.mainStatLabel}>CO₂ Saved</Text>
        </View>
      </Card>

      {/* Impact Grid */}
      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Text style={styles.gridEmoji}>♻️</Text>
          <Text style={styles.gridValue}>{formatWeight(stats.totalRecycledKg)}</Text>
          <Text style={styles.gridLabel}>Recycled</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Text style={styles.gridEmoji}>🌳</Text>
          <Text style={styles.gridValue}>{stats.treesEquivalent}</Text>
          <Text style={styles.gridLabel}>Trees Equivalent</Text>
        </Card>
      </View>

      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Text style={styles.gridEmoji}>💧</Text>
          <Text style={styles.gridValue}>{stats.waterSavedLiters.toFixed(0)}L</Text>
          <Text style={styles.gridLabel}>Water Saved</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Text style={styles.gridEmoji}>⚡</Text>
          <Text style={styles.gridValue}>{stats.energySavedKwh.toFixed(1)} kWh</Text>
          <Text style={styles.gridLabel}>Energy Saved</Text>
        </Card>
      </View>

      {/* Milestones */}
      <Card>
        <Text style={styles.sectionTitle}>🏆 Milestones</Text>
        <Milestone icon="🌱" title="First Pickup" achieved={stats.totalPickups >= 1} />
        <Milestone icon="🌿" title="5 Pickups" achieved={stats.totalPickups >= 5} />
        <Milestone icon="🌳" title="10 Pickups" achieved={stats.totalPickups >= 10} />
        <Milestone icon="🌲" title="25 Pickups" achieved={stats.totalPickups >= 25} />
        <Milestone icon="🏔️" title="50 Pickups" achieved={stats.totalPickups >= 50} />
        <Milestone icon="🌍" title="100 Pickups" achieved={stats.totalPickups >= 100} />
      </Card>

      {/* Share Button */}
      <Button
        title="📤  Share Your Impact"
        onPress={handleShare}
        fullWidth
        size="large"
      />

      <Text style={styles.note}>
        💡 Impact calculations are based on industry averages for recycling materials vs landfill disposal.
      </Text>
    </ScrollView>
  );
}

function Milestone({ icon, title, achieved }: { icon: string; title: string; achieved: boolean }) {
  return (
    <View style={milestoneStyles.row}>
      <Text style={milestoneStyles.icon}>{icon}</Text>
      <Text style={[milestoneStyles.title, !achieved && milestoneStyles.locked]}>{title}</Text>
      <Text style={milestoneStyles.status}>{achieved ? '✅' : '🔒'}</Text>
    </View>
  );
}

const milestoneStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  icon: { fontSize: 20, marginRight: spacing.md },
  title: { ...typography.body, color: colors.text.primary, flex: 1 },
  locked: { color: colors.text.tertiary },
  status: { fontSize: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.md },
  mainStat: { alignItems: 'center', paddingVertical: spacing.lg },
  mainStatEmoji: { fontSize: 48, marginBottom: spacing.sm },
  mainStatValue: { ...typography.currencyLarge, color: colors.primary[700] },
  mainStatLabel: { ...typography.label, color: colors.text.secondary, marginTop: spacing.xs },
  grid: { flexDirection: 'row', gap: spacing.md },
  gridCard: { flex: 1, alignItems: 'center', padding: spacing.lg },
  gridEmoji: { fontSize: 28, marginBottom: spacing.sm },
  gridValue: { ...typography.h4, color: colors.primary[700] },
  gridLabel: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  note: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.md },
});
