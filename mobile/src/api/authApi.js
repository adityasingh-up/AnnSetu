import apiClient from './apiClient';

export const authApi = {
  register: async (data) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check your network and server connection.';
      throw new Error(message);
    }
  },

  login: async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Invalid email/password or server is not reachable.';
      throw new Error(message);
    }
  },

  verifyOTP: async (data) => {
    try {
      const res = await apiClient.post('/auth/verify-otp', data);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired OTP code.';
      throw new Error(message);
    }
  },

  resendOTP: async (data) => {
    try {
      const res = await apiClient.post('/auth/resend-otp', data);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to resend OTP. Please try again.';
      throw new Error(message);
    }
  },

  forgotPassword: async (data) => {
    try {
      const res = await apiClient.post('/auth/forgot-password', data);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send reset link. Please verify your email.';
      throw new Error(message);
    }
  },

  resetPassword: async (data) => {
    try {
      const res = await apiClient.post('/auth/reset-password', data);
      return res;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. Please check OTP and try again.';
      throw new Error(message);
    }
  },

  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};
