# Nairobi Verified

A trusted e-commerce platform that helps users discover and shop from verified vendors in Nairobi CBD — complete with directions to each shop!

## 🔐 Admin Dashboard

For security purposes, admin functionality has been separated into a dedicated admin dashboard:

- **Location**: `/admin` folder
- **Access**: Separate authentication system
- **Security**: Enhanced access controls and monitoring
- **Deployment**: Independent from main application

### Quick Start (Admin)
```bash
# Start admin dashboard
./start-admin.sh

# Or manually:
cd admin
npm install
npm run dev
```

**Admin Access**: http://localhost:3001
- Email: admin@nairobiverfied.com
- Password: admin123 (change after first login!)

📖 **Full Documentation**: [ADMIN_MIGRATION_GUIDE.md](./ADMIN_MIGRATION_GUIDE.md)

## Application Routes

We have a comprehensive list of all application routes available at:
- `/sitemap` - Visual site map showing all available routes
- `/ui-guide` - UI style guide and component library

For developers, the complete route list is available in:
- `frontend/src/routes.txt` - Text list of all routes
- `frontend/src/routes-map.md` - Detailed route map with UI enhancement ideas

## Features

- **User Authentication**: Secure login and registration for customers and merchants
- **Product Management**: Merchants can add, edit, and manage their products
- **Shopping Cart**: Users can add products to cart and checkout
- **Order Management**: Track and manage orders
- **Reviews and Ratings**: Users can leave reviews for products and merchants
- **Category Navigation**: Browse products by categories
- **Merchant Verification**: Verified merchants are highlighted for user trust
- **Shop Location**: Find physical store locations with directions
- **Subscription Packages**: Merchants can subscribe to different packages for enhanced visibility
- **Automated Renewal Notifications**: Email notifications for expiring subscriptions
- **Subscription Management**: Merchants can view, renew, and manage their subscriptions
- **🔐 Secure Admin Dashboard**: Separate admin interface for platform management

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js for authentication
- Multer for file uploads

### Frontend
- Next.js
- React
- Tailwind CSS
- React Icons

## API Endpoints

### Subscriptions
- `GET /api/subscriptions/packages` - Get all subscription packages
- `GET /api/subscriptions/packages/:id` - Get subscription package by ID
- `POST /api/subscriptions/packages` - Create a subscription package (admin)
- `PUT /api/subscriptions/packages/:id` - Update a subscription package (admin)
- `DELETE /api/subscriptions/packages/:id` - Delete a subscription package (admin)
- `POST /api/subscriptions/subscribe` - Subscribe to a package
- `GET /api/subscriptions/current` - Get current subscription
- `GET /api/subscriptions/history` - Get subscription history
- `PUT /api/subscriptions/cancel/:subscriptionId` - Cancel subscription
- `POST /api/subscriptions/renew/:subscriptionId` - Renew subscription
- `GET /api/subscriptions/all` - Get all subscriptions (admin)
- `PUT /api/subscriptions/:subscriptionId` - Update subscription status (admin)
- `POST /api/subscriptions/check-expiring` - Check expiring subscriptions (admin)
- `POST /api/subscriptions/mpesa/callback` - M-Pesa payment callback

### Notifications
- `POST /api/notifications/subscriptions/check-expiring` - Manually check for expiring subscriptions (admin)

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get a single product
- `GET /api/products/merchant/:merchantId` - Get products by merchant
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/featured` - Get featured categories
- `GET /api/categories/:identifier` - Get a single category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/item/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/merchant-orders` - Get merchant orders
- `GET /api/orders/all` - Get all orders (admin)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status
- `PUT /api/orders/:id/cancel` - Cancel order

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/merchant/:merchantId` - Get merchant reviews
- `POST /api/reviews/product` - Create a product review
- `POST /api/reviews/merchant` - Create a merchant review
- `GET /api/reviews/pending` - Get pending reviews (admin)
- `PUT /api/reviews/:reviewId/moderate` - Moderate review (admin)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nairobi-verified.git
cd nairobi-verified
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In backend directory, create a .env file with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nairobi-verified
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000

# In frontend directory, create a .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the application
```bash
# Run backend
cd backend
npm run dev

# Run frontend
cd frontend
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## License
MIT