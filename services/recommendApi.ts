// services/recommendApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface Recommend {
  id: number;
  title?: string;
  description?: string;
  category?: string;
  impactEstimate?: number;
  createdAt?: string;
}

export interface RecommendRequest {
  title?: string;
  description?: string;
  category?: string;
  impactEstimate?: number;
}

const toRecommend = (raw: any): Recommend => ({
  id: Number(raw?.id ?? 0),
  title: raw?.title,
  description: raw?.description,
  category: raw?.category,
  impactEstimate: raw?.impactEstimate,
  createdAt: raw?.createdAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<Recommend[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Recommend[]>(() => http.get(`/Recommend${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toRecommend) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<Recommend>> {
  const res = await wrap<Recommend>(() => http.get(`/Recommend/${id}`));
  return res.success ? { ...res, data: res.data ? toRecommend(res.data) : undefined } : res;
}

async function create(payload: RecommendRequest): Promise<ApiResponse<Recommend>> {
  const res = await wrap<Recommend>(() => http.post('/Recommend', payload));
  return res.success ? { ...res, data: res.data ? toRecommend(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<RecommendRequest>): Promise<ApiResponse<Recommend>> {
  const res = await wrap<Recommend>(() => http.put(`/Recommend/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toRecommend(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/Recommend/${id}`));
}

export const recommendApi = { list, getById, create, update, remove };
