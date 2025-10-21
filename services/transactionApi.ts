// services/transactionApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3
}

export interface Transaction {
  id: number;
  userId?: number;
  amount: number;
  reason?: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TransactionRequest {
  userId?: number;
  amount: number;
  currency?: string;
  type?: string;
  metadata?: any;
}

const toTransaction = (raw: any): Transaction => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  amount: Number(raw?.amount ?? 0),
  reason: raw?.reason,
  status: Number(raw?.status ?? 0),
  createdAt: raw?.createdAt,
  updatedAt: raw?.updatedAt,
});

async function list(userId: number, params?: Record<string, any>): Promise<ApiResponse<Transaction[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Transaction[]>(() => http.get(`/Transaction/user/${userId}${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toTransaction) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.get(`/Transaction/${id}`));
  return res.success ? { ...res, data: res.data ? toTransaction(res.data) : undefined } : res;
}

async function create(payload: TransactionRequest): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.post('/Transaction', payload));
  return res.success ? { ...res, data: res.data ? toTransaction(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<TransactionRequest>): Promise<ApiResponse<Transaction>> {
  const res = await wrap<Transaction>(() => http.put(`/Transaction/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toTransaction(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/Transaction/${id}`));
}
export async function createPayment(amount: number) {
  const res = await wrap<any>(() => http.post("/p", { amount }));
  if (!res.success) return res;
  const { transactionId, checkoutUrl } = res.data ?? {};
  return { ...res, data: { transactionId, checkoutUrl } };
}

export async function getStatus(id: number) {
  return getById(id);
}
export const transactionApi = { list, getById, create, update, remove};
