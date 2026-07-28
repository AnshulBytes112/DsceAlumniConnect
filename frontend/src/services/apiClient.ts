import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Centralized API Client using Axios
 * 
 * Features:
 * - Automatic JWT token attachment to all requests
 * - Global error handling
 * - 401 interceptor for unauthorized responses
 * - Automatic request/response interceptors
 * - Consistent error response format
 */

// ponytail: empty base URL → all requests go via Vite proxy → no CORS
// In production, we MUST use VITE_API_BASE_URL because there is no Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global errors and 401 responses
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt to refresh token (if refresh endpoint exists)
          // For now, redirect to login
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } catch (refreshError) {
          // Redirect to login on refresh failure
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied: You do not have permission to access this resource');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    // Handle 400 Bad Request
    if (error.response?.status === 400) {
      console.error('Bad request: Check your input parameters');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error: Unable to connect to server');
    }

    return Promise.reject(error);
  }
);

/**
 * Utility function to handle API responses consistently
 */
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data && typeof error.response.data === 'object') {
    const data = error.response.data as { message?: string };
    return data.message || 'An error occurred';
  }
  return error.message || 'An unexpected error occurred';
};

export default apiClient;
