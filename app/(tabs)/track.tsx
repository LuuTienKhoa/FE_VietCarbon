import { ApiResponse, apiService, EnergyUsageRequest, FoodUsageRequest, PlasticUsageRequest, TrafficUsageRequest, User } from '@/services/api';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ThemedText } from '../../components/themed-text';
import { IconSymbol } from '../../components/ui/icon-symbol';

// Hàm tiện ích để tính tổng CO2 cho một danh sách
const calculateTotalCo2 = (data: any[] | undefined, fallbackKey: string, fallbackCoeff: number) => {
  // Đảm bảo data là một mảng và tính tổng
  return (data || []).reduce((sum, item) => {
    // Nếu có co2Estimate, ưu tiên dùng nó
    // Nếu không, dùng giá trị fallback được nhân với hệ số
    const fallbackValue = Number(item[fallbackKey] ?? 0);
    
    // Đảm bảo kết quả là số hợp lệ
    const co2 = Number(item.co2Estimate ?? 0); 

    if (co2 > 0) {
        return sum + co2;
    }
    
    // Dùng công thức fallback
    return sum + (fallbackValue * fallbackCoeff);

  }, 0);
};

export default function MeasureScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [co2, setCo2] = useState(0);
  const [active, setActive] = useState<'traffic' | 'food' | 'energy' | 'plastic' | null>(null);

  const [form, setForm] = useState({
    vehicle: '',
    distance: '',
    foodType: '',
    foodAmount: '',
    energySource: '',
    energyAmount: '',
    plasticType: '',
    plasticQty: '',
  });

  const [categoryCo2, setCategoryCo2] = useState({
    traffic: 0,
    food: 0,
    energy: 0,
    plastic: 0,
  });

  useEffect(() => {
    fetchUser();
    fetchTotalCo2();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const categoryCo2 = await fetchCategoryCo2();
      setCategoryCo2(categoryCo2);
    };

    fetchData();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await apiService.user.me();
      if (res?.success && res?.data) setUser(res.data);
    } catch (e) {
      console.log('Không thể lấy thông tin user', e);
    }
  };

  const fetchTotalCo2 = async () => {
    setLoading(true);
    try {
      const [traffic, food, energy, plastic] = await Promise.all([
        apiService.trafficUsage.list(),
        apiService.foodUsage.list(),
        apiService.energyUsage.list(),
        apiService.plasticUsage.list(),
      ]);

      const totalCo2 =
        calculateTotalCo2(traffic.data, 'distanceKm', 0.21) +
        calculateTotalCo2(food.data, 'amount', 0.5) +
        calculateTotalCo2(energy.data, 'amount', 0.233) +
        calculateTotalCo2(plastic.data, 'quantity', 6.0);

      setCo2(totalCo2);
    } catch (err) {
      console.error('Error fetching CO2 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCo2 = async () => {
    try {
      const [traffic, food, energy, plastic] = await Promise.all([
        apiService.trafficUsage.list(),
        apiService.foodUsage.list(),
        apiService.energyUsage.list(),
        apiService.plasticUsage.list(),
      ]);

      return {
        traffic: calculateTotalCo2(traffic.data, 'distanceKm', 0.21),
        food: calculateTotalCo2(food.data, 'amount', 0.5),
        energy: calculateTotalCo2(energy.data, 'amount', 0.233),
        plastic: calculateTotalCo2(plastic.data, 'quantity', 6.0),
      };
    } catch (err) {
      console.error('Error fetching category CO2 data:', err);
      return { traffic: 0, food: 0, energy: 0, plastic: 0 };
    }
  };

  // Hàm kiểm tra tính hợp lệ của form trước khi gửi
  const validateForm = (type: 'traffic' | 'food' | 'energy' | 'plastic'): boolean => {
    const validateField = (field: string, value: string, errorMessage: string): boolean => {
      if (field.trim() === '' || Number(value) <= 0 || isNaN(Number(value))) {
        Alert.alert('Lỗi nhập liệu', errorMessage);
        return false;
      }
      return true;
    };

    switch (type) {
      case 'traffic':
        return validateField(
          form.vehicle,
          form.distance,
          'Vui lòng nhập phương tiện và quãng đường hợp lệ (km > 0).'
        );
      case 'food':
        return validateField(
          form.foodType,
          form.foodAmount,
          'Vui lòng nhập loại thực phẩm và khối lượng hợp lệ (gram > 0).'
        );
      case 'energy':
        return validateField(
          form.energySource,
          form.energyAmount,
          'Vui lòng nhập nguồn điện và số điện tiêu thụ hợp lệ (kWh > 0).'
        );
      case 'plastic':
        return validateField(
          form.plasticType,
          form.plasticQty,
          'Vui lòng nhập loại nhựa và số lượng hợp lệ (số lượng > 0).'
        );
      default:
        Alert.alert('Lỗi nhập liệu', 'Loại biểu mẫu không hợp lệ.');
        return false;
    }
  };

  // ========== HANDLERS ==========
  const handleSave = async (type: 'traffic' | 'food' | 'energy' | 'plastic') => {
    if (!validateForm(type)) {
      alert('Please fill out all required fields correctly.');
      return;
    }

    setSending(true);
    try {
      let payload;
      let api: (payload: any) => Promise<ApiResponse<any>>;

      switch (type) {
        case 'traffic':
          payload = {
            mode: form.vehicle,
            distanceKm: Number(form.distance),
          } as TrafficUsageRequest;
          api = apiService.trafficUsage.create;
          break;
        case 'food':
          payload = {
            type: form.foodType,
            amount: Number(form.foodAmount),
          } as FoodUsageRequest;
          api = apiService.foodUsage.create;
          break;
        case 'energy':
          payload = {
            source: form.energySource,
            amount: Number(form.energyAmount),
          } as EnergyUsageRequest;
          api = apiService.energyUsage.create;
          break;
        case 'plastic':
          payload = {
            item: form.plasticType,
            quantity: Number(form.plasticQty),
          } as PlasticUsageRequest;
          api = apiService.plasticUsage.create;
          break;
        default:
          throw new Error('Invalid type');
      }

      await api(payload);
      resetForm();
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Failed to save data. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm({
      vehicle: '',
      distance: '',
      foodType: '',
      foodAmount: '',
      energySource: '',
      energyAmount: '',
      plasticType: '',
      plasticQty: '',
    });
    setActive(null);
    fetchTotalCo2();
  };
  
  // Tính toán trạng thái hợp lệ của form cho UI
  const isTrafficFormValid = form.vehicle.trim() !== '' && Number(form.distance) > 0 && !isNaN(Number(form.distance));
  const isFoodFormValid = form.foodType.trim() !== '' && Number(form.foodAmount) > 0 && !isNaN(Number(form.foodAmount));
  const isEnergyFormValid = form.energySource.trim() !== '' && Number(form.energyAmount) > 0 && !isNaN(Number(form.energyAmount));
  const isPlasticFormValid = form.plasticType.trim() !== '' && Number(form.plasticQty) > 0 && !isNaN(Number(form.plasticQty));

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F9FFF4' }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.greeting}>
          {user ? `Hello, ${user.userName || user.email?.split('@')[0]} 👋` : 'Hello 👋'}
        </ThemedText>
        <ThemedText style={styles.subGreeting}>Theo dõi lượng phát thải CO₂ hằng ngày</ThemedText>
      </View>

      {/* GAUGE */}
      <View style={styles.gaugeBox}>
        <ThemedText style={styles.gaugeTitle}>Phát thải CO₂ hôm nay</ThemedText>
        {loading ? (
            <ActivityIndicator size="small" color="#333" />
        ) : (
            <>
                <Gauge value={co2} max={10} />
        <ThemedText style={styles.gaugeDesc}>
                    {co2 > 0 ? `${co2.toFixed(2)} kg CO₂` : 'Chưa có dữ liệu phát thải. Ghi nhận hoạt động đầu tiên của bạn!'}
        </ThemedText>
            </>
        )}
      </View>

      {/* FORM */}
      <View style={styles.measureBox}>
        <ThemedText style={styles.sectionTitle}>Ghi nhận hoạt động</ThemedText>

        {/* 4 nút */}
        <View style={styles.categoryRow}>
          {[
            { key: 'traffic', icon: 'car.fill', label: 'Phương tiện', co2: categoryCo2.traffic },
            { key: 'food', icon: 'fork.knife', label: 'Đồ ăn', co2: categoryCo2.food },
            { key: 'energy', icon: 'bolt.fill', label: 'Điện', co2: categoryCo2.energy },
            { key: 'plastic', icon: 'trash.fill', label: 'Nhựa', co2: categoryCo2.plastic },
          ].map((b) => (
            <TouchableOpacity
              key={b.key}
              style={[styles.categoryBtn, active === b.key && styles.categoryActive]}
              onPress={() => setActive(active === b.key ? null : (b.key as any))}>
              <IconSymbol name={b.icon} color="#111" size={22} />
              <ThemedText style={styles.categoryText}>{b.label}</ThemedText>
              <ThemedText style={styles.categoryCo2}>{b.co2.toFixed(2)} kg CO₂</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* FORM CHI TIẾT */}
        {active === 'traffic' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Phương tiện (Car, Bus, Bike...)"
              value={form.vehicle}
              onChangeText={(t) => setForm({ ...form, vehicle: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quãng đường (km)"
              keyboardType="numeric"
              value={form.distance}
              onChangeText={(t) => setForm({ ...form, distance: t.replace(/[^0-9.]/g, '') })}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (!isTrafficFormValid || sending) && { opacity: 0.5 }]}
              disabled={!isTrafficFormValid || sending}
              onPress={() => handleSave('traffic')}>
              <IconSymbol name="square.and.arrow.down.fill" color="#fff" size={18} />
              <ThemedText style={styles.saveText}>
                {sending ? 'Đang lưu...' : 'Lưu phương tiện'}
              </ThemedText>
            </TouchableOpacity>
          </>
        )}

        {active === 'food' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Loại thực phẩm (Thịt, Rau...)"
              value={form.foodType}
              onChangeText={(t) => setForm({ ...form, foodType: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Khối lượng (gram)"
              keyboardType="numeric"
              value={form.foodAmount}
              onChangeText={(t) => setForm({ ...form, foodAmount: t.replace(/[^0-9.]/g, '') })}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (!isFoodFormValid || sending) && { opacity: 0.5 }]}
              disabled={!isFoodFormValid || sending}
              onPress={() => handleSave('food')}>
              <IconSymbol name="square.and.arrow.down.fill" color="#fff" size={18} />
              <ThemedText style={styles.saveText}>
                {sending ? 'Đang lưu...' : 'Lưu thực phẩm'}
            </ThemedText>
            </TouchableOpacity>
          </>
        )}

        {active === 'energy' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nguồn điện (Nhà, Cơ quan...)"
              value={form.energySource}
              onChangeText={(t) => setForm({ ...form, energySource: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện tiêu thụ (kWh)"
              keyboardType="numeric"
              value={form.energyAmount}
              onChangeText={(t) => setForm({ ...form, energyAmount: t.replace(/[^0-9.]/g, '') })}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (!isEnergyFormValid || sending) && { opacity: 0.5 }]}
              disabled={!isEnergyFormValid || sending}
              onPress={() => handleSave('energy')}>
              <IconSymbol name="square.and.arrow.down.fill" color="#fff" size={18} />
              <ThemedText style={styles.saveText}>
                {sending ? 'Đang lưu...' : 'Lưu điện năng'}
            </ThemedText>
            </TouchableOpacity>
          </>
        )}

        {active === 'plastic' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Loại nhựa (Chai, Túi...)"
              value={form.plasticType}
              onChangeText={(t) => setForm({ ...form, plasticType: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số lượng (cái)"
              keyboardType="numeric"
              value={form.plasticQty}
              onChangeText={(t) => setForm({ ...form, plasticQty: t.replace(/[^0-9]/g, '') })}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (!isPlasticFormValid || sending) && { opacity: 0.5 }]}
              disabled={!isPlasticFormValid || sending}
              onPress={() => handleSave('plastic')}>
              <IconSymbol name="square.and.arrow.down.fill" color="#fff" size={18} />
              <ThemedText style={styles.saveText}>
                {sending ? 'Đang lưu...' : 'Lưu nhựa'}
                  </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

/* ---------- Gauge ---------- */
function Gauge({ value, max }: { value: number; max: number }) {
  const percent = Math.min(value / max, 1);
  const angle = 180 * percent - 90;
  const needleX = 100 + 80 * Math.cos((angle * Math.PI) / 180);
  const needleY = 100 + 80 * Math.sin((angle * Math.PI) / 180);

  return (
    <Svg width="200" height="120" viewBox="0 0 200 120">
      <Path d="M20 100 A80 80 0 0 1 180 100" stroke="#eee" strokeWidth="16" fill="none" />
      <Path
        d="M20 100 A80 80 0 0 1 180 100"
        stroke="#B6FF4A"
        strokeWidth="16"
        fill="none"
        strokeDasharray={[180 * percent, 180]}
      />
      <Path d={`M100,100 L${needleX},${needleY}`} stroke="#222" strokeWidth="3" />
      <Circle cx="100" cy="100" r="4" fill="#222" />
    </Svg>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 16,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  gaugeBox: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFFCEF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gaugeTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  gaugeDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  measureBox: {
    backgroundColor: '#EFFFF4',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  categoryBtn: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryText: {
    fontWeight: '600',
    color: '#111',
  },
  categoryCo2: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryActive: {
    backgroundColor: '#B6FF4A55',
    borderColor: '#b6ff4a',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});