import { TransactionStatus } from '@/services/transactionApi';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([
    {
      id: 1,
      amount: 150000,
      reason: 'Mua gói VIP 1 tháng',
      status: TransactionStatus.Completed,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      amount: 50000,
      reason: 'Nạp xu',
      status: TransactionStatus.Pending,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      amount: 200000,
      reason: 'Mua gói VIP 3 tháng',
      status: TransactionStatus.Failed,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 4,
      amount: 100000,
      reason: 'Gia hạn VIP',
      status: TransactionStatus.Cancelled,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  // Dữ liệu mẫu để test UI/UX
  const mockData = [
    {
      id: 1,
      amount: 150000,
      reason: 'Mua gói VIP 1 tháng',
      status: TransactionStatus.Completed,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      amount: 50000,
      reason: 'Nạp xu',
      status: TransactionStatus.Pending,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      amount: 200000,
      reason: 'Mua gói VIP 3 tháng',
      status: TransactionStatus.Failed,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 4,
      amount: 100000,
      reason: 'Gia hạn VIP',
      status: TransactionStatus.Cancelled,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  // Set mock data immediately
  useEffect(() => {
    setTransactions(mockData);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Dữ liệu mẫu để test UI/UX
    const mockData = [
      {
        id: 1,
        amount: 150000,
        reason: 'Mua gói VIP 1 tháng',
        status: TransactionStatus.Completed,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        amount: 50000,
        reason: 'Nạp xu',
        status: TransactionStatus.Pending,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        amount: 200000,
        reason: 'Mua gói VIP 3 tháng',
        status: TransactionStatus.Failed,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 4,
        amount: 100000,
        reason: 'Gia hạn VIP',
        status: TransactionStatus.Cancelled,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    // API call disabled for testing
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.msg}>Đang tải lịch sử thanh toán...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Lỗi</Text>
        <Text style={styles.msg}>{error}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/profile')}>
          <Text style={styles.btnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Completed:
        return 'Thành công';
      case TransactionStatus.Pending:
        return 'Đang xử lý';
      case TransactionStatus.Failed:
        return 'Thất bại';
      case TransactionStatus.Cancelled:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Completed:
        return '#059669'; // emerald-600
      case TransactionStatus.Pending:
        return '#ca8a04'; // yellow-600
      case TransactionStatus.Failed:
        return '#dc2626'; // red-600
      case TransactionStatus.Cancelled:
        return '#4b5563'; // gray-600
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0fdf4' }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id ?? Math.random())}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
            <Text style={styles.headerSubtitle}>Theo dõi các hoạt động thanh toán của bạn</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.msg}>Chưa có giao dịch nào.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.topRow}>
                <Text style={styles.amount}>{(item.amount ?? 0).toLocaleString()} VND</Text>
                <Text style={[
                  styles.status,
                  { color: getStatusColor(item.status) }
                ]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>
              <Text style={styles.date}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: '#f0fdf4' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '900', 
    marginBottom: 8,
    color: '#166534' // green-800
  },
  msg: { 
    opacity: 0.9, 
    textAlign: 'center',
    color: '#166534' 
  },
  btn: { 
    marginTop: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    backgroundColor: '#22c55e', // green-500
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '800' 
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#166534',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#166534',
    opacity: 0.8,
  },
  row: { 
    flexDirection: 'row',
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: { 
    fontSize: 18, 
    fontWeight: '800',
    color: '#166534',
  },
  reason: { 
    fontSize: 14,
    color: '#166534',
    opacity: 0.8,
    marginBottom: 4,
  },
  status: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  date: { 
    fontSize: 12, 
    opacity: 0.6,
    color: '#166534',
  },
});
