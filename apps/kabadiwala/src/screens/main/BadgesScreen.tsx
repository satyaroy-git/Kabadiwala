import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Rating, colors, spacing, typography } from '@kabadiwala/ui';
import { useAuth } from '../../contexts/AuthContext';

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  requirement: string;
  earned: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export function BadgesScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const rating = profile?.rating || 0;
  const totalPickups = profile?.total_pickups || 0;

  const currentTier = rating >= 4.8 ? 'Platinum' : rating >= 4.5 ? 'Gold' : rating >= 4.0 ? 'Silver' : 'Bronze';
  const tierEmoji = rating >= 4.8 ? '💎' : rating >= 4.5 ? '🥇' : rating >= 4.0 ? '🥈' : '🥉';

  const badges: Badge[] = [
    { id: 'first5', icon: '⭐', title: 'Rising Star', description: 'Complete 5 pickups', requirement: '5 pickups', earned: totalPickups >= 5, tier: 'bronze' },
    { id: 'first25', icon: '🌟', title: 'Reliable Partner', description: 'Complete 25 pickups', requirement: '25 pickups', earned: totalPickups >= 25, tier: 'silver' },
    { id: 'first50', icon: '💫', title: 'Trusted Dealer', description: 'Complete 50 pickups', requirement: '50 pickups', earned: totalPickups >= 50, tier: 'gold' },
    { id: 'first100', icon: '👑', title: 'Master Kabadiwala', description: 'Complete 100 pickups', requirement: '100 pickups', earned: totalPickups >= 100, tier: 'platinum' },
    { id: 'rate4', icon: '🎯', title: 'Quality Service', description: 'Maintain 4.0+ rating', requirement: '4.0+ rating', earned: rating >= 4.0, tier: 'silver' },
    { id: 'rate45', icon: '🏆', title: 'Premium Partner', description: 'Maintain 4.5+ rating', requirement: '4.5+ rating', earned: rating >= 4.5, tier: 'gold' },
    { id: 'rate48', icon: '💎', title: 'Elite Status', description: 'Maintain 4.8+ rating', requirement: '4.8+ rating', earned: rating >= 4.8, tier: 'platinum' },
    { id: 'ontime', icon: '⏰', title: 'Always On Time', description: 'No late arrivals in 20 pickups', requirement: '20 on-time pickups', earned: totalPickups >= 20, tier: 'silver' },
    { id: 'heavy', icon: '💪', title: 'Heavy Lifter', description: 'Handle 500+ kg total', requirement: '500 kg collected', earned: false, tier: 'gold' },
    { id: 'loyal', icon: '🤝', title: 'Community Favorite', description: '10+ repeat customers', requirement: '10 repeat customers', earned: false, tier: 'gold' },
  ];

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  // Premium unlock benefits
  const premiumUnlocked = rating >= 4.0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>⭐ Rating & Badges</Text>

      {/* Rating Card */}
      <Card>
        <View style={styles.ratingSection}>
          <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          <Rating value={rating} readonly size="medium" />
          <Text style={styles.ratingPickups}>{totalPickups} pickups completed</Text>
        </View>
      </Card>

      {/* Current Tier */}
      <Card>
        <View style={styles.tierSection}>
          <Text style={styles.tierEmoji}>{tierEmoji}</Text>
          <View style={styles.tierInfo}>
            <Text style={styles.tierTitle}>{currentTier} Partner</Text>
            <Text style={styles.tierDesc}>
              {rating >= 4.5 ? 'You unlock premium, high-value bookings!' : `Reach 4.5 rating to unlock premium bookings`}
            </Text>
          </View>
        </View>

        {/* Tier Progress */}
        <View style={styles.tierProgress}>
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier, i) => {
            const thresholds = [0, 4.0, 4.5, 4.8];
            const active = rating >= thresholds[i];
            return (
              <View key={tier} style={styles.tierStep}>
                <View style={[styles.tierDot, active && styles.tierDotActive]} />
                <Text style={[styles.tierStepLabel, active && styles.tierStepLabelActive]}>{tier}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Premium Benefits */}
      <Card variant={premiumUnlocked ? 'elevated' : 'filled'}>
        <Text style={styles.sectionTitle}>
          {premiumUnlocked ? '✅ Premium Benefits Unlocked' : '🔒 Unlock Premium Benefits'}
        </Text>
        <Text style={styles.benefitText}>
          • Priority access to high-value pickups{'\n'}
          • Higher earning potential (bulk orders){'\n'}
          • Featured profile for households{'\n'}
          • Lower commission rate (coming soon){'\n'}
          • Verified badge on your profile
        </Text>
        {!premiumUnlocked && (
          <Text style={styles.unlockHint}>
            Maintain a 4.0+ rating to unlock these benefits!
          </Text>
        )}
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>🏆 Your Badges ({earnedBadges.length})</Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.title}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Locked Badges */}
      <Card>
        <Text style={styles.sectionTitle}>🔒 Badges to Earn</Text>
        {lockedBadges.map((badge) => (
          <View key={badge.id} style={styles.lockedRow}>
            <Text style={styles.lockedIcon}>{badge.icon}</Text>
            <View style={styles.lockedInfo}>
              <Text style={styles.lockedTitle}>{badge.title}</Text>
              <Text style={styles.lockedReq}>{badge.requirement}</Text>
            </View>
            <Text style={styles.tierBadge}>
              {badge.tier === 'platinum' ? '💎' : badge.tier === 'gold' ? '🥇' : badge.tier === 'silver' ? '🥈' : '🥉'}
            </Text>
          </View>
        ))}
      </Card>

      {/* Tips */}
      <Card variant="filled">
        <Text style={styles.sectionTitle}>💡 Tips to improve rating</Text>
        <Text style={styles.benefitText}>
          • Arrive on time (within the time slot){'\n'}
          • Be polite and professional{'\n'}
          • Weigh accurately — no disputes{'\n'}
          • Keep your vehicle clean{'\n'}
          • Respond to requests quickly
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.secondary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  ratingSection: { alignItems: 'center', paddingVertical: spacing.lg },
  ratingValue: { fontSize: 48, fontWeight: '700', color: colors.secondary[700], marginBottom: spacing.sm },
  ratingPickups: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm },
  tierSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tierEmoji: { fontSize: 40 },
  tierInfo: { flex: 1 },
  tierTitle: { ...typography.h3, color: colors.text.primary },
  tierDesc: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  tierProgress: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[100] },
  tierStep: { alignItems: 'center', gap: 4 },
  tierDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.neutral[300] },
  tierDotActive: { backgroundColor: colors.secondary[500] },
  tierStepLabel: { ...typography.caption, color: colors.text.tertiary },
  tierStepLabelActive: { color: colors.secondary[700], fontWeight: '600' },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  benefitText: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },
  unlockHint: { ...typography.label, color: colors.secondary[500], marginTop: spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  badgeItem: { alignItems: 'center', width: 70 },
  badgeIcon: { fontSize: 32, marginBottom: 4 },
  badgeName: { ...typography.caption, color: colors.text.primary, textAlign: 'center' },
  lockedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  lockedIcon: { fontSize: 24, marginRight: spacing.md, opacity: 0.5 },
  lockedInfo: { flex: 1 },
  lockedTitle: { ...typography.label, color: colors.text.tertiary },
  lockedReq: { ...typography.caption, color: colors.text.tertiary },
  tierBadge: { fontSize: 16 },
});
