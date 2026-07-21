import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, useTranslation, getLanguage, SCRAP_CATEGORIES } from '@kabadiwala/shared';
import { getTransactions } from '../../services/api';

export function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const totalEarned = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>{t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📄 {t('transaction_history')}</Text>

      {/* Total Summary */}
      <Card>
        <Text style={styles.summaryLabel}>{t('amount_received')}</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalEarned)}</Text>
        <Text style={styles.summaryCount}>{transactions.length} {t('pickups_completed')}</Text>
      </Card>

      {/* Transaction List */}
      {transactions.length === 0 && !loading && (
        <Card variant="filled">
          <Text style={styles.emptyText}>No transactions yet. Complete your first pickup!</Text>
        </Card>
      )}

      {transactions.map((txn) => (
        <Card key={txn.id} variant="outlined">
          <View style={styles.txnRow}>
            <View>
              <Text style={styles.txnDate}>{new Date(txn.created_at).toLocaleDateString()}</Text>
              <Text style={styles.txnAmount}>{formatCurrency(txn.total_amount)}</Text>
            </View>
            <View style={styles.txnRight}>
              <Text style={[styles.txnStatus, txn.payment_status === 'completed' ? styles.statusCompleted : styles.statusPending]}>
                {txn.payment_status === 'completed' ? '✅ ' + t('completed') : '⏳ ' + t('pending')}
              </Text>
              {txn.receipt_number && <Text style={styles.txnReceipt}>#{txn.receipt_number}</Text>}
            </View>
          </View>
        </Card>
      ))}

      {loading && <Text style={styles.loadingText}>{t('loading')}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.md },
  summaryLabel: { ...typography.label, color: colors.text.secondary },
  summaryValue: { ...typography.currencyLarge, color: colors.primary[700], marginTop: spacing.xs },
  summaryCount: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.xs },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnDate: { ...typography.bodySmall, color: colors.text.secondary },
  txnAmount: { ...typography.h4, color: colors.primary[700], marginTop: 4 },
  txnRight: { alignItems: 'flex-end' },
  txnStatus: { ...typography.labelSmall },
  statusCompleted: { color: colors.primary[700] },
  statusPending: { color: colors.secondary[700] },
  txnReceipt: { ...typography.caption, color: colors.text.tertiary, marginTop: 4 },
  loadingText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
