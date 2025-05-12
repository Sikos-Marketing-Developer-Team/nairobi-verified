const VendorSubscription = require('../models/VendorSubscription');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const { initiateMpesaPayment, verifyMpesaPayment } = require('../utils/mpesaService');
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

// Subscribe to a package
const subscribeToPackage = async (req, res) => {
  try {
    const { packageId, paymentMethod, autoRenew } = req.body;
    const vendorId = req.user._id;
    
    // Verify user is a merchant
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Only merchants can subscribe to packages'
      });
    }
    
    // Get the subscription package
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);
    if (!subscriptionPackage || !subscriptionPackage.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Subscription package not found or inactive'
      });
    }
    
    // Check if vendor already has an active subscription
    const activeSubscription = await VendorSubscription.findOne({
      vendor: vendorId,
      status: 'active'
    });
    
    if (activeSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription',
        subscription: activeSubscription
      });
    }
    
    // Calculate subscription end date
    const startDate = new Date();
    const endDate = calculateEndDate(
      startDate,
      subscriptionPackage.duration,
      subscriptionPackage.durationUnit
    );
    
    // Create subscription record (initially pending)
    const subscription = new VendorSubscription({
      vendor: vendorId,
      package: packageId,
      startDate,
      endDate,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      autoRenew: autoRenew || false
    });
    
    await subscription.save();
    
    // Create payment transaction
    const paymentTransaction = new PaymentTransaction({
      user: vendorId,
      type: 'subscription',
      amount: subscriptionPackage.price,
      currency: 'KES',
      status: 'pending',
      paymentMethod,
      relatedSubscription: subscription._id
    });
    
    await paymentTransaction.save();
    
    // Process payment based on method
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
          description: `Subscription to ${subscriptionPackage.name} package`
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
          description: `Subscription to ${subscriptionPackage.name} package`,
          customerId: vendorId.toString()
        });
        
        // If payment successful, update subscription and transaction
        if (paymentResponse.success) {
          subscription.status = 'active';
          subscription.paymentStatus = 'paid';
          subscription.paymentDetails = {
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
          
          await subscription.save();
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
        
        subscription.status = 'active';
        subscription.paymentStatus = 'paid';
        subscription.paymentDetails = {
          transactionId: `ADMIN-${Date.now()}`,
          amount: subscriptionPackage.price,
          currency: 'KES',
          paymentDate: new Date()
        };
        
        paymentTransaction.status = 'completed';
        paymentTransaction.transactionId = subscription.paymentDetails.transactionId;
        paymentTransaction.notes = 'Admin-approved subscription';
        
        await subscription.save();
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
      message: 'Subscription initiated successfully',
      subscription,
      paymentTransaction,
      paymentResponse
    });
  } catch (error) {
    console.error('Subscribe to package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to package',
      error: error.message
    });
  }
};

// Verify M-Pesa payment callback
const verifyMpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Process the callback data
    const result = await verifyMpesaPayment(Body);
    
    if (result.success) {
      // Find the transaction
      const transaction = await PaymentTransaction.findOne({
        'mpesaDetails.checkoutRequestID': result.checkoutRequestID
      });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      // Update transaction
      transaction.status = 'completed';
      transaction.transactionId = result.mpesaReceiptNumber;
      transaction.mpesaDetails = {
        ...transaction.mpesaDetails,
        responseCode: result.resultCode,
        responseDescription: result.resultDesc,
        mpesaReceiptNumber: result.mpesaReceiptNumber,
        transactionDate: new Date(result.transactionDate)
      };
      
      await transaction.save();
      
      // Update subscription
      if (transaction.relatedSubscription) {
        const subscription = await VendorSubscription.findById(transaction.relatedSubscription);
        
        if (subscription) {
          subscription.status = 'active';
          subscription.paymentStatus = 'paid';
          subscription.paymentDetails = {
            transactionId: result.mpesaReceiptNumber,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentDate: new Date(result.transactionDate),
            receiptNumber: result.mpesaReceiptNumber
          };
          
          await subscription.save();
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      // Payment failed
      const transaction = await PaymentTransaction.findOne({
        'mpesaDetails.checkoutRequestID': result.checkoutRequestID
      });
      
      if (transaction) {
        transaction.status = 'failed';
        transaction.mpesaDetails = {
          ...transaction.mpesaDetails,
          responseCode: result.resultCode,
          responseDescription: result.resultDesc
        };
        
        await transaction.save();
        
        // Update subscription
        if (transaction.relatedSubscription) {
          const subscription = await VendorSubscription.findById(transaction.relatedSubscription);
          
          if (subscription) {
            subscription.status = 'cancelled';
            subscription.paymentStatus = 'failed';
            
            await subscription.save();
          }
        }
      }
      
      res.status(200).json({
        success: false,
        message: 'Payment failed',
        error: result.resultDesc
      });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing M-Pesa callback',
      error: error.message
    });
  }
};

// Get vendor's current subscription
const getCurrentSubscription = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const subscription = await VendorSubscription.findOne({
      vendor: vendorId,
      status: 'active'
    }).populate('package');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current subscription',
      error: error.message
    });
  }
};

// Get vendor's subscription history
const getSubscriptionHistory = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const subscriptions = await VendorSubscription.find({
      vendor: vendorId
    }).populate('package').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription history',
      error: error.message
    });
  }
};

// Cancel subscription (prevent auto-renewal)
const cancelSubscription = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { subscriptionId } = req.params;
    
    const subscription = await VendorSubscription.findOne({
      _id: subscriptionId,
      vendor: vendorId,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }
    
    // Just disable auto-renewal, don't cancel the active subscription
    subscription.autoRenew = false;
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Auto-renewal disabled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Admin: Get all subscriptions with filtering
const getAllSubscriptions = async (req, res) => {
  try {
    const { 
      status, 
      vendor, 
      package: packageId,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (packageId) query.package = packageId;
    
    // Execute query with pagination
    const subscriptions = await VendorSubscription.find(query)
      .populate('vendor', 'fullName email companyName')
      .populate('package')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await VendorSubscription.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      subscriptions
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Admin: Update subscription status
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status, paymentStatus, notes } = req.body;
    
    const subscription = await VendorSubscription.findById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Update fields
    if (status) subscription.status = status;
    if (paymentStatus) subscription.paymentStatus = paymentStatus;
    
    await subscription.save();
    
    // If there's a related transaction, update it too
    if (notes) {
      const transaction = await PaymentTransaction.findOne({
        relatedSubscription: subscriptionId
      });
      
      if (transaction) {
        transaction.notes = notes;
        if (paymentStatus === 'paid') transaction.status = 'completed';
        if (paymentStatus === 'failed') transaction.status = 'failed';
        if (paymentStatus === 'refunded') transaction.status = 'refunded';
        
        await transaction.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

module.exports = {
  subscribeToPackage,
  verifyMpesaCallback,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus
};const VendorSubscription = require('../models/VendorSubscription');
const SubscriptionPackage = require('../models/SubscriptionPackage');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
const { initiateMpesaPayment, verifyMpesaPayment } = require('../utils/mpesaService');
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

// Subscribe to a package
const subscribeToPackage = async (req, res) => {
  try {
    const { packageId, paymentMethod, autoRenew } = req.body;
    const vendorId = req.user._id;
    
    // Verify user is a merchant
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'merchant') {
      return res.status(403).json({
        success: false,
        message: 'Only merchants can subscribe to packages'
      });
    }
    
    // Get the subscription package
    const subscriptionPackage = await SubscriptionPackage.findById(packageId);
    if (!subscriptionPackage || !subscriptionPackage.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Subscription package not found or inactive'
      });
    }
    
    // Check if vendor already has an active subscription
    const activeSubscription = await VendorSubscription.findOne({
      vendor: vendorId,
      status: 'active'
    });
    
    if (activeSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription',
        subscription: activeSubscription
      });
    }
    
    // Calculate subscription end date
    const startDate = new Date();
    const endDate = calculateEndDate(
      startDate,
      subscriptionPackage.duration,
      subscriptionPackage.durationUnit
    );
    
    // Create subscription record (initially pending)
    const subscription = new VendorSubscription({
      vendor: vendorId,
      package: packageId,
      startDate,
      endDate,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod,
      autoRenew: autoRenew || false
    });
    
    await subscription.save();
    
    // Create payment transaction
    const paymentTransaction = new PaymentTransaction({
      user: vendorId,
      type: 'subscription',
      amount: subscriptionPackage.price,
      currency: 'KES',
      status: 'pending',
      paymentMethod,
      relatedSubscription: subscription._id
    });
    
    await paymentTransaction.save();
    
    // Process payment based on method
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
          description: `Subscription to ${subscriptionPackage.name} package`
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
          description: `Subscription to ${subscriptionPackage.name} package`,
          customerId: vendorId.toString()
        });
        
        // If payment successful, update subscription and transaction
        if (paymentResponse.success) {
          subscription.status = 'active';
          subscription.paymentStatus = 'paid';
          subscription.paymentDetails = {
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
          
          await subscription.save();
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
        
        subscription.status = 'active';
        subscription.paymentStatus = 'paid';
        subscription.paymentDetails = {
          transactionId: `ADMIN-${Date.now()}`,
          amount: subscriptionPackage.price,
          currency: 'KES',
          paymentDate: new Date()
        };
        
        paymentTransaction.status = 'completed';
        paymentTransaction.transactionId = subscription.paymentDetails.transactionId;
        paymentTransaction.notes = 'Admin-approved subscription';
        
        await subscription.save();
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
      message: 'Subscription initiated successfully',
      subscription,
      paymentTransaction,
      paymentResponse
    });
  } catch (error) {
    console.error('Subscribe to package error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to package',
      error: error.message
    });
  }
};

// Verify M-Pesa payment callback
const verifyMpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Process the callback data
    const result = await verifyMpesaPayment(Body);
    
    if (result.success) {
      // Find the transaction
      const transaction = await PaymentTransaction.findOne({
        'mpesaDetails.checkoutRequestID': result.checkoutRequestID
      });
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
      
      // Update transaction
      transaction.status = 'completed';
      transaction.transactionId = result.mpesaReceiptNumber;
      transaction.mpesaDetails = {
        ...transaction.mpesaDetails,
        responseCode: result.resultCode,
        responseDescription: result.resultDesc,
        mpesaReceiptNumber: result.mpesaReceiptNumber,
        transactionDate: new Date(result.transactionDate)
      };
      
      await transaction.save();
      
      // Update subscription
      if (transaction.relatedSubscription) {
        const subscription = await VendorSubscription.findById(transaction.relatedSubscription);
        
        if (subscription) {
          subscription.status = 'active';
          subscription.paymentStatus = 'paid';
          subscription.paymentDetails = {
            transactionId: result.mpesaReceiptNumber,
            amount: transaction.amount,
            currency: transaction.currency,
            paymentDate: new Date(result.transactionDate),
            receiptNumber: result.mpesaReceiptNumber
          };
          
          await subscription.save();
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      // Payment failed
      const transaction = await PaymentTransaction.findOne({
        'mpesaDetails.checkoutRequestID': result.checkoutRequestID
      });
      
      if (transaction) {
        transaction.status = 'failed';
        transaction.mpesaDetails = {
          ...transaction.mpesaDetails,
          responseCode: result.resultCode,
          responseDescription: result.resultDesc
        };
        
        await transaction.save();
        
        // Update subscription
        if (transaction.relatedSubscription) {
          const subscription = await VendorSubscription.findById(transaction.relatedSubscription);
          
          if (subscription) {
            subscription.status = 'cancelled';
            subscription.paymentStatus = 'failed';
            
            await subscription.save();
          }
        }
      }
      
      res.status(200).json({
        success: false,
        message: 'Payment failed',
        error: result.resultDesc
      });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing M-Pesa callback',
      error: error.message
    });
  }
};

// Get vendor's current subscription
const getCurrentSubscription = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const subscription = await VendorSubscription.findOne({
      vendor: vendorId,
      status: 'active'
    }).populate('package');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current subscription',
      error: error.message
    });
  }
};

// Get vendor's subscription history
const getSubscriptionHistory = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    const subscriptions = await VendorSubscription.find({
      vendor: vendorId
    }).populate('package').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription history',
      error: error.message
    });
  }
};

// Cancel subscription (prevent auto-renewal)
const cancelSubscription = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { subscriptionId } = req.params;
    
    const subscription = await VendorSubscription.findOne({
      _id: subscriptionId,
      vendor: vendorId,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription not found'
      });
    }
    
    // Just disable auto-renewal, don't cancel the active subscription
    subscription.autoRenew = false;
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Auto-renewal disabled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Admin: Get all subscriptions with filtering
const getAllSubscriptions = async (req, res) => {
  try {
    const { 
      status, 
      vendor, 
      package: packageId,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;
    if (packageId) query.package = packageId;
    
    // Execute query with pagination
    const subscriptions = await VendorSubscription.find(query)
      .populate('vendor', 'fullName email companyName')
      .populate('package')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get total count
    const total = await VendorSubscription.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      subscriptions
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Admin: Update subscription status
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status, paymentStatus, notes } = req.body;
    
    const subscription = await VendorSubscription.findById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Update fields
    if (status) subscription.status = status;
    if (paymentStatus) subscription.paymentStatus = paymentStatus;
    
    await subscription.save();
    
    // If there's a related transaction, update it too
    if (notes) {
      const transaction = await PaymentTransaction.findOne({
        relatedSubscription: subscriptionId
      });
      
      if (transaction) {
        transaction.notes = notes;
        if (paymentStatus === 'paid') transaction.status = 'completed';
        if (paymentStatus === 'failed') transaction.status = 'failed';
        if (paymentStatus === 'refunded') transaction.status = 'refunded';
        
        await transaction.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
};

module.exports = {
  subscribeToPackage,
  verifyMpesaCallback,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus
};