const fs = require('fs');
const path = require('path');

// Path to the controller file
const controllerPath = path.join(__dirname, '..', 'controllers', 'vendorSubscriptionController.js');

// Read the current file
const currentContent = fs.readFileSync(controllerPath, 'utf8');

// Add the renewSubscription function before the module.exports
const renewSubscriptionFunction = `
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
          description: \`Renewal of \${subscriptionPackage.name} subscription\`
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
          description: \`Renewal of \${subscriptionPackage.name} subscription\`,
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
          transactionId: \`ADMIN-\${Date.now()}\`,
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
`;

// Update the module.exports
const updatedExports = `module.exports = {
  subscribeToPackage,
  verifyMpesaCallback,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
  renewSubscription
};`;

// Find the last function before module.exports
const lastFunctionEndIndex = currentContent.lastIndexOf('};', currentContent.lastIndexOf('module.exports'));

// Insert the new function after the last function
const updatedContent = 
  currentContent.substring(0, lastFunctionEndIndex + 2) + 
  renewSubscriptionFunction +
  currentContent.substring(lastFunctionEndIndex + 2, currentContent.lastIndexOf('module.exports')) +
  updatedExports;

// Write the updated content back to the file
fs.writeFileSync(controllerPath, updatedContent);

console.log('Successfully updated vendorSubscriptionController.js');