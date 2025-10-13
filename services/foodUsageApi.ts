// services/foodUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

export interface FoodItem {
  id: number;
  foodCategory: number; // loại thực phẩm (1 = thịt, 2 = rau, v.v.)
  weight: number;       // khối lượng (gram)
  foodUsageId: number;  // liên kết tới FoodUsage cha
}

export interface FoodUsage {
  id: number;
  activityId: number;
  date: string;         // ISO string
  cO2Emission: number;
  score: number;
  foodItems: FoodItem[];
}

// Dữ liệu gửi lên khi POST hoặc PUT
export interface FoodUsageRequest {
  activityId?: number;
  date?: string;
  cO2Emission?: number;
  score?: number;
  foodItems: {
    foodCategory: number;
    weight: number;
  }[];
}

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

async function list(params?: Record<string, any>): Promise<ApiResponse<FoodUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<FoodUsage[]>(() => http.get(`/FoodUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toFood) } : res;
}

async function getById(id: number | string): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.get(`/FoodUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function create(payload: FoodUsageRequest): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.post('/FoodUsage', payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function update(id: number | string, payload: Partial<FoodUsageRequest>): Promise<ApiResponse<FoodUsage>> {
  const res = await wrap<FoodUsage>(() => http.put(`/FoodUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toFood(res.data) : undefined } : res;
}

async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/FoodUsage/${id}`));
}

export const foodUsageApi = { list, getById, create, update, remove };
