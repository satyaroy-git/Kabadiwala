import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { supabase } from '../../services/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Payment'>;

export function PaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t } = useTranslation();
  const { bookingId, amount, receipt } = route.params;
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    processPayment();
  }, []);

  async function processPayment() {
    try {
      // Simulate UPI payment processing (2.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Update transaction as completed
      await supabase
        .from('transactions')
        .update({
          payment_status: 'completed',
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          completed_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);

      // Update booking as completed
      await supabase
        .from('bookings')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', bookingId);

      setStatus('success');
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('failed');
    }
  }

  return (
    <View style={styles.container}>
      {status === 'processing' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.processingTitle}>Processing Payment...</Text>
          <Text style={styles.processingSubtext}>
            Sending {formatCurrency(amount)} via UPI to household
          </Text>
          <Card style={styles.upiCard}>
            <Text style={styles.upiIcon}>📱</Text>
            <Text style={styles.upiText}>UPI Payment</Text>
            <Text style={styles.upiAmount}>{formatCurrency(amount)}</Text>
          </Card>
          <Text style={styles.mockNote}>
            🧪 Mock Mode: Payment will auto-complete in 2 seconds.
            {'\n'}In production, this opens Razorpay UPI checkout.
          </Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.center}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>{formatCurrency(amount)}</Text>
          <Text style={styles.successSubtext}>
            Paid to household via UPI
          </Text>
          <Card style={styles.receiptCard}>
            <Text style={styles.receiptLabel}>Receipt: {receipt}</Text>
            <Text style={styles.receiptMethod}>Method: UPI</Text>
            <Text style={styles.receiptId}>Payment ID: pay_mock_{Date.now().toString().slice(-8)}</Text>
          </Card>
          <Button
            title={t('done')}
            onPress={() => navigation.navigate('MainTabs')}
            fullWidth
            size="large"
          />
        </View>
      )}

      {status === 'failed' && (
        <View style={styles.center}>
          <Text style={styles.failIcon}>❌</Text>
          <Text style={styles.failTitle}>Payment Failed</Text>
          <Text style={styles.failSubtext}>Please try again or use cash payment</Text>
          <Button
            title="Retry Payment"
            onPress={() => { setStatus('processing'); processPayment(); }}
            fullWidth
            size="large"
          />
          <Button
            title="Mark as Cash Payment"
            onPress={() => { setStatus('success'); }}
            variant="outline"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['3xl'] },
  processingTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xl },
  processingSubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, textAlign: 'center' },
  upiCard: { marginTop: spacing['3xl'], alignItems: 'center', padding: spacing.xl, width: '100%' },
  upiIcon: { fontSize: 48, marginBottom: spacing.sm },
  upiText: { ...typography.label, color: colors.text.secondary },
  upiAmount: { ...typography.currencyLarge, color: colors.primary[700], marginTop: spacing.sm },
  mockNote: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing['3xl'], lineHeight: 18 },
  successIcon: { fontSize: 72 },
  successTitle: { ...typography.h2, color: colors.primary[700], marginTop: spacing.lg },
  successAmount: { ...typography.currencyLarge, color: colors.primary[700], marginTop: spacing.sm },
  successSubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs },
  receiptCard: { marginTop: spacing['3xl'], marginBottom: spacing['3xl'], width: '100%', padding: spacing.lg },
  receiptLabel: { ...typography.label, color: colors.text.primary },
  receiptMethod: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 4 },
  receiptId: { ...typography.caption, color: colors.text.tertiary, marginTop: 4 },
  failIcon: { fontSize: 72 },
  failTitle: { ...typography.h2, color: colors.error, marginTop: spacing.lg },
  failSubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, marginBottom: spacing['3xl'] },
});
