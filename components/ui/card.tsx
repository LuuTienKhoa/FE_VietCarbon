import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComponentProps } from 'react';
import { ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';

interface CardProps extends ComponentProps<typeof ThemedView> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  ...props
}: CardProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: colors.card,
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      outlined: {
        borderWidth: 1,
        borderColor: colors.border,
      },
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: 12 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
    };
  };

  return (
    <ThemedView style={[getCardStyle(), style]} {...props}>
      {children}
    </ThemedView>
  );
}
