// Authentication Service - Business Logic
import authApi from './authApi';

const authService = {
  // Login with business logic
  async login(email, password) {
    try {
      const response = await authApi.login({ email, password });
      const { token } = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem('token', token);
      
      // Lấy thông tin user
      const userResponse = await authApi.getProfile();
      const userData = userResponse.data;
      
      // Lưu user data vào localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        token,
        user: userData
      };
    } catch (error) {
      // Xử lý lỗi và throw lại để component xử lý
      throw error.response?.data || error;
    }
  },

  // Register with business logic
  async register(userData) {
    try {
      const response = await authApi.register(userData);
      
      // Có thể tự động login sau khi register
      // hoặc chỉ trả về success message
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user (from localStorage or API)
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Logout with cleanup
  async logout() {
    try {
      // Gọi API logout (nếu server hỗ trợ)
      await authApi.logout();
    } catch (error) {
      // Dù API logout fail, vẫn clear local storage
      console.warn('Logout API failed:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await authApi.forgotPassword({ email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify OTP
  async verifyResetOtp(email, otp) {
    try {
      const response = await authApi.verifyResetOtp({ email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset password
  async resetPassword({ email, otp, newPassword, confirmPassword }) {
    try {
      const response = await authApi.resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Google/Firebase login - tối ưu cho tốc độ
  async googleLogin(idToken) {
    try {
      // Validate input
      if (!idToken) {
        throw new Error('Firebase ID token is required');
      }
      
      // Reduced timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
      
      try {
        const response = await authApi.firebaseLogin({ idToken }, { 
          signal: controller.signal,
          timeout: 6000,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        const { token, user: userData } = response.data;
        
        // Validate response
        if (!token || !userData) {
          throw new Error('Invalid response from server');
        }
        
        // Store data immediately
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          token,
          user: userData
        };
      } catch (apiError) {
        clearTimeout(timeoutId);
        console.error('Google login API error:', apiError);
        throw apiError;
      }
    } catch (error) {
      // Clear data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Handle timeout
      if (error.name === 'AbortError' || error.message === 'API timeout') {
        throw new Error('Kết nối quá chậm. Vui lòng thử lại');
      }
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw error.response?.data || error;
    }
  }
};

export default authService;
