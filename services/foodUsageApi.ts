    // services/foodUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface FoodUsage {
  id: number;
  userId?: number;
  type?: string; // e.g., "meat", "veg"
  amount?: number; // portion or grams
  co2Estimate?: number;
  recordedAt?: string;
}

export interface FoodUsageRequest {
  userId?: number;
  type?: string;
  amount?: number;
  recordedAt?: string;
}

const toFood = (raw: any): FoodUsage => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  type: raw?.type,
  amount: raw?.amount,
  co2Estimate: raw?.co2Estimate,
  recordedAt: raw?.recordedAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<FoodUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<FoodUsage[]>(() => http.get(`/FoodUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toFood) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.get(`/FoodUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function create(payload: FoodUsageRequest): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.post('/FoodUsage', payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<FoodUsageRequest>): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.put(`/FoodUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/FoodUsage/${id}`));
}

export const foodUsageApi = { list, getById, create, update, remove };
