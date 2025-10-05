import { apiService } from '@/services/api';
import { CarbonActivity, UserActivities } from '@/types/carbon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface ActivityState {
  activities: CarbonActivity[];
  userActivities: UserActivities[];
  leaderboard: UserActivities[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  
  // Actions
  setActivities: (activities: CarbonActivity[]) => void;
  setUserActivities: (activities: UserActivities[]) => void;
  setLeaderboard: (leaderboard: UserActivities[]) => void;
  addActivity: (activity: CarbonActivity) => void;
  updateActivity: (id: string, activity: Partial<CarbonActivity>) => void;
  removeActivity: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: Date) => void;
  
  // API Actions
  fetchUserActivities: (userId: number) => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  createUserActivity: (activity: any) => Promise<void>;
  deleteUserActivity: (id: number) => Promise<void>;
  
  // Persistence
  saveActivities: () => Promise<void>;
  loadActivities: () => Promise<void>;
  clearActivities: () => Promise<void>;
}

const STORAGE_KEY = '@vietcarbon_activities';

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  userActivities: [],
  leaderboard: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,

  setActivities: (activities) => {
    set({ activities });
  },

  setUserActivities: (userActivities) => {
    set({ userActivities });
  },

  setLeaderboard: (leaderboard) => {
    set({ leaderboard });
  },

  addActivity: (activity) => {
    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },

  updateActivity: (id, updates) => {
    set((state) => ({
      activities: state.activities.map((activity) =>
        activity.id === id ? { ...activity, ...updates } : activity
      ),
    }));
  },

  removeActivity: (id) => {
    set((state) => ({
      activities: state.activities.filter((activity) => activity.id !== id),
    }));
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  setLastSyncTime: (lastSyncTime) => {
    set({ lastSyncTime });
  },

  // API Actions
  fetchUserActivities: async (userId: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getUserActivitiesByUserId(userId);
      
      if (response.success && response.data) {
        set({ userActivities: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch user activities', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch user activities', isLoading: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getLeaderBoard();
      
      if (response.success && response.data) {
        set({ leaderboard: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch leaderboard', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch leaderboard', isLoading: false });
    }
  },

  createUserActivity: async (activity: any) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.createUserActivity(activity);
      
      if (response.success && response.data) {
        set((state) => ({
          userActivities: [response.data!, ...state.userActivities],
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to create activity', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to create activity', isLoading: false });
    }
  },

  deleteUserActivity: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.deleteUserActivity(id);
      
      if (response.success) {
        set((state) => ({
          userActivities: state.userActivities.filter(activity => activity.id !== id),
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to delete activity', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to delete activity', isLoading: false });
    }
  },

  saveActivities: async () => {
    try {
      const { activities } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
  },

  loadActivities: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const activities = JSON.parse(stored).map((activity: any) => ({
          ...activity,
          date: new Date(activity.date),
        }));
        set({ activities, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: 'Failed to load activities', 
        isLoading: false 
      });
    }
  },

  clearActivities: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ activities: [] });
    } catch (error) {
      console.error('Failed to clear activities:', error);
    }
  },
}));
