import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { signInWithEmail, signUpWithEmail, signInWithPhone } from '../../services/api';
import { useTranslation } from '@kabadiwala/shared';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type LoginMode = 'email' | 'phone';

export function LoginScreen({ navigation }: Props) {
  const [loginMode, setLoginMode] = useState<LoginMode>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useTranslation();

  function isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  function isValidPhone(p: string): boolean {
    // Indian phone number: 10 digits, optionally with +91 prefix
    const cleaned = p.replace(/[\s\-\(\)]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
  }

  function formatPhone(p: string): string {
    const cleaned = p.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+91')) return cleaned;
    if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
    return '+91' + cleaned;
  }

  async function handleEmailSubmit() {
    setError('');

    if (!isValidEmail(email)) {
      setError(t('invalid_email'));
      return;
    }

    if (password.length < 6) {
      setError(t('password_min_length'));
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim().toLowerCase(), password);
      } else {
        await signInWithEmail(email.trim().toLowerCase(), password);
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError(t('invalid_credentials'));
      } else if (err.message?.includes('already registered')) {
        setError(t('email_already_registered'));
      } else {
        setError(err.message || t('something_went_wrong'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSubmit() {
    setError('');

    if (!isValidPhone(phone)) {
      setError(t('invalid_phone'));
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      await signInWithPhone(formattedPhone);
      navigation.navigate('OTP', { phone: formattedPhone });
    } catch (err: any) {
      setError(err.message || t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
        </View>

        {/* Login Mode Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, loginMode === 'phone' && styles.activeTab]}
            onPress={() => { setLoginMode('phone'); setError(''); }}
          >
            <Text style={[styles.tabText, loginMode === 'phone' && styles.activeTabText]}>
              📱 {t('phone')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, loginMode === 'email' && styles.activeTab]}
            onPress={() => { setLoginMode('email'); setError(''); }}
          >
            <Text style={[styles.tabText, loginMode === 'email' && styles.activeTabText]}>
              ✉️ {t('email')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {loginMode === 'phone' ? (
            <>
              <Input
                label={t('phone_number')}
                placeholder={t('enter_phone')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError('');
                }}
                leftIcon={<Text style={styles.prefix}>+91</Text>}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title={t('send_otp')}
                onPress={handlePhoneSubmit}
                loading={loading}
                disabled={!isValidPhone(phone)}
                fullWidth
                size="large"
              />
            </>
          ) : (
            <>
              <Input
                label={t('email')}
                placeholder={t('enter_email')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                leftIcon={<Text style={styles.prefix}>✉️</Text>}
              />

              <Input
                label={t('password')}
                placeholder={t('enter_password')}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                leftIcon={<Text style={styles.prefix}>🔒</Text>}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                title={isSignUp ? t('sign_up') : t('sign_in')}
                onPress={handleEmailSubmit}
                loading={loading}
                disabled={!isValidEmail(email) || password.length < 6}
                fullWidth
                size="large"
              />

              <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
                <Text style={styles.switchText}>
                  {isSignUp ? t('already_account') : t('new_here')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          {t('terms_agreement')}
        </Text>
      </View>
    </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary[700],
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: colors.background.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...typography.label,
    color: colors.text.tertiary,
  },
  activeTabText: {
    color: colors.primary[700],
  },
  form: {
    marginBottom: spacing['3xl'],
    gap: spacing.sm,
  },
  prefix: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  switchText: {
    ...typography.label,
    color: colors.primary[500],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  terms: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  link: {
    color: colors.text.link,
  },
});
