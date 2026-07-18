import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Input, colors, spacing, typography } from '@kabadiwala/ui';
import { SCRAP_CATEGORIES, SCRAP_PARENT_CATEGORIES, useTranslation, getLanguage } from '@kabadiwala/shared';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SelectedItem {
  category_id: string;
  category_name: string;
  estimated_weight_kg: number;
}

export function SelectScrapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('paper');
  const { t } = useTranslation();

  function toggleCategory(categoryId: string, categoryName: string) {
    const exists = selectedItems.find((i) => i.category_id === categoryId);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.category_id !== categoryId));
    } else {
      setSelectedItems([
        ...selectedItems,
        { category_id: categoryId, category_name: categoryName, estimated_weight_kg: 1 },
      ]);
    }
  }

  function updateWeight(categoryId: string, weight: number) {
    setSelectedItems(
      selectedItems.map((i) =>
        i.category_id === categoryId ? { ...i, estimated_weight_kg: weight } : i
      )
    );
  }

  const filteredCategories = SCRAP_CATEGORIES.filter(
    (c) => c.parent_id === activeCategory
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('select_scrap')}</Text>
        <Text style={styles.subtitle}>{t('choose_scrap_subtitle')}</Text>
      </View>

      {/* Parent Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {SCRAP_PARENT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryTab, activeCategory === cat.id && styles.categoryTabActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={styles.categoryTabIcon}>{cat.icon}</Text>
            <Text
              style={[styles.categoryTabText, activeCategory === cat.id && styles.categoryTabTextActive]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sub-categories */}
      <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsContent}>
        {filteredCategories.map((category) => {
          const isSelected = selectedItems.some((i) => i.category_id === category.id);
          const selectedItem = selectedItems.find((i) => i.category_id === category.id);

          return (
            <Card key={category.id} onPress={() => toggleCategory(category.id, category.name)}>
              <View style={styles.itemRow}>
                <Text style={styles.itemIcon}>{category.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{category.name}</Text>
                  {getLanguage() === 'hi' && (
                    <Text style={styles.itemNameHindi}>
                      {category.name_hindi}
                    </Text>
                  )}
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>

              {/* Weight Input (shown when selected) */}
              {isSelected && (
                <View style={styles.weightInput}>
                  <Text style={styles.weightLabel}>{t('approx_weight')}</Text>
                  <View style={styles.weightControls}>
                    <TouchableOpacity
                      style={styles.weightBtn}
                      onPress={() => updateWeight(category.id, Math.max(0.5, (selectedItem?.estimated_weight_kg || 1) - 0.5))}
                    >
                      <Text style={styles.weightBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.weightValue}>
                      {selectedItem?.estimated_weight_kg || 1} kg
                    </Text>
                    <TouchableOpacity
                      style={styles.weightBtn}
                      onPress={() => updateWeight(category.id, (selectedItem?.estimated_weight_kg || 1) + 0.5)}
                    >
                      <Text style={styles.weightBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {/* Footer */}
      {selectedItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedItems.length} {t('items_selected')}
          </Text>
          <Button
            title={t('next_select_time')}
            onPress={() => navigation.navigate('SelectSlot', { selectedItems })}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing['5xl'], paddingBottom: spacing.md, backgroundColor: colors.background.primary },
  backBtn: { ...typography.label, color: colors.primary[500], marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 4 },
  tabsContainer: { backgroundColor: colors.background.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  categoryTab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.neutral[100], marginRight: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryTabActive: { backgroundColor: colors.primary[500] },
  categoryTabIcon: { fontSize: 16 },
  categoryTabText: { ...typography.labelSmall, color: colors.text.secondary },
  categoryTabTextActive: { color: colors.white },
  itemsList: { flex: 1 },
  itemsContent: { padding: spacing.lg, paddingBottom: 100 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemIcon: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: { ...typography.label, color: colors.text.primary },
  itemNameHindi: { ...typography.bodySmall, color: colors.text.secondary },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.neutral[300], justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  weightInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.neutral[100] },
  weightLabel: { ...typography.bodySmall, color: colors.text.secondary },
  weightControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weightBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.neutral[200], justifyContent: 'center', alignItems: 'center' },
  weightBtnText: { fontSize: 18, fontWeight: '600', color: colors.text.primary },
  weightValue: { ...typography.label, color: colors.text.primary, minWidth: 50, textAlign: 'center' },
  footer: { padding: spacing.lg, backgroundColor: colors.background.primary, borderTopWidth: 1, borderTopColor: colors.neutral[200], gap: spacing.sm },
  footerText: { ...typography.label, color: colors.text.secondary, textAlign: 'center' },
});
