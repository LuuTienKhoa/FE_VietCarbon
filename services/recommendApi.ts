// services/recommendApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface UserRecommendation {
  recommendation: string;
}

const toUserRecommendation = (raw: any): UserRecommendation => ({
  recommendation: String(raw?.recommendation ?? ''),
});

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

export const recommendApi = { getByUserActivityId };
