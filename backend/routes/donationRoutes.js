import express from 'express';
import {
  createDonation,
  getNearbyDonations,
  getMyDonations,
  getDonationDetails,
  updateDonation,
  cancelDonation
} from '../controllers/donationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';
import { createDonationValidation } from '../validations/donationValidation.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('donor', 'admin'), createDonationValidation, createDonation);
router.get('/nearby', authorize('volunteer', 'ngo', 'admin'), getNearbyDonations);
router.get('/my', authorize('donor'), getMyDonations);
router.get('/:id', getDonationDetails);
router.put('/:id', authorize('donor', 'admin'), updateDonation);
router.post('/:id/cancel', authorize('donor', 'admin'), cancelDonation);

export default router;
