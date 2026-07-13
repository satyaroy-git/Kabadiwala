import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'lg',
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  elevated: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filled: {
    backgroundColor: colors.neutral[50],
  },
});
