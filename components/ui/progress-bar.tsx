import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComponentProps } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface ProgressBarProps extends ComponentProps<typeof ThemedView> {
  progress: number; // 0-100
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  progress,
  variant = 'success',
  size = 'medium',
  showLabel = false,
  label,
  style,
  ...props
}: ProgressBarProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const getBarStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      small: { height: 4 },
      medium: { height: 8 },
      large: { height: 12 },
    };

    return {
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
      ...sizeStyles[size],
    };
  };

  const getProgressColor = (): string => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.tint;
      default:
        return colors.success;
    }
  };

  const getProgressStyle = (): ViewStyle => {
    return {
      backgroundColor: getProgressColor(),
      height: '100%',
      width: `${Math.min(Math.max(progress, 0), 100)}%`,
      borderRadius: 6,
    };
  };

  return (
    <ThemedView style={[styles.container, style]} {...props}>
      {showLabel && (
        <ThemedView style={styles.labelContainer}>
          <ThemedText style={styles.label}>
            {label || `${Math.round(progress)}%`}
          </ThemedText>
        </ThemedView>
      )}
      <ThemedView style={getBarStyle()}>
        <ThemedView style={getProgressStyle()} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
