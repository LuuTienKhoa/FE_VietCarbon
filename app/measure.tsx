// app/measure/daily.tsx
import { ThemedText } from '@/components/themed-text';
import { ScreenWrapper } from '@/components/wrapper';
import { apiService, FoodCategory, PlasticCategory, TrafficCategory } from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Định nghĩa kiểu dữ liệu cho state của form
interface DailyLogData {
  trafficUsage: {
    distance: string;
    trafficCategory: TrafficCategory;
  };
  foodUsage: {
    foodItems: [{ foodCategory: FoodCategory; weight: string }];
  };
  plasticUsage: {
    plasticItems: [{ plasticCategory: PlasticCategory; weight: string }];
  };
  energyUsage: {
    electricityConsumption: string;
  };
}

const TRAFFIC_OPTIONS = [
  { label: 'Xe máy', value: TrafficCategory.MOTORBIKE },
  { label: 'Ô tô', value: TrafficCategory.CAR },
  { label: 'Xe buýt', value: TrafficCategory.BUS },
  { label: 'Tàu hỏa', value: TrafficCategory.TRAIN },
  { label: 'Máy bay', value: TrafficCategory.PLANE },
  { label: 'Xe đạp', value: TrafficCategory.BICYCLE },
  { label: 'Đi bộ', value: TrafficCategory.WALKING },
];

const FOOD_OPTIONS = [
  { label: 'Thịt', value: FoodCategory.MEAT },
  { label: 'Rau củ', value: FoodCategory.VEGETABLES },
  { label: 'Trái cây', value: FoodCategory.FRUITS },
  { label: 'Ngũ cốc', value: FoodCategory.GRAINS },
  { label: 'Khác', value: FoodCategory.OTHER },
];

const PLASTIC_OPTIONS = [
  { label: 'Dùng 1 lần', value: PlasticCategory.SINGLE_USE_PLASTIC },
  { label: 'Đóng gói', value: PlasticCategory.PACKAGING },
  { label: 'Chai lọ', value: PlasticCategory.BOTTLES },
  { label: 'Túi', value: PlasticCategory.BAGS },
  { label: 'Khác', value: PlasticCategory.OTHER },
];


export default function DailyLogScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<DailyLogData>({
    trafficUsage: {
      distance: '',
      trafficCategory: TrafficCategory.MOTORBIKE,
    },
    foodUsage: {
      foodItems: [{ foodCategory: FoodCategory.MEAT, weight: '' }],
    },
    plasticUsage: {
      plasticItems: [{ plasticCategory: PlasticCategory.BOTTLES, weight: '' }],
    },
    energyUsage: {
      electricityConsumption: '',
    },
  });

  const handleCategoryChange = (
    section: 'trafficUsage' | 'foodUsage' | 'plasticUsage',
    value: TrafficCategory | FoodCategory | PlasticCategory
  ) => {
    setFormData(prev => {
      if (section === 'trafficUsage') {
        return { ...prev, trafficUsage: { ...prev.trafficUsage, trafficCategory: value as TrafficCategory } };
      }
      if (section === 'foodUsage') {
        const newFoodItems = [...prev.foodUsage.foodItems];
        newFoodItems[0].foodCategory = value as FoodCategory;
        return { ...prev, foodUsage: { foodItems: newFoodItems as any } };
      }
      if (section === 'plasticUsage') {
        const newPlasticItems = [...prev.plasticUsage.plasticItems];
        newPlasticItems[0].plasticCategory = value as PlasticCategory;
        return { ...prev, plasticUsage: { plasticItems: newPlasticItems as any } };
      }
      return prev;
    });
  };

  const handleInputChange = (
    section: 'trafficUsage' | 'foodUsage' | 'plasticUsage' | 'energyUsage',
    field: string,
    value: string
  ) => {
    setFormData(prev => {
        switch (section) {
            case 'trafficUsage':
                return { ...prev, trafficUsage: { ...prev.trafficUsage, [field]: value } };
            case 'foodUsage':
                const newFoodItems = [...prev.foodUsage.foodItems];
                newFoodItems[0].weight = value;
                return { ...prev, foodUsage: { foodItems: newFoodItems as any } };
            case 'plasticUsage':
                 const newPlasticItems = [...prev.plasticUsage.plasticItems];
                newPlasticItems[0].weight = value;
                return { ...prev, plasticUsage: { plasticItems: newPlasticItems as any } };
            case 'energyUsage':
                return { ...prev, energyUsage: { ...prev.energyUsage, [field]: value } };
            default:
                return prev;
        }
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const payload = {
        trafficUsage: {
            distance: parseFloat(formData.trafficUsage.distance) || 0,
            trafficCategory: formData.trafficUsage.trafficCategory,
        },
        foodUsage: {
            foodItems: formData.foodUsage.foodItems.map(item => ({
                foodCategory: item.foodCategory,
                weight: parseFloat(item.weight) || 0,
            })),
        },
        plasticUsage: {
            plasticItems: formData.plasticUsage.plasticItems.map(item => ({
                plasticCategory: item.plasticCategory,
                weight: parseFloat(item.weight) || 0,
            })),
        },
        energyUsage: {
            electricityConsumption: parseFloat(formData.energyUsage.electricityConsumption) || 0,
        },
    };
    
    try {
        const res = await apiService.userActivities.create(payload as any);
        if (res.success) {
            Alert.alert("Thành công", "Đã ghi nhận hoạt động cho ngày mới!");
            // =========================================================
            // THAY ĐỔI Ở ĐÂY: Điều hướng về trang Track
            // =========================================================
            router.replace('/(tabs)/track'); 
        } else {
            Alert.alert("Lỗi", res.message || "Không thể lưu hoạt động. Vui lòng thử lại.");
        }
    } catch (error) {
        console.error("Lỗi khi gửi API:", error);
        Alert.alert("Lỗi hệ thống", "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.title}>Ghi nhận hoạt động hàng ngày</ThemedText>
        
        {/* Giao thông */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>🚗 Giao thông</ThemedText>
          <ThemedText style={styles.label}>Phương tiện</ThemedText>
          <View style={styles.categoryContainer}>
            {TRAFFIC_OPTIONS.map(opt => (
              <TouchableOpacity 
                key={opt.value} 
                style={[
                    styles.categoryButton, 
                    formData.trafficUsage.trafficCategory === opt.value && styles.categoryButtonActive
                ]}
                onPress={() => handleCategoryChange('trafficUsage', opt.value)}
              >
                <ThemedText style={[styles.categoryButtonText, formData.trafficUsage.trafficCategory === opt.value && styles.categoryButtonTextActive]}>{opt.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText style={styles.label}>Quãng đường (km)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 10.5"
            keyboardType="numeric"
            value={formData.trafficUsage.distance}
            onChangeText={text => handleInputChange('trafficUsage', 'distance', text)}
          />
        </View>

        {/* Thực phẩm */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>🍔 Thực phẩm</ThemedText>
          <ThemedText style={styles.label}>Loại thực phẩm chính</ThemedText>
          <View style={styles.categoryContainer}>
            {FOOD_OPTIONS.map(opt => (
              <TouchableOpacity 
                key={opt.value} 
                style={[
                    styles.categoryButton, 
                    formData.foodUsage.foodItems[0].foodCategory === opt.value && styles.categoryButtonActive
                ]}
                onPress={() => handleCategoryChange('foodUsage', opt.value)}
              >
                <ThemedText style={[styles.categoryButtonText, formData.foodUsage.foodItems[0].foodCategory === opt.value && styles.categoryButtonTextActive]}>{opt.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText style={styles.label}>Khối lượng (kg)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 200"
            keyboardType="numeric"
            value={formData.foodUsage.foodItems[0].weight}
            onChangeText={text => handleInputChange('foodUsage', 'weight', text)}
          />
        </View>

        {/* Nhựa */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>♻️ Rác thải nhựa</ThemedText>
           <ThemedText style={styles.label}>Loại nhựa chính</ThemedText>
          <View style={styles.categoryContainer}>
            {PLASTIC_OPTIONS.map(opt => (
              <TouchableOpacity 
                key={opt.value} 
                style={[
                    styles.categoryButton, 
                    formData.plasticUsage.plasticItems[0].plasticCategory === opt.value && styles.categoryButtonActive
                ]}
                onPress={() => handleCategoryChange('plasticUsage', opt.value)}
              >
                <ThemedText style={[styles.categoryButtonText, formData.plasticUsage.plasticItems[0].plasticCategory === opt.value && styles.categoryButtonTextActive]}>{opt.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText style={styles.label}>Khối lượng (gram)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 50"
            keyboardType="numeric"
            value={formData.plasticUsage.plasticItems[0].weight}
            onChangeText={text => handleInputChange('plasticUsage', 'weight', text)}
          />
        </View>

        {/* Năng lượng */}
         <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>💡 Năng lượng</ThemedText>
          <ThemedText style={styles.label}>Điện năng tiêu thụ (kWh)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 15"
            keyboardType="numeric"
            value={formData.energyUsage.electricityConsumption}
            onChangeText={text => handleInputChange('energyUsage', 'electricityConsumption', text)}
          />
        </View>

        {/* Nút Gửi */}
        <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <ThemedText style={styles.submitButtonText}>Lưu hoạt động</ThemedText>
            )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#e9e9e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  categoryButtonText: {
    fontWeight: '500',
    color: '#333'
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});