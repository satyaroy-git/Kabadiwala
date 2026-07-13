import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, RateCard } from '@kabadiwala/shared';
import { getRateCards } from '../../services/api';

export function RateCardScreen() {
  const [rates, setRates] = useState<RateCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRates();
  }, []);

  async function loadRates() {
    try {
      const data = await getRateCards();
      setRates(data);
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  }

  function renderRateItem({ item }: { item: RateCard }) {
    const changePercent = item.rate_change ?? 0;
    const isUp = changePercent > 0;
    const isDown = changePercent < 0;

    return (
      <Card>
        <View style={styles.rateItem}>
          <Text style={styles.icon}>{item.category_icon}</Text>
          <View style={styles.rateInfo}>
            <Text style={styles.categoryName}>{item.category_name}</Text>
            <Text style={styles.rateValue}>{formatCurrency(item.rate_per_kg)}/kg</Text>
          </View>
          {changePercent !== 0 && (
            <Badge
              text={`${isUp ? '↑' : '↓'} ${Math.abs(changePercent).toFixed(1)}%`}
              variant={isUp ? 'success' : 'error'}
              size="small"
            />
          )}
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Rate Card</Text>
        <Text style={styles.subtitle}>
          Rates per kg • Updated weekly
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 Rates are locked at the time of booking. Book now to secure today's rates!
        </Text>
      </View>

      <FlatList
        data={rates}
        keyExtractor={(item) => item.id}
        renderItem={renderRateItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primary[50],
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.primary[800],
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  rateInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.label,
    color: colors.text.primary,
  },
  rateValue: {
    ...typography.h4,
    color: colors.primary[700],
    marginTop: 2,
  },
});
