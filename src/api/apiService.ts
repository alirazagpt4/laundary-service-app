import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://laundry-service-backend-production.up.railway.app/api/v1'; 

export const authEventBus = {
  onLogout: () => {},
};

export const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiService.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Executing atomic state flush.");
      
      try {
        // Sequentially wiping data keys securely to satisfy clean standard signatures
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userData');
      } catch (storageError) {
        console.error("Storage clear sequence dropped:", storageError);
      }
      
      if (typeof authEventBus.onLogout === 'function') {
        authEventBus.onLogout();
      }
    }
    return Promise.reject(error);
  }
);