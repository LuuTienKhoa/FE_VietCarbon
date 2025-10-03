# Backend Integration Guide

## Tổng quan

Ứng dụng VietCarbon đã được tích hợp hoàn toàn với backend API theo OpenAPI specification để cung cấp các tính năng:

- **Authentication**: Đăng nhập/đăng ký người dùng với JWT Bearer token
- **User Activities**: Theo dõi hoạt động carbon footprint (transport, food, plastic, energy)
- **Challenges**: Thử thách giảm phát thải CO₂ với progress tracking
- **Leaderboard**: Bảng xếp hạng người dùng
- **User Management**: Nâng cấp subscription, thông tin user
- **Payment Integration**: Webhook xử lý thanh toán

## Cấu hình API

### 1. Cập nhật API URL

Mở file `config/api.ts` và cập nhật URL của backend:

```typescript
export const API_URLS = {
  development: 'http://localhost:5000/api', // URL backend local
  production: 'https://your-production-api.com/api', // URL backend production
  staging: 'https://your-staging-api.com/api', // URL backend staging
};
```

### 2. Cấu hình Environment

Ứng dụng sẽ tự động sử dụng:
- **Development URL** khi chạy trong môi trường development (`__DEV__ = true`)
- **Production URL** khi build cho production

## API Endpoints

### Authentication
- `POST /api/User/login` - Đăng nhập
- `POST /api/User/register` - Đăng ký
- `GET /api/User/me` - Lấy thông tin user hiện tại

### User Activities
- `POST /api/UserActivities` - Tạo hoạt động mới
- `GET /api/UserActivities` - Lấy danh sách hoạt động
- `DELETE /api/UserActivities?id={id}` - Xóa hoạt động
- `GET /api/UserActivities/LeaderBoard` - Bảng xếp hạng

### Challenges
- `GET /api/Challenge` - Lấy danh sách thử thách
- `POST /api/Challenge` - Tạo thử thách mới
- `GET /api/Challenge/{id}` - Lấy thử thách theo ID
- `PUT /api/Challenge/{id}` - Cập nhật thử thách
- `DELETE /api/Challenge/{id}` - Xóa thử thách

### Challenge Progress
- `GET /api/ChallengeProgress` - Lấy tiến độ thử thách
- `POST /api/ChallengeProgress` - Tạo/cập nhật tiến độ
- `GET /api/ChallengeProgress/{id}` - Lấy tiến độ theo ID

### Energy Usage
- `GET /api/EnergyUsage` - Lấy dữ liệu sử dụng năng lượng

### Transaction/Payment
- `POST /api/Transaction/payment-return` - Xử lý webhook thanh toán

### User Management
- `POST /api/User/upgrade` - Nâng cấp subscription

## Data Models

### UserActivitiesInputModel
```typescript
{
  plasticUsage?: {
    plasticItems?: [{
      plasticCategory: number,
      weight: number
    }]
  },
  trafficUsage?: {
    distance: number,
    trafficCategory: number
  },
  foodUsage?: {
    foodItems?: [{
      foodCategory: number,
      weight: number
    }]
  },
  energyUsage?: {
    electricityConsumption: number
  }
}
```

### Challenge
```typescript
{
  id: number,
  name?: string,
  description?: string,
  startDate: string,
  endDate: string,
  isComplete: boolean
}
```

### ChallengeProgress
```typescript
{
  id: number,
  userId: number,
  challengeId: number,
  progress: number,
  description?: string,
  finishDate?: string,
  isComplete: boolean,
  score: number
}
```

## Category Enums

### Traffic Category
- 1: Motorbike
- 2: Car
- 3: Bus
- 4: Train
- 5: Plane
- 6: Bicycle
- 7: Walking

### Food Category
- 1: Meat
- 2: Fish
- 3: Dairy
- 4: Eggs
- 5: Vegetables
- 6: Fruits
- 7: Grains
- 8: Nuts
- 9: Other

### Plastic Category
- 1: Single Use Plastic
- 2: Packaging
- 3: Bottles
- 4: Bags
- 5: Straws
- 6: Other

### User Role
- 1: User
- 2: Admin
- 3: Moderator

### Subscription Type
- 1: Free
- 2: Premium
- 3: Enterprise

### Upgrade Plan
- 1: Premium
- 2: Enterprise

## Authentication

Ứng dụng sử dụng JWT Bearer token để xác thực. Token được lưu trữ và tự động gửi kèm trong header `Authorization` của mỗi request.

## Error Handling

Tất cả API calls đều có error handling với:
- Loading states
- Error messages hiển thị cho user
- Retry logic (có thể mở rộng)
- Network error handling

## Testing

### 1. Test với Backend Local
```bash
# Cập nhật config/api.ts
development: 'http://localhost:5000/api'

# Chạy ứng dụng
npm start
```

### 2. Test với Backend Production
```bash
# Cập nhật config/api.ts
production: 'https://your-api.com/api'

# Build và test
npm run build
```

## Troubleshooting

### Lỗi thường gặp:

1. **CORS Error**: Đảm bảo backend đã cấu hình CORS cho domain của ứng dụng
2. **401 Unauthorized**: Kiểm tra token authentication
3. **Network Error**: Kiểm tra URL API và kết nối mạng
4. **Data Format Error**: Đảm bảo data format khớp với API schema

### Debug:

1. Mở Developer Tools trong Expo
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra Console để xem error logs
4. Sử dụng `console.log` trong code để debug

## OpenAPI Integration

Ứng dụng đã được tích hợp hoàn toàn với OpenAPI specification:

### TypeScript Types
- Tất cả types đã được tạo từ OpenAPI schemas
- Enums được định nghĩa chính xác theo backend
- Type safety đầy đủ cho tất cả API calls

### API Service
- `ApiService` class với tất cả endpoints từ OpenAPI
- JWT Bearer token authentication
- Error handling và response typing
- Support cho tất cả HTTP methods (GET, POST, PUT, DELETE)

### Data Conversion
- `ActivityConverter` utility để chuyển đổi giữa local và backend formats
- Mapping chính xác giữa frontend categories và backend enums
- Support cho batch operations

## Mở rộng

### Thêm API Endpoint mới:

1. Cập nhật OpenAPI specification
2. Thêm method vào `ApiService` class trong `services/api.ts`
3. Thêm types tương ứng (nếu cần)
4. Sử dụng trong component

### Thêm Error Handling:

1. Cập nhật `ApiResponse` interface
2. Thêm retry logic
3. Thêm offline support
4. Cải thiện error messages cho user

## Liên hệ

Nếu có vấn đề với integration, vui lòng:
1. Kiểm tra API documentation
2. Test với Postman/curl
3. Liên hệ team backend
