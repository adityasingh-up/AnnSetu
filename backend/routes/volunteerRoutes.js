import express from 'express';
import { acceptRescueTask, verifyPickupOTP, completeDelivery, getMyVolunteerMissions } from '../controllers/volunteerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect, authorize('volunteer', 'admin'));

router.post('/accept/:id', acceptRescueTask);
router.post('/verify-pickup', verifyPickupOTP);
router.post('/complete-delivery', completeDelivery);
router.get('/missions', getMyVolunteerMissions);
router.get('/my-missions', getMyVolunteerMissions); // frontend alias

export default router;
