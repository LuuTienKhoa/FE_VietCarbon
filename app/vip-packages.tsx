// app/vip-packages.tsx (ví dụ đường dẫn)
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { upgrade } from '../services/userApi';

type PlanCode = 1 | 2;
type PlanItem = { plan: PlanCode; label: string; amount: number; subtitle: string };

const PLANS: readonly PlanItem[] = [
  { plan: 1, label: 'VIP Cơ Bản', amount: 25000, subtitle: '1 tháng' },
  { plan: 2, label: 'VIP Cao Cấp', amount: 50000, subtitle: '1 tháng' },
];

export default function VipPackages() {
  const { width } = useWindowDimensions();
  const [isPaying, setIsPaying] = useState<PlanCode | null>(null);

  // ===== Responsive hero sizing =====
  const base = Math.min(Math.max(width * 0.17, 44), 64);
  const sizeTop = base * 0.85;
  const sizeMid = base * 1.05;
  const sizeMain = base * 1.25;
  const lhTop = sizeTop * 0.98;
  const lhMid = sizeMid * 0.98;
  const lhMain = sizeMain * 0.98;
  const heroHeight = sizeTop + sizeMid + sizeMain + 36;

  const fmt = useMemo(() => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }), []);
  const basic = PLANS[0];
  const premium = PLANS[1];

  const onChoose = async (plan: PlanCode) => {
    if (isPaying) return;
    try {
      setIsPaying(plan);
      const returnUrl = Linking.createURL('payment/return'); // myapp://payment/return
      const cancelUrl = returnUrl; // dùng chung, màn /payment/return sẽ hiển thị thất bại nếu success=false

      const res = await upgrade(plan, returnUrl, cancelUrl);
      if (!res.success) throw new Error(res.message ?? 'Không tạo được liên kết thanh toán');

      const checkoutUrl: string | undefined = res.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Thiếu checkoutUrl');

      // Dùng AuthSession để khi PayOS redirect về returnUrl, app tự resume
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);

      // Nếu user tự đóng (không redirect), vẫn đưa về màn kết quả để FE tự gọi /Transaction/payment-return (nếu cần) hoặc hiển thị hướng dẫn
      if (result.type === 'dismiss') {
        router.push('/payment/return');
      }
    } catch (e: any) {
      console.error('upgrade error:', e?.response?.data ?? e?.message);
      Alert.alert('Thanh toán', e?.message ?? 'Có lỗi xảy ra');
    } finally {
      setIsPaying(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nâng Cấp',
          headerTitleStyle: { fontWeight: '800' },
          headerTintColor: '#0f2610',
        }}
      />
      <View style={styles.root}>
        {/* HERO */}
        <LinearGradient
          colors={['#f0ffe9', '#f6ffef']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { height: heroHeight }]}
        >
          <View style={[styles.dot, { top: 18, left: 18 }]} />
          <View style={[styles.dotLg, { top: 26, right: 24 }]} />
          <View style={[styles.dotSm, { top: heroHeight * 0.45, left: -8 }]} />
          <View style={[styles.dotSm, { top: heroHeight * 0.6, left: width * 0.25 }]} />

          <Text style={[styles.heroLayer, { fontSize: sizeTop, lineHeight: lhTop, color: '#7beb9a' }]} numberOfLines={1}>
            Plans
          </Text>
          <Text style={[styles.heroLayer, { fontSize: sizeMid, lineHeight: lhMid, color: '#3bd162', opacity: 0.9, marginTop: -6 }]} numberOfLines={1}>
            Plans
          </Text>
          <Text style={[styles.heroLayer, { fontSize: sizeMain, lineHeight: lhMain, color: '#0e2a1a', opacity: 0.65, marginTop: -6 }]} numberOfLines={1}>
            Plans
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic */}
          <Text style={styles.planTitle}>Gói cơ bản:</Text>
          <LinearGradient colors={['#ebffd9', '#efffe7']} style={styles.card}>
            <View style={styles.cardRowTop}>
              <Text style={styles.cardName}>{basic.label}</Text>
              <Text style={styles.cardBadge}>Tháng</Text>
            </View>
            <Text style={styles.cardPrice}>{fmt.format(basic.amount)}đ</Text>
            <Text style={styles.cardSub}>{basic.subtitle}</Text>

            <TouchableOpacity
              style={[styles.cta, isPaying && styles.ctaDisabled]}
              onPress={() => onChoose(basic.plan)}
              disabled={!!isPaying}
            >
              <Text style={styles.ctaText}>{isPaying === basic.plan ? 'Đang mở...' : 'Chọn gói này'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Premium */}
          <Text style={[styles.planTitle, { marginTop: 20 }]}>Gói nâng cao:</Text>
          <LinearGradient colors={['#ebffd9', '#efffe7']} style={styles.card}>
            <View style={styles.cardRowTop}>
              <Text style={styles.cardName}>{premium.label}</Text>
              <Text style={[styles.cardBadge, { backgroundColor: '#1e293b', color: '#fff' }]}>Đề xuất</Text>
            </View>
            <Text style={styles.cardPrice}>{fmt.format(premium.amount)}đ</Text>
            <Text style={styles.cardSub}>{premium.subtitle}</Text>

            <TouchableOpacity
              style={[styles.cta, isPaying && styles.ctaDisabled]}
              onPress={() => onChoose(premium.plan)}
              disabled={!!isPaying}
            >
              <Text style={styles.ctaText}>{isPaying === premium.plan ? 'Đang mở...' : 'Chọn gói này'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Year placeholder */}
          <Text style={[styles.planTitle, { marginTop: 20 }]}>Premium year:</Text>
          <LinearGradient colors={['#ebffd9', '#efffe7']} style={styles.card}>
            <View style={styles.cardRowTop}>
              <Text style={styles.cardName}>VIP Cao Cấp (năm)</Text>
              <Text style={styles.cardBadgeMuted}>Sắp ra mắt</Text>
            </View>
            <Text style={styles.cardPriceMuted}>—</Text>
            <Text style={styles.cardSub}>12 tháng</Text>

            <TouchableOpacity style={[styles.cta, styles.ctaDisabled]} disabled>
              <Text style={[styles.ctaText, { opacity: 0.6 }]}>Chưa khả dụng</Text>
            </TouchableOpacity>
          </LinearGradient>         
          
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  hero: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', paddingHorizontal: 24, paddingTop: 18 },
  heroLayer: { fontWeight: '900', letterSpacing: -0.8 },
  dot: { position: 'absolute', width: 26, height: 26, backgroundColor: '#c5ff9b', borderRadius: 20, opacity: 0.9 },
  dotLg: { position: 'absolute', width: 84, height: 84, backgroundColor: '#d9ffc2', borderRadius: 60, opacity: 0.9, right: 16 },
  dotSm: { position: 'absolute', width: 18, height: 18, backgroundColor: '#d9ffc2', borderRadius: 12, opacity: 0.9 },
  content: { padding: 16, paddingBottom: 36 },
  planTitle: { fontSize: 20, fontWeight: '900', color: '#0e2a1a', marginBottom: 8 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#d8f3c4', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 18, fontWeight: '800', color: '#0f2610' },
  cardBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#d4f4c4', color: '#0b3d0b', fontWeight: '800', overflow: 'hidden' },
  cardBadgeMuted: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: '#e9eed7', color: '#596163', fontWeight: '800', overflow: 'hidden' },
  cardPrice: { fontSize: 28, fontWeight: '900', marginTop: 6, color: '#0b3d0b' },
  cardPriceMuted: { fontSize: 28, fontWeight: '900', marginTop: 6, color: '#88908f' },
  cardSub: { fontSize: 13, opacity: 0.7, marginTop: 2 },
  cta: { marginTop: 12, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#1f2937' },
  ctaText: { color: '#fff', fontWeight: '800' },
  ctaDisabled: { backgroundColor: '#d7dde3' },
  paymentsLink: { alignSelf: 'flex-end', marginTop: 18, paddingHorizontal: 6 },
  paymentsText: { fontWeight: '900', color: '#0f2610', opacity: 0.85 },
});
