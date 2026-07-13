import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {helperText && !error && <Text style={styles.helper}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    height: 48,
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helper: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
