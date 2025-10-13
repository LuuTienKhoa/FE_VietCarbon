// services/energyUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface EnergyUsage {
  id: number;
  activityId: number;
  date: string;
  electricityConsumption: number;
  cO2Emission: number;
}

// Dữ liệu gửi lên khi PUT hoặc POST
export interface EnergyUsageRequest {
  activityId?: number;
  date?: string;
  electricityConsumption: number;
  cO2Emission?: number;
}

const toEnergy = (raw: any): EnergyUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  electricityConsumption: Number(raw?.electricityConsumption ?? 0),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
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
