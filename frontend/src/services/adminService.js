import api from './api';

export const adminService = {
  async getAnalytics() {
    return await api.get('/admin/analytics');
  },
  async getUsers(params = {}) {
    return await api.get('/admin/users', { params });
  },
  async toggleUserStatus(userId) {
    return await api.patch(`/admin/users/${userId}/toggle-status`);
  },
  getPDFReportUrl() {
    return '/api/v1/admin/reports/pdf';
  },
  getExcelReportUrl() {
    return '/api/v1/admin/reports/excel';
  }
};
