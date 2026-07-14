import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, colors, spacing, typography } from '@kabadiwala/ui';
import { useAuth } from '../../contexts/AuthContext';

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  requirement: number;
  type: 'pickups' | 'kg' | 'streak';
  earned: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  pickups: number;
  isCurrentUser: boolean;
}

export function GamificationScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();
  const totalPickups = profile?.total_pickups || 0;
  const totalKg = profile?.total_recycled_kg || 0;

  const [currentStreak, setCurrentStreak] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    // Calculate points: 10 per pickup + 2 per kg
    setPoints(totalPickups * 10 + Math.floor(totalKg) * 2);
    // Approximate streak from pickups
    setCurrentStreak(Math.min(totalPickups, 30));
  }, [totalPickups, totalKg]);


  const badges: Badge[] = [
    { id: 'first', icon: '🌱', title: 'Seedling', description: 'Complete your first pickup', requirement: 1, type: 'pickups', earned: totalPickups >= 1 },
    { id: 'regular', icon: '🌿', title: 'Green Regular', description: 'Complete 5 pickups', requirement: 5, type: 'pickups', earned: totalPickups >= 5 },
    { id: 'warrior', icon: '🌳', title: 'Eco Warrior', description: 'Complete 10 pickups', requirement: 10, type: 'pickups', earned: totalPickups >= 10 },
    { id: 'champion', icon: '🏆', title: 'Recycling Champion', description: 'Complete 25 pickups', requirement: 25, type: 'pickups', earned: totalPickups >= 25 },
    { id: 'legend', icon: '👑', title: 'Green Legend', description: 'Complete 50 pickups', requirement: 50, type: 'pickups', earned: totalPickups >= 50 },
    { id: 'kg10', icon: '📦', title: 'Ten Kilo Club', description: 'Recycle 10+ kg total', requirement: 10, type: 'kg', earned: totalKg >= 10 },
    { id: 'kg50', icon: '🚛', title: 'Half Quintal', description: 'Recycle 50+ kg total', requirement: 50, type: 'kg', earned: totalKg >= 50 },
    { id: 'kg100', icon: '💪', title: 'Centurion', description: 'Recycle 100+ kg total', requirement: 100, type: 'kg', earned: totalKg >= 100 },
    { id: 'streak7', icon: '🔥', title: 'Week Streak', description: '7-day recycling streak', requirement: 7, type: 'streak', earned: currentStreak >= 7 },
    { id: 'streak30', icon: '⚡', title: 'Monthly Hero', description: '30-day recycling streak', requirement: 30, type: 'streak', earned: currentStreak >= 30 },
  ];

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  // Mock leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Priya S.', pickups: 47, isCurrentUser: false },
    { rank: 2, name: 'Rahul M.', pickups: 38, isCurrentUser: false },
    { rank: 3, name: 'Anita K.', pickups: 31, isCurrentUser: false },
    { rank: 4, name: profile?.name || 'You', pickups: totalPickups, isCurrentUser: true },
    { rank: 5, name: 'Vikram P.', pickups: 12, isCurrentUser: false },
  ].sort((a, b) => b.pickups - a.pickups).map((e, i) => ({ ...e, rank: i + 1 }));


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ ...typography.label, color: colors.primary[500], marginBottom: spacing.md }}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🎮 Green Rewards</Text>

      {/* Points & Streak */}
      <View style={styles.topRow}>
        <Card style={styles.topCard}>
          <Text style={styles.topEmoji}>⭐</Text>
          <Text style={styles.topValue}>{points}</Text>
          <Text style={styles.topLabel}>Points</Text>
        </Card>
        <Card style={styles.topCard}>
          <Text style={styles.topEmoji}>🔥</Text>
          <Text style={styles.topValue}>{currentStreak}</Text>
          <Text style={styles.topLabel}>Day Streak</Text>
        </Card>
        <Card style={styles.topCard}>
          <Text style={styles.topEmoji}>🏅</Text>
          <Text style={styles.topValue}>{earnedBadges.length}/{badges.length}</Text>
          <Text style={styles.topLabel}>Badges</Text>
        </Card>
      </View>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>🏆 Your Badges</Text>
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
        <Text style={styles.sectionTitle}>🔒 Badges to Unlock</Text>
        {lockedBadges.slice(0, 5).map((badge) => (
          <View key={badge.id} style={styles.lockedRow}>
            <Text style={styles.lockedIcon}>{badge.icon}</Text>
            <View style={styles.lockedInfo}>
              <Text style={styles.lockedTitle}>{badge.title}</Text>
              <Text style={styles.lockedDesc}>{badge.description}</Text>
            </View>
            <Text style={styles.lockedStatus}>🔒</Text>
          </View>
        ))}
      </Card>

      {/* Leaderboard */}
      <Card>
        <Text style={styles.sectionTitle}>📊 Neighborhood Leaderboard</Text>
        {leaderboard.map((entry) => (
          <View
            key={entry.rank}
            style={[styles.leaderRow, entry.isCurrentUser && styles.leaderRowHighlight]}
          >
            <Text style={styles.leaderRank}>
              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
            </Text>
            <Text style={[styles.leaderName, entry.isCurrentUser && styles.leaderNameBold]}>
              {entry.name} {entry.isCurrentUser ? '(You)' : ''}
            </Text>
            <Text style={styles.leaderPickups}>{entry.pickups} pickups</Text>
          </View>
        ))}
      </Card>

      {/* How to earn points */}
      <Card variant="filled">
        <Text style={styles.sectionTitle}>💡 How to earn points</Text>
        <Text style={styles.earnText}>
          • +10 points per pickup completed{'\n'}
          • +2 points per kg recycled{'\n'}
          • +50 bonus for 7-day streak{'\n'}
          • +100 bonus for each badge earned{'\n'}
          • Points unlock exclusive offers & priority booking!
        </Text>
      </Card>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  topRow: { flexDirection: 'row', gap: spacing.sm },
  topCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  topEmoji: { fontSize: 24, marginBottom: 4 },
  topValue: { ...typography.h4, color: colors.primary[700] },
  topLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeItem: { alignItems: 'center', width: 70 },
  badgeIcon: { fontSize: 32, marginBottom: 4 },
  badgeName: { ...typography.caption, color: colors.text.primary, textAlign: 'center' },
  lockedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  lockedIcon: { fontSize: 24, marginRight: spacing.md, opacity: 0.4 },
  lockedInfo: { flex: 1 },
  lockedTitle: { ...typography.label, color: colors.text.tertiary },
  lockedDesc: { ...typography.caption, color: colors.text.tertiary },
  lockedStatus: { fontSize: 14 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  leaderRowHighlight: { backgroundColor: colors.primary[50], marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg, borderRadius: 8 },
  leaderRank: { fontSize: 18, width: 36 },
  leaderName: { ...typography.body, color: colors.text.primary, flex: 1 },
  leaderNameBold: { fontWeight: '700', color: colors.primary[700] },
  leaderPickups: { ...typography.labelSmall, color: colors.text.secondary },
  earnText: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },
});
