import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import NGOProfile from '../models/NGOProfile.js';
import Notification from '../models/Notification.js';
import userRepository from '../repository/userRepository.js';
import { ENV } from '../config/env.js';
import { sendResponse, sendError } from '../helpers/responseHelper.js';
import { generateOTP, hashOTP, verifyOTP } from '../helpers/otpHelper.js';
import emailService from '../services/emailService.js';
import whatsappService from '../services/whatsappService.js';

const generateTokens = (userId, role) => {
  const token = jwt.sign({ id: userId, role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
  const refreshToken = jwt.sign({ id: userId }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  });
  return { token, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organizationName, registrationNumber, vehicleType, location } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists.');
    }

    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password,
      role: role || 'donor',
      phone,
      organizationName,
      registrationNumber,
      vehicleType: vehicleType || 'none',
      location: location || { type: 'Point', coordinates: [77.209, 28.6139], address: 'Connaught Place, New Delhi' },
      emailVerificationOTP: hashedOtp,
      emailVerificationExpire: new Date(Date.now() + 15 * 60 * 1000)
    });

    if (role === 'ngo' && organizationName && registrationNumber) {
      await NGOProfile.create({
        ngoId: newUser._id,
        organizationName,
        registrationNumber
      });
    }

    await emailService.sendWelcomeOTP(cleanEmail, name, otp);

    // Send WhatsApp Welcome Notification (Flipkart style)
    if (newUser.phone) {
      whatsappService.sendWelcomeMessage(newUser).catch(err => {
        // Non-blocking log
        console.error('WhatsApp Welcome Error:', err.message);
      });
    }

    const { token, refreshToken } = generateTokens(newUser._id, newUser.role);
    const userObj = newUser.toObject();
    delete userObj.password;

    return sendResponse(res, 201, true, 'User registered successfully. Verification OTP sent.', {
      user: userObj,
      token,
      refreshToken,
      demoOTP: otp
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    // Distinct Error 1: Email not found
    if (!user) {
      return sendError(res, 404, 'Invalid Email: No account found with this email address.');
    }

    // Distinct Error 2: Password wrong
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid Password: The password you entered is incorrect.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been disabled by system administrator.');
    }

    const { token, refreshToken } = generateTokens(user._id, user.role);
    const userObj = user.toObject();
    delete userObj.password;

    // Send WhatsApp Login Security Alert (Flipkart style)
    if (user.phone) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      whatsappService.sendLoginAlert(user, clientIp, new Date()).catch(err => {
        console.error('WhatsApp Login Alert Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Login successful', {
      user: userObj,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// Email OTP Verification
export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, 400, 'Please provide email and 6-digit OTP code.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (!user.emailVerificationOTP || !user.emailVerificationExpire) {
      return sendError(res, 400, 'No pending verification OTP found for this account.');
    }

    if (user.emailVerificationExpire < new Date()) {
      return sendError(res, 400, 'Verification OTP has expired. Please request a new OTP.');
    }

    const isValid = verifyOTP(otp, user.emailVerificationOTP);
    if (!isValid) {
      return sendError(res, 400, 'Invalid OTP code. Please check and try again.');
    }

    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send WhatsApp verification success alert
    if (user.phone) {
      whatsappService.sendAccountVerifiedAlert(user).catch(err => {
        console.error('WhatsApp Verification Alert Error:', err.message);
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return sendResponse(res, 200, true, 'Account verified successfully!', userObj);
  } catch (error) {
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Please provide email address.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    const otp = generateOTP();
    user.emailVerificationOTP = hashOTP(otp);
    user.emailVerificationExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await emailService.sendWelcomeOTP(cleanEmail, user.name, otp);

    return sendResponse(res, 200, true, 'A new verification OTP has been sent to your email.', { demoOTP: otp });
  } catch (error) {
    next(error);
  }
};

// Forgot Password - Step 1: Send Reset OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Please enter your registered email address.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return sendError(res, 404, 'Invalid Email: No account exists with this email address.');
    }

    const resetOtp = generateOTP();
    user.resetPasswordToken = hashOTP(resetOtp);
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await emailService.sendPasswordResetOTP(cleanEmail, user.name, resetOtp);

    // Send Password Reset OTP on WhatsApp
    if (user.phone) {
      whatsappService.sendPasswordResetOTP(user, resetOtp).catch(err => {
        console.error('WhatsApp Reset OTP Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Password reset OTP code sent to your email address.', {
      demoOTP: resetOtp
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password - Step 2: Verify OTP & Save New Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(res, 400, 'Please provide email, OTP code, and new password.');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpire) {
      return sendError(res, 400, 'No active password reset request found for this email.');
    }

    if (user.resetPasswordExpire < new Date()) {
      return sendError(res, 400, 'Password reset OTP code has expired. Please request a new code.');
    }

    const isValid = verifyOTP(otp, user.resetPasswordToken);
    if (!isValid) {
      return sendError(res, 400, 'Invalid OTP code. Please verify the 6-digit code and try again.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send WhatsApp Password Changed Security Alert
    if (user.phone) {
      whatsappService.sendPasswordChangedAlert(user).catch(err => {
        console.error('WhatsApp Password Changed Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Password reset successful! You can now log in with your new password.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return sendResponse(res, 200, true, 'User profile fetched', user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      avatar,
      location,
      address,
      vehicleType,
      capacityKg,
      organizationName,
      registrationNumber,
      isOnline
    } = req.body;

    const updateFields = {};
    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (phone !== undefined && phone.trim()) updateFields.phone = phone.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (vehicleType !== undefined) updateFields.vehicleType = vehicleType;
    if (capacityKg !== undefined) updateFields.capacityKg = capacityKg;
    if (organizationName !== undefined) updateFields.organizationName = organizationName.trim();
    if (registrationNumber !== undefined) updateFields.registrationNumber = registrationNumber.trim();
    if (isOnline !== undefined) updateFields.isOnline = Boolean(isOnline);

    // If direct location object or string address provided
    if (location !== undefined) {
      updateFields.location = location;
    } else if (address !== undefined && address.trim()) {
      const currentUser = await User.findById(req.user.id);
      updateFields.location = {
        type: 'Point',
        coordinates: currentUser?.location?.coordinates || [77.209, 28.6139],
        address: address.trim()
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // If user is NGO and organizationName/registrationNumber updated, update NGOProfile too
    if (updatedUser.role === 'ngo' && (organizationName !== undefined || registrationNumber !== undefined)) {
      await NGOProfile.findOneAndUpdate(
        { ngoId: updatedUser._id },
        {
          ...(organizationName !== undefined && { organizationName: organizationName.trim() }),
          ...(registrationNumber !== undefined && { registrationNumber: registrationNumber.trim() })
        },
        { upsert: true, new: true }
      );
    }

    // Profile update ke baad notification save karo
    const updatedFields = Object.keys(updateFields).join(', ');
    await Notification.create({
      userId: req.user.id,
      title: '✅ Profile Updated Successfully',
      message: `Aapki profile details (${updatedFields}) successfully update ho gayi hain.`,
      type: 'PROFILE_UPDATED'
    });

    // Send automatic WhatsApp Profile Updated Alert
    if (updatedUser.phone) {
      whatsappService.sendProfileUpdateAlert(updatedUser, Object.keys(updateFields)).catch(err => {
        console.error('WhatsApp Profile Update Alert Error:', err.message);
      });
    }

    return sendResponse(res, 200, true, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};
