// services/userActivitiesApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';
// Import các interface usage từ api.ts để hỗ trợ cấu trúc lồng nhau
import { EnergyUsage, FoodUsage, PlasticUsage, TrafficUsage } from './api';

// CẬP NHẬT INTERFACE: THÊM CÁC TRƯỜNG TỪ RESPONSE API
export interface UserActivities {
  id: number;
  userId?: number;
  
  // THÊM: Các trường quan trọng từ API Response
  date?: string; 
  totalCO2Emission?: number; 
  plasticUsageId?: number;
  trafficUsageId?: number;
  foodUsageId?: number;
  energyUsageId?: number;

  // Dữ liệu chi tiết lồng nhau (từ response API)
  plasticUsage?: PlasticUsage; 
  trafficUsage?: TrafficUsage; 
  foodUsage?: FoodUsage;     
  energyUsage?: EnergyUsage;   
  
  // Dữ liệu cũ (giữ lại nếu có)
  action?: string;
  details?: any;
  createdAt?: string;
  co2Emission?: number; // co2Emission ở cấp độ hoạt động đơn lẻ
  points?: number;
}

export interface UserActivitiesRequest {
  userId?: number;
  action?: string;
  details?: any;
  co2Emission?: number;
  points?: number;
}

// Alias for backward compatibility
export type UserActivity = UserActivities;
export type UserActivityRequest = UserActivitiesRequest;

const toActivity = (raw: any): UserActivities => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  
  // Ánh xạ các trường mới
  date: raw?.date,
  totalCO2Emission: Number(raw?.totalCO2Emission ?? 0),
  plasticUsageId: raw?.plasticUsageId,
  trafficUsageId: raw?.trafficUsageId,
  foodUsageId: raw?.foodUsageId,
  energyUsageId: raw?.energyUsageId,
  
  // Ánh xạ các đối tượng lồng nhau (chấp nhận thô)
  plasticUsage: raw?.plasticUsage, 
  trafficUsage: raw?.trafficUsage, 
  foodUsage: raw?.foodUsage,     
  energyUsage: raw?.energyUsage,  
  
  // Ánh xạ các trường cũ
  action: raw?.action,
  details: raw?.details,
  createdAt: raw?.createdAt,
  co2Emission: raw?.co2Emission,
  points: raw?.points,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<UserActivities[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<UserActivities[]>(() => http.get(`/UserActivities${qs}`)); 
  return res.success ? { ...res, data: (res.data ?? []).map(toActivity) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<UserActivities>> {
  const res = await wrap<UserActivities>(() => http.get(`/UserActivities/${id}`));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function create(payload: UserActivitiesRequest): Promise<ApiResponse<UserActivities>> {
  const res = await wrap<UserActivities>(() => http.post('/UserActivities', payload));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<UserActivitiesRequest>): Promise<ApiResponse<UserActivities>> {
  const res = await wrap<UserActivities>(() => http.put(`/UserActivities/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/UserActivities/${id}`));
}

async function getByUserId(userId: number): Promise<ApiResponse<UserActivities[]>> {
  // SỬA LỖI 404: Thêm /api/ và dùng Query Parameter như Swagger UI đề xuất
  const res = await wrap<UserActivities[]>(() => http.get(`/UserActivities/UserId?userId=${userId}`)); 
  return res.success ? { ...res, data: (res.data ?? []).map(toActivity) } : res;
}

async function getLeaderBoard(): Promise<ApiResponse<UserActivities[]>> {
  // Giả định LeaderBoard cũng cần /api
  const res = await wrap<UserActivities[]>(() => http.get('/api/UserActivities/leaderboard'));
  return res.success ? { ...res, data: (res.data ?? []).map(toActivity) } : res;
}

export const userActivitiesApi = { 
  list, 
  getById, 
  create, 
  update, 
  remove, 
  getByUserId, 
  getLeaderBoard 
};