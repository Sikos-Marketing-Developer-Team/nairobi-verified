const cron = require('node-cron');
const VendorSubscription = require('../models/VendorSubscription');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const PaymentTransaction = require('../models/PaymentTransaction');
const { 
  sendSubscriptionRenewalEmail, 
  sendSubscriptionExpirationEmail 
} = require('../utils/emailService');
const { initiateMpesaPayment } = require('../utils/mpesaService');
const { processCardPayment } = require('../utils/cardPaymentService');

// Calculate end date based on package duration
const calculateEndDate = (startDate, duration, durationUnit) => {
  const end = new Date(startDate);
  
  switch (durationUnit) {
    case 'day':
      end.setDate(end.getDate() + duration);
      break;
    case 'week':
      end.setDate(end.getDate() + (duration * 7));
      break;
    case 'month':
      end.setMonth(end.getMonth() + duration);
      break;
    case 'year':
      end.setFullYear(end.getFullYear() + duration);
      break;
    default:
      end.setMonth(end.getMonth() + duration);
  }
  
  return end;
};

// Check for expiring subscriptions and send notifications
const checkExpiringSubscriptions = async () => {
  try {
    console.log('Running cron job: Check expiring subscriptions');
    
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
        await sendSubscriptionRenewalEmail(
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
        console.log(`Sent renewal notification to ${subscription.vendor.email} (${daysRemaining} days remaining)`);
      } catch (emailError) {
        console.error(`Failed to send renewal notification to ${subscription.vendor.email}:`, emailError);
      }
    }
    
    console.log(`Sent ${notificationsSent} renewal notifications`);
  } catch (error) {
    console.error('Cron job error - Check expiring subscriptions:', error);
  }
};

// Update expired subscriptions
const updateExpiredSubscriptions = async () => {
  try {
    console.log('Running cron job: Update expired subscriptions');
    
    const now = new Date();
    
    // Find active subscriptions that have expired
    const expiredSubscriptions = await VendorSubscription.find({
      status: 'active',
      endDate: { $lt: now }
    }).populate('vendor package');
    
    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);
    
    let updated = 0;
    let notificationsSent = 0;
    
    // Update status and send notifications
    for (const subscription of expiredSubscriptions) {
      // Update status to expired
      subscription.status = 'expired';
      await subscription.save();
      updated++;
      
      // Send expiration notification
      if (subscription.vendor && subscription.vendor.email) {
        const renewalLink = `${process.env.FRONTEND_URL}/merchant/subscriptions`;
        
        try {
          await sendSubscriptionExpirationEmail(
            subscription.vendor.email,
            subscription.vendor.companyName || subscription.vendor.fullName,
            subscription.package.name,
            subscription.endDate,
            renewalLink
          );
          
          notificationsSent++;
          console.log(`Sent expiration notification to ${subscription.vendor.email}`);
        } catch (emailError) {
          console.error(`Failed to send expiration notification to ${subscription.vendor.email}:`, emailError);
        }
      }
    }
    
    console.log(`Updated ${updated} expired subscriptions and sent ${notificationsSent} notifications`);
  } catch (error) {
    console.error('Cron job error - Update expired subscriptions:', error);
  }
};

// Process auto-renewals
const processAutoRenewals = async () => {
  try {
    console.log('Running cron job: Process auto-renewals');
    
    const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1);
    
    // Find active subscriptions with auto-renewal enabled that expire within 24 hours
    const renewalCandidates = await VendorSubscription.find({
      status: 'active',
      autoRenew: true,
      endDate: { $gte: now, $lte: oneDayLater }
    }).populate('vendor package');
    
    console.log(`Found ${renewalCandidates.length} subscriptions for auto-renewal`);
    
    let renewalsProcessed = 0;
    
    // Process each renewal
    for (const subscription of renewalCandidates) {
      try {
        // Check if subscription package is still active
        const subscriptionPackage = await SubscriptionPackage.findById(subscription.package._id);
        if (!subscriptionPackage || !subscriptionPackage.isActive) {
          console.log(`Package ${subscription.package._id} is no longer active, skipping auto-renewal`);
          continue;
        }
        
        // Calculate new subscription dates
        const startDate = new Date(Math.max(Date.now(), subscription.endDate));
        const endDate = calculateEndDate(
          startDate,
          subscriptionPackage.duration,
          subscriptionPackage.durationUnit
        );
        
        // Create new subscription record
        const newSubscription = new VendorSubscription({
          vendor: subscription.vendor._id,
          package: subscriptionPackage._id,
          startDate,
          endDate,
          status: 'pending',
          paymentStatus: 'unpaid',
          paymentMethod: subscription.paymentMethod,
          autoRenew: subscription.autoRenew,
          previousSubscription: subscription._id
        });
        
        await newSubscription.save();
        
        // Create payment transaction
        const paymentTransaction = new PaymentTransaction({
          user: subscription.vendor._id,
          type: 'subscription_renewal',
          amount: subscriptionPackage.price,
          currency: 'KES',
          status: 'pending',
          paymentMethod: subscription.paymentMethod,
          relatedSubscription: newSubscription._id
        });
        
        await paymentTransaction.save();
        
        // Process payment based on method
        if (subscription.paymentMethod === 'mpesa' && subscription.vendor.phoneNumber) {
          // For M-Pesa, we would need stored payment details
          // This is a simplified example
          try {
            const mpesaResponse = await initiateMpesaPayment({
              phoneNumber: subscription.vendor.phoneNumber,
              amount: subscriptionPackage.price,
              transactionId: paymentTransaction._id.toString(),
              description: `Auto-renewal of ${subscriptionPackage.name} subscription`
            });
            
            // Update transaction with M-Pesa details
            paymentTransaction.mpesaDetails = {
              phoneNumber: subscription.vendor.phoneNumber,
              merchantRequestID: mpesaResponse.MerchantRequestID,
              checkoutRequestID: mpesaResponse.CheckoutRequestID
            };
            
            await paymentTransaction.save();
            
            console.log(`Initiated M-Pesa payment for auto-renewal: ${subscription.vendor.email}`);
          } catch (mpesaError) {
            console.error(`Failed to initiate M-Pesa payment for auto-renewal: ${subscription.vendor.email}`, mpesaError);
          }
        } else if (subscription.paymentMethod === 'card' && subscription.paymentDetails) {
          // For card payments, we would use stored card details
          // This is a simplified example
          try {
            // In a real implementation, we would use a stored payment method
            const cardResponse = await processCardPayment({
              cardToken: 'stored_card_token', // This would be retrieved from a secure storage
              amount: subscriptionPackage.price,
              currency: 'KES',
              description: `Auto-renewal of ${subscriptionPackage.name} subscription`,
              customerId: subscription.vendor._id.toString()
            });
            
            if (cardResponse.success) {
              newSubscription.status = 'active';
              newSubscription.paymentStatus = 'paid';
              newSubscription.paymentDetails = {
                transactionId: cardResponse.transactionId,
                amount: subscriptionPackage.price,
                currency: 'KES',
                paymentDate: new Date()
              };
              
              paymentTransaction.status = 'completed';
              paymentTransaction.transactionId = cardResponse.transactionId;
              paymentTransaction.cardDetails = {
                last4: cardResponse.last4,
                brand: cardResponse.brand,
                expiryMonth: cardResponse.expiryMonth,
                expiryYear: cardResponse.expiryYear
              };
              
              await newSubscription.save();
              await paymentTransaction.save();
              
              console.log(`Processed card payment for auto-renewal: ${subscription.vendor.email}`);
            } else {
              console.error(`Card payment failed for auto-renewal: ${subscription.vendor.email}`, cardResponse.error);
            }
          } catch (cardError) {
            console.error(`Failed to process card payment for auto-renewal: ${subscription.vendor.email}`, cardError);
          }
        }
        
        renewalsProcessed++;
      } catch (renewalError) {
        console.error(`Error processing auto-renewal for subscription ${subscription._id}:`, renewalError);
      }
    }
    
    console.log(`Processed ${renewalsProcessed} auto-renewals`);
  } catch (error) {
    console.error('Cron job error - Process auto-renewals:', error);
  }
};

// Schedule cron jobs
const scheduleSubscriptionJobs = () => {
  // Check for expiring subscriptions daily at 8:00 AM
  cron.schedule('0 8 * * *', checkExpiringSubscriptions);
  
  // Update expired subscriptions daily at 1:00 AM
  cron.schedule('0 1 * * *', updateExpiredSubscriptions);
  
  // Process auto-renewals daily at 2:00 AM
  cron.schedule('0 2 * * *', processAutoRenewals);
  
  console.log('Subscription cron jobs scheduled');
};

module.exports = {
  scheduleSubscriptionJobs,
  checkExpiringSubscriptions,
  updateExpiredSubscriptions,
  processAutoRenewals
};