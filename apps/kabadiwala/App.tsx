import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { loadLanguage } from '@kabadiwala/shared';

export default function App() {
  const [langLoaded, setLangLoaded] = useState(false);

  useEffect(() => {
    loadLanguage().then(() => setLangLoaded(true));
  }, []);

  if (!langLoaded) return null;

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
