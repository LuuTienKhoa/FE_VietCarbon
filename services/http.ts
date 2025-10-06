import { API_BASE, API_TIMEOUT } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const http = axios.create({
  baseURL: API_BASE,        
  timeout: API_TIMEOUT,
});

http.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default http;

export const setAuthToken = (token: string | null) => {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
};