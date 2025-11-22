// Authentication API calls
import axiosClient from '../axiosClient';

const authApi = {
  // Login user
  login: (data) => axiosClient.post("/auth/login", data),
  
  // Register user
  register: (data) => axiosClient.post("/auth/register", data),
  
  // Get current user profile
  getProfile: () => axiosClient.get("/auth/me"),
  
  // Forgot password
  forgotPassword: (data) => axiosClient.post("/auth/forgot-password", data),

  // Verify reset OTP
  verifyResetOtp: (data) => axiosClient.post("/auth/verify-reset-otp", data),
  
  // Reset password
  resetPassword: (data) => axiosClient.post("/auth/reset-password", data),
  
  // Google OAuth login
  googleLogin: (data) => axiosClient.post("/auth/google", data),
  
  // Firebase login
  firebaseLogin: (data) => axiosClient.post("/auth/firebase-login", data),
  
  // Logout
  logout: () => axiosClient.post("/auth/logout"),
};

export default authApi;
