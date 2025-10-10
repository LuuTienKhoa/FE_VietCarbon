// services/challengeProgressApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface ChallengeProgress {
  id: number;
  challengeId: number;
  userId?: number;
  progress: number;
  isComplete?: boolean;
  score?: number;
  updatedAt?: string;
}

export interface ChallengeProgressRequest {
  challengeId: number;
  userId?: number;
  progress: number;
}

const toProgress = (raw: any): ChallengeProgress => ({
  id: Number(raw?.id ?? 0),
  challengeId: Number(raw?.challengeId ?? 0),
  userId: raw?.userId,
  progress: Number(raw?.progress ?? 0),
  isComplete: !!raw?.isComplete,
  score: Number(raw?.score ?? 0),
  updatedAt: raw?.updatedAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<ChallengeProgress[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<ChallengeProgress[]>(() => http.get(`/ChallengeProgress${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toProgress) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<ChallengeProgress>> {
  const res = await wrap<ChallengeProgress>(() => http.get(`/ChallengeProgress/${id}`));
  return res.success ? { ...res, data: res.data ? toProgress(res.data) : undefined } : res;
}

async function create(payload: ChallengeProgressRequest): Promise<ApiResponse<ChallengeProgress>> {
  const res = await wrap<ChallengeProgress>(() => http.post('/ChallengeProgress', payload));
  return res.success ? { ...res, data: res.data ? toProgress(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<ChallengeProgressRequest>): Promise<ApiResponse<ChallengeProgress>> {
  const res = await wrap<ChallengeProgress>(() => http.put(`/ChallengeProgress/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toProgress(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/ChallengeProgress/${id}`));
}

export const challengeProgressApi = { list, getById, create, update, remove };
