import donationRepository from '../repository/donationRepository.js';
import NGOProfile from '../models/NGOProfile.js';
import Notification from '../models/Notification.js';
import whatsappService from '../services/whatsappService.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';

export const claimDonationForNGO = async (req, res, next) => {
  try {
    const donationId = req.params.id;
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      return sendError(res, 404, 'Donation item not found');
    }

    const updated = await donationRepository.updateStatus(donationId, donation.status, {
      ngoId: req.user.id
    });

    // Send automatic WhatsApp alert to Donor
    if (donation.donorId) {
      whatsappService.sendNGOClaimedAlert(donation.donorId, req.user, updated).catch(err => {
        console.error('WhatsApp NGO Claimed Alert Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'NGO assigned to food donation rescue.', updated);
  } catch (error) {
    next(error);
  }
};

export const getNGOInventory = async (req, res, next) => {
  try {
    const donations = await donationRepository.findByNGO(req.user.id);
    const profile = await NGOProfile.findOne({ ngoId: req.user.id });

    return sendResponse(res, 200, true, 'NGO inventory & rescue history retrieved', {
      profile,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/ngo/distribute — Donation ko distribute mark karo + beneficiary count save karo
export const markAsDistributed = async (req, res, next) => {
  try {
    const { donationId, beneficiaryCount, distributionNotes } = req.body;

    if (!donationId) {
      return sendError(res, 400, 'Donation ID is required.');
    }

    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      return sendError(res, 404, 'Donation not found.');
    }

    // Only assigned NGO can distribute, or auto-assign if not yet claimed
    const assignedNgoId = donation.ngoId?._id ? donation.ngoId._id.toString() : donation.ngoId?.toString();
    if (assignedNgoId && assignedNgoId !== req.user.id) {
      return sendError(res, 403, 'Only the assigned NGO can mark this as distributed.');
    }

    if (!['PICKED_UP', 'DELIVERED'].includes(donation.status)) {
      return sendError(res, 400, `Cannot distribute: donation is in ${donation.status} status. Volunteer must pick up or deliver first.`);
    }

    // Update donation with distribution info
    const updatedDonation = await donationRepository.updateStatus(donationId, 'DELIVERED', {
      ngoId: req.user.id,
      beneficiaryCount: beneficiaryCount || 0,
      distributionNotes: distributionNotes || '',
      distributedAt: new Date()
    });

    // Notify NGO in-app
    await Notification.create({
      userId: req.user.id,
      title: '🍱 Distribution Recorded',
      message: `"${donation.title}" — ${beneficiaryCount || 0} beneficiaries ko ${donation.quantityKg} Kg food distribute ho gaya.`,
      type: 'DELIVERED'
    });

    // Send WhatsApp Delivery Completed Alert to Donor (Flipkart Delivered style)
    if (donation.donorId) {
      whatsappService.sendDeliveryCompleted(donation.donorId, req.user, updatedDonation).catch(err => {
        console.error('WhatsApp Distribution Alert Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Distribution recorded successfully!', updatedDonation);
  } catch (error) {
    next(error);
  }
};

export const updateNGOBeneficiaries = async (req, res, next) => {
  try {
    const { activeBeneficiaries, storageCapacityKg, refrigerationAvailable } = req.body;
    const profile = await NGOProfile.findOneAndUpdate(
      { ngoId: req.user.id },
      { activeBeneficiaries, storageCapacityKg, refrigerationAvailable },
      { new: true, upsert: true }
    );
    return sendResponse(res, 200, true, 'NGO Profile updated', profile);
  } catch (error) {
    next(error);
  }
};
