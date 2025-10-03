import { Platform } from 'react-native';

// Development/Production environment detection
export const isDevelopment = __DEV__;

// Prefer environment variable (Expo): define EXPO_PUBLIC_API_BASE_URL in app config or .env
const ENV_API = process.env.EXPO_PUBLIC_API_BASE_URL;

// Device-aware localhost fallbacks
const LOCALHOST = Platform.select({
  ios: 'http://localhost:5099',
  android: 'http://10.0.2.2:5099', // Android Emulator maps host machine localhost
  default: 'http://localhost:5099',
});

// API URLs for different environments
export const API_URLS = {
  development: `${LOCALHOST}/api`,
  production: 'https://your-production-api.com/api',
  staging: 'https://your-staging-api.com/api',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV_API || (isDevelopment ? API_URLS.development : API_URLS.production),
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Get the appropriate API URL based on environment
export const getApiUrl = (): string => API_CONFIG.BASE_URL;
