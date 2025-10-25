import { Transaction, transactionApi, TransactionStatus } from "@/services/transactionApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const StatusPill = ({ status }: { status: TransactionStatus }) => {
  const map = {
    [TransactionStatus.Completed]: { label: "Hoàn thành", color: "#16a34a", bg: "#dcfce7", icon: "checkmark-circle" },
    [TransactionStatus.Pending]: { label: "Đang xử lý", color: "#facc15", bg: "#fef9c3", icon: "time" },
    [TransactionStatus.Failed]: { label: "Thất bại", color: "#ef4444", bg: "#fee2e2", icon: "close-circle" },
    [TransactionStatus.Cancelled]: { label: "Đã hủy", color: "#6b7280", bg: "#f3f4f6", icon: "ban" },
  };
  const item = map[status] || { label: "Không xác định", color: "#6b7280", bg: "#f3f4f6", icon: "help" };

  return (
    <View style={[styles.statusPill, { backgroundColor: item.bg }]}>
      <Ionicons name={item.icon as any} size={16} color={item.color} />
      <Text style={[styles.statusText, { color: item.color, marginLeft: 6 }]}>{item.label}</Text>
    </View>
  );
};

const TransactionCard = ({ item }: { item: Transaction }) => {
  const iconColor = "#15803d";
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.cardLeft}>
        <LinearGradient colors={["#bbf7d0", "#86efac"]} style={styles.iconCircle}>
          <Ionicons name="cash-outline" size={22} color={iconColor} />
        </LinearGradient>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.amount}>{item.amount.toLocaleString()}₫</Text>
        <Text style={styles.reason}>{item.reason || "Không có lý do"}</Text>
        <Text style={styles.date}>{new Date(item.createdAt ?? "").toLocaleString("vi-VN")}</Text>
      </View>

      <View style={styles.cardRight}>
        <StatusPill status={item.status} />
      </View>
    </TouchableOpacity>
  );
};

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const getUserId = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      if (!userJson) return null;
      const user = JSON.parse(userJson);
      return user?.id ?? user?.userId ?? null;
    } catch (e) {
      console.error("❌ Lỗi đọc user:", e);
      return null;
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Không tìm thấy thông tin người dùng");

      const res = await transactionApi.list(userId);
      if (!res.success) throw new Error(res.message || "Không thể tải giao dịch");

      setTransactions(res.data ?? []);
    } catch (err: any) {
      console.error("⚠️ Lỗi tải giao dịch:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  const totalAmount = useMemo(() => transactions.reduce((s, t) => s + (t.amount ?? 0), 0), [transactions]);

  if (loading)
    return (
      <LinearGradient colors={["#d9f99d", "#bbf7d0"]} style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
      </LinearGradient>
    );

  if (error)
    return (
      <LinearGradient colors={["#d9f99d", "#bbf7d0"]} style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={fetchTransactions} style={styles.retryButton}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );

  return (
    
    <LinearGradient colors={["#e0fce0", "#b4f2a7"]} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: ' ',
          headerTitleStyle: { fontWeight: '800' },
          headerTintColor: '#0f2610',
        }}
      />
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>💳 Lịch sử giao dịch</Text>
      </View>

      {/* Content */}
      {transactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="file-tray-outline" size={52} color="#9ca3af" style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
          <Text style={styles.emptyText}>
            Bạn chưa thực hiện giao dịch nào. Hãy thử mua gói VIP để ủng hộ cộng đồng 🌱
          </Text>        
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />}
          renderItem={({ item }) => <TransactionCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 60,
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "800",
    color: "#065f46",
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardLeft: { marginRight: 12 },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  amount: { fontSize: 18, fontWeight: "700", color: "#15803d" },
  reason: { fontSize: 14, color: "#374151", marginTop: 3 },
  date: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  cardRight: { marginLeft: 8 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#064e3b", fontSize: 16, fontWeight: "500" },
  errorText: { color: "#dc2626", marginBottom: 10, fontSize: 16, fontWeight: "600" },
  retryButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#374151", marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: "center", color: "#6b7280", marginBottom: 16, lineHeight: 20 },
  buyButton: { backgroundColor: "#16a34a", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 25 },
  buyText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

export default HistoryScreen;
