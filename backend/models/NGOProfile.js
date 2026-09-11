import mongoose from 'mongoose';

const ngoProfileSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    organizationName: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    activeBeneficiaries: {
      type: Number,
      default: 100
    },
    storageCapacityKg: {
      type: Number,
      default: 500
    },
    refrigerationAvailable: {
      type: Boolean,
      default: true
    },
    totalFoodReceivedKg: {
      type: Number,
      default: 0
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [String],
    operatingHours: {
      type: String,
      default: '08:00 AM - 10:00 PM'
    }
  },
  {
    timestamps: true
  }
);

const NGOProfile = mongoose.model('NGOProfile', ngoProfileSchema);
export default NGOProfile;
