import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, EarningsSummary, Transaction, useTranslation, useTheme } from '@kabadiwala/shared';
import { getEarningsSummary, getTransactionHistory } from '../../services/api';

export function EarningsScreen() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();
  const { colors: themeColors, isDark } = useTheme();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [earn, txns] = await Promise.all([
        getEarningsSummary(),
        getTransactionHistory(),
      ]);
      setEarnings(earn);
      setTransactions(txns);
    } catch (err) {
      console.error('Error:', err);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Calculate totals from transactions
  const totalScrapCollected = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
  const totalPlatformFees = transactions.reduce((sum, t) => sum + (t.commission_amount || 0), 0);
  const totalCostToKabadiwala = totalScrapCollected + totalPlatformFees;
  const totalPickups = transactions.length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>{t('transaction_history')}</Text>

      {/* Summary - Your Total Spend */}
      <Card style={{ backgroundColor: themeColors.card }}>
        <Text style={[styles.cardLabel, { color: themeColors.textSecondary }]}>{t('your_total_spend')}</Text>
        <Text style={styles.bigNumber}>{formatCurrency(totalCostToKabadiwala)}</Text>
        <Text style={[styles.pickupsText, { color: themeColors.textSecondary }]}>{totalPickups} {t('pickups_completed')}</Text>
      </Card>

      {/* Breakdown */}
      <View style={styles.row}>
        <Card style={[styles.halfCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>{t('paid_to_households')}</Text>
          <Text style={[styles.smallValue, { color: themeColors.text }]}>{formatCurrency(totalScrapCollected)}</Text>
        </Card>
        <Card style={[styles.halfCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.smallLabel, { color: themeColors.textSecondary }]}>{t('platform_fee')}</Text>
          <Text style={[styles.smallValue, { color: colors.error }]}>
            {formatCurrency(totalPlatformFees)}
          </Text>
        </Card>
      </View>

      {/* How it works explanation */}
      <Card variant="filled" style={{ backgroundColor: isDark ? themeColors.card : undefined }}>
        <Text style={[styles.howItWorksTitle, { color: themeColors.text }]}>💡 {t('how_earnings_work')}</Text>
        <Text style={[styles.howItWorksText, { color: themeColors.textSecondary }]}>
          {t('how_earnings_points')}
        </Text>
      </Card>

      {/* Recent Transactions */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('recent_transactions')}</Text>
      {transactions.slice(0, 10).map((txn) => (
        <Card key={txn.id} variant="outlined" style={{ backgroundColor: themeColors.card, borderColor: themeColors.border }}>
          <View style={styles.txnRow}>
            <View>
              <Text style={[styles.txnDate, { color: themeColors.textSecondary }]}>{new Date(txn.created_at).toLocaleDateString()}</Text>
              <Text style={[styles.txnScrap, { color: themeColors.text }]}>{t('scrap_value')}: {formatCurrency(txn.total_amount)}</Text>
            </View>
            <View style={styles.txnRight}>
              <Text style={styles.txnTotal}>{t('total_paid')}: {formatCurrency(txn.total_amount + txn.commission_amount)}</Text>
              <Text style={[styles.txnFee, { color: themeColors.textSecondary }]}>{t('incl_platform_fee')}: {formatCurrency(txn.commission_amount)}</Text>
            </View>
          </View>
        </Card>
      ))}

      {transactions.length === 0 && (
        <Card variant="filled" style={{ backgroundColor: isDark ? themeColors.card : undefined }}>
          <Text style={[styles.noTxns, { color: themeColors.textSecondary }]}>
            No transactions yet.{'\n'}Complete pickups to see your transaction history here.
          </Text>
        </Card>
      )}

      {/* Tip */}
      <Card variant="filled" style={{ backgroundColor: isDark ? themeColors.card : undefined }}>
        <Text style={[styles.tipTitle, { color: themeColors.text }]}>📈 {t('maximize_earnings')}</Text>
        <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>
          {t('maximize_earnings_tips')}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  cardLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.xs },
  bigNumber: { ...typography.currencyLarge, color: colors.secondary[700] },
  pickupsText: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
  smallLabel: { ...typography.bodySmall, color: colors.text.secondary },
  smallValue: { ...typography.h4, color: colors.text.primary, marginTop: 4 },
  howItWorksTitle: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm },
  howItWorksText: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 22 },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginTop: spacing.md },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnDate: { ...typography.bodySmall, color: colors.text.secondary },
  txnScrap: { ...typography.label, color: colors.text.primary, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnTotal: { ...typography.label, color: colors.secondary[700] },
  txnFee: { ...typography.caption, color: colors.text.tertiary, marginTop: 2 },
  noTxns: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  tipTitle: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm },
  tipText: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 22 },
});
