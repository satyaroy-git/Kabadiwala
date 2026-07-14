import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Card, colors, spacing, typography } from '@kabadiwala/ui';
import { isValidAadhaar } from '@kabadiwala/shared';
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
    // Demo mode: simulate OTP send
    setTimeout(() => {
      setStep('verify');
      setOtp('123456'); // Auto-fill for testing
      setLoading(false);
      Alert.alert(
        'Demo Mode',
        'In production, an OTP will be sent to your Aadhaar-linked mobile via DigiLocker.\n\nFor testing, OTP is pre-filled: 123456'
      );
    }, 1000);
  }

  async function handleVerify() {
    if (otp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    setLoading(true);
    // Demo mode: accept any 6-digit OTP
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Selfie');
    }, 1000);
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
            placeholder="Enter 12-digit Aadhaar"
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
          <Card variant="filled">
            <Text style={styles.demoNote}>
              🧪 Demo Mode: Enter any valid 12-digit number (e.g., 234567890123). OTP will be auto-filled.
            </Text>
          </Card>
          <Button title="Send Aadhaar OTP" onPress={handleSendOTP} loading={loading} fullWidth size="large" />
        </View>
      ) : (
        <View style={styles.form}>
          <Card variant="filled">
            <Text style={styles.sentText}>
              ✅ OTP auto-filled for testing. In production, this will be sent to your Aadhaar-linked mobile.
            </Text>
          </Card>
          <Input
            label="Enter OTP"
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => { setOtp(t.replace(/\D/g, '')); setError(''); }}
            error={error}
          />
          <Button title="Verify & Continue" onPress={handleVerify} loading={loading} fullWidth size="large" />
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
  demoNote: { ...typography.bodySmall, color: colors.secondary[700] },
  sentText: { ...typography.bodySmall, color: colors.primary[800], textAlign: 'center' },
});
