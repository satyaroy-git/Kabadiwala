import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, colors, spacing, typography } from '@kabadiwala/ui';
import { SCRAP_PARENT_CATEGORIES } from '@kabadiwala/shared';

type Frequency = 'weekly' | 'biweekly' | 'monthly';

export function RecurringScreen() {
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('Saturday');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSave() {
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one scrap category');
      return;
    }
    setIsActive(true);
    Alert.alert(
      'Schedule Saved! ✅',
      `Your ${frequency} pickup is set for every ${selectedDay}. We'll auto-book for you!`
    );
  }

  function handleCancel() {
    Alert.alert('Cancel Schedule', 'Stop recurring pickups?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => setIsActive(false) },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔄 Recurring Pickups</Text>
      <Text style={styles.subtitle}>
        Set it once, we'll auto-book pickups for you!
      </Text>


      {isActive && (
        <Card>
          <View style={styles.activeBar}>
            <Text style={styles.activeIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Schedule Active</Text>
              <Text style={styles.activeDesc}>
                {frequency} on {selectedDay}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Frequency Selection */}
      <Card>
        <Text style={styles.sectionTitle}>How often?</Text>
        <View style={styles.freqRow}>
          {([['weekly', 'Weekly'], ['biweekly', 'Every 2 Weeks'], ['monthly', 'Monthly']] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.freqChip, frequency === key && styles.freqChipActive]}
              onPress={() => setFrequency(key)}
            >
              <Text style={[styles.freqText, frequency === key && styles.freqTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>


      {/* Day Selection */}
      <Card>
        <Text style={styles.sectionTitle}>Which day?</Text>
        <View style={styles.daysGrid}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Category Selection */}
      <Card>
        <Text style={styles.sectionTitle}>What scrap?</Text>
        <View style={styles.catGrid}>
          {SCRAP_PARENT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title={isActive ? "Update Schedule" : "Start Recurring Pickup"}
        onPress={handleSave}
        fullWidth
        size="large"
        disabled={selectedCategories.length === 0}
      />

      <Card variant="filled">
        <Text style={styles.infoText}>
          💡 We'll automatically book a pickup every {frequency === 'biweekly' ? '2 weeks' : frequency} on {selectedDay}.
          You'll get a notification 1 day before. You can skip or cancel anytime.
        </Text>
      </Card>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.lg, paddingTop: spacing['5xl'], gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  activeBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  activeIcon: { fontSize: 24 },
  activeTitle: { ...typography.label, color: colors.primary[700] },
  activeDesc: { ...typography.bodySmall, color: colors.text.secondary },
  cancelText: { ...typography.label, color: colors.error },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: spacing.md },
  freqRow: { flexDirection: 'row', gap: spacing.sm },
  freqChip: { flex: 1, paddingVertical: spacing.md, borderRadius: 10, backgroundColor: colors.neutral[100], alignItems: 'center', borderWidth: 1, borderColor: colors.neutral[200] },
  freqChipActive: { backgroundColor: colors.primary[50], borderColor: colors.primary[500] },
  freqText: { ...typography.labelSmall, color: colors.text.secondary },
  freqTextActive: { color: colors.primary[700] },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dayChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.neutral[100], borderWidth: 1, borderColor: colors.neutral[200] },
  dayChipActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  dayText: { ...typography.labelSmall, color: colors.text.secondary },
  dayTextActive: { color: colors.white },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.neutral[100], gap: 4, borderWidth: 1, borderColor: colors.neutral[200] },
  catChipActive: { backgroundColor: colors.primary[50], borderColor: colors.primary[500] },
  catIcon: { fontSize: 16 },
  catText: { ...typography.labelSmall, color: colors.text.secondary },
  catTextActive: { color: colors.primary[700] },
  infoText: { ...typography.bodySmall, color: colors.primary[800], lineHeight: 20 },
});
