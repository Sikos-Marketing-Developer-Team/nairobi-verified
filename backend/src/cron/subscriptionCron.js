const cron = require('node-cron');
const subscriptionNotifications = require('../utils/subscriptionNotifications');
const VendorSubscription = require('../models/VendorSubscription');

// Schedule tasks to run at specific times
const setupCronJobs = () => {
  // Check for expiring subscriptions every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily subscription expiration check...');
    try {
      const result = await subscriptionNotifications.checkExpiringSubscriptions();
      console.log(`Checked ${result.checked} expiring subscriptions, sent ${result.sent} notifications`);
    } catch (error) {
      console.error('Error in subscription expiration cron job:', error);
    }
  });

  // Update expired subscriptions every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Updating expired subscriptions...');
    try {
      const now = new Date();
      
      // Find active subscriptions that have expired
      const expiredSubscriptions = await VendorSubscription.find({
        status: 'active',
        endDate: { $lt: now }
      });
      
      console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);
      
      // Update their status to expired
      for (const subscription of expiredSubscriptions) {
        subscription.status = 'expired';
        await subscription.save();
        
        console.log(`Marked subscription ${subscription._id} as expired`);
      }
    } catch (error) {
      console.error('Error in expired subscriptions cron job:', error);
    }
  });

  // Process auto-renewals every day at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('Processing auto-renewals...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);
      
      // Find active subscriptions with auto-renew enabled that expire in the next 3 days
      const subscriptionsToRenew = await VendorSubscription.find({
        status: 'active',
        autoRenew: true,
        endDate: { $gte: now, $lte: threeDaysFromNow }
      }).populate('vendor package');
      
      console.log(`Found ${subscriptionsToRenew.length} subscriptions to auto-renew`);
      
      // Process each subscription for auto-renewal
      // This would typically trigger payment processing based on stored payment methods
      // For now, we'll just log that we found them
      for (const subscription of subscriptionsToRenew) {
        console.log(`Subscription ${subscription._id} for vendor ${subscription.vendor.email} is due for auto-renewal`);
        
        // In a real implementation, this would:
        // 1. Create a new subscription record
        // 2. Process payment using the vendor's saved payment method
        // 3. Update the subscription status based on payment result
        // 4. Send confirmation email
      }
    } catch (error) {
      console.error('Error in auto-renewal cron job:', error);
    }
  });
};

module.exports = {
  setupCronJobs
};const cron = require('node-cron');
const subscriptionNotifications = require('../utils/subscriptionNotifications');
const VendorSubscription = require('../models/VendorSubscription');

// Schedule tasks to run at specific times
const setupCronJobs = () => {
  // Check for expiring subscriptions every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily subscription expiration check...');
    try {
      const result = await subscriptionNotifications.checkExpiringSubscriptions();
      console.log(`Checked ${result.checked} expiring subscriptions, sent ${result.sent} notifications`);
    } catch (error) {
      console.error('Error in subscription expiration cron job:', error);
    }
  });

  // Update expired subscriptions every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Updating expired subscriptions...');
    try {
      const now = new Date();
      
      // Find active subscriptions that have expired
      const expiredSubscriptions = await VendorSubscription.find({
        status: 'active',
        endDate: { $lt: now }
      });
      
      console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);
      
      // Update their status to expired
      for (const subscription of expiredSubscriptions) {
        subscription.status = 'expired';
        await subscription.save();
        
        console.log(`Marked subscription ${subscription._id} as expired`);
      }
    } catch (error) {
      console.error('Error in expired subscriptions cron job:', error);
    }
  });

  // Process auto-renewals every day at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('Processing auto-renewals...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);
      
      // Find active subscriptions with auto-renew enabled that expire in the next 3 days
      const subscriptionsToRenew = await VendorSubscription.find({
        status: 'active',
        autoRenew: true,
        endDate: { $gte: now, $lte: threeDaysFromNow }
      }).populate('vendor package');
      
      console.log(`Found ${subscriptionsToRenew.length} subscriptions to auto-renew`);
      
      // Process each subscription for auto-renewal
      // This would typically trigger payment processing based on stored payment methods
      // For now, we'll just log that we found them
      for (const subscription of subscriptionsToRenew) {
        console.log(`Subscription ${subscription._id} for vendor ${subscription.vendor.email} is due for auto-renewal`);
        
        // In a real implementation, this would:
        // 1. Create a new subscription record
        // 2. Process payment using the vendor's saved payment method
        // 3. Update the subscription status based on payment result
        // 4. Send confirmation email
      }
    } catch (error) {
      console.error('Error in auto-renewal cron job:', error);
    }
  });
};

module.exports = {
  setupCronJobs
};