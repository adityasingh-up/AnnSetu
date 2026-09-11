import api from './api';

export const donationService = {
  async createDonation(donationData) {
    return await api.post('/donations', donationData);
  },
  async getNearbyDonations(params = {}) {
    return await api.get('/donations/nearby', { params });
  },
  async getMyDonations(params = {}) {
    return await api.get('/donations/my', { params });
  },
  async getDonationDetails(id) {
    return await api.get(`/donations/${id}`);
  },
  async acceptRescueMission(id) {
    return await api.post(`/volunteer/accept/${id}`);
  },
  async verifyPickupOTP(donationId, otp) {
    return await api.post('/volunteer/verify-pickup', { donationId, otp });
  },
  async completeDelivery(donationId, proofPhotoUrl) {
    return await api.post('/volunteer/complete-delivery', { donationId, proofPhotoUrl });
  },
  async getMyVolunteerMissions() {
    return await api.get('/volunteer/my-missions');
  },
  async claimNGO(id) {
    return await api.post(`/ngo/claim/${id}`);
  },
  async getNGOInventory() {
    return await api.get('/ngo/inventory');
  },
  async markAsDistributed(donationId, beneficiaryCount, distributionNotes) {
    return await api.post('/ngo/distribute', { donationId, beneficiaryCount, distributionNotes });
  }
};

