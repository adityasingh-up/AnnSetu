import cron from 'node-cron';
import FoodDonation from '../models/FoodDonation.js';
import whatsappService from '../services/whatsappService.js';
import { logger } from '../utils/winstonLogger.js';

export const startExpiryMonitorCron = () => {
  // Run every 10 minutes to auto-expire past donations
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      // Find expiring donations to notify donors
      const expiringDonations = await FoodDonation.find({
        status: { $in: ['PENDING', 'ACCEPTED'] },
        expiryTime: { $lt: now }
      }).populate('donorId', 'name phone');

      if (expiringDonations.length > 0) {
        for (const donation of expiringDonations) {
          donation.status = 'EXPIRED';
          await donation.save();

          if (donation.donorId?.phone) {
            whatsappService.sendDonationExpiredAlert(donation.donorId, donation).catch(err => {
              console.error('WhatsApp Cron Expiry Alert Error:', err.message);
            });
          }
        }
        logger.info(`Node-Cron: Auto-expired ${expiringDonations.length} food donations and sent WhatsApp notifications.`);
      }
    } catch (error) {
      logger.error(`Error executing Expiry Cron job: ${error.message}`);
    }
  });

  logger.info('Node-Cron Food Expiry Monitoring Job initialized.');
};
