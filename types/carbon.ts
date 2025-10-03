// Carbon footprint calculation types
export interface CarbonActivity {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  value: number;
  unit: string;
  co2Emission: number; // kg CO2
  date: Date;
  description?: string;
}

export type ActivityType = 
  | 'transport' 
  | 'energy' 
  | 'food' 
  | 'plastic' 
  | 'water';

export type ActivityCategory = 
  // Transport
  | 'motorbike' | 'car' | 'bus' | 'train' | 'plane' | 'bicycle' | 'walking'
  // Energy
  | 'electricity' | 'gas' | 'heating'
  // Food
  | 'meat' | 'vegetarian' | 'vegan' | 'mixed_diet'
  // Plastic
  | 'single_use_plastic' | 'packaging' | 'bottles' | 'bags'
  // Water
  | 'tap_water' | 'bottled_water';

// Backend API Types (re-exported from services/api.ts for consistency)
export type {
    Challenge,
    ChallengeProgress, EnergyUsage, EnergyUsageInputModel, FoodItem, FoodItemInputModel, FoodUsage, FoodUsageInputModel, LoginRequest, PlasticItem, PlasticItemInputModel, PlasticUsage, PlasticUsageInputModel, RegisterRequest, TrafficUsage, TrafficUsageInputModel, UpgradeRequest, User, UserActivities, UserActivitiesInputModel, WebhookData, WebhookType
} from '@/services/api';

export {
    FoodCategory,
    PlasticCategory, SubscriptionType, TrafficCategory, UpgradePlan, UserRole
} from '@/services/api';

export interface CarbonEmissionFactor {
  category: ActivityCategory;
  factor: number; // kg CO2 per unit
  unit: string;
  description: string;
}

export interface CarbonGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number; // kg CO2
  current: number; // kg CO2
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface CarbonSuggestion {
  id: string;
  title: string;
  description: string;
  category: ActivityType;
  potentialSavings: number; // kg CO2 per action
  difficulty: 'easy' | 'medium' | 'hard';
  cost: 'free' | 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface UserStats {
  totalCO2: number; // kg CO2
  averageDaily: number; // kg CO2
  reductionThisMonth: number; // kg CO2
  points: number;
  level: number;
  achievements: string[];
}

export interface CarbonChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // kg CO2 reduction
  reward: number; // points
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
  participants: number;
}
