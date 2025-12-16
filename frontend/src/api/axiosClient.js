// Axios client configuration
import axios from 'axios';

// Base configuration - sử dụng environment variable hoặc default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng timeout lên 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - tự động thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
    // console.log('🌐 Making request to:', config.baseURL + config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('🔐 Authorization header set:', config.headers.Authorization);
    } else {
      console.log('⚠️ No token found - request will be sent without authentication');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi chung
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (token hết hạn)
    if (error.response?.status === 401) {
      console.log('❌ Token expired or invalid, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chỉ redirect nếu không phải đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Log chi tiết lỗi để debug
    if (error.response?.status >= 400) {
      console.error('🚨 API Error:', {
        status: error.response.status,
        message: error.response.data?.message || error.message,
        url: error.config?.url
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
