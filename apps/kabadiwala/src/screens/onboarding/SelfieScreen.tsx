import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, colors, spacing, typography } from '@kabadiwala/ui';
import { RootStackParamList } from '../../navigation/RootNavigator';
// import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Selfie'>;

export function SelfieScreen({ navigation }: Props) {
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  async function takeSelfie() {
    // In production, use expo-image-picker or expo-camera
    // const result = await ImagePicker.launchCameraAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 0.8,
    // });
    // if (!result.canceled) setSelfieUri(result.assets[0].uri);
    
    // Placeholder for now
    setSelfieUri('placeholder');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Take a Selfie</Text>
      <Text style={styles.subtitle}>
        A clear photo of your face helps households trust you. This will be shown on your profile.
      </Text>

      <TouchableOpacity style={styles.cameraBox} onPress={takeSelfie}>
        {selfieUri ? (
          <View style={styles.preview}>
            <Text style={styles.previewEmoji}>✅</Text>
            <Text style={styles.previewText}>Selfie captured</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.cameraEmoji}>📷</Text>
            <Text style={styles.placeholderText}>Tap to take selfie</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips for a good photo:</Text>
        <Text style={styles.tipItem}>• Face clearly visible</Text>
        <Text style={styles.tipItem}>• Good lighting</Text>
        <Text style={styles.tipItem}>• No sunglasses or mask</Text>
      </View>

      <Button
        title="Continue"
        onPress={() => navigation.navigate('Vehicle')}
        disabled={!selfieUri}
        fullWidth
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, padding: spacing['3xl'], justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing['3xl'] },
  cameraBox: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: colors.neutral[100], justifyContent: 'center', alignItems: 'center', marginBottom: spacing['3xl'], borderWidth: 2, borderColor: colors.neutral[300], borderStyle: 'dashed' },
  placeholder: { alignItems: 'center', gap: spacing.md },
  cameraEmoji: { fontSize: 48 },
  placeholderText: { ...typography.label, color: colors.text.secondary },
  preview: { alignItems: 'center', gap: spacing.md },
  previewEmoji: { fontSize: 48 },
  previewText: { ...typography.label, color: colors.primary[700] },
  tips: { marginBottom: spacing['3xl'] },
  tipsTitle: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm },
  tipItem: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: 4 },
});
