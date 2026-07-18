import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Rating, colors, spacing, typography } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { rateKabadiwala } from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'Rating'>;

export function RatingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { bookingId, kabadiwalaName } = route.params;
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert(t('please_select_rating'));
      return;
    }
    setLoading(true);
    try {
      await rateKabadiwala(bookingId, rating, comment);
      Alert.alert(t('thank_you'), t('rating_submitted'), [
        { text: t('ok'), onPress: () => navigation.navigate('MainTabs') },
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.title}>{t('rate_kabadiwala')}</Text>
      <Text style={styles.subtitle}>How was your pickup experience?</Text>

      <View style={styles.ratingContainer}>
        <Rating value={rating} onChange={setRating} size="large" />
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Leave a comment (optional)"
        placeholderTextColor={colors.neutral[400]}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
      />

      <Button
        title={t('submit_rating')}
        onPress={handleSubmit}
        loading={loading}
        disabled={rating === 0}
        fullWidth
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing['3xl'] },
  ratingContainer: { marginBottom: spacing['3xl'] },
  commentInput: { width: '100%', borderWidth: 1, borderColor: colors.neutral[300], borderRadius: 12, padding: spacing.lg, ...typography.body, color: colors.text.primary, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing['3xl'] },
});
