# VietCarbon 🌱

**Ứng dụng đo lường và giảm thiểu CO₂ cá nhân**

VietCarbon là ứng dụng di động giúp bạn theo dõi, tính toán và giảm thiểu dấu chân carbon cá nhân thông qua các hoạt động hàng ngày.

## ✨ Tính năng chính

### 📊 **Theo dõi dấu chân carbon**
- Tính toán lượng CO₂ theo các hoạt động: giao thông, năng lượng, ăn uống, nhựa, nước
- Dashboard trực quan hiển thị tổng CO₂ và so sánh với mức trung bình Việt Nam
- Phân tích chi tiết theo từng loại hoạt động

### 🚗 **Giao thông**
- Xe máy, ô tô, xe buýt, tàu hỏa, máy bay
- Xe đạp và đi bộ (0 CO₂)
- Tính toán dựa trên quãng đường di chuyển

### ⚡ **Năng lượng**
- Điện tiêu thụ (kWh)
- Gas và sưởi ấm
- Theo dõi theo tháng

### 🍽️ **Ăn uống**
- Chế độ ăn: thịt, chay, thuần chay, hỗn hợp
- Thực phẩm địa phương vs nhập khẩu
- Lãng phí thức ăn

### 🥤 **Nhựa & Nước**
- Đồ nhựa dùng một lần
- Bao bì, chai nhựa, túi nhựa
- Nước máy vs nước đóng chai

### 💡 **Gợi ý hành động**
- 14+ hành động cụ thể để giảm phát thải
- Phân loại theo độ khó, chi phí, tác động
- Ước tính CO₂ tiết kiệm được

### 🏆 **Gamification**
- Hệ thống điểm thưởng
- Thử thách hàng ngày/tuần/tháng
- Cộng đồng chia sẻ thành tích

## 🛠️ Công nghệ sử dụng

- **React Native** với **Expo SDK 54**
- **TypeScript** cho type safety
- **Expo Router** cho navigation
- **React Native Reanimated** cho animations
- **Material Icons** & **SF Symbols** cho icons

## 🚀 Cài đặt và chạy

1. **Cài đặt dependencies**
   ```bash
   npm install
   ```

2. **Khởi động ứng dụng**
   ```bash
   npx expo start
   ```

3. **Chạy trên thiết bị**
   - Quét QR code bằng Expo Go (Android/iOS)
   - Hoặc chạy trên emulator/simulator

## 📱 Cấu trúc ứng dụng

```
app/
├── (tabs)/
│   ├── index.tsx      # Dashboard chính
│   ├── track.tsx      # Theo dõi hoạt động
│   ├── suggestions.tsx # Gợi ý giảm CO₂
│   └── challenges.tsx  # Thử thách
├── login.tsx          # Đăng nhập
├── register.tsx       # Đăng ký
└── modal.tsx          # Modal

components/
├── carbon-activity-form.tsx  # Form thêm hoạt động
├── themed-text.tsx          # Text component
├── themed-view.tsx          # View component
└── ui/                      # UI components

types/
└── carbon.ts               # TypeScript types

utils/
└── carbon-calculator.ts    # Logic tính toán CO₂

constants/
├── theme.ts               # Theme colors
└── carbon-factors.ts      # Hệ số phát thải CO₂
```

## 🌍 Hệ số phát thải CO₂

Ứng dụng sử dụng các hệ số phát thải được nghiên cứu cho Việt Nam:

- **Giao thông**: Xe máy (0.072 kg/km), Ô tô (0.192 kg/km)
- **Năng lượng**: Điện (0.0005 kg/kWh), Gas (0.202 kg/m³)
- **Thực phẩm**: Thịt (27 kg/kg), Chay (2.9 kg/kg)
- **Nhựa**: Nhựa dùng 1 lần (3.5 kg/kg)

## 🎯 Mục tiêu

- **Mục tiêu 2030**: 2.0 tấn CO₂/năm/người
- **Mục tiêu 2050**: 0.5 tấn CO₂/năm/người
- **Trung bình VN hiện tại**: 2.3 tấn CO₂/năm/người

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp để cải thiện ứng dụng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: contact@vietcarbon.app
- **Website**: https://vietcarbon.app
- **GitHub**: https://github.com/vietcarbon/app

---

**Cùng nhau xây dựng một tương lai xanh hơn! 🌱**
