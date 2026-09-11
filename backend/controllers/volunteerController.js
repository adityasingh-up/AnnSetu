import donationRepository from '../repository/donationRepository.js';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import emailService from '../services/emailService.js';
import whatsappService from '../services/whatsappService.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';
import { getIO } from '../sockets/socketHandler.js';

export const acceptRescueTask = async (req, res, next) => {
  try {
    const donationId = req.params.id;
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      return sendError(res, 404, 'Donation request not found');
    }

    if (donation.status !== 'PENDING') {
      return sendError(res, 400, `Donation is already in ${donation.status} status.`);
    }

    const updatedDonation = await donationRepository.updateStatus(donationId, 'ACCEPTED', {
      volunteerId: req.user.id
    });

    // Send Flipkart/Amazon style Pickup Scheduled Email with OTP to donor
    if (donation.donorId && donation.donorId.email) {
      emailService.sendVolunteerAssignedEmail(
        donation.donorId,
        req.user,
        updatedDonation
      ).catch(err => {
        console.error('Email Volunteer Assigned Error:', err.message);
      });
    }

    // Send WhatsApp Alert to Donor & Volunteer (Flipkart style)
    whatsappService.sendVolunteerAssignedAlert(donation.donorId, req.user, updatedDonation).catch(err => {
      console.error('WhatsApp Volunteer Assigned Error:', err.message);
    });

    // Socket alert to donor
    try {
      const io = getIO();
      if (io) {
        io.emit(`donation_status_${donation._id}`, {
          status: 'ACCEPTED',
          volunteer: { id: req.user.id, name: req.user.name, phone: req.user.phone }
        });
      }
    } catch (e) {}

    return sendResponse(res, 200, true, 'Rescue mission accepted successfully!', updatedDonation);
  } catch (error) {
    next(error);
  }
};

export const verifyPickupOTP = async (req, res, next) => {
  try {
    const { donationId, otp } = req.body;
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      return sendError(res, 404, 'Donation record not found');
    }

    if (donation.pickupOtp !== otp) {
      return sendError(res, 400, 'Invalid OTP code. Handover verification failed.');
    }

    const updatedDonation = await donationRepository.updateStatus(donationId, 'PICKED_UP');

    // Create delivery record
    await Delivery.create({
      donationId: donation._id,
      volunteerId: req.user.id,
      ngoId: donation.ngoId || req.user.id, // default to assigned NGO
      status: 'IN_TRANSIT',
      pickedUpAt: new Date()
    });

    // Send WhatsApp Pickup Confirmation Alert (Flipkart Out-for-Delivery style)
    whatsappService.sendPickupConfirmation(donation.donorId, req.user, updatedDonation).catch(err => {
      console.error('WhatsApp Pickup Confirmation Error:', err.message);
    });

    // Send Flipkart style Food Picked Up Email to Donor
    if (donation.donorId && donation.donorId.email) {
      emailService.sendFoodPickedUpEmail(donation.donorId, req.user, updatedDonation).catch(err => {
        console.error('Email Food Picked Up Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'OTP Verified! Food successfully picked up.', updatedDonation);
  } catch (error) {
    next(error);
  }
};

export const completeDelivery = async (req, res, next) => {
  try {
    const { donationId, proofPhotoUrl } = req.body;
    const donation = await donationRepository.findById(donationId);

    if (!donation) {
      return sendError(res, 404, 'Donation record not found');
    }

    const updatedDonation = await donationRepository.updateStatus(donationId, 'DELIVERED', {
      deliveryProofPhoto: proofPhotoUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600'
    });

    // Update delivery record
    await Delivery.findOneAndUpdate(
      { donationId: donation._id },
      { status: 'DELIVERED', deliveredAt: new Date(), proofPhotoUrl }
    );

    // Award volunteer badge points
    await User.findByIdAndUpdate(req.user.id, { $inc: { badgePoints: 50 } });

    // Send WhatsApp Delivery Completed Alert (Flipkart Delivered style)
    whatsappService.sendDeliveryCompleted(donation.donorId, donation.ngoId, updatedDonation).catch(err => {
      console.error('WhatsApp Delivery Completed Error:', err.message);
    });

    // Send Flipkart style Food Delivered Email to Donor
    if (donation.donorId && donation.donorId.email) {
      emailService.sendFoodDeliveredEmail(donation.donorId, donation.ngoId, updatedDonation).catch(err => {
        console.error('Email Food Delivered Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Delivery completed! 50 Badge Points awarded.', updatedDonation);
  } catch (error) {
    next(error);
  }
};

export const getMyVolunteerMissions = async (req, res, next) => {
  try {
    const missions = await donationRepository.findByVolunteer(req.user.id);
    return sendResponse(res, 200, true, 'Volunteer missions fetched', missions);
  } catch (error) {
    next(error);
  }
};
