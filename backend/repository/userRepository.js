import User from '../models/User.js';

class UserRepository {
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
  }

  async findVolunteersNear(coords, maxDistanceKm = 10) {
    return await User.find({
      role: 'volunteer',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coords // [lon, lat]
          },
          $maxDistance: maxDistanceKm * 1000 // meters
        }
      }
    }).select('-password');
  }

  async findAll(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    return { users, total, page, pages: Math.ceil(total / limit) };
  }
}

export default new UserRepository();
