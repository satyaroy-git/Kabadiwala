import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Welcome, Partner!</Text>
      <Text style={styles.subtitle}>
        Complete your registration in under 10 minutes to start earning.
      </Text>

      <Card variant="filled">
        <View style={styles.steps}>
          <StepItem number="1" title="Aadhaar Verification" desc="OTP-based KYC" />
          <StepItem number="2" title="Selfie" desc="For trust & safety" />
          <StepItem number="3" title="Vehicle Photo" desc="Your pickup vehicle" />
          <StepItem number="4" title="Service Area" desc="Set your pincodes" />
        </View>
      </Card>

      <Button
        title="Start Registration"
        onPress={() => navigation.navigate('Aadhaar')}
        fullWidth
        size="large"
      />

      <Text style={styles.timeNote}>⏱️ Takes less than 10 minutes</Text>
    </View>
  );
}

function StepItem({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <View style={stepStyles.row}>
      <View style={stepStyles.circle}>
        <Text style={stepStyles.num}>{number}</Text>
      </View>
      <View style={stepStyles.info}>
        <Text style={stepStyles.title}>{title}</Text>
        <Text style={stepStyles.desc}>{desc}</Text>
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  circle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondary[500], justifyContent: 'center', alignItems: 'center' },
  num: { color: colors.white, fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  title: { ...typography.label, color: colors.text.primary },
  desc: { ...typography.bodySmall, color: colors.text.secondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center' },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing['3xl'] },
  steps: { paddingVertical: spacing.sm },
  timeNote: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
});
