import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, RateCard, useTranslation, getLanguage, SCRAP_CATEGORIES, useTheme } from '@kabadiwala/shared';
import { getRateCards } from '../../services/api';

export function RateCardScreen() {
  const [rates, setRates] = useState<RateCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { colors: themeColors } = useTheme();

  function getTranslatedCategoryName(englishName: string, categoryId?: string): string {
    const lang = getLanguage();
    if (lang === 'en') return englishName;
    
    // Find category in our local data by matching name or id
    const category = SCRAP_CATEGORIES.find(
      (c) => c.name === englishName || c.id === categoryId
    );
    if (!category) return englishName;

    switch (lang) {
      case 'hi': return category.name_hindi || englishName;
      case 'or': return category.name_odia || englishName;
      case 'mr': return category.name_marathi || englishName;
      case 'ta': return category.name_tamil || englishName;
      case 'te': return category.name_telugu || englishName;
      case 'kn': return category.name_kannada || englishName;
      default: return englishName;
    }
  }

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
            <Text style={styles.categoryName}>{getTranslatedCategoryName(item.category_name, item.category_id)}</Text>
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
    <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>{t('live_rate_card')}</Text>
        <Text style={styles.subtitle}>{t('rates_per_kg')}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          💡 {t('rates_locked_info')}
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
