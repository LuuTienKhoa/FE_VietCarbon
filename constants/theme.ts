/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#4CAF50'; // Green for environmental theme
const tintColorDark = '#81C784'; // Light green for dark mode

export const Colors = {
  light: {
    text: '#2E3A3A', // Dark green-gray for text
    background: '#F8FFF8', // Very light green background
    tint: tintColorLight,
    icon: '#4CAF50', // Green icons
    tabIconDefault: '#81C784', // Light green for unselected
    tabIconSelected: tintColorLight,
    card: '#FFFFFF', // White cards
    border: '#E8F5E8', // Light green borders
    accent: '#2E7D32', // Dark green for accents
    success: '#4CAF50', // Success green
    warning: '#FF9800', // Orange for warnings
    error: '#F44336', // Red for errors
  },
  dark: {
    text: '#E8F5E8', // Light green text
    background: '#1B2F1B', // Dark green background
    tint: tintColorDark,
    icon: '#81C784', // Light green icons
    tabIconDefault: '#4CAF50', // Green for unselected
    tabIconSelected: tintColorDark,
    card: '#2E3A3A', // Dark green cards
    border: '#4CAF50', // Green borders
    accent: '#81C784', // Light green for accents
    success: '#4CAF50', // Success green
    warning: '#FF9800', // Orange for warnings
    error: '#F44336', // Red for errors
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
