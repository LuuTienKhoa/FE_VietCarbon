// services/userActivitiesApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface UserActivities {
  id: number;
  userId?: number;
  action?: string;
  details?: any;
  createdAt?: string;
  co2Emission?: number;
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
  const res = await wrap<UserActivities[]>(() => http.get(`/UserActivities/user/${userId}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toActivity) } : res;
}

async function getLeaderBoard(): Promise<ApiResponse<UserActivities[]>> {
  const res = await wrap<UserActivities[]>(() => http.get('/UserActivities/leaderboard'));
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
