import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface RatingProps {
  value: number;
  maxStars?: number;
  size?: 'small' | 'medium' | 'large';
  onChange?: (rating: number) => void;
  showValue?: boolean;
  readonly?: boolean;
}

export function Rating({
  value,
  maxStars = 5,
  size = 'medium',
  onChange,
  showValue = false,
  readonly = false,
}: RatingProps) {
  const starSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;

  const renderStar = (index: number) => {
    const isFilled = index < value;
    const isHalf = index < value && index + 1 > value;

    const StarComponent = readonly ? View : TouchableOpacity;
    const starProps = readonly ? {} : { onPress: () => onChange?.(index + 1) };

    return (
      <StarComponent key={index} {...starProps} style={styles.star}>
        <Text style={{ fontSize: starSize }}>
          {isFilled ? '★' : isHalf ? '★' : '☆'}
        </Text>
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </View>
      {showValue && (
        <Text style={[styles.value, { fontSize: starSize * 0.7 }]}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  value: {
    ...typography.label,
    color: colors.text.secondary,
  },
});
