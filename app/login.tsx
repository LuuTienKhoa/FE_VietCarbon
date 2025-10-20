import { useFlashMessage } from "@/components/flash-message-provider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// ✅ Google Sign In
import { userApi } from "@/services/api";
import { setAuthToken } from "@/services/http";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
interface UserData {
  idToken: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showMessage } = useFlashMessage();
  const router = useRouter();
const handleLogin = async () => {
    if (!email || !password) {
      showMessage({ type: "warning", message: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }
    try {
      const res = await userApi.login({ email, password });
      if (res.success && res.data) {
        const { token } = res.data;
        await AsyncStorage.setItem("auth_token", token);
        setAuthToken(token);
        showMessage({ type: "success", message: "Đăng nhập thành công!" });
        router.replace("/(tabs)");
      } else {
        const msg = res.error || "Đăng nhập thất bại";
        showMessage({ type: "error", message: msg });
      }
    } catch {
      const msg = "Có lỗi xảy ra khi đăng nhập";
      showMessage({ type: "error", message: msg });
    }
  };
  // ✅ Cấu hình Google Sign In khi load app
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "1068759411281-ee5vs7jc9k6tbc7jrjuq17gu0ngh35en.apps.googleusercontent.com", // Web client ID từ Google Cloud
      offlineAccess: false,
    });
  }, []);

  // ✅ Hàm xử lý đăng nhập Google
  const onGoogleButtonPress = async () => {
    try {
      const signinResult: { data: any; type: string } = await GoogleSignin.signIn();

      if (!signinResult || !signinResult.data || signinResult.type === "cancelled") {
        alert("Đăng nhập bị hủy bỏ");
        return null;
      }

      const { idToken } = signinResult.data;
      if (!idToken) {
        alert("Không nhận được idToken từ Google");
        return null;
      }

      // ✅ Log idToken để kiểm tra
      console.log("✅ Google Sign-In successful — idToken:", idToken);

      const userData = { idToken } as UserData;
      return userData;

    } catch (e) {
      console.error("❌ Google Sign-In error:", e);
      showMessage({ type: "error", message: "Đăng nhập Google thất bại" });
      return null;
    }
  };

  // ✅ Hàm gọi khi nhấn nút Google
  async function handleGoogleLogin() {
  try {
    // đảm bảo Play Services sẵn sàng
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // nếu muốn luôn hiện chọn account, bỏ comment 2 dòng dưới:
    // await GoogleSignin.revokeAccess();
    // await GoogleSignin.signOut();

    const userInfo: any = await GoogleSignin.signIn();

    // SDK thường trả idToken ngay trên object userInfo
    let idToken: string | undefined = userInfo?.idToken;

    // fallback nếu idToken chưa có:
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens?.idToken;
    }
    if (!idToken) throw new Error("Không lấy được idToken từ Google");

    // gọi BE: POST /api/User/google-login
    const res = await userApi.googleLogin(idToken);

    if (!res.success || !res.data) {
      throw new Error(res.error || res.message || "Google login failed");
    }

    // có { token, user } như login thường
    const { token, user } = res.data;

    // lưu token tuỳ app của bạn (ví dụ)
    await AsyncStorage.setItem("auth_token", token);
    await AsyncStorage.setItem("user", JSON.stringify(user));

    // TODO: điều hướng
    // router.replace("/(tabs)/home");
    // hoặc show toast
    // showMessage({ type: "success", text1: "Đăng nhập thành công" });
  } catch (err: any) {
    console.log("Google login error:", err?.message || err);
  
  }
}

  // 🟢 UI
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

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
          style={styles.googleBtn}
        >
          <Image
            source={require("../assets/images/google.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleText}>Tiếp tục với Google</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={[styles.link, { marginTop: 18 }]}>
            Chưa có tài khoản? <Text style={{ fontWeight: "bold" }}>Đăng ký</Text>
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
  logoSmall: { width: 36, height: 36 },
  co2Text: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 4 },
  brand: { fontSize: 16, color: "#fff", fontWeight: "600", marginLeft: 4 },

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
  errorText: { color: "red", marginBottom: 8, textAlign: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  link: { color: "#3f9740", fontSize: 14, fontWeight: "600" },

  dividerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontSize: 12, color: "#6B7280" },

  googleBtn: {
    width: "100%",
    maxWidth: 320,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    ...(Platform.OS === "android" ? { elevation: 2 } : null),
    marginBottom: 8,
  },
  googleBtnDisabled: { opacity: 0.6 },
  googleIcon: { width: 20, height: 20, resizeMode: "contain" },
  googleText: { fontSize: 16, fontWeight: "700", color: "#111827" },

  loginButton: {
    backgroundColor: "#A8FF8A",
    borderRadius: 16,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  loginText: { fontSize: 18, fontWeight: "bold", color: "#222" },
});
