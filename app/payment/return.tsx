// // app/payment/return.tsx
// import { useEffect, useState } from "react";
// import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";

// // TODO: đổi BASE_URL theo môi trường của bạn
// const BASE_URL = __DEV__
//   ? "http://10.0.2.2:5099"            // Android emulator -> BE chạy trên máy: https://localhost:5099
//   : "https://api.your-domain.com";    // Prod

// export default function PaymentReturnScreen() {
//   const router = useRouter();
//   const { orderCode, id } = useLocalSearchParams<{ orderCode?: string; id?: string }>();
//   const [message, setMessage] = useState<string>("Đang xác minh giao dịch...");

//   useEffect(() => {
//     let alive = true;

//     const verify = async () => {
//       if (!orderCode || !id) {
//         setMessage("Thiếu tham số orderCode/id trong URL.");
//         return;
//       }
//       try {
//         const res = await fetch(`${BASE_URL}/payments/verify?orderCode=${orderCode}&id=${id}`);
//         const data = await res.json();

//         if (!alive) return;

//         // Kỳ vọng: data.status ∈ { PAID | PENDING | CANCELLED | FAILED | EXPIRED }
//         if (data.status === "PAID") {
//           router.replace({
//             pathname: "/payment/success",
//             params: { orderCode: String(orderCode), id: String(id) },
//           });
//         } else if (data.status === "PENDING") {
//           // Poll đơn giản tối đa ~30s
//           let tries = 0;
//           setMessage("Đang chờ xác nhận từ cổng thanh toán...");

//           const interval = setInterval(async () => {
//             tries++;
//             try {
//               const r = await fetch(`${BASE_URL}/payments/verify?orderCode=${orderCode}&id=${id}`);
//               const d = await r.json();
//               if (!alive) { clearInterval(interval); return; }

//               if (d.status === "PAID") {
//                 clearInterval(interval);
//                 router.replace({ pathname: "/payment/success", params: { orderCode: String(orderCode), id: String(id) }});
//               } else if (tries >= 6) { // ~30s
//                 clearInterval(interval);
//                 router.replace({ pathname: "/payment/fail", params: { orderCode: String(orderCode), id: String(id), reason: d.status ?? "UNKNOWN" }});
//               }
//             } catch {
//               // ignore & continue polling
//             }
//           }, 5000);
//         } else {
//           router.replace({
//             pathname: "/payment/fail",
//             params: { orderCode: String(orderCode), id: String(id), reason: data.status ?? "UNKNOWN" },
//           });
//         }
//       } catch (e) {
//         setMessage("Có lỗi khi xác minh. Vui lòng thử lại.");
//         setTimeout(() => {
//           router.replace({ pathname: "/payment/fail", params: { orderCode: String(orderCode), id: String(id), reason: "VERIFY_ERROR" }});
//         }, 1200);
//       }
//     };

//     verify();
//     return () => { alive = false; };
//   }, [orderCode, id]);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f6fff1" }}>
//       <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
//         <ActivityIndicator />
//         <Text style={{ marginTop: 12 }}>{message}</Text>
//       </View>
//     </SafeAreaView>
//   );
// }
