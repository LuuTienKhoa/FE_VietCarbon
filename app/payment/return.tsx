// app/payment/return.tsx
import { me, paymentReturn } from '@/services/userApi'; // bạn tạo hàm gọi BE bên dưới
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PayOsReturn = {
  code?: string;
  desc?: string;
  success?: string | boolean; // có thể là "true"/"false"
  signature?: string;
  data?: any; // sẽ parse từ query param "data"
};

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams(); // đọc query từ deep link
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...');

  const payload = useMemo<PayOsReturn>(() => {
    // params có thể là string|string[]; normalize về string
    const pick = (k: string) => {
      const v = params[k];
      return Array.isArray(v) ? v[0] : v;
    };

    const rawSuccess = pick('success');
    const rawData = pick('data');

    let parsedData: any = undefined;
    try {
      if (rawData) parsedData = JSON.parse(decodeURIComponent(rawData));
    } catch {
      // có thể PayOS trả nhiều field riêng lẻ thay vì 1 chuỗi JSON data
      // khi đó bạn có thể map từng field từ query vào đây (orderCode, amount, ...)
      parsedData = undefined;
    }

    return {
      code: pick('code') ?? undefined,
      desc: pick('desc') ?? undefined,
      success: rawSuccess ?? undefined,
      signature: pick('signature') ?? undefined,
      data: parsedData,
    };
  }, [params]);

  useEffect(() => {
    (async () => {
      try {
        // Chuẩn hóa success về boolean
        const successBool =
          typeof payload.success === 'string'
            ? payload.success.toLowerCase() === 'true'
            : !!payload.success;

        // Nếu PayOS không trả "data" dạng JSON gói trong 1 param,
        // bạn có thể dựng lại "data" object từ các query riêng lẻ tại đây.
        // Ví dụ:
        // const orderCode = Number(params['orderCode']);
        // const amount = Number(params['amount']);
        // const data =
        //   payload.data ?? { orderCode, amount, description: params['description'], ... };

        const body = {
          code: payload.code ?? '',
          desc: payload.desc ?? '',
          success: successBool,
          signature: payload.signature ?? '',
          data: payload.data ?? {}, // nếu thiếu, BE nên cho phép null/{} và tự tra theo orderCode
        };

        // Gửi về BE để verify chữ ký & cập nhật transaction + SubscriptionType
        const res = await paymentReturn(body);

        // Sau khi BE xử lý xong, refresh hồ sơ để lấy SubscriptionType mới
        await me();

        setOk(successBool);
        // setMessage(successBool ? 'Thanh toán thành công!' : 'Thanh toán thất bại hoặc bị hủy.');
      } catch (err: any) {
        console.error('payment-return error', err?.response?.data ?? err?.message);
        setOk(false);
        setMessage('Không thể xác thực kết quả thanh toán.');
      } finally {
        setLoading(false);
      }
    })();
  }, [payload]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.msg}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      {/* <Text style={[styles.title, { color: ok ? '#065f46' : '#7f1d1d' }]}>
        {ok ? '✔ Thanh toán thành công' : '✖ Thanh toán không thành công'}
      </Text> */}
      {/* <Text style={styles.msg}>{payload.desc || message}</Text> */}

      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/profile')}>
        <Text style={styles.btnText}>Về trang cá nhân</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => router.replace('/payment/history')}>
        <Text style={[styles.btnText, { color: '#1f2937' }]}>Xem lịch sử thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  msg: { opacity: 0.8, textAlign: 'center' },
  btn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#1f2937', borderRadius: 12 },
  btnGhost: { backgroundColor: '#e5e7eb' },
  btnText: { color: '#fff', fontWeight: '800' },
});
