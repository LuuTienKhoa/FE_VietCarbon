    // services/trafficUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface TrafficUsage {
  id: number;
  userId?: number;
  mode?: string; // e.g., "car", "bus", "bike"
  distanceKm?: number;
  co2Estimate?: number;
  recordedAt?: string;
}

export interface TrafficUsageRequest {
  userId?: number;
  mode?: string;
  distanceKm?: number;
  recordedAt?: string;
}

const toTraffic = (raw: any): TrafficUsage => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  mode: raw?.mode,
  distanceKm: raw?.distanceKm,
  co2Estimate: raw?.co2Estimate,
  recordedAt: raw?.recordedAt,
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
