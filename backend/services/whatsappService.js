import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from '../utils/winstonLogger.js';

class WhatsAppService {
  /**
   * Format any phone number into international E.164 format (+91XXXXXXXXXX)
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).trim().replace(/[\s\-\(\)]/g, '');

    // If starts with 00, replace with +
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    }
    // If starts with single 0, assume Indian number and replace with +91
    else if (cleaned.startsWith('0')) {
      cleaned = '+91' + cleaned.slice(1);
    }
    // If exactly 10 digits (standard Indian mobile), prepend +91
    else if (/^\d{10}$/.test(cleaned)) {
      cleaned = '+91' + cleaned;
    }
    // If digits without +, add +
    else if (!cleaned.startsWith('+') && /^\d+$/.test(cleaned)) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Check whether real WhatsApp credentials exist (Twilio or Meta Cloud API)
   */
  hasRealCredentials() {
    const hasTwilio = (
      (ENV.TWILIO_ACCOUNT_SID || '').trim().length > 10 &&
      !ENV.TWILIO_ACCOUNT_SID.includes('your_twilio') &&
      (ENV.TWILIO_AUTH_TOKEN || '').trim().length > 10 &&
      !ENV.TWILIO_AUTH_TOKEN.includes('your_auth_token')
    );

    const hasMeta = (
      (ENV.META_WHATSAPP_TOKEN || '').trim().length > 15 &&
      !ENV.META_WHATSAPP_TOKEN.includes('your_meta') &&
      (ENV.META_PHONE_NUMBER_ID || '').trim().length > 5
    );

    return hasTwilio || hasMeta;
  }

  /**
   * Core method to send a WhatsApp message
   */
  async sendMessage(toPhone, message) {
    const formattedPhone = this.formatPhoneNumber(toPhone);

    if (!formattedPhone) {
      logger.warn(`[WHATSAPP] Cannot send message: Missing or invalid phone number: "${toPhone}"`);
      return { success: false, reason: 'Invalid phone number' };
    }

    // 1. Check if Meta WhatsApp Cloud API is configured (Official Flipkart method)
    if (ENV.META_WHATSAPP_TOKEN && !ENV.META_WHATSAPP_TOKEN.includes('your_meta') && ENV.META_PHONE_NUMBER_ID) {
      try {
        const cleanRecipient = formattedPhone.replace('+', '');
        const metaUrl = `https://graph.facebook.com/v19.0/${ENV.META_PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(
          metaUrl,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanRecipient,
            type: 'text',
            text: { preview_url: true, body: message }
          },
          {
            headers: {
              'Authorization': `Bearer ${ENV.META_WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        logger.info(`✅ [META WHATSAPP REAL SENT] Message delivered to ${formattedPhone} | ID: ${response.data.messages?.[0]?.id}`);
        return { success: true, simulated: false, provider: 'meta', messageId: response.data.messages?.[0]?.id };
      } catch (metaErr) {
        logger.error(`❌ [META WHATSAPP ERROR] Meta Cloud API send failed: ${metaErr.response?.data?.error?.message || metaErr.message}`);
        this.logSimulatedMessage(formattedPhone, message, true);
        return { success: false, error: metaErr.message };
      }
    }

    // 2. Check if Twilio WhatsApp API is configured
    if (ENV.TWILIO_ACCOUNT_SID && !ENV.TWILIO_ACCOUNT_SID.includes('your_twilio')) {
      try {
        const sid = ENV.TWILIO_ACCOUNT_SID;
        const token = ENV.TWILIO_AUTH_TOKEN;
        const fromNumber = (ENV.TWILIO_WHATSAPP_NUMBER || '').startsWith('whatsapp:')
          ? ENV.TWILIO_WHATSAPP_NUMBER
          : `whatsapp:${ENV.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`;
        const toNumber = `whatsapp:${formattedPhone}`;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
        const authHeader = 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64');

        const params = new URLSearchParams();
        params.append('From', fromNumber);
        params.append('To', toNumber);
        params.append('Body', message);

        const response = await axios.post(url, params.toString(), {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        });

        logger.info(`✅ [TWILIO WHATSAPP REAL SENT] Message delivered to ${formattedPhone} | Twilio SID: ${response.data.sid}`);
        return { success: true, simulated: false, provider: 'twilio', messageId: response.data.sid };
      } catch (error) {
        logger.error(`❌ [TWILIO WHATSAPP ERROR] Twilio send failed to ${formattedPhone}: ${error.response?.data?.message || error.message}`);
        this.logSimulatedMessage(formattedPhone, message, true);
        return { success: false, error: error.message };
      }
    }

    // 3. Fallback / Development Simulation Mode (When API keys are placeholders)
    this.logSimulatedMessage(formattedPhone, message, false);
    return { success: true, simulated: true };
  }

  /**
   * Pretty printer for console simulation (Flipkart/Amazon style)
   */
  logSimulatedMessage(phone, message, isFallback = false) {
    const time = new Date().toLocaleTimeString();
    const divider = '━'.repeat(62);
    
    console.log(`\n\x1b[32m${divider}\x1b[0m`);
    console.log(`\x1b[32m📱 [WHATSAPP NOTIFICATION - ${isFallback ? 'FALLBACK SIMULATION' : 'SIMULATION MODE'}]\x1b[0m`);
    console.log(`\x1b[36m📞 To: ${phone}  |  🕒 Time: ${time}\x1b[0m`);
    console.log(`\x1b[32m${divider}\x1b[0m`);
    console.log(`\x1b[37m${message}\x1b[0m`);
    console.log(`\x1b[32m${divider}\x1b[0m`);
    if (!this.hasRealCredentials()) {
      console.log(`\x1b[33m💡 Tip: To send real WhatsApp messages directly to phones, set:\x1b[0m`);
      console.log(`\x1b[90m   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in backend/.env\x1b[0m`);
    }
    console.log(`\x1b[32m${divider}\x1b[0m\n`);
  }

  /**
   * 1. Welcome Message on Registration
   */
  async sendWelcomeMessage(user) {
    const roleCapitalized = (user.role || 'Donor').toUpperCase();
    const message = 
`🌿 *Welcome to AnnSetu Platform!* 🌿
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${user.name}*, thank you for joining India's Smart AI Food Rescue Network as a *${roleCapitalized}*.

Together, we connect excess food with those who need it most, ensuring zero wastage!

✅ *Account Details:*
• Name: ${user.name}
• Role: ${roleCapitalized}
• Phone: ${user.phone}
• Email: ${user.email}

🔗 Open App: ${ENV.FRONTEND_URL}
Need help? Reply to this message or contact AnnSetu support.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu — Minimizing Hunger with AI_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 2. Login Security Alert (Flipkart style)
   */
  async sendLoginAlert(user, ip = '127.0.0.1', loginTime = new Date()) {
    const timeFormatted = new Date(loginTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const message = 
`🛡️ *AnnSetu Security Alert: Login Detected*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${user.name}*,

A new login was detected on your AnnSetu account:
• *Account:* ${user.email}
• *Role:* ${(user.role || 'user').toUpperCase()}
• *Date & Time:* ${timeFormatted} IST
• *IP Address:* ${ip}

If this was you, no action is required!
⚠️ If you did NOT log in, please reset your password immediately at:
${ENV.FRONTEND_URL}/login
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Security Team_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 3. Food Donation Created (Food Add - Exact Flipkart Saathi Order/Pickup style)
   */
  async sendDonationCreatedAlert(donor, donation) {
    const expiryFormatted = new Date(donation.expiryTime).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });

    const confirmUrl = `${ENV.FRONTEND_URL}/donor`;

    const message = 
`*AnnSetu Saathi* 🌿

🚚 *Delivery Update: Confirm Your Availability for ${donation.title}*

*Confirm Availability: Pickup of ${donation.title} (${donation.quantityKg} Kg)*

Your food donation will be picked up by *${expiryFormatted} today*.

Please *confirm your availability* below to avoid any delays in the pickup of your food 👇

↩ *Yes, pick the item today*
${confirmUrl}

↩ *Change the pickup date/time*
${confirmUrl}

↩ *Cancel my order pickup*
${confirmUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Order Summary:*
• Item: ${donation.title} (${donation.foodType?.toUpperCase()})
• Quantity: ${donation.quantityKg} Kg (~${donation.servingsCount || Math.round(donation.quantityKg * 4)} people)
• AI Freshness: ${donation.freshnessScore}%
• Pickup Address: ${donation.pickupLocation?.address || 'Registered Address'}

🔐 *SECRET PICKUP OTP:* *${donation.pickupOtp}*
_(Share this code with the volunteer ONLY during handover)_

To pause important rescue updates via WhatsApp, send STOP.`;

    return this.sendMessage(donor.phone, message);
  }

  /**
   * 3B. Active Volunteers Incoming Rescue Alert (Ola / Uber style)
   */
  async sendVolunteerRescueAlert(volunteer, donation) {
    const expiryFormatted = new Date(donation.expiryTime).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });

    const missionUrl = `${ENV.FRONTEND_URL}/volunteer`;

    const message = 
`🚨 *ANNSETU RESCUE RADAR: NEW TASK NEARBY!* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${volunteer.name}*, ek naya food rescue task aapke area mein available hai!

🍱 *Food Details:*
• Item: *${donation.title}* (${donation.foodCategory || 'Cooked Meals'})
• Quantity: *${donation.quantityKg} Kg* (~${donation.servingsCount || Math.round(donation.quantityKg * 4)} people)
• Freshness Score: *${donation.freshnessScore}%*
• Pickup Window: *Until ${expiryFormatted}*
• Pickup Address: *${donation.pickupLocation?.address || 'Near you'}*

⚡ *Tap below to claim this mission before someone else takes it:*
👉 ${missionUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Volunteer Dispatch System_`;

    return this.sendMessage(volunteer.phone, message);
  }

  /**
   * 4. Volunteer Assigned / Accepted Rescue (Flipkart Saathi Handover style)
   */
  async sendVolunteerAssignedAlert(donor, volunteer, donation) {
    // Message to Donor (Flipkart Saathi Pickup Confirmation)
    const donorMsg = 
`*AnnSetu Saathi* 🌿

🛵 *Pickup Update: Volunteer Assigned for ${donation.title}*

Thank you for your confirmation! 
Volunteer *${volunteer?.name}* (📞 ${volunteer?.phone || 'In App'}) has been assigned to pick up your food today.

Please keep the food packed and verify handover with your OTP:
🔐 *Pickup OTP:* *${donation.pickupOtp}*

Please *confirm your availability* below 👇
↩ *Yes, I am available now*
${ENV.FRONTEND_URL}/donor

↩ *Need to reschedule*
${ENV.FRONTEND_URL}/donor

To pause important order updates via WhatsApp, send STOP.`;

    await this.sendMessage(donor?.phone, donorMsg);

    // Message to Volunteer
    if (volunteer?.phone) {
      const volMsg = 
`*AnnSetu Saathi* 🌿

🛵 *New Rescue Task Assigned!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${volunteer.name}*, you have accepted the pickup for:
🍲 *${donation.title}* (${donation.quantityKg} Kg)

📍 *Pickup Address:* ${donation.pickupLocation?.address || 'See map in app'}
👤 *Donor Contact:* ${donor?.name} (📞 ${donor?.phone})
⏰ *Target Pickup:* By ${new Date(donation.pickupWindowEnd || donation.expiryTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} today

👉 *Action:* Ask the donor for the *Pickup OTP* to verify receipt in the app.
━━━━━━━━━━━━━━━━━━━━━━━━━━
To pause alerts, send STOP.`;

      await this.sendMessage(volunteer.phone, volMsg);
    }
  }

  /**
   * 5. Food Picked Up / Received (OTP Verified - Flipkart "Out for Delivery" style)
   */
  async sendPickupConfirmation(donor, volunteer, donation) {
    // Message to Donor
    const donorMsg = 
`✅ *Food Successfully Handover Complete!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor?.name}*, 

Your food donation *"${donation.title}"* has been safely collected by volunteer *${volunteer?.name}*!

🚚 *Current Status:* IN TRANSIT to Partner NGO
⚖️ *Quantity Rescued:* ${donation.quantityKg} Kg
⏰ *Picked Up At:* ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST

Thank you for rescuing food and saving lives today! 🌟
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Impact Tracking_`;

    await this.sendMessage(donor?.phone, donorMsg);

    // Message to Volunteer
    if (volunteer?.phone) {
      const volMsg = 
`🍱 *Pickup Verified! Proceed to Destination*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${volunteer.name}*,

Pickup of *"${donation.title}"* verified successfully! 
Please deliver the food safely to the assigned partner NGO.

📸 Remember to capture a quick delivery proof photo upon handover.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Keep up the great work!_`;

      await this.sendMessage(volunteer.phone, volMsg);
    }
  }

  /**
   * 6. Delivery Completed / Distributed (Flipkart "Delivered" style)
   */
  async sendDeliveryCompleted(donor, ngo, donation) {
    const servings = donation.servingsCount || Math.round(donation.quantityKg * 4);
    const donorMsg = 
`🎉 *Mission Accomplished - Food Delivered!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor?.name}*,

Wonderful news! Your donation *"${donation.title}"* (${donation.quantityKg} Kg) has been successfully delivered and distributed to beneficiaries!

🍽️ *Impact:* ~${servings} hungry people nourished
🏢 *Partner NGO:* ${ngo?.organizationName || ngo?.name || 'Verified Community NGO'}
🌱 *CO₂ Prevented:* ~${(donation.quantityKg * 2.5).toFixed(1)} Kg

You can download your official Food Donor Impact Certificate on your dashboard:
${ENV.FRONTEND_URL}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu — Zero Waste, Zero Hunger_`;

    return this.sendMessage(donor?.phone, donorMsg);
  }

  /**
   * 7. Profile Updated Alert (Any field update: Name, Phone, Vehicle, Location, etc.)
   */
  async sendProfileUpdateAlert(user, updatedFields = []) {
    const fieldsList = Array.isArray(updatedFields) ? updatedFields.join(', ') : updatedFields;
    const timeFormatted = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    const message = 
`✏️ *AnnSetu Profile Update Notification*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${user.name}*,

Aapki profile me details update hui hain:
• *Updated Fields:* ${fieldsList}
• *Time:* ${timeFormatted} IST
• *Account Role:* ${(user.role || 'user').toUpperCase()}

Agar yeh changes aapne kiye hain, to koi action lene ki zaroorat nahi hai.
⚠️ Agar yeh aapne nahi kiya, to turant apna password change karein!
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Security Alert_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 8. Password Changed / Reset Alert
   */
  async sendPasswordChangedAlert(user) {
    const timeFormatted = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    const message = 
`🔐 *Security Alert: Password Updated!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${user.name}*,

Aapke AnnSetu account ka password successfully change/reset ho gaya hai.
• *Account:* ${user.email}
• *Time:* ${timeFormatted} IST

⚠️ Agar yeh aapne nahi kiya hai, to turant support team se contact karein.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Account Protection_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 9. Password Reset OTP via WhatsApp
   */
  async sendPasswordResetOTP(user, otp) {
    const message = 
`🔑 *AnnSetu Password Reset Code*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${user.name}*,

Aapne password reset karne ka request kiya hai. Aapka OTP code yeh raha:

👉 *${otp}*

⏰ Yeh OTP agle 15 minutes ke liye valid hai. Kisi ke sath share na karein!
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Security Team_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 10. Account Verified Alert
   */
  async sendAccountVerifiedAlert(user) {
    const message = 
`✅ *Account Verified Successfully!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Badhaai ho *${user.name}*!

Aapka AnnSetu account successfully verify ho gaya hai.
Ab aap surplus food donate kar sakte hain aur hungry families ki help kar sakte hain! 🌿

🔗 Open Dashboard: ${ENV.FRONTEND_URL}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu — Zero Waste, Zero Hunger_`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 11. Food Donation Updated (Quantity, Address, Notes changes)
   */
  async sendDonationUpdatedAlert(donor, donation, changes = '') {
    const message = 
`🔄 *Donation Update Notice*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor.name}*,

Aapki food donation *"${donation.title}"* ki details update ho gayi hain:
• *New Details:* ${changes || 'Quantity / Location / Notes updated'}
• *Status:* ${donation.status}
• *Current Quantity:* ${donation.quantityKg} Kg

Nayi details system aur volunteers ko reflect ho chuki hain.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Live Updates_`;

    return this.sendMessage(donor.phone, message);
  }

  /**
   * 12. Food Donation Cancelled
   */
  async sendDonationCancelledAlert(donor, volunteer, donation, reason = 'Cancelled by donor') {
    const donorMsg = 
`🛑 *Food Donation Cancelled*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor?.name}*,

Aapki food donation *"${donation.title}"* cancel kar di gayi hai.
• *Reason:* ${reason}
• *Time:* ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

Agar aapko dobara food donate karna ho to nayi donation post karein.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Team_`;

    await this.sendMessage(donor?.phone, donorMsg);

    if (volunteer?.phone) {
      const volMsg = 
`⚠️ *Rescue Mission Cancelled*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${volunteer.name}*,

Donation *"${donation.title}"* donor dwara cancel kar di gayi hai.
Aapko is task ke liye pickup par jane ki zaroorat nahi hai.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Dispatch_`;
      await this.sendMessage(volunteer.phone, volMsg);
    }
  }

  /**
   * 13. NGO Claimed Donation Alert
   */
  async sendNGOClaimedAlert(donor, ngo, donation) {
    const donorMsg = 
`🏢 *NGO Partner Assigned!*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor?.name}*,

Great news! Partner NGO *"${ngo.organizationName || ngo.name}"* ne aapki food donation *"${donation.title}"* claim kar li hai!
Food unke shelter/community kitchen tak pohanchaya jayega.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Partner Network_`;

    return this.sendMessage(donor?.phone, donorMsg);
  }

  /**
   * 14. Admin User Status Update (Activated / Deactivated)
   */
  async sendAccountStatusAlert(user, isActive) {
    const message = isActive
      ? `🟢 *AnnSetu Account Activated!*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nHi *${user.name}*, aapka AnnSetu account successfully activate kar diya gaya hai. Ab aap platform access kar sakte hain.\n━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : `🔴 *AnnSetu Account Notice*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nHi *${user.name}*, aapka AnnSetu account administrator dwara temporarily deactivate kiya gaya hai. Assistance ke liye support se contact karein.\n━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return this.sendMessage(user.phone, message);
  }

  /**
   * 15. Food Donation Expired Alert (Cron)
   */
  async sendDonationExpiredAlert(donor, donation) {
    const message = 
`⏳ *Food Expiry Notice*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Hi *${donor?.name}*,

Aapki food donation *"${donation.title}"* ki safe consumption window khatam ho chuki hai.
AI Freshness standards ke anusaar ise EXPIRED mark kar diya gaya hai taaki hygiene bani rahe.
━━━━━━━━━━━━━━━━━━━━━━━━━━
_AnnSetu Quality Control_`;

    return this.sendMessage(donor?.phone, message);
  }

  /**
   * Helper to build a direct WhatsApp Web/App click-to-chat URL (wa.me)
   */
  generateWhatsAppShareLink(messageText, phone = null) {
    const encodedText = encodeURIComponent(messageText);
    if (phone) {
      const cleanPhone = this.formatPhoneNumber(phone)?.replace('+', '');
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    }
    return `https://wa.me/?text=${encodedText}`;
  }
}

export default new WhatsAppService();
