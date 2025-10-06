// services/notifyApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface Notify {
  id: number;
  userId?: number;
  title?: string;
  body?: string;
  read?: boolean;
  createdAt?: string;
}

export interface NotifyRequest {
  userId?: number;
  title?: string;
  body?: string;
  data?: any;
}

const toNotify = (raw: any): Notify => ({
  id: Number(raw?.id ?? 0),
  userId: raw?.userId,
  title: raw?.title,
  body: raw?.body,
  read: !!raw?.read,
  createdAt: raw?.createdAt,
});

async function list(params?: Record<string, any>): Promise<ApiResponse<Notify[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<Notify[]>(() => http.get(`/Notify${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toNotify) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<Notify>> {
  const res = await wrap<Notify>(() => http.get(`/Notify/${id}`));
  return res.success ? { ...res, data: res.data ? toNotify(res.data) : undefined } : res;
}

async function create(payload: NotifyRequest): Promise<ApiResponse<Notify>> {
  const res = await wrap<Notify>(() => http.post('/Notify', payload));
  return res.success ? { ...res, data: res.data ? toNotify(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<NotifyRequest>): Promise<ApiResponse<Notify>> {
  const res = await wrap<Notify>(() => http.put(`/Notify/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toNotify(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/Notify/${id}`));
}

export const notifyApi = { list, getById, create, update, remove };
