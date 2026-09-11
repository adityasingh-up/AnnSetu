import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { storage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout for reliable network & email operations
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Handle global errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Server unreachable. Please check connection.';
    const customErr = new Error(message);
    customErr.isNetworkError = !error.response;
    customErr.statusCode = error?.response?.status;
    return Promise.reject(customErr);
  }
);

export default apiClient;

