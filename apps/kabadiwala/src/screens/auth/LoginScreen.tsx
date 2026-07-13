import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { isValidPhone } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { signInWithPhone } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOTP() {
    setError('');
    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await signInWithPhone(phone);
      navigation.navigate('OTP', { phone });
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
            label="Mobile Number"
            placeholder="Enter 10-digit number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(text) => { setPhone(text.replace(/\D/g, '')); setError(''); }}
            error={error}
            leftIcon={<Text style={styles.prefix}>+91</Text>}
          />
          <Button
            title="Get OTP"
            onPress={handleSendOTP}
            loading={loading}
            disabled={phone.length !== 10}
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
  prefix: { ...typography.bodyLarge, color: colors.text.primary, fontWeight: '500' },
});
