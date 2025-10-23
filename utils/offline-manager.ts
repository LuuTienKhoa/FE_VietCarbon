// utils/offline-manager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineData {
  activities: any[];
  user: any;
  lastSync: string;
  pendingActions: any[];
}

class OfflineManager {
  private isOnline = true;
  private pendingActions: (() => Promise<void>)[] = [];

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      
      if (this.isOnline && this.pendingActions.length > 0) {
        this.syncPendingActions();
      }
    });
  }

  async saveOfflineData(data: Partial<OfflineData>) {
    try {
      const existing = await this.getOfflineData();
      const updated = { ...existing, ...data, lastSync: new Date().toISOString() };
      await AsyncStorage.setItem('offline_data', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      return data ? JSON.parse(data) : { 
        activities: [], 
        user: null, 
        lastSync: '',
        pendingActions: []
      };
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return { activities: [], user: null, lastSync: '', pendingActions: [] };
    }
  }

  async addOfflineActivity(activity: any) {
    const data = await this.getOfflineData();
    data.activities.unshift(activity);
    await this.saveOfflineData(data);
  }

  async syncPendingActions() {
    const actions = [...this.pendingActions];
    this.pendingActions = [];
    
    for (const action of actions) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to sync action:', error);
        this.pendingActions.push(action);
      }
    }
  }

  queueAction(action: () => Promise<void>) {
    if (this.isOnline) {
      action().catch(() => this.pendingActions.push(action));
    } else {
      this.pendingActions.push(action);
    }
  }

  isConnected() {
    return this.isOnline;
  }

  // Allow offline access with cached data
  async getCachedUser() {
    const data = await this.getOfflineData();
    return data.user;
  }

  async getCachedActivities() {
    const data = await this.getOfflineData();
    return data.activities;
  }
}

export const offlineManager = new OfflineManager();
