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
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;
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

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};