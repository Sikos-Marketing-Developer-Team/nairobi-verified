const axios = require('axios');
const moment = require('moment');

// Generate M-Pesa access token
const getAccessToken = async () => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('M-Pesa credentials not configured');
    }
    
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa access token error:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Initiate M-Pesa STK Push
const initiateMpesaPayment = async ({ phoneNumber, amount, transactionId, description }) => {
  try {
    const accessToken = await getAccessToken();
    
    // Format phone number (remove leading 0 or +254)
    let formattedPhone = phoneNumber.toString().trim();
    if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(4);
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Ensure it starts with 254
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }
    
    // Current timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // Business shortcode and passkey from env
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    // Generate password
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    // Callback URLs
    const callbackUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/mpesa/callback`;
    
    // Request body
    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `NairobiVerified-${transactionId}`,
      TransactionDesc: description || 'Nairobi Verified Subscription'
    };
    
    // Make request to M-Pesa API
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('M-Pesa payment initiation error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

// Verify M-Pesa payment from callback
const verifyMpesaPayment = async (callbackData) => {
  try {
    const { stkCallback } = callbackData;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    
    // Check if payment was successful
    if (ResultCode === 0) {
      // Extract payment details
      const metadataItems = CallbackMetadata.Item;
      
      const mpesaReceiptNumber = metadataItems.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadataItems.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadataItems.find(item => item.Name === 'PhoneNumber')?.Value;
      const amount = metadataItems.find(item => item.Name === 'Amount')?.Value;
      
      return {
        success: true,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
        amount,
        checkoutRequestID: stkCallback.CheckoutRequestID
      };
    } else {
      return {
        success: false,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        checkoutRequestID: stkCallback.CheckoutRequestID
      };
    }
  } catch (error) {
    console.error('M-Pesa verification error:', error);
    throw new Error('Failed to verify M-Pesa payment');
  }
};

// Query M-Pesa transaction status
const queryMpesaTransaction = async (checkoutRequestId) => {
  try {
    const accessToken = await getAccessToken();
    
    // Business shortcode and passkey from env
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    // Current timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // Generate password
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    
    // Request body
    const requestBody = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };
    
    // Make request to M-Pesa API
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const { ResultCode, ResultDesc } = response.data;
    
    if (ResultCode === 0) {
      return {
        success: true,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      };
    } else {
      return {
        success: false,
        resultCode: ResultCode,
        resultDesc: ResultDesc
      };
    }
  } catch (error) {
    console.error('M-Pesa query transaction error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message || 'Failed to query M-Pesa transaction'
    };
  }
};

module.exports = {
  getAccessToken,
  initiateMpesaPayment,
  verifyMpesaPayment,
  queryMpesaTransaction
};