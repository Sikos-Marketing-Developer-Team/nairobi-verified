// src/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error.message);
  } else {
    console.log('Transporter ready for emails');
  }
});

const sendVerificationEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    const verificationUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-email/${token}`;
    console.log('Preparing verification email:', { email, verificationUrl });

    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Please Verify Your Nairobi Verified Account',
      text: `Please verify your email by clicking this link: ${verificationUrl}\nThis link expires in 24 hours.\nIf you didn’t sign up, ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Welcome to Nairobi Verified!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="margin-top: 10px;">Or copy this link: ${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn’t create an account, you can safely ignore this email.</p>
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Nairobi Verified Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    console.log('Preparing password reset email:', { email, resetUrl });

    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Nairobi Verified Password',
      text: `You requested a password reset. Click this link to reset: ${resetUrl}\nThis link expires in 10 minutes.\nIf you didn’t request this, ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 10px;">Or copy this link: ${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn’t request a password reset, you can safely ignore this email.</p>
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Nairobi Verified Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, customerName, orderNumber, orderDetails, total) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    // Format order items for email
    const itemsList = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">KES ${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">KES ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
    
    const trackingUrl = `${process.env.FRONTEND_URL}/orders/track/${orderNumber}`;
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      text: `Thank you for your order, ${customerName}! Your order number is ${orderNumber}. Track your order at: ${trackingUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order, ${customerName}!</p>
          <p>Your order number is: <strong>${orderNumber}</strong></p>
          
          <h3>Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px;">KES ${orderDetails.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px;">KES ${orderDetails.shippingFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Tax:</strong></td>
                <td style="padding: 10px;">KES ${orderDetails.tax.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px;"><strong>KES ${total.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin: 20px 0;">
            <p>Track your order: <a href="${trackingUrl}" style="color: #EC5C0B;">Click here</a></p>
          </div>
          
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Thank you for shopping with Nairobi Verified!</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
    throw new Error(`Failed to send order confirmation email: ${error.message}`);
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (email, customerName, orderNumber, status, statusNote, trackingNumber, estimatedDelivery) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const trackingUrl = `${process.env.FRONTEND_URL}/orders/track/${orderNumber}`;
    
    // Format status for display
    const statusDisplay = status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Format estimated delivery date if provided
    let deliveryInfo = '';
    if (estimatedDelivery) {
      const deliveryDate = new Date(estimatedDelivery);
      deliveryInfo = `<p>Estimated delivery date: <strong>${deliveryDate.toDateString()}</strong></p>`;
    }
    
    // Format tracking info if provided
    let trackingInfo = '';
    if (trackingNumber) {
      trackingInfo = `<p>Tracking number: <strong>${trackingNumber}</strong></p>`;
    }
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order ${orderNumber} Status Update - ${statusDisplay}`,
      text: `Your order ${orderNumber} has been updated to: ${statusDisplay}. ${statusNote || ''} ${trackingNumber ? `Tracking number: ${trackingNumber}` : ''} Track your order at: ${trackingUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Order Status Update</h2>
          <p>Hello ${customerName},</p>
          <p>Your order <strong>${orderNumber}</strong> has been updated to: <strong>${statusDisplay}</strong></p>
          
          ${statusNote ? `<p>${statusNote}</p>` : ''}
          ${trackingInfo}
          ${deliveryInfo}
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${trackingUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">Track Your Order</a>
          </div>
          
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Thank you for shopping with Nairobi Verified!</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending order status update email:', error.message);
    throw new Error(`Failed to send order status update email: ${error.message}`);
  }
};

// Send subscription renewal reminder
const sendSubscriptionRenewalEmail = async (email, merchantName, subscriptionName, expiryDate, renewalLink) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const { subscriptionRenewalTemplate } = require('./emailTemplates');
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Subscription is Expiring Soon - ${subscriptionName}`,
      text: `Hello ${merchantName}, your ${subscriptionName} subscription is expiring on ${new Date(expiryDate).toDateString()}. Renew now to avoid interruption: ${renewalLink}`,
      html: subscriptionRenewalTemplate(merchantName, subscriptionName, expiryDate, renewalLink)
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Subscription renewal email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending subscription renewal email:', error.message);
    throw new Error(`Failed to send subscription renewal email: ${error.message}`);
  }
};

// Send merchant verification status email
const sendMerchantVerificationEmail = async (email, merchantName, status, reason) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const isApproved = status === 'approved';
    const dashboardLink = `${process.env.FRONTEND_URL}/merchant/dashboard`;
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Merchant Verification ${isApproved ? 'Approved' : 'Update'} - Nairobi Verified`,
      text: isApproved 
        ? `Congratulations ${merchantName}! Your merchant account has been verified. You can now start selling on Nairobi Verified.` 
        : `Hello ${merchantName}, your merchant verification status has been updated to: ${status}. ${reason || ''}`,
      html: isApproved 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Merchant Verification Approved!</h2>
            <p>Congratulations ${merchantName}!</p>
            <p>Your merchant account has been verified. You can now start selling products on Nairobi Verified.</p>
            
            <div style="margin: 20px 0; text-align: center;">
              <a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">Go to Merchant Dashboard</a>
            </div>
            
            <p>Next steps:</p>
            <ol>
              <li>Set up your merchant profile</li>
              <li>Add your products</li>
              <li>Start selling to customers across Nairobi</li>
            </ol>
            
            <hr style="border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Welcome to the Nairobi Verified merchant community!</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Merchant Verification Update</h2>
            <p>Hello ${merchantName},</p>
            <p>Your merchant verification status has been updated to: <strong>${status}</strong></p>
            
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            
            ${status === 'rejected' 
              ? `<p>You can update your information and reapply for verification from your dashboard.</p>
                 <div style="margin: 20px 0; text-align: center;">
                   <a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                 </div>`
              : ''
            }
            
            ${status === 'pending' 
              ? `<p>Your application is being reviewed. We'll notify you once the verification process is complete.</p>`
              : ''
            }
            
            <hr style="border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">Thank you for your interest in becoming a Nairobi Verified merchant!</p>
          </div>
        `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Merchant verification email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending merchant verification email:', error.message);
    throw new Error(`Failed to send merchant verification email: ${error.message}`);
  }
};

// Send return request email to merchant
const sendReturnRequestEmail = async (email, merchantName, orderNumber, reason) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const orderDetailsLink = `${process.env.FRONTEND_URL}/merchant/orders/${orderNumber}`;
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Return Request for Order ${orderNumber}`,
      text: `Hello ${merchantName}, a customer has requested a return for order ${orderNumber}. Reason: ${reason || 'No reason provided'}. Please review the order details.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Return Request Received</h2>
          <p>Hello ${merchantName},</p>
          <p>A customer has requested a return for order <strong>${orderNumber}</strong>.</p>
          
          <p><strong>Reason for return:</strong> ${reason || 'No reason provided'}</p>
          
          <div style="margin: 20px 0; text-align: center;">
            <a href="${orderDetailsLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px;">View Order Details</a>
          </div>
          
          <p>Please review the order and contact the customer to arrange the return process.</p>
          
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Thank you for being a valued merchant on Nairobi Verified!</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Return request email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending return request email:', error.message);
    throw new Error(`Failed to send return request email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendSubscriptionRenewalEmail,
  sendMerchantVerificationEmail,
  sendReturnRequestEmail
};