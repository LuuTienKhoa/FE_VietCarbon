// services/trafficUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface TrafficUsage {
  id: number;
  activityId: number;
  date: string; // ISO string
  distance: number;
  trafficCategory: number; // 1 = car, 2 = bus, etc.
  cO2Emission: number;
}

// Dữ liệu gửi lên khi POST hoặc PUT
export interface TrafficUsageRequest {
  activityId?: number;
  date?: string;
  distance: number;
  trafficCategory?: number;
  cO2Emission?: number;
}

const toTraffic = (raw: any): TrafficUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  distance: Number(raw?.distance ?? 0),
  trafficCategory: Number(raw?.trafficCategory ?? 0),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
});

async function list(params?: Record<string, any>): Promise<ApiResponse<TrafficUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<TrafficUsage[]>(() => http.get(`/TrafficUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toTraffic) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.get(`/TrafficUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

async function create(payload: TrafficUsageRequest): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.post('/TrafficUsage', payload));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<TrafficUsageRequest>): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.put(`/TrafficUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/TrafficUsage/${id}`));
}

export const trafficUsageApi = { list, getById, create, update, remove };
