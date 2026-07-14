import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, PLATFORM_CONFIG } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../services/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Bill'>;

export function BillScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { bookingId, transaction } = route.params;

  const totalAmount = transaction?.total_amount || 0;
  const commission = transaction?.commission_amount || 0;
  const totalPaid = totalAmount + commission;

  async function handleDone() {
    try {
      // Mark booking as completed
      await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', bookingId);

      // Mark transaction as completed
      if (transaction?.transaction_id) {
        await supabase
          .from('transactions')
          .update({ payment_status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', transaction.transaction_id);
      }
    } catch (err) {
      console.error('Error completing booking:', err);
    }
    navigation.navigate('MainTabs');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.checkmark}>✅</Text>
      <Text style={styles.title}>Bill Generated!</Text>
      <Text style={styles.subtitle}>Payment will be processed via UPI</Text>

      {/* Bill Details */}
      <Card>
        <Text style={styles.sectionTitle}>Transaction Summary</Text>

        {transaction?.items?.map((item: any) => (
          <View key={item.category_id} style={styles.lineItem}>
            <Text style={styles.itemName}>
              {item.category_name} ({item.weight_kg} kg)
            </Text>
            <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.lineItem}>
          <Text style={styles.totalLabel}>Total Value</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={styles.commLabel}>
            Platform Commission ({PLATFORM_CONFIG.COMMISSION_PERCENTAGE}%)
          </Text>
          <Text style={styles.commValue}>-{formatCurrency(commission)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.lineItem}>
          <Text style={styles.payoutLabel}>Your Payout</Text>
          <Text style={styles.payoutValue}>{formatCurrency(payout)}</Text>
        </View>
      </Card>

      {/* Total Cost to Kabadiwala */}
      <Card variant="filled">
        <Text style={styles.paymentNote}>
          💰 You paid {formatCurrency(totalAmount)} to the household + {formatCurrency(commission)} platform fee = {formatCurrency(totalPaid)} total.
        </Text>
      </Card>

      <Button
        title="✅ Done - Mark as Complete"
        onPress={handleDone}
        fullWidth
        size="large"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], alignItems: 'center', gap: spacing.lg },
  checkmark: { fontSize: 64 },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.body, color: colors.text.primary },
  itemAmount: { ...typography.label, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.neutral[200], marginVertical: spacing.md },
  totalLabel: { ...typography.label, color: colors.text.primary },
  totalValue: { ...typography.h4, color: colors.text.primary },
  commLabel: { ...typography.bodySmall, color: colors.error },
  commValue: { ...typography.label, color: colors.error },
  payoutLabel: { ...typography.h4, color: colors.primary[700] },
  payoutValue: { ...typography.currencyLarge, color: colors.primary[700] },
  paymentNote: { ...typography.body, color: colors.primary[800], textAlign: 'center' },
});
