import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/error-boundary';
import { FlashMessageProvider } from '@/components/flash-message-provider';
import { NetworkStatus } from '@/components/network-status';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loadStoredAuth } = useUserStore();

  useEffect(() => {
    // Load stored authentication on app start
    loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <FlashMessageProvider>
          <NetworkStatus />
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </FlashMessageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
