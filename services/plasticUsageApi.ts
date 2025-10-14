// services/plasticUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface PlasticItem {
  id: number;
  plasticCategory: number;
  weight: number;
  plasticUsageId: number;
}

export interface PlasticUsage {
  id: number;
  activityId: number;
  date: string;
  cO2Emission: number;
  plasticItems: PlasticItem[];
}

/**
 * Dữ liệu BẮT BUỘC khi TẠO MỚI một PlasticUsage.
 */
export interface CreatePlasticUsageRequest {
  activityId: number;
  date: string;
  plasticItems: {
    plasticCategory: number;
    weight: number;
  }[];
  cO2Emission?: number;
}

/**
 * Dữ liệu CÓ THỂ CÓ khi CẬP NHẬT một PlasticUsage.
 * Bắt buộc phải có `id` trong body request.
 */
export type UpdatePlasticUsageRequest = Partial<CreatePlasticUsageRequest> & {
  id: number;
};

/**
 * Hàm helper để chuyển đổi dữ liệu thô từ API sang interface PlasticUsage đã được định nghĩa.
 * @param raw Dữ liệu bất kỳ từ API response.
 * @returns Đối tượng PlasticUsage đã được chuẩn hóa.
 */
const toPlasticUsage = (raw: any): PlasticUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
  plasticItems: Array.isArray(raw?.plasticItems)
    ? raw.plasticItems.map((p: any) => ({
        id: Number(p?.id ?? 0),
        plasticCategory: Number(p?.plasticCategory ?? 0),
        weight: Number(p?.weight ?? 0),
        plasticUsageId: Number(p?.plasticUsageId ?? 0),
      }))
    : [],
});

/**
 * Lấy danh sách tất cả PlasticUsage.
 */
async function list(params?: Record<string, any>): Promise<ApiResponse<PlasticUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<PlasticUsage[]>(() => http.get(`/PlasticUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toPlasticUsage) } : res;
}

/**
 * Lấy thông tin chi tiết của một PlasticUsage bằng ID.
 */
async function getById(id: number | string): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.get(`/PlasticUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

/**
 * Lấy danh sách PlasticUsage của một người dùng cụ thể.
 * @param userId ID của người dùng.
 */
async function getByUserId(userId: number | string): Promise<ApiResponse<PlasticUsage[]>> {
  const res = await wrap<PlasticUsage[]>(() => http.get(`/PlasticUsage/user/${userId}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toPlasticUsage) } : res;
}

/**
 * Tạo mới một bản ghi PlasticUsage.
 */
async function create(payload: CreatePlasticUsageRequest): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.post('/PlasticUsage', payload));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

/**
 * Cập nhật thông tin một bản ghi PlasticUsage.
 */
async function update(id: number | string, payload: UpdatePlasticUsageRequest): Promise<ApiResponse<PlasticUsage>> {
  const res = await wrap<PlasticUsage>(() => http.put(`/PlasticUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toPlasticUsage(res.data) : undefined } : res;
}

/**
 * Xóa một bản ghi PlasticUsage.
 */
async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/PlasticUsage/${id}`));
}

export const plasticUsageApi = { list, getById, getByUserId, create, update, remove };