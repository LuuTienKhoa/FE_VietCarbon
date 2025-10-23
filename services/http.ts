import { API_BASE, API_TIMEOUT } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const http = axios.create({
  baseURL: API_BASE,
  timeout: API_TIMEOUT,
});

// 🟢 Interceptor thêm token cho mỗi request
http.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log('➡️ [HTTP REQUEST]', config.method?.toUpperCase(), config.url, config.data ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);
  
// 🔴 Interceptor bắt lỗi response
http.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ [HTTP RESPONSE]', response.status, response.data);
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (__DEV__) {
        console.warn('❌ [HTTP ERROR]', status, data);
      }

      // Tự động xử lý các lỗi phổ biến
      switch (status) {
        case 401:
          console.log('⚠️ Unauthorized - clearing token');
          await AsyncStorage.removeItem('auth_token');
          break;
        case 403:
          console.log('🚫 Forbidden - quyền truy cập bị từ chối');
          break;
        case 500:
          console.log('💥 Server error - vui lòng thử lại sau');
          break;
      }
    } else {
      console.warn('🌐 [NETWORK ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

// 🧩 Export các hàm tiện ích
export const setAuthToken = (token: string | null) => {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('auth_token');
  delete http.defaults.headers.common.Authorization;
};

export default http;
