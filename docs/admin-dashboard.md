# Admin Dashboard Guide

## Overview

The admin dashboard provides a comprehensive interface for managing the Nairobi Verified platform. As an administrator, you have access to various features including user management, merchant verification, subscription management, and transaction monitoring.

## Accessing the Admin Dashboard

### Creating an Admin User

To access the admin dashboard, you first need to create an admin user. Follow these steps:

1. Make sure your MongoDB server is running
2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Run the admin user creation script:
   ```
   node src/scripts/createAdminUser.js
   ```

4. The script will create an admin user with the following credentials:
   - Email: njorojoe11173@gmail.com
   - Password: admin123

### Logging In

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to the login page
4. Enter the admin credentials
5. You will be redirected to the admin dashboard

## Admin Dashboard Features

### Dashboard Overview

The dashboard provides key statistics and metrics:

- User counts (total, merchants, clients)
- Product count
- Order count
- Pending verification count
- Active subscriptions count
- Revenue statistics
- Recent transactions

### User Management

The user management section allows you to:

- View all users
- Filter users by role (admin, merchant, client)
- Search users by name, email, or company name
- Update user roles
- Activate/deactivate users
- Verify/unverify merchants

### Merchant Verification

The merchant verification section allows you to:

- View pending merchant verification requests
- Review merchant details and documents
- Approve or reject verification requests
- Add notes for rejected verifications

### Subscription Management

The subscription management section allows you to:

- View all subscription packages
- Create new subscription packages
- Update existing packages
- View merchant subscriptions
- Filter subscriptions by status
- Check for expiring subscriptions
- Send renewal notifications

### Transaction Management

The transaction management section allows you to:

- View all payment transactions
- Filter transactions by status, type, user, or date range
- View transaction details

## API Endpoints for Admin

### Dashboard

- `GET /api/admin/dashboard` - Get dashboard statistics

### User Management

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId` - Update user

### Merchant Verification

- `GET /api/admin/verifications` - Get pending verifications
- `PUT /api/admin/verifications/:merchantId` - Process merchant verification

### Transaction Management

- `GET /api/admin/transactions` - Get all transactions

### Subscription Management

- `GET /api/subscriptions/all` - Get all subscriptions
- `PUT /api/subscriptions/:subscriptionId` - Update subscription status
- `POST /api/subscriptions/check-expiring` - Check expiring subscriptions
- `POST /api/subscriptions/packages` - Create a subscription package
- `PUT /api/subscriptions/packages/:id` - Update a subscription package
- `DELETE /api/subscriptions/packages/:id` - Delete a subscription package

## Best Practices

1. **Regular Verification Checks**: Check the merchant verification queue regularly to ensure timely processing of verification requests.

2. **Subscription Management**: Monitor expiring subscriptions and ensure renewal notifications are being sent.

3. **User Management**: Regularly review user accounts to ensure they are properly categorized and verified.

4. **Security**: Change the default admin password after first login and use a strong password.

5. **Backup**: Regularly backup the database to prevent data loss.

## Troubleshooting

### Common Issues

1. **Cannot access admin dashboard**:
   - Ensure you are logged in with an admin account
   - Check if the backend server is running
   - Verify that your JWT token is valid

2. **Cannot process merchant verification**:
   - Ensure the merchant ID is valid
   - Check if the merchant has uploaded all required documents

3. **Subscription notifications not sending**:
   - Check if the email service is properly configured
   - Verify that the cron jobs are running

### Support

For technical support, please contact the development team at support@nairobiverifed.com.