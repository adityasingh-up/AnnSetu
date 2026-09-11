import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';
import { logger } from '../utils/winstonLogger.js';

class EmailService {
  constructor() {
    this._transporter = null;
  }

  // Lazy init transporter - created only when needed so ENV is fully loaded
  getTransporter() {
    if (!this._transporter) {
      this._transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return this._transporter;
  }

  // Check if real SMTP credentials exist
  hasRealCredentials() {
    const user = ENV.SMTP_USER || '';
    const pass = ENV.SMTP_PASS || '';
    return (
      user !== '' &&
      user !== 'your_gmail@gmail.com' &&
      pass !== '' &&
      pass !== 'your_16_digit_app_password'
    );
  }

  async sendEmail({ to, subject, html }) {
    if (!this.hasRealCredentials()) {
      // Development mode: print OTP in console, don't fail
      logger.warn(`[EMAIL NOT CONFIGURED] Simulating email send...`);
      logger.info(`📨 To: ${to}`);
      logger.info(`📋 Subject: ${subject}`);
      logger.info(`💡 Setup Guide: Set SMTP_USER and SMTP_PASS in backend/.env with your Gmail App Password.`);
      logger.info(`   Steps: Google Account > Security > 2-Step Verification ON > App Passwords > Mail > Generate`);
      return { simulated: true };
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM || `AnnSetu Rescue <${ENV.SMTP_USER}>`,
        to,
        subject,
        html
      });
      logger.info(`✅ Email sent successfully to ${to} | MessageId: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`❌ Email send FAILED to ${to}: ${error.message}`);
      // Don't throw — let the registration/reset still succeed even if email fails
      return { error: error.message };
    }
  }

  async sendWelcomeOTP(to, name, otp) {
    logger.info(`🔐 Sending Welcome OTP [${otp}] to ${to}`);
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; background: #fafafa;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #16a34a; margin: 0; font-size: 24px;">🌿 Welcome to AnnSetu</h2>
          <p style="color: #666; font-size: 13px; margin-top: 6px;">AI-Powered Smart Food Rescue Platform</p>
        </div>
        <p style="font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #555;">Thank you for joining AnnSetu! Please verify your email address using the code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #16a34a; background: #f0fdf4; padding: 14px 30px; border-radius: 8px; border: 2px dashed #16a34a; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">⏰ This code expires in <strong>15 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 11px; color: #aaa; text-align: center;">If you did not create an account, please ignore this email.<br/>AnnSetu Platform — Minimizing Food Wastage with AI</p>
      </div>
    `;
    return this.sendEmail({ to, subject: '✅ Verify Your AnnSetu Account', html });
  }

  async sendPickupOTP(to, name, donationTitle, otp) {
    logger.info(`📦 Sending Pickup OTP [${otp}] to ${to}`);
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; background: #fafafa;">
        <h2 style="color: #2563eb; text-align: center;">📦 AnnSetu Pickup Verification OTP</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your food donation <strong>"${donationTitle}"</strong> has been accepted by a volunteer.</p>
        <p>Share this OTP with the volunteer when they arrive for pickup:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 14px 30px; border-radius: 8px; border: 2px dashed #2563eb; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #888; text-align: center;">⏰ This OTP expires in 15 minutes.</p>
      </div>
    `;
    return this.sendEmail({ to, subject: '🚚 Food Pickup OTP — AnnSetu', html });
  }

  async sendDonationCreatedEmail(donor, donation) {
    logger.info(`📧 Sending Donation Created Email to ${donor.email}`);
    const trackingId = donation._id ? donation._id.toString().slice(-8).toUpperCase() : 'FD' + Date.now().toString().slice(-6);
    const expiryTimeFormatted = new Date(donation.expiryTime).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">🌿 ANNSETU FOOD RESCUE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">AI-Powered Smart Food Rescue Platform</p>
        </div>

        <!-- Banner -->
        <div style="background: #f0fdf4; border-bottom: 1px solid #dcfce7; padding: 18px 24px; text-align: center;">
          <span style="font-size: 18px; font-weight: 700; color: #15803d;">📦 Food Donation Confirmed!</span>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">Order Tracking ID: <strong>#${trackingId}</strong></p>
        </div>

        <!-- Order Tracker Bar (Flipkart / Amazon Style) -->
        <div style="padding: 24px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6;">
          <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #16a34a; color: white; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">✓</div><div style="font-size: 11px; font-weight: 700; color: #16a34a; margin-top: 4px;">Posted</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #e5e7eb; color: #6b7280; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">2</div><div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Assigned</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #e5e7eb; color: #6b7280; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">3</div><div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Picked Up</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #e5e7eb; color: #6b7280; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">4</div><div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Delivered</div></td>
            </tr>
          </table>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #1f2937; margin: 0 0 16px 0;">Hi <strong>${donor.name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Aapka food donation successfully post ho chuka hai! AnnSetu AI ne aapke food ki freshness verify kar li hai aur nearby active volunteers ko alert bhej diya gaya hai.
          </p>

          <!-- Order Summary Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">📋 Donation Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Food Item:</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${donation.title}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Category:</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${donation.foodCategory || 'Cooked Meals'}</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Quantity:</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${donation.quantityKg} Kg (~${donation.servingsCount || Math.round(donation.quantityKg * 4)} people)</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">AI Freshness Score:</td><td style="padding: 8px 0; color: #16a34a; font-weight: 700; text-align: right;">⭐ ${donation.freshnessScore}% Fresh</td></tr>
              <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Pickup Window:</td><td style="padding: 8px 0; color: #d97706; font-weight: 600; text-align: right;">Until ${expiryTimeFormatted} Today</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Pickup Address:</td><td style="padding: 8px 0; color: #0f172a; font-weight: 600; text-align: right;">${donation.pickupLocation?.address || 'Registered Address'}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 26px 0;">
            <a href="${ENV.FRONTEND_URL}/donor" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">Live Track Rescue Mission</a>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5;">
            Thank you for being a Food Rescue Hero! ❤️<br/>Together we are preventing food wastage across India.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: donor.email,
      subject: `📦 Order Confirmed: Food Donation Posted #${trackingId} — AnnSetu`,
      html
    });
  }

  async sendVolunteerAssignedEmail(donor, volunteer, donation) {
    logger.info(`📧 Sending Volunteer Assigned Email to ${donor.email}`);
    const trackingId = donation._id ? donation._id.toString().slice(-8).toUpperCase() : 'FD';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🚚 RESCUE AGENT EN ROUTE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Volunteer assigned for Food Pickup #${trackingId}</p>
        </div>

        <!-- Tracker -->
        <div style="padding: 24px 20px; background: #f9fafb; border-bottom: 1px solid #f3f4f6;">
          <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <tr>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #16a34a; color: white; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">✓</div><div style="font-size: 11px; font-weight: 700; color: #16a34a; margin-top: 4px;">Posted</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #2563eb; color: white; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">✓</div><div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-top: 4px;">Assigned</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #e5e7eb; color: #6b7280; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">3</div><div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Picked Up</div></td>
              <td style="width: 25%;"><div style="width: 28px; height: 28px; line-height: 28px; background: #e5e7eb; color: #6b7280; border-radius: 50%; margin: 0 auto; font-weight: bold; font-size: 13px;">4</div><div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Delivered</div></td>
            </tr>
          </table>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #1f2937;">Hi <strong>${donor.name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Aapke food item <strong>"${donation.title}"</strong> ke pickup ke liye Volunteer assign ho chuka hai aur wo pickup ke liye nikal chuka hai.
          </p>

          <!-- Volunteer Card -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 18px 0;">
            <div style="font-size: 12px; text-transform: uppercase; color: #1e40af; font-weight: 700; margin-bottom: 8px;">🚴 Assigned Volunteer Details</div>
            <div style="font-size: 15px; font-weight: 700; color: #1e3a8a;">${volunteer.name}</div>
            <div style="font-size: 13px; color: #3b82f6; margin-top: 2px;">📞 Phone: <strong>${volunteer.phone || 'Contact via app'}</strong></div>
            <div style="font-size: 13px; color: #4b5563; margin-top: 2px;">🛵 Vehicle: ${volunteer.vehicleType || 'Two-wheeler'}</div>
          </div>

          <!-- Handover OTP Box -->
          <div style="text-align: center; margin: 24px 0; background: #fefce8; border: 2px dashed #ca8a04; border-radius: 12px; padding: 18px;">
            <div style="font-size: 12px; color: #854d0e; font-weight: 700; text-transform: uppercase;">🔐 Food Handover Verification OTP</div>
            <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #854d0e; margin: 8px 0;">${donation.pickupOtp}</div>
            <p style="margin: 0; font-size: 12px; color: #a16207;">Jab volunteer aapke paas pahuchein, tabhi unhe ye 6-digit code batayein.</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: donor.email,
      subject: `🚚 Pickup Agent Assigned: "${volunteer.name}" En Route #${trackingId} — AnnSetu`,
      html
    });
  }

  async sendFoodPickedUpEmail(donor, volunteer, donation) {
    logger.info(`📧 Sending Food Picked Up Email to ${donor.email}`);
    const trackingId = donation._id ? donation._id.toString().slice(-8).toUpperCase() : 'FD';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">📦 FOOD PICKED UP & IN-TRANSIT</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Handover OTP Verified Successfully #${trackingId}</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #1f2937;">Hi <strong>${donor.name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Aapka donation <strong>"${donation.title}" (${donation.quantityKg} Kg)</strong> volunteer <strong>${volunteer.name}</strong> dwara successfully pick up kar liya gaya hai aur NGO distribution center ke liye nikal chuka hai.
          </p>

          <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <div style="font-size: 13px; color: #9a3412;">
              ⏱️ <strong>Pickup Time:</strong> ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST<br/>
              🍱 <strong>Next Stop:</strong> Verified Beneficiary NGO Shelter
            </div>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: donor.email,
      subject: `📦 Out for Delivery: Food Picked Up Successfully #${trackingId} — AnnSetu`,
      html
    });
  }

  async sendFoodDeliveredEmail(donor, ngo, donation) {
    logger.info(`📧 Sending Food Delivered Email to ${donor.email}`);
    const trackingId = donation._id ? donation._id.toString().slice(-8).toUpperCase() : 'FD';
    const servings = donation.servingsCount || Math.round(donation.quantityKg * 4);

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 26px; text-align: center; color: #ffffff;">
          <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 900;">MISSION ACCOMPLISHED!</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Food Delivered & Served Successfully #${trackingId}</p>
        </div>

        <div style="padding: 26px;">
          <p style="font-size: 15px; color: #1f2937;">Dear <strong>${donor.name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Aapka food donation <strong>"${donation.title}" (${donation.quantityKg} Kg)</strong> successfully NGO shelter tak deliver ho chuka hai aur zarooratmand logon tak pahunch chuka hai!
          </p>

          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase;">🌟 Your Social Impact</div>
            <div style="font-size: 32px; font-weight: 900; color: #15803d; margin: 6px 0;">${servings} Meals Served</div>
            <div style="font-size: 12px; color: #166534;">Zero Food Wastage · High Nutritional Value Preserved</div>
          </div>

          <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 18px;">
            AnnSetu par vishwas karne ke liye dhanyawad. Aapke is sahyog se kisi ki bhookh miti hai! 🌿
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: donor.email,
      subject: `🎉 Delivered: Your Food Donation Served ${servings} Meals #${trackingId} — AnnSetu`,
      html
    });
  }
}

export default new EmailService();
