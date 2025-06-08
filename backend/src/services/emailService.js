// src/services/emailService.js
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error.message);
  } else {
    console.log('Email transporter ready for sending emails');
  }
});

/**
 * Send welcome email to newly imported business
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email
 * @param {string} params.name - Business name
 * @param {string} params.password - Temporary password
 * @returns {Promise} - Email sending result
 */
const sendWelcomeEmail = async ({ email, name, password }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const loginUrl = `${process.env.FRONTEND_URL}/auth/signin`;
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Nairobi Verified - Your Account Details',
      text: `
        Welcome to Nairobi Verified, ${name}!
        
        Your business has been added to our platform. Here are your login credentials:
        
        Email: ${email}
        Temporary Password: ${password}
        
        Please log in at: ${loginUrl}
        
        For security reasons, you will be required to change your password upon first login.
        
        If you have any questions, please contact our support team.
        
        Thank you for joining Nairobi Verified!
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome to Nairobi Verified!</h2>
          
          <p>Hello ${name},</p>
          
          <p>Your business has been added to our platform. Here are your login credentials:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <div style="margin: 25px 0; text-align: center;">
            <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
          </div>
          
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Important:</strong> For security reasons, you will be required to change your password upon first login.</p>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
          
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">Thank you for joining Nairobi Verified!</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
            <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
            <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

/**
 * Send password reset notification email
 * @param {Object} params - Email parameters
 * @param {string} params.email - Recipient email
 * @param {string} params.name - User name
 * @returns {Promise} - Email sending result
 */
const sendPasswordResetNotificationEmail = async ({ email, name }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials missing in environment variables');
    }
    
    const mailOptions = {
      from: `"Nairobi Verified" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Has Been Reset - Nairobi Verified',
      text: `
        Hello ${name},
        
        Your password for Nairobi Verified has been successfully reset.
        
        If you did not make this change, please contact our support team immediately.
        
        Thank you,
        Nairobi Verified Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Password Reset Confirmation</h2>
          
          <p>Hello ${name},</p>
          
          <p>Your password for Nairobi Verified has been successfully reset.</p>
          
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0;"><strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
          </div>
          
          <hr style="border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">Thank you for using Nairobi Verified!</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
            <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
            <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
          </div>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset notification email sent:', info.messageId, 'to:', email);
    return info;
  } catch (error) {
    console.error('Error sending password reset notification email:', error.message);
    throw new Error(`Failed to send password reset notification email: ${error.message}`);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetNotificationEmail
};