import { User, apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER: '@vietcarbon_user',
  TOKEN: '@vietcarbon_token',
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token) => {
    set({ token });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  login: async (user: User, token: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Store in AsyncStorage
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER, JSON.stringify(user)],
        [STORAGE_KEYS.TOKEN, token],
      ]);
      
      // Update state
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });

      // Set token for API client
      apiService.setToken(token);
    } catch (error) {
      set({ 
        error: 'Failed to save login data', 
        isLoading: false 
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TOKEN,
      ]);
      
      // Clear state
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });

      // Clear API client token
      apiService.setToken(null);
    } catch (error) {
      set({ 
        error: 'Failed to logout', 
        isLoading: false 
      });
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      
      const [storedUser, storedToken] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TOKEN,
      ]);
      
      if (storedUser[1] && storedToken[1]) {
        const user = JSON.parse(storedUser[1]);
        set({ 
          user, 
          token: storedToken[1], 
          isAuthenticated: true,
          isLoading: false 
        });

        // Hydrate API client token
        apiService.setToken(storedToken[1]);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ 
        error: 'Failed to load stored authentication', 
        isLoading: false 
      });
    }
  },
}));
