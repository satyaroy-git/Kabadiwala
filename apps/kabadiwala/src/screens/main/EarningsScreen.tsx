import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, EarningsSummary, Transaction } from '@kabadiwala/shared';
import { getEarningsSummary, getTransactionHistory } from '../../services/api';

export function EarningsScreen() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Earnings</Text>

      {/* Summary Cards */}
      <Card>
        <Text style={styles.cardLabel}>Total Earnings</Text>
        <Text style={styles.bigNumber}>{formatCurrency(earnings?.total || 0)}</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.smallLabel}>Today</Text>
          <Text style={styles.smallValue}>{formatCurrency(earnings?.today || 0)}</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.smallLabel}>This Week</Text>
          <Text style={styles.smallValue}>{formatCurrency(earnings?.this_week || 0)}</Text>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.smallLabel}>This Month</Text>
          <Text style={styles.smallValue}>{formatCurrency(earnings?.this_month || 0)}</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.smallLabel}>Commission Paid</Text>
          <Text style={[styles.smallValue, { color: colors.error }]}>
            -{formatCurrency(earnings?.total_commission_paid || 0)}
          </Text>
        </Card>
      </View>

      {/* Commission Info */}
      <Card variant="filled">
        <Text style={styles.commissionNote}>
          💡 Platform deducts 10% commission per transaction. Commission is clearly shown in each transaction.
        </Text>
      </Card>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.slice(0, 10).map((txn) => (
        <Card key={txn.id} variant="outlined">
          <View style={styles.txnRow}>
            <View>
              <Text style={styles.txnDate}>{new Date(txn.created_at).toLocaleDateString()}</Text>
              <Text style={styles.txnAmount}>Earned: {formatCurrency(txn.kabadiwala_payout)}</Text>
            </View>
            <View style={styles.txnRight}>
              <Text style={styles.txnTotal}>Total: {formatCurrency(txn.total_amount)}</Text>
              <Text style={styles.txnComm}>Comm: -{formatCurrency(txn.commission_amount)}</Text>
            </View>
          </View>
        </Card>
      ))}

      {transactions.length === 0 && (
        <Text style={styles.noTxns}>No transactions yet. Complete pickups to start earning!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  cardLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.xs },
  bigNumber: { ...typography.currencyLarge, color: colors.primary[700] },
  row: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
  smallLabel: { ...typography.bodySmall, color: colors.text.secondary },
  smallValue: { ...typography.h4, color: colors.text.primary, marginTop: 4 },
  commissionNote: { ...typography.bodySmall, color: colors.secondary[800] },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginTop: spacing.md },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnDate: { ...typography.bodySmall, color: colors.text.secondary },
  txnAmount: { ...typography.label, color: colors.primary[700], marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnTotal: { ...typography.bodySmall, color: colors.text.primary },
  txnComm: { ...typography.caption, color: colors.error, marginTop: 2 },
  noTxns: { ...typography.body, color: colors.text.secondary, textAlign: 'center', paddingVertical: spacing['3xl'] },
});
