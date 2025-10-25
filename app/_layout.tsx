import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/error-boundary';
import { FlashMessageProvider } from '@/components/flash-message-provider';
import { NetworkStatus } from '@/components/network-status';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, loadStoredAuth } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadStoredAuth(); // load token hoặc user từ AsyncStorage
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [loadStoredAuth]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // ❌ Chưa đăng nhập → chuyển đến login
        router.replace('/login');
      } else {
        // ✅ Đã đăng nhập → vào tabs
        router.replace('/(tabs)');
      }
    }
  }, [user, loading]);

  if (loading) {
    // Hiển thị màn hình loading trong lúc kiểm tra đăng nhập
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
