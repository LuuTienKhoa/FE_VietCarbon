import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export function Loading({ 
  message = 'Đang tải...', 
  size = 'large',
  overlay = false 
}: LoadingProps) {
  const tintColor = useThemeColor({}, 'tint');

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <ThemedView style={styles.overlayContent}>
          <ActivityIndicator size={size} color={tintColor} />
          <ThemedText style={styles.overlayMessage}>{message}</ThemedText>
        </ThemedView>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size={size} color={tintColor} />
      <ThemedText style={styles.message}>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    opacity: 0.7,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  overlayMessage: {
    marginTop: 12,
    textAlign: 'center',
  },
});
