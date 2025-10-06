// app/(tabs)/profile.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { userApi, type User } from '../../services/userApi';

export default function ProfileScreen() {
  const backgroundColor = '#e6fcd9';
  const tintColor = '#b6ff4a';
  const textColor = '#222';
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch /User/me khi mở màn hình
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await userApi.me(); // -> GET /api/User/me
        if (!alive) return;
        if (res?.success && res?.data) {
          setUser(res.data);
        } else {
          Alert.alert('Lỗi', res?.error || res?.message || 'Không lấy được thông tin người dùng');
        }
      } catch (e: any) {
        Alert.alert('Lỗi', e?.response?.data?.message || 'Không lấy được thông tin người dùng');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      router.replace('/login');
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  // ==== helpers ====
  const displayName = useMemo(() => {
    if (!user) return '—';
    return user.userName || (user.email ? user.email.split('@')[0] : 'User');
  }, [user]);

  const initials = useMemo(() => {
    const s = displayName.trim();
    if (!s || s === '—') return 'U';
    const parts = s.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [displayName]);

  const userHandle =
    user?.userName ? `@${user.userName}` :
      user?.email ? `@${user.email.split('@')[0]}` : '';

  const prettyRole = (r: any) => {
    if (typeof r === 'number') {
      if (r === 1) return 'User';
      if (r === 2) return 'Admin';
      if (r === 3) return 'Moderator';
      return `Role ${r}`;
    }
    if (typeof r === 'string' && r.length) return r;
    return 'User';
  };

  const prettyPlan = (t: any) => {
    if (typeof t === 'number') {
      if (t === 1) return 'Basic';
      if (t === 2) return 'Pro';
      if (t === 3) return 'VIP';
      return `Plan ${t}`;
    }
    if (typeof t === 'string' && t.length) return t;
    return '—';
  };

  const prettyDate = (d?: string | Date | null) => {
    if (!d) return '—';
    const s = typeof d === 'string' ? d : (d as Date).toString();
    // loại '-infinity' hoặc giá trị không hợp lệ
    if (s.toLowerCase().includes('infinity')) return '—';
    const dd = new Date(s);
    if (isNaN(dd.getTime())) return '—';
    const day = String(dd.getDate()).padStart(2, '0');
    const mon = String(dd.getMonth() + 1).padStart(2, '0');
    const yr = dd.getFullYear();
    return `${day}/${mon}/${yr}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* HEADER */}
      <ThemedView style={styles.header}>
        <View style={[styles.avatarWrapper, { backgroundColor: '#ffffff' }]}>
          <View style={[styles.avatar, { backgroundColor: '#222' }]}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
        </View>

        <ThemedText type="title" style={styles.name}>
          {loading ? 'Đang tải…' : displayName}
        </ThemedText>

        {!!userHandle && (
          <ThemedText style={[styles.username, { color: textColor }]}>
            {userHandle}
          </ThemedText>
        )}

        {/* chips */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: '#1f2937', borderColor: '#000' }]}>
            <IconSymbol size={14} name="checkmark.seal.fill" color={tintColor} />
            <ThemedText style={[styles.chipText, { color: '#fff' }]}>{prettyRole(user?.role)}</ThemedText>
          </View>
          <View style={[styles.chip, { backgroundColor: '#b6ff4a33', borderColor: '#b6ff4a' }]}>
            <IconSymbol size={14} name="creditcard.fill" color="#222" />
            <ThemedText style={[styles.chipText, { color: '#111' }]}>{prettyPlan((user as any)?.subscriptionType)}</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* THẺ THÔNG TIN */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Thông tin tài khoản</ThemedText>

        {loading ? (
          <ActivityIndicator size="small" color="#111" style={{ paddingVertical: 16 }} />
        ) : (
          <View style={styles.infoList}>
            <InfoRow icon="person.crop.circle" label="Username" value={user?.userName || '—'} />
            <InfoRow icon="envelope.fill" label="Email" value={user?.email || '—'} />
            <InfoRow icon="phone.fill" label="Số điện thoại" value={(user as any)?.phoneNumber || '—'} />
            <InfoRow icon="shield.fill" label="Role" value={prettyRole(user?.role)} />
            <InfoRow icon="creditcard.fill" label="Gói sử dụng" value={prettyPlan((user as any)?.subscriptionType)} />
            <InfoRow icon="calendar" label="Ngày sinh" value={prettyDate((user as any)?.dateOfBirth)} />
            <InfoRow icon="number" label="User ID" value={String((user as any)?.id ?? '—')} />
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#111' }]}
            onPress={() => router.push('/vip-packages' as any)}
          >
            <IconSymbol size={18} name="sparkles" color="#fff" />
            <ThemedText style={[styles.primaryBtnText, { color: '#fff' }]}>Nâng cấp gói</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: '#111' }]}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <IconSymbol size={18} name="pencil" color="#111" />
            <ThemedText style={[styles.secondaryBtnText, { color: '#111' }]}>Chỉnh sửa</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH HÀNH ĐỘNG */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Cài đặt & hỗ trợ</ThemedText>
      </View>

      <View style={styles.list}>
        {[
          { icon: 'gearshape.fill', label: 'Cài đặt' },
          { icon: 'questionmark.circle', label: 'Hỗ trợ' },
          { icon: 'envelope.fill', label: 'Gửi phản hồi' },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.item, { backgroundColor: '#f6ffea' }]}
            onPress={() => {}}
          >
            <IconSymbol size={22} name={item.icon as any} color={textColor} />
            <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#6b7280" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={handleLogout} style={[styles.item, styles.logoutItem]}>
          <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color="#F44336" />
          <ThemedText style={[styles.itemLabel, { color: '#F44336' }]}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ============== Sub components ============== */
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
        <IconSymbol size={18} name={icon} color="#111" />
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

  // header
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 12 },
  avatarWrapper: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#b6ff4a',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 28 },
  name: { marginTop: 14, fontSize: 22, fontWeight: '700' },
  username: { marginTop: 4, opacity: 0.8 },

  chipsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },

  // card
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
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
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  infoList: { marginTop: 4, gap: 8 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  infoLabel: { fontSize: 14, color: '#374151' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111', maxWidth: '55%', textAlign: 'right' },

  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },

  // section
  sectionHeader: { marginTop: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111' },

  // list
  list: { paddingHorizontal: 16, paddingBottom: 28, gap: 10, marginTop: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  itemLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
  logoutItem: { backgroundColor: '#F4433611', borderWidth: 1, borderColor: '#F44336' },
});
