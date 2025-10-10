import AsyncStorage from "@react-native-async-storage/async-storage";
import http, { setAuthToken } from "./http";

type ServiceResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
} | any;

type AuthPayload = { token: string; user: any };

function pickAuth(res: any): AuthPayload {
  const data = res?.data ?? res;
  const token = data?.data?.token ?? data?.token ?? data?.Data?.Token;
  const user  = data?.data?.user  ?? data?.user  ?? data?.Data?.User;
  return { token, user };
}

export async function googleLogin(idToken: string): Promise<AuthPayload> {
  const res = await http.post<ServiceResponse<AuthPayload>>("/User/google-login", { idToken });
  const { token, user } = pickAuth(res);
  if (!token) throw new Error("Không nhận được token từ máy chủ.");

  await AsyncStorage.setItem("auth_token", token);
  setAuthToken(token);

  // (tuỳ bạn) lưu user:
  await AsyncStorage.setItem("auth_user", JSON.stringify(user ?? {}));

  return { token, user };
}

export async function logout() {
  await AsyncStorage.multiRemove(["auth_token", "auth_user"]);
  setAuthToken(null);
}
