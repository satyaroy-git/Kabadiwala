import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { loadLanguage, ThemeProvider, useTheme } from '@kabadiwala/shared';

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

  useEffect(() => {
    loadLanguage().then(() => setLangLoaded(true));
  }, []);

  if (!langLoaded) return null;

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
