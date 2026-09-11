import apiClient from './apiClient';
import { mockService } from '../utils/mockData';

export const volunteerApi = {
  // Accept a rescue task
  acceptTask: async (donationId) => {
    return await apiClient.post(`/volunteer/accept/${donationId}`);
  },

  // Verify pickup OTP from donor
  verifyPickupOTP: async (donationId, otp) => {
    return await apiClient.post('/volunteer/verify-pickup', { donationId, otp });
  },

  // Complete delivery (with optional proof photo)
  completeDelivery: async (donationId, proofPhotoUrl = '') => {
    return await apiClient.post('/volunteer/complete-delivery', { donationId, proofPhotoUrl });
  },

  // My missions (active + history)
  getMyMissions: async () => {
    try {
      const res = await apiClient.get('/volunteer/missions');
      return res;
    } catch (err) {
      return { success: true, data: [] };
    }
  },
};

