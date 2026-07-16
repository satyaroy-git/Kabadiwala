import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { isValidName, useTranslation } from '@kabadiwala/shared';
import { createHouseholdProfile } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateProfile() {
    setError('');

    if (!isValidName(name)) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    try {
      await createHouseholdProfile({
        name: name.trim(),
        phone: user?.phone || '',
      });
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.subtitle}>
        Let's set up your profile to get started with scrap pickups.
      </Text>

      <View style={styles.form}>
        <Input
          label={t('enter_name')}
          placeholder={t('enter_name')}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          error={error}
          autoCapitalize="words"
        />

        <Button
          title={t('get_started')}
          onPress={handleCreateProfile}
          loading={loading}
          disabled={name.trim().length < 2}
          fullWidth
          size="large"
        />
      </View>
    </ScrollView>
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
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['4xl'],
  },
  form: {
    gap: spacing.lg,
  },
});
