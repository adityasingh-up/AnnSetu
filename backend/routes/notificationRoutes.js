import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  testWhatsAppNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sab routes protected hain — login required
router.use(protect);

router.get('/', getMyNotifications);                    // GET  /api/v1/notifications
router.post('/test-whatsapp', testWhatsAppNotification);// POST /api/v1/notifications/test-whatsapp
router.put('/read-all', markAllAsRead);                 // PUT  /api/v1/notifications/read-all
router.put('/:id/read', markAsRead);                    // PUT  /api/v1/notifications/:id/read
router.delete('/:id', deleteNotification);              // DELETE /api/v1/notifications/:id

export default router;
