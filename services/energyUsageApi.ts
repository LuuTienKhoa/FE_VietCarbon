// services/energyUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface EnergyUsage {
  id: number;
  userId?: number;
  source?: string;
  amount: number; // kWh or unit agreed
  co2Estimate?: number;
  recordedAt?: string;
}

export interface EnergyUsageRequest {
  userId?: number;
  source?: string;
  amount: number;
  recordedAt?: string;
}

const toEnergy = (raw: any): EnergyUsage => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  source: raw?.source,
  amount: Number(raw?.amount ?? 0),
  co2Estimate: raw?.co2Estimate,
  recordedAt: raw?.recordedAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<EnergyUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<EnergyUsage[]>(() => http.get(`/EnergyUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toEnergy) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<EnergyUsage>> {
  const res = await wrap<EnergyUsage>(() => http.get(`/EnergyUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toEnergy(res.data) : undefined } : res;
}

async function create(payload: EnergyUsageRequest): Promise<ApiResponse<EnergyUsage>> {
  const res = await wrap<EnergyUsage>(() => http.post('/EnergyUsage', payload));
  return res.success ? { ...res, data: res.data ? toEnergy(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<EnergyUsageRequest>): Promise<ApiResponse<EnergyUsage>> {
  const res = await wrap<EnergyUsage>(() => http.put(`/EnergyUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toEnergy(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/EnergyUsage/${id}`));
}

export const energyUsageApi = { list, getById, create, update, remove };
