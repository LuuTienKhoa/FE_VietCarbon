// services/challengeApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface Challenge {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  isComplete?: boolean;
}

export interface ChallengeRequest {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  isComplete?: boolean;
}

const toChallenge = (raw: any): Challenge => ({
  id: Number(raw?.id ?? 0),
  name: raw?.name ?? '',
  description: raw?.description ?? '',
  startDate: raw?.startDate,
  endDate: raw?.endDate,
  isComplete: !!raw?.isComplete,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<Challenge[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Challenge[]>(() => http.get(`/Challenge${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toChallenge) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<Challenge>> {
  const res = await wrap<Challenge>(() => http.get(`/Challenge/${id}`));
  return res.success ? { ...res, data: res.data ? toChallenge(res.data) : undefined } : res;
}

async function create(payload: ChallengeRequest, token?: string): Promise<ApiResponse<Challenge>> {
  const res = await wrap<Challenge>(() =>
    http.post('/Challenge', payload, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  );
  return res.success ? { ...res, data: res.data ? toChallenge(res.data) : undefined } : res;
}

async function update(
  id: number | string,
  payload: Partial<ChallengeRequest>,
  token?: string
): Promise<ApiResponse<Challenge>> {
  const res = await wrap<Challenge>(() =>
    http.put(`/Challenge/${id}`, payload, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  );
  return res.success ? { ...res, data: res.data ? toChallenge(res.data) : undefined } : res;
}

async function remove(id: number | string, token?: string): Promise<ApiResponse<null>> {
  return wrap<null>(() =>
    http.delete(`/Challenge/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  );
}

export const challengeApi = { list, getById, create, update, remove };
