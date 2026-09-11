import express from 'express';
import { claimDonationForNGO, getNGOInventory, updateNGOBeneficiaries, markAsDistributed } from '../controllers/ngoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ngo', 'admin'));

router.post('/claim/:id', claimDonationForNGO);
router.get('/inventory', getNGOInventory);
router.put('/profile', updateNGOBeneficiaries);
router.post('/distribute', markAsDistributed);    // POST /api/v1/ngo/distribute

export default router;
