import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { signInWithEmail } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  async function handleSendOTP() {
    setError('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim().toLowerCase());
      navigation.navigate('OTP', { phone: email.trim().toLowerCase() });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
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
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🚛</Text>
          <Text style={styles.title}>Kabadiwala Partner</Text>
          <Text style={styles.subtitle}>
            Join India's largest scrap pickup network.{'\n'}
            Earn more with verified pickups.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            error={error}
            leftIcon={<Text style={styles.prefix}>✉️</Text>}
          />
          <Button
            title="Get OTP"
            onPress={handleSendOTP}
            loading={loading}
            disabled={!isValidEmail(email)}
            fullWidth
            size="large"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  logoContainer: { alignItems: 'center', marginBottom: spacing['5xl'] },
  logoEmoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.secondary[700], marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  form: { marginBottom: spacing['3xl'] },
  prefix: { fontSize: 18 },
});
