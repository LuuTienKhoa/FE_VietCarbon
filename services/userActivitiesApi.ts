// services/userActivitiesApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface UserActivity {
  id: number;
  userId?: number;
  action?: string;
  details?: any;
  createdAt?: string;
}

export interface UserActivityRequest {
  userId?: number;
  action?: string;
  details?: any;
}

const toActivity = (raw: any): UserActivity => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  action: raw?.action,
  details: raw?.details,
  createdAt: raw?.createdAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<UserActivity[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<UserActivity[]>(() => http.get(`/UserActivities${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toActivity) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<UserActivity>> {
  const res = await wrap<UserActivity>(() => http.get(`/UserActivities/${id}`));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function create(payload: UserActivityRequest): Promise<ApiResponse<UserActivity>> {
  const res = await wrap<UserActivity>(() => http.post('/UserActivities', payload));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<UserActivityRequest>): Promise<ApiResponse<UserActivity>> {
  const res = await wrap<UserActivity>(() => http.put(`/UserActivities/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toActivity(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/UserActivities/${id}`));
}

export const userActivitiesApi = { list, getById, create, update, remove };
