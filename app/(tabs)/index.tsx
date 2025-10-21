import { ScreenWrapper } from "@/components/wrapper";
import { challengeApi, type Challenge } from "@/services/challengeApi";
import {
  userActivitiesApi,
  type UserActivities,
} from "@/services/userActivitiesApi";
import { userApi, type User } from "@/services/userApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/** ===================== Design tokens ===================== */
const tokens = {
  radius: { card: 16, pill: 12, icon: 12, avatar: 22 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  type: { h1: 28, h2: 20, body: 16, lab: 14, cap: 12 },
  color: {
    pageBg: "#FFFFFF",
    text: "#111111",
    body: "#374151",
    muted: "#6B7280",
    border: "#E5E7EB",
    accent: "#b6ff4a", // primary CTA
    gradStart: "#D5F1D3",
    gradEnd: "#F2F9D8",
    subtle: "#F3F4F6",
    danger: "#DC2626",
  },
};

// Mục tiêu theo "điểm" (khớp UI hiện tại — không động chạm API)
const DAILY_GOAL_POINTS = 25;
const PATH_CHALLENGES = "/(tabs)/challenges";
/** ===================== Utils ===================== */
const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const formatRange = (start?: string, end?: string | null) =>
  start
    ? `${formatDate(start)} → ${end ? formatDate(end) : "Đang diễn ra"}`
    : "";

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

const getEmissionForDate = (list: UserActivities[], date: Date) => {
  if (!list?.length) return 0;
  return list
    .filter((x: any) => isSameDay(x?.createdAt ?? x?.date ?? "", date))
    .reduce((s, x) => s + getActivityEmission(x), 0);
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** ===================== Cards ===================== */
const SectionTitle = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginTop: tokens.space.md,
      marginBottom: tokens.space.md,
    }}
  >
    <Text
      style={{
        fontSize: tokens.type.h2,
        fontWeight: "900",
        color: tokens.color.text,
        flex: 1,
      }}
    >
      {children}
    </Text>
    {action}
  </View>
);

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => (
  <View
    style={[
      {
        borderRadius: tokens.radius.card,
        padding: tokens.space.lg,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: tokens.color.border,
      },
      style,
    ]}
  >
    {children}
  </View>
);

// Hero KPI: dùng gradient (điểm nhấn thị giác), gộp chỉ số & % so với hôm qua
const HeroKPI = ({
  valueText,
  subLabel,
  changeText, // vd: "-38% so với hôm qua" hoặc "—"
  onPrimaryPress,
}: {
  valueText: string;
  subLabel: string;
  changeText: string;
  onPrimaryPress?: () => void;
}) => (
  <LinearGradient
    colors={[tokens.color.gradStart, tokens.color.gradEnd]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: tokens.radius.card,
      padding: tokens.space.xl,
      borderWidth: 1,
      borderColor: tokens.color.border,
    }}
  >
    <Text
      style={{
        fontSize: tokens.type.lab,
        color: tokens.color.muted,
        fontWeight: "700",
      }}
    >
      {subLabel}
    </Text>
    <Text
      style={{
        marginTop: tokens.space.xs,
        fontSize: tokens.type.h1,
        fontWeight: "900",
        color: tokens.color.text,
      }}
    >
      {valueText}
    </Text>
    <View
      style={{
        marginTop: tokens.space.sm,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: tokens.radius.pill,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: tokens.color.border,
        }}
      >
        <Text
          style={{
            fontSize: tokens.type.cap,
            fontWeight: "700",
            color: tokens.color.body,
          }}
        >
          {changeText}
        </Text>
      </View>
    </View>

    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPrimaryPress}
      style={{
        marginTop: tokens.space.lg,
        height: 48,
        borderRadius: tokens.radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.color.accent,
      }}
    >
      <Text
        style={{
          fontSize: tokens.type.body,
          fontWeight: "800",
          color: tokens.color.text,
        }}
      >
        Ghi hoạt động
      </Text>
    </TouchableOpacity>
  </LinearGradient>
);

// Progress theo "điểm" (khớp logic hiện tại: điểm thấp tốt → hiển thị đã dùng/giới hạn)
const GoalProgressCard = ({ todayPoints }: { todayPoints: number }) => {
  const ratio =
    DAILY_GOAL_POINTS > 0 ? clamp01(todayPoints / DAILY_GOAL_POINTS) : 0;
  return (
    <Card>
      <Text style={styles.cardTitle}>Mục tiêu mỗi ngày</Text>
      <Text style={styles.cardSubtitle}>
        Điểm càng thấp, hiệu quả càng cao.
      </Text>

      <View style={{ marginTop: tokens.space.md }}>
        <View
          style={{
            height: 10,
            borderRadius: 6,
            backgroundColor: tokens.color.subtle,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${ratio * 100}%`,
              height: "100%",
              backgroundColor: tokens.color.accent,
            }}
          />
        </View>

        <View
          style={{
            marginTop: tokens.space.sm,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: tokens.type.lab,
              color: tokens.color.body,
              fontWeight: "700",
            }}
          >
            {todayPoints.toLocaleString()} / {DAILY_GOAL_POINTS} điểm
          </Text>
          <Text
            style={{ fontSize: tokens.type.cap, color: tokens.color.muted }}
          >
            {Math.round(ratio * 100)}%
          </Text>
        </View>
      </View>
    </Card>
  );
};

const MiniStatCard = ({
  title,
  value,
  footer,
}: {
  title: string;
  value: string;
  footer?: string;
}) => (
  <Card>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text
      style={{
        marginTop: tokens.space.xs,
        fontSize: 22,
        fontWeight: "800",
        color: tokens.color.text,
      }}
    >
      {value}
    </Text>
    {!!footer && (
      <Text
        style={{
          marginTop: tokens.space.xs,
          fontSize: tokens.type.cap,
          color: tokens.color.muted,
        }}
      >
        {footer}
      </Text>
    )}
  </Card>
);

function ChallengeItem({ item }: { item: Challenge }) {
  return (
    <Card style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ flex: 1, paddingRight: tokens.space.md }}>
        <Text
          style={{
            fontSize: tokens.type.lab,
            fontWeight: "800",
            color: tokens.color.text,
          }}
        >
          {item.name}
        </Text>
        {!!item.description && (
          <Text
            style={{
              fontSize: tokens.type.cap,
              color: tokens.color.muted,
              marginTop: 2,
            }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
        <Text
          style={{
            fontSize: tokens.type.cap,
            color: tokens.color.muted,
            marginTop: 6,
          }}
        >
          {formatRange(item.startDate, item.endDate ?? null)}
        </Text>
      </View>
      {/* Chevron điều hướng thay vì toggle giả */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.color.subtle,
        }}
      >
        <Ionicons name="chevron-forward" size={18} color={tokens.color.body} />
      </View>
    </Card>
  );
}

/** ===================== Màn hình chính ===================== */
export default function TrangChu() {
  const router = useRouter();

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

        // ====== GIỮ NGUYÊN LOGIC GỌI API ======
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
  const homQua = useMemo(() => {
    const d = new Date(homNay);
    d.setDate(d.getDate() - 1);
    return d;
  }, [homNay]);

  const phatThaiHomNay = useMemo(
    () => getEmissionForDate(hoatDong, homNay),
    [hoatDong, homNay]
  );
  const phatThaiHomQua = useMemo(
    () => getEmissionForDate(hoatDong, homQua),
    [hoatDong, homQua]
  );

  const hienThiCO2 =
    phatThaiHomNay > 0
      ? `${Number(phatThaiHomNay).toLocaleString()} kg`
      : "— kg";

  const thayDoiSoVoiHomQua = useMemo(() => {
    if (!phatThaiHomQua) return "— so với hôm qua";
    const diff = phatThaiHomNay - phatThaiHomQua;
    const pct = (diff / phatThaiHomQua) * 100;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${Math.round(pct)}% so với hôm qua`;
  }, [phatThaiHomNay, phatThaiHomQua]);

  const isEmptyToday = phatThaiHomNay <= 0;

  return (
    <ScreenWrapper
      scroll
      contentContainerStyle={{
        paddingTop: 8,
        paddingHorizontal: 16,
        backgroundColor: tokens.color.pageBg,
      }}
    >
      {/* ===== Header ===== */}
      <View
        style={{ flexDirection: "row", alignItems: "center", paddingTop: 4 }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: tokens.radius.avatar,
            backgroundColor: "#E7F5DF",
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: tokens.type.h2,
              fontWeight: "800",
              color: tokens.color.text,
            }}
          >
            Xin chào{nguoiDung?.userName ? `, ${nguoiDung.userName}` : ""}!
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: tokens.type.cap,
              color: tokens.color.muted,
            }}
          >
            {isEmptyToday
              ? "Chưa có dữ liệu cho hôm nay."
              : "Tiếp tục duy trì thói quen tốt nhé!"}
          </Text>
        </View>
      </View>

      {/* ===== Loading & Error ===== */}
      {dangTai && (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator />
          {/* skeleton nhẹ */}
          <View style={{ marginTop: tokens.space.lg, gap: tokens.space.md }}>
            <View
              style={{
                height: 140,
                borderRadius: tokens.radius.card,
                backgroundColor: tokens.color.subtle,
              }}
            />
            <View
              style={{
                height: 90,
                borderRadius: tokens.radius.card,
                backgroundColor: tokens.color.subtle,
              }}
            />
            <View
              style={{
                height: 90,
                borderRadius: tokens.radius.card,
                backgroundColor: tokens.color.subtle,
              }}
            />
          </View>
        </View>
      )}

      {!!loi && !dangTai && (
        <Card style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}>
          <Text
            style={{
              color: tokens.color.danger,
              fontSize: tokens.type.lab,
              fontWeight: "800",
            }}
          >
            Lỗi
          </Text>
          <Text
            style={{
              color: tokens.color.body,
              marginTop: tokens.space.xs,
              fontSize: tokens.type.cap,
            }}
          >
            {loi}
          </Text>
          <TouchableOpacity
            onPress={() => {
              // tải lại trang (đơn giản): để nguyên luồng useEffect
              // có thể điều hướng lại hoặc setDangTai(true) + trigger lại, tùy bạn
            }}
            style={{ marginTop: tokens.space.sm }}
          >
            <Text
              style={{
                fontSize: tokens.type.lab,
                fontWeight: "800",
                color: tokens.color.text,
              }}
            >
              Thử lại
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* ===== Nội dung chính ===== */}
      {!dangTai && !loi && (
        <>
          {/* Hero KPI + CTA */}
          <HeroKPI
            subLabel="CO₂ hôm nay"
            valueText={hienThiCO2}
            changeText={thayDoiSoVoiHomQua}
            onPrimaryPress={() => {
              // Gợi ý điều hướng — đổi path theo app của bạn
              // router.push("/activities/new");
            }}
          />
          {/* Hàng mini-stat: mục tiêu & điểm */}
          <View
            style={{
              marginTop: tokens.space.lg,
              flexDirection: "row",
              gap: tokens.space.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <GoalProgressCard todayPoints={phatThaiHomNay} />
            </View>
            <View style={{ flex: 1 }}>
              <MiniStatCard
                title="Điểm hôm nay"
                value={`${Number(phatThaiHomNay || 0).toLocaleString()} điểm`}
                footer={
                  phatThaiHomQua
                    ? thayDoiSoVoiHomQua
                    : "Chưa có dữ liệu hôm qua"
                }
              />
            </View>
          </View>

          <SectionTitle
            action={
              <TouchableOpacity onPress={() => router.push(PATH_CHALLENGES)}>
                <Text
                  style={{
                    fontSize: tokens.type.lab,
                    fontWeight: "800",
                    color: tokens.color.body,
                  }}
                >
                  Xem tất cả ▸
                </Text>
              </TouchableOpacity>
            }
          >
            Thử thách hôm nay
          </SectionTitle>
          {thachThuc?.length ? (
            <FlatList
              data={thachThuc}
              keyExtractor={(it) => String(it.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(PATH_CHALLENGES)}
                >
                  <ChallengeItem item={item} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: tokens.space.md }} />
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: tokens.space.md }}
            />
          ) : (
            <Card style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: tokens.type.lab,
                  fontWeight: "800",
                  color: tokens.color.text,
                }}
              >
                Chưa có thử thách
              </Text>
              <Text
                style={{
                  marginTop: tokens.space.xs,
                  fontSize: tokens.type.cap,
                  color: tokens.color.muted,
                  textAlign: "center",
                }}
              >
                Theo dõi CO₂ mỗi ngày để mở khóa và tham gia các thử thách phù
                hợp.
              </Text>
            </Card>
          )}
          {/* Thống kê */}
          <SectionTitle>Thống kê</SectionTitle>
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: tokens.space.sm,
              }}
            >
              <Text
                style={{
                  fontWeight: "800",
                  fontSize: tokens.type.lab,
                  color: tokens.color.text,
                  flex: 1,
                }}
              >
                Điểm CO₂
              </Text>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: tokens.radius.pill,
                  backgroundColor: tokens.color.subtle,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.type.cap,
                    fontWeight: "700",
                    color: tokens.color.text,
                  }}
                >
                  Tuần này ▾
                </Text>
              </View>
            </View>

            {/* Biểu đồ 7 ngày gần nhất */}
            <StatsChart activities={hoatDong} />
          </Card>
          {/* Thử thách nhóm — đưa xuống cuối, secondary */}
          <SectionTitle>Thử thách nhóm</SectionTitle>
          <Card>
            <Text
              style={{ color: tokens.color.muted, fontSize: tokens.type.cap }}
            >
              Sắp ra mắt — Kết nối với nhóm của bạn để thi đấu hàng tuần.
            </Text>
          </Card>
        </>
      )}
    </ScreenWrapper>
  );
}

/** ===================== Style (giữ tối giản, đồng nhất) ===================== */
const styles = StyleSheet.create({
  cardTitle: {
    fontWeight: "700",
    fontSize: tokens.type.lab,
    color: tokens.color.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: tokens.type.cap,
    color: tokens.color.muted,
  },
});
function StatsChart({ activities }: { activities: UserActivities[] }) {
  // Gom tổng theo ngày cho 7 ngày gần nhất (bao gồm hôm nay)
  const data = useMemo(() => {
    const days = 7;
    const today = new Date();
    const buckets: { label: string; date: Date; value: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });

      // tổng CO₂ của ngày d
      const sum = activities
        ?.filter((x: any) => {
          const src = x?.date ?? x?.createdAt;
          if (!src) return false;
          const dx = new Date(src);
          return (
            dx.getFullYear() === d.getFullYear() &&
            dx.getMonth() === d.getMonth() &&
            dx.getDate() === d.getDate()
          );
        })
        .reduce(
          (s, x: any) =>
            s +
            (Number(
              x?.totalCO2Emission ?? x?.totalEmission ?? x?.co2Emission ?? 0
            ) || 0),
          0
        );

      buckets.push({ label, date: d, value: sum || 0 });
    }
    return buckets;
  }, [activities]);

  const maxVal = useMemo(
    () => Math.max(...data.map((d) => d.value), 0),
    [data]
  );

  if (!activities?.length) {
    return (
      <Text
        style={{
          color: tokens.color.muted,
          fontSize: tokens.type.cap,
          marginTop: tokens.space.xs,
        }}
      >
        Chưa có dữ liệu để hiển thị biểu đồ.
      </Text>
    );
  }

  if (maxVal <= 0) {
    return (
      <Text
        style={{
          color: tokens.color.muted,
          fontSize: tokens.type.cap,
          marginTop: tokens.space.xs,
        }}
      >
        Tuần này chưa có phát thải được ghi nhận.
      </Text>
    );
  }

  return (
    <View style={{ marginTop: tokens.space.sm }}>
      {/* vùng chart */}
      <View
        style={{
          height: 160,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: tokens.space.md,
          paddingHorizontal: 2,
        }}
      >
        {data.map((d, idx) => {
          const h = Math.max(4, Math.round((d.value / maxVal) * 140)); // 140px cho cột, chừa label
          return (
            <View key={idx} style={{ alignItems: "center", flex: 1 }}>
              {/* cột */}
              <View
                style={{
                  width: "80%",
                  height: h,
                  borderRadius: 6,
                  backgroundColor: tokens.color.accent,
                }}
              />
              {/* value nhỏ trên đầu cột (ẩn nếu quá thấp) */}
              {h > 28 && (
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 10,
                    color: tokens.color.body,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {Math.round(d.value).toLocaleString()} kg
                </Text>
              )}
              {/* label ngày */}
              <Text
                style={{
                  marginTop: 6,
                  fontSize: tokens.type.cap,
                  color: tokens.color.muted,
                  textAlign: "center",
                }}
              >
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* chú thích đơn vị */}
      <Text
        style={{
          color: tokens.color.muted,
          fontSize: tokens.type.cap,
          marginTop: tokens.space.sm,
        }}
      >
        Đơn vị: kg CO₂/ngày (tổng từ các hoạt động ghi nhận).
      </Text>
    </View>
  );
}
