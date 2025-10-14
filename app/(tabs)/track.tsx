import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/wrapper';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, User, UserActivities } from '@/services/api';
import { energyUsageApi } from '@/services/energyUsageApi';
import { trafficUsageApi } from '@/services/trafficUsageApi';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const customColors = {
  gaugeGreen: '#4CAF50',
  gaugeYellow: '#FFC107',
  gaugeRed: '#F44336',
  cardBg: '#f3fff1',
  text: '#111',
  tint: '#4CAF50',
};

// Utils
const getActivityEmission = (x: UserActivities): number => x?.totalCO2Emission ?? 0;
const getUsageCo2 = (x: { cO2Emission?: number } | undefined | null) => x?.cO2Emission ?? 0;
const isSameDay = (a: string | Date, b: Date) => new Date(a).toDateString() === b.toDateString();

export default function TrackScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [todayActivity, setTodayActivity] = useState<UserActivities | null>(null);

  // Modal Energy
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [newElectricity, setNewElectricity] = useState('');
  const [energyLoading, setEnergyLoading] = useState(false);

  // Modal Traffic
  const [showTrafficModal, setShowTrafficModal] = useState(false);
  const [trafficKm, setTrafficKm] = useState('');
  const [trafficCategory, setTrafficCategory] = useState(1);
  const [trafficLoading, setTrafficLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await apiService.user.me();
      if (!userRes.success || !userRes.data) throw new Error('Không thể xác thực người dùng.');
      setCurrentUser(userRes.data);

      const activitiesRes = await apiService.userActivities.getByUserId(userRes.data.id);
      if (activitiesRes.success && activitiesRes.data) {
        const today = new Date();
        const todayData = activitiesRes.data.filter((x) => x.date && isSameDay(x.date, today));
        if (todayData.length > 0) {
          const latest = todayData.sort((a, b) => b.id - a.id)[0];
          setTodayActivity(latest);
        }
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fill modal traffic khi mở
  useEffect(() => {
    if (showTrafficModal && todayActivity?.trafficUsage) {
      setTrafficKm(String(todayActivity.trafficUsage.distance ?? ''));
      setTrafficCategory(todayActivity.trafficUsage.trafficCategory ?? 1);
    }
  }, [showTrafficModal, todayActivity]);

  const todayEmission = todayActivity ? getActivityEmission(todayActivity) : 0;
  const hasTodayData = !!todayActivity;

  const usageStats = useMemo(() => {
    if (!todayActivity) return [];
    return [
      { type: 'Giao thông', emission: getUsageCo2(todayActivity.trafficUsage), color: '#4CAF50' },
      { type: 'Thực phẩm', emission: getUsageCo2(todayActivity.foodUsage), color: '#00B0FF' },
      { type: 'Nhựa', emission: getUsageCo2(todayActivity.plasticUsage), color: '#FF6F00' },
      { type: 'Năng lượng', emission: getUsageCo2(todayActivity.energyUsage), color: '#9C27B0' },
    ];
  }, [todayActivity]);

  const total = usageStats.reduce((s, x) => s + x.emission, 0);

  const pieData = usageStats.map((x) => ({
    value: x.emission,
    color: x.color,
    text: total > 0 ? ((x.emission / total) * 100).toFixed(1) + '%' : '0%',
  }));

  const userName = currentUser?.userName || 'bạn';
  const todayStr = new Date().toLocaleDateString('vi-VN');

  // Update Energy
  const handleUpdateEnergy = async () => {
    if (!todayActivity?.energyUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID năng lượng.');
    const electricity = parseFloat(newElectricity);
    if (isNaN(electricity) || electricity < 0) return Alert.alert('Lỗi', 'Giá trị không hợp lệ.');

    try {
      setEnergyLoading(true);
      const res = await energyUsageApi.update(todayActivity.energyUsage.id, {
        electricityConsumption: electricity,
        cO2Emission: electricity * 0.5,
        date: new Date().toISOString(),
        activityId: todayActivity.id,
      });
      if (res.success) {
        Alert.alert('Thành công', 'Đã cập nhật năng lượng!');
        setShowEnergyModal(false);
        fetchData();
      } else throw new Error('Cập nhật thất bại.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể cập nhật dữ liệu.');
    } finally {
      setEnergyLoading(false);
    }
  };

  // Update Traffic
  const co2Rates: Record<number, number> = { 1: 0.045, 2: 0.102, 3: 0.041, 4: 0, 5: 0, 6: 0.225, 7: 0.23 };
  const handleUpdateTraffic = async () => {
    if (!todayActivity?.trafficUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID giao thông.');
    const km = parseFloat(trafficKm);
    if (isNaN(km) || km < 0) return Alert.alert('Lỗi', 'Quãng đường không hợp lệ.');

    try {
      setTrafficLoading(true);
      const res = await trafficUsageApi.update(todayActivity.trafficUsage.id, {
        distance: km,
        trafficCategory,
        cO2Emission: km * (co2Rates[trafficCategory] ?? 0),
        date: new Date().toISOString(),
        activityId: todayActivity.id,
      });
      if (res.success) {
        Alert.alert('Thành công', 'Đã cập nhật giao thông!');
        setShowTrafficModal(false);
        fetchData();
      } else throw new Error('Cập nhật thất bại.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể cập nhật dữ liệu.');
    } finally {
      setTrafficLoading(false);
    }
  };

  return (
    <ScreenWrapper
      scroll
      containerStyle={{ backgroundColor: customColors.cardBg }}
      contentContainerStyle={styles.contentContainer}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText>Đang tải dữ liệu...</ThemedText>
        </View>
      ) : !hasTodayData ? (
        <View style={styles.noDataContainer}>
          <ThemedText style={styles.noDataText}>Chưa có dữ liệu hôm nay.</ThemedText>
          <TouchableOpacity
            style={styles.measureButton}
            onPress={() => router.push('/measure')}
          >
            <ThemedText style={styles.measureButtonText}>Nhập dữ liệu</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerAvatar} />
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.helloText}>Xin chào, {userName} 👋</ThemedText>
              <ThemedText style={styles.noDataText}>
                {todayEmission === 0 ? 'Chưa có dữ liệu hôm nay.' : 'Dữ liệu hôm nay đã được ghi nhận.'}
              </ThemedText>
            </View>
          </View>

          {/* Tổng CO₂ */}
          <View style={styles.co2Card}>
            <ThemedText style={styles.co2Label}>Tổng lượng CO₂ hôm nay ({todayStr})</ThemedText>
            <View style={styles.co2Row}>
              <Ionicons name="cloud-outline" size={36} color="#1B5E20" style={{ marginRight: 6 }} />
              <ThemedText style={styles.co2Value}>{todayEmission.toFixed(2)}</ThemedText>
              <ThemedText style={styles.co2Unit}>kg</ThemedText>
            </View>
          </View>

          {/* Biểu đồ */}
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Tỉ lệ phát thải CO₂ theo hạng mục</ThemedText>
            {pieData.length > 0 ? (
              <PieChart data={pieData} donut radius={100} innerRadius={55} showText textColor="white" textSize={13} />
            ) : (
              <ThemedText>Chưa có dữ liệu hôm nay.</ThemedText>
            )}
            <View style={styles.legend}>
              {usageStats.map((item, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <ThemedText style={styles.legendText}>{item.type}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Thống kê chi tiết */}
          <ThemedText style={styles.sectionTitle}>Phát thải chi tiết</ThemedText>
          <View style={styles.statsGrid}>
            {usageStats.map((x, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.statBox, { backgroundColor: x.color }]}
                onPress={() => {
                  if (x.type === 'Năng lượng') setShowEnergyModal(true);
                  if (x.type === 'Giao thông') setShowTrafficModal(true);
                }}
              >
                <ThemedText style={styles.statType}>{x.type}</ThemedText>
                <ThemedText style={styles.statValue}>{x.emission.toFixed(2)} kg CO₂</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Modal Energy */}
          <Modal visible={showEnergyModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Cập nhật điện năng (kWh)</ThemedText>
                <TextInput
                  placeholder="Nhập số điện năng tiêu thụ..."
                  keyboardType="numeric"
                  value={newElectricity}
                  onChangeText={setNewElectricity}
                  style={styles.input}
                  editable={!energyLoading}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowEnergyModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}>
                    <ThemedText>Hủy</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateEnergy} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>
                    {energyLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Modal Traffic */}
          <Modal visible={showTrafficModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Cập nhật giao thông</ThemedText>
                <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 12, marginBottom: 12 }}>
                  <Picker selectedValue={trafficCategory} onValueChange={(value) => setTrafficCategory(value)}>
                    <Picker.Item label="Ô tô xăng" value={1} />
                    <Picker.Item label="Xe buýt" value={2} />
                    <Picker.Item label="Tàu hỏa" value={3} />
                    <Picker.Item label="Xe đạp" value={4} />
                    <Picker.Item label="Đi bộ" value={5} />
                    <Picker.Item label="Máy bay" value={6} />
                    <Picker.Item label="Ô tô dầu" value={7} />
                  </Picker>
                </View>
                <TextInput
                  placeholder="Nhập quãng đường (km)..."
                  keyboardType="numeric"
                  value={trafficKm}
                  onChangeText={setTrafficKm}
                  style={styles.input}
                  editable={!trafficLoading}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowTrafficModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}>
                    <ThemedText>Hủy</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateTraffic} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>
                    {trafficLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: { paddingVertical: 10 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 16, fontWeight: '500', color: '#111', marginBottom: 10 },
  measureButton: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    elevation: 3,
  },
  measureButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 16, paddingTop: 10 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333' },
  headerTextContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 12 },
  helloText: { fontSize: 18, fontWeight: 'bold' },
  co2Card: { borderRadius: 20, padding: 20, backgroundColor: '#e0f8e3', marginHorizontal: 16, alignItems: 'center', marginBottom: 20 },
  co2Label: { fontSize: 16, fontWeight: 'bold', color: customColors.text },
  co2Row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  co2Value: { fontSize: 48, fontWeight: '900', color: customColors.text, lineHeight: 52 },
  co2Unit: { fontSize: 22, fontWeight: '700', color: customColors.text, marginBottom: 8, marginLeft: 2 },
  chartContainer: { alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: customColors.text, marginBottom: 10 },
  legend: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { fontSize: 13, color: customColors.text },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: customColors.text, marginVertical: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 16 },
  statBox: { width: '48%', borderRadius: 16, padding: 12, marginBottom: 10, alignItems: 'center' },
  statType: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
});
