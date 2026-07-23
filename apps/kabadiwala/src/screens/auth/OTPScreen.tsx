import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { verifyOTP, signInWithPhone } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export function OTPScreen({ route, navigation }: Props) {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleVerifyOTP() {
    setError('');
    if (otp.length !== 6) {
      setError(t('enter_valid_otp'));
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      // Auth state change will handle navigation automatically
    } catch (err: any) {
      setError(err.message || t('invalid_otp'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setResendTimer(30);
    try {
      await signInWithPhone(phone);
    } catch (err: any) {
      setError(t('resend_failed'));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('verify_otp')}</Text>
        <Text style={styles.subtitle}>
          {t('otp_sent_to')}{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 {t('otp_sms_hint')}
          </Text>
        </View>

        <Input
          placeholder={t('enter_otp_placeholder')}
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
          title={t('verify_continue')}
          onPress={handleVerifyOTP}
          loading={loading}
          disabled={otp.length !== 6}
          fullWidth
          size="large"
        />

        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendText}>
              {t('resend_in')} {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>{t('resend_otp')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.changePhone}>{t('change_phone_number')}</Text>
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
  phone: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoBox: {
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing['3xl'],
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.secondary[700],
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
    color: colors.secondary[500],
  },
  changePhone: {
    ...typography.body,
    color: colors.text.link,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
