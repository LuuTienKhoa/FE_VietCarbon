import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/wrapper';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService, User, UserActivities } from '@/services/api';
import { energyUsageApi } from '@/services/energyUsageApi';
import { foodUsageApi, UpdateFoodUsageRequest } from '@/services/foodUsageApi';
// Import plastic api
import { plasticUsageApi, UpdatePlasticUsageRequest } from '@/services/plasticUsageApi';
import { trafficUsageApi, UpdateTrafficUsageRequest } from '@/services/trafficUsageApi';
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
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const customColors = {
  cardBg: '#f3fff1',
  text: '#111',
  tint: '#4CAF50',
};

// --- CONSTANTS ---
const FOOD_CATEGORIES = [
  { label: 'Thịt Bò', value: 1 }, { label: 'Thịt Cừu', value: 2 },
  { label: 'Thịt Heo', value: 3 }, { label: 'Thịt Gà', value: 4 },
  { label: 'Cá', value: 5 }, { label: 'Trứng', value: 6 },
  { label: 'Gạo', value: 7 }, { label: 'Rau củ', value: 8 },
  { label: 'Khác', value: 9 },
];

const PLASTIC_CATEGORIES = [
    { label: "Chai nhựa", value: 1 }, { label: "Túi nilon", value: 2 },
    { label: "Cốc nhựa", value: 3 }, { label: "Ống hút nhựa", value: 4 },
    { label: "Hộp nhựa", value: 5 }, { label: "Khác", value: 6 },
];

// --- UTILS ---
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

  // Modal Food
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodItems, setFoodItems] = useState<{ foodCategory: number; weight: string }[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);

  // --- START NEW CODE FOR PLASTIC ---
  // Modal Plastic
  const [showPlasticModal, setShowPlasticModal] = useState(false);
  const [plasticItems, setPlasticItems] = useState<{ plasticCategory: number; weight: string }[]>([]);
  const [plasticLoading, setPlasticLoading] = useState(false);
  // --- END NEW CODE FOR PLASTIC ---

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await apiService.user.me();
      if (!userRes.success || !userRes.data) throw new Error('Không thể xác thực người dùng.');
      setCurrentUser(userRes.data);

      const activitiesRes = await apiService.userActivities.getByUserId(userRes.data.id);
      if (activitiesRes.success && activitiesRes.data) {
        const today = new Date();
        const todayData = activitiesRes.data.find((x) => x.date && isSameDay(x.date, today));
        setTodayActivity(todayData ?? null);
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

  // --- USEEFFECT HOOKS TO POPULATE MODALS ---
  useEffect(() => {
    if (showTrafficModal && todayActivity?.trafficUsage) {
      setTrafficKm(String(todayActivity.trafficUsage.distance ?? ''));
      setTrafficCategory(todayActivity.trafficUsage.trafficCategory ?? 1);
    }
  }, [showTrafficModal, todayActivity]);

  useEffect(() => {
    if (showFoodModal && todayActivity?.foodUsage?.foodItems) {
      const initialItems = todayActivity.foodUsage.foodItems.map((item) => ({
        foodCategory: item.foodCategory,
        weight: String(item.weight ?? ''),
      }));
      setFoodItems(initialItems.length > 0 ? initialItems : [{ foodCategory: 1, weight: '' }]);
    } else if (showFoodModal) {
      setFoodItems([{ foodCategory: 1, weight: '' }]);
    }
  }, [showFoodModal, todayActivity]);

  // --- START NEW CODE FOR PLASTIC ---
  useEffect(() => {
    if (showPlasticModal && todayActivity?.plasticUsage?.plasticItems) {
        const initialItems = todayActivity.plasticUsage.plasticItems.map(item => ({
            plasticCategory: item.plasticCategory,
            weight: String(item.weight ?? ''),
        }));
        setPlasticItems(initialItems.length > 0 ? initialItems : [{ plasticCategory: 1, weight: '' }]);
    } else if (showPlasticModal) {
        setPlasticItems([{ plasticCategory: 1, weight: '' }]);
    }
  }, [showPlasticModal, todayActivity]);
  // --- END NEW CODE FOR PLASTIC ---


  // --- MEMOIZED VALUES ---
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


  // --- UPDATE HANDLERS ---
  const handleUpdateEnergy = async () => {
    if (!todayActivity?.energyUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID năng lượng.');
    const electricity = parseFloat(newElectricity);
    if (isNaN(electricity) || electricity < 0) return Alert.alert('Lỗi', 'Giá trị không hợp lệ.');

    setEnergyLoading(true);
    try {
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
      } else throw new Error(res.message || 'Cập nhật thất bại.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setEnergyLoading(false);
    }
  };

  const handleUpdateTraffic = async () => {
    if (!todayActivity?.trafficUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID giao thông.');
    const km = parseFloat(trafficKm);
    if (isNaN(km) || km < 0) return Alert.alert('Lỗi', 'Quãng đường không hợp lệ.');
    const co2Rates: Record<number, number> = { 1: 0.045, 2: 0.102, 3: 0.041, 4: 0, 5: 0, 6: 0.225, 7: 0.23 };

    setTrafficLoading(true);
    try {
      const payload: UpdateTrafficUsageRequest = {
        id: todayActivity.trafficUsage.id,
        distance: km,
        trafficCategory,
        cO2Emission: km * (co2Rates[trafficCategory] ?? 0),
        date: new Date().toISOString(),
        activityId: todayActivity.id,
      };
      const res = await trafficUsageApi.update(todayActivity.trafficUsage.id, payload);
      if (res.success) {
        Alert.alert('Thành công', 'Đã cập nhật giao thông!');
        setShowTrafficModal(false);
        fetchData();
      } else throw new Error(res.message ||'Cập nhật thất bại.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setTrafficLoading(false);
    }
  };

  const handleUpdateFood = async () => {
    if (!todayActivity?.foodUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID thực phẩm.');

    const processedItems = foodItems
      .map(item => ({ foodCategory: item.foodCategory, weight: parseFloat(item.weight) }))
      .filter(item => !isNaN(item.weight) && item.weight > 0);

    if (processedItems.length === 0) {
      return Alert.alert('Lỗi', 'Vui lòng nhập ít nhất một loại thực phẩm hợp lệ.');
    }

    setFoodLoading(true);
    try {
      const payload: UpdateFoodUsageRequest = {
        id: todayActivity.foodUsage.id,
        activityId: todayActivity.id,
        date: new Date().toISOString(),
        foodItems: processedItems,
      };
      const res = await foodUsageApi.update(todayActivity.foodUsage.id, payload);
      if (res.success) {
        Alert.alert('Thành công', 'Đã cập nhật thực phẩm!');
        setShowFoodModal(false);
        fetchData();
      } else throw new Error(res.message || 'Cập nhật thất bại.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setFoodLoading(false);
    }
  };

  // --- START NEW CODE FOR PLASTIC ---
  const handleUpdatePlastic = async () => {
      if (!todayActivity?.plasticUsage?.id) return Alert.alert('Lỗi', 'Không tìm thấy ID nhựa.');

      const processedItems = plasticItems
          .map(item => ({ plasticCategory: item.plasticCategory, weight: parseFloat(item.weight) }))
          .filter(item => !isNaN(item.weight) && item.weight > 0);

      if (processedItems.length === 0) {
          return Alert.alert('Lỗi', 'Vui lòng nhập ít nhất một loại nhựa hợp lệ.');
      }

      setPlasticLoading(true);
      try {
          const payload: UpdatePlasticUsageRequest = {
              id: todayActivity.plasticUsage.id,
              activityId: todayActivity.id,
              date: new Date().toISOString(),
              plasticItems: processedItems,
          };
          const res = await plasticUsageApi.update(todayActivity.plasticUsage.id, payload);
          if (res.success) {
              Alert.alert('Thành công', 'Đã cập nhật nhựa!');
              setShowPlasticModal(false);
              fetchData();
          } else throw new Error(res.message || 'Cập nhật thất bại.');
      } catch (e: any) {
          Alert.alert('Lỗi', e.message);
      } finally {
          setPlasticLoading(false);
      }
  };
  // --- END NEW CODE FOR PLASTIC ---


  return (
    <ScreenWrapper scroll containerStyle={{ backgroundColor: customColors.cardBg }} contentContainerStyle={styles.contentContainer}>
      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={tintColor} /><ThemedText>Đang tải dữ liệu...</ThemedText></View>
      ) : !hasTodayData ? (
        <View style={styles.noDataContainer}>
          <ThemedText style={styles.noDataText}>Chưa có dữ liệu hôm nay.</ThemedText>
          <TouchableOpacity style={styles.measureButton} onPress={() => router.push('/measure')}><ThemedText style={styles.measureButtonText}>Nhập dữ liệu</ThemedText></TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerAvatar} />
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.helloText}>Xin chào, {userName} 👋</ThemedText>
              <ThemedText style={styles.noDataText}>{todayEmission === 0 ? 'Chưa có dữ liệu hôm nay.' : 'Dữ liệu hôm nay đã được ghi nhận.'}</ThemedText>
            </View>
          </View>
          <View style={styles.co2Card}>
            <ThemedText style={styles.co2Label}>Tổng lượng CO₂ hôm nay ({todayStr})</ThemedText>
            <View style={styles.co2Row}>
              <Ionicons name="cloud-outline" size={36} color="#1B5E20" style={{ marginRight: 6 }} />
              <ThemedText style={styles.co2Value}>{todayEmission.toFixed(2)}</ThemedText>
              <ThemedText style={styles.co2Unit}>kg</ThemedText>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Tỉ lệ phát thải CO₂ theo hạng mục</ThemedText>
            {pieData.length > 0 && total > 0 ? (
              <PieChart data={pieData} donut radius={100} innerRadius={55} showText textColor="white" textSize={13} />
            ) : (<ThemedText>Chưa có dữ liệu hôm nay.</ThemedText>)}
            <View style={styles.legend}>
              {usageStats.map((item, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <ThemedText style={styles.legendText}>{item.type}</ThemedText>
                </View>
              ))}
            </View>
          </View>
          <ThemedText style={styles.sectionTitle}>Phát thải chi tiết</ThemedText>
          <View style={styles.statsGrid}>
            {usageStats.map((x, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.statBox, { backgroundColor: x.color }]}
                onPress={() => {
                  if (x.type === 'Năng lượng') setShowEnergyModal(true);
                  if (x.type === 'Giao thông') setShowTrafficModal(true);
                  if (x.type === 'Thực phẩm') setShowFoodModal(true);
                  // --- START NEW CODE FOR PLASTIC ---
                  if (x.type === 'Nhựa') setShowPlasticModal(true);
                  // --- END NEW CODE FOR PLASTIC ---
                }}
              >
                <ThemedText style={styles.statType}>{x.type}</ThemedText>
                <ThemedText style={styles.statValue}>{x.emission.toFixed(2)} kg CO₂</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* All Modals */}
          <Modal visible={showEnergyModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Cập nhật điện năng (kWh)</ThemedText>
                <TextInput placeholder="Nhập số điện năng tiêu thụ..." keyboardType="numeric" value={newElectricity} onChangeText={setNewElectricity} style={styles.input} editable={!energyLoading} />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowEnergyModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}><ThemedText>Hủy</ThemedText></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateEnergy} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>{energyLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          <Modal visible={showTrafficModal} transparent animationType="fade">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <ThemedText style={styles.modalTitle}>Cập nhật giao thông</ThemedText>
                <View style={styles.pickerContainer}><Picker selectedValue={trafficCategory} onValueChange={setTrafficCategory}><Picker.Item label="Ô tô xăng" value={1} /><Picker.Item label="Xe buýt" value={2} /><Picker.Item label="Tàu hỏa" value={3} /><Picker.Item label="Xe đạp" value={4} /><Picker.Item label="Đi bộ" value={5} /><Picker.Item label="Máy bay" value={6} /><Picker.Item label="Ô tô dầu" value={7} /></Picker></View>
                <TextInput placeholder="Nhập quãng đường (km)..." keyboardType="numeric" value={trafficKm} onChangeText={setTrafficKm} style={styles.input} editable={!trafficLoading} />
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowTrafficModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}><ThemedText>Hủy</ThemedText></TouchableOpacity>
                  <TouchableOpacity onPress={handleUpdateTraffic} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>{trafficLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}</TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
          
          <Modal visible={showFoodModal} transparent animationType="fade">
             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ThemedText style={styles.modalTitle}>Cập nhật thực phẩm (gram)</ThemedText>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {foodItems.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemPickerContainer}>
                                    <Picker selectedValue={item.foodCategory} onValueChange={val => setFoodItems(items => items.map((it, i) => i === index ? {...it, foodCategory: val} : it))}>
                                        {FOOD_CATEGORIES.map(cat => <Picker.Item key={cat.value} label={cat.label} value={cat.value} />)}
                                    </Picker>
                                </View>
                                <TextInput placeholder="g" keyboardType="numeric" value={item.weight} onChangeText={text => setFoodItems(items => items.map((it, i) => i === index ? {...it, weight: text} : it))} style={styles.itemWeightInput} editable={!foodLoading} />
                                <TouchableOpacity onPress={() => foodItems.length > 1 && setFoodItems(items => items.filter((_, i) => i !== index))} style={styles.removeButton}><Ionicons name="trash-bin-outline" size={22} color="#F44336" /></TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setFoodItems(items => [...items, { foodCategory: 1, weight: '' }])} style={styles.addButton}><Ionicons name="add-circle-outline" size={24} color="#4CAF50" /><ThemedText style={styles.addButtonText}>Thêm món</ThemedText></TouchableOpacity>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setShowFoodModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}><ThemedText>Hủy</ThemedText></TouchableOpacity>
                        <TouchableOpacity onPress={handleUpdateFood} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>{foodLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}</TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* --- START NEW CODE FOR PLASTIC --- */}
          <Modal visible={showPlasticModal} transparent animationType="fade">
             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ThemedText style={styles.modalTitle}>Cập nhật nhựa (gram)</ThemedText>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {plasticItems.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemPickerContainer}>
                                    <Picker selectedValue={item.plasticCategory} onValueChange={val => setPlasticItems(items => items.map((it, i) => i === index ? {...it, plasticCategory: val} : it))}>
                                        {PLASTIC_CATEGORIES.map(cat => <Picker.Item key={cat.value} label={cat.label} value={cat.value} />)}
                                    </Picker>
                                </View>
                                <TextInput placeholder="g" keyboardType="numeric" value={item.weight} onChangeText={text => setPlasticItems(items => items.map((it, i) => i === index ? {...it, weight: text} : it))} style={styles.itemWeightInput} editable={!plasticLoading} />
                                <TouchableOpacity onPress={() => plasticItems.length > 1 && setPlasticItems(items => items.filter((_, i) => i !== index))} style={styles.removeButton}><Ionicons name="trash-bin-outline" size={22} color="#F44336" /></TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                    <TouchableOpacity onPress={() => setPlasticItems(items => [...items, { plasticCategory: 1, weight: '' }])} style={styles.addButton}><Ionicons name="add-circle-outline" size={24} color="#4CAF50" /><ThemedText style={styles.addButtonText}>Thêm loại nhựa</ThemedText></TouchableOpacity>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setShowPlasticModal(false)} style={[styles.modalBtn, { backgroundColor: '#ccc' }]}><ThemedText>Hủy</ThemedText></TouchableOpacity>
                        <TouchableOpacity onPress={handleUpdatePlastic} style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]}>{plasticLoading ? <ActivityIndicator color="#fff" /> : <ThemedText style={{ color: '#fff' }}>Lưu</ThemedText>}</TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
          </Modal>
          {/* --- END NEW CODE FOR PLASTIC --- */}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  noDataText: { fontSize: 16, fontWeight: '500', color: '#111', marginBottom: 10 },
  measureButton: { marginTop: 20, paddingVertical: 16, paddingHorizontal: 32, backgroundColor: '#4CAF50', borderRadius: 30, elevation: 3 },
  measureButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingTop: 10 },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ccc' },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  helloText: { fontSize: 18, fontWeight: 'bold' },
  co2Card: { borderRadius: 20, padding: 20, backgroundColor: '#e0f8e3', alignItems: 'center', marginBottom: 20, elevation: 2 },
  co2Label: { fontSize: 16, fontWeight: 'bold', color: customColors.text },
  co2Row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  co2Value: { fontSize: 48, fontWeight: '900', color: customColors.text, lineHeight: 52 },
  co2Unit: { fontSize: 22, fontWeight: '700', color: customColors.text, marginBottom: 8, marginLeft: 2 },
  chartContainer: { alignItems: 'center', marginBottom: 20, padding: 16, backgroundColor: 'white', borderRadius: 20, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: customColors.text, marginBottom: 15 },
  legend: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 13, color: customColors.text },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: customColors.text, marginVertical: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
  statType: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  modalBtn: { paddingVertical: 12, borderRadius: 12, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  itemPickerContainer: { flex: 2.5, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginRight: 8, justifyContent: 'center' },
  itemWeightInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 5, textAlign: 'center' },
  removeButton: { marginLeft: 8, padding: 5 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginTop: 5, marginBottom: 15, borderWidth: 1, borderColor: '#4CAF50', borderStyle: 'dashed', borderRadius: 10 },
  addButtonText: { marginLeft: 8, color: '#4CAF50', fontWeight: 'bold' },
});