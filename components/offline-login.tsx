// components/offline-login.tsx
import { useUserStore } from '@/stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function OfflineLogin() {
  const router = useRouter();
  const { loadOfflineData } = useUserStore();

  const handleOfflineAccess = async () => {
    try {
      await loadOfflineData();
      router.replace('/');
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="wifi" size={64} color="#6B7280" />
        <Text style={styles.title}>Không có kết nối internet</Text>
        <Text style={styles.subtitle}>
          Bạn cần kết nối internet để đăng nhập lần đầu. 
          Sau khi đăng nhập, bạn có thể sử dụng ứng dụng offline.
        </Text>
        
        <TouchableOpacity 
          style={styles.offlineButton}
          onPress={handleOfflineAccess}
        >
          <Ionicons name="phone-portrait-outline" size={20} color="#0B3520" />
          <Text style={styles.offlineButtonText}>
            Thử truy cập offline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Ionicons name="refresh" size={20} color="#0B3520" />
          <Text style={styles.retryButtonText}>
            Thử lại kết nối
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  offlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B3520',
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8FF8A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B3520',
    marginLeft: 8,
  },
});
