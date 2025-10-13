// services/api.ts - Unified API Service
import { setAuthToken } from './http';

// Re-export all types from individual services
export type { Challenge, ChallengeRequest } from './challengeApi';
export type { ChallengeProgress } from './challengeProgressApi';
export type { EnergyUsage, EnergyUsageRequest } from './energyUsageApi';
export type { FoodUsage, FoodUsageRequest } from './foodUsageApi';
export type { PlasticUsage, PlasticUsageRequest } from './plasticUsageApi';
export type { TrafficUsage, TrafficUsageRequest } from './trafficUsageApi';
export type { UserActivities, UserActivitiesRequest } from './userActivitiesApi';
export type { ApiResponse, AuthPayload, ChangePasswordRequest, LoginRequest, RegisterRequest, UpdateUserRequest, User } from './userApi';

// Import the type for the alias
import type { UserActivitiesRequest } from './userActivitiesApi';

// Define enum types for backward compatibility
export enum FoodCategory {
  MEAT = 1,
  VEGETABLES = 2,
  FRUITS = 3,
  GRAINS = 4,
  OTHER = 5,
}

export enum PlasticCategory {
  SINGLE_USE_PLASTIC = 1,
  PACKAGING = 2,
  BOTTLES = 3,
  BAGS = 4,
  OTHER = 5,
}

export enum TrafficCategory {
  MOTORBIKE = 1,
  CAR = 2,
  BUS = 3,
  TRAIN = 4,
  PLANE = 5,
  BICYCLE = 6,
  WALKING = 7,
}

export enum UserRole {
  USER = 1,
  ADMIN = 2,
  MODERATOR = 3,
}

export enum SubscriptionType {
  BASIC = 1,
  PRO = 2,
  VIP = 3,
}

export enum UpgradePlan {
  BASIC_TO_PRO = 1,
  PRO_TO_VIP = 2,
  BASIC_TO_VIP = 3,
}

export enum NotifyReason {
  CHALLENGE_COMPLETED = 1,
  GOAL_ACHIEVED = 2,
  WEEKLY_REPORT = 3,
  SYSTEM_UPDATE = 4,
}

// Type aliases for backward compatibility
export type UserActivitiesInputModel = UserActivitiesRequest;

// Import individual API services
import { challengeApi } from './challengeApi';
import { challengeProgressApi } from './challengeProgressApi';
import { energyUsageApi } from './energyUsageApi';
import { foodUsageApi } from './foodUsageApi';
import { notifyApi } from './notifyApi';
import { plasticUsageApi } from './plasticUsageApi';
import { recommendApi } from './recommendApi';
import { trafficUsageApi } from './trafficUsageApi';
import { transactionApi } from './transactionApi';
import { userActivitiesApi } from './userActivitiesApi';
import { ApiResponse, userApi } from './userApi';

// Ensure all APIs have a 'list' property defined
const ensureListProperty = (api: { list?: () => Promise<ApiResponse<any[]>> }) => {
  if (!api.list) {
    api.list = async () => ({ success: true, data: [] });
  }
};

// Apply the fix to all APIs
[challengeApi, challengeProgressApi, energyUsageApi, foodUsageApi, notifyApi, plasticUsageApi, recommendApi, trafficUsageApi, transactionApi, userActivitiesApi, userApi].forEach(ensureListProperty);

// Unified API Service
export const apiService = {
  // Token management
  setToken: (token: string | null) => {
    setAuthToken(token);
  },

  // User APIs
  user: {
    login: userApi.login,
    register: userApi.register,
    me: userApi.me,
    getById: userApi.getById,
    list: userApi.list,
    update: userApi.update,
    remove: userApi.remove,
    changePassword: userApi.changePassword,
    upgrade: userApi.upgrade,
    updateRole: userApi.updateRole,
  },

  // Challenge APIs
  challenge: {
    list: challengeApi.list,
    getById: challengeApi.getById,
    create: challengeApi.create,
    update: challengeApi.update,
    remove: challengeApi.remove,
  },

  // Challenge Progress APIs
  challengeProgress: {
    list: challengeProgressApi.list,
    getById: challengeProgressApi.getById,
    create: challengeProgressApi.create,
    update: challengeProgressApi.update,
    remove: challengeProgressApi.remove,
  },

  // Energy Usage APIs
  energyUsage: {
    list: energyUsageApi.list,
    getById: energyUsageApi.getById,
    create: energyUsageApi.create,
    update: energyUsageApi.update,
    remove: energyUsageApi.remove,
  },

  // Food Usage APIs
  foodUsage: {
    list: foodUsageApi.list,
    getById: foodUsageApi.getById,
    create: foodUsageApi.create,
    update: foodUsageApi.update,
    remove: foodUsageApi.remove,
  },

  // Plastic Usage APIs
  plasticUsage: {
    list: plasticUsageApi.list,
    getById: plasticUsageApi.getById,
    create: plasticUsageApi.create,
    update: plasticUsageApi.update,
    remove: plasticUsageApi.remove,
  },

  // Traffic Usage APIs
  trafficUsage: {
    list: trafficUsageApi.list,
    getById: trafficUsageApi.getById,
    create: trafficUsageApi.create,
    update: trafficUsageApi.update,
    remove: trafficUsageApi.remove,
  },

  // User Activities APIs
  userActivities: {
    list: userActivitiesApi.list,
    getById: userActivitiesApi.getById,
    create: userActivitiesApi.create,
    update: userActivitiesApi.update,
    remove: userActivitiesApi.remove,
    getByUserId: userActivitiesApi.getByUserId,
    getLeaderBoard: userActivitiesApi.getLeaderBoard,
  },

  // Notification APIs
  notify: {
    list: notifyApi.list,
    getById: notifyApi.getById,
    create: notifyApi.create,
    update: notifyApi.update,
    remove: notifyApi.remove,
  },

  // Recommendation APIs
  recommend: {
    list: recommendApi.list,
    getById: recommendApi.getById,
    create: recommendApi.create,
    update: recommendApi.update,
    remove: recommendApi.remove,
  },

  // Transaction APIs
  transaction: {
    list: transactionApi.list,
    getById: transactionApi.getById,
    create: transactionApi.create,
    update: transactionApi.update,
    remove: transactionApi.remove,
  },
  

  // Convenience methods for common operations
  createUserActivity: async (activity: any) => {
    return userActivitiesApi.create(activity);
  },

  getUserActivitiesByUserId: async (userId: number) => {
    return userActivitiesApi.getByUserId(userId);
  },

  getLeaderBoard: async () => {
    return userActivitiesApi.getLeaderBoard();
  },

  getChallenges: async () => {
    return challengeApi.list();
  },

  createChallenge: async (challenge: any) => {
    return challengeApi.create(challenge);
  },

  updateChallenge: async (id: number, challenge: any) => {
    return challengeApi.update(id, challenge);
  },

  deleteChallenge: async (id: number) => {
    return challengeApi.remove(id);
  },

  getChallengeProgresses: async () => {
    return challengeProgressApi.list();
  },

  createChallengeProgress: async (progress: any) => {
    return challengeProgressApi.create(progress);
  },

  updateChallengeProgress: async (id: number, progress: any) => {
    return challengeProgressApi.update(id, progress);
  },

  deleteChallengeProgress: async (id: number) => {
    return challengeProgressApi.remove(id);
  },
};


// Export individual services for backward compatibility
export {
  challengeApi,
  challengeProgressApi,
  energyUsageApi,
  foodUsageApi, notifyApi, plasticUsageApi, recommendApi, trafficUsageApi, transactionApi, userActivitiesApi, userApi
};

