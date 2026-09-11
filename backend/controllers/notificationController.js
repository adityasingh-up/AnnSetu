import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';

// GET /api/v1/notifications — User ki saari notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    return sendResponse(res, 200, true, 'Notifications fetched successfully', {
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/notifications/:id/read — Ek notification read mark karo
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/notifications/read-all — Saari notifications read mark karo
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    return sendResponse(res, 200, true, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/notifications/:id — Ek notification delete karo
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendResponse(res, 200, true, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/notifications/test-whatsapp — Test WhatsApp alert
import whatsappService from '../services/whatsappService.js';

export const testWhatsAppNotification = async (req, res, next) => {
  try {
    const phone = req.body.phone || req.user.phone;
    const message = req.body.message || `🧪 *AnnSetu WhatsApp Test Notification*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nHello ${req.user.name}!\nThis is a test notification confirming that WhatsApp alerts are active on your AnnSetu platform.\nTime: ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n_AnnSetu System Check_`;

    const result = await whatsappService.sendMessage(phone, message);

    return sendResponse(res, 200, true, result.simulated ? 'Test WhatsApp message simulated in console.' : 'Test WhatsApp message sent to phone!', {
      phone,
      simulated: result.simulated,
      hasRealCredentials: whatsappService.hasRealCredentials()
    });
  } catch (error) {
    next(error);
  }
};
