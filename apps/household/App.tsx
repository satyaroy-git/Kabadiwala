import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { loadLanguage } from '@kabadiwala/shared';
import { OnboardingWalkthrough, hasSeenOnboarding } from './src/screens/onboarding/OnboardingWalkthrough';

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
    return <OnboardingWalkthrough onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
