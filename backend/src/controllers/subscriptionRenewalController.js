const VendorSubscription = require('../models/VendorSubscription');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const PaymentTransaction = require('../models/PaymentTransaction');
const { initiateMpesaPayment } = require('../utils/mpesaService');
const { processCardPayment } = require('../utils/cardPaymentService');

// Calculate end date based on package duration (copied from vendorSubscriptionController)
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

// Renew subscription
const renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { paymentMethod } = req.body;
    const vendorId = req.user._id;
    
    // Find the subscription
    const subscription = await VendorSubscription.findOne({
      _id: subscriptionId,
      vendor: vendorId
    }).populate('package');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if subscription package is still active
    const subscriptionPackage = await SubscriptionPackage.findById(subscription.package._id);
    if (!subscriptionPackage || !subscriptionPackage.isActive) {
      return res.status(400).json({
        success: false,
        message: 'The subscription package is no longer available'
      });
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
      vendor: vendorId,
      package: subscriptionPackage._id,
      startDate,
      endDate,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      autoRenew: subscription.autoRenew,
      previousSubscription: subscription._id
    });
    
    await newSubscription.save();
    
    // Create payment transaction
    const paymentTransaction = new PaymentTransaction({
      user: vendorId,
      type: 'subscription_renewal',
      amount: subscriptionPackage.price,
      currency: 'KES',
      status: 'pending',
      paymentMethod,
      relatedSubscription: newSubscription._id
    });
    
    await paymentTransaction.save();
    
    // Process payment based on method (similar to subscribeToPackage)
    let paymentResponse;
    
    switch (paymentMethod) {
      case 'mpesa':
        // Additional data needed for M-Pesa
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
          return res.status(400).json({
            success: false,
            message: 'Phone number is required for M-Pesa payments'
          });
        }
        
        paymentResponse = await initiateMpesaPayment({
          phoneNumber,
          amount: subscriptionPackage.price,
          transactionId: paymentTransaction._id.toString(),
          description: `Renewal of ${subscriptionPackage.name} subscription`
        });
        
        // Update transaction with M-Pesa details
        paymentTransaction.mpesaDetails = {
          phoneNumber,
          merchantRequestID: paymentResponse.MerchantRequestID,
          checkoutRequestID: paymentResponse.CheckoutRequestID
        };
        
        await paymentTransaction.save();
        break;
        
      case 'card':
        // Additional data needed for card payment
        const { cardToken } = req.body;
        if (!cardToken) {
          return res.status(400).json({
            success: false,
            message: 'Card token is required for card payments'
          });
        }
        
        paymentResponse = await processCardPayment({
          cardToken,
          amount: subscriptionPackage.price,
          currency: 'KES',
          description: `Renewal of ${subscriptionPackage.name} subscription`,
          customerId: vendorId.toString()
        });
        
        // If payment successful, update subscription and transaction
        if (paymentResponse.success) {
          newSubscription.status = 'active';
          newSubscription.paymentStatus = 'paid';
          newSubscription.paymentDetails = {
            transactionId: paymentResponse.transactionId,
            amount: subscriptionPackage.price,
            currency: 'KES',
            paymentDate: new Date()
          };
          
          paymentTransaction.status = 'completed';
          paymentTransaction.transactionId = paymentResponse.transactionId;
          paymentTransaction.cardDetails = {
            last4: paymentResponse.last4,
            brand: paymentResponse.brand,
            expiryMonth: paymentResponse.expiryMonth,
            expiryYear: paymentResponse.expiryYear
          };
          
          await newSubscription.save();
          await paymentTransaction.save();
        }
        break;
        
      case 'admin':
        // Admin-approved subscription (free or manually processed)
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can create admin-approved subscriptions'
          });
        }
        
        newSubscription.status = 'active';
        newSubscription.paymentStatus = 'paid';
        newSubscription.paymentDetails = {
          transactionId: `ADMIN-${Date.now()}`,
          amount: subscriptionPackage.price,
          currency: 'KES',
          paymentDate: new Date()
        };
        
        paymentTransaction.status = 'completed';
        paymentTransaction.transactionId = newSubscription.paymentDetails.transactionId;
        paymentTransaction.notes = 'Admin-approved subscription renewal';
        
        await newSubscription.save();
        await paymentTransaction.save();
        
        paymentResponse = { success: true };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }
    
    res.status(201).json({
      success: true,
      message: 'Subscription renewal initiated successfully',
      subscription: newSubscription,
      paymentTransaction,
      paymentResponse
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error renewing subscription',
      error: error.message
    });
  }
};

// Check for expiring subscriptions and send notifications
const checkExpiringSubscriptions = async (req, res) => {
  try {
    // Only allow admin to manually trigger this (normally would be a cron job)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can trigger subscription checks'
      });
    }
    
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
    
    const emailService = require('../utils/emailService');
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
    
    res.status(200).json({
      success: true,
      message: `Checked ${expiringSubscriptions.length} expiring subscriptions, sent ${notificationsSent} notifications`
    });
  } catch (error) {
    console.error('Check expiring subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking expiring subscriptions',
      error: error.message
    });
  }
};

module.exports = {
  renewSubscription,
  checkExpiringSubscriptions
};