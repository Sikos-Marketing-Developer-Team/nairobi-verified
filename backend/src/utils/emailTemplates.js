// Email templates for various notifications
const formatCurrency = (amount, currency = 'KES') => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Subscription renewal reminder template
const subscriptionRenewalTemplate = (merchantName, packageName, expiryDate, renewalLink) => {
  const formattedDate = formatDate(expiryDate);
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Subscription Renewal Reminder</h2>
      
      <p>Hello ${merchantName},</p>
      
      <p>Your <strong>${packageName}</strong> subscription is expiring on <strong>${formattedDate}</strong> (${daysRemaining} days remaining).</p>
      
      <p>To ensure uninterrupted service and maintain your store's visibility, please renew your subscription before it expires.</p>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${renewalLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Subscription</a>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Benefits of renewing:</h3>
        <ul style="padding-left: 20px; color: #555;">
          <li>Maintain your store's visibility to customers</li>
          <li>Continue selling products without interruption</li>
          <li>Keep access to merchant dashboard and analytics</li>
          <li>Retain your verified merchant status</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance with your renewal, please contact our support team at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
      
      <hr style="border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">Thank you for being a valued merchant on Nairobi Verified!</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
        <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
        <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </div>
    </div>
  `;
};

// Subscription confirmation template
const subscriptionConfirmationTemplate = (merchantName, packageName, startDate, endDate, amount, features) => {
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  const formattedAmount = formatCurrency(amount);
  
  // Format features as bullet points
  const featuresList = Array.isArray(features) 
    ? features.map(feature => `<li>${feature}</li>`).join('') 
    : '<li>Standard package features</li>';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Subscription Confirmation</h2>
      
      <p>Hello ${merchantName},</p>
      
      <p>Thank you for subscribing to our <strong>${packageName}</strong> package. Your subscription has been successfully activated.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Subscription Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 40%;"><strong>Package:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${packageName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Start Date:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formattedStartDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>End Date:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formattedEndDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${formattedAmount}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #333;">Package Features:</h3>
        <ul style="padding-left: 20px; color: #555;">
          ${featuresList}
        </ul>
      </div>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/merchant/dashboard" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions or need assistance with your subscription, please contact our support team at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
      
      <hr style="border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">Thank you for choosing Nairobi Verified!</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
        <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
        <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </div>
    </div>
  `;
};

// Merchant verification status update template
const merchantVerificationTemplate = (merchantName, status, reason, dashboardLink) => {
  const isApproved = status === 'approved';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Merchant Verification ${isApproved ? 'Approved' : 'Update'}</h2>
      
      <p>Hello ${merchantName},</p>
      
      ${isApproved ? `
        <p>Congratulations! Your merchant account has been <strong style="color: #28a745;">verified</strong>.</p>
        
        <p>You can now access all merchant features and start selling your products on Nairobi Verified.</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Merchant Dashboard</a>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Next Steps:</h3>
          <ol style="padding-left: 20px; color: #555;">
            <li>Complete your store profile</li>
            <li>Add your products</li>
            <li>Set up payment methods</li>
            <li>Choose a subscription package</li>
          </ol>
        </div>
      ` : `
        <p>Your merchant verification status has been updated to: <strong style="color: #dc3545;">Rejected</strong>.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Reason for Rejection:</h3>
          <p style="color: #555;">${reason || 'Your application did not meet our verification requirements.'}</p>
        </div>
        
        <p>You can update your information and reapply for verification from your merchant dashboard.</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Update Verification Information</a>
        </div>
      `}
      
      <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
      
      <hr style="border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">Thank you for choosing Nairobi Verified!</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
        <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
        <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </div>
    </div>
  `;
};

// Subscription expiration template
const subscriptionExpirationTemplate = (merchantName, packageName, expiryDate, renewalLink) => {
  const formattedDate = formatDate(expiryDate);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nairobi Verified Logo" style="max-width: 150px;">
      </div>
      
      <h2 style="color: #333; text-align: center;">Subscription Expired</h2>
      
      <p>Hello ${merchantName},</p>
      
      <p>Your <strong>${packageName}</strong> subscription has expired on <strong>${formattedDate}</strong>.</p>
      
      <p>To continue enjoying the benefits of being a verified merchant and maintain your store's visibility, please renew your subscription as soon as possible.</p>
      
      <div style="margin: 25px 0; text-align: center;">
        <a href="${renewalLink}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #EC5C0B; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">What happens when your subscription expires:</h3>
        <ul style="padding-left: 20px; color: #555;">
          <li>Reduced visibility in search results</li>
          <li>Limited access to merchant features</li>
          <li>Potential loss of verified status</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance with your renewal, please contact our support team at <a href="mailto:support@nairobiverifed.com" style="color: #EC5C0B;">support@nairobiverifed.com</a>.</p>
      
      <hr style="border-top: 1px solid #eee; margin: 20px 0;">
      
      <p style="font-size: 12px; color: #777; text-align: center;">Thank you for being a valued merchant on Nairobi Verified!</p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${process.env.FRONTEND_URL}" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Website</a> |
        <a href="${process.env.FRONTEND_URL}/help-center" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Help Center</a> |
        <a href="${process.env.FRONTEND_URL}/contact" style="color: #EC5C0B; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </div>
    </div>
  `;
};

module.exports = {
  subscriptionRenewalTemplate,
  subscriptionConfirmationTemplate,
  merchantVerificationTemplate,
  subscriptionExpirationTemplate
};