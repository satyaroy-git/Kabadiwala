import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Badge, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency, formatDate, RateCard, Booking } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';
import { getRateCards, getBookings } from '../../services/api';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const [rates, setRates] = useState<RateCard[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh data when screen comes into focus (e.g., after cancelling a booking)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    try {
      const [rateData, bookingData] = await Promise.all([
        getRateCards(),
        getBookings(),
      ]);
      setRates(rateData.slice(0, 5)); // Top 5 rates
      setActiveBookings(
        bookingData.filter((b) =>
          ['pending', 'assigned', 'accepted', 'en_route', 'arrived', 'weighing'].includes(b.status)
        )
      );
    } catch (error) {
      console.error('Error loading home data:', error);
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name || 'there'}! 👋</Text>
          <Text style={styles.tagline}>Sell your scrap at the best rates</Text>
        </View>
      </View>

      {/* Quick Book Button */}
      <Button
        title="📦  Book a Pickup"
        onPress={() => navigation.navigate('SelectScrap')}
        size="large"
        fullWidth
      />

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Pickups</Text>
          {activeBookings.map((booking) => (
            <Card
              key={booking.id}
              onPress={() => {
                if (['en_route', 'arrived'].includes(booking.status)) {
                  navigation.navigate('Tracking', { bookingId: booking.id });
                } else {
                  navigation.navigate('BookingDetail', { bookingId: booking.id });
                }
              }}
            >
              <View style={styles.bookingCard}>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingDate}>
                    {formatDate(booking.scheduled_date)}
                  </Text>
                  <Text style={styles.bookingItems}>
                    {booking.scrap_items.map((i) => i.category_name).join(', ')}
                  </Text>
                </View>
                <Badge
                  text={booking.status.replace('_', ' ')}
                  variant={
                    booking.status === 'en_route'
                      ? 'info'
                      : booking.status === 'accepted'
                      ? 'success'
                      : 'warning'
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Live Rates Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Rates</Text>
          <Button
            title="View All"
            onPress={() => navigation.getParent()?.navigate('Rates')}
            variant="ghost"
            size="small"
          />
        </View>
        <Card>
          {rates.map((rate, index) => (
            <View
              key={rate.id}
              style={[styles.rateRow, index < rates.length - 1 && styles.rateRowBorder]}
            >
              <Text style={styles.rateIcon}>{rate.category_icon}</Text>
              <Text style={styles.rateName}>{rate.category_name}</Text>
              <Text style={styles.ratePrice}>{formatCurrency(rate.rate_per_kg)}/kg</Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Phase 2: Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.quickGrid}>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Impact')}>
            <Text style={styles.quickEmoji}>🌍</Text>
            <Text style={styles.quickLabel}>My Impact</Text>
          </Card>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Gamification')}>
            <Text style={styles.quickEmoji}>🎮</Text>
            <Text style={styles.quickLabel}>Rewards</Text>
          </Card>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Referral')}>
            <Text style={styles.quickEmoji}>🎁</Text>
            <Text style={styles.quickLabel}>Refer & Earn</Text>
          </Card>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Recurring')}>
            <Text style={styles.quickEmoji}>🔄</Text>
            <Text style={styles.quickLabel}>Auto Pickup</Text>
          </Card>
        </View>
      </View>

      {/* Info Section */}
      <Card variant="filled">
        <Text style={styles.infoTitle}>🌱 Why Kabadiwala?</Text>
        <Text style={styles.infoText}>
          • Verified scrap dealers at your doorstep{'\n'}
          • Live rates updated weekly{'\n'}
          • UPI payment immediately after weighing{'\n'}
          • Track your kabadiwala on the map{'\n'}
          • Digital receipt for every pickup
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing['5xl'],
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.h3,
    color: colors.text.primary,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingDate: {
    ...typography.label,
    color: colors.text.primary,
  },
  bookingItems: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rateRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  rateIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  rateName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  ratePrice: {
    ...typography.label,
    color: colors.primary[700],
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickCard: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  quickEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  quickLabel: {
    ...typography.label,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
