const VendorSubscription = require('../models/VendorSubscription');
const PaymentTransaction = require('../models/PaymentTransaction');
const { verifyMpesaPayment } = require('../utils/mpesaService');
const { verifyCardPayment } = require('../utils/cardPaymentService');
const { sendSubscriptionConfirmationEmail } = require('../utils/emailService');

// Check payment status for the most recent subscription
const checkPaymentStatus = async (req, res) => {
  try {
    const vendorId = req.user._id;
    
    // Find the most recent pending subscription
    const subscription = await VendorSubscription.findOne({
      vendor: vendorId,
      status: 'pending',
      paymentStatus: { $in: ['unpaid', 'pending'] }
    }).sort({ createdAt: -1 }).populate('package');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No pending subscription found'
      });
    }
    
    // Find the associated payment transaction
    const transaction = await PaymentTransaction.findOne({
      user: vendorId,
      relatedSubscription: subscription._id,
      status: { $in: ['pending', 'processing'] }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No pending transaction found for this subscription'
      });
    }
    
    // Check payment status based on payment method
    let paymentStatus = 'pending';
    let paymentDetails = null;
    
    if (subscription.paymentMethod === 'mpesa') {
      // For M-Pesa, we need to check the status using the checkout request ID
      if (transaction.mpesaDetails && transaction.mpesaDetails.checkoutRequestID) {
        // In a real implementation, we would query the M-Pesa API
        // For now, we'll simulate a response
        
        // Simulate a 50% chance of success for demo purposes
        const isSuccessful = Math.random() > 0.5;
        
        if (isSuccessful) {
          paymentStatus = 'paid';
          paymentDetails = {
            transactionId: `MPESA-${Date.now()}`,
            amount: subscription.package.price,
            currency: 'KES',
            paymentDate: new Date(),
            receiptNumber: `M${Math.floor(Math.random() * 1000000000)}`
          };
        } else {
          paymentStatus = 'pending';
        }
      }
    } else if (subscription.paymentMethod === 'card') {
      // For card payments, we would check with the payment processor
      // For now, we'll assume it's already processed since card payments
      // are typically processed immediately
      paymentStatus = 'paid';
      paymentDetails = transaction.cardDetails || {
        transactionId: transaction.transactionId,
        amount: subscription.package.price,
        currency: 'KES',
        paymentDate: new Date()
      };
    }
    
    // If payment is confirmed, update subscription and transaction
    if (paymentStatus === 'paid') {
      subscription.status = 'active';
      subscription.paymentStatus = 'paid';
      subscription.paymentDetails = paymentDetails;
      await subscription.save();
      
      transaction.status = 'completed';
      if (paymentDetails && paymentDetails.transactionId) {
        transaction.transactionId = paymentDetails.transactionId;
      }
      await transaction.save();
      
      // Send confirmation email
      try {
        await sendSubscriptionConfirmationEmail(
          req.user.email,
          req.user.companyName || req.user.fullName,
          subscription.package,
          subscription.startDate,
          subscription.endDate,
          subscription.package.price
        );
      } catch (emailError) {
        console.error('Error sending subscription confirmation email:', emailError);
      }
      
      return res.status(200).json({
        success: true,
        status: 'paid',
        message: 'Payment confirmed and subscription activated',
        subscription
      });
    }
    
    // If payment is still pending
    return res.status(200).json({
      success: true,
      status: 'pending',
      message: 'Payment is still being processed'
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status',
      error: error.message
    });
  }
};

// Webhook handler for M-Pesa callbacks
const handleMpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Verify the M-Pesa payment
    const paymentResult = await verifyMpesaPayment(callbackData);
    
    if (!paymentResult.success) {
      console.log('M-Pesa payment failed:', paymentResult);
      return res.status(200).json({ success: false });
    }
    
    // Extract the transaction ID from the account reference
    // Format: NairobiVerified-{transactionId}
    const accountReference = callbackData.stkCallback.CallbackMetadata?.Item?.find(
      item => item.Name === 'AccountReference'
    )?.Value;
    
    if (!accountReference) {
      console.error('Account reference not found in M-Pesa callback');
      return res.status(200).json({ success: false });
    }
    
    const transactionId = accountReference.split('-')[1];
    
    if (!transactionId) {
      console.error('Transaction ID not found in account reference:', accountReference);
      return res.status(200).json({ success: false });
    }
    
    // Find the payment transaction
    const transaction = await PaymentTransaction.findById(transactionId);
    
    if (!transaction) {
      console.error('Transaction not found for ID:', transactionId);
      return res.status(200).json({ success: false });
    }
    
    // Update transaction status
    transaction.status = 'completed';
    transaction.mpesaDetails = {
      ...transaction.mpesaDetails,
      receiptNumber: paymentResult.mpesaReceiptNumber,
      transactionDate: paymentResult.transactionDate,
      phoneNumber: paymentResult.phoneNumber,
      amount: paymentResult.amount
    };
    await transaction.save();
    
    // Find and update the subscription
    const subscription = await VendorSubscription.findById(transaction.relatedSubscription).populate('package vendor');
    
    if (!subscription) {
      console.error('Subscription not found for transaction:', transactionId);
      return res.status(200).json({ success: false });
    }
    
    // Update subscription status
    subscription.status = 'active';
    subscription.paymentStatus = 'paid';
    subscription.paymentDetails = {
      transactionId: paymentResult.mpesaReceiptNumber,
      amount: paymentResult.amount,
      currency: 'KES',
      paymentDate: new Date(),
      receiptNumber: paymentResult.mpesaReceiptNumber
    };
    await subscription.save();
    
    // Send confirmation email
    try {
      if (subscription.vendor && subscription.vendor.email) {
        await sendSubscriptionConfirmationEmail(
          subscription.vendor.email,
          subscription.vendor.companyName || subscription.vendor.fullName,
          subscription.package,
          subscription.startDate,
          subscription.endDate,
          subscription.package.price
        );
      }
    } catch (emailError) {
      console.error('Error sending subscription confirmation email:', emailError);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkPaymentStatus,
  handleMpesaCallback
};