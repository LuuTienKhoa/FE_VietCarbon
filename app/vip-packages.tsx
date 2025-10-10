import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { upgrade } from "../services/userApi";

type PlanCode = 1 | 2;
type PlanItem = {
  plan: PlanCode;        
  label: string;
  amount: number;
  subtitle: string;
};

const PLANS: readonly PlanItem[] = [
  { plan: 1, label: "VIP Cơ Bản", amount: 25000, subtitle: "1 tháng" },
  { plan: 2, label: "VIP Cao Cấp", amount: 50000, subtitle: "1 tháng" },
];

async function onChoose(plan: PlanCode) {
  try {
    const returnUrl = Linking.createURL("payment/return");
    const cancelUrl = returnUrl;
    const res = await upgrade(plan, returnUrl, cancelUrl);
    if (!res.success) throw new Error(res.message ?? "Không tạo được liên kết thanh toán");
    const checkoutUrl: string | undefined = res.data?.checkoutUrl;
    if (!checkoutUrl) throw new Error("Thiếu checkoutUrl");
    await WebBrowser.openBrowserAsync(checkoutUrl);
  } catch (e: any) {
    console.error("upgrade error:", e?.response?.data ?? e?.message);
    Alert.alert("Thanh toán", e?.message ?? "Có lỗi xảy ra");
  }
}

export default function VipPackages() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {PLANS.map((p) => (
        <View key={p.plan} style={{ borderRadius: 16, padding: 16, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{p.label}</Text>
          <Text style={{ fontSize: 24, fontWeight: "800" }}>{p.amount.toLocaleString()}đ</Text>
          <Text style={{ color: "#666" }}>{p.subtitle}</Text>
          <TouchableOpacity
            onPress={() => onChoose(p.plan)}
            style={{ marginTop: 12, padding: 12, backgroundColor: "#16a34a", borderRadius: 10 }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Chọn gói này</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}