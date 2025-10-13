import { ThemedText } from '@/components/themed-text';
import { apiService } from '@/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

// --- Kiểu dữ liệu ---
interface LeaderboardEntry {
  userName: string;
  totalCO2Emission: number;
}

// --- Component mỗi hàng ---
const LeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
  const rank = index + 1;

  const medalStyles = [
    { container: styles.rank1, color: '#FFD700' },
    { container: styles.rank2, color: '#C0C0C0' },
    { container: styles.rank3, color: '#CD7F32' },
  ];

  const { container, color } = medalStyles[rank - 1] || { container: {}, color: '#888' };

  return (
    <View style={[styles.itemContainer, container]}>
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <FontAwesome5 name="medal" size={24} color={color} />
        ) : (
          <ThemedText style={styles.rankText}>{rank}</ThemedText>
        )}
      </View>
      <View style={styles.userInfo}>
        <ThemedText style={styles.userName}>{item.userName}</ThemedText>
      </View>
      <View style={styles.emissionContainer}>
        <ThemedText style={styles.emissionValue}>
          {item.totalCO2Emission.toFixed(2)}
        </ThemedText>
        <ThemedText style={styles.emissionUnit}> kg CO₂</ThemedText>
      </View>
    </View>
  );
};

// --- ScreenWrapper chuẩn (không ScrollView) ---
const ScreenWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[{ flex: 1, backgroundColor: '#fff' }, style]}>{children}</View>
);

// --- Màn hình Leaderboard ---
export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching leaderboard...');
      const res = await apiService.userActivities.getLeaderBoard();
      console.log('API response:', res);

      if (res.success && res.data) {
        const mappedData: LeaderboardEntry[] = res.data.map((d: any) => ({
          userName: d.userName || d.username || 'Unknown',
          totalCO2Emission: d.totalCO2Emission ?? d.co2Emission ?? 0,
        }));
        const sortedData = mappedData.sort((a, b) => b.totalCO2Emission - a.totalCO2Emission);
        setLeaderboardData(sortedData);
      } else {
        throw new Error(res.message || 'Không thể tải bảng xếp hạng.');
      }
    } catch (e: any) {
      console.log('Fetch error:', e);
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

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText>Đang tải bảng xếp hạng...</ThemedText>
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
        data={leaderboardData}
        renderItem={({ item, index }) => <LeaderboardItem item={item} index={index} />}
        keyExtractor={(item, index) => `${item.userName}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <ThemedText style={styles.title}>Bảng Xếp Hạng</ThemedText>
            <ThemedText style={styles.subtitle}>
              Những người dùng có ý thức bảo vệ môi trường nhất.
            </ThemedText>
          </>
        }
      />
    );
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return <ScreenWrapper>{renderContent()}</ScreenWrapper>;
}

// --- Styles ---
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: 'red' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rank1: { backgroundColor: '#FFFBEA', borderColor: '#FFD700', borderWidth: 1.5 },
  rank2: { backgroundColor: '#F8F9FA', borderColor: '#C0C0C0', borderWidth: 1 },
  rank3: { backgroundColor: '#FFF5E1', borderColor: '#CD7F32', borderWidth: 1 },
  rankContainer: { width: 40, alignItems: 'center', marginRight: 10 },
  rankText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  emissionContainer: { flexDirection: 'row', alignItems: 'flex-end' },
  emissionValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  emissionUnit: { fontSize: 12, color: '#4CAF50', marginLeft: 2, marginBottom: 2 },
});
