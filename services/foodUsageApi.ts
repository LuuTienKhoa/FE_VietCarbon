// services/foodUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface FoodItem {
  id: number;
  foodCategory: number;
  weight: number; // gram
  foodUsageId: number;
}

export interface FoodUsage {
  id: number;
  activityId: number;
  date: string; // ISO string
  cO2Emission: number;
  score: number;
  foodItems: FoodItem[];
}

/**
 * Dữ liệu BẮT BUỘC khi TẠO MỚI một FoodUsage.
 */
export interface CreateFoodUsageRequest {
  activityId: number;
  date: string;
  foodItems: {
    foodCategory: number;
    weight: number;
  }[];
  // cO2Emission và score thường do backend tính toán, nên không bắt buộc khi tạo.
  cO2Emission?: number;
  score?: number;
}

/**
 * Dữ liệu CÓ THỂ CÓ khi CẬP NHẬT một FoodUsage.
 * Bắt buộc phải có `id` trong body request.
 */
export type UpdateFoodUsageRequest = Partial<CreateFoodUsageRequest> & {
  id: number;
};

/**
 * Hàm helper để chuyển đổi dữ liệu thô từ API sang interface FoodUsage đã được định nghĩa.
 * @param raw Dữ liệu bất kỳ từ API response.
 * @returns Đối tượng FoodUsage đã được chuẩn hóa.
 */
const toFood = (raw: any): FoodUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
  score: Number(raw?.score ?? 0),
  foodItems: Array.isArray(raw?.foodItems)
    ? raw.foodItems.map((f: any) => ({
        id: Number(f?.id ?? 0),
        foodCategory: Number(f?.foodCategory ?? 0),
        weight: Number(f?.weight ?? 0),
        foodUsageId: Number(f?.foodUsageId ?? 0),
      }))
    : [],
});

/**
 * Lấy danh sách tất cả FoodUsage.
 */
async function list(params?: Record<string, any>): Promise<ApiResponse<FoodUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<FoodUsage[]>(() => http.get(`/FoodUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toFood) } : res;
}

/**
 * Lấy thông tin chi tiết của một FoodUsage bằng ID.
 */
async function getById(id: number | string): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.get(`/FoodUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

/**
 * Lấy danh sách FoodUsage của một người dùng cụ thể.
 * @param userId ID của người dùng.
 */
async function getByUserId(userId: number | string): Promise<ApiResponse<FoodUsage[]>> {
  const res = await wrap<FoodUsage[]>(() => http.get(`/FoodUsage/${userId}`)); // Endpoint có dạng /api/FoodUsage/{userId}
  return res.success ? { ...res, data: (res.data ?? []).map(toFood) } : res;
}

/**
 * Tạo mới một bản ghi FoodUsage.
 */
async function create(payload: CreateFoodUsageRequest): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.post('/FoodUsage', payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

/**
 * Cập nhật thông tin một bản ghi FoodUsage.
 */
async function update(id: number | string, payload: UpdateFoodUsageRequest): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.put(`/FoodUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

/**
 * Xóa một bản ghi FoodUsage.
 */
async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/FoodUsage/${id}`));
}

export const foodUsageApi = { list, getById, getByUserId, create, update, remove };