<div align="center">
  <img src="./frontend/public/Nairobi Verified Logo.png" alt="Nairobi Verified Logo" width="200"/>
  
  # Nairobi Verified
  
  ### Trusted Business Directory for Nairobi CBD
  
  ![Version](https://img.shields.io/badge/version-1.0.0-orange)
  ![License](https://img.shields.io/badge/license-MIT-blue)
  ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
  ![MongoDB](https://img.shields.io/badge/mongodb-6.0%2B-brightgreen)
  
  [Live Demo](https://nairobiverified.co.ke) • [Documentation](./docs) • [Report Bug](https://github.com/Sikos-Marketing-Developer-Team/nairobi-verified/issues) • [Request Feature](https://github.com/Sikos-Marketing-Developer-Team/nairobi-verified/issues)
</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Features Deep Dive](#features-deep-dive)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

**Nairobi Verified** is a comprehensive business directory platform designed specifically for Nairobi's Central Business District (CBD). The platform connects shoppers with physically verified merchants, ensuring trust and confidence in every transaction.

### The Problem We Solve

In Nairobi's bustling CBD, finding legitimate, trustworthy businesses can be challenging. Customers need:
- ✅ Verification that businesses are legitimate
- ✅ Easy access to merchant information (location, contact, products)
- ✅ Customer reviews and ratings
- ✅ Product browsing and comparison
- ✅ Direct communication channels

### Our Solution

Nairobi Verified provides a platform where:
- **Merchants** can showcase their businesses, products, and services
- **Customers** can discover verified businesses with confidence
- **Admins** can manage and verify merchant applications
- **Everyone** benefits from transparent reviews and ratings

---

## ✨ Key Features

### For Customers
- 🔍 **Advanced Search**: Find businesses by name, category, or location
- ⭐ **Reviews & Ratings**: Read authentic customer feedback
- 📱 **Product Browsing**: Browse products with detailed information
- 💚 **Favorites**: Save favorite merchants and products
- 🛒 **Shopping Cart**: Add products to cart for easy checkout
- 📍 **Location Maps**: Interactive maps showing merchant locations
- 🔔 **Notifications**: Stay updated on new products and offers
- 📧 **Direct Contact**: Email, phone, and WhatsApp integration

### For Merchants
- 🏪 **Business Profile**: Create detailed business profiles with logo and banner
- 📦 **Product Management**: Add, edit, and manage product listings
- 📊 **Analytics Dashboard**: Track views, engagement, and performance
- 📸 **Photo Gallery**: Showcase business and product images
- 💬 **Review Management**: Respond to customer reviews
- ✅ **Verification Badge**: Get verified status after document approval
- 📈 **Performance Insights**: Monitor business metrics
- 🎯 **Featured Listings**: Boost visibility with featured status

### For Admins
- 👥 **User Management**: Manage all platform users
- 🏢 **Merchant Verification**: Review and approve merchant applications
- 📄 **Document Review**: Verify business registration and ID documents
- 📊 **Analytics & Reports**: Comprehensive platform analytics
- 📥 **Data Export**: Export data in PDF and CSV formats with charts
- ⚙️ **System Settings**: Configure platform settings
- 🎨 **Flash Sales**: Create and manage promotional campaigns
- 📢 **Bulk Operations**: Perform actions on multiple records

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Maps**: Leaflet / Google Maps
- **Charts**: Chart.js, Recharts
- **PDF Generation**: jsPDF

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth)
- **File Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Caching**: Redis
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Session**: Express Session
- **Logging**: Morgan, Winston

### DevOps & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions
- **Monitoring**: Render Analytics

---

## 📁 Project Structure

```
nairobi-verified/
├── frontend/                 # Customer-facing React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── interfaces/     # TypeScript interfaces
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── admin/                   # Admin panel React application
│   ├── src/
│   │   ├── components/     # Admin UI components
│   │   ├── pages/          # Admin pages
│   │   ├── contexts/       # Admin contexts
│   │   ├── lib/            # Admin utilities
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── backend/                 # Node.js/Express API server
│   ├── config/             # Configuration files
│   │   ├── db.js          # Database connection
│   │   ├── passport.js    # Authentication strategies
│   │   ├── redis.js       # Redis configuration
│   │   └── constants.js   # App constants
│   ├── controllers/        # Route controllers
│   │   ├── auth.js        # Authentication
│   │   ├── merchants.js   # Merchant operations
│   │   ├── products.js    # Product operations
│   │   ├── reviews.js     # Review operations
│   │   └── adminDashboard.js
│   ├── middleware/         # Express middleware
│   │   ├── auth.js        # JWT authentication
│   │   ├── adminAuth.js   # Admin authorization
│   │   ├── error.js       # Error handling
│   │   └── rateLimiters.js
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Merchant.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   └── Order.js
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── tests/             # Test files
│   └── server.js          # App entry point
│
└── docs/                   # Documentation
    └── *.md               # Various documentation files
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
  ```bash
  node --version
  ```

- **npm** or **yarn**
  ```bash
  npm --version
  ```

- **MongoDB** (v6.0 or higher)
  - Local installation or MongoDB Atlas account
  
- **Redis** (optional, for caching)
  ```bash
  redis-server --version
  ```

- **Git**
  ```bash
  git --version
  ```

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: macOS, Linux, or Windows

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sikos-Marketing-Developer-Team/nairobi-verified.git
cd nairobi-verified
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Admin Panel Dependencies

```bash
cd ../admin
npm install
```

---

## 🔐 Environment Variables

### Backend Environment (.env)

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/nairobi-verified
# or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nairobi-verified

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Admin Configuration
ADMIN_EMAIL=admin@nairobiverified.com
ADMIN_PASSWORD=SecureAdminPassword123!

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=Nairobi Verified <noreply@nairobiverified.com>

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URLs
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Session Secret
SESSION_SECRET=your-session-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
```

### Frontend Environment (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Nairobi Verified
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Admin Panel Environment (.env)

Create a `.env` file in the `admin` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Nairobi Verified Admin
```

---

## ▶️ Running the Application

### Development Mode

#### 1. Start MongoDB
```bash
# If using local MongoDB
mongod --dbpath /path/to/your/data/directory
```

#### 2. Start Redis (Optional)
```bash
redis-server
```

#### 3. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### 4. Start Frontend Application
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

#### 5. Start Admin Panel
```bash
cd admin
npm run dev
```
Admin panel will run on `http://localhost:5174`

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

#### Admin
```bash
cd admin
npm run build
npm run preview
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/google` | Google OAuth login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password/:token` | Reset password | No |

### Merchant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/merchants` | Get all merchants | No |
| GET | `/merchants/:id` | Get merchant details | No |
| POST | `/merchants` | Create merchant | Yes (User) |
| PUT | `/merchants/:id` | Update merchant | Yes (Merchant) |
| DELETE | `/merchants/:id` | Delete merchant | Yes (Admin) |
| GET | `/merchants/:id/products` | Get merchant products | No |
| GET | `/merchants/:id/reviews` | Get merchant reviews | No |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/:id` | Get product details | No |
| GET | `/products/featured` | Get featured products | No |
| POST | `/products` | Create product | Yes (Merchant) |
| PUT | `/products/:id` | Update product | Yes (Merchant) |
| DELETE | `/products/:id` | Delete product | Yes (Merchant) |
| GET | `/products/search` | Search products | No |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews` | Get all reviews | No |
| POST | `/reviews` | Create review | Yes (User) |
| PUT | `/reviews/:id` | Update review | Yes (User) |
| DELETE | `/reviews/:id` | Delete review | Yes (User/Admin) |
| POST | `/reviews/:id/helpful` | Mark review helpful | Yes (User) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard/stats` | Dashboard statistics | Yes (Admin) |
| GET | `/admin/dashboard/analytics` | Analytics data | Yes (Admin) |
| GET | `/admin/dashboard/merchants` | Get all merchants | Yes (Admin) |
| PUT | `/admin/dashboard/merchants/:id/verify` | Verify merchant | Yes (Admin) |
| GET | `/admin/dashboard/users` | Get all users | Yes (Admin) |
| POST | `/admin/dashboard/export/:type` | Export data | Yes (Admin) |

For complete API documentation, see [API_DOCS.md](./docs/API_DOCS.md)

---

## 👥 User Roles

### 1. Customer/User
- Browse merchants and products
- Submit reviews and ratings
- Add items to cart and favorites
- Contact merchants directly
- Manage profile and preferences

### 2. Merchant
- Create and manage business profile
- Add and manage products
- Upload photos and galleries
- View analytics and insights
- Respond to reviews
- Update business information

### 3. Admin
- Verify merchant applications
- Review submitted documents
- Manage all users and merchants
- Access comprehensive analytics
- Export reports and data
- Configure system settings
- Manage flash sales
- Perform bulk operations

---

## 🎨 Features Deep Dive

### Merchant Verification System

Our verification process ensures only legitimate businesses are listed:

1. **Application**: Merchant submits business information
2. **Document Upload**: Upload business registration, ID, utility bill
3. **Admin Review**: Admin reviews documents and profile
4. **Verification**: Approved merchants get verified badge
5. **Benefits**: Enhanced visibility and customer trust

### Smart Product Management

Merchants can:
- Upload multiple product images
- Set original and sale prices
- Manage inventory (stock quantity)
- Categorize products
- Add specifications and tags
- Mark products as featured
- Track views and engagement

### Advanced Analytics

#### For Merchants:
- Profile views over time
- Product performance metrics
- Review analytics
- Customer engagement insights

#### For Admins:
- Platform-wide statistics
- User growth trends
- Business type distribution
- Geographic distribution
- Revenue analytics
- Export to PDF with charts and graphs

### Review System

- Star ratings (1-5)
- Written reviews
- Photo attachments
- Helpful voting
- Merchant responses
- Review moderation

### Search & Discovery

- Full-text search
- Category filtering
- Price range filtering
- Location-based search
- Sort by relevance, rating, date
- Featured merchants prioritization

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

### Backend (Render)

1. Push code to GitHub
2. Create new Web Service in Render
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

### Database (MongoDB Atlas)

1. Create cluster in MongoDB Atlas
2. Configure network access
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in environment variables

### File Storage (Cloudinary)

1. Create Cloudinary account
2. Get credentials from dashboard
3. Update environment variables
4. Configure upload presets

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for new frontend code
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Nairobi Verified Team**

- Website: [https://nairobiverified.co.ke](https://nairobiverified.co.ke)
- Email: support@nairobiverified.com
- GitHub: [@Sikos-Marketing-Developer-Team](https://github.com/Sikos-Marketing-Developer-Team)

### Project Maintainers

- **Lead Developer**: Sikos Marketing Developer Team
- **Backend Team**: Backend Development Team
- **Frontend Team**: Frontend Development Team
- **DevOps**: Infrastructure Team

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
- [Render](https://render.com/)
- [Cloudinary](https://cloudinary.com/)

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Sikos-Marketing-Developer-Team/nairobi-verified?style=social)
![GitHub forks](https://img.shields.io/github/forks/Sikos-Marketing-Developer-Team/nairobi-verified?style=social)
![GitHub issues](https://img.shields.io/github/issues/Sikos-Marketing-Developer-Team/nairobi-verified)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Sikos-Marketing-Developer-Team/nairobi-verified)

---

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] User authentication and authorization
- [x] Merchant registration and verification
- [x] Product management
- [x] Review system
- [x] Admin dashboard
- [x] Analytics and reporting

### Phase 2 (In Progress) 🚧
- [ ] Mobile application (React Native)
- [ ] Advanced search with AI
- [ ] Chat/messaging system
- [ ] Payment integration (M-Pesa)
- [ ] Order management system
- [ ] Email marketing campaigns

### Phase 3 (Planned) 📅
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Advanced merchant analytics
- [ ] Customer loyalty program
- [ ] AR product preview
- [ ] Voice search

---

<div align="center">
  
  ### ⭐ Star us on GitHub — it motivates us a lot!
  
  Made with ❤️ in Nairobi, Kenya 🇰🇪
  
</div>
