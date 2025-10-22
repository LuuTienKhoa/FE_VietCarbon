import http from './http';
import { ApiResponse, wrap } from './userApi';

// 🧩 Trạng thái giao dịch
export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3
}

// 🧾 Cấu trúc Transaction
export interface Transaction {
  id: number;
  userId?: number;
  amount: number;
  reason?: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string | null;
  userName?: string;
}

// 📤 Cấu trúc request khi tạo Transaction
export interface TransactionRequest {
  userId?: number;
  amount: number;
  currency?: string;
  type?: string;
  metadata?: any;
}

// 🔁 Chuyển dữ liệu từ raw API sang Transaction
const toTransaction = (raw: any): Transaction => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  amount: Number(raw?.amount ?? 0),
  reason: raw?.reason ?? '',
  status: Number(raw?.status ?? 0),
  createdAt: raw?.createdAt,
  updatedAt: raw?.updatedAt,
  userName: raw?.userName ?? '',
});

// 📜 Lấy danh sách giao dịch theo userId
async function list(userId: number, params?: Record<string, any>): Promise<ApiResponse<Transaction[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Transaction[]>(() => http.get(`/Transaction/user/${userId}${qs}`));
  
  if (__DEV__) console.log('[TransactionAPI] list', res);

  return res.success
    ? { ...res, data: (res.data ?? []).map(toTransaction) }
    : res;
}

// 🔍 Lấy chi tiết 1 giao dịch
async function getById(id: number | string): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.get(`/Transaction/${id}`));
  return res.success
    ? { ...res, data: res.data ? toTransaction(res.data) : undefined }
    : res;
}

// ➕ Tạo mới 1 giao dịch
async function create(payload: TransactionRequest): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.post('/Transaction', payload));
  return res.success
    ? { ...res, data: res.data ? toTransaction(res.data) : undefined }
    : res;
}

// 🔄 Cập nhật giao dịch
async function update(id: number | string, payload: Partial<TransactionRequest>): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.put(`/Transaction/${id}`, payload));
  return res.success
    ? { ...res, data: res.data ? toTransaction(res.data) : undefined }
    : res;
}

// ❌ Xóa giao dịch
async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/Transaction/${id}`));
}

// 💳 Tạo giao dịch thanh toán (VNPay hoặc gateway khác)
export async function createPayment(amount: number) {
  const res = await wrap<any>(() => http.post('/p', { amount }));
  if (!res.success) return res;
  const { transactionId, checkoutUrl } = res.data ?? {};
  return { ...res, data: { transactionId, checkoutUrl } };
}

// 📦 Lấy trạng thái giao dịch
export async function getStatus(id: number) {
  return getById(id);
}

export const transactionApi = { list, getById, create, update, remove };
