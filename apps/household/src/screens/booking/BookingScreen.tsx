import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function BookingScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Pickup</Text>
      <Text style={styles.subtitle}>
        Schedule a scrap pickup at your doorstep
      </Text>
      <Button
        title="Select Scrap Items"
        onPress={() => navigation.navigate('SelectScrap')}
        fullWidth
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing['3xl'],
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing['3xl'],
  },
});
