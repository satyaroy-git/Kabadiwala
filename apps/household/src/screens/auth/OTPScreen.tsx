import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { verifyOTP, signInWithEmail } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export function OTPScreen({ route, navigation }: Props) {
  const { phone: email } = route.params; // Using 'phone' param to pass email
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
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      // Auth state change will handle navigation
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setResendTimer(30);
    try {
      await signInWithEmail(email);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <Text style={styles.checkSpam}>
          💡 Check your spam/junk folder if you don't see the email
        </Text>

        <Input
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(text) => {
            setOtp(text.replace(/\D/g, ''));
            setError('');
          }}
          error={error}
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={otp.length !== 6}
          fullWidth
          size="large"
        />

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendText}>
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.changeEmail}>Change email address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  email: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  checkSpam: {
    ...typography.bodySmall,
    color: colors.secondary[700],
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing['3xl'],
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  resendLink: {
    ...typography.label,
    color: colors.primary[500],
  },
  changeEmail: {
    ...typography.body,
    color: colors.text.link,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
