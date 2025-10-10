// components/tab-layout-utils.tsx
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_HEIGHT = 72; // khớp BAR_HEIGHT ở _layout
const TAB_BAR_MARGIN = 8;

export function useTabBottomSpace(extra = 0) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + (insets.bottom || 0) + TAB_BAR_MARGIN + extra;
}

export function TabSpacer({ extra = 0 }: { extra?: number }) {
  const h = useTabBottomSpace(extra);
  return <View style={{ height: h }} />;
}
