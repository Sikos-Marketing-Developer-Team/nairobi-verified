# 🏢 Merchant Onboarding System - Complete Guide

## Overview

This comprehensive merchant onboarding system handles two main scenarios for creating merchant accounts:

1. **Admin Dashboard Creation** - When an admin manually creates merchant accounts
2. **Programmatic Creation** - When merchants are added directly to the database via code/scripts

## 🎯 Key Features

### ✅ Professional Features Implemented:

- **Secure Credential Generation** - Automatically generates strong temporary passwords
- **Welcome Email System** - Beautiful HTML emails with login credentials and setup instructions
- **Account Setup Workflow** - Secure token-based account completion process
- **Admin Tracking** - Logs who created which merchant accounts
- **Bulk Creation Support** - Scripts for creating multiple merchants at once
- **Password Security** - Enforced strong password requirements with strength indicators
- **Email Templates** - Professional branded email templates for different scenarios
- **Setup Token Security** - Time-limited setup links (7-14 days expiration)
- **Comprehensive Logging** - Full audit trail of merchant creation activities

---

## 🚀 Scenario 1: Admin Dashboard Creation

### How It Works:

1. **Admin Access**: Admin logs into `/admin/merchants/add`
2. **Form Submission**: Admin fills out merchant details (business name, email, phone, etc.)
3. **Account Creation**: System creates merchant account with temporary password
4. **Email Notification**: Welcome email sent with credentials and setup link
5. **Merchant Setup**: Merchant receives email, clicks setup link, completes account
6. **Ready to Use**: Merchant can now log in and manage their business

### What Admin Sees:

```javascript
// Success Response
{
  merchant: {
    businessName: "Tech Innovations Ltd",
    email: "info@techinnovations.co.ke",
    verified: true
  },
  credentials: {
    email: "info@techinnovations.co.ke",
    tempPassword: "Kj9#mN2$pL8q",
    setupToken: "abc123..."
  },
  message: "Merchant account created successfully. Welcome email sent."
}
```

### What Merchant Receives:

📧 **Welcome Email Contains:**
- Business account confirmation
- Login credentials (email + temporary password)
- Account setup link (expires in 7 days)
- Step-by-step next steps
- Direct login button
- Support contact information

---

## 🔧 Scenario 2: Programmatic Creation

### Using the Creation Script:

```bash
# Navigate to backend directory
cd backend

# Create a single merchant
node scripts/createMerchant.js single

# Create multiple merchants from examples
node scripts/createMerchant.js multiple

# Create custom merchant
node scripts/createMerchant.js custom "Business Name" "email@example.com" "+254712345678" "Services"

# View help
node scripts/createMerchant.js help
```

### Using the Service Directly:

```javascript
const MerchantOnboardingService = require('./services/merchantOnboarding');

// Create merchant programmatically
const result = await MerchantOnboardingService.createMerchantProgrammatically({
  businessName: 'My Business',
  email: 'info@mybusiness.com',
  phone: '+254712345678',
  businessType: 'Services',
  description: 'Professional services',
  address: 'Nairobi CBD, Kenya'
}, {
  autoVerify: false,
  createdBy: 'import-script',
  reason: 'Bulk import'
});

console.log('Credentials:', result.credentials);
```

### What Gets Created:

```javascript
// Merchant Account
{
  businessName: "My Business",
  email: "info@mybusiness.com",
  phone: "+254712345678",
  password: "[HASHED_TEMP_PASSWORD]",
  businessType: "Services",
  // ... other fields
  
  // Tracking fields
  createdProgrammatically: true,
  createdBy: "import-script",
  onboardingStatus: "credentials_sent",
  accountSetupToken: "[HASHED_TOKEN]",
  accountSetupExpire: "[DATE + 14 DAYS]"
}

// Response includes
{
  credentials: {
    email: "info@mybusiness.com",
    tempPassword: "Kj9#mN2$pL8q",
    setupToken: "xyz789...",
    loginUrl: "https://yoursite.com/auth?merchant=true",
    setupUrl: "https://yoursite.com/merchant/account-setup/xyz789..."
  }
}
```

---

## 🔐 Merchant Credentials System

### What Merchants Get:

1. **Email Address** - Their business email (used as username)
2. **Temporary Password** - Auto-generated secure 12-character password
3. **Setup Token** - Secure token for one-time account setup
4. **Login URL** - Direct link to merchant login
5. **Setup URL** - Link to complete account setup

### Password Requirements:

- Minimum 8 characters
- At least 1 lowercase letter
- At least 1 uppercase letter  
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Security Features:

- Temporary passwords are bcrypt hashed
- Setup tokens are SHA256 hashed
- Setup links expire (7-14 days)
- Password strength validation
- Secure credential transmission

---

## 📧 Email System

### Email Templates:

1. **Admin-Created Welcome Email**
   - Professional greeting
   - Account details summary
   - Login credentials
   - Setup instructions
   - Admin creation acknowledgment

2. **Programmatic Welcome Email**
   - Automated creation notice
   - System-generated account info
   - Extended setup period (14 days)
   - Technical contact information

3. **Setup Complete Email**
   - Confirmation of account completion
   - Dashboard access link
   - Next steps guidance

### Email Configuration:

```javascript
// Development (uses Ethereal Email for testing)
EMAIL_USER=ethereal.user@ethereal.email
EMAIL_PASS=ethereal.pass

// Production (use real email service)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME="Nairobi CBD Directory"
```

---

## 🛠️ Account Setup Process

### Merchant Setup Journey:

1. **Receives Welcome Email** - With credentials and setup link
2. **Clicks Setup Link** - Validates token and loads setup page
3. **Views Account Info** - Confirms business details are correct
4. **Sets New Password** - Replaces temporary password with secure one
5. **Updates Business Info** - Adds description, website, business hours
6. **Completes Setup** - Account activated and ready to use
7. **Redirected to Login** - Can now access merchant dashboard

### Setup Page Features:

- ✅ Token validation and expiration check
- 🔒 Password strength indicator
- 📝 Business information completion
- ⏰ Business hours configuration
- 🎨 Real-time form validation
- 📱 Mobile-responsive design
- 🔄 Auto-redirect after completion

---

## 📊 Admin Dashboard Integration

### Admin Features:

```javascript
// Admin can see merchant creation history
{
  createdByAdmin: true,
  createdByAdminId: "admin_user_id",
  createdByAdminName: "John Admin",
  onboardingStatus: "completed",
  accountSetupDate: "2024-01-15T10:30:00Z"
}
```

### Admin Success Display:

- ✅ Account creation confirmation
- 📋 Merchant details summary
- 🔑 Generated credentials display
- 📧 Email status confirmation
- 🔗 Quick actions (create another, view all)

---

## 🔧 Database Schema Updates

### New Merchant Fields:

```javascript
// Account setup tracking
accountSetupToken: String,
accountSetupExpire: Date,
accountSetupDate: Date,
onboardingStatus: {
  type: String,
  enum: ['credentials_sent', 'completed'],
  default: 'credentials_sent'
},

// Admin creation tracking
createdByAdmin: Boolean,
createdByAdminId: String,
createdByAdminName: String,

// Programmatic creation tracking
createdProgrammatically: Boolean,
createdBy: String
```

---

## 🚀 API Endpoints

### New Routes:

```javascript
// Admin create merchant
POST /api/merchants/admin/create
- Requires: Admin authentication
- Body: Merchant details
- Returns: Merchant + credentials

// Get setup info
GET /api/merchants/setup/:token
- Public access
- Returns: Merchant basic info for setup

// Complete account setup
POST /api/merchants/setup/:token
- Public access
- Body: New password + additional info
- Returns: Setup completion status
```

---

## 📋 Implementation Checklist

### ✅ Completed Features:

- [x] MerchantOnboardingService class
- [x] Email service with templates
- [x] Admin dashboard integration
- [x] Account setup page
- [x] Programmatic creation script
- [x] Database schema updates
- [x] API endpoints
- [x] Security implementations
- [x] Error handling
- [x] Success notifications

### 🔄 Next Steps (Optional Enhancements):

- [ ] SMS notifications for credentials
- [ ] Multi-language email templates
- [ ] Merchant onboarding analytics
- [ ] Bulk import via CSV
- [ ] Integration with payment systems
- [ ] Advanced verification workflows

---

## 🧪 Testing the System

### Test Admin Creation:

1. Log in as admin
2. Go to `/admin/merchants/add`
3. Fill out merchant form
4. Submit and verify success message
5. Check email delivery (console logs in dev)
6. Test setup link functionality

### Test Programmatic Creation:

```bash
# Test single merchant creation
cd backend
node scripts/createMerchant.js single

# Check console output for credentials
# Test setup URL in browser
```

### Test Account Setup:

1. Use setup URL from merchant creation
2. Verify merchant info displays correctly
3. Test password validation
4. Complete setup process
5. Verify redirect to login
6. Test login with new credentials

---

## 🔍 Troubleshooting

### Common Issues:

1. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_PASS environment variables
   - Verify email service configuration
   - Check console logs for email preview URLs (dev mode)

2. **Setup Token Invalid**
   - Tokens expire after 7-14 days
   - Ensure token hasn't been used already
   - Check database for accountSetupToken field

3. **Admin Creation Fails**
   - Verify admin authentication
   - Check required form fields
   - Ensure unique email addresses

4. **Password Validation Errors**
   - Verify password meets strength requirements
   - Check password confirmation matching
   - Ensure special characters are accepted

---

## 🎉 Success Metrics

When properly implemented, you should see:

- ✅ Merchants receive professional welcome emails
- ✅ Secure temporary passwords are generated
- ✅ Setup process is smooth and user-friendly
- ✅ Admin can efficiently create merchant accounts
- ✅ Bulk creation works for data imports
- ✅ Full audit trail of account creations
- ✅ Mobile-responsive setup experience
- ✅ Strong security throughout the process

---

## 📞 Support

For issues or questions about the merchant onboarding system:

1. Check the console logs for detailed error messages
2. Verify environment variables are properly set
3. Test email delivery in development mode
4. Ensure database connections are working
5. Check API endpoint responses

The system is designed to be robust and provide clear error messages to help diagnose any issues quickly.

---

*This system provides a professional, secure, and user-friendly way to onboard merchants whether they're created by admins or added programmatically. The comprehensive email system and setup workflow ensures merchants have a smooth experience getting started with your platform.*