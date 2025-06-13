# Nairobi Verified Backend API

This is the backend API for the Nairobi Verified marketplace platform.

## Setup

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nairobi_verified
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

3. Run the server:
```
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/register/merchant` - Register a new merchant
- `POST /api/auth/login` - Login user
- `POST /api/auth/login/merchant` - Login merchant
- `GET /api/auth/me` - Get current logged in user/merchant
- `GET /api/auth/logout` - Logout user/merchant

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/password` - Update user password

### Merchants

- `GET /api/merchants` - Get all merchants
- `GET /api/merchants/:id` - Get single merchant
- `PUT /api/merchants/:id` - Update merchant (merchant only)
- `DELETE /api/merchants/:id` - Delete merchant (admin only)
- `PUT /api/merchants/:id/logo` - Upload merchant logo
- `PUT /api/merchants/:id/banner` - Upload merchant banner image
- `PUT /api/merchants/:id/gallery` - Upload merchant gallery images
- `PUT /api/merchants/:id/documents` - Upload merchant verification documents
- `PUT /api/merchants/:id/verify` - Verify merchant (admin only)

### Reviews

- `GET /api/merchants/:merchantId/reviews` - Get reviews for a merchant
- `POST /api/merchants/:merchantId/reviews` - Add review for a merchant
- `GET /api/reviews/:id` - Get a single review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/reply` - Add reply to review (merchant only)
- `PUT /api/reviews/:id/helpful` - Mark review as helpful

### Favorites

- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:merchantId` - Add merchant to favorites
- `DELETE /api/favorites/:merchantId` - Remove merchant from favorites