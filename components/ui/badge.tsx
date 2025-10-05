import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface BadgeProps extends ComponentProps<typeof ThemedView> {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export function Badge({
  children,
  variant = 'success',
  size = 'medium',
  style,
  ...props
}: BadgeProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 8, paddingVertical: 4, minHeight: 20 },
      medium: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 28 },
      large: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      success: {
        backgroundColor: colors.success + '20', // 20% opacity
        borderWidth: 1,
        borderColor: colors.success,
      },
      warning: {
        backgroundColor: colors.warning + '20',
        borderWidth: 1,
        borderColor: colors.warning,
      },
      error: {
        backgroundColor: colors.error + '20',
        borderWidth: 1,
        borderColor: colors.error,
      },
      info: {
        backgroundColor: colors.tint + '20',
        borderWidth: 1,
        borderColor: colors.tint,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
        return colors.tint;
      case 'outline':
        return colors.text;
      default:
        return colors.text;
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <ThemedView style={[getBadgeStyle(), style]} {...props}>
      <ThemedText
        style={{
          color: getTextColor(),
          fontSize: getTextSize(),
          fontWeight: '600',
        }}
      >
        {children}
      </ThemedText>
    </ThemedView>
  );
}
