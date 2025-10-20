import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiService } from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const primaryColor = '#A8FF8A';

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
          [{ text: 'OK', onPress: () => router.push('/login') }]
        );
      } else {
        setError(response.error || 'Đăng ký thất bại');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi trong quá trình đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ThemedText style={styles.title}>Tạo tài khoản</ThemedText>
      <ThemedText style={styles.subtitle}>
        Đã có tài khoản?{' '}
        <Text style={{ color: primaryColor }} onPress={() => router.push('/login')}>
          Đăng nhập
        </Text>
      </ThemedText>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email/Số điện thoại"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại (tùy chọn)"
        placeholderTextColor="#888"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : (
        <TouchableOpacity style={styles.signupButton} onPress={handleRegister}>
          <Text style={styles.signupText}>Đăng ký</Text>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 160,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: '#A8FF8A',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  signupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
});
