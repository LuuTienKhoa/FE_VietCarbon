import { ThemedText } from '@/components/themed-text';
import { apiService } from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const router = useRouter();
  const primary = '#A8FF8A';

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiService.user.register({
        username,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
      });
      if (response.success) {
        Alert.alert(
          'Đăng ký thành công',
          'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else {
        setError(response.error || 'Đăng ký thất bại');
      }
    } catch (e) {
      setError('Đã xảy ra lỗi trong quá trình đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Nền xanh – gradient lá */}
      <LinearGradient
        colors={['#E6FCD9', '#D9FF86', '#B6FF4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {/* Bubbles trang trí nhẹ */}
        <View style={[styles.bubble, { top: -40, right: -30 }]} />
        <View style={[styles.bubble, { bottom: -30, left: -40, width: 200, height: 200, opacity: 0.15 }]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />
                <Text style={styles.brand}>VietCarbon</Text>
              </View>
              <Text style={styles.tagline}>Tham gia cộng đồng sống xanh 🌿</Text>
            </View>

            {/* Card kính mờ */}
            <View style={styles.cardOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.86)', 'rgba(255,255,255,0.78)']}
                style={styles.card}
              >
                <ThemedText style={styles.title}>Tạo tài khoản</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Đã có tài khoản?{' '}
                  <Text style={styles.linkStrong} onPress={() => router.push('/login')}>
                    Đăng nhập
                  </Text>
                </ThemedText>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Họ và tên */}
                <View style={styles.field}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Họ và tên"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                    accessibilityLabel="Họ và tên"
                    returnKeyType="next"
                  />
                </View>

                {/* Email / SĐT */}
                <View style={styles.field}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    accessibilityLabel="Email hoặc số điện thoại"
                    returnKeyType="next"
                  />
                </View>

                {/* Mật khẩu */}
                <View style={styles.field}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPwd}
                    accessibilityLabel="Mật khẩu"
                    returnKeyType="next"
                  />
                  <Pressable
                    onPress={() => setShowPwd(v => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPwd ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    style={styles.eyeBtn}
                  >
                    <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color="#374151" />
                  </Pressable>
                </View>

                {/* Xác nhận mật khẩu */}
                <View style={styles.field}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPwd2}
                    accessibilityLabel="Xác nhận mật khẩu"
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={() => setShowPwd2(v => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPwd2 ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    style={styles.eyeBtn}
                  >
                    <Ionicons name={showPwd2 ? 'eye-off-outline' : 'eye-outline'} size={20} color="#374151" />
                  </Pressable>
                </View>

                {/* Số điện thoại (tuỳ chọn) */}
                <View style={styles.field}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại (tùy chọn)"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    accessibilityLabel="Số điện thoại"
                  />
                </View>

                {/* Nút đăng ký */}
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.disabled]}
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Đăng ký"
                >
                  {loading ? (
                    <ActivityIndicator color="#0B3520" />
                  ) : (
                    <>
                      <Ionicons name="leaf-outline" size={18} color="#0B3520" />
                      <Text style={styles.primaryText}>Đăng ký</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Gợi ý lợi ích xanh */}
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <Ionicons name="sparkles-outline" size={14} color="#0B3520" />
                    <Text style={styles.badgeText}>Giao diện trẻ</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="planet-outline" size={14} color="#0B3520" />
                    <Text style={styles.badgeText}>Sống xanh</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#0B3520" />
                    <Text style={styles.badgeText}>Bảo mật</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  brand: { fontSize: 18, fontWeight: '800', color: '#0B3520', letterSpacing: 0.2 },
  tagline: { marginTop: 4, color: '#14532D', fontSize: 13, fontWeight: '600' },

  cardOuter: { alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    ...(Platform.OS === 'android' ? { elevation: 6 } : null),
  },

  title: { fontSize: 22, fontWeight: '800', color: '#0B3520', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#14532D', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  linkStrong: { color: '#0B3520', fontWeight: '800' },

  field: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F7EB',
    borderWidth: 1,
    borderColor: '#DAF2C4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  eyeBtn: { padding: 6 },

  errorText: { color: 'red', marginBottom: 8, textAlign: 'center' },

  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    backgroundColor: '#A8FF8A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  disabled: { opacity: 0.6 },
  primaryText: { fontSize: 16, fontWeight: '800', color: '#0B3520' },

  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(168,255,138,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(11,53,32,0.12)',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#0B3520' },
});
