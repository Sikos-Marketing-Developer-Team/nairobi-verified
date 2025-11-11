/**
 * MERCHANT PRODUCT MANAGEMENT - DEVELOPER QUICK REFERENCE
 * ========================================================
 * 
 * This file contains quick references for working with the merchant product
 * management system.
 */

// ============================================================================
// BACKEND API ENDPOINTS
// ============================================================================

/**
 * BASE URL: /api/merchants/dashboard
 * All routes require authentication (Bearer token)
 */

const ENDPOINTS = {
  // Product CRUD
  GET_PRODUCTS:      'GET    /products',                    // List all merchant products
  GET_PRODUCT:       'GET    /products/:productId',         // Get single product
  CREATE_PRODUCT:    'POST   /products',                    // Create new product
  UPDATE_PRODUCT:    'PUT    /products/:productId',         // Update product
  DELETE_PRODUCT:    'DELETE /products/:productId',         // Delete product
  
  // Product Actions
  TOGGLE_AVAILABLE:  'PATCH  /products/:productId/availability',  // Toggle availability
  
  // Image Management
  UPLOAD_IMAGES:     'POST   /uploads/products',            // Upload images (separate route)
  DELETE_IMAGE:      'DELETE /products/:productId/images/:imageId' // Delete specific image
};

// ============================================================================
// REQUEST/RESPONSE EXAMPLES
// ============================================================================

// CREATE PRODUCT
const createProductRequest = {
  method: 'POST',
  url: '/api/merchants/dashboard/products',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: {
    name: 'Product Name',              // Required
    description: 'Description',         // Required
    category: 'Beauty & Personal Care', // Required
    price: 1500,                        // Optional (default: 0)
    available: true,                    // Optional (default: true)
    featured: false,                    // Optional (default: false)
    images: []                          // Optional (array of URLs)
  }
};

const createProductResponse = {
  success: true,
  message: 'Product created successfully',
  data: {
    _id: '507f1f77bcf86cd799439011',
    name: 'Product Name',
    description: 'Description',
    category: 'Beauty & Personal Care',
    price: 1500,
    available: true,
    featured: false,
    images: [],
    merchant: '507f1f77bcf86cd799439012',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
};

// UPLOAD IMAGES
const uploadImagesRequest = {
  method: 'POST',
  url: '/api/uploads/products',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'multipart/form-data'
  },
  body: FormData // With 'images' field containing files
};

const uploadImagesResponse = {
  success: true,
  files: [
    'https://res.cloudinary.com/xxx/image/upload/v123/nairobi-verified/products/abc123.jpg',
    'https://res.cloudinary.com/xxx/image/upload/v123/nairobi-verified/products/def456.jpg'
  ]
};

// UPDATE PRODUCT
const updateProductRequest = {
  method: 'PUT',
  url: '/api/merchants/dashboard/products/507f1f77bcf86cd799439011',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: {
    name: 'Updated Name',           // Optional
    description: 'Updated desc',    // Optional
    price: 2000,                    // Optional
    images: ['url1', 'url2']       // Optional (replaces all images)
  }
};

// ============================================================================
// FRONTEND USAGE EXAMPLES
// ============================================================================

// Fetch Products
const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/merchants/dashboard/products');
    const products = response.data.data || [];
    setProducts(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

// Create Product with Images
const createProductWithImages = async (productData, imageFiles) => {
  try {
    // Step 1: Upload images first
    let uploadedUrls = [];
    if (imageFiles.length > 0) {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('images', file));
      
      const uploadRes = await axios.post('/api/uploads/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      uploadedUrls = uploadRes.data.files || uploadRes.data.data || [];
    }
    
    // Step 2: Create product with image URLs
    const response = await axios.post('/api/merchants/dashboard/products', {
      ...productData,
      images: uploadedUrls
    });
    
    console.log('Product created:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

// Update Product
const updateProduct = async (productId, updates) => {
  try {
    const response = await axios.put(
      `/api/merchants/dashboard/products/${productId}`,
      updates
    );
    console.log('Product updated:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
};

// Delete Product
const deleteProduct = async (productId) => {
  try {
    await axios.delete(`/api/merchants/dashboard/products/${productId}`);
    console.log('Product deleted');
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
};

// Toggle Availability
const toggleAvailability = async (productId, available) => {
  try {
    const response = await axios.patch(
      `/api/merchants/dashboard/products/${productId}/availability`,
      { available }
    );
    return response.data.data;
  } catch (error) {
    console.error('Failed to toggle availability:', error);
    throw error;
  }
};

// ============================================================================
// DATA STRUCTURES
// ============================================================================

// Product Interface (TypeScript)
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
  images: string[];
  merchant: string;
  createdAt: string;
  updatedAt: string;
}

// Product Form Data
interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  featured: boolean;
}

// Available Categories
const CATEGORIES = [
  "Beauty & Cosmetics",
  "Fashion & Apparel",
  "Food & Beverages",
  "Health & Wellness",
  "Home & Garden",
  "Electronics",
  "Services",
  "Other"
];

// ============================================================================
// VALIDATION RULES
// ============================================================================

const validationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  category: {
    required: true,
    enum: CATEGORIES
  },
  price: {
    required: false,
    min: 0,
    type: 'number'
  },
  images: {
    required: false,
    maxCount: 5,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg']
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.error || error.response.data?.message;
    console.error('API Error:', message);
    return message;
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.request);
    return 'Network error. Please check your connection.';
  } else {
    // Other errors
    console.error('Error:', error.message);
    return error.message;
  }
};

// ============================================================================
// TESTING HELPERS
// ============================================================================

// Create test product data
const createTestProduct = () => ({
  name: `Test Product ${Date.now()}`,
  description: 'This is a test product for development',
  category: 'Beauty & Cosmetics',
  price: Math.floor(Math.random() * 5000) + 500,
  available: true,
  featured: false
});

// Create mock image file for testing
const createMockImageFile = () => {
  const blob = new Blob(['fake image content'], { type: 'image/jpeg' });
  return new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
};

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Create product with upload progress
const createProductWithProgress = async (productData, files, onProgress) => {
  try {
    // Upload images with progress
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const uploadRes = await axios.post('/api/uploads/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percentCompleted);
      }
    });
    
    const imageUrls = uploadRes.data.files || [];
    
    // Create product
    const response = await axios.post('/api/merchants/dashboard/products', {
      ...productData,
      images: imageUrls
    });
    
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Pattern 2: Batch operations
const batchUpdateProducts = async (productIds, updates) => {
  const promises = productIds.map(id => 
    axios.put(`/api/merchants/dashboard/products/${id}`, updates)
  );
  
  try {
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { successful, failed, results };
  } catch (error) {
    throw error;
  }
};

// Pattern 3: Optimistic updates
const optimisticUpdate = async (productId, updates, currentProducts, setProducts) => {
  // Optimistically update UI
  const optimisticProducts = currentProducts.map(p => 
    p._id === productId ? { ...p, ...updates } : p
  );
  setProducts(optimisticProducts);
  
  try {
    // Make actual API call
    const response = await axios.put(
      `/api/merchants/dashboard/products/${productId}`,
      updates
    );
    
    // Update with real data
    const realProducts = currentProducts.map(p => 
      p._id === productId ? response.data.data : p
    );
    setProducts(realProducts);
    
  } catch (error) {
    // Revert on error
    setProducts(currentProducts);
    throw error;
  }
};

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/*
1. Check Authentication:
   - Verify token in localStorage/cookies
   - Check Authorization header in Network tab
   - Ensure merchant is logged in

2. Image Upload Issues:
   - Check file size (max 5MB)
   - Check file type (JPEG, PNG only)
   - Verify Cloudinary credentials
   - Check CORS settings

3. Products Not Showing:
   - Check API response in Network tab
   - Verify data structure matches interface
   - Check state updates in React DevTools
   - Verify MongoDB has products for merchant

4. Update Not Working:
   - Check field name mapping (available vs isActive)
   - Verify productId is correct
   - Check payload structure
   - Verify merchant owns the product

5. Performance Issues:
   - Implement pagination for large product lists
   - Lazy load images
   - Use React.memo for product cards
   - Debounce search/filter inputs
*/

// ============================================================================
// USEFUL COMMANDS
// ============================================================================

/*
# Backend Development
npm run dev                    # Start backend server
npm run seed                   # Seed database with test data
node tests/verify-product-management.sh  # Verify setup

# Frontend Development  
npm run dev                    # Start frontend dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Database
mongosh                        # Open MongoDB shell
use nairobi_verified          # Switch to database
db.products.find()            # View all products
db.products.find({merchant: ObjectId("xxx")})  # Find by merchant

# Testing
node tests/test-merchant-product-management.js  # Run API tests
npm test                       # Run all tests

# Cloudinary
# View uploads: https://cloudinary.com/console/media_library
# Check usage: https://cloudinary.com/console/usage
*/

module.exports = {
  ENDPOINTS,
  CATEGORIES,
  createTestProduct,
  createMockImageFile,
  handleError
};
