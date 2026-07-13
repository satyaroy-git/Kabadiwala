import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { isValidAadhaar, maskAadhaar } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Aadhaar'>;

export function AadhaarScreen({ navigation }: Props) {
  const [aadhaar, setAadhaar] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOTP() {
    setError('');
    if (!name.trim()) { setError('Please enter your name'); return; }
    if (!isValidAadhaar(aadhaar)) { setError('Please enter a valid 12-digit Aadhaar number'); return; }
    setLoading(true);
    // Simulate DigiLocker OTP
    setTimeout(() => {
      setStep('verify');
      setLoading(false);
    }, 1500);
  }

  async function handleVerify() {
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Selfie');
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aadhaar Verification</Text>
      <Text style={styles.subtitle}>
        OTP-based KYC via DigiLocker. Your Aadhaar is never stored.
      </Text>

      {step === 'input' ? (
        <View style={styles.form}>
          <Input
            label="Full Name (as on Aadhaar)"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Aadhaar Number"
            placeholder="XXXX XXXX XXXX"
            keyboardType="number-pad"
            maxLength={12}
            value={aadhaar}
            onChangeText={(t) => { setAadhaar(t.replace(/\D/g, '')); setError(''); }}
            error={error}
          />
          <Card variant="filled">
            <Text style={styles.privacyNote}>
              🔒 We use DigiLocker API for verification. Your Aadhaar number is not stored — only verification status.
            </Text>
          </Card>
          <Button title="Send Aadhaar OTP" onPress={handleSendOTP} loading={loading} fullWidth size="large" />
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.sentText}>OTP sent to Aadhaar-linked mobile</Text>
          <Input
            label="Enter OTP"
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => { setOtp(t.replace(/\D/g, '')); setError(''); }}
            error={error}
          />
          <Button title="Verify Aadhaar" onPress={handleVerify} loading={loading} fullWidth size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['3xl'] },
  form: { gap: spacing.md },
  privacyNote: { ...typography.bodySmall, color: colors.primary[800] },
  sentText: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg },
});
