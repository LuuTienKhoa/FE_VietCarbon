// services/trafficUsageApi.ts
import http from './http';
import { ApiResponse, wrap } from './userApi';

/**
 * Interface đại diện cho đối tượng TrafficUsage đầy đủ
 * thường được trả về từ API.
 */
export interface TrafficUsage {
  id: number;
  activityId: number;
  date: string; // ISO string
  distance: number;
  trafficCategory: number; // Enum: 1 = car, 2 = bus, etc.
  cO2Emission: number;
}

/**
 * Dữ liệu BẮT BUỘC khi TẠO MỚI một TrafficUsage.
 * Các trường được định nghĩa là bắt buộc để đảm bảo tính toàn vẹn dữ liệu khi gửi lên.
 */
export interface CreateTrafficUsageRequest {
  activityId: number;
  date: string;
  distance: number;
  trafficCategory: number;
  cO2Emission: number;
}

/**
 * Dữ liệu CÓ THỂ CÓ khi CẬP NHẬT một TrafficUsage.
 * Sử dụng Partial<> nhưng bắt buộc phải có `id` trong body request theo yêu cầu của API.
 */
export type UpdateTrafficUsageRequest = Partial<CreateTrafficUsageRequest> & {
  id: number;
};

/**
 * Hàm helper để chuyển đổi dữ liệu thô từ API sang interface TrafficUsage đã được định nghĩa.
 * Giúp đảm bảo kiểu dữ liệu nhất quán trong toàn bộ ứng dụng.
 * @param raw Dữ liệu bất kỳ từ API response.
 * @returns Đối tượng TrafficUsage đã được chuẩn hóa.
 */
const toTraffic = (raw: any): TrafficUsage => ({
  id: Number(raw?.id ?? 0),
  activityId: Number(raw?.activityId ?? 0),
  date: String(raw?.date ?? ''),
  distance: Number(raw?.distance ?? 0),
  trafficCategory: Number(raw?.trafficCategory ?? 0),
  cO2Emission: Number(raw?.cO2Emission ?? 0),
});

/**
 * Lấy danh sách tất cả TrafficUsage (hỗ trợ phân trang qua params).
 */
async function list(params?: Record<string, any>): Promise<ApiResponse<TrafficUsage[]>> {
  const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  const res = await wrap<TrafficUsage[]>(() => http.get(`/TrafficUsage${qs}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toTraffic) } : res;
}

/**
 * Lấy thông tin chi tiết của một TrafficUsage bằng ID.
 */
async function getById(id: number | string): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.get(`/TrafficUsage/${id}`));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

/**
 * Lấy danh sách TrafficUsage của một người dùng cụ thể.
 * @param userId ID của người dùng.
 */
async function getByUserId(userId: number | string): Promise<ApiResponse<TrafficUsage[]>> {
  const res = await wrap<TrafficUsage[]>(() => http.get(`/TrafficUsage/user/${userId}`));
  return res.success ? { ...res, data: (res.data ?? []).map(toTraffic) } : res;
}

/**
 * Tạo mới một bản ghi TrafficUsage.
 * @param payload Dữ liệu cần thiết để tạo mới, theo interface CreateTrafficUsageRequest.
 */
async function create(payload: CreateTrafficUsageRequest): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.post('/TrafficUsage', payload));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

/**
 * Cập nhật thông tin một bản ghi TrafficUsage.
 * @param id ID của bản ghi cần cập nhật (trên URL).
 * @param payload Dữ liệu cần cập nhật, theo interface UpdateTrafficUsageRequest (phải chứa cả id).
 */
async function update(id: number | string, payload: UpdateTrafficUsageRequest): Promise<ApiResponse<TrafficUsage>> {
  const res = await wrap<TrafficUsage>(() => http.put(`/TrafficUsage/${id}`, payload));
  return res.success ? { ...res, data: res.data ? toTraffic(res.data) : undefined } : res;
}

/**
 * Xóa một bản ghi TrafficUsage.
 */
async function remove(id: number | string): Promise<ApiResponse<null>> {
  return wrap<null>(() => http.delete(`/TrafficUsage/${id}`));
}

// Export tất cả các hàm để có thể sử dụng trong apiService
export const trafficUsageApi = {
  list,
  getById,
  getByUserId, // Đã bổ sung
  create,
  update,
  remove,
};