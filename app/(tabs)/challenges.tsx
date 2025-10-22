// screens/ChallengesScreen.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScreenWrapper } from '@/components/wrapper';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, type Challenge } from '@/services/api';
import { recommendApi } from '@/services/recommendApi';
import { useActivityStore } from '@/stores/activityStore';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
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
type UiChallenge = Challenge & {
  localImage: any;
  // các field meta *tùy chọn*; chỉ hiển thị nếu API có
  rewardPoints?: number;
  estimatedMinutes?: number;
  co2SavedKg?: number;
  level?: 'Dễ' | 'Vừa' | 'Khá';
};

const REC_CACHE_KEY = 'rec:lastText';
const JOINED_KEY = 'challenge:joined:set';
const PROGRESS_KEY = 'challenge:progress:map';

/* ========= Sentinel item cho sticky controls ========= */
type ControlsRow = { __type: 'controls' };
type ListRow = ControlsRow | UiChallenge;

function isControlsRow(row: ListRow): row is ControlsRow {
  // @ts-ignore
  return !!row?.__type && row.__type === 'controls';
}

/* ========= Helpers lấy meta an toàn ========= */
const getReward = (c: any): number | undefined =>
  c?.rewardPoints ?? c?.points ?? c?.reward ?? c?.score ?? undefined;
const getMinutes = (c: any): number | undefined =>
  c?.estimatedMinutes ?? c?.durationMinutes ?? c?.minutes ?? undefined;
const getCO2 = (c: any): number | undefined => c?.co2SavedKg ?? c?.co2 ?? undefined;
const getLevel = (c: any): UiChallenge['level'] =>
  c?.level ?? c?.difficulty ?? undefined;

export default function ChallengesScreen() {
  // Challenges
  const [challenges, setChallenges] = useState<UiChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Sort (local, không đụng API)
  const [sortBy, setSortBy] = useState<'default' | 'reward' | 'duration'>('default');

  // Recommendation
  const [recLoading, setRecLoading] = useState(false);
  const [recText, setRecText] = useState('');
  const [recVisible, setRecVisible] = useState(false);

  // Detail modal (checklist)
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailChallenge, setDetailChallenge] = useState<UiChallenge | null>(null);
  const [detailChecks, setDetailChecks] = useState<boolean[]>([false, false, false]);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const DEFAULT_IMAGE = require('@/assets/images/google.png');

  // Local join/progress (không thay đổi API)
  const [joinedIds, setJoinedIds] = useState<Set<number | string>>(new Set());
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const persistLocalState = useCallback(async (nextJoined: Set<number | string>, nextProg: Record<string, number>) => {
    try {
      await AsyncStorage.setItem(JOINED_KEY, JSON.stringify(Array.from(nextJoined)));
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProg));
    } catch {}
  }, []);

  const loadLocalState = useCallback(async () => {
    try {
      const j = await AsyncStorage.getItem(JOINED_KEY);
      const p = await AsyncStorage.getItem(PROGRESS_KEY);
      if (j) setJoinedIds(new Set(JSON.parse(j)));
      if (p) setProgressMap(JSON.parse(p));
    } catch {}
  }, []);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    const res = await apiService.challenge.list();
    if (res.success && res.data) {
      const augmented: UiChallenge[] = res.data.map((c: Challenge) => ({
        ...c,
        localImage: DEFAULT_IMAGE,
        rewardPoints: getReward(c),
        estimatedMinutes: getMinutes(c),
        co2SavedKg: getCO2(c),
        level: getLevel(c),
      }));
      setChallenges(augmented);
    }
    setLoading(false);
  }, []);

  const fetchRecommendation = useCallback(async () => {
  setRecLoading(true);
  try {
    const stored = await AsyncStorage.getItem('userActivityId');
    console.debug('[challenges] AsyncStorage userActivityId raw ->', stored);

    let activityId = stored !== null ? Number(stored) : undefined;

    // Fallback: lấy từ zustand store nếu AsyncStorage chưa có
    if (activityId === undefined || Number.isNaN(activityId)) {
      const storeId = useActivityStore.getState().userActivities?.[0]?.id;
      console.debug('[challenges] fallback store userActivities[0]?.id ->', storeId);
      if (typeof storeId !== 'undefined') activityId = Number(storeId);
    }

    if (activityId === undefined || Number.isNaN(activityId)) {
      console.warn('Không có userActivityId hợp lệ');
      const cached = await AsyncStorage.getItem(REC_CACHE_KEY);
      if (cached) setRecText(cached);
      return;
    }

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
    loadLocalState();
  }, [fetchChallenges, loadLocalState]);

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
        // local: giữ progress = 100
        setProgressMap(prev => {
          const next = { ...prev, [String(challenge.id)]: 100 };
          persistLocalState(joinedIds, next);
          return next;
        });
      } else {
        alert('Không thể cập nhật thử thách.');
      }
    } catch (e) {
      console.error(e);
      alert('Đã xảy ra lỗi khi gửi yêu cầu.');
    }
  };

  // Filter theo tab
  const filteredChallenges = useMemo(() => {
    let list = challenges;
    if (activeTab === 'active') list = challenges.filter(c => !c.isComplete);
    if (activeTab === 'completed') list = challenges.filter(c => c.isComplete);
    // sort local (nếu có data)
    if (sortBy === 'reward') {
      list = [...list].sort((a, b) => (getReward(b) ?? 0) - (getReward(a) ?? 0));
    } else if (sortBy === 'duration') {
      list = [...list].sort((a, b) => (getMinutes(a) ?? 9999) - (getMinutes(b) ?? 9999));
    }
    return list;
  }, [challenges, activeTab, sortBy]);

  const completedCount = challenges.filter(c => c.isComplete).length;
  const totalCount = challenges.length;

  /* ===== Local Join/Progress helpers (không gọi API) ===== */
  const isJoined = useCallback((id: string | number) => joinedIds.has(id), [joinedIds]);
  const getProgress = useCallback((id: string | number) => progressMap[String(id)] ?? (isJoined(id) ? 10 : 0), [progressMap, joinedIds]);
  const setJoined = useCallback((id: string | number, value: boolean) => {
    setJoinedIds(prev => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      persistLocalState(next, progressMap);
      return next;
    });
  }, [persistLocalState, progressMap]);

  const setProgress = useCallback((id: string | number, value: number) => {
    setProgressMap(prev => {
      const next = { ...prev, [String(id)]: Math.max(0, Math.min(100, Math.round(value))) };
      persistLocalState(joinedIds, next);
      return next;
    });
  }, [persistLocalState, joinedIds]);

  /* ===== Sticky controls as first row in data ===== */
  const listData: ListRow[] = useMemo(() => {
    return [{ __type: 'controls' }, ...filteredChallenges];
  }, [filteredChallenges]);

  /* ======= UI Components ======= */

  const StickyControls = () => (
    <View style={[styles.stickyWrap, { backgroundColor }]}>
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

      <View style={styles.sortRow}>
        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Sắp xếp</ThemedText>
        <View style={styles.sortBtns}>
          {(['default', 'reward', 'duration'] as const).map(k => (
            <TouchableOpacity
              key={k}
              onPress={() => setSortBy(k)}
              style={[
                styles.sortChip,
                sortBy === k && { backgroundColor: '#E2F3E6', borderColor: 'transparent' },
              ]}
            >
              <ThemedText style={{ fontSize: 12 }}>
                {k === 'default' ? 'Mặc định' : k === 'reward' ? 'Điểm thưởng' : 'Thời lượng'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

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

    const joined = isJoined(item.id);
    const progress = item.isComplete ? 100 : getProgress(item.id);

    const reward = item.rewardPoints;
    const minutes = item.estimatedMinutes;
    const co2 = item.co2SavedKg;
    const level = item.level;

    return (
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardBackground, opacity: anim, transform: [{ translateY }] },
          joined && !item.isComplete ? { borderColor: '#1565C0' } : null,
          item.isComplete ? { opacity: 0.9 } : null,
        ]}
      >
        {/* Row 1: icon + title + level */}
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <IconSymbol name={item.isComplete ? 'checkmark.seal.fill' : 'leaf.fill'} size={18} color={item.isComplete ? '#2E7D32' : tintColor} />
          </View>

          <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {item.name}
          </ThemedText>

          {!!level && (
            <View style={styles.levelBadge}>
              <ThemedText style={styles.levelText}>{level}</ThemedText>
            </View>
          )}
        </View>

        {/* Row 2: desc */}
        <ThemedText style={styles.desc} numberOfLines={2}>
          {item.description}
        </ThemedText>

        {/* Row 3: meta */}
        <View style={styles.metaRow}>
          {!!minutes && <ThemedText style={styles.metaText}>⏱ {minutes}’</ThemedText>}
          {!!co2 && <ThemedText style={styles.metaText}>🌍 −{co2}kg CO₂</ThemedText>}
          {!!reward && <ThemedText style={styles.metaText}>🎖 +{reward}</ThemedText>}
        </View>

        {/* Row 4: progress (hiện khi joined hoặc đã complete) */}
        {(joined || item.isComplete) && (
          <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ now: progress, min: 0, max: 100 }}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}

        {/* Row 5: footer buttons */}
        <View style={styles.footerRow}>
          {!joined && !item.isComplete ? (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  setJoined(item.id, true);
                  setProgress(item.id, 0);
                  setDetailChallenge(item);
                  setDetailChecks([false, false, false]);
                  setDetailVisible(true);
                }}
              >
                <ThemedText style={styles.primaryBtnText}>
                  Tham gia{reward ? ` +${reward}` : ''}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => {
                  setDetailChallenge(item);
                  setDetailChecks([false, false, false]);
                  setDetailVisible(true);
                }}
              >
                <ThemedText style={styles.ghostBtnText}>Chi tiết</ThemedText>
              </TouchableOpacity>
            </>
          ) : !item.isComplete ? (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, progress < 100 && styles.disabledBtn]}
                disabled={progress < 100}
                onPress={() => handleComplete(item)}
              >
                <ThemedText style={styles.primaryBtnText}>Đánh dấu hoàn thành</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => {
                  setDetailChallenge(item);
                  // khởi tạo checklist theo progress hiện tại
                  const p = getProgress(item.id);
                  const steps = Math.round((p / 100) * 3);
                  setDetailChecks([0,1,2].map(i => i < steps));
                  setDetailVisible(true);
                }}
              >
                <ThemedText style={styles.ghostBtnText}>Chi tiết</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.completedPill}>
              <ThemedText style={styles.completedText}>Đã hoàn thành ✅</ThemedText>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  /* ===== CTA nhận gợi ý ===== */
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

  // ===== Header phần hero + stats (không sticky) =====
  const HeroHeader = () => (
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
    </View>
  );

  // ===== Modal hiển thị gợi ý =====
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

  // ===== Modal chi tiết thử thách (checklist + progress cục bộ) =====
  const DetailModal = () => {
    const c = detailChallenge;
    if (!c) return null;

    const reward = c.rewardPoints;
    const minutes = c.estimatedMinutes;
    const co2 = c.co2SavedKg;
    const level = c.level;

    const joined = isJoined(c.id);
    const progress = c.isComplete ? 100 : getProgress(c.id);
    const canComplete = progress >= 100 && !c.isComplete;

    const toggleStep = (idx: number) => {
      const next = detailChecks.map((v, i) => (i === idx ? !v : v));
      setDetailChecks(next);
      const done = next.filter(Boolean).length;
      const pct = Math.round((done / next.length) * 100);
      setProgress(c.id, pct);
    };

    return (
      <Modal visible={detailVisible} animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <View style={[styles.detailWrap, { backgroundColor }]}>
          <View style={styles.detailHeader}>
            <ThemedText style={styles.detailTitle}>{c.name}</ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {!!level && <View style={styles.levelBadge}><ThemedText style={styles.levelText}>{level}</ThemedText></View>}
              {!!reward && <View style={styles.rewardBadge}><ThemedText style={styles.rewardText}>+{reward}</ThemedText></View>}
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDetailVisible(false)}>
                <ThemedText style={styles.modalCloseBtnText}>Đóng</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
            <ThemedText style={{ opacity: 0.8 }}>{c.description}</ThemedText>

            <View style={styles.metaRow}>
              {!!minutes && <ThemedText style={styles.metaText}>⏱ {minutes}’</ThemedText>}
              {!!co2 && <ThemedText style={styles.metaText}>🌍 −{co2}kg CO₂</ThemedText>}
              {!!reward && <ThemedText style={styles.metaText}>🎖 +{reward}</ThemedText>}
            </View>

            {/* Checklist */}
            <View style={{ gap: 10 }}>
              <ThemedText style={{ fontWeight: '700' }}>Checklist</ThemedText>
              {[0,1,2].map(i => (
                <TouchableOpacity key={i} style={styles.stepRow} onPress={() => toggleStep(i)} accessibilityRole="checkbox" accessibilityState={{ checked: detailChecks[i] }}>
                  <View style={[styles.checkbox, detailChecks[i] && styles.checkboxOn]} />
                  <ThemedText style={{ flex: 1 }}>
                    {i === 0 ? 'Chọn khung giờ phù hợp' : i === 1 ? 'Thực hiện thử thách' : 'Ghi nhận kết quả'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <View style={styles.progress}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
            </View>
          </ScrollView>

          <View style={styles.detailFooter}>
            {!joined && !c.isComplete ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setJoined(c.id, true)}>
                <ThemedText style={styles.primaryBtnText}>Tham gia{reward ? ` +${reward}` : ''}</ThemedText>
              </TouchableOpacity>
            ) : !c.isComplete ? (
              <TouchableOpacity
                style={[styles.primaryBtn, progress < 100 && styles.disabledBtn]}
                disabled={!canComplete}
                onPress={() => {
                  setDetailVisible(false);
                  handleComplete(c);
                }}
              >
                <ThemedText style={styles.primaryBtnText}>Đánh dấu hoàn thành</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedPill}>
                <ThemedText style={styles.completedText}>Đã hoàn thành</ThemedText>
              </View>
            )}
          </View>
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
          data={listData}
          keyExtractor={(row, idx) => (isControlsRow(row) ? `controls` : String((row as UiChallenge).id))}
          renderItem={({ item, index }) =>
            isControlsRow(item)
              ? <StickyControls />
              : <ChallengeItem item={item as UiChallenge} index={index} />
          }
          stickyHeaderIndices={[1]} // 0 = ListHeader (hero), 1 = controls sentinel
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<HeroHeader />}
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
        <DetailModal />
      </ThemedView>
    </ScreenWrapper>
  );
}

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 16, gap: 12, paddingBottom: 32 },

  /* Hero */
  hero: { height: 120, borderRadius: 16, marginBottom: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  heroText: { position: 'absolute', fontSize: 32, fontWeight: '900', opacity: 0.18 },
  heroTextAlt: { position: 'absolute', fontSize: 32, fontWeight: '900', top: 20, opacity: 0.08 },
  heroTextAlt2: { position: 'absolute', fontSize: 32, fontWeight: '900', bottom: 20, opacity: 0.08 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  dotSm: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },

  statsContainer: {
    marginTop: 12, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 12, flexDirection: 'row', alignItems: 'center'
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  statNumber: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, opacity: 0.7 },

  /* Suggestion CTA */
  suggCTA: { borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, backgroundColor: '#fff', marginBottom: 12 },
  suggPrimaryBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 16, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  suggPrimaryBtnText: { color: '#fff', fontWeight: '800' },
  suggGhostBtn: { borderWidth: 1, borderColor: '#E2E8F0', height: 44, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  suggGhostBtnText: { fontWeight: '700' },

  /* Sticky controls */
  stickyWrap: { paddingVertical: 10, paddingHorizontal: 0, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tabButton: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 999, paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontWeight: '700' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortBtns: { flexDirection: 'row', gap: 8 },
  sortChip: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 999, paddingHorizontal: 12, height: 32, alignItems: 'center', justifyContent: 'center' },

  /* Card */
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(21,101,192,.08)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', flex: 1 },
  levelBadge: { paddingHorizontal: 10, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(46,125,50,.12)', borderWidth: 1, borderColor: 'transparent' },
  levelText: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },

  desc: { color: '#475569' },
  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: 13, color: '#475569' },

  progress: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 999, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#2E7D32' },

  footerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryBtn: { backgroundColor: '#2E7D32', borderRadius: 12, paddingHorizontal: 16, height: 48, alignItems: 'center', justifyContent: 'center', flex: 1 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  ghostBtn: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 48, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontWeight: '700' },
  disabledBtn: { backgroundColor: '#94A3B8' },

  completedPill: { paddingHorizontal: 12, height: 32, borderRadius: 999, backgroundColor: 'rgba(46,125,50,.12)', alignItems: 'center', justifyContent: 'center' },
  completedText: { color: '#2E7D32', fontWeight: '800' },

  /* Detail modal */
  detailWrap: { flex: 1 },
  detailHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  detailTitle: { fontSize: 20, fontWeight: '900' },
  rewardBadge: { paddingHorizontal: 10, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,143,0,.18)' },
  rewardText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#1565C0' },
  checkboxOn: { backgroundColor: '#1565C0' },
  detailFooter: { padding: 16, borderTopWidth: 1, borderColor: '#E2E8F0' },

  /* Rec modal */
  modalContainer: { flex: 1, paddingTop: 24, backgroundColor: '#fff' },
  modalHeader: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalBody: { padding: 16, gap: 10 },
  modalItemRow: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  modalBullet: { width: 28, height: 28, borderRadius: 999, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  modalBulletText: { fontWeight: '800' },
  modalItemTitle: { fontWeight: '800' },
  modalItemDetail: { opacity: 0.8 },
  modalGhostBtn: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center' },
  modalGhostBtnText: { fontWeight: '700' },
  modalCloseBtn: { backgroundColor: '#0D47A1', borderRadius: 10, paddingHorizontal: 12, height: 36, alignItems: 'center', justifyContent: 'center' },
  modalCloseBtnText: { color: '#fff', fontWeight: '800' },

  /* Loading */
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, opacity: 0.7 },
});
