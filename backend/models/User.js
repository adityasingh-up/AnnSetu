import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['donor', 'volunteer', 'ngo', 'admin'],
      default: 'donor'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    organizationName: {
      type: String,
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['two-wheeler', 'three-wheeler', 'four-wheeler', 'van', 'none'],
      default: 'none'
    },
    capacityKg: {
      type: Number,
      default: 50
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    badgePoints: {
      type: Number,
      default: 100
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139] // Default New Delhi coordinates
      },
      address: {
        type: String,
        default: 'Connaught Place, New Delhi'
      }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationOTP: String,
    emailVerificationExpire: Date
  },
  {
    timestamps: true
  }
);

// 2dsphere Geospatial Index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
