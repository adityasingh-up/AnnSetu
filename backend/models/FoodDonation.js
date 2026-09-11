import mongoose from 'mongoose';

const foodDonationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Donation title is required'],
      trim: true
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    foodCategory: {
      type: String,
      enum: ['cooked_meal', 'raw_ingredients', 'packaged_food', 'bakery_fruits', 'beverages'],
      required: true
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'jain'],
      default: 'veg'
    },
    quantityKg: {
      type: Number,
      required: [true, 'Quantity in Kg is required'],
      min: [0.5, 'Minimum quantity is 0.5 Kg']
    },
    servingsCount: {
      type: Number,
      default: 10
    },
    preparedAt: {
      type: Date,
      default: Date.now
    },
    predictedShelfLifeHours: {
      type: Number,
      default: 6
    },
    freshnessScore: {
      type: Number, // 0 to 100
      default: 95
    },
    expiryTime: {
      type: Date,
      required: true
    },
    pickupWindowStart: {
      type: Date,
      default: Date.now
    },
    pickupWindowEnd: {
      type: Date,
      required: true
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        required: [true, 'Pickup address is required']
      }
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING'
    },
    pickupOtp: {
      type: String
    },
    deliveryOtp: {
      type: String
    },
    deliveryProofPhoto: {
      type: String
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere Geospatial Index for nearby donation discovery
foodDonationSchema.index({ pickupLocation: '2dsphere' });
foodDonationSchema.index({ status: 1, expiryTime: 1 });

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);
export default FoodDonation;
