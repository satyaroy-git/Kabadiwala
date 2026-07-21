import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatDate, formatCurrency, formatBookingStatus, Booking, useTranslation, useTheme } from '@kabadiwala/shared';
import { getBookings } from '../../services/api';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterTab = 'active' | 'completed' | 'all';

export function BookingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const { t } = useTranslation();
  const { colors: themeColors } = useTheme();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'active') {
      return !['completed', 'cancelled', 'no_show'].includes(b.status);
    }
    if (activeTab === 'completed') {
      return b.status === 'completed';
    }
    return true;
  });

  function getStatusVariant(status: string) {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      pending: 'warning',
      assigned: 'warning',
      accepted: 'success',
      en_route: 'info',
      arrived: 'info',
      weighing: 'info',
      payment_pending: 'warning',
      completed: 'success',
      cancelled: 'error',
      no_show: 'error',
    };
    return map[status] || 'neutral';
  }

  function renderBooking({ item }: { item: Booking }) {
    const statusTranslation: Record<string, string> = { pending: t('pending'), accepted: t('accepted'), payment_pending: t('payment_pending'), completed: t('completed'), cancelled: t('cancelled'), en_route: t('en_route'), arrived: t('arrived') };
    return (
      <Card
        onPress={() => {
          if (['en_route', 'arrived'].includes(item.status)) {
            navigation.navigate('Tracking', { bookingId: item.id });
          } else {
            navigation.navigate('BookingDetail', { bookingId: item.id });
          }
        }}
      >
        <View style={styles.bookingRow}>
          <View style={styles.bookingLeft}>
            <Text style={styles.bookingDate}>{formatDate(item.scheduled_date)}</Text>
            <Text style={styles.bookingItems} numberOfLines={1}>
              {item.scrap_items.map((i) => i.category_name).join(', ')}
            </Text>
            <Text style={styles.bookingAmount}>
              {item.status === 'completed' && item.actual_amount
                ? `Paid: ${formatCurrency(item.actual_amount)}`
                : `Est. ${formatCurrency(item.total_estimated_amount)}`}
            </Text>
          </View>
          <Badge text={statusTranslation[item.status] || item.status} variant={getStatusVariant(item.status)} />
        </View>
      </Card>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
      <View style={[styles.header, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>{t('active_pickups')}</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {(['active', 'completed', 'all'] as FilterTab[]).map((tab) => {
          const tabLabels: Record<FilterTab, string> = { active: t('active'), completed: t('completed'), all: t('all') };
          return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tabLabels[tab]}
            </Text>
          </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>{t('book_pickup')}</Text>
            <Text style={styles.emptySubtext}>{t('sell_scrap_best_rates')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  title: { ...typography.h2, color: colors.text.primary },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  tabActive: { backgroundColor: colors.primary[500] },
  tabText: { ...typography.labelSmall, color: colors.text.secondary },
  tabTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingLeft: { flex: 1, marginRight: spacing.md },
  bookingDate: { ...typography.label, color: colors.text.primary },
  bookingItems: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  bookingAmount: { ...typography.bodySmall, color: colors.primary[700], marginTop: 4, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: spacing['6xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.h4, color: colors.text.primary },
  emptySubtext: { ...typography.body, color: colors.text.secondary, marginTop: spacing.xs },
});
