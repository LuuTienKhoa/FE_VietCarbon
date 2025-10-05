import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  // Custom colors for profile design
  const backgroundColor = '#e6fcd9'; // light green background
  const tintColor = '#b6ff4a'; // neon green for avatar and highlights
  const textColor = '#222';
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <View style={[styles.avatarWrapper, { backgroundColor: tintColor }]}> 
          <View style={[styles.avatar, { backgroundColor: '#222' }]} />
        </View>
        <ThemedText type="title" style={styles.name}>Tuan Anh</ThemedText>
        <ThemedText style={[styles.username, { color: textColor }]}>@ahnn23</ThemedText>
        <View style={styles.metaRow}>
          <IconSymbol size={16} name="location.fill" color={textColor} />
          <ThemedText style={styles.metaText}>TPHCM, Việt Nam</ThemedText>
          <IconSymbol size={16} name="checkmark.seal.fill" color={tintColor} />
          <ThemedText style={styles.metaText}>Pro Account</ThemedText>
        </View>
      </ThemedView>

      <View style={styles.sectionDivider} />

      <View style={styles.list}>
        {[
          { icon: 'gearshape.fill', label: 'Cài đặt' },
          { icon: 'person.crop.circle', label: 'Thông tin cá nhân' },
          { icon: 'creditcard.fill', label: 'Gói và thanh toán', route: '/vip-packages' },
          { icon: 'questionmark.circle', label: 'Hỗ trợ' },
          { icon: 'envelope.fill', label: 'Gửi phản hồi' },
        ].map((item: any) => (
          <TouchableOpacity 
            key={item.label} 
            style={[styles.item, { backgroundColor: '#e6fcd9' }]}
            onPress={() => item.route && router.push(item.route as any)}
          > 
            <IconSymbol size={22} name={item.icon as any} color={textColor} />
            <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={handleLogout} style={[styles.item, styles.logoutItem]}>
          <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color="#F44336" />
          <ThemedText style={[styles.itemLabel, { color: '#F44336' }]}>Đăng xuất</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor moved to inline style for neon green
    borderWidth: 6,
    borderColor: '#fff',
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    // backgroundColor set inline for dark icon
  },
  name: {
    marginTop: 16,
    fontSize: 24,
  },
  username: {
    marginTop: 4,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    marginHorizontal: 6,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#b6ff4a33', // faint neon green
    marginVertical: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    // backgroundColor set inline for each item
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutItem: {
    backgroundColor: '#F4433611',
    borderWidth: 1,
    borderColor: '#F44336',
  },
});


