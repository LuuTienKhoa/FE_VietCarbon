import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ComponentProps } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface ButtonProps extends ComponentProps<typeof TouchableOpacity> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? '#ccc' : colors.success,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? '#ccc' : colors.accent,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? '#ccc' : colors.success,
      },
      danger: {
        backgroundColor: disabled ? '#ccc' : colors.error,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextColor = (): string => {
    if (disabled) return '#666';
    
    switch (variant) {
      case 'outline':
        return colors.success;
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#fff';
      default:
        return colors.text;
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <ThemedText
        style={{
          color: getTextColor(),
          fontSize: getTextSize(),
          fontWeight: '600',
        }}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}
