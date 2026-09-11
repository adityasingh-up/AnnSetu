import api from './api';

export const authService = {
  async register(data) {
    return await api.post('/auth/register', data);
  },
  async login(credentials) {
    return await api.post('/auth/login', credentials);
  },
  async verifyOTP(data) {
    return await api.post('/auth/verify-otp', data);
  },
  async resendOTP(data) {
    return await api.post('/auth/resend-otp', data);
  },
  async forgotPassword(data) {
    return await api.post('/auth/forgot-password', data);
  },
  async resetPassword(data) {
    return await api.post('/auth/reset-password', data);
  },
  async getMe() {
    return await api.get('/auth/me');
  },
  async updateProfile(profileData) {
    return await api.put('/auth/profile', profileData);
  }
};
