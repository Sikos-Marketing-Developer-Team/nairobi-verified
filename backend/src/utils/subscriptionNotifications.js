const VendorSubscription = require('../models/VendorSubscription');
const emailService = require('./emailService');

/**
 * Check for expiring subscriptions and send notifications
 * This function can be called by a cron job or manually by an admin
 */
const checkExpiringSubscriptions = async () => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);
    
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(now.getDate() + 3);
    
    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1);
    
    // Find active subscriptions expiring in the next 7 days
    const expiringSubscriptions = await VendorSubscription.find({
      status: 'active',
      endDate: { $gte: now, $lte: sevenDaysLater },
      // Only get subscriptions that haven't been notified recently
      $or: [
        { lastRenewalNotification: { $exists: false } },
        { lastRenewalNotification: { $lt: oneDayLater } }
      ]
    }).populate('vendor package');
    
    console.log(`Found ${expiringSubscriptions.length} expiring subscriptions`);
    
    let notificationsSent = 0;
    
    // Send notifications
    for (const subscription of expiringSubscriptions) {
      if (!subscription.vendor || !subscription.vendor.email) {
        continue;
      }
      
      const daysRemaining = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
      const renewalLink = `${process.env.FRONTEND_URL}/merchant/subscriptions/renew/${subscription._id}`;
      
      try {
        await emailService.sendSubscriptionRenewalEmail(
          subscription.vendor.email,
          subscription.vendor.companyName || subscription.vendor.fullName,
          subscription.package.name,
          subscription.endDate,
          renewalLink
        );
        
        // Update last notification date
        subscription.lastRenewalNotification = now;
        await subscription.save();
        
        notificationsSent++;
      } catch (emailError) {
        console.error(`Failed to send renewal notification to ${subscription.vendor.email}:`, emailError);
      }
    }
    
    return {
      checked: expiringSubscriptions.length,
      sent: notificationsSent
    };
  } catch (error) {
    console.error('Check expiring subscriptions error:', error);
    throw error;
  }
};

module.exports = {
  checkExpiringSubscriptions
};