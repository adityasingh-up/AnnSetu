import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: true
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    acceptedAt: {
      type: Date,
      default: Date.now
    },
    pickedUpAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
      default: 'ASSIGNED'
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 30
    },
    proofPhotoUrl: {
      type: String
    },
    volunteerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackComments: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
