import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { formatPhoneNumber } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { verifyOTP, signInWithPhone } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export function OTPScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleVerifyOTP() {
    setError('');
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await verifyOTP(phone, otp);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendTimer(30);
    try { await signInWithPhone(phone); } catch {} 
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Code sent to <Text style={styles.phone}>+91 {formatPhoneNumber(phone)}</Text>
        </Text>
        <Input
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => { setOtp(t.replace(/\D/g, '')); setError(''); }}
          error={error}
        />
        <Button title="Verify" onPress={handleVerifyOTP} loading={loading} disabled={otp.length !== 6} fullWidth size="large" />
        <View style={styles.resend}>
          {resendTimer > 0 ? (
            <Text style={styles.timer}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['3xl'] },
  phone: { fontWeight: '600', color: colors.text.primary },
  resend: { alignItems: 'center', marginTop: spacing.xl },
  timer: { ...typography.body, color: colors.text.tertiary },
  resendLink: { ...typography.label, color: colors.secondary[500] },
});
