// app/(tabs)/track.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenWrapper } from '@/components/wrapper';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, TrafficCategory, UserActivities } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet, // Dùng Modal để hiển thị form chỉnh sửa
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const customColors = {
  gaugeGreen: '#4CAF50',
  gaugeYellow: '#FFC107',
  gaugeRed: '#F44336',
  cardBg: '#e6fcd9',
  measureBg: '#f6fff0',
  text: '#111111',
  tint: '#4CAF50', 
};

// Hàm giả lập tính toán lượng phát thải
const getActivityEmission = (x: any): number => {
    const value = x?.totalCO2Emission ?? x?.totalEmission ?? x?.co2Emission;
    if (value === null || typeof value === 'undefined') return 0;
    const floatValue = parseFloat(String(value)); 
    return isNaN(floatValue) ? 0 : floatValue;
};

const isSameDay = (a: string | Date, b: Date) => {
  const da = typeof a === "string" ? new Date(a) : a;
  return (
    da.getFullYear() === b.getFullYear() &&
    da.getMonth() === b.getMonth() &&
    da.getDate() === b.getDate()
  );
};

const prettyTrafficType = (t?: number) => {
    if (!t) return '—';
    if (t === TrafficCategory.MOTORBIKE) return 'Xe máy'; 
    if (t === TrafficCategory.CAR) return 'Ô tô'; 
    if (t === TrafficCategory.BUS) return 'Xe buýt'; 
    if (t === TrafficCategory.TRAIN) return 'Tàu hỏa'; 
    if (t === TrafficCategory.PLANE) return 'Máy bay'; 
    if (t === TrafficCategory.BICYCLE) return 'Xe đạp'; 
    if (t === TrafficCategory.WALKING) return 'Đi bộ'; 
    return 'Khác';
}

const getUsageCo2 = (x: any): number => {
    const value = x?.cO2emission ?? x?.co2Estimate ?? 0;
    const floatValue = parseFloat(String(value)); 
    return isNaN(floatValue) ? 0 : floatValue;
};


// =========================================================
// COMPONENT MỚI: MODAL CHỈNH SỬA
// =========================================================

// Định nghĩa kiểu cho dữ liệu cần chỉnh sửa
type UsageData = {
    type: string;
    route: string;
    color: string;
    factorValue: string; // Giá trị hiện tại của Factor
    factorUnit: string;
};

function EditUsageModal({ isVisible, onClose, data }: { isVisible: boolean, onClose: () => void, data: UsageData | null }) {
    if (!data) return null;

    const [inputValue, setInputValue] = useState(data.factorValue);
    const [co2Estimate, setCo2Estimate] = useState(0); // Giả lập CO2 mới

    const handleSave = () => {
        // GIẢ LẬP: GỌI API UPDATE VÀ THỰC HIỆN LOGIC KHÔNG ĐỒNG BỘ
        console.log(`Đang gửi update cho ${data.type}: ${inputValue}`);
        Alert.alert("Thành công", `Đã cập nhật ${data.type} thành ${inputValue} ${data.factorUnit}. Vui lòng reload.`);
        
        // Đóng modal sau khi hoàn thành
        onClose();
        // Cần thêm logic để gọi lại fetchData() trong component TrackScreen
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <ThemedView style={[modalStyles.modalView, { backgroundColor: data.color }]}>
                    <ThemedText style={modalStyles.modalTitle}>Cập nhật: {data.type}</ThemedText>
                    
                    <ThemedText style={modalStyles.label}>
                        Giá trị {data.factorUnit} (hiện tại: {data.factorValue}):
                    </ThemedText>

                    <TextInput
                        style={modalStyles.input}
                        onChangeText={setInputValue}
                        value={inputValue}
                        keyboardType="numeric"
                        placeholder={`Nhập ${data.factorUnit}`}
                        placeholderTextColor="#ccc"
                    />

                    <ThemedText style={modalStyles.estimateText}>
                        CO₂ ước tính mới: {co2Estimate.toFixed(2)} kg
                    </ThemedText>

                    <View style={modalStyles.buttonRow}>
                        <TouchableOpacity 
                            style={modalStyles.buttonClose} 
                            onPress={onClose}
                        >
                            <ThemedText style={modalStyles.textStyle}>Hủy</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonSave]}
                            onPress={handleSave}
                        >
                            <ThemedText style={modalStyles.textStyle}>Lưu</ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </View>
        </Modal>
    );
}

// =========================================================
// COMPONENTS GỐC (Đã chỉnh sửa để loại bỏ router.push)
// =========================================================

function TotalCO2Card({ emission, color, dateString }: { emission: number, color: string, dateString: string }) {
    const formattedEmission = emission.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const label = dateString === '—' 
        ? 'Lượng CO₂ gần nhất (ước tính)' 
        : `Lượng CO₂ được ghi nhận (${dateString})`;

    return (
        <ThemedView style={[totalCo2Styles.card, { backgroundColor: color }]}>
            <ThemedText style={totalCo2Styles.label}>
                {label}
            </ThemedText>
            <ThemedText style={totalCo2Styles.value}>
                {formattedEmission}
                <ThemedText style={totalCo2Styles.unit}> kg</ThemedText>
            </ThemedText>
            <ThemedText style={totalCo2Styles.tip}>
                Giá trị được lấy từ hoạt động có timestamp mới nhất.
            </ThemedText>
        </ThemedView>
    );
}

function CO2LinearGauge({ emission }: { emission: number }) {
  const DAILY_GOAL = 10;
  
  const percent = Math.min(emission / DAILY_GOAL, 1) * 100;
  
  let progressColor = customColors.gaugeGreen;
  if (percent > 100) {
    progressColor = customColors.gaugeRed;
  } else if (percent > 70) {
    progressColor = customColors.gaugeYellow;
  }
  
  return (
    <View style={linearGaugeStyles.container}>
      <View style={linearGaugeStyles.barBackground}>
        <View style={[
          linearGaugeStyles.barProgress,
          { width: `${percent}%`, backgroundColor: progressColor }
        ]} />
      </View>
      <View style={linearGaugeStyles.labels}>
        <ThemedText style={linearGaugeStyles.goalLabel}>
          Mục tiêu: {DAILY_GOAL} kg
        </ThemedText>
        {emission > DAILY_GOAL && (
          <ThemedText style={linearGaugeStyles.overGoalLabel}>
            Vượt quá { (emission - DAILY_GOAL).toFixed(2) } kg!
          </ThemedText>
        )}
      </View>
    </View>
  );
}

// UsageStatBox KHÔNG CÒN GỌI router.push NỮA, MÀ GỌI HÀM MỞ MODAL
function UsageStatBox({ 
    type, emission, factor, factorUnit, color, onPress // THÊM ONPRESS
}: {
    type: string; emission: number; factor: string; factorUnit: string; color: string; onPress: () => void; // OnPress thay cho route
}) {
    const formattedEmission = emission.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const factorLabel = factor !== '—' ? factor : `Chưa ghi nhận`;

    return (
        <TouchableOpacity 
            style={[styles.statBox, { backgroundColor: color }]}
            onPress={onPress} // GỌI ONPRESS TỪ CHỦ COMPONENT
        >
            <ThemedText style={styles.statType}>{type}</ThemedText>
            <ThemedText style={styles.statValueDetail}>
                {formattedEmission} kg CO₂ 
            </ThemedText>
            <ThemedText style={styles.statFactorLabel}>{factorUnit}:</ThemedText>
            <ThemedText style={styles.statFactorValue}>{factorLabel}</ThemedText>
        </TouchableOpacity>
    );
}


export default function TrackScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint'); 
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activities, setActivities] = useState<UserActivities[]>([]);
  
  // STATE MỚI: Quản lý modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<UsageData | null>(null);


  // Hàm mở modal và truyền dữ liệu
  const handleOpenModal = (data: UsageData) => {
      setSelectedUsage(data);
      setIsModalVisible(true);
  };
  
  // Hàm đóng modal
  const handleCloseModal = () => {
      setIsModalVisible(false);
      setSelectedUsage(null);
      // Logic: Cần gọi lại fetchData() ở đây để cập nhật dữ liệu sau khi lưu
      // fetchData(); 
  };


  // Tải dữ liệu người dùng và hoạt động (Cần định nghĩa hàm fetchData riêng)
  const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await apiService.user.me();
        if (!userRes.success || !userRes.data) throw new Error("Không lấy được user.");
        
        // Logic tải hoạt động (giữ nguyên)
        const userId = userRes.data.id;
        const activitiesRes = await apiService.userActivities.getByUserId(userId);
        
        if (activitiesRes.success && activitiesRes.data) {
            setActivities(activitiesRes.data);
        } else {
            console.error("Lỗi tải hoạt động:", activitiesRes.message);
        }
        
      } catch (e) {
        console.error("Lỗi API:", e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // LOGIC HIỂN THỊ DỮ LIỆU (Giữ nguyên)
  const lastRecordedActivity = useMemo(() => {
      if (!activities.length) return null;
      const sorted = [...activities].sort((a, b) => 
          new Date((b as any).date as string).getTime() - new Date((a as any).date as string).getTime()
      );
      return sorted.length > 0 ? (sorted[0] as any) : null;
  }, [activities]);

  const todayEmission = useMemo(() => {
      const today = new Date();
      const todayActivities = activities.filter(x => isSameDay((x as any).date as string, today));
      return todayActivities.reduce((sum, x) => sum + getActivityEmission(x), 0);
  }, [activities]);

  const lastEmission = getActivityEmission(lastRecordedActivity);
  const currentEmission = lastEmission;
  
  const currentEmissionDate = lastRecordedActivity 
      ? new Date((lastRecordedActivity as any).date).toLocaleDateString('vi-VN')
      : '—';
  
  const userName = currentUser?.userName || "string";
  const screenBackground = customColors.cardBg; 
  
  // DỮ LIỆU CHO 4 Ô STATS (SỬA LỖI TRUY CẬP VÀ ĐỊNH DẠNG FACTOR)
  const trafficUsageObj = lastRecordedActivity?.trafficUsage;
  const foodUsageObj = lastRecordedActivity?.foodUsage;
  const plasticUsageObj = lastRecordedActivity?.plasticUsage;
  const energyUsageObj = lastRecordedActivity?.energyUsage;
  
  const trafficCo2 = getUsageCo2(trafficUsageObj);
  const foodCo2 = getUsageCo2(foodUsageObj);
  const plasticCo2 = getUsageCo2(plasticUsageObj);
  const energyCo2 = getUsageCo2(energyUsageObj);

  // GIAO THÔNG
  const trafficDistance = (trafficUsageObj as any)?.distance ?? '—';
  const trafficFactorRaw = (trafficUsageObj as any)?.trafficCategory;
  const trafficFactorName = prettyTrafficType(trafficFactorRaw);

  // THỰC PHẨM
  const foodAmountRaw = (foodUsageObj as any)?.amount;
  const foodItemsCount = (foodUsageObj as any)?.foodItems?.length ?? 0;
  const foodFactor = foodAmountRaw ? foodAmountRaw.toFixed(1) : (foodItemsCount > 0 ? 'Chi tiết' : '—');
  const foodFactorUnit = foodAmountRaw ? "Lượng (g)" : "Khối lượng";

  // NHỰA
  const plasticFactorRaw = (plasticUsageObj as any)?.quantity ?? (plasticUsageObj as any)?.estimatedKg;
  const plasticFactorUnit = (plasticUsageObj as any)?.quantity ? "Số lượng (item)" : "Khối lượng (kg)";
  
  // NĂNG LƯỢNG
  const energyFactorRaw = (energyUsageObj as any)?.electricityconsumption;

  const usageStats = [
      { 
          type: "Giao thông", 
          emission: trafficCo2, 
          factor: `${trafficDistance} km`, 
          factorUnit: 'Quãng đường (km)', 
          color: customColors.gaugeGreen,
          factorValue: String(trafficDistance),
          route: '/measure/traffic'
      },
      { 
          type: "Thực phẩm", 
          emission: foodCo2, 
          factor: foodFactor, 
          factorUnit: foodFactorUnit, 
          color: '#00B0FF', 
          factorValue: foodAmountRaw?.toFixed(1) ?? '',
          route: '/measure/food'
      },
      { 
          type: "Nhựa", 
          emission: plasticCo2, 
          factor: plasticFactorRaw?.toFixed(2) ?? '—', 
          factorUnit: plasticFactorUnit, 
          color: '#FF6F00', 
          factorValue: plasticFactorRaw?.toFixed(2) ?? '',
          route: '/measure/plastic'
      },
      { 
          type: "Năng lượng", 
          emission: energyCo2, 
          factor: energyFactorRaw?.toFixed(0) ?? '—', 
          factorUnit: "Tiêu thụ (kWh)", 
          color: '#9C27B0', 
          factorValue: energyFactorRaw?.toFixed(0) ?? '',
          route: '/measure/energy'
      },
  ];

  return (
    <ScreenWrapper 
      scroll 
      containerStyle={{ backgroundColor: screenBackground }}
      contentContainerStyle={styles.contentContainer}
    >
      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText>Đang tải dữ liệu...</ThemedText>
        </ThemedView>
      ) : (
        <>
          {/* PHẦN HEADER */}
          <View style={styles.header}>
            <View style={styles.headerAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText style={styles.helloText}>
                Xin chào, {userName} !
              </ThemedText>
              <ThemedText style={styles.noDataText}>
                {todayEmission === 0 ? "Chưa có dữ liệu hôm nay." : "Đã nhập dữ liệu hôm nay."}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.menuButton}>
                <ThemedText style={{ fontSize: 24, lineHeight: 24 }}>≡</ThemedText>
            </TouchableOpacity>
          </View>

          {/* KHUNG HIỂN THỊ TỔNG CO2 LỚN */}
          <TotalCO2Card emission={currentEmission} color={tintColor} dateString={currentEmissionDate} /> 

          {/* KHUNG TÁC ĐỘNG CO2 (LINEAR GAUGE) */}
          <View style={[styles.gaugeCard, { backgroundColor: customColors.cardBg }]}>
            <View style={styles.gaugeInfo}>
              <ThemedText style={styles.gaugeTitle}>Tác động CO₂ hôm nay</ThemedText> 
              <ThemedText style={styles.gaugeSubtitle}>Mục tiêu hàng ngày</ThemedText> 
            </View>
            <CO2LinearGauge emission={currentEmission} />
          </View>

          {/* KHUNG THỐNG KÊ CHI TIẾT 4 LOẠI (LÀM CHỨC NĂNG NHẬP LIỆU) */}
          <ThemedText style={styles.sectionTitle}>Cập nhật Ghi nhận hoạt động</ThemedText>
          <View style={styles.statsGrid}>
              {usageStats.map((stat, index) => (
                  <UsageStatBox 
                      key={index}
                      type={stat.type}
                      emission={stat.emission}
                      factor={stat.factor}
                      factorUnit={stat.factorUnit}
                      color={stat.color}
                    
                      
                      // Dùng onPress để mở Modal
                      onPress={() => handleOpenModal(stat as UsageData)}
                  />
              ))}
          </View>
        </>
      )}
      
      {/* MODAL CHỈNH SỬA INLINE */}
      <EditUsageModal 
          isVisible={isModalVisible} 
          onClose={handleCloseModal} 
          data={selectedUsage}
      />
    </ScreenWrapper>
  );
}

/* ==================== STYLES CHO MODAL ==================== */

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    label: {
        color: '#fff',
        marginBottom: 8,
        alignSelf: 'flex-start',
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: 10,
        color: '#fff',
        width: '100%',
        marginBottom: 20,
        fontSize: 16,
    },
    estimateText: {
        color: '#fff',
        marginBottom: 20,
        fontWeight: '700',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonSave: {
        backgroundColor: '#fff',
    },
    buttonClose: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    textStyle: {
        color: customColors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

/* ==================== STYLES KHÁC GIỮ NGUYÊN ==================== */

const totalCo2Styles = StyleSheet.create({
    card: {
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: customColors.text,
        opacity: 0.8,
    },
    value: {
        fontSize: 48, 
        fontWeight: '900',
        color: customColors.text,
        marginTop: 4,
        lineHeight: 52, 
        textAlign: 'center',
    },
    unit: {
        fontSize: 24,
        fontWeight: '700',
    },
    tip: {
        fontSize: 13,
        color: customColors.text,
        opacity: 0.6,
        marginTop: 8,
        textAlign: 'center',
    }
})

// Styles cho Linear Gauge
const linearGaugeStyles = StyleSheet.create({
    container: {
        width: '50%',
        paddingRight: 10,
        alignItems: 'flex-end',
    },
    barBackground: {
        width: '100%',
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    barProgress: {
        height: '100%',
        borderRadius: 6,
    },
    labels: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    goalLabel: {
        fontSize: 12,
        color: customColors.text,
        opacity: 0.7,
    },
    overGoalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: customColors.gaugeRed,
    }
});


/* ==================== Styles cho Grid 4 ô (MỚI) ==================== */

const styles = StyleSheet.create({
  contentContainer: { paddingVertical: 0, flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  helloText: { fontSize: 18, fontWeight: 'bold' },
  noDataText: { fontSize: 13, opacity: 0.7 },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  
  // Gauge Card (Chứa Linear Gauge)
  gaugeCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  gaugeInfo: { flex: 1, paddingRight: 10 },
  gaugeTitle: { fontSize: 16, fontWeight: 'bold', color: customColors.text, marginBottom: 4 },
  gaugeSubtitle: { fontSize: 13, opacity: 0.7 },

  // Small Stats Grid
  statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginBottom: 20,
      marginTop: 8,
  },
  statBox: {
      width: '48%', // Tạo grid 2x2
      minHeight: 120,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      alignItems: 'flex-start',
  },
  statType: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#fff',
      opacity: 0.8,
      marginBottom: 4,
  },
  statValueDetail: {
      fontSize: 18,
      fontWeight: '900',
      color: '#fff',
      marginTop: 2,
  },
  statFactorLabel: {
      fontSize: 11,
      color: '#fff',
      opacity: 0.7,
      marginTop: 4,
  },
  statFactorValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff',
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: customColors.text,
      paddingHorizontal: 16,
      marginBottom: 4,
      marginTop: 10,
  },
});

// Styles cho Component Đồng Hồ CŨ (Giữ lại để tránh lỗi nếu có nơi khác sử dụng)
const gaugeStyles = StyleSheet.create({
  gaugeContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0, // Ẩn component cũ
    position: 'absolute',
  },
  arcWrapper: {
    width: 150,
    height: 75,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    flexDirection: 'row',
  },
  arc: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  arcGreen: { backgroundColor: customColors.gaugeGreen, left: 0, width: 75, borderTopLeftRadius: 75, borderBottomLeftRadius: 75 }, 
  arcYellow: { backgroundColor: customColors.gaugeYellow, left: 75, width: 75, opacity: 0.5 }, 
  arcRed: { backgroundColor: customColors.gaugeRed, right: 0, width: 75, opacity: 0.5 },

  centerCircle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: customColors.text,
    bottom: 0,
  },
  needle: {
    position: 'absolute',
    bottom: 6,
    width: 2,
    height: 70,
    transformOrigin: 'bottom center',
  },
  labelSmall: { fontSize: 14, fontWeight: 'bold', position: 'absolute', bottom: -20, textAlign: 'center' },
});

// Styles cho Component Nút Nhập liệu (Không dùng)
const measureStyles = StyleSheet.create({
  button: {
    backgroundColor: customColors.measureBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0', 
  },
  label: { fontSize: 15, fontWeight: '600' },
  subLabel: { fontSize: 12, opacity: 0.6, marginTop: 2 },
});