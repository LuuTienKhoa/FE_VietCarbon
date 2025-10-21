import { ThemedText } from '@/components/themed-text';
import { apiService } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

/* ================= Types ================= */
interface LeaderboardEntry {
  userName: string;
  totalCO2Emission: number;
}

/* ============== Utils (UI only) ============== */
const getInitials = (name: string) => {
  const parts = (name || '').trim().split(/\s+/);
  if (!parts.length) return 'U';
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (a + b).toUpperCase();
};

const rankColors = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  green600: '#2E7D32',
  green700: '#1B5E20',
  blue600: '#1565C0',
  blue700: '#0D47A1',
  accent: '#FF8F00',
  text: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  card: '#FFFFFF',
  bg: '#F7FAFC',
};

/* ============== Top-3 Podium ============== */
const PodiumCard = ({
  rank,
  name,
  value,
}: {
  rank: 1 | 2 | 3;
  name: string;
  value: number;
}) => {
  const medalColor =
    rank === 1 ? rankColors.gold : rank === 2 ? rankColors.silver : rankColors.bronze;
  const radius = rank === 1 ? 56 : 48;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.podiumCard,
        rank === 1 ? styles.podium1 : rank === 2 ? styles.podium2 : styles.podium3,
        { transform: [{ scale }] },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Hạng ${rank}: ${name}, ${value.toFixed(2)} kg CO₂`}
    >
      <View style={[styles.avatar, { width: radius, height: radius, borderColor: medalColor }]}>
        <ThemedText style={styles.avatarText}>{getInitials(name)}</ThemedText>
      </View>

      <View style={{ alignItems: 'center' }}>
        <View style={styles.podiumRankWrap}>
          <FontAwesome5 name="medal" size={16} color={medalColor} />
          <ThemedText style={[styles.podiumRankText, { color: medalColor }]}>#{rank}</ThemedText>
        </View>
        <ThemedText style={styles.podiumName} numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText style={styles.podiumValue}>
          {value.toFixed(2)} <ThemedText style={styles.unit}>kg CO₂</ThemedText>
        </ThemedText>
      </View>
    </Animated.View>
  );
};

/* ============== List Item (rank >= 4) ============== */
const LeaderboardItem = ({
  item,
  rank,
  index,
  leaderMax,
}: {
  item: LeaderboardEntry;
  rank: number;
  index: number;
  leaderMax: number;
}) => {
  const medalStyles = [
    { container: styles.rank1, color: rankColors.gold },
    { container: styles.rank2, color: rankColors.silver },
    { container: styles.rank3, color: rankColors.bronze },
  ];
  const { container, color } = medalStyles[rank - 1] || { container: {}, color: '#889' };

  // press animation
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

  // progress % so với top 1
  const percent = leaderMax > 0 ? Math.min(100, Math.round((item.totalCO2Emission / leaderMax) * 100)) : 0;

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 10 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.itemContainer, container]}
        accessibilityRole="button"
        accessibilityLabel={`Hạng ${rank}: ${item.userName}, ${item.totalCO2Emission.toFixed(2)} kg CO₂`}
      >
        <View style={styles.rankBadge}>
          {rank <= 3 ? (
            <FontAwesome5 name="medal" size={20} color={color} />
          ) : (
            <ThemedText style={styles.rankText}>{rank}</ThemedText>
          )}
        </View>

        <View style={styles.userBlock}>
          <View style={styles.avatarSm}>
            <ThemedText style={styles.avatarSmText}>{getInitials(item.userName)}</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.userName} numberOfLines={1}>
              {item.userName}
            </ThemedText>
            <View style={styles.progress}>
              <View style={[styles.progressBar, { width: `${percent}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.emissionContainer}>
          <ThemedText style={styles.emissionValue}>{item.totalCO2Emission.toFixed(2)}</ThemedText>
          <ThemedText style={styles.emissionUnit}> kg CO₂</ThemedText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ============== Screen Wrapper (giữ nguyên không ScrollView) ============== */
const ScreenWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[{ flex: 1, backgroundColor: rankColors.bg }, style]}>{children}</View>
);

/* ================= Screen ================= */
export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.userActivities.getLeaderBoard();
      if (res.success && res.data) {
        const mappedData: LeaderboardEntry[] = res.data.map((d: any) => ({
          userName: d.userName || d.username || 'Unknown',
          totalCO2Emission: d.totalCO2Emission ?? d.co2Emission ?? 0,
        }));
        // GIỮ NGUYÊN logic sort hiện tại (desc)
        const sortedData = mappedData.sort(
          (a, b) => b.totalCO2Emission - a.totalCO2Emission
        );
        setLeaderboardData(sortedData);
      } else {
        throw new Error(res.message || 'Không thể tải bảng xếp hạng.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const top3 = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);
  const others = useMemo(() => leaderboardData.slice(3), [leaderboardData]);
  const leaderMax = leaderboardData[0]?.totalCO2Emission ?? 0;

  const renderHeader = () => (
    <>
      <View style={styles.hero}>
        <ThemedText style={styles.title}>Bảng Xếp Hạng</ThemedText>
        <ThemedText style={styles.subtitle}>
          Cùng thi đua bảo vệ hành tinh 🌍 — giữ streak và khoe huy hiệu!
        </ThemedText>

        {/* Podium */}
        <View style={styles.podiumRow}>
          {/* #2 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            {top3[1] ? (
              <PodiumCard rank={2} name={top3[1].userName} value={top3[1].totalCO2Emission} />
            ) : <View style={{ height: 140 }} />}
          </View>
          {/* #1 */}
          <View style={{ flex: 1.3, alignItems: 'center' }}>
            {top3[0] ? (
              <PodiumCard rank={1} name={top3[0].userName} value={top3[0].totalCO2Emission} />
            ) : <View style={{ height: 160 }} />}
          </View>
          {/* #3 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            {top3[2] ? (
              <PodiumCard rank={3} name={top3[2].userName} value={top3[2].totalCO2Emission} />
            ) : <View style={{ height: 140 }} />}
          </View>
        </View>
      </View>

      {/* Section label */}
      <View style={styles.sectionHead}>
        <ThemedText style={styles.sectionTitle}>Bảng xếp hạng chi tiết</ThemedText>
      </View>
    </>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={rankColors.green600} />
          <ThemedText style={{ marginTop: 8 }}>Đang tải bảng xếp hạng...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }

    if (leaderboardData.length === 0) {
      return (
        <View style={styles.centeredContainer}>
          <ThemedText>Chưa có dữ liệu để hiển thị.</ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={others}
        renderItem={({ item, index }) => (
          <LeaderboardItem
            item={item}
            index={index}
            rank={index + 4}   // vì others bắt đầu từ hạng 4
            leaderMax={leaderMax}
          />
        )}
        keyExtractor={(item, index) => `${item.userName}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
      />
    );
  };

  return <ScreenWrapper>{renderContent()}</ScreenWrapper>;
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  /* Page */
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#E11D48', fontWeight: '700' },

  /* Hero + Podium */
  hero: {
    backgroundColor: rankColors.card,
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: rankColors.line,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: rankColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: rankColors.muted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  podiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: rankColors.line,
    width: '90%',
  },
  podium1: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  podium2: { opacity: 0.96 },
  podium3: { opacity: 0.96 },
  podiumRankWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  podiumRankText: { fontWeight: '900' },
  podiumName: { fontSize: 14, fontWeight: '800', maxWidth: 140, textAlign: 'center' },
  podiumValue: { fontSize: 13, color: rankColors.muted, fontWeight: '700' },
  unit: { fontSize: 12, color: rankColors.muted },

  avatar: {
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { fontSize: 18, fontWeight: '900', color: rankColors.blue700 },

  /* Section label */
  sectionHead: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, backgroundColor: rankColors.bg },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: rankColors.text },

  /* List */
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8, backgroundColor: rankColors.bg },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: rankColors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: rankColors.line,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    minHeight: 64, // touch target >= 44px
  },

  // top 3 tint cho fallback (nếu có render ở list — hiện tại others chỉ >=4)
  rank1: { borderColor: rankColors.gold, backgroundColor: '#FFFBEA' },
  rank2: { borderColor: rankColors.silver, backgroundColor: '#F8FAFC' },
  rank3: { borderColor: rankColors.bronze, backgroundColor: '#FFF5E1' },

  rankBadge: { width: 40, alignItems: 'center', marginRight: 10 },
  rankText: { fontSize: 16, fontWeight: '900', color: rankColors.muted },

  userBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(21,101,192,.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarSmText: { fontSize: 12, fontWeight: '900', color: rankColors.blue700 },

  userName: { fontSize: 15, fontWeight: '800', color: rankColors.text },
  progress: {
    marginTop: 6,
    width: '100%',
    height: 8,
    backgroundColor: rankColors.line,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: rankColors.green600,
    borderRadius: 999,
  },

  emissionContainer: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 10 },
  emissionValue: { fontSize: 16, fontWeight: '900', color: rankColors.green700 },
  emissionUnit: { fontSize: 11, color: rankColors.green600, marginLeft: 3, marginBottom: 2 },
});
