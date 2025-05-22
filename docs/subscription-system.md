# Subscription System Documentation

## Overview

The subscription system allows merchants to subscribe to different packages that provide various benefits on the Nairobi Verified platform. The system includes features for subscription management, payment processing, renewal notifications, and automatic status updates.

## Components

### 1. Subscription Packages

Subscription packages define the different tiers of service available to merchants. Each package includes:

- Name
- Description
- Price
- Duration (e.g., 1 month, 3 months, 1 year)
- Features included
- Status (active/inactive)

Packages can only be created, updated, or deleted by administrators.

### 2. Vendor Subscriptions

Vendor subscriptions represent a merchant's subscription to a specific package. Each subscription includes:

- Vendor (merchant) reference
- Package reference
- Start date
- End date
- Status (active, expired, cancelled, pending)
- Payment status (paid, unpaid, refunded, failed)
- Payment method (M-Pesa, card, bank, admin)
- Payment details
- Auto-renewal setting
- Renewal notification settings
- Previous subscription reference (for tracking renewal history)

### 3. Payment Processing

The system supports multiple payment methods:

- **M-Pesa**: Integration with Safaricom's M-Pesa payment system
- **Card Payments**: Integration with a card payment processor
- **Admin-approved**: Manual approval by administrators (for special cases)

### 4. Notification System

The system includes automated notifications for:

- Subscription expiration reminders (7 days, 3 days, and 1 day before expiration)
- Successful subscription payments
- Failed subscription payments
- Subscription activation
- Subscription expiration

### 5. Cron Jobs

Automated background tasks handle:

- Checking for expiring subscriptions and sending notifications
- Updating expired subscription statuses
- Processing auto-renewals for eligible subscriptions

## Workflow

### Subscription Process

1. Merchant browses available subscription packages
2. Merchant selects a package and initiates subscription
3. System creates a pending subscription record
4. Merchant completes payment through their chosen payment method
5. Upon successful payment, the subscription is activated
6. Merchant receives confirmation email

### Renewal Process

1. System sends notification emails as subscription approaches expiration
2. Merchant can manually renew by selecting the renewal option
3. If auto-renewal is enabled, the system attempts to process renewal automatically
4. Upon successful payment, a new subscription period begins
5. Merchant receives confirmation email

### Expiration Process

1. System checks for expired subscriptions regularly
2. When a subscription expires, its status is updated to "expired"
3. Merchant receives notification of expiration
4. Merchant can reactivate by purchasing a new subscription

## API Endpoints

### Subscription Package Endpoints

- `GET /api/subscriptions/packages` - Get all subscription packages
- `GET /api/subscriptions/packages/:id` - Get subscription package by ID
- `POST /api/subscriptions/packages` - Create a subscription package (admin)
- `PUT /api/subscriptions/packages/:id` - Update a subscription package (admin)
- `DELETE /api/subscriptions/packages/:id` - Delete a subscription package (admin)

### Vendor Subscription Endpoints

- `POST /api/subscriptions/subscribe` - Subscribe to a package
- `GET /api/subscriptions/current` - Get current subscription
- `GET /api/subscriptions/history` - Get subscription history
- `PUT /api/subscriptions/cancel/:subscriptionId` - Cancel subscription
- `POST /api/subscriptions/renew/:subscriptionId` - Renew subscription

### Admin Endpoints

- `GET /api/subscriptions/all` - Get all subscriptions (admin)
- `PUT /api/subscriptions/:subscriptionId` - Update subscription status (admin)
- `POST /api/subscriptions/check-expiring` - Check expiring subscriptions (admin)

### Payment Callback Endpoints

- `POST /api/subscriptions/mpesa/callback` - M-Pesa payment callback

## Database Models

### SubscriptionPackage Model

```javascript
const subscriptionPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Package description is required']
  },
  price: {
    type: Number,
    required: [true, 'Package price is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  duration: {
    type: Number,
    required: [true, 'Package duration is required'],
    min: 1
  },
  durationUnit: {
    type: String,
    enum: ['day', 'week', 'month', 'year'],
    default: 'month'
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

### VendorSubscription Model

```javascript
const vendorSubscriptionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPackage',
    required: [true, 'Subscription package is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'refunded', 'failed'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank', 'admin'],
    required: [true, 'Payment method is required']
  },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    paymentDate: Date,
    receiptNumber: String
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  renewalReminder: {
    type: Boolean,
    default: true
  },
  renewalReminderSent: {
    type: Boolean,
    default: false
  },
  lastRenewalNotification: {
    type: Date
  },
  previousSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorSubscription'
  }
}, { timestamps: true });
```

## Implementation Notes

### Security Considerations

- All subscription management endpoints require authentication
- Admin-only endpoints require admin role verification
- Payment callbacks include verification to prevent fraud

### Performance Considerations

- Indexes are created on frequently queried fields
- Cron jobs are scheduled during off-peak hours
- Pagination is implemented for listing endpoints

### Maintenance

- Regular monitoring of payment processing success rates
- Periodic review of subscription package offerings
- Monitoring of auto-renewal success rates