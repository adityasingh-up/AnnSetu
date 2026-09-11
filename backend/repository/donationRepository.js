import FoodDonation from '../models/FoodDonation.js';

class DonationRepository {
  async create(donationData) {
    return await FoodDonation.create(donationData);
  }

  async findById(id) {
    return await FoodDonation.findById(id)
      .populate('donorId', 'name email phone avatar location')
      .populate('volunteerId', 'name email phone vehicleType rating avatar')
      .populate('ngoId', 'name email phone organizationName location');
  }

  async findNearbyPending(coords, maxDistanceKm = 15) {
    return await FoodDonation.find({
      status: 'PENDING',
      expiryTime: { $gt: new Date() },
      pickupLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords // [lon, lat]
          },
          $maxDistance: maxDistanceKm * 1000 // meters
        }
      }
    }).populate('donorId', 'name phone organizationName avatar');
  }

  async findByDonor(donorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const donations = await FoodDonation.find({ donorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('volunteerId', 'name phone')
      .populate('ngoId', 'name organizationName');
    const total = await FoodDonation.countDocuments({ donorId });
    return { donations, total, page, pages: Math.ceil(total / limit) };
  }

  async findByVolunteer(volunteerId) {
    return await FoodDonation.find({ volunteerId })
      .sort({ updatedAt: -1 })
      .populate('donorId', 'name phone location')
      .populate('ngoId', 'name organizationName location');
  }

  async findByNGO(ngoId) {
    return await FoodDonation.find({ ngoId })
      .sort({ updatedAt: -1 })
      .populate('donorId', 'name phone')
      .populate('volunteerId', 'name phone');
  }

  async updateStatus(id, status, extraFields = {}) {
    return await FoodDonation.findByIdAndUpdate(
      id,
      { status, ...extraFields },
      { new: true, runValidators: true }
    );
  }

  async getMetricsSummary() {
    const totalDonations = await FoodDonation.countDocuments();
    const activeRescues = await FoodDonation.countDocuments({ status: { $in: ['ACCEPTED', 'PICKED_UP'] } });
    const deliveredCount = await FoodDonation.countDocuments({ status: 'DELIVERED' });
    const totalKgAgg = await FoodDonation.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, totalKg: { $sum: '$quantityKg' }, totalMeals: { $sum: '$servingsCount' } } }
    ]);

    const totalKg = totalKgAgg.length > 0 ? totalKgAgg[0].totalKg : 0;
    const totalMeals = totalKgAgg.length > 0 ? totalKgAgg[0].totalMeals : 0;

    return {
      totalDonations,
      activeRescues,
      deliveredCount,
      totalKg,
      totalMeals,
      co2SavedKg: parseFloat((totalKg * 2.5).toFixed(1)) // 1 kg food waste saved ~ 2.5 kg CO2 equivalent
    };
  }
}

export default new DonationRepository();
