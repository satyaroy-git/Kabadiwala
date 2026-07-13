import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'neutral', size = 'medium', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
        {text}
      </Text>
    </View>
  );
}

const variantColors = {
  success: { bg: colors.primary[50], text: colors.primary[700] },
  warning: { bg: colors.secondary[50], text: colors.secondary[700] },
  error: { bg: '#FFEBEE', text: colors.error },
  info: { bg: '#E3F2FD', text: colors.info },
  neutral: { bg: colors.neutral[100], text: colors.neutral[700] },
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  size_small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  size_medium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.labelSmall,
  },

  // Variant backgrounds
  success: { backgroundColor: variantColors.success.bg },
  warning: { backgroundColor: variantColors.warning.bg },
  error: { backgroundColor: variantColors.error.bg },
  info: { backgroundColor: variantColors.info.bg },
  neutral: { backgroundColor: variantColors.neutral.bg },

  // Variant text colors
  text_success: { color: variantColors.success.text },
  text_warning: { color: variantColors.warning.text },
  text_error: { color: variantColors.error.text },
  text_info: { color: variantColors.info.text },
  text_neutral: { color: variantColors.neutral.text },

  textSize_small: { fontSize: 10 },
  textSize_medium: { fontSize: 12 },
});
