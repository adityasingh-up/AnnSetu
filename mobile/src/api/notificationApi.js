import apiClient from './apiClient';
import { mockService } from '../utils/mockData';

export const notificationApi = {
  getAll: async () => {
    try {
      return await apiClient.get('/notifications');
    } catch {
      const data = mockService.getNotifications();
      return { success: true, data };
    }
  },

  markAsRead: async (id) => {
    try {
      return await apiClient.put(`/notifications/${id}/read`);
    } catch {
      const data = mockService.markNotificationRead(id);
      return { success: true, data };
    }
  },

  markAllAsRead: async () => {
    try {
      return await apiClient.put('/notifications/read-all');
    } catch {
      const data = mockService.markAllNotificationsRead();
      return { success: true, data };
    }
  },

  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

