// screens/ChallengesScreen.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenWrapper } from '@/components/wrapper';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, type Challenge } from '@/services/api';
import { recommendApi } from '@/services/recommendApi';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

/* ========= Markdown stripper + parser ========= */
const stripMarkdown = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/(\*{1,3}|_{1,3})([^*_`]+)\1/g, '$2')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^>+\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\s\*\s/g, ' ')
    .trim();

type RecItem = { title: string; detail: string };

const parseRecommendation = (text: string): RecItem[] => {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const bulletLike = lines.filter(l => /^(\d+\.\s*|[-*+]\s+)/.test(l));
  const src = bulletLike.length ? bulletLike : lines;

  const items = src
    .map(l => {
      const noBullet = l.replace(/^(\d+\.\s*|[-*+]\s+)/, '');
      const m = noBullet.match(/\*\*(.+?)\*\*[:：]?\s*(.*)/);
      const title = stripMarkdown(m ? m[1] : noBullet);
      const detail = stripMarkdown(m ? m[2] : '');
      const isGeneric = /here'?s\s+concise|overall advice|summary/i.test(title);
      if (isGeneric && !detail) return null;
      return { title, detail };
    })
    .filter(Boolean) as RecItem[];

  return items.slice(0, 12);
};

/* ========= Kiểu UI cho Challenge ========= */
type UiChallenge = Challenge & { localImage: any };

const REC_CACHE_KEY = 'rec:lastText';

export default function ChallengesScreen() {
  // Challenges
  const [challenges, setChallenges] = useState<UiChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Recommendation
  const [recLoading, setRecLoading] = useState(false);
  const [recText, setRecText] = useState('');
  const [recVisible, setRecVisible] = useState(false);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const DEFAULT_IMAGE = require('@/assets/images/google.png');

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    const res = await apiService.challenge.list();
    if (res.success && res.data) {
      const augmented: UiChallenge[] = res.data.map((c: Challenge) => ({
        ...c,
        localImage: DEFAULT_IMAGE,
      }));
      setChallenges(augmented);
    }
    setLoading(false);
  }, []);

  // ⚠️ Không auto fetch recommendation khi vào trang
  const fetchRecommendation = useCallback(async () => {
    setRecLoading(true);
    try {
      const stored = await AsyncStorage.getItem('userActivityId');
      const activityId = stored || '4';
      const res = await recommendApi.getByUserActivityId(activityId);
      if (res.success && res.data) {
        setRecText(res.data.recommendation);
        await AsyncStorage.setItem(REC_CACHE_KEY, res.data.recommendation);
      }
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleComplete = async (challenge: UiChallenge) => {
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
          prev.map(c => (c.id === challenge.id ? { ...c, isComplete: true, endDate: now } : c)),
        );
      } else {
        alert('Không thể cập nhật thử thách.');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi khi gửi yêu cầu.');
    }
  };

  const filteredChallenges = useMemo(() => {
    if (activeTab === 'active') return challenges.filter(c => !c.isComplete);
    if (activeTab === 'completed') return challenges.filter(c => c.isComplete);
    return challenges;
  }, [challenges, activeTab]);

  const completedCount = challenges.filter(c => c.isComplete).length;
  const totalCount = challenges.length;

  const ChallengeItem = ({ item, index }: { item: UiChallenge; index: number }) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 420,
        delay: Math.min(index * 90, 360),
        useNativeDriver: true,
      }).start();
    }, []);
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

    return (
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardBackground, opacity: anim, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image source={item.localImage} style={styles.image} resizeMode="cover" />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isComplete ? '#2e7d32' : tintColor },
            ]}
          >
            <ThemedText style={styles.badgeText}>
              {item.isComplete ? 'Đã xong' : 'Đang làm'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <IconSymbol
              name={item.isComplete ? 'checkmark.seal.fill' : 'trophy.fill'}
              size={20}
              color={item.isComplete ? '#2e7d32' : tintColor}
            />
          </View>

          <ThemedText style={styles.desc} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={styles.footer}>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              {item.isComplete ? 'Hoàn thành ✅' : 'Thử thách đang diễn ra 🔄'}
            </ThemedText>

            {!item.isComplete ? (
              <TouchableOpacity style={styles.completeButton} onPress={() => handleComplete(item)}>
                <ThemedText style={styles.completeText}>Hoàn thành</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedPill}>
                <ThemedText style={styles.completedText}>Đã hoàn thành</ThemedText>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  /* ===== CTA nhận gợi ý: nhấn mới gọi API / mở modal ===== */
  const SuggestionCTA = () => {
    return (
      <View style={styles.suggCTA}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconSymbol name="lightbulb.fill" size={16} color="#111" />
          <ThemedText style={{ fontWeight: '900' }}>Gợi ý cho hôm nay</ThemedText>
        </View>
        <ThemedText style={{ opacity: 0.7, marginTop: 6 }}>
          Nhấn để xem gợi ý tối ưu theo hoạt động gần đây.
        </ThemedText>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <TouchableOpacity
            style={styles.suggPrimaryBtn}
            onPress={async () => {
              // mở modal trước, load cache rồi mới gọi API nếu cần
              setRecVisible(true);
              if (!recText) {
                const cached = await AsyncStorage.getItem(REC_CACHE_KEY);
                if (cached) {
                  setRecText(cached);
                } else {
                  await fetchRecommendation();
                }
              }
            }}
          >
            <ThemedText style={styles.suggPrimaryBtnText}>
              Nhận gợi ý
            </ThemedText>
          </TouchableOpacity>

          {!!recText && (
            <TouchableOpacity
              style={styles.suggGhostBtn}
              onPress={() => setRecVisible(true)}
            >
              <ThemedText style={styles.suggGhostBtnText}>Xem lại</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ===== Header giống figma (chữ Challenge to, không bị che) =====
  const ListHeader = () => (
    <View>
      <View style={[styles.hero, { backgroundColor }]}>
        <View style={[styles.dot, { top: 16, left: 22 }]} />
        <View style={[styles.dot, { top: 42, right: 24 }]} />
        <View style={[styles.dotSm, { bottom: 26, left: 30 }]} />
        <View style={[styles.dotSm, { bottom: 22, right: 44 }]} />

        <ThemedText style={[styles.heroText, { color: textColor }]}>Challenge</ThemedText>
        <ThemedText style={[styles.heroTextAlt, { color: textColor }]}>Challenge</ThemedText>
        <ThemedText style={[styles.heroTextAlt2, { color: textColor }]}>Challenge</ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <ThemedText style={styles.statNumber}>{totalCount}</ThemedText>
          <ThemedText style={styles.statLabel}>Tổng thử thách</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <ThemedText style={[styles.statNumber, { color: '#2e7d32' }]}>
            {completedCount}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Đã hoàn thành</ThemedText>
        </View>
      </View>

      <SuggestionCTA />

      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'active', label: 'Đang làm' },
          { key: 'completed', label: 'Đã xong' },
        ].map(tab => {
          const selected = activeTab === (tab.key as any);
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[
                styles.tabButton,
                selected && { backgroundColor: tintColor, borderColor: 'transparent' },
              ]}
            >
              <ThemedText style={[styles.tabText, { color: selected ? '#fff' : textColor }]}>
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ===== Modal hiển thị gợi ý: font to, không cắt nội dung =====
  const RecommendationsModal = () => {
    const items = parseRecommendation(recText);

    return (
      <Modal visible={recVisible} animationType="slide" onRequestClose={() => setRecVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="lightbulb.fill" size={18} color="#111" />
              <ThemedText style={styles.modalTitle}>Gợi ý cho hôm nay</ThemedText>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.modalGhostBtn} onPress={fetchRecommendation}>
                {recLoading ? (
                  <ActivityIndicator />
                ) : (
                  <ThemedText style={styles.modalGhostBtnText}>Làm mới</ThemedText>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRecVisible(false)}>
                <ThemedText style={styles.modalCloseBtnText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {recLoading && !recText ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" />
                <ThemedText style={{ marginTop: 10, opacity: 0.7 }}>Đang lấy gợi ý…</ThemedText>
              </View>
            ) : items.length ? (
              items.map((it, idx) => (
                <View key={idx} style={styles.modalItemRow}>
                  <View style={styles.modalBullet}>
                    <ThemedText style={styles.modalBulletText}>{idx + 1}</ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.modalItemTitle}>{it.title}</ThemedText>
                    {!!it.detail && (
                      <ThemedText style={styles.modalItemDetail}>{it.detail}</ThemedText>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <ThemedText>Chưa có gợi ý. Nhấn “Làm mới”.</ThemedText>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Render
  if (loading) {
    return (
      <ScreenWrapper scroll={false}>
        <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Đang tải thử thách...</ThemedText>
        </ThemedView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <FlatList
          data={filteredChallenges}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => <ChallengeItem item={item} index={index} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', marginTop: 40, opacity: 0.6 }}>
              Không có thử thách nào ở mục này.
            </ThemedText>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchChallenges();
                setRefreshing(false);
              }}
            />
          }
        />
        <RecommendationsModal />
      </ThemedView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 16, paddingTop: 0 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, opacity: 0.7 },

  // ===== Hero giống figma (to + không bị cắt) =====
  hero: {
    height: 220, // tăng chiều cao để chữ lớn không bị cắt
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  // chữ to dần & chồng lên nhau
  heroText: { fontSize: 72, fontWeight: '900', opacity: 0.28, lineHeight: 70, letterSpacing: -0.5 },
  heroTextAlt: { fontSize: 64, fontWeight: '900', opacity: 0.36, lineHeight: 60, marginTop: -6, letterSpacing: -0.5 },
  heroTextAlt2: { fontSize: 56, fontWeight: '900', opacity: 0.5, lineHeight: 54, marginTop: -6, letterSpacing: -0.5 },

  dot: { position: 'absolute', width: 40, height: 40, backgroundColor: '#c5ff9b', borderRadius: 24, opacity: 0.75 },
  dotSm: { position: 'absolute', width: 22, height: 22, backgroundColor: '#d6ffc0', borderRadius: 14, opacity: 0.9 },

  statsContainer: {
    marginTop: 8,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#e8ffe0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: '#cfeec7', opacity: 0.9 },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  tabContainer: { flexDirection: 'row', gap: 8, marginTop: 12, marginHorizontal: 16, marginBottom: 8 },
  tabButton: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#d6e6d1',
  },
  tabText: { fontSize: 14, fontWeight: '700' },

  card: {
    borderRadius: 16, marginTop: 12, overflow: 'hidden',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  },
  imageWrap: { width: '100%', height: 170, overflow: 'hidden', backgroundColor: '#f1f5f2' },
  image: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', right: 12, top: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  cardBody: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  desc: { fontSize: 13, opacity: 0.7, marginTop: 6 },

  footer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completeButton: { backgroundColor: '#2e7d32', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  completeText: { color: '#fff', fontWeight: '800' },
  completedPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#e7f6ea' },
  completedText: { fontWeight: '800', color: '#2e7d32' },

  // ===== CTA gợi ý =====
  suggCTA: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F0FFE8',
    borderWidth: 1,
    borderColor: '#D9F5CC',
  },
  suggPrimaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    alignItems: 'center',
    flexGrow: 1,
  },
  suggPrimaryBtnText: { color: '#fff', fontWeight: '800' },
  suggGhostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  suggGhostBtnText: { fontWeight: '800', color: '#1f2937' },

  // ===== Modal gợi ý (font to, có cuộn) =====
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalCloseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1f2937',
  },
  modalCloseBtnText: { color: '#fff', fontWeight: '800' },
  modalGhostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  modalGhostBtnText: { fontWeight: '800', color: '#1f2937' },
  modalBody: { padding: 16, paddingBottom: 40 },
  modalItemRow: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  modalBullet: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#b9f3a3',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  modalBulletText: { fontWeight: '900', fontSize: 13, color: '#0b3d0b' },
  modalItemTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4, color: '#0f2610' }, // font to
  modalItemDetail: { fontSize: 15, opacity: 0.8, lineHeight: 22 }, // font to + không giới hạn dòng
});
