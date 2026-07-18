import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@kabadiwala/ui';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = '@kabadiwala_onboarding_done';

const slides = [
  {
    emoji: '♻️',
    title: 'Sell Your Scrap Easily',
    subtitle: 'Connect with verified local scrap dealers.\nGet the best rates for your old newspapers, metals, plastic & e-waste.',
  },
  {
    emoji: '📱',
    title: 'Book a Pickup',
    subtitle: 'Select what you want to sell, pick a time slot, and a verified kabadiwala comes to your doorstep.',
  },
  {
    emoji: '💰',
    title: 'Get Paid Instantly',
    subtitle: 'Scrap is weighed at your door. Payment is instant via UPI. Track everything in the app.',
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingWalkthrough({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function handleNext() {
    if (currentIndex < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  }

  function handleScroll(event: any) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {slides.map((slide, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleComplete} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextText}>Next →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={handleComplete} style={styles.getStartedBtn}>
            <Text style={styles.getStartedText}>Get Started 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 80, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: '700', color: colors.primary[700], textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 16, color: colors.text.secondary, textAlign: 'center', lineHeight: 24 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.neutral[300], marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary[500], width: 24 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 50, alignItems: 'center' },
  skipBtn: { padding: 12 },
  skipText: { fontSize: 16, color: colors.text.tertiary },
  nextBtn: { backgroundColor: colors.primary[500], paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  nextText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  getStartedBtn: { flex: 1, backgroundColor: colors.primary[500], paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  getStartedText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
