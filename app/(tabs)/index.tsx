import { ScreenWrapper } from "@/components/wrapper";
import { challengeApi, type Challenge } from "@/services/challengeApi";
import {
  userActivitiesApi,
  type UserActivities,
} from "@/services/userActivitiesApi";
import { userApi, type User } from "@/services/userApi";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const colors = {
  pageBg: "#FFFFFF",
  gradStart: "#D5F1D3",
  gradEnd: "#F2F9D8",
  text: "#111111",
  subText: "#6B7280",
  line: "#E6EDE1",
  accent: "#b6ff4a",
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const formatRange = (start?: string, end?: string | null) =>
  start ? `${formatDate(start)} → ${end ? formatDate(end) : "Đang diễn ra"}` : "";

const isSameDay = (a: string | Date, b: Date) => {
  const da = typeof a === "string" ? new Date(a) : a;
  return (
    da.getFullYear() === b.getFullYear() &&
    da.getMonth() === b.getMonth() &&
    da.getDate() === b.getDate()
  );
};
const getActivityEmission = (x: any): number =>
  Number(x?.totalCO2Emission ?? x?.totalEmission ?? x?.co2Emission ?? 0) || 0;

const GradCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => (
  <LinearGradient
    colors={[colors.gradStart, colors.gradEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.cardBase, style]}
  >
    {children}
  </LinearGradient>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

function StatCard({
  title,
  subtitle,
  value,
  footer,
}: {
  title: string;
  subtitle?: string;
  value: string;
  footer?: string;
}) {
  return (
    <GradCard>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      <Text style={styles.cardValue}>{value}</Text>
      {footer ? <Text style={styles.cardFooter}>{footer}</Text> : null}
    </GradCard>
  );
}

function RingCard({ value, label }: { value: string; label: string }) {
  return (
    <GradCard style={{ alignItems: "center" }}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardSubtitle}>Điểm càng thấp, hiệu quả càng cao.</Text>

      <View style={styles.ringWrap}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner} />
          <View style={styles.ringDot} />
        </View>
        <View style={styles.ringCenter}>
          <Text style={styles.ringNumber}>{value}</Text>
          <Text style={styles.ringUnit}>điểm</Text>
        </View>
      </View>
    </GradCard>
  );
}

function ChallengeItem({ item }: { item: Challenge }) {
  return (
    <GradCard style={styles.challengeItemBase}>
      <View style={{ flex: 1 }}>
        <Text style={styles.challengeName}>{item.name}</Text>
        {!!item.description && (
          <Text style={styles.challengeDesc}>{item.description}</Text>
        )}
        <Text style={styles.challengeTime}>
          {formatRange(item.startDate, item.endDate ?? null)}
        </Text>
      </View>
      <View style={styles.toggleBox} />
    </GradCard>
  );
}

/** ===================== Màn hình chính ===================== */
export default function TrangChu() {
  const [nguoiDung, setNguoiDung] = useState<User | null>(null);
  const [thachThuc, setThachThuc] = useState<Challenge[]>([]);
  const [hoatDong, setHoatDong] = useState<UserActivities[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setDangTai(true);
        setLoi(null);

        const me = await userApi.me();
        if (!me.success || !me.data) throw new Error(me.error || me.message);
        if (!alive) return;
        setNguoiDung(me.data);

        const chs = await challengeApi.list();
        if (alive && chs.success && chs.data) setThachThuc(chs.data);

        const acts = await userActivitiesApi.getByUserId(me.data.id);
        if (alive && acts.success && acts.data) setHoatDong(acts.data);
      } catch (e: any) {
        if (alive) setLoi(e?.message || "Không thể tải dữ liệu");
      } finally {
        if (alive) setDangTai(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const homNay = useMemo(() => new Date(), []);
  const phatThaiHomNay = useMemo(() => {
    if (!hoatDong.length) return 0;
    const ngayNay = hoatDong.filter((x: any) =>
      isSameDay(x?.createdAt ?? x?.date ?? "", homNay)
    );
    if (!ngayNay.length) return 0;
    return ngayNay.reduce((s, x) => s + getActivityEmission(x), 0);
  }, [hoatDong, homNay]);

  const hienThiCO2 =
    phatThaiHomNay > 0
      ? `${Number(phatThaiHomNay).toLocaleString()} kg/ngày`
      : "— kg/ngày";

  return (
    <ScreenWrapper
      scroll
      contentContainerStyle={{ paddingTop: 8, paddingHorizontal: 16 }}
    >
      {/* Header (nền trắng) */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            Xin chào{nguoiDung?.userName ? `, ${nguoiDung.userName}` : ""} !
          </Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Text style={{ fontSize: 24, lineHeight: 24 }}>≡</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subHello}>Chưa có dữ liệu cho hôm nay.</Text>

      {/* Hàng thống kê (các KHUNG xanh) */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <RingCard value={"25"} label="Mục tiêu mỗi ngày" />
        </View>

        <View style={{ flex: 1, gap: 12 }}>
          <StatCard
            title="Lượng CO₂ ước tính"
            subtitle="(Khối lượng nhựa × Hệ số phát thải)"
            value={hienThiCO2}
            footer="Hệ số phát thải ≈ ?"
          />
          <StatCard
            title="Điểm hôm nay"
            value={`${Number(phatThaiHomNay || 0).toLocaleString()} điểm`}
            footer="-38% so với hôm qua"
          />
        </View>
      </View>

      {/* Danh sách thử thách (mỗi item là KHUNG xanh) */}
      <SectionTitle>Thử thách hôm nay</SectionTitle>
      {dangTai ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator />
        </View>
      ) : loi ? (
        <Text style={styles.errorText}>{loi}</Text>
      ) : (
        <FlatList
          data={thachThuc}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => <ChallengeItem item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      )}

      {/* Thử thách nhóm (KHUNG xanh) */}
      <SectionTitle>Thử thách nhóm</SectionTitle>
      <GradCard style={styles.groupBox}>
        <Text style={styles.groupText}>
          Sắp ra mắt — Kết nối với nhóm của bạn để thi đấu hàng tuần.
        </Text>
      </GradCard>

      {/* Thống kê (KHUNG xanh) */}
      <SectionTitle>Thống kê</SectionTitle>
      <GradCard style={styles.statsBox}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Điểm CO₂</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Tuần này ▾</Text>
          </View>
        </View>
        <Text style={styles.statsHint}>Biểu đồ và xu hướng sẽ hiển thị tại đây.</Text>
      </GradCard>
    </ScreenWrapper>
  );
}

/** ===================== Style ===================== */
const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E7F5DF",
    marginRight: 12,
  },
  hello: { fontSize: 20, fontWeight: "800", color: colors.text },
  subHello: { marginTop: 6, marginBottom: 12, fontSize: 12, color: colors.subText },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
    marginLeft: 8,
  },

  row: { flexDirection: "row", marginBottom: 12 },

  cardBase: {
    borderRadius: 18,
    padding: 14,
    minHeight: 120,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },

  cardTitle: { fontWeight: "700", fontSize: 14, color: colors.text },
  cardSubtitle: { marginTop: 2, fontSize: 11, color: colors.subText },
  cardValue: { marginTop: 6, fontSize: 22, fontWeight: "800", color: colors.text },
  cardFooter: { marginTop: 4, fontSize: 11, color: colors.subText },

  ringWrap: {
    width: 152,
    height: 152,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    position: "absolute",
    width: 152,
    height: 152,
    borderRadius: 76,
    borderWidth: 14,
    borderColor: "#CFE9C1",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "transparent", // để thấy gradient của khung
  },
  ringDot: {
    position: "absolute",
    bottom: 10,
    left: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  ringCenter: { alignItems: "center", justifyContent: "center" },
  ringNumber: { fontSize: 32, fontWeight: "900", color: colors.text },
  ringUnit: { fontSize: 18, fontWeight: "800", color: colors.text },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },

  challengeItemBase: {
    // riêng item thử thách thấp hơn 1 chút
    minHeight: undefined,
    padding: 14,
    borderRadius: 16,
  },
  challengeName: { fontSize: 14, fontWeight: "800", color: colors.text },
  challengeDesc: { fontSize: 12, color: colors.subText, marginTop: 2 },
  challengeTime: { fontSize: 11, color: colors.subText, marginTop: 6 },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "#EAF3E3",
    marginLeft: 10,
  },

  groupBox: { padding: 16, borderRadius: 16 },
  groupText: { color: colors.subText, fontSize: 12 },

  statsBox: { padding: 16, borderRadius: 18 },
  statsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statsTitle: { fontWeight: "800", fontSize: 14, color: colors.text, flex: 1 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#EAF3E3",
  },
  pillText: { fontSize: 12, fontWeight: "700", color: colors.text },
  statsHint: { color: colors.subText, fontSize: 12, marginTop: 6 },

  errorText: { color: "#c62828", fontSize: 13, paddingVertical: 6 },
});
