// screens/ChallengesScreen.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, Challenge } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      const res = await apiService.challenge.list();
      if (res.success && res.data) setChallenges(res.data);
      setLoading(false);
    };
    fetchChallenges();
  }, []);

  const handleComplete = async (challenge: Challenge) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const now = new Date().toISOString();

      const payload = {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        startDate: challenge.startDate ?? now,
        endDate: now,
        isComplete: true,
      };

      const res = await apiService.challenge.update(challenge.id, payload, token ?? undefined);

      if (res.success) {
        setChallenges(prev =>
          prev.map(c => (c.id === challenge.id ? { ...c, isComplete: true, endDate: now } : c))
        );
        alert(`🎉 Đã hoàn thành thử thách: ${challenge.name}`);
      } else {
        alert('Không thể cập nhật thử thách.');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi gửi yêu cầu.');
    }
  };

  // Bộ lọc theo tab
  const filteredChallenges = challenges.filter(c => {
    if (activeTab === 'active') return !c.isComplete;
    if (activeTab === 'completed') return c.isComplete;
    return true;
  });

  const completedCount = challenges.filter(c => c.isComplete).length;
  const totalCount = challenges.length;

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Đang tải thử thách...</ThemedText>
      </ThemedView>
    );
  }

  // Component hiển thị từng challenge có animation
  const ChallengeItem = ({
    item,
    index,
  }: {
    item: Challenge;
    index: number;
  }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 70, 300),
        useNativeDriver: true,
      }).start();
    }, []);

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });

    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: cardBackground,
            opacity: anim,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.header}>
          <IconSymbol
            name={item.isComplete ? 'checkmark.circle.fill' : 'trophy.fill'}
            size={28}
            color={item.isComplete ? '#4CAF50' : tintColor}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <ThemedText style={[styles.title, { color: textColor }]}>{item.name}</ThemedText>
            <ThemedText style={styles.desc}>{item.description}</ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText
            style={{
              color: item.isComplete ? '#4CAF50' : '#FF9800',
              fontWeight: '600',
            }}
          >
            {item.isComplete ? 'Hoàn thành ✅' : 'Đang thực hiện 🔄'}
          </ThemedText>

          {!item.isComplete && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleComplete(item)}
            >
              <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
                Hoàn thành
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          🎯 Thử Thách Cá Nhân
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Hoàn thành thử thách để tích điểm xanh!
        </ThemedText>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statNumber}>{totalCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Tổng thử thách</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={[styles.statNumber, { color: '#4CAF50' }]}>
              {completedCount}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Đã hoàn thành</ThemedText>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'active', label: 'Đang làm' },
          { key: 'completed', label: 'Đã xong' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: tintColor },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? '#fff' : textColor },
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách thử thách */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => <ChallengeItem item={item} index={index} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedText style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
            Không có thử thách nào ở mục này.
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { fontSize: 16, opacity: 0.7 },
  headerContainer: { padding: 20, paddingBottom: 10, paddingTop: 60,},
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  headerSubtitle: { fontSize: 15, opacity: 0.7 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 13, opacity: 0.7 },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: { fontSize: 15, fontWeight: '600' },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: 14, opacity: 0.7 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
