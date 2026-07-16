import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    disabled && styles.labelDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary[500]}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={labelStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: colors.transparent,
  },

  // Sizes
  size_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
  size_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  size_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    minHeight: 56,
  },

  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Label styles
  label: {
    ...typography.button,
    lineHeight: 24,
  },
  label_primary: {
    color: colors.white,
  },
  label_secondary: {
    color: colors.white,
  },
  label_outline: {
    color: colors.primary[500],
  },
  label_ghost: {
    color: colors.primary[500],
  },
  labelSize_small: {
    ...typography.buttonSmall,
  },
  labelSize_medium: {
    ...typography.button,
  },
  labelSize_large: {
    ...typography.button,
    fontSize: 18,
  },
  labelDisabled: {
    opacity: 0.7,
  },
});
