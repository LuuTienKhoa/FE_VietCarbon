// app/(tabs)/track.tsx
// Fix: donut segment vẽ đúng mọi góc; % dùng Largest-Remainder (=100);
// bỏ FlatList để tránh nested VirtualizedList; giữ đầy đủ 4 handleUpdate*

import { ThemedText } from "@/components/themed-text";
import { ScreenWrapper } from "@/components/wrapper";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";

import { apiService, User, UserActivities } from "@/services/api";
import { energyUsageApi } from "@/services/energyUsageApi";
import { foodUsageApi, UpdateFoodUsageRequest } from "@/services/foodUsageApi";
import { plasticUsageApi, UpdatePlasticUsageRequest } from "@/services/plasticUsageApi";
import { trafficUsageApi, UpdateTrafficUsageRequest } from "@/services/trafficUsageApi";

// ===== THEME
const theme = {
  green: "#1B5E20",
  green500: "#2E7D32",
  blue: "#0D47A1",
  blue500: "#1565C0",
  orange: "#E65100",
  purple: "#6A1B9A",
  bg: "#F5FFF6",
  card: "#FFFFFF",
  text: "#0A0A0A",
  muted: "#6B7280",
  ok: "#059669",
  warn: "#D97706",
  border: "#E5E7EB",
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
};

// ===== CONSTS
const FOOD_CATEGORIES = [
  { label: "Thịt Bò", value: 1 },
  { label: "Thịt Cừu", value: 2 },
  { label: "Thịt Heo", value: 3 },
  { label: "Thịt Gà", value: 4 },
  { label: "Cá", value: 5 },
  { label: "Trứng", value: 6 },
  { label: "Gạo", value: 7 },
  { label: "Rau củ", value: 8 },
  { label: "Khác", value: 9 },
];
const PLASTIC_CATEGORIES = [
  { label: "Chai nhựa", value: 1 },
  { label: "Túi nilon", value: 2 },
  { label: "Cốc nhựa", value: 3 },
  { label: "Ống hút nhựa", value: 4 },
  { label: "Hộp nhựa", value: 5 },
  { label: "Khác", value: 6 },
];

// ===== UTILS
const formatKg = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n);

const isSameDay = (a: string | Date, b: Date) => new Date(a).toDateString() === b.toDateString();
const getActivityEmission = (x: UserActivities | null) => x?.totalCO2Emission ?? 0;
const getUsageCo2 = (x?: { cO2Emission?: number } | null) => x?.cO2Emission ?? 0;

const polar = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(angle - Math.PI / 2),
  y: cy + r * Math.sin(angle - Math.PI / 2),
});

// Donut segment path: outer arc -> inner arc (ngược chiều) -> Z
function donutPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
) {
  const startOuter = polar(cx, cy, rOuter, start);
  const endOuter = polar(cx, cy, rOuter, end);
  const startInner = polar(cx, cy, rInner, end);
  const endInner = polar(cx, cy, rInner, start);
  const large = end - start > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

// Make % integers that sum to 100 (Largest-Remainder)
function distribute100(values: number[]) {
  const total = values.reduce((s, v) => s + (v || 0), 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floored = raw.map((r) => Math.floor(r));
  let rest = 100 - floored.reduce((s, v) => s + v, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - floored[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < rest; k++) floored[order[k].i]++;
  return floored;
}

function hexToRgba(hex: string, a: number): string {
  const c = hex.replace("#", "");
  const n16 = parseInt(c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c, 16);
  const r = (n16 >> 16) & 255,
    g = (n16 >> 8) & 255,
    b = n16 & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ===== SCREEN
export default function TrackScreen() {
  const tintColor = useThemeColor({}, "tint");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [todayActivity, setTodayActivity] = useState<UserActivities | null>(null);

  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  // Modals & inputs
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [newElectricity, setNewElectricity] = useState("");
  const [energyLoading, setEnergyLoading] = useState(false);

  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [trafficKm, setTrafficKm] = useState("");
  const [trafficCategory, setTrafficCategory] = useState(1);
  const [trafficLoading, setTrafficLoading] = useState(false);

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodItems, setFoodItems] = useState<{ foodCategory: number; weight: string }[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);

  const [showPlasticModal, setShowPlasticModal] = useState(false);
  const [plasticItems, setPlasticItems] = useState<{ plasticCategory: number; weight: string }[]>([]);
  const [plasticLoading, setPlasticLoading] = useState(false);

  // Fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userRes = await apiService.user.me();
      if (!userRes.success || !userRes.data) throw new Error("Không thể xác thực người dùng.");
      setCurrentUser(userRes.data);

      const act = await apiService.userActivities.getByUserId(userRes.data.id);
      if (act.success && act.data) {
        const today = new Date();
        const todayData = act.data.find((x) => x.date && isSameDay(x.date, today));
        setTodayActivity(todayData ?? null);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prefill modals
  useEffect(() => {
    if (showTrafficModal && todayActivity?.trafficUsage) {
      setTrafficKm(String(todayActivity.trafficUsage.distance ?? ""));
      setTrafficCategory(todayActivity.trafficUsage.trafficCategory ?? 1);
    }
  }, [showTrafficModal, todayActivity]);
  useEffect(() => {
    if (showFoodModal && todayActivity?.foodUsage?.foodItems) {
      const init = todayActivity.foodUsage.foodItems.map((it) => ({
        foodCategory: it.foodCategory,
        weight: String(it.weight ?? ""),
      }));
      setFoodItems(init.length ? init : [{ foodCategory: 1, weight: "" }]);
    } else if (showFoodModal) setFoodItems([{ foodCategory: 1, weight: "" }]);
  }, [showFoodModal, todayActivity]);
  useEffect(() => {
    if (showPlasticModal && todayActivity?.plasticUsage?.plasticItems) {
      const init = todayActivity.plasticUsage.plasticItems.map((it) => ({
        plasticCategory: it.plasticCategory,
        weight: String(it.weight ?? ""),
      }));
      setPlasticItems(init.length ? init : [{ plasticCategory: 1, weight: "" }]);
    } else if (showPlasticModal) setPlasticItems([{ plasticCategory: 1, weight: "" }]);
  }, [showPlasticModal, todayActivity]);

  // Derived
  const todayEmission = todayActivity ? getActivityEmission(todayActivity) : 0;
  const yesterdayEmission = (todayActivity as any)?.yesterdayTotalCO2Emission ?? undefined;
  const hasTodayData = !!todayActivity;
  const todayStr = new Date().toLocaleDateString("vi-VN");
  const userName = currentUser?.userName || "bạn";

  const usageStatsBase = useMemo(() => {
    if (!todayActivity) return [] as { key: string; type: string; emission: number; color: string; icon: any }[];
    return [
      { key: "Giao thông", type: "Giao thông", emission: getUsageCo2(todayActivity.trafficUsage), color: theme.green, icon: "bicycle-outline" as const },
      { key: "Thực phẩm", type: "Thực phẩm", emission: getUsageCo2(todayActivity.foodUsage), color: theme.blue500, icon: "fast-food-outline" as const },
      { key: "Nhựa", type: "Nhựa", emission: getUsageCo2(todayActivity.plasticUsage), color: theme.orange, icon: "refresh-outline" as const },
      { key: "Năng lượng", type: "Năng lượng", emission: getUsageCo2(todayActivity.energyUsage), color: theme.purple, icon: "flash-outline" as const },
    ];
  }, [todayActivity]);

  // % khít 100
  const pcts = useMemo(() => distribute100(usageStatsBase.map((x) => x.emission)), [usageStatsBase]);

  const enhancedStats = useMemo(() => {
    const total = usageStatsBase.reduce((s, x) => s + x.emission, 0);
    const max = usageStatsBase.reduce((a, b) => (a.emission >= b.emission ? a : b), { key: "", emission: -1 } as any).key;
    return usageStatsBase.map((x, i) => ({
      ...x,
      pct: pcts[i],
      isMain: total > 0 && x.key === max,
    }));
  }, [usageStatsBase, pcts]);

  const onSlicePress = useCallback((key: string) => setHighlightKey((p) => (p === key ? null : key)), []);
  const onLegendToggle = useCallback((key: string) => setHighlightKey((p) => (p === key ? null : key)), []);

  // Micro-interactions
  const legendScalesRef = useRef<Record<string, Animated.Value>>({}).current;
  const getLegendScale = (k: string) => (legendScalesRef[k] ??= new Animated.Value(1));
  const pressInLegend = (k: string) =>
    Animated.timing(getLegendScale(k), { toValue: 0.97, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const pressOutLegend = (k: string) =>
    Animated.timing(getLegendScale(k), { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();

  const catScalesRef = useRef<Record<string, Animated.Value>>({}).current;
  const getCatScale = (k: string) => (catScalesRef[k] ??= new Animated.Value(1));
  const pressInCat = (k: string) =>
    Animated.timing(getCatScale(k), { toValue: 0.97, duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const pressOutCat = (k: string) =>
    Animated.timing(getCatScale(k), { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();

  // Tips
  const tips = useMemo(() => {
    const main = enhancedStats.find((x) => x.isMain)?.key;
    switch (main) {
      case "Giao thông": return "Gợi ý: Đi bộ/xe đạp cho quãng đường < 2km; gom việc để giảm số chuyến.";
      case "Thực phẩm": return "Gợi ý: Giảm thịt đỏ 1–2 bữa/tuần; ưu tiên rau/củ/quả, gà/cá.";
      case "Nhựa": return "Gợi ý: Mang bình nước cá nhân; tái sử dụng hộp; hạn chế đồ dùng một lần.";
      case "Năng lượng": return "Gợi ý: Tắt thiết bị chờ; đặt điều hòa 26–27°C; thay đèn LED.";
      default: return "Ưu tiên thay đổi hạng mục có tỉ trọng lớn nhất để giảm CO₂ nhanh.";
    }
  }, [enhancedStats]);

  // ===== UPDATE HANDLERS (đủ 4 cái)
  const handleUpdateEnergy = async () => {
    if (!todayActivity?.energyUsage?.id) return Alert.alert("Lỗi", "Không tìm thấy ID năng lượng.");
    const electricity = parseFloat(newElectricity);
    if (isNaN(electricity) || electricity < 0) return Alert.alert("Lỗi", "Giá trị không hợp lệ.");
    setEnergyLoading(true);
    try {
      const res = await energyUsageApi.update(todayActivity.energyUsage.id, {
        electricityConsumption: electricity,
        cO2Emission: electricity * 0.5,
        date: new Date().toISOString(),
        activityId: todayActivity.id,
      });
      if (!res.success) throw new Error(res.message || "Cập nhật thất bại.");
      Alert.alert("Thành công", "Đã cập nhật năng lượng!");
      setShowEnergyModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setEnergyLoading(false);
    }
  };

  const handleUpdateTraffic = async () => {
    if (!todayActivity?.trafficUsage?.id) return Alert.alert("Lỗi", "Không tìm thấy ID giao thông.");
    const km = parseFloat(trafficKm);
    if (isNaN(km) || km < 0) return Alert.alert("Lỗi", "Quãng đường không hợp lệ.");
    const co2Rates: Record<number, number> = { 1: 0.045, 2: 0.102, 3: 0.041, 4: 0, 5: 0, 6: 0.225, 7: 0.23 };
    setTrafficLoading(true);
    try {
      const payload: UpdateTrafficUsageRequest = {
        id: todayActivity.trafficUsage.id,
        distance: km,
        trafficCategory,
        cO2Emission: km * (co2Rates[trafficCategory] ?? 0),
        date: new Date().toISOString(),
        activityId: todayActivity.id,
      };
      const res = await trafficUsageApi.update(todayActivity.trafficUsage.id, payload);
      if (!res.success) throw new Error(res.message || "Cập nhật thất bại.");
      Alert.alert("Thành công", "Đã cập nhật giao thông!");
      setShowTrafficModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setTrafficLoading(false);
    }
  };

  const handleUpdateFood = async () => {
    if (!todayActivity?.foodUsage?.id) return Alert.alert("Lỗi", "Không tìm thấy ID thực phẩm.");
    const items = foodItems
      .map((it) => ({ foodCategory: it.foodCategory, weight: parseFloat(it.weight) }))
      .filter((it) => !isNaN(it.weight) && it.weight > 0);
    if (!items.length) return Alert.alert("Lỗi", "Vui lòng nhập ít nhất một loại thực phẩm hợp lệ.");
    setFoodLoading(true);
    try {
      const payload: UpdateFoodUsageRequest = {
        id: todayActivity.foodUsage.id,
        activityId: todayActivity.id,
        date: new Date().toISOString(),
        foodItems: items,
      };
      const res = await foodUsageApi.update(todayActivity.foodUsage.id, payload);
      if (!res.success) throw new Error(res.message || "Cập nhật thất bại.");
      Alert.alert("Thành công", "Đã cập nhật thực phẩm!");
      setShowFoodModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setFoodLoading(false);
    }
  };

  const handleUpdatePlastic = async () => {
    if (!todayActivity?.plasticUsage?.id) return Alert.alert("Lỗi", "Không tìm thấy ID nhựa.");
    const items = plasticItems
      .map((it) => ({ plasticCategory: it.plasticCategory, weight: parseFloat(it.weight) }))
      .filter((it) => !isNaN(it.weight) && it.weight > 0);
    if (!items.length) return Alert.alert("Lỗi", "Vui lòng nhập ít nhất một loại nhựa hợp lệ.");
    setPlasticLoading(true);
    try {
      const payload: UpdatePlasticUsageRequest = {
        id: todayActivity.plasticUsage.id,
        activityId: todayActivity.id,
        date: new Date().toISOString(),
        plasticItems: items,
      };
      const res = await plasticUsageApi.update(todayActivity.plasticUsage.id, payload);
      if (!res.success) throw new Error(res.message || "Cập nhật thất bại.");
      Alert.alert("Thành công", "Đã cập nhật nhựa!");
      setShowPlasticModal(false);
      fetchData();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message);
    } finally {
      setPlasticLoading(false);
    }
  };

  // ===== RENDER
  const renderHeader = () => (
    <View accessibilityRole="header" style={styles.header}>
      <View style={styles.headerAvatar} />
      <View style={styles.headerTextContainer}>
        <Text style={styles.helloText}>Xin chào, {userName} 👋</Text>
        <Text style={styles.subText}>{hasTodayData ? "Dữ liệu hôm nay đã được ghi nhận." : "Chưa có dữ liệu hôm nay."}</Text>
      </View>
    </View>
  );

  const renderTotal = () => {
    const delta = yesterdayEmission && yesterdayEmission > 0 ? ((todayEmission - yesterdayEmission) / yesterdayEmission) * 100 : 0;
    const isUp = delta > 0;
    return (
      <View accessibilityRole="summary" style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalTitle}>Tổng CO₂ hôm nay ({todayStr})</Text>
          <View style={[styles.deltaBadge, isUp ? styles.deltaUp : styles.deltaDown]}>
            <Ionicons name={isUp ? "trending-up" : "trending-down"} size={16} color={isUp ? theme.warn : theme.ok} />
            <Text style={[styles.deltaText, { color: isUp ? theme.warn : theme.ok }]}>{isUp ? "+" : "-"}{Math.abs(delta).toFixed(0)}%</Text>
          </View>
        </View>
        <View style={styles.co2Row}>
          <Ionicons name="cloud-outline" size={36} color={theme.green} style={{ marginRight: 6 }} />
          <Text style={styles.co2Value} numberOfLines={1}>{formatKg(todayEmission)}</Text>
          <Text style={styles.co2Unit}>kg</Text>
        </View>
      </View>
    );
  };

  const renderPie = () => {
    const values = enhancedStats.map((x) => x.emission);
    const colors = enhancedStats.map((x) => x.color);
    const keys = enhancedStats.map((x) => x.key);
    const size = 240,
      cx = size / 2,
      cy = size / 2,
      rOuter = 110,
      rInner = 65;

    const total = values.reduce((s, v) => s + v, 0);
    if (total <= 0) {
      // Không có dữ liệu → vẽ vòng xám placeholder
      return (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Phân bố theo hạng mục</Text>
          <View style={styles.chartWrap}>
            <Svg width={size} height={size}>
              <Path
                d={donutPath(cx, cy, rOuter, rInner, 0, Math.PI * 2)}
                fill={hexToRgba("#94A3B8", 0.25)}
              />
            </Svg>
          </View>
        </View>
      );
    }

    // gom góc + chốt lát cuối để tránh hở do sai số
    let cursor = -Math.PI / 2;
    const rawAngles = values.map((v) => (v / total) * Math.PI * 2);
    const sumAngles = rawAngles.reduce((s, a) => s + a, 0);
    rawAngles[rawAngles.length - 1] += Math.PI * 2 - sumAngles; // chốt 2π

    const slices = rawAngles.map((angle, i) => {
      const start = cursor;
      const end = start + angle;
      cursor = end;
      return { start, end, color: colors[i], key: keys[i] };
    });

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Phân bố theo hạng mục</Text>
        <View style={styles.chartWrap}>
          <Svg width={size} height={size}>
            <G>
              {slices.map((s) => {
                const active = !highlightKey || highlightKey === s.key;
                return (
                  <Path
                    key={s.key}
                    d={donutPath(cx, cy, rOuter, rInner, s.start, s.end)}
                    fill={s.color}
                    opacity={active ? 1 : 0.18}
                    onPress={() => onSlicePress(s.key)}
                  />
                );
              })}
            </G>
          </Svg>

          <View style={styles.legend} accessibilityRole="radiogroup">
            {enhancedStats.map((d) => {
              const scale = getLegendScale(d.key);
              return (
                <Animated.View key={d.key} style={{ transform: [{ scale }] }}>
                  <Pressable
                    onPressIn={() => pressInLegend(d.key)}
                    onPressOut={() => pressOutLegend(d.key)}
                    onPress={() => onLegendToggle(d.key)}
                    style={[styles.legendBtn, { borderColor: theme.border }]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: !highlightKey || highlightKey === d.key }}
                    accessibilityLabel={`Bật/tắt ${d.key}, chiếm ${d.pct}%`}
                  >
                    <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                    <Text style={styles.legendText} numberOfLines={1}>{d.key}</Text>
                    <Text style={styles.legendPct}>{d.pct}%</Text>
                    {d.isMain ? (
                      <View style={styles.badgeMain}><Text style={styles.badgeMainText}>Chủ yếu</Text></View>
                    ) : null}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderCategories = () => (
    <>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Phát thải chi tiết</Text>
      <View style={styles.catGrid}>
        {enhancedStats.map((item) => {
          const scale = getCatScale(item.key);
          return (
            <Animated.View key={item.key} style={[styles.catCard, theme.shadow, { transform: [{ scale }] }]}>
              <Pressable
                onPressIn={() => pressInCat(item.key)}
                onPressOut={() => pressOutCat(item.key)}
                onPress={() => {
                  if (item.key === "Năng lượng") setShowEnergyModal(true);
                  if (item.key === "Giao thông") setShowTrafficModal(true);
                  if (item.key === "Thực phẩm") setShowFoodModal(true);
                  if (item.key === "Nhựa") setShowPlasticModal(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${item.type}: ${formatKg(item.emission)} kg CO₂, chiếm ${item.pct}%`}
                style={{ flex: 1 }}
              >
                <View style={styles.catTopRow}>
                  <View style={[styles.badge, { backgroundColor: hexToRgba(item.color, 0.12) }]}>
                    <Text style={[styles.badgeText, { color: item.color }]} numberOfLines={1}>{item.type}</Text>
                  </View>
                  {item.isMain ? <View style={[styles.badgeMain, { marginLeft: 6 }]}><Text style={styles.badgeMainText}>Chủ yếu</Text></View> : null}
                </View>

                <View style={styles.catValueRow}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                  <Text style={styles.catValue} numberOfLines={1}>{formatKg(item.emission)}</Text>
                  <Text style={styles.catUnit} numberOfLines={1}>kg CO₂</Text>
                </View>

                <View style={styles.progress} accessible accessibilityLabel={`Tiến độ: ${item.pct}%`}>
                  <View style={[styles.progressFill, { width: `${Math.max(item.pct, 4)}%`, backgroundColor: item.color }]} />
                </View>

                <Text style={styles.catPct} numberOfLines={1}>{item.pct}% tổng phát thải</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </>
  );

  const renderCTA = () => (
    <View style={[styles.cta, theme.shadow]}>
      <Text style={styles.ctaTitle}>Gợi ý hành động</Text>
      <Text style={styles.ctaText}>{tips}</Text>
    </View>
  );

  return (
    <ScreenWrapper
      scroll
      containerStyle={{ backgroundColor: theme.bg }}
      contentContainerStyle={styles.contentContainer}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText>Đang tải dữ liệu...</ThemedText>
        </View>
      ) : !hasTodayData ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Chưa có dữ liệu hôm nay.</Text>
          <TouchableOpacity
            style={styles.measureButton}
            accessibilityRole="button"
            accessibilityLabel="Nhập dữ liệu hôm nay"
            onPress={() => router.push("/measure")}
          >
            <Text style={styles.measureButtonText}>Nhập dữ liệu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderHeader()}
          {renderTotal()}
          {renderPie()}
          {renderCategories()}
          {renderCTA()}

          {/* ===== MODALS (giữ nguyên logic) ===== */}
          {/* ENERGY */}
          <Modal visible={showEnergyModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cập nhật điện năng (kWh)</Text>
                <TextInput placeholder="Nhập số điện năng tiêu thụ..." keyboardType="numeric" value={newElectricity} onChangeText={setNewElectricity} style={styles.input} editable={!energyLoading} />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowEnergyModal(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}><Text>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateEnergy} style={[styles.modalBtn, { backgroundColor: theme.green500 }]}>{energyLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Lưu</Text>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* TRAFFIC */}
          <Modal visible={showTrafficModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cập nhật giao thông</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={trafficCategory} onValueChange={setTrafficCategory}>
                    <Picker.Item label="Ô tô xăng" value={1} />
                    <Picker.Item label="Xe buýt" value={2} />
                    <Picker.Item label="Tàu hỏa" value={3} />
                    <Picker.Item label="Xe đạp" value={4} />
                    <Picker.Item label="Đi bộ" value={5} />
                    <Picker.Item label="Máy bay" value={6} />
                    <Picker.Item label="Ô tô dầu" value={7} />
                  </Picker>
                </View>
                <TextInput placeholder="Nhập quãng đường (km)..." keyboardType="numeric" value={trafficKm} onChangeText={setTrafficKm} style={styles.input} editable={!trafficLoading} />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowTrafficModal(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}><Text>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateTraffic} style={[styles.modalBtn, { backgroundColor: theme.green500 }]}>{trafficLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Lưu</Text>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* FOOD */}
          <Modal visible={showFoodModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cập nhật thực phẩm (gram)</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {foodItems.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemPickerContainer}>
                        <Picker selectedValue={item.foodCategory} onValueChange={(val) => setFoodItems((arr) => arr.map((it, i) => (i === index ? { ...it, foodCategory: val } : it)))}>
                          {FOOD_CATEGORIES.map((cat) => <Picker.Item key={cat.value} label={cat.label} value={cat.value} />)}
                        </Picker>
                      </View>
                      <TextInput placeholder="g" keyboardType="numeric" value={item.weight} onChangeText={(t) => setFoodItems((arr) => arr.map((it, i) => (i === index ? { ...it, weight: t } : it)))} style={styles.itemWeightInput} editable={!foodLoading} />
                      <TouchableOpacity onPress={() => foodItems.length > 1 && setFoodItems((arr) => arr.filter((_, i) => i !== index))} style={styles.removeButton}>
                        <Ionicons name="trash-bin-outline" size={22} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setFoodItems((arr) => [...arr, { foodCategory: 1, weight: "" }])} style={styles.addButton}>
                  <Ionicons name="add-circle-outline" size={24} color={theme.green500} />
                  <Text style={styles.addButtonText}>Thêm món</Text>
                </TouchableOpacity>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowFoodModal(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}><Text>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateFood} style={[styles.modalBtn, { backgroundColor: theme.green500 }]}>{foodLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Lưu</Text>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* PLASTIC */}
          <Modal visible={showPlasticModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cập nhật nhựa (gram)</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {plasticItems.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemPickerContainer}>
                        <Picker selectedValue={item.plasticCategory} onValueChange={(val) => setPlasticItems((arr) => arr.map((it, i) => (i === index ? { ...it, plasticCategory: val } : it)))}>
                          {PLASTIC_CATEGORIES.map((cat) => <Picker.Item key={cat.value} label={cat.label} value={cat.value} />)}
                        </Picker>
                      </View>
                      <TextInput placeholder="g" keyboardType="numeric" value={item.weight} onChangeText={(t) => setPlasticItems((arr) => arr.map((it, i) => (i === index ? { ...it, weight: t } : it)))} style={styles.itemWeightInput} editable={!plasticLoading} />
                      <TouchableOpacity onPress={() => plasticItems.length > 1 && setPlasticItems((arr) => arr.filter((_, i) => i !== index))} style={styles.removeButton}>
                        <Ionicons name="trash-bin-outline" size={22} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setPlasticItems((arr) => [...arr, { plasticCategory: 1, weight: "" }])} style={styles.addButton}>
                  <Ionicons name="add-circle-outline" size={24} color={theme.green500} />
                  <Text style={styles.addButtonText}>Thêm loại nhựa</Text>
                </TouchableOpacity>
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowPlasticModal(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}><Text>Hủy</Text></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdatePlastic} style={[styles.modalBtn, { backgroundColor: theme.green500 }]}>{plasticLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Lưu</Text>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </>
      )}
    </ScreenWrapper>
  );
}

// ===== STYLES
const styles = StyleSheet.create({
  contentContainer: { padding: 16, paddingBottom: 40, maxWidth: 480, alignSelf: "center", width: "100%" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  noDataContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  noDataText: { fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 10 },
  measureButton: { marginTop: 20, paddingVertical: 16, paddingHorizontal: 32, backgroundColor: theme.green500, borderRadius: 30 },
  measureButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingTop: 6 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#D1D5DB" },
  headerTextContainer: { flex: 1, marginLeft: 12, minWidth: 0 },
  helloText: { fontSize: 18, fontWeight: "800", color: theme.text },
  subText: { fontSize: 14, color: theme.muted },

  totalCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, ...theme.shadow },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalTitle: { fontSize: 16, fontWeight: "800", color: theme.text, flexShrink: 1, minWidth: 0, marginRight: 8 },
  deltaBadge: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, minHeight: 44, borderRadius: 999, borderWidth: 1, borderColor: theme.border, backgroundColor: "#fff", gap: 6 },
  deltaText: { fontSize: 13, fontWeight: "800" },
  deltaUp: { backgroundColor: "#FFF7ED" },
  deltaDown: { backgroundColor: "#ECFDF5" },
  co2Row: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  co2Value: { fontSize: 42, fontWeight: "900", color: theme.text, letterSpacing: 0.3, maxWidth: "70%" },
  co2Unit: { fontSize: 18, fontWeight: "800", color: theme.muted, marginBottom: 6, marginLeft: 4 },

  chartCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, ...theme.shadow, marginTop: 10 },
  chartTitle: { fontSize: 16, fontWeight: "800", color: theme.text, marginBottom: 8 },
  chartWrap: { alignItems: "center" },
  legend: { marginTop: 12, width: "100%", gap: 8 },
  legendBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, minHeight: 44 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendText: { fontSize: 14, fontWeight: "700", color: theme.text, minWidth: 0, flexShrink: 1 },
  legendPct: { fontSize: 14, fontWeight: "800", color: theme.text, marginLeft: "auto", marginRight: 6 },
  badgeMain: { marginLeft: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: hexToRgba(theme.green, 0.12) },
  badgeMainText: { fontSize: 12, fontWeight: "800", color: theme.green },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: theme.text, marginVertical: 12 },

  catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  catCard: { width: "48%", backgroundColor: theme.card, borderRadius: 16, padding: 12, marginBottom: 12, minHeight: 128, overflow: "hidden" },
  catTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, minHeight: 32, justifyContent: "center", maxWidth: "75%" },
  badgeText: { fontSize: 12, fontWeight: "800" },
  catValueRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  catValue: { fontSize: 20, fontWeight: "900", color: theme.text, marginLeft: 6, maxWidth: "55%" },
  catUnit: { fontSize: 12, fontWeight: "700", color: theme.muted, marginBottom: 2, marginLeft: 4 },
  progress: { height: 10, borderRadius: 6, backgroundColor: "#EEF2FF", overflow: "hidden", marginTop: 8 },
  progressFill: { height: 10, borderRadius: 6 },
  catPct: { fontSize: 12, color: theme.muted, marginTop: 6 },

  cta: { marginTop: 6, backgroundColor: theme.card, borderLeftWidth: 4, borderLeftColor: theme.green500, padding: 14, borderRadius: 12 },
  ctaTitle: { fontSize: 14, fontWeight: "800", color: theme.text, marginBottom: 4 },
  ctaText: { fontSize: 14, color: theme.text },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  modalBtn: { paddingVertical: 12, borderRadius: 12, flex: 1, marginHorizontal: 5, alignItems: "center", minHeight: 44 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 12 },

  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  itemPickerContainer: { flex: 2.6, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginRight: 8, justifyContent: "center" },
  itemWeightInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 8, textAlign: "center" },
  removeButton: { marginLeft: 8, padding: 8, minHeight: 44, justifyContent: "center" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginTop: 5, marginBottom: 15, borderWidth: 1, borderColor: theme.green500, borderStyle: "dashed", borderRadius: 10 },
  addButtonText: { marginLeft: 8, color: theme.green500, fontWeight: "bold" },
});
