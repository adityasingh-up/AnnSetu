import apiClient from './apiClient';
import { mockService } from '../utils/mockData';

export const donationApi = {
  // Donor: Create donation
  create: async (data) => {
    return await apiClient.post('/donations', data);
  },

  // Donor: My donation history (paginated)
  getMyDonations: async (page = 1, limit = 10) => {
    try {
      const res = await apiClient.get(`/donations/my?page=${page}&limit=${limit}`);
      return res;
    } catch (err) {
      // If error or unauthenticated, return clean empty list
      return { success: true, data: { donations: [], total: 0, page: 1, pages: 1 } };
    }
  },

  // Volunteer / NGO: Nearby pending donations
  getNearby: async (lat = 28.6139, lng = 77.209, distanceKm = 20) => {
    try {
      const res = await apiClient.get(`/donations/nearby?lat=${lat}&lng=${lng}&distance=${distanceKm}`);
      return res;
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  // All: Donation details by ID
  getById: async (id) => {
    return await apiClient.get(`/donations/${id}`);
  },
};

