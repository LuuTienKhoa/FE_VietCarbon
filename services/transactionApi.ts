// services/transactionApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface Transaction {
  id: number;
  userId?: number;
  amount: number;
  currency?: string;
  type?: string; // e.g., "purchase", "topup"
  status?: string;
  createdAt?: string;
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
  currency: raw?.currency,
  type: raw?.type,
  status: raw?.status,
  createdAt: raw?.createdAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<Transaction[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Transaction[]>(() => http.get(`/Transaction${qs}`));
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

export const transactionApi = { list, getById, create, update, remove };
