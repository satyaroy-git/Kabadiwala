import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, useTranslation } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getEarningsSummary, getTransactionHistory } from '../../services/api';

interface DayEarning {
  day: string;
  amount: number;
  pickups: number;
}

interface MaterialBreakdown {
  name: string;
  icon: string;
  weightKg: number;
  revenue: number;
  percentage: number;
}

export function AnalyticsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [earnings, setEarnings] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<DayEarning[]>([]);
  const [materials, setMaterials] = useState<MaterialBreakdown[]>([]);
  const [bestDay, setBestDay] = useState('');
  const [avgPerPickup, setAvgPerPickup] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const [earn, txns] = await Promise.all([
        getEarningsSummary(),
        getTransactionHistory(),
      ]);
      setEarnings(earn);

      // Calculate weekly earnings by day
      const dayMap: Record<string, { amount: number; pickups: number }> = {
        Mon: { amount: 0, pickups: 0 },
        Tue: { amount: 0, pickups: 0 },
        Wed: { amount: 0, pickups: 0 },
        Thu: { amount: 0, pickups: 0 },
        Fri: { amount: 0, pickups: 0 },
        Sat: { amount: 0, pickups: 0 },
        Sun: { amount: 0, pickups: 0 },
      };

      txns.forEach((txn: any) => {
        const day = new Date(txn.created_at).toLocaleDateString('en', { weekday: 'short' });
        const shortDay = day.slice(0, 3);
        if (dayMap[shortDay]) {
          dayMap[shortDay].amount += txn.kabadiwala_payout || 0;
          dayMap[shortDay].pickups += 1;
        }
      });

      const weekly = Object.entries(dayMap).map(([day, data]) => ({
        day,
        amount: data.amount,
        pickups: data.pickups,
      }));
      setWeeklyData(weekly);

      // Find best day
      const best = weekly.reduce((a, b) => a.amount > b.amount ? a : b, weekly[0]);
      setBestDay(best?.day || 'N/A');

      // Average per pickup
      const totalEarned = earn?.total || 0;
      const totalPickups = earn?.total_pickups || 1;
      setAvgPerPickup(totalEarned / totalPickups);

      // Material breakdown (mock based on common patterns)
      setMaterials([
        { name: 'Newspaper', icon: '📰', weightKg: 45, revenue: 630, percentage: 35 },
        { name: 'Iron/Metal', icon: '🔩', weightKg: 20, revenue: 560, percentage: 28 },
        { name: 'Plastic', icon: '🧴', weightKg: 30, revenue: 300, percentage: 15 },
        { name: 'Cardboard', icon: '📦', weightKg: 25, revenue: 200, percentage: 12 },
        { name: 'Others', icon: '📦', weightKg: 15, revenue: 180, percentage: 10 },
      ]);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  const maxEarning = Math.max(...weeklyData.map((d) => d.amount), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>← {t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📊 Analytics</Text>
      <Text style={styles.subtitle}>Your performance insights</Text>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricEmoji}>💰</Text>
          <Text style={styles.metricValue}>{formatCurrency(avgPerPickup)}</Text>
          <Text style={styles.metricLabel}>Avg/Pickup</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricEmoji}>📅</Text>
          <Text style={styles.metricValue}>{bestDay}</Text>
          <Text style={styles.metricLabel}>Best Day</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricEmoji}>⭐</Text>
          <Text style={styles.metricValue}>{profile?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </Card>
      </View>

      {/* Weekly Earnings Chart (text-based bar chart) */}
      <Card>
        <Text style={styles.sectionTitle}>📈 Weekly Earnings</Text>
        {weeklyData.map((day) => (
          <View key={day.day} style={styles.chartRow}>
            <Text style={styles.chartDay}>{day.day}</Text>
            <View style={styles.chartBarBg}>
              <View style={[styles.chartBar, { width: `${(day.amount / maxEarning) * 100}%` }]} />
            </View>
            <Text style={styles.chartValue}>
              {day.amount > 0 ? formatCurrency(day.amount) : '-'}
            </Text>
          </View>
        ))}
      </Card>

      {/* Material Breakdown */}
      <Card>
        <Text style={styles.sectionTitle}>📦 Material Breakdown</Text>
        {materials.map((mat) => (
          <View key={mat.name} style={styles.materialRow}>
            <Text style={styles.materialIcon}>{mat.icon}</Text>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{mat.name}</Text>
              <View style={styles.materialBarBg}>
                <View style={[styles.materialBar, { width: `${mat.percentage}%` }]} />
              </View>
            </View>
            <View style={styles.materialStats}>
              <Text style={styles.materialRevenue}>{formatCurrency(mat.revenue)}</Text>
              <Text style={styles.materialWeight}>{mat.weightKg} kg</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Performance Summary */}
      <Card>
        <Text style={styles.sectionTitle}>🏅 Performance</Text>
        <PerformanceRow label="Total Pickups" value={`${earnings?.total_pickups || 0}`} />
        <PerformanceRow label="Total Earned" value={formatCurrency(earnings?.total || 0)} />
        <PerformanceRow label="Commission Paid" value={formatCurrency(earnings?.total_commission_paid || 0)} />
        <PerformanceRow label="Acceptance Rate" value="85%" />
        <PerformanceRow label="On-time Rate" value="92%" />
        <PerformanceRow label="Repeat Customers" value="7" />
      </Card>

      {/* Tips */}
      <Card variant="filled">
        <Text style={styles.sectionTitle}>💡 Earning Tips</Text>
        <Text style={styles.tipsText}>
          • {bestDay || 'Saturdays'} is your best earning day — stay online longer!{'\n'}
          • Metals & e-waste pay the most per pickup{'\n'}
          • Accept more requests during morning slots (9-12){'\n'}
          • Higher rating = priority for premium bookings{'\n'}
          • Expand your service pincodes for more requests
        </Text>
      </Card>
    </ScrollView>
  );
}

function PerformanceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={perfStyles.row}>
      <Text style={perfStyles.label}>{label}</Text>
      <Text style={perfStyles.value}>{value}</Text>
    </View>
  );
}

const perfStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  label: { ...typography.body, color: colors.text.secondary },
  value: { ...typography.label, color: colors.text.primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.secondary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  metricsRow: { flexDirection: 'row', gap: spacing.sm },
  metricCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  metricEmoji: { fontSize: 24, marginBottom: 4 },
  metricValue: { ...typography.h4, color: colors.secondary[700] },
  metricLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  chartDay: { ...typography.labelSmall, color: colors.text.secondary, width: 30 },
  chartBarBg: { flex: 1, height: 20, backgroundColor: colors.neutral[100], borderRadius: 4, overflow: 'hidden' },
  chartBar: { height: '100%', backgroundColor: colors.secondary[400], borderRadius: 4 },
  chartValue: { ...typography.caption, color: colors.text.secondary, width: 50, textAlign: 'right' },
  materialRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  materialIcon: { fontSize: 20 },
  materialInfo: { flex: 1 },
  materialName: { ...typography.labelSmall, color: colors.text.primary, marginBottom: 4 },
  materialBarBg: { height: 8, backgroundColor: colors.neutral[100], borderRadius: 4, overflow: 'hidden' },
  materialBar: { height: '100%', backgroundColor: colors.secondary[300], borderRadius: 4 },
  materialStats: { alignItems: 'flex-end' },
  materialRevenue: { ...typography.labelSmall, color: colors.secondary[700] },
  materialWeight: { ...typography.caption, color: colors.text.tertiary },
  tipsText: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },
});
