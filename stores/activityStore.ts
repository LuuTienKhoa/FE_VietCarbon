import { CarbonActivity } from '@/types/carbon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface ActivityState {
  activities: CarbonActivity[];
  isLoading: boolean;
  error: string | null;
  lastSyncTime: Date | null;
  
  // Actions
  setActivities: (activities: CarbonActivity[]) => void;
  addActivity: (activity: CarbonActivity) => void;
  updateActivity: (id: string, activity: Partial<CarbonActivity>) => void;
  removeActivity: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: Date) => void;
  
  // Persistence
  saveActivities: () => Promise<void>;
  loadActivities: () => Promise<void>;
  clearActivities: () => Promise<void>;
}

const STORAGE_KEY = '@vietcarbon_activities';

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,

  setActivities: (activities) => {
    set({ activities });
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
