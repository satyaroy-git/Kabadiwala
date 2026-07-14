import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar barStyle="dark-content" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
