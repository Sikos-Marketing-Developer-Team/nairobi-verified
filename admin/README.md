# Nairobi Verified - Admin Panel

A comprehensive admin dashboard for managing the Nairobi Verified marketplace platform.

## 🚀 Features

### Dashboard & Analytics
- **Real-time Statistics**: Monitor merchants, users, products, and reviews
- **Growth Metrics**: Track monthly growth and performance indicators
- **Document Verification Tracking**: Monitor merchant verification status
- **System Health**: Check API status and system performance

### Merchant Management
- **Merchant Verification**: Approve/reject merchant applications
- **Document Review**: Review business registration, ID, and utility bills
- **Status Management**: Activate/deactivate merchant accounts
- **Bulk Operations**: Perform actions on multiple merchants
- **Export Data**: Download merchant data as CSV

### User Management
- **User Overview**: View all registered users
- **Account Management**: Activate/deactivate user accounts
- **Role Management**: Manage user roles (user, merchant, admin)
- **Verification Status**: Track email verification status
- **Bulk Actions**: Perform bulk operations on users

### Product Management
- **Product Catalog**: View all products across merchants
- **Category Filtering**: Filter by product categories
- **Status Control**: Manage product active/inactive status
- **Stock Monitoring**: Track inventory levels
- **Merchant Products**: View products by specific merchants

### Flash Sales Management
- **Create Flash Sales**: Set up time-limited promotional sales
- **Product Selection**: Choose products for flash sales
- **Discount Management**: Set percentage or fixed discounts
- **Schedule Control**: Set start and end dates/times
- **Analytics**: Track flash sale performance

### Review Management
- **Review Moderation**: Monitor and moderate user reviews
- **Rating Analytics**: Track average ratings and trends
- **Merchant Reviews**: View reviews by merchant
- **Content Management**: Remove inappropriate content

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nairobi-verified/admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the admin directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Nairobi Verified Admin
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `Nairobi Verified Admin` |

### API Configuration

The admin panel communicates with the backend API using the following endpoints:

- **Authentication**: `/api/auth/admin/*`
- **Dashboard**: `/api/admin/dashboard/*`
- **Merchants**: `/api/admin/dashboard/merchants`
- **Users**: `/api/admin/dashboard/users`
- **Products**: `/api/admin/dashboard/products`
- **Flash Sales**: `/api/admin/dashboard/flash-sales`
- **Reviews**: `/api/admin/dashboard/reviews`

## 🔐 Authentication

### Admin Login
- Default admin credentials are created during backend setup
- JWT-based authentication with automatic token refresh
- Session management with secure logout

### Permissions
- Role-based access control
- Different permission levels for various admin functions
- Secure API endpoints with admin middleware

## 📊 Dashboard Features

### Statistics Cards
- Total merchants, users, products, reviews
- Verified vs pending merchants
- Active products and flash sales
- Growth percentages

### Recent Activity
- Latest merchant registrations
- Recent user signups
- New product uploads
- Recent reviews

### Verification Queue
- Merchants awaiting document review
- Document completion status
- Quick approval/rejection actions

## 🏪 Merchant Management

### Merchant List
- Searchable and filterable merchant directory
- Verification status indicators
- Business type categorization
- Registration date and activity

### Document Verification
- Business registration certificate review
- ID document verification
- Utility bill confirmation
- Additional document support

### Actions
- Verify/unverify merchants
- View merchant details
- Access merchant documents
- Send verification emails

## 👥 User Management

### User Directory
- Complete user listing with search
- Role-based filtering (user, merchant, admin)
- Account status management
- Registration analytics

### User Actions
- Activate/deactivate accounts
- Verify email addresses
- View user profiles
- Bulk operations

## 📦 Product Management

### Product Catalog
- All products across merchants
- Category and status filtering
- Stock level monitoring
- Price and rating information

### Product Actions
- View product details
- Manage active/inactive status
- Monitor inventory levels
- Track product performance

## ⚡ Flash Sales Management

### Sale Creation
- Product selection interface
- Discount configuration (% or fixed)
- Date and time scheduling
- Merchant-specific sales

### Analytics
- Sale performance metrics
- Revenue tracking
- Product popularity
- Conversion rates

## 🔍 Search & Filtering

### Global Search
- Search across merchants, users, products
- Real-time search results
- Advanced filtering options

### Filter Options
- Status-based filtering
- Date range selection
- Category filtering
- Custom query parameters

## 📈 Analytics & Reporting

### Performance Metrics
- User growth trends
- Merchant verification rates
- Product upload statistics
- Review sentiment analysis

### Export Features
- CSV data export
- Custom date ranges
- Filtered data export
- Scheduled reports

## 🛡️ Security Features

### Authentication Security
- JWT token management
- Automatic session refresh
- Secure logout
- CSRF protection

### Data Protection
- Input validation
- XSS prevention
- Secure API communication
- Role-based access control

## 🧪 Testing

### Test Script
Run the admin functionality test:
```bash
node test-admin-functionality.js
```

### Manual Testing
1. Login with admin credentials
2. Navigate through all sections
3. Test CRUD operations
4. Verify data consistency
5. Check responsive design

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Set production API URL
- Configure CORS settings
- Enable HTTPS
- Set up monitoring

### Deployment Options
- **Render**: Automatic deployment from Git
- **Vercel**: Frontend deployment
- **Netlify**: Static site hosting
- **AWS S3**: Static website hosting

## 📱 Responsive Design

- **Desktop**: Full-featured dashboard
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface
- **Accessibility**: WCAG compliant

## 🔧 Development

### Code Structure
```
admin/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── lib/          # Utilities and API
│   ├── types/        # TypeScript types
│   └── styles/       # Global styles
├── public/           # Static assets
└── dist/            # Build output
```

### Best Practices
- TypeScript for type safety
- Component composition
- Custom hooks for logic
- Error boundary implementation
- Performance optimization

## 🐛 Troubleshooting

### Common Issues

1. **Login Failed**
   - Check API URL configuration
   - Verify admin credentials
   - Check network connectivity

2. **Data Not Loading**
   - Verify API endpoints
   - Check authentication token
   - Review browser console

3. **Permission Denied**
   - Confirm admin role
   - Check token expiration
   - Verify API permissions

### Debug Mode
Enable debug logging:
```javascript
localStorage.setItem('debug', 'admin:*');
```

## 📞 Support

For technical support or questions:
- Check the troubleshooting guide
- Review API documentation
- Contact development team

## 📄 License

This project is part of the Nairobi Verified platform.

---
https://nairobi-verified-admin.onrender.com/merchants
**Version**: 1.0.0  
**Last Updated**: January 2024  
**Maintainer**: Nairobi Verified Team
