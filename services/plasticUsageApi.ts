import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface PlasticItem {
  id: number;
  plasticCategory: number;
  weight: number;
  plasticUsageId: number;
}

export interface PlasticUsage {
  id: number;
  activityId: number;
  date: string;
  cO2Emission: number;
  plasticItems: PlasticItem[];
}


export interface PlasticUsageRequest {
  activityId?: number;
  date?: string;
  cO2Emission?: number;
  score?: number;
}

const toPlasticUsage = (raw: any): PlasticUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
  score: Number(raw?.score ?? 0),
});

async function list(params?: Record<string, any>): Promise<ApiResponse<PlasticUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<PlasticUsage[]>(() => http.get(`/PlasticUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toPlasticUsage) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.get(`/PlasticUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

async function create(payload: PlasticUsageRequest): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.post('/PlasticUsage', payload));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<PlasticUsageRequest>): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.put(`/PlasticUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/PlasticUsage/${id}`));
}

export const plasticUsageApi = { list, getById, create, update, remove };
