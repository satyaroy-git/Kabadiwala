import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { formatCurrency } from '@kabadiwala/shared';
import { useAuth } from '../../contexts/AuthContext';

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  successfulReferrals: number;
  totalCashbackEarned: number;
  pendingCashback: number;
}

const CASHBACK_PER_REFERRAL = 50; // ₹50 per successful referral

export function ReferralScreen() {
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<ReferralStats>({
    referralCode: '',
    totalReferred: 0,
    successfulReferrals: 0,
    totalCashbackEarned: 0,
    pendingCashback: 0,
  });

  useEffect(() => {
    // Generate referral code from user ID
    const code = `KBD${(user?.id || '').substring(0, 6).toUpperCase()}`;
    setStats((prev) => ({ ...prev, referralCode: code }));
  }, [user]);

  function handleCopyCode() {
    Clipboard.setString(stats.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  }

  async function handleShareReferral() {
    const message = `Hey! I'm using Kabadiwala app to sell my scrap at the best rates. ` +
      `Verified dealers come to your doorstep! 🚛♻️\n\n` +
      `Use my referral code: ${stats.referralCode}\n` +
      `You'll get ₹50 cashback on your first pickup! 💰\n\n` +
      `Download now: https://kabadiwala.app/invite/${stats.referralCode}`;

    try {
      await Share.share({ message, title: 'Join Kabadiwala - Get ₹50!' });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ ...typography.label, color: colors.primary[500], marginBottom: spacing.md }}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🎁 Refer & Earn</Text>
      <Text style={styles.subtitle}>
        Invite friends, both of you earn ₹{CASHBACK_PER_REFERRAL}!
      </Text>

      {/* How it works */}
      <Card>
        <Text style={styles.sectionTitle}>How it works</Text>
        <Step number="1" text="Share your referral code with friends" />
        <Step number="2" text="They sign up and complete their first pickup" />
        <Step number="3" text={`You both earn ₹${CASHBACK_PER_REFERRAL} cashback! 🎉`} />
      </Card>

      {/* Referral Code */}
      <Card>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode}>
          <Text style={styles.codeText}>{stats.referralCode}</Text>
          <Text style={styles.copyIcon}>📋</Text>
        </TouchableOpacity>
        <Text style={styles.tapToCopy}>Tap to copy</Text>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalReferred}</Text>
          <Text style={styles.statLabel}>Invited</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.successfulReferrals}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalCashbackEarned)}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </Card>
      </View>

      {/* Share Buttons */}
      <Button
        title="📤  Share on WhatsApp"
        onPress={handleShareReferral}
        fullWidth
        size="large"
      />

      <Button
        title="📱  Share Link"
        onPress={handleShareReferral}
        variant="outline"
        fullWidth
      />

      {/* Rewards Info */}
      <Card variant="filled">
        <Text style={styles.rewardTitle}>💰 Rewards</Text>
        <Text style={styles.rewardText}>
          • ₹{CASHBACK_PER_REFERRAL} for each friend who completes their first pickup{'\n'}
          • Your friend also gets ₹{CASHBACK_PER_REFERRAL} cashback{'\n'}
          • No limit on referrals — earn as much as you want!{'\n'}
          • Cashback credited within 24 hours of friend's first pickup
        </Text>
      </Card>
    </ScrollView>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={stepStyles.row}>
      <View style={stepStyles.circle}>
        <Text style={stepStyles.num}>{number}</Text>
      </View>
      <Text style={stepStyles.text}>{text}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary[500], justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  num: { color: colors.white, fontWeight: '700', fontSize: 13 },
  text: { ...typography.body, color: colors.text.primary, flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  codeLabel: { ...typography.label, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary[50], borderWidth: 2, borderColor: colors.primary[300], borderStyle: 'dashed', borderRadius: 12, paddingVertical: spacing.lg, paddingHorizontal: spacing['3xl'], gap: spacing.md },
  codeText: { ...typography.h2, color: colors.primary[700], letterSpacing: 3 },
  copyIcon: { fontSize: 20 },
  tapToCopy: { ...typography.caption, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  statValue: { ...typography.h4, color: colors.primary[700] },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  rewardTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm },
  rewardText: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },
});
