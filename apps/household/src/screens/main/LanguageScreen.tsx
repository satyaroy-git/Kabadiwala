import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '@kabadiwala/ui';
import { LANGUAGES, getLanguage, setLanguage, Language } from '@kabadiwala/shared';
import * as Updates from 'expo-updates';

export function LanguageScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<Language>(getLanguage());

  async function handleSelect(lang: Language) {
    setSelected(lang);
    await setLanguage(lang);
    Alert.alert(
      '✅ Language Changed',
      `App language set to ${LANGUAGES.find(l => l.code === lang)?.nativeName}.\n\nPlease go back to see changes. All screens will now show in the selected language.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🌐 Language / भाषा</Text>
      <Text style={styles.subtitle}>Choose your preferred language</Text>

      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.langItem, selected === lang.code && styles.langItemActive]}
          onPress={() => handleSelect(lang.code)}
        >
          <View style={styles.langInfo}>
            <Text style={[styles.langNative, selected === lang.code && styles.langNativeActive]}>
              {lang.nativeName}
            </Text>
            <Text style={styles.langEnglish}>{lang.name}</Text>
          </View>
          {selected === lang.code && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.sm },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg },
  langItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, padding: spacing.lg, borderRadius: 12, borderWidth: 1, borderColor: colors.neutral[200], marginBottom: spacing.sm },
  langItemActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  langInfo: {},
  langNative: { ...typography.h4, color: colors.text.primary },
  langNativeActive: { color: colors.primary[700] },
  langEnglish: { ...typography.bodySmall, color: colors.text.secondary, marginTop: 2 },
  check: { fontSize: 20, color: colors.primary[500], fontWeight: '700' },
});
