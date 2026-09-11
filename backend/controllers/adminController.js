import userRepository from '../repository/userRepository.js';
import donationRepository from '../repository/donationRepository.js';
import exportService from '../services/exportService.js';
import whatsappService from '../services/whatsappService.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const metrics = await donationRepository.getMetricsSummary();
    const totalUsers = await userRepository.findAll({}, 1, 1);

    return sendResponse(res, 200, true, 'Admin platform analytics fetched', {
      metrics,
      totalUsersCount: totalUsers.total
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const roleFilter = req.query.role ? { role: req.query.role } : {};

    const result = await userRepository.findAll(roleFilter, page, limit);
    return sendResponse(res, 200, true, 'Users list retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userRepository.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const updated = await userRepository.update(userId, { isActive: !user.isActive });

    // Send automatic WhatsApp status alert to user
    if (user.phone) {
      whatsappService.sendAccountStatusAlert(user, updated.isActive).catch(err => {
        console.error('WhatsApp Account Status Alert Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, `User account ${updated.isActive ? 'activated' : 'deactivated'}`, updated);
  } catch (error) {
    next(error);
  }
};

export const exportPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    await exportService.generatePDFReport(res, startDate, endDate);
  } catch (error) {
    next(error);
  }
};

export const exportExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    await exportService.generateExcelReport(res, startDate, endDate);
  } catch (error) {
    next(error);
  }
};
