import api from './api';

export const notificationService = {
  // Saari notifications fetch karo
  async getNotifications() {
    return await api.get('/notifications');
  },

  // Ek notification read mark karo
  async markAsRead(id) {
    return await api.put(`/notifications/${id}/read`);
  },

  // Saari notifications read mark karo
  async markAllAsRead() {
    return await api.put('/notifications/read-all');
  },

  // Ek notification delete karo
  async deleteNotification(id) {
    return await api.delete(`/notifications/${id}`);
  }
};
