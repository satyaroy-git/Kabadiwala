import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { signInWithEmail, signUpWithEmail } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  function isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  async function handleSubmit() {
    setError('');
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim().toLowerCase(), password);
      } else {
        await signInWithEmail(email.trim().toLowerCase(), password);
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Try signing up instead.');
      } else if (err.message?.includes('already registered')) {
        setError('This email is already registered. Try signing in.');
      } else {
        setError(err.message || 'Something went wrong.');
      }
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
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
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
            leftIcon={<Text style={styles.prefix}>✉️</Text>}
          />
          <Input
            label="Password"
            placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            leftIcon={<Text style={styles.prefix}>🔒</Text>}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={isSignUp ? "Sign Up" : "Sign In"}
            onPress={handleSubmit}
            loading={loading}
            disabled={!isValidEmail(email) || password.length < 6}
            fullWidth
            size="large"
          />

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
            <Text style={styles.switchText}>
              {isSignUp ? "Already have an account? Sign In" : "New here? Create an account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  logoContainer: { alignItems: 'center', marginBottom: spacing['4xl'] },
  logoImage: { width: 120, height: 120, marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.secondary[700], marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  form: { marginBottom: spacing['3xl'], gap: spacing.sm },
  prefix: { fontSize: 18 },
  error: { ...typography.bodySmall, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
  switchText: { ...typography.label, color: colors.secondary[500], textAlign: 'center', marginTop: spacing.lg },
});
