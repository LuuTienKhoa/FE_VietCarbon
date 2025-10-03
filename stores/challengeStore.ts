import { Challenge, ChallengeProgress } from '@/services/api';
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
