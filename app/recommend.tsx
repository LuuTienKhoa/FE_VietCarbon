// app/recommend/[userActivityId].tsx
import { recommendApi } from '@/services/recommendApi';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecommendationScreen() {
  const { userActivityId } = useLocalSearchParams<{ userActivityId?: string }>();
  const [loading, setLoading] = useState(true);
  const [recText, setRecText] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await recommendApi.getByUserActivityId(userActivityId ?? '0');
    if (res.success && res.data) setRecText(res.data.recommendation);
    else setError(res.message || 'Fetch recommendation failed.');
    setLoading(false);
  }, [userActivityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(recText);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} />
      }
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Đang lấy gợi ý…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gợi ý cho bạn</Text>
            {/* Rec text có xuống dòng và markdown đơn giản; hiển thị nguyên văn */}
            <Text style={styles.cardBody}>{recText || 'Không có dữ liệu.'}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCopy}>
              <Text style={styles.primaryBtnText}>Sao chép nội dung</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={fetchData}>
              <Text style={styles.secondaryBtnText}>Làm mới</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  loadingText: { marginTop: 8, fontSize: 14, opacity: 0.7 },
  errorWrap: { padding: 16, borderRadius: 12, backgroundColor: '#ffecec' },
  errorTitle: { fontWeight: '700', marginBottom: 8, color: '#b30000' },
  errorText: { color: '#b30000', marginBottom: 12 },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  retryText: { color: '#fff', fontWeight: '600' },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f7fdf3',
    borderWidth: 1,
    borderColor: '#e2f2d8',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardBody: { fontSize: 15, lineHeight: 22, color: '#222' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#1f2937', fontWeight: '700' },
});
