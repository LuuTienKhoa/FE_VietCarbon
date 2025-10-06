// services/plasticUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface PlasticUsage {
  id: number;
  userId?: number;
  item?: string;
  quantity?: number;
  estimatedKg?: number;
  recordedAt?: string;
}

export interface PlasticUsageRequest {
  userId?: number;
  item?: string;
  quantity?: number;
  estimatedKg?: number;
  recordedAt?: string;
}

const toPlastic = (raw: any): PlasticUsage => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  item: raw?.item,
  quantity: raw?.quantity,
  estimatedKg: raw?.estimatedKg,
  recordedAt: raw?.recordedAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<PlasticUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<PlasticUsage[]>(() => http.get(`/PlasticUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toPlastic) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.get(`/PlasticUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toPlastic(res.data) : undefined } : res;
}

async function create(payload: PlasticUsageRequest): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.post('/PlasticUsage', payload));
  return res.success ? { ...res, data: res.data ? toPlastic(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<PlasticUsageRequest>): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.put(`/PlasticUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toPlastic(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/PlasticUsage/${id}`));
}

export const plasticUsageApi = { list, getById, create, update, remove };
