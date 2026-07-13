import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/api';

export function PendingVerificationScreen() {
  const { refreshProfile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🕐</Text>
      <Text style={styles.title}>Verification in Progress</Text>
      <Text style={styles.subtitle}>
        Your documents are being verified. This usually takes a few hours.
      </Text>

      <Card variant="filled">
        <Text style={styles.infoText}>
          ✅ Aadhaar verified{'\n'}
          ✅ Selfie uploaded{'\n'}
          ✅ Vehicle photo uploaded{'\n'}
          ✅ Service area set{'\n\n'}
          ⏳ Admin review pending
        </Text>
      </Card>

      <Button
        title="Check Status"
        onPress={refreshProfile}
        variant="outline"
        fullWidth
      />
      <Button
        title="Sign Out"
        onPress={signOut}
        variant="ghost"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  emoji: { fontSize: 64 },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  infoText: { ...typography.body, color: colors.primary[800], lineHeight: 28 },
});
