import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FavoritesProvider, UpsideDownProvider } from '../src/context';
import { BottomTabNavigator } from '../src/navigation';

/**
 * Root Layout with Context Providers
 * 
 * Provider hierarchy:
 * 1. UpsideDownProvider - Theme mode (Normal/Upside Down)
 * 2. FavoritesProvider - Saved items state
 * 3. SafeAreaProvider - Safe area insets
 * 4. BottomTabNavigator - Navigation container
 */
export default function RootLayout() {
  useEffect(() => {
    console.log('[App] Riftory Marketplace initialized');
    console.log('[App] Contexts: UpsideDown + Favorites ready');
  }, []);

  return (
    <UpsideDownProvider>
      <FavoritesProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <BottomTabNavigator />
        </SafeAreaProvider>
      </FavoritesProvider>
    </UpsideDownProvider>
  );
}
