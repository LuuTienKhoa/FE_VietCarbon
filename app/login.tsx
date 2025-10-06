import { useFlashMessage } from "@/components/flash-message-provider";
import { Loading } from "@/components/loading";
import { useUserStore } from "@/stores/userStore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { setAuthToken } from '../services/http';
import { userApi } from "../services/userApi";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, setError } = useUserStore();
  const { showMessage } = useFlashMessage();
  const router = useRouter();

  const primaryColor = "#A8FF8A";

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage({
        type: "warning",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
      return;
    }

    setError(null);

    try {
      const response = await userApi.login({ email, password });
      if (response.success && response.data) {
        const { token, user } = response.data;
        await AsyncStorage.setItem("auth_token", token);
        setAuthToken(token);
        showMessage({
          type: "success",
          message: "Đăng nhập thành công!",
        });
        router.replace("/(tabs)");
      } else {
        const errorMessage = response.error || "Đăng nhập thất bại";
        setError(errorMessage);
        showMessage({
          type: "error",
          message: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = "Có lỗi xảy ra khi đăng nhập";
      setError(errorMessage);
      showMessage({
        type: "error",
        message: errorMessage,
      });
    }
  };

  if (isLoading) {
    return <Loading message="Đang đăng nhập..." />;
  }

  return (
    <View style={styles.bg}>
      <View style={styles.logoRow}>
        <Image
          source={require("../assets/images/logo.jpg")}
          style={styles.logoSmall}
          resizeMode="contain"
        />
        <Text style={styles.co2Text}>CO₂</Text>
        <Text style={styles.brand}>VietCarbona</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Chào mừng trở lại</Text>
        <Text style={styles.subtitle}>Đăng nhập để truy cập tài khoản của bạn</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
        <View style={styles.row}>
          <TouchableOpacity>
            <Text style={styles.link}>Hiển thị mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Image
              source={require("../assets/images/google.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={[styles.link, { marginTop: 18 }]}>
            Chưa có tài khoản?{" "}
            <Text style={{ fontWeight: "bold" }}>Đăng ký</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#A8FF8A",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
    marginBottom: 24,
    gap: 6,
  },
  logoSmall: {
    width: 36,
    height: 36,
  },
  co2Text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 4,
  },
  brand: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    width: 320,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
    width: "100%",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  link: {
    color: "#A8FF8A",
    fontSize: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  socialBtn: {
    backgroundColor: "#F8F8F8",
    borderRadius: 50,
    padding: 8,
    marginHorizontal: 4,
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  loginButton: {
    backgroundColor: "#A8FF8A",
    borderRadius: 16,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
});
