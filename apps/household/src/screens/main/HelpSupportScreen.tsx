import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { useTranslation } from '@kabadiwala/shared';

const SUPPORT_EMAIL = 'satya.bit123@gmail.com';

const FAQ = [
  { q: 'How do I book a pickup?', a: 'Go to Home \u2192 Book a Pickup \u2192 Select items \u2192 Choose date & time \u2192 Confirm.' },
  { q: 'How is the payment made?', a: 'After the kabadiwala weighs your scrap, payment is processed via UPI instantly.' },
  { q: 'Can I cancel a booking?', a: 'Yes, go to My Pickups \u2192 Tap on the booking \u2192 Cancel Pickup.' },
  { q: 'How are rates determined?', a: 'Rates are updated weekly based on market prices. They are locked at the time of booking.' },
  { q: 'What if kabadiwala doesn\'t show up?', a: 'Contact us via email. We will reassign your pickup immediately.' },
  { q: 'How do I change my language?', a: 'Go to Profile \u2192 Language \u2192 Select your preferred language.' },
];

export function HelpSupportScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  function handleEmail() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kabadiwala App Support`).catch(() => {
      Alert.alert('Email', `Contact us at: ${SUPPORT_EMAIL}`);
    });
  }

  function handleCall() {
    Alert.alert('Contact', `Email us at: ${SUPPORT_EMAIL}\n\nWe typically respond within 24 hours.`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>{t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>❓ {t('help_support')}</Text>

      {/* Contact Card */}
      <Card>
        <Text style={styles.contactTitle}>📧 Contact Us</Text>
        <Text style={styles.contactEmail}>{SUPPORT_EMAIL}</Text>
        <Text style={styles.contactSubtext}>We typically respond within 24 hours.</Text>
        <View style={styles.contactButtons}>
          <Button title="📧 Send Email" onPress={handleEmail} size="small" />
        </View>
      </Card>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>📋 Frequently Asked Questions</Text>
      {FAQ.map((item, index) => (
        <Card key={index} variant="outlined">
          <Text style={styles.question}>{item.q}</Text>
          <Text style={styles.answer}>{item.a}</Text>
        </Card>
      ))}

      {/* App Info */}
      <Card variant="filled">
        <Text style={styles.appInfoTitle}>About Kabadiwala</Text>
        <Text style={styles.appInfoText}>
          Kabadiwala connects households with verified local scrap dealers.{'\n'}
          Sell your old newspapers, metals, plastic & e-waste at the best rates.{'\n\n'}
          Version: 1.0.0{'\n'}
          Support: {SUPPORT_EMAIL}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.md },
  contactTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm },
  contactEmail: { ...typography.h3, color: colors.primary[700], marginBottom: spacing.xs },
  contactSubtext: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: spacing.md },
  contactButtons: { flexDirection: 'row', gap: spacing.sm },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginTop: spacing.md },
  question: { ...typography.label, color: colors.text.primary, marginBottom: spacing.xs },
  answer: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },
  appInfoTitle: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm },
  appInfoText: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 20 },
});
