// services/recommendApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface UserRecommendation {
  recommendation: string;
}

const toUserRecommendation = (raw: any): UserRecommendation => ({
  recommendation: String(raw?.recommendation ?? ''),
});

async function list(): Promise<ApiResponse<UserRecommendation[]>> {
  const res = await wrap<UserRecommendation[]>(() => http.get('/Recommend'));
  return res.success ? { ...res, data: res.data?.map(toUserRecommendation) ?? [] } : res;
}

async function getById(id: number | string): Promise<ApiResponse<UserRecommendation>> {
  const res = await wrap<UserRecommendation>(() => http.get(`/Recommend/${id}`));
  return res.success ? { ...res, data: res.data ? toUserRecommendation(res.data) : undefined } : res;
}

async function create(payload: Partial<UserRecommendation>): Promise<ApiResponse<UserRecommendation>> {
  const res = await wrap<UserRecommendation>(() => http.post('/Recommend', payload));
  return res.success ? { ...res, data: res.data ? toUserRecommendation(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<UserRecommendation>): Promise<ApiResponse<UserRecommendation>> {
  const res = await wrap<UserRecommendation>(() => http.put(`/Recommend/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toUserRecommendation(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/Recommend/${id}`));
}

async function getByUserActivityId(
  userActivityId: number | string
): Promise<ApiResponse<UserRecommendation>> {
  const res = await wrap<UserRecommendation>(() =>
    http.get(`/Recommend/${userActivityId}`, {
      params: { lang: 'vi' },
      headers: { 'Accept-Language': 'vi-VN', 'X-Locale': 'vi' },
    })
  );
  return res.success
    ? { ...res, data: res.data ? toUserRecommendation(res.data) : undefined }
    : res;
}

export const recommendApi = { list, getById, create, update, remove, getByUserActivityId };
