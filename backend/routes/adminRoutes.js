import express from 'express';
import { getDashboardAnalytics, getAllUsersAdmin, toggleUserStatus, exportPDF, exportExcel } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getDashboardAnalytics);
router.get('/users', getAllUsersAdmin);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.get('/reports/pdf', exportPDF);
router.get('/reports/excel', exportExcel);

export default router;
