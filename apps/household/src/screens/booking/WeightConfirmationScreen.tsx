import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, Booking, useTranslation, useTheme } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getBookingById, confirmWeight, disputeWeight } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'WeightConfirmation'>;

export function WeightConfirmationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t } = useTranslation();
  const { colors: themeColors } = useTheme();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      const data = await getBookingById(route.params.bookingId);
      setBooking(data);
    } catch (err) {
      console.error('Error loading booking:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate weight variance percentage
  function getVariance(estimated: number, actual: number): number {
    if (estimated === 0) return 0;
    return ((actual - estimated) / estimated) * 100;
  }

  function getVarianceBadge(variance: number): { text: string; variant: 'success' | 'warning' | 'error' } {
    if (Math.abs(variance) <= 20) {
      return { text: t('weight_normal'), variant: 'success' };
    } else if (variance < -30) {
      return { text: t('weight_much_less'), variant: 'error' };
    } else if (variance > 50) {
      return { text: t('weight_much_more'), variant: 'warning' };
    }
    return { text: t('weight_different'), variant: 'warning' };
  }

  async function handleConfirm() {
    Alert.alert(t('confirm_weight_title'), t('confirm_weight_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes_confirm'),
        onPress: async () => {
          setConfirming(true);
          try {
            await confirmWeight(route.params.bookingId);
            Alert.alert(t('weight_confirmed'), t('weight_confirmed_msg'), [
              { text: t('ok'), onPress: () => navigation.goBack() },
            ]);
          } catch (err: any) {
            Alert.alert(t('error'), err.message || t('something_went_wrong'));
          } finally {
            setConfirming(false);
          }
        },
      },
    ]);
  }

  async function handleDispute() {
    if (!showDisputeInput) {
      setShowDisputeInput(true);
      return;
    }

    if (!disputeReason.trim()) {
      Alert.alert(t('error'), t('dispute_reason_required'));
      return;
    }

    setDisputing(true);
    try {
      await disputeWeight(route.params.bookingId, disputeReason.trim());
      Alert.alert(t('dispute_submitted'), t('dispute_submitted_msg'), [
        { text: t('ok'), onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('something_went_wrong'));
    } finally {
      setDisputing(false);
    }
  }

  if (loading || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
        <Text style={[styles.loadingText, { color: themeColors.text }]}>{t('loading')}</Text>
      </View>
    );
  }

  const totalEstimated = booking.scrap_items.reduce((sum, i) => sum + i.estimated_weight_kg, 0);
  const totalActual = booking.scrap_items.reduce((sum, i) => sum + (i.actual_weight_kg || 0), 0);
  const overallVariance = getVariance(totalEstimated, totalActual);
  const hasSignificantVariance = Math.abs(overallVariance) > 30;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerEmoji}>⚖️</Text>
        <Text style={[styles.title, { color: themeColors.text }]}>{t('verify_weight')}</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          {t('verify_weight_subtitle')}
        </Text>
      </View>

      {/* Variance Warning */}
      {hasSignificantVariance && (
        <Card style={{ backgroundColor: overallVariance < -30 ? '#FFF3E0' : '#E3F2FD' }}>
          <Text style={styles.warningText}>
            {overallVariance < -30
              ? `⚠️ ${t('weight_variance_low')}`
              : `ℹ️ ${t('weight_variance_high')}`}
          </Text>
        </Card>
      )}

      {/* Weight Comparison */}
      <Card style={{ backgroundColor: themeColors.card }}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('weight_comparison')}</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { color: themeColors.textSecondary, flex: 2 }]}>{t('items')}</Text>
          <Text style={[styles.tableHeaderText, { color: themeColors.textSecondary, flex: 1 }]}>{t('estimated')}</Text>
          <Text style={[styles.tableHeaderText, { color: themeColors.textSecondary, flex: 1 }]}>{t('actual')}</Text>
          <Text style={[styles.tableHeaderText, { color: themeColors.textSecondary, flex: 1 }]}>{t('difference')}</Text>
        </View>

        {/* Items */}
        {booking.scrap_items.map((item) => {
          const actualKg = item.actual_weight_kg || 0;
          const diff = actualKg - item.estimated_weight_kg;
          const variance = getVariance(item.estimated_weight_kg, actualKg);
          const badge = getVarianceBadge(variance);

          return (
            <View key={item.category_id} style={[styles.tableRow, { borderBottomColor: themeColors.border }]}>
              <Text style={[styles.itemName, { color: themeColors.text, flex: 2 }]}>
                {item.category_name}
              </Text>
              <Text style={[styles.cellText, { color: themeColors.textSecondary, flex: 1 }]}>
                {item.estimated_weight_kg}kg
              </Text>
              <Text style={[styles.cellText, { color: themeColors.text, fontWeight: '700', flex: 1 }]}>
                {actualKg}kg
              </Text>
              <Text style={[
                styles.cellText,
                { flex: 1, fontWeight: '600' },
                diff > 0 ? { color: '#4CAF50' } : diff < 0 ? { color: '#F44336' } : { color: themeColors.textSecondary },
              ]}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}kg
              </Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={[styles.totalRow, { borderTopColor: themeColors.border }]}>
          <Text style={[styles.totalLabel, { color: themeColors.text, flex: 2 }]}>{t('total_amount')}</Text>
          <Text style={[styles.cellText, { color: themeColors.textSecondary, flex: 1 }]}>{totalEstimated}kg</Text>
          <Text style={[styles.cellText, { color: themeColors.text, fontWeight: '700', flex: 1 }]}>{totalActual}kg</Text>
          <Text style={[
            styles.cellText,
            { flex: 1, fontWeight: '700' },
            (totalActual - totalEstimated) >= 0 ? { color: '#4CAF50' } : { color: '#F44336' },
          ]}>
            {(totalActual - totalEstimated) > 0 ? '+' : ''}{(totalActual - totalEstimated).toFixed(1)}kg
          </Text>
        </View>
      </Card>

      {/* Payment Summary */}
      <Card style={{ backgroundColor: themeColors.card }}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('payment_summary')}</Text>
        <View style={styles.paymentRow}>
          <Text style={[styles.paymentLabel, { color: themeColors.textSecondary }]}>{t('you_will_receive')}</Text>
          <Text style={styles.paymentValue}>
            {formatCurrency(booking.actual_amount || booking.total_estimated_amount)}
          </Text>
        </View>
        <Text style={[styles.paymentNote, { color: themeColors.textSecondary }]}>
          {t('payment_after_confirmation')}
        </Text>
      </Card>

      {/* Dispute Reason Input */}
      {showDisputeInput && (
        <Card style={{ backgroundColor: themeColors.card }}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('dispute_reason')}</Text>
          <TextInput
            style={[styles.disputeInput, { color: themeColors.text, borderColor: themeColors.border }]}
            placeholder={t('dispute_reason_placeholder')}
            placeholderTextColor={themeColors.textSecondary}
            value={disputeReason}
            onChangeText={setDisputeReason}
            multiline
            numberOfLines={3}
          />
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title={`✅ ${t('confirm_weight_btn')}`}
          onPress={handleConfirm}
          loading={confirming}
          fullWidth
          size="large"
        />
        <Button
          title={`❌ ${showDisputeInput ? t('submit_dispute') : t('dispute_weight')}`}
          onPress={handleDispute}
          loading={disputing}
          variant="outline"
          fullWidth
          size="large"
        />
      </View>

      {/* Info */}
      <Card variant="filled" style={{ backgroundColor: themeColors.card }}>
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          💡 {t('weight_verification_info')}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  headerSection: { alignItems: 'center', marginBottom: spacing.sm },
  headerEmoji: { fontSize: 48, marginBottom: spacing.sm },
  title: { ...typography.h2, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center', marginTop: 4 },
  loadingText: { ...typography.body, textAlign: 'center', marginTop: 100 },
  warningText: { ...typography.body, color: '#E65100', textAlign: 'center' },
  sectionTitle: { ...typography.h4, marginBottom: spacing.md },
  tableHeader: { flexDirection: 'row', paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  tableHeaderText: { ...typography.caption, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  itemName: { ...typography.bodySmall },
  cellText: { ...typography.bodySmall, textAlign: 'center' },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 2, marginTop: spacing.sm },
  totalLabel: { ...typography.label },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentLabel: { ...typography.body },
  paymentValue: { ...typography.currencyLarge, color: colors.primary[700] },
  paymentNote: { ...typography.caption, marginTop: spacing.xs },
  disputeInput: { borderWidth: 1, borderRadius: 8, padding: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  actions: { gap: spacing.sm },
  infoText: { ...typography.bodySmall, lineHeight: 20 },
});
