import { Challenge, ChallengeProgress, ChallengeRequest, apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface ChallengeState {
  challenges: Challenge[];
  challengeProgresses: ChallengeProgress[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setChallenges: (challenges: Challenge[]) => void;
  setChallengeProgresses: (progresses: ChallengeProgress[]) => void;
  addChallengeProgress: (progress: ChallengeProgress) => void;
  updateChallengeProgress: (id: number, updates: Partial<ChallengeProgress>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  fetchChallenges: () => Promise<void>;
  fetchChallengeProgresses: () => Promise<void>;
  createChallenge: (challenge: ChallengeRequest) => Promise<void>;
  updateChallenge: (id: number, challenge: Challenge) => Promise<void>;
  deleteChallenge: (id: number) => Promise<void>;
  createChallengeProgress: (progress: Omit<ChallengeProgress, 'id'>) => Promise<void>;
  updateChallengeProgressApi: (id: number, progress: ChallengeProgress) => Promise<void>;
  deleteChallengeProgress: (id: number) => Promise<void>;
  
  // Computed
  getActiveChallenges: () => Challenge[];
  getCompletedChallenges: () => Challenge[];
  getAvailableChallenges: () => Challenge[];
  getTotalPoints: () => number;
  
  // Persistence
  saveChallenges: () => Promise<void>;
  loadChallenges: () => Promise<void>;
}

const STORAGE_KEYS = {
  CHALLENGES: '@vietcarbon_challenges',
  PROGRESSES: '@vietcarbon_challenge_progresses',
};

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  challengeProgresses: [],
  isLoading: false,
  error: null,

  setChallenges: (challenges) => {
    set({ challenges });
  },

  setChallengeProgresses: (challengeProgresses) => {
    set({ challengeProgresses });
  },

  addChallengeProgress: (progress) => {
    set((state) => ({
      challengeProgresses: [...state.challengeProgresses, progress],
    }));
  },

  updateChallengeProgress: (id, updates) => {
    set((state) => ({
      challengeProgresses: state.challengeProgresses.map((progress) =>
        progress.id === id ? { ...progress, ...updates } : progress
      ),
    }));
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  // API Actions
  fetchChallenges: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getChallenges();
      
      if (response.success && response.data) {
        set({ challenges: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch challenges', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch challenges', isLoading: false });
    }
  },

  fetchChallengeProgresses: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getChallengeProgresses();
      
      if (response.success && response.data) {
        set({ challengeProgresses: response.data, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to fetch challenge progresses', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch challenge progresses', isLoading: false });
    }
  },

  createChallenge: async (challenge: ChallengeRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.createChallenge(challenge);
      
      if (response.success && response.data) {
        set((state) => ({
          challenges: [response.data!, ...state.challenges],
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to create challenge', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to create challenge', isLoading: false });
    }
  },

  updateChallenge: async (id: number, challenge: Challenge) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.updateChallenge(id, challenge);
      
      if (response.success && response.data) {
        set((state) => ({
          challenges: state.challenges.map(c => c.id === id ? response.data! : c),
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to update challenge', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update challenge', isLoading: false });
    }
  },

  deleteChallenge: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.deleteChallenge(id);
      
      if (response.success) {
        set((state) => ({
          challenges: state.challenges.filter(c => c.id !== id),
          challengeProgresses: state.challengeProgresses.filter(p => p.challengeId !== id),
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to delete challenge', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to delete challenge', isLoading: false });
    }
  },

  createChallengeProgress: async (progress: Omit<ChallengeProgress, 'id'>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.createChallengeProgress(progress);
      
      if (response.success && response.data) {
        set((state) => ({
          challengeProgresses: [response.data!, ...state.challengeProgresses],
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to create challenge progress', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to create challenge progress', isLoading: false });
    }
  },

  updateChallengeProgressApi: async (id: number, progress: ChallengeProgress) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.updateChallengeProgress(id, progress);
      
      if (response.success && response.data) {
        set((state) => ({
          challengeProgresses: state.challengeProgresses.map(p => p.id === id ? response.data! : p),
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to update challenge progress', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to update challenge progress', isLoading: false });
    }
  },

  deleteChallengeProgress: async (id: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.deleteChallengeProgress(id);
      
      if (response.success) {
        set((state) => ({
          challengeProgresses: state.challengeProgresses.filter(p => p.id !== id),
          isLoading: false
        }));
      } else {
        set({ error: response.error || 'Failed to delete challenge progress', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to delete challenge progress', isLoading: false });
    }
  },

  getActiveChallenges: () => {
    const { challenges, challengeProgresses } = get();
    return challenges.filter((challenge) => {
      const progress = challengeProgresses.find((p) => p.challengeId === challenge.id);
      return progress && !progress.isComplete;
    });
  },

  getCompletedChallenges: () => {
    const { challenges, challengeProgresses } = get();
    return challenges.filter((challenge) => {
      const progress = challengeProgresses.find((p) => p.challengeId === challenge.id);
      return progress && progress.isComplete;
    });
  },

  getAvailableChallenges: () => {
    const { challenges, challengeProgresses } = get();
    return challenges.filter((challenge) => {
      const progress = challengeProgresses.find((p) => p.challengeId === challenge.id);
      return !progress;
    });
  },

  getTotalPoints: () => {
    const { challengeProgresses } = get();
    return challengeProgresses
      .filter((progress) => progress.isComplete)
      .reduce((total, progress) => total + progress.score, 0);
  },

  saveChallenges: async () => {
    try {
      const { challenges, challengeProgresses } = get();
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges)],
        [STORAGE_KEYS.PROGRESSES, JSON.stringify(challengeProgresses)],
      ]);
    } catch (error) {
      console.error('Failed to save challenges:', error);
    }
  },

  loadChallenges: async () => {
    try {
      set({ isLoading: true });
      const [storedChallenges, storedProgresses] = await AsyncStorage.multiGet([
        STORAGE_KEYS.CHALLENGES,
        STORAGE_KEYS.PROGRESSES,
      ]);
      
      if (storedChallenges[1]) {
        const challenges = JSON.parse(storedChallenges[1]);
        set((state) => ({ ...state, challenges }));
      }
      
      if (storedProgresses[1]) {
        const challengeProgresses = JSON.parse(storedProgresses[1]);
        set((state) => ({ ...state, challengeProgresses }));
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: 'Failed to load challenges', 
        isLoading: false 
      });
    }
  },
}));
