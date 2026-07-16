import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatDate, formatCurrency, formatDistance, Booking, useTranslation } from '@kabadiwala/shared';
import { getPickupRequests, acceptPickup, rejectPickup } from '../../services/api';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function RequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    try {
      const data = await getPickupRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error:', err);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }

  async function handleAccept(bookingId: string) {
    try {
      await acceptPickup(bookingId);
      Alert.alert('Pickup Accepted! ✅', 'You can now navigate to the household.', [
        { text: 'View Pickup', onPress: () => navigation.navigate('PickupDetail', { bookingId }) },
      ]);
      await loadRequests();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleReject(bookingId: string) {
    Alert.alert('Decline Pickup', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          await rejectPickup(bookingId, 'declined');
          await loadRequests();
        },
      },
    ]);
  }

  function renderRequest({ item }: { item: Booking }) {
    return (
      <Card>
        <View style={styles.requestHeader}>
          <Text style={styles.householdName}>{(item as any).household?.name || 'Household'}</Text>
          <Badge text={formatDate(item.scheduled_date)} variant="neutral" size="small" />
        </View>

        <Text style={styles.items}>
          📦 {item.scrap_items.map((i) => `${i.category_name} (~${i.estimated_weight_kg}kg)`).join(', ')}
        </Text>

        <Text style={styles.address}>
          📍 {item.address?.full_address || 'Address pending'}
        </Text>

        <Text style={styles.estimate}>
          💰 Est. {formatCurrency(item.total_estimated_amount)}
        </Text>

        <View style={styles.actions}>
          <Button title="Accept" onPress={() => handleAccept(item.id)} size="small" />
          <Button title="Decline" onPress={() => handleReject(item.id)} variant="outline" size="small" />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('active_pickups')}</Text>
        <Text style={styles.subtitle}>Nearby requests in your pincodes</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No requests right now</Text>
            <Text style={styles.emptySubtext}>New requests will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.md, backgroundColor: colors.background.primary },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  list: { padding: spacing.lg, gap: spacing.md },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  householdName: { ...typography.h4, color: colors.text.primary },
  items: { ...typography.body, color: colors.text.secondary, marginBottom: 4 },
  address: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: 4 },
  estimate: { ...typography.label, color: colors.primary[700], marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  empty: { alignItems: 'center', paddingTop: spacing['6xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h4, color: colors.text.primary },
  emptySubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs },
});
