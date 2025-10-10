// services/userApi.ts
import http from './http';

/** ====== Types từ Swagger ====== */
export interface User {
  id: number;
  userName: string;          
  email: string;
  phoneNumber?: string;
  role?: number | string;   
  dateOfBirth?: string;      
  subscriptionType?: number; 
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; phoneNumber?: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export interface UpdateUserRequest { userName?: string; email?: string; phoneNumber?: string; }

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type AuthPayload = { user: User; token: string };

/** ====== Helpers chuẩn hóa ====== */
const toUser = (raw: any): User => ({
  id: Number(raw?.id ?? 0),
  userName: raw?.userName ?? raw?.username ?? '',
  email: raw?.email ?? '',
  phoneNumber: raw?.phoneNumber ?? undefined,
  role: raw?.role,
  dateOfBirth: raw?.dateOfBirth,
  subscriptionType: raw?.subscriptionType,
});

/** Bọc axios: luôn trả ApiResponse<T> (không throw ra ngoài) */
export const wrap = async <T>(call: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const { data } = await call();

    // Cho phép BE trả dạng { success, message, data } hoặc trả thẳng data
    const success = typeof data?.success === 'boolean' ? data.success : true;
    const message = data?.message as string | undefined;
    const error = data?.error as string | undefined;
    const payload = (data?.data ?? data) as T;

    return { success, message, error, data: payload };
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? e?.message ?? 'Request failed';
    const err = e?.response?.data?.error ?? msg;
    return { success: false, message: msg, error: err };
  }
};

/** Chuẩn hoá payload { user, token } dù BE trả ở root hay trong data */
const normalizeAuth = (res: ApiResponse<any>): ApiResponse<AuthPayload> => {
  if (!res.success) return { success: false, message: res.message, error: res.error };

  const d = res.data as any;
  const token = d?.token ?? d?.data?.token;
  const user = d?.user ?? d?.data?.user;

  if (token && user) {
    return { success: true, message: res.message, data: { token, user: toUser(user) } };
  }
  return { success: false, message: res.message, error: 'Invalid login/register response' };
};

/** ====== User APIs ====== */
async function login(payload: LoginRequest): Promise<ApiResponse<AuthPayload>> {
  const res = await wrap<any>(() => http.post('/User/login', payload));
  return normalizeAuth(res);
}

async function register(payload: RegisterRequest): Promise<ApiResponse<AuthPayload>> {
  // BE nhận username → map sang userName nếu cần
  const body = { ...payload, userName: payload.username ?? payload.username };
  const res = await wrap<any>(() => http.post('/User/register', body));
  return normalizeAuth(res);
}

async function me(): Promise<ApiResponse<User>> {
  const res = await wrap<User>(() => http.get('/User/me'));
  return res.success ? { ...res, data: res.data ? toUser(res.data) : undefined } : res;
}

async function getById(id: number | string): Promise<ApiResponse<User>> {
  const res = await wrap<User>(() => http.get(`/User/${id}`));
  return res.success ? { ...res, data: res.data ? toUser(res.data) : undefined } : res;
}

async function list(params?: Record<string, any>): Promise<ApiResponse<User[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<User[]>(() => http.get(`/User${qs}`));
  return res.success
    ? { ...res, data: (res.data ?? []).map(toUser) }
    : res;
}

async function update(id: number | string, payload: UpdateUserRequest): Promise<ApiResponse<User>> {
  const body = { ...payload, userName: payload.userName ?? (payload as any).username };
  const res = await wrap<User>(() => http.put(`/User/${id}`, body));
  return res.success ? { ...res, data: res.data ? toUser(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/User/${id}`));
}

async function changePassword(payload: ChangePasswordRequest): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.post('/User/change-password', payload));
}

export async function upgrade(plan: 1 | 2, returnUrl?: string, cancelUrl?: string) {
  return wrap<any>(() => http.post("/User/upgrade", { plan, returnUrl, cancelUrl }));
}

async function updateRole(id: number | string, role: string): Promise<ApiResponse<User>> {
  const res = await wrap<User>(() => http.put(`/User/${id}/role`, { role }));
  return res.success ? { ...res, data: res.data ? toUser(res.data) : undefined } : res;
}

export const userApi = {
  login,
  register,
  me,
  getById,
  list,
  update,
  remove,
  changePassword,
  upgrade,
  updateRole,
};
