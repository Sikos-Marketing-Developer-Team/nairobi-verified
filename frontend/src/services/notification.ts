/**
 * Notification Service
 * 
 * This service handles sending notifications to users, including email notifications.
 * In a production environment, this would connect to an email service provider like
 * SendGrid, Mailgun, or AWS SES. For this demo, we'll simulate email sending.
 */

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email notification
 * In a real application, this would connect to an email service
 */
export const sendEmail = async (options: EmailOptions): Promise<NotificationResult> => {
  console.log('Sending email:', options);
  
  // In a real application, this would be an API call to your backend
  // which would then use an email service provider
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, we'll just log the email and return success
  // In a real app, you would handle errors from the email service
  
  // Simulate success (or occasional failure for testing)
  const shouldSucceed = Math.random() > 0.1; // 90% success rate
  
  if (shouldSucceed) {
    return {
      success: true,
      messageId: `mock-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  } else {
    return {
      success: false,
      error: 'Failed to send email. Email service unavailable.'
    };
  }
};

/**
 * Generate a welcome email for new merchants
 */
export const generateMerchantWelcomeEmail = (
  merchantName: string,
  merchantEmail: string,
  tempPassword: string,
  loginUrl: string
): EmailOptions => {
  const subject = 'Welcome to Nairobi Verified - Your Merchant Account';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Nairobi Verified</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5; border-top: none;">
        <h2>Welcome, ${merchantName}!</h2>
        <p>Your merchant account has been created on Nairobi Verified. We're excited to have you join our platform!</p>
        
        <p>Here are your account details:</p>
        <ul>
          <li><strong>Email:</strong> ${merchantEmail}</li>
          <li><strong>Temporary Password:</strong> ${tempPassword}</li>
        </ul>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Login to Your Account
          </a>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Login using your temporary password</li>
          <li>Change your password</li>
          <li>Complete your business profile</li>
          <li>Add your products or services</li>
          <li>Set up payment methods</li>
        </ol>
        
        <p>If you need any assistance, please contact our support team at <a href="mailto:support@nairobiverifed.com">support@nairobiverifed.com</a>.</p>
        
        <p>Best regards,<br>The Nairobi Verified Team</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Nairobi Verified. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return {
    to: merchantEmail,
    subject,
    body: htmlBody,
    isHtml: true,
    from: 'Nairobi Verified <noreply@nairobiverifed.com>',
    replyTo: 'support@nairobiverifed.com'
  };
};

/**
 * Generate a verification approval email
 */
export const generateVerificationApprovalEmail = (
  merchantName: string,
  merchantEmail: string,
  businessName: string,
  dashboardUrl: string
): EmailOptions => {
  const subject = 'Nairobi Verified - Your Business Has Been Verified';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Nairobi Verified</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5; border-top: none;">
        <h2>Congratulations, ${merchantName}!</h2>
        <p>We're pleased to inform you that your business <strong>${businessName}</strong> has been verified on our platform.</p>
        
        <p>Your business is now fully verified and will appear in search results with a verified badge, giving customers confidence in your services.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${dashboardUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Go to Your Dashboard
          </a>
        </div>
        
        <h3>Benefits of being verified:</h3>
        <ul>
          <li>Increased visibility in search results</li>
          <li>Verified badge on your business profile</li>
          <li>Higher trust from potential customers</li>
          <li>Access to premium features</li>
        </ul>
        
        <p>If you need any assistance, please contact our support team at <a href="mailto:support@nairobiverifed.com">support@nairobiverifed.com</a>.</p>
        
        <p>Best regards,<br>The Nairobi Verified Team</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Nairobi Verified. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return {
    to: merchantEmail,
    subject,
    body: htmlBody,
    isHtml: true,
    from: 'Nairobi Verified <noreply@nairobiverifed.com>',
    replyTo: 'support@nairobiverifed.com'
  };
};

/**
 * Generate a verification rejection email
 */
export const generateVerificationRejectionEmail = (
  merchantName: string,
  merchantEmail: string,
  businessName: string,
  rejectionReason: string,
  supportUrl: string
): EmailOptions => {
  const subject = 'Nairobi Verified - Verification Update Required';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f97316; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Nairobi Verified</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5; border-top: none;">
        <h2>Hello, ${merchantName}</h2>
        <p>We've reviewed your verification documents for <strong>${businessName}</strong> and we need some additional information before we can complete the verification process.</p>
        
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason for additional verification:</strong></p>
          <p style="margin: 10px 0 0;">${rejectionReason}</p>
        </div>
        
        <p>Please update your verification documents in your merchant dashboard.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${supportUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Contact Support
          </a>
        </div>
        
        <p>If you need any assistance, please contact our support team at <a href="mailto:support@nairobiverifed.com">support@nairobiverifed.com</a>.</p>
        
        <p>Best regards,<br>The Nairobi Verified Team</p>
      </div>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Nairobi Verified. All rights reserved.</p>
      </div>
    </div>
  `;
  
  return {
    to: merchantEmail,
    subject,
    body: htmlBody,
    isHtml: true,
    from: 'Nairobi Verified <noreply@nairobiverifed.com>',
    replyTo: 'support@nairobiverifed.com'
  };
};

/**
 * Generate a random password for new merchants
 */
export const generateTemporaryPassword = (length = 10): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};