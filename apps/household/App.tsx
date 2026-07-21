import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { loadLanguage, ThemeProvider, useTheme } from '@kabadiwala/shared';
import { OnboardingWalkthrough, hasSeenOnboarding } from './src/screens/onboarding/OnboardingWalkthrough';

function AppContent() {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  const [langLoaded, setLangLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      await loadLanguage();
      const seen = await hasSeenOnboarding();
      setShowOnboarding(!seen);
      setLangLoaded(true);
    }
    init();
  }, []);

  if (!langLoaded || showOnboarding === null) return null;

  if (showOnboarding) {
    return (
      <ThemeProvider>
        <OnboardingWalkthrough onComplete={() => setShowOnboarding(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
