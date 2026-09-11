import donationRepository from '../repository/donationRepository.js';
import aiService from '../services/aiService.js';
import emailService from '../services/emailService.js';
import whatsappService from '../services/whatsappService.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';
import { generateOTP } from '../helpers/otpHelper.js';
import { getIO } from '../sockets/socketHandler.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createDonation = async (req, res, next) => {
  try {
    const { title, foodCategory, foodType, quantityKg, servingsCount, preparedAt, pickupLocation, imageUrl, notes } = req.body;

    // Call AI microservice for freshness prediction & shelf-life calculation
    const aiPrediction = await aiService.predictFreshness({
      foodCategory,
      foodType,
      quantityKg,
      preparedAt,
      imageUrl
    });

    const shelfLifeHours = aiPrediction.shelf_life_hours || 6;
    const expiryTime = new Date(Date.now() + shelfLifeHours * 60 * 60 * 1000);
    const pickupOtp = generateOTP();

    const donation = await donationRepository.create({
      title,
      donorId: req.user.id,
      foodCategory,
      foodType,
      quantityKg,
      servingsCount: servingsCount || Math.round(quantityKg * 4),
      preparedAt: preparedAt || new Date(),
      freshnessScore: aiPrediction.freshness_score || 95,
      predictedShelfLifeHours: shelfLifeHours,
      expiryTime,
      pickupWindowEnd: expiryTime,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      pickupLocation: pickupLocation || req.user.location,
      notes,
      pickupOtp
    });

    // 1. Send Flipkart/Amazon style Email Order Confirmation to Donor
    if (req.user && req.user.email) {
      emailService.sendDonationCreatedEmail(req.user, donation).catch(err => {
        console.error('Email Donation Create Error:', err.message);
      });
    }

    // 2. Send WhatsApp Food Add Confirmation to Donor (Flipkart style)
    if (req.user && req.user.phone) {
      whatsappService.sendDonationCreatedAlert(req.user, donation).catch(err => {
        console.error('WhatsApp Donation Create Error:', err.message);
      });
    }

    // 3. Find and Alert all Active Online Volunteers (Ola / Uber style Ringing Alert)
    try {
      const activeVolunteers = await User.find({
        role: 'volunteer',
        isActive: true,
        isOnline: { $ne: false }
      });

      // Socket broadcast to active volunteers room & public
      const io = getIO();
      if (io) {
        const alertPayload = {
          donationId: donation._id,
          title: donation.title,
          foodCategory: donation.foodCategory || 'Cooked Meals',
          quantityKg: donation.quantityKg,
          servingsCount: donation.servingsCount,
          freshnessScore: donation.freshnessScore,
          pickupLocation: donation.pickupLocation,
          expiryTime: donation.expiryTime,
          donor: {
            name: req.user.name,
            phone: req.user.phone
          },
          timestamp: new Date()
        };
        io.to('volunteers').emit('incoming_rescue_alert', alertPayload);
        io.emit('incoming_rescue_alert', alertPayload);
        io.emit('new_donation_available', alertPayload);
      }

      // Notify each active volunteer via In-App Notification & WhatsApp
      for (const vol of activeVolunteers) {
        Notification.create({
          userId: vol._id,
          title: '🚨 New Food Rescue Mission Nearby!',
          message: `${donation.quantityKg} Kg "${donation.title}" available at ${donation.pickupLocation?.address || 'nearby location'}. Tap to accept!`,
          type: 'NEW_DONATION'
        }).catch(() => {});

        if (vol.phone) {
          whatsappService.sendVolunteerRescueAlert(vol, donation).catch(err => {
            console.error(`WhatsApp Alert to Volunteer ${vol.name} failed:`, err.message);
          });
        }
      }
    } catch (e) {
      console.error('Active Volunteer Dispatch Error:', e.message);
    }

    return sendResponse(res, 201, true, 'Food donation posted successfully with AI Freshness Evaluation.', {
      donation,
      aiAnalysis: aiPrediction
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyDonations = async (req, res, next) => {
  try {
    const lon = parseFloat(req.query.lng) || req.user.location.coordinates[0];
    const lat = parseFloat(req.query.lat) || req.user.location.coordinates[1];
    const distanceKm = parseFloat(req.query.distance) || 20;

    const donations = await donationRepository.findNearbyPending([lon, lat], distanceKm);
    return sendResponse(res, 200, true, 'Nearby donations fetched', donations);
  } catch (error) {
    next(error);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await donationRepository.findByDonor(req.user.id, page, limit);
    return sendResponse(res, 200, true, 'Donor donations retrieved', result);
  } catch (error) {
    next(error);
  }
};

export const getDonationDetails = async (req, res, next) => {
  try {
    const donation = await donationRepository.findById(req.params.id);
    if (!donation) {
      return sendError(res, 404, 'Donation item not found');
    }
    return sendResponse(res, 200, true, 'Donation details fetched', donation);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/donations/:id — Update donation details
export const updateDonation = async (req, res, next) => {
  try {
    const donation = await donationRepository.findById(req.params.id);
    if (!donation) {
      return sendError(res, 404, 'Donation record not found.');
    }

    // Check ownership
    const donorIdStr = donation.donorId?._id ? donation.donorId._id.toString() : donation.donorId?.toString();
    if (donorIdStr !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this donation.');
    }

    const { quantityKg, notes, pickupLocation, title } = req.body;
    const updateData = {};
    const changesList = [];

    if (quantityKg !== undefined) {
      updateData.quantityKg = quantityKg;
      changesList.push(`Quantity: ${quantityKg} Kg`);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
      changesList.push(`Notes updated`);
    }
    if (title !== undefined) {
      updateData.title = title;
      changesList.push(`Title: "${title}"`);
    }
    if (pickupLocation !== undefined) {
      updateData.pickupLocation = pickupLocation;
      changesList.push(`Address: ${pickupLocation.address || 'Updated'}`);
    }

    const updated = await donationRepository.updateStatus(donation._id, donation.status, updateData);

    // Send automatic WhatsApp notification for the update
    if (req.user.phone) {
      whatsappService.sendDonationUpdatedAlert(req.user, updated, changesList.join(', ')).catch(err => {
        console.error('WhatsApp Donation Update Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Donation updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/donations/:id/cancel — Cancel donation
export const cancelDonation = async (req, res, next) => {
  try {
    const donation = await donationRepository.findById(req.params.id);
    if (!donation) {
      return sendError(res, 404, 'Donation record not found.');
    }

    const donorIdStr = donation.donorId?._id ? donation.donorId._id.toString() : donation.donorId?.toString();
    if (donorIdStr !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 403, 'Not authorized to cancel this donation.');
    }

    if (['PICKED_UP', 'DELIVERED'].includes(donation.status)) {
      return sendError(res, 400, `Cannot cancel donation in ${donation.status} state.`);
    }

    const updated = await donationRepository.updateStatus(donation._id, 'CANCELLED');

    // Send automatic WhatsApp cancellation alert to donor & volunteer
    whatsappService.sendDonationCancelledAlert(donation.donorId, donation.volunteerId, updated, req.body.reason || 'Cancelled by donor').catch(err => {
      console.error('WhatsApp Donation Cancel Error:', err.message);
    });

    return sendResponse(res, 200, true, 'Donation cancelled successfully', updated);
  } catch (error) {
    next(error);
  }
};
