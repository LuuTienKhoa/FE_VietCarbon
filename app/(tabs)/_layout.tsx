import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ===== CONFIG =====
const BG_GRADIENT = ["#E6FCD9", "#D9FF86", "#B6FF4A"] as const; // xanh gương
const GLASS_BG = "rgba(205,245,70,0.65)"; // lớp kính mờ
const ACTIVE_CIRCLE = "rgba(182,255,74,0.55)";
const ICON_COLOR = "#111";
const BAR_HEIGHT = 72;
const RADIUS = 24;

function FloatingTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const circleSize = 46;
  const sidePad = 18;

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (barWidth === 0) return;
    const count = state.routes.length || 1;
    const innerWidth = barWidth - sidePad * 2;
    const tabW = innerWidth / count;

    const targetX = sidePad + tabW * state.index + (tabW - circleSize) / 2;

    Animated.spring(translateX, {
      toValue: targetX,
      useNativeDriver: true,
      bounciness: 10,
      speed: 18,
    }).start();
  }, [state.index, barWidth]);

  return (
    // ⛳️ KHÔNG paddingBottom ở đây (tránh “đội” bar lên)
    <View style={styles.wrap}>
      <LinearGradient
        colors={BG_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            height: BAR_HEIGHT,
            marginHorizontal: 14,
            // ⛳️ đặt bar sát đáy nhưng vẫn tôn trọng safe-area
            marginBottom: (insets.bottom || 0) + 8,
            backgroundColor: GLASS_BG,
          },
        ]}
      >
        {/* Vòng tròn highlight trượt theo icon active */}
        {barWidth > 0 && (
          <Animated.View
            style={[
              styles.activeCircle,
              {
                width: circleSize,
                height: circleSize,
                transform: [{ translateX }],
              },
            ]}
          />
        )}

        {/* Dãy icon */}
        <View style={styles.row}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () =>
              navigation.emit({ type: "tabLongPress", target: route.key });

            const icon =
              typeof options.tabBarIcon === "function"
                ? options.tabBarIcon({
                    focused: isFocused,
                    color: ICON_COLOR,
                    size: 26,
                  })
                : null;

            return (
              <View key={route.key} style={[styles.item, { flex: 1 }]}>
                <TouchableOpacity
                  onPress={onPress}
                  onLongPress={onLongPress}
                  activeOpacity={0.8}
                  style={styles.touch}
                >
                  {icon}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color ?? ICON_COLOR}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: "Thống kê",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={25}
              color={color ?? ICON_COLOR}
            />
          ),
        }}
      />
     <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Xếp hạng",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={25}
              color={color ?? ICON_COLOR}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Thử thách",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"} 
              size={25}
              color={color ?? ICON_COLOR}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={27}
              color={color ?? ICON_COLOR}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// ===== STYLE =====
const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0, // bám sát đáy
  },
  bar: {
    borderRadius: RADIUS,
    overflow: "hidden",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({
      android: { elevation: 10 },
    }),
  },
  row: { flexDirection: "row", alignItems: "center" },
  item: { alignItems: "center", justifyContent: "center" },
  touch: { paddingVertical: 6, paddingHorizontal: 10 },
  activeCircle: {
    position: "absolute",
    top: 10,
    borderRadius: 999,
    backgroundColor: ACTIVE_CIRCLE,
  },
});
