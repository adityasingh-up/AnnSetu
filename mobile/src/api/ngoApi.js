import apiClient from './apiClient';
import { mockService } from '../utils/mockData';

export const ngoApi = {
  // Claim a donation for this NGO
  claimDonation: async (donationId) => {
    return await apiClient.post(`/ngo/claim/${donationId}`);
  },

  // Get NGO inventory (claimed donations + profile)
  getInventory: async () => {
    try {
      const res = await apiClient.get('/ngo/inventory');
      return res;
    } catch (err) {
      return { success: true, data: { donations: [], profile: null } };
    }
  },

  // Update NGO operational profile
  updateProfile: (data) => apiClient.put('/ngo/profile', data),

  // Mark distribution as done
  markDistributed: async (donationId, beneficiaryCount, distributionNotes = '') => {
    return await apiClient.post('/ngo/distribute', { donationId, beneficiaryCount, distributionNotes });
  },
};

