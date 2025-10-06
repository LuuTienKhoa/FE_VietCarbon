import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge, Button, Card, IconSymbol } from '@/components/ui';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface VIPPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export default function VIPPackagesScreen() {
  const [selectedPackage, setSelectedPackage] = useState<string>('premium');
  const router = useRouter();

  const packages: VIPPackage[] = [
    {
      id: 'basic',
      name: 'VIP Cơ Bản',
      price: 35000,
      originalPrice: 50000,
      duration: '1 tháng',
      features: [
        'Theo dõi không giới hạn hoạt động',
        'Báo cáo chi tiết hàng tuần',
        'Gợi ý giảm CO₂ cá nhân hóa',
        'Hỗ trợ 24/7',
        'Xuất dữ liệu PDF'
      ],
      badge: 'Tiết kiệm 30%'
    },
    {
      id: 'premium',
      name: 'VIP Cao Cấp',
      price: 55000,
      originalPrice: 80000,
      duration: '1 tháng',
      features: [
        'Tất cả tính năng VIP Cơ Bản',
        'Phân tích xu hướng nâng cao',
        'Thử thách độc quyền',
        'Bảng xếp hạng toàn cầu',
        'Tích hợp thiết bị IoT',
        'Báo cáo tác động môi trường',
        'Ưu tiên tính năng mới'
      ],
      isPopular: true,
      badge: 'Tiết kiệm 31%'
    }
  ];

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handlePurchase = () => {
    const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
    if (selectedPkg) {
      Alert.alert(
        'Xác nhận thanh toán',
        `Bạn có muốn mua gói ${selectedPkg.name} với giá ${selectedPkg.price.toLocaleString('vi-VN')}đ?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Thanh toán', 
            onPress: () => {
              // TODO: Implement payment logic
              Alert.alert(
                'Thành công!', 
                'Gói VIP đã được kích hoạt thành công!',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          }
        ]
      );
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#666" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          VIP
        </ThemedText>
        <View style={styles.placeholder} />
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.subtitle}>
          Nâng cấp trải nghiệm và giảm thiểu carbon footprint của bạn
        </ThemedText>

        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              onPress={() => handleSelectPackage(pkg.id)}
            >
              <Card
                variant="outlined"
                padding="large"
                style={[
                  selectedPackage === pkg.id && styles.selectedCard,
                  pkg.isPopular && styles.popularCard
                ]}
              >
                {pkg.isPopular && (
                  <Badge variant="warning" size="small" style={styles.popularBadge}>
                    Phổ biến
                  </Badge>
                )}
                
                {pkg.badge && (
                  <Badge variant="error" size="small" style={styles.discountBadge}>
                    {pkg.badge}
                  </Badge>
                )}

              <View style={styles.packageHeader}>
                <ThemedText style={styles.packageName}>{pkg.name}</ThemedText>
                <View style={styles.priceContainer}>
                  <ThemedText style={styles.currentPrice}>
                    {formatPrice(pkg.price)}
                  </ThemedText>
                  {pkg.originalPrice && (
                    <ThemedText style={styles.originalPrice}>
                      {formatPrice(pkg.originalPrice)}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={styles.duration}>{pkg.duration}</ThemedText>
              </View>

              <View style={styles.featuresContainer}>
                {pkg.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                    <ThemedText style={styles.featureText}>{feature}</ThemedText>
                  </View>
                ))}
              </View>

                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radio,
                    selectedPackage === pkg.id && styles.radioSelected
                  ]}>
                    {selectedPackage === pkg.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={`Thanh toán ${selectedPackage ? formatPrice(packages.find(p => p.id === selectedPackage)?.price || 0) : ''}`}
          variant="primary"
          size="large"
          onPress={handlePurchase}
          disabled={!selectedPackage}
          style={styles.purchaseButton}
        />

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            • Thanh toán an toàn qua VNPay, MoMo, ZaloPay{'\n'}
            • Gói sẽ được kích hoạt ngay sau khi thanh toán{'\n'}
            • Hủy bất kỳ lúc nào, không phí phát sinh{'\n'}
            • Hỗ trợ khách hàng 24/7
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  packagesContainer: {
    gap: 20,
    marginBottom: 30,
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  popularCard: {
    borderColor: '#FF9800',
    backgroundColor: '#fff8f0',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  packageName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  radioContainer: {
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4CAF50',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  purchaseButton: {
    marginBottom: 20,
  },
  footer: {
    borderRadius: 12,
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
