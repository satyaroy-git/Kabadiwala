import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, calculateTotalAmount, useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { submitWeightEntry } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'WeightEntry'>;

interface WeightItem {
  category_id: string;
  category_name: string;
  locked_rate_per_kg: number;
  actual_weight_kg: string; // string for input
}

export function WeightEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { t } = useTranslation();
  const { bookingId, items } = route.params;
  const [loading, setLoading] = useState(false);

  const [weightItems, setWeightItems] = useState<WeightItem[]>(
    items.map((item: any) => ({
      category_id: item.category_id,
      category_name: item.category_name,
      locked_rate_per_kg: item.locked_rate_per_kg,
      actual_weight_kg: '',
    }))
  );

  function updateWeight(index: number, weight: string) {
    const updated = [...weightItems];
    updated[index].actual_weight_kg = weight;
    setWeightItems(updated);
  }

  function calculateTotal(): number {
    return weightItems.reduce((sum, item) => {
      const weight = parseFloat(item.actual_weight_kg) || 0;
      return sum + weight * item.locked_rate_per_kg;
    }, 0);
  }

  async function handleGenerateBill() {
    const hasEmptyWeight = weightItems.some((i) => !i.actual_weight_kg || parseFloat(i.actual_weight_kg) <= 0);
    if (hasEmptyWeight) {
      Alert.alert('Error', 'Please enter weight for all items');
      return;
    }

    setLoading(true);
    try {
      const result = await submitWeightEntry({
        booking_id: bookingId,
        items: weightItems.map((i) => ({
          category_id: i.category_id,
          actual_weight_kg: parseFloat(i.actual_weight_kg),
        })),
      });
      navigation.navigate('Bill', { bookingId, transaction: result });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚖️ {t('enter_weights')}</Text>
        <Text style={styles.subtitle}>
          {t('weigh_each_item')}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {weightItems.map((item, index) => (
          <Card key={item.category_id}>
            <Text style={styles.itemName}>{item.category_name}</Text>
            <Text style={styles.itemRate}>
              Rate: {formatCurrency(item.locked_rate_per_kg)}/kg
            </Text>
            <Input
              label={t('actual_weight_kg')}
              placeholder="0.0"
              keyboardType="decimal-pad"
              value={item.actual_weight_kg}
              onChangeText={(text) => updateWeight(index, text)}
            />
            {item.actual_weight_kg && (
              <Text style={styles.itemTotal}>
                = {formatCurrency(parseFloat(item.actual_weight_kg || '0') * item.locked_rate_per_kg)}
              </Text>
            )}
          </Card>
        ))}
      </ScrollView>

      {/* Total & Generate Bill */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('total_amount')}</Text>
          <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
        </View>
        <Button
          title={t('generate_bill')}
          onPress={handleGenerateBill}
          loading={loading}
          fullWidth
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.md, backgroundColor: colors.background.primary },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  itemName: { ...typography.h4, color: colors.text.primary, marginBottom: 4 },
  itemRate: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: spacing.sm },
  itemTotal: { ...typography.label, color: colors.primary[700], textAlign: 'right' },
  footer: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopWidth: 1, borderTopColor: colors.neutral[200], gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.h4, color: colors.text.primary },
  totalValue: { ...typography.currencyLarge, color: colors.primary[700] },
});
