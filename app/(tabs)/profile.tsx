// app/(tabs)/profile.tsx
import { ScreenWrapper } from '@/components/wrapper';
import { User, apiService } from '@/services/api';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';

export default function ProfileScreen() {
  // Bảng màu xanh – môi trường
  const backgroundColor = '#e6fcd9';
  const surface = '#ffffff';
  const deepGreen = '#064e3b';
  const lime = '#b6ff4a';
  const textColor = '#0b1f17';

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ===== Lấy thông tin người dùng (giữ nguyên API) =====
  const fetchMe = useCallback(async () => {
    try {
      const res = await apiService.user.me(); // -> GET /api/User/me
      if (res?.success && res?.data) {
        setUser(res.data);
      } else {
        Alert.alert('Lỗi', res?.error || res?.message || 'Không lấy được thông tin người dùng');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không lấy được thông tin người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMe();
  }, [fetchMe]);

  const { logout: storeLogout } = useUserStore();

  const handleLogout = async () => {
    try {
      // Use centralized logout which clears both new and legacy keys and clears API token
      await storeLogout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout failed', err);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  // ==== helpers ====
  const displayName = useMemo(() => {
    if (!user) return '—';
    return user.userName || (user.email ? user.email.split('@')[0] : 'Người dùng');
  }, [user]);

  const initials = useMemo(() => {
    const s = displayName.trim();
    if (!s || s === '—') return 'N';
    const parts = s.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const userHandle =
    user?.userName ? `@${user.userName}` :
      user?.email ? `@${user.email.split('@')[0]}` : '';

  // Hiển thị gói bằng tiếng Việt
  const prettyPlan = (t: any) => {
    if (typeof t === 'number') {
      if (t === 1) return 'Cơ bản';
      if (t === 2) return 'Nâng cao';
      if (t === 3) return 'VIP';
      return `Gói ${t}`;
    }
    if (typeof t === 'string' && t.length) {
      const s = t.toLowerCase();
      if (s === 'basic') return 'Cơ bản';
      if (s === 'pro') return 'Nâng cao';
      return t; // giữ nguyên nếu backend trả tên tùy biến
    }
    return '—';
  };

  return (
    <ScreenWrapper containerStyle={{ ...styles.container, backgroundColor }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={deepGreen} />
        }
      >
        {/* PHẦN ĐẦU – phong cách “xanh” */}
        <View style={[styles.ecoHeader, { backgroundColor: '#d8f7e6' }]}>
          <View style={[styles.bubble, { top: -20, left: -30, backgroundColor: '#b7f5cf' }]} />
          <View style={[styles.bubble, { bottom: -30, right: -40, backgroundColor: '#c8ffd6' }]} />

          <View style={styles.headerRow}>
            <View style={[styles.avatarWrapper, { borderColor: lime }]}>
              <View style={[styles.avatar, { backgroundColor: deepGreen }]}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText type="title" style={[styles.name, { color: deepGreen }]}>
                {loading ? 'Đang tải…' : displayName}
              </ThemedText>
              {!!userHandle && (
                <ThemedText style={[styles.username, { color: textColor }]}>{userHandle}</ThemedText>
              )}

              {/* nhãn nhỏ */}
              <View style={styles.chipsRow}>
                <View style={[styles.chip, { backgroundColor: deepGreen, borderColor: deepGreen }]}>
                  <IconSymbol size={14} name="leaf.fill" color={lime} />
                  <ThemedText style={[styles.chipText, { color: '#fff' }]}>Thành viên xanh</ThemedText>
                </View>
                <View style={[styles.chip, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <IconSymbol size={14} name="creditcard.fill" color={deepGreen} />
                  <ThemedText style={[styles.chipText, { color: deepGreen }]}>
                    Gói: {prettyPlan((user as any)?.subscriptionType)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* THÔNG TIN TÀI KHOẢN – chỉ 4 trường yêu cầu */}
        <View style={[styles.card, { backgroundColor: surface }]}>
          <View style={styles.cardHeader}>
            <IconSymbol size={18} name="person.crop.circle" color={deepGreen} />
            <ThemedText style={[styles.cardTitle, { color: deepGreen }]}>Thông tin tài khoản</ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={deepGreen} style={{ paddingVertical: 16 }} />
          ) : (
            <View style={styles.infoList}>
              <InfoRow icon="person" label="Tên người dùng" value={user?.userName || '—'} />
              <InfoRow icon="envelope.fill" label="Email" value={user?.email || '—'} />
              <InfoRow icon="phone.fill" label="Số điện thoại" value={(user as any)?.phoneNumber || '—'} />
              <InfoRow icon="creditcard.fill" label="Gói sử dụng" value={prettyPlan((user as any)?.subscriptionType)} />
            </View>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: deepGreen }]}
              onPress={() => router.push('/vip-packages' as any)}
            >
              <IconSymbol size={18} name="sparkles" color="#fff" />
              <ThemedText style={[styles.primaryBtnText, { color: '#fff' }]}>Nâng cấp gói</ThemedText>
            </TouchableOpacity>

            
          </View>
        </View>

        {/* HÀNH ĐỘNG XANH (tuỳ chọn điều hướng) */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: deepGreen }]}>Hành động xanh</ThemedText>
        </View>
        <View style={styles.list}>
          {[
            { icon: 'leaf.fill', label: 'Lịch sử thanh toán', onPress: () => router.push('/payment/history' as any) },
            { icon: 'globe.asia.australia.fill', label: 'Bảng điều khiển carbon', onPress: () => router.push('/(tabs)/track' as any) },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={[styles.item, { backgroundColor: '#f6ffea' }]} onPress={item.onPress}>
              <IconSymbol size={22} name={item.icon as any} color={deepGreen} />
              <ThemedText style={[styles.itemLabel, { color: textColor }]}>{item.label}</ThemedText>
              <IconSymbol size={16} name="chevron.right" color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* CÀI ĐẶT & HỖ TRỢ */}
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: deepGreen }]}>Cài đặt & hỗ trợ</ThemedText>
        </View>
        <View style={styles.list}>       

          <TouchableOpacity onPress={handleLogout} style={[styles.item, styles.logoutItem]}>
            <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color="#F44336" />
            <ThemedText style={[styles.itemLabel, { color: '#F44336' }]}>Đăng xuất</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

/* ============== Thành phần dòng thông tin ============== */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <IconSymbol size={18} name={icon} color="#064e3b" />
        <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      </View>
      <ThemedText style={styles.infoValue} numberOfLines={1}>
        {String(value ?? '—')}
      </ThemedText>
    </View>
  );
}

/* ============== Styles ============== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header “xanh”
  ecoHeader: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#c7f7dc',
  },
  bubble: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 999,
    opacity: 0.55,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },

  // avatar
  avatarWrapper: {
    width: 82, height: 82, borderRadius: 41,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 5,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  name: { marginBottom: 4, fontSize: 20, fontWeight: '800' },
  username: { opacity: 0.9 },

  chipsRow: {
    marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 999, borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },

  // card
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },

  infoList: { marginTop: 4, gap: 8 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  infoLabel: { fontSize: 14, color: '#374151' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#0b1f17', maxWidth: '55%', textAlign: 'right' },

  cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '800' },
  secondaryBtn: {
    height: 44, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.2,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800' },

  // section
  sectionHeader: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },

  // list
  list: { paddingHorizontal: 12, paddingBottom: 28, gap: 10, marginTop: 8 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e9f7ed',
  },
  itemLabel: { fontSize: 16, fontWeight: '700', flex: 1 },
  logoutItem: { backgroundColor: '#F4433611', borderWidth: 1, borderColor: '#F44336' },
});
