import { CarbonEmissionFactor } from '@/types/carbon';

// Carbon emission factors for Vietnam (kg CO2 per unit)
export const CARBON_EMISSION_FACTORS: CarbonEmissionFactor[] = [
  // Transport (per km)
  { category: 'motorbike', factor: 0.072, unit: 'km', description: 'Xe máy' },
  { category: 'car', factor: 0.192, unit: 'km', description: 'Ô tô' },
  { category: 'bus', factor: 0.089, unit: 'km', description: 'Xe buýt' },
  { category: 'train', factor: 0.041, unit: 'km', description: 'Tàu hỏa' },
  { category: 'plane', factor: 0.285, unit: 'km', description: 'Máy bay' },
  { category: 'bicycle', factor: 0.0, unit: 'km', description: 'Xe đạp' },
  { category: 'walking', factor: 0.0, unit: 'km', description: 'Đi bộ' },

  // Energy (per kWh)
  { category: 'electricity', factor: 0.0005, unit: 'kWh', description: 'Điện' },
  { category: 'gas', factor: 0.202, unit: 'm³', description: 'Gas' },
  { category: 'heating', factor: 0.203, unit: 'kWh', description: 'Sưởi ấm' },

  // Food (per kg)
  { category: 'meat', factor: 27.0, unit: 'kg', description: 'Thịt' },
  { category: 'vegetarian', factor: 2.9, unit: 'kg', description: 'Ăn chay' },
  { category: 'vegan', factor: 1.5, unit: 'kg', description: 'Thuần chay' },
  { category: 'mixed_diet', factor: 3.3, unit: 'kg', description: 'Ăn hỗn hợp' },

  // Plastic (per kg)
  { category: 'single_use_plastic', factor: 3.5, unit: 'kg', description: 'Nhựa dùng 1 lần' },
  { category: 'packaging', factor: 2.0, unit: 'kg', description: 'Bao bì' },
  { category: 'bottles', factor: 1.4, unit: 'kg', description: 'Chai nhựa' },
  { category: 'bags', factor: 0.1, unit: 'kg', description: 'Túi nhựa' },

  // Water (per liter)
  { category: 'tap_water', factor: 0.0003, unit: 'L', description: 'Nước máy' },
  { category: 'bottled_water', factor: 0.0006, unit: 'L', description: 'Nước đóng chai' },
];

// Vietnam average carbon footprint (kg CO2 per person per year)
export const VIETNAM_AVERAGE = 2.3; // tons per year = 2300 kg per year
export const VIETNAM_DAILY_AVERAGE = VIETNAM_AVERAGE * 1000 / 365; // kg per day

// Global targets
export const GLOBAL_TARGET_2030 = 2.0; // tons per year
export const GLOBAL_TARGET_2050 = 0.5; // tons per year
