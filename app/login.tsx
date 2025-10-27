import { useFlashMessage } from "@/components/flash-message-provider";
import Ionicons from "@expo/vector-icons/Ionicons";
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ APIs & Auth
import { userApi } from "@/services/api";
import { setAuthToken } from "@/services/http";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const { showMessage } = useFlashMessage();
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          router.replace("/"); // Redirect to main app if token exists
        }
      } catch (error) {
        console.error('Failed to check token:', error);
      }
    };
    checkToken();
  }, [router]);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  // ======= EMAIL/PASSWORD LOGIN =======
  const handleLogin = async () => {
    if (!email || !password) {
      showMessage({ type: "warning", message: "Vui lòng nhập đầy đủ thông tin" });
      return;
    }

    if (!isOnline) {
      showMessage({ type: "error", message: "Cần kết nối internet để đăng nhập" });
      return;
    }

    try {
      setSubmitting(true);
      // 🧹 Xoá token cũ trước khi login
      await AsyncStorage.removeItem("auth_token");
      setAuthToken(null);
      const res = await userApi.login({ email, password });
      if (res.success && res.data) {
        const { token, user } = res.data; // ⚠️ thêm user ở đây
        await AsyncStorage.setItem("auth_token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user)); 
        
        setAuthToken(token);

        showMessage({ type: "success", message: "Đăng nhập thành công!" });
        router.replace("/"); 
      } else {
        const msg = res.error || "Đăng nhập thất bại";
        showMessage({ type: "error", message: msg });
      }
    } catch {
      showMessage({ type: "error", message: "Có lỗi xảy ra khi đăng nhập" });
    } finally {
      setSubmitting(false);
    }
  };


  // ======= GOOGLE LOGIN =======
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId:
  //       "177492215827-jqsec57up3u7luccl2hifo9t73b4e9ut.apps.googleusercontent.com",
        
  //     offlineAccess: false,
  //   });
  // }, []);

  // async function handleGoogleLogin() {
  //   try { 
  //     setSubmitting(true);
  //     await AsyncStorage.removeItem("auth_token");
  //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  //     await GoogleSignin.signOut(); // Đảm bảo đăng nhập lại mỗi lần
  //     const userInfo: any = await GoogleSignin.signIn();
  //     let idToken: string | undefined = userInfo?.idToken;
  //     if (!idToken) {
  //       const tokens = await GoogleSignin.getTokens();
  //       idToken = tokens?.idToken;
  //     }
  //     if (!idToken) throw new Error("Không lấy được idToken từ Google");

  //     const res = await userApi.googleLogin(idToken);
  //     if (!res.success || !res.data) {
  //       throw new Error(res.error || res.message || "Google login failed");
  //     }

  //     const { token, user } = res.data;
  //     await AsyncStorage.setItem("auth_token", token);
  //     await AsyncStorage.setItem("user", JSON.stringify(user));

  //     showMessage({ type: "success", message: "Đăng nhập Google thành công!" });
  //     router.replace("/"); // ✅ vào tabs
  //   } catch (err: any) {
  //     console.log("Google login error:", err?.message || err);
  //     showMessage({ type: "error", message: "Đăng nhập Google thất bại" });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }

  // ======= UI =======
  return (
    <View style={{ flex: 1 }}>
      {/* Nền xanh – gradient lá */}
      <LinearGradient
        colors={["#E6FCD9", "#D9FF86", "#B6FF4A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {/* Trang trí lá mềm */}
        <View style={[styles.bubble, { top: -40, right: -30 }]} />
        <View style={[styles.bubble, { bottom: -30, left: -40, width: 200, height: 200, opacity: 0.15 }]} />

        {/* Logo & tagline */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={require("../assets/images/logo.jpg")} style={styles.logo} />
            <Text style={styles.brand}>VietCarbon</Text>
          </View>
          <Text style={styles.tagline}>Sống xanh mỗi ngày 🌱</Text>
        </View>

        {/* Thẻ kính mờ */}
        <View style={styles.cardOuter}>
          <LinearGradient
            colors={["rgba(255,255,255,0.8)", "rgba(255,255,255,0.75)"]}
            style={styles.card}
          >
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục hành trình giảm CO₂</Text>

            {/* Email */}
            <View style={styles.field}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email hoặc số điện thoại"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email hoặc số điện thoại"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.fieldIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                accessibilityLabel="Mật khẩu"
              />
              <Pressable
                onPress={() => setShowPwd((v) => !v)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={showPwd ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                style={styles.eyeBtn}
              >
                <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color="#374151" />
              </Pressable>
            </View>

            {/* Offline indicator */}
            {!isOnline && (
              <View style={styles.offlineWarning}>
                <Ionicons name="wifi" size={16} color="#F59E0B" />
                <Text style={styles.offlineText}>
                  Cần kết nối internet để đăng nhập
                </Text>
              </View>
            )}

            {/* Nút Login */}
            <TouchableOpacity
              style={[styles.primaryBtn, (submitting || !isOnline) && styles.disabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={submitting || !isOnline}
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập"
            >
              <Ionicons name="leaf-outline" size={18} color="#0B3520" />
              <Text style={styles.primaryText}>
                {submitting ? "Đang xử lý..." : !isOnline ? "Cần internet" : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.divider} />
            </View>

            {/* Google */}
            {/* <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
              style={[styles.googleBtn, submitting && styles.disabled]}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Tiếp tục với Google"
            >
              <Image source={require("../assets/images/google.png")} style={styles.googleIcon} />
              <Text style={styles.googleText}>Tiếp tục với Google</Text>
            </TouchableOpacity> */}

            {/* Đăng ký */}
            <TouchableOpacity onPress={() => router.push("/register")} accessibilityRole="button">
              <Text style={styles.registerText}>
                Chưa có tài khoản? <Text style={styles.registerStrong}>Đăng ký</Text>
              </Text>
            </TouchableOpacity>

            {/* Eco badges */}
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Ionicons name="planet-outline" size={14} color="#0B3520" />
                <Text style={styles.badgeText}>CO₂-smart</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#0B3520" />
                <Text style={styles.badgeText}>Bảo mật</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="sparkles-outline" size={14} color="#0B3520" />
                <Text style={styles.badgeText}>Tươi mới</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  bubble: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  header: { alignItems: "center", marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  brand: { fontSize: 18, fontWeight: "800", color: "#0B3520", letterSpacing: 0.2 },
  tagline: { marginTop: 4, color: "#14532D", fontSize: 13, fontWeight: "600" },

  cardOuter: {
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    ...(Platform.OS === "android" ? { elevation: 6 } : null),
  },

  title: { fontSize: 22, fontWeight: "800", color: "#0B3520", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#14532D", textAlign: "center", marginTop: 6, marginBottom: 16 },

  field: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F3F7EB",
    borderWidth: 1,
    borderColor: "#DAF2C4",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fieldIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#111827" },
  eyeBtn: { padding: 6 },

  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  helper: { color: "#166534", fontSize: 12 },
  link: { color: "#198754", fontSize: 13, fontWeight: "700" },

  primaryBtn: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    backgroundColor: "#A8FF8A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  disabled: { opacity: 0.6 },
  primaryText: { fontSize: 16, fontWeight: "800", color: "#0B3520" },

  dividerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  divider: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText: { fontSize: 12, color: "#6B7280" },

  googleBtn: {
    width: "100%",
    height: 50,
    borderRadius: 16,
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
    marginBottom: 6,
  },
  googleIcon: { width: 20, height: 20, resizeMode: "contain" },
  googleText: { fontSize: 16, fontWeight: "800", color: "#111827" },

  registerText: { marginTop: 12, fontSize: 13, color: "#14532D", textAlign: "center" },
  registerStrong: { fontWeight: "800", color: "#0B3520" },

  badges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(168,255,138,0.6)",
    borderWidth: 1,
    borderColor: "rgba(11,53,32,0.12)",
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#0B3520" },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    fontWeight: '600',
  },
});
