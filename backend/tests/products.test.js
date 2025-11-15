/**
 * Product Management Feature Tests
 * Tests product CRUD operations including:
 * - Product creation by merchants
 * - Product listing and filtering
 * - Product updates
 * - Product deletion
 * - Category synchronization
 * - Image uploads
 */

const {
  setupDatabase,
  cleanupDatabase,
  closeDatabase,
  createAuthenticatedAgent,
  testData,
  expectSuccessResponse,
  expectErrorResponse,
  expectAuthenticationRequired
} = require('./setup');

const Product = require('../models/Product');
const Merchant = require('../models/Merchant');

let app;

describe('Product Management Feature', () => {
  let merchantAgent;
  let merchantId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_SESSION = 'false';
    
    await setupDatabase();
    app = require('../server');
    await cleanupDatabase();
    
    const auth = await createAuthenticatedAgent(app, 'merchant');
    merchantAgent = auth.agent;
    merchantId = auth.merchantId;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closeDatabase();
  });

  describe('Product Creation', () => {
    test('should create product with valid data', async () => {
      const response = await merchantAgent
        .post('/api/merchants/dashboard/products')
        .send({
          name: 'Samsung Galaxy S21',
          description: 'Latest Samsung flagship smartphone with 5G',
          category: 'Electronics',
          subcategory: 'Mobile Phones',
          price: 79999,
          compareAtPrice: 89999,
          inventory: 25,
          available: true,
          featured: false,
          images: ['https://res.cloudinary.com/test/galaxy-s21.jpg']
        });

      expectSuccessResponse(response, 201);
      expect(response.body.data.name).toBe('Samsung Galaxy S21');
      expect(response.body.data.merchant).toBe(merchantId.toString());
      expect(response.body.data.category).toBe('Electronics');
    });

    test('should create product with all 16 valid categories', async () => {
      const validCategories = [
        'Electronics',
        'Fashion & Apparel',
        'Home & Living',
        'Health & Beauty',
        'Sports & Outdoors',
        'Toys & Games',
        'Books & Media',
        'Automotive',
        'Groceries & Food',
        'Pet Supplies',
        'Office Supplies',
        'Baby & Kids',
        'Jewelry & Accessories',
        'Art & Crafts',
        'Garden & Outdoor',
        'Services'
      ];

      for (const category of validCategories) {
        const response = await merchantAgent
          .post('/api/merchants/dashboard/products')
          .send({
            name: `Test Product - ${category}`,
            description: `Product in ${category} category`,
            category: category,
            price: 1000,
            available: true
          });

        expectSuccessResponse(response, 201);
        expect(response.body.data.category).toBe(category);
      }
    });

    test('should reject product without required fields', async () => {
      const response = await merchantAgent
        .post('/api/merchants/dashboard/products')
        .send({
          name: 'Incomplete Product'
          // Missing description and category
        });

      expectErrorResponse(response, 400);
    });

    test('should reject product with negative price', async () => {
      const response = await merchantAgent
        .post('/api/merchants/dashboard/products')
        .send({
          ...testData.product,
          name: 'Negative Price Product',
          price: -100
        });

      expectErrorResponse(response, 400);
    });

    test('should require authentication for product creation', async () => {
      const response = await app
        .post('/api/merchants/dashboard/products')
        .send(testData.product);

      expectAuthenticationRequired(response);
    });
  });

  describe('Product Listing', () => {
    beforeAll(async () => {
      // Create test products
      await Product.create([
        {
          ...testData.product,
          name: 'iPhone 13',
          category: 'Electronics',
          merchant: merchantId,
          price: 99999
        },
        {
          ...testData.product,
          name: 'Summer Dress',
          category: 'Fashion & Apparel',
          merchant: merchantId,
          price: 2999
        },
        {
          ...testData.product,
          name: 'Coffee Maker',
          category: 'Home & Living',
          merchant: merchantId,
          price: 5999
        }
      ]);
    });

    test('should get all merchant products', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/products');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter products by category', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/products')
        .query({ category: 'Electronics' });

      expectSuccessResponse(response);
      response.body.data.forEach(product => {
        expect(product.category).toBe('Electronics');
      });
    });

    test('should search products by name', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/products')
        .query({ search: 'iPhone' });

      expectSuccessResponse(response);
      expect(response.body.data.some(p => p.name.includes('iPhone'))).toBe(true);
    });
  });

  describe('Product Updates', () => {
    let productId;

    beforeAll(async () => {
      const product = await Product.create({
        ...testData.product,
        name: 'Product to Update',
        merchant: merchantId
      });
      productId = product._id;
    });

    test('should update product details', async () => {
      const response = await merchantAgent
        .put(`/api/merchants/dashboard/products/${productId}`)
        .send({
          name: 'Updated Product Name',
          price: 39999
        });

      expectSuccessResponse(response);
      expect(response.body.data.name).toBe('Updated Product Name');
      expect(response.body.data.price).toBe(39999);
    });

    test('should update product inventory', async () => {
      const response = await merchantAgent
        .put(`/api/merchants/dashboard/products/${productId}/inventory`)
        .send({ inventory: 100 });

      expectSuccessResponse(response);
      expect(response.body.data.inventory).toBe(100);
    });

    test('should not allow updating another merchant\'s product', async () => {
      // Create another merchant's product
      const otherMerchant = await Merchant.create({
        ...testData.merchant,
        email: 'other@example.com',
        businessName: 'Other Merchant'
      });

      const otherProduct = await Product.create({
        ...testData.product,
        merchant: otherMerchant._id,
        name: 'Other Merchant Product'
      });

      const response = await merchantAgent
        .put(`/api/merchants/dashboard/products/${otherProduct._id}`)
        .send({ name: 'Hacked Product' });

      expectErrorResponse(response, 403);
    });
  });

  describe('Product Deletion', () => {
    test('should delete own product', async () => {
      const product = await Product.create({
        ...testData.product,
        name: 'Product to Delete',
        merchant: merchantId
      });

      const response = await merchantAgent
        .delete(`/api/merchants/dashboard/products/${product._id}`);

      expectSuccessResponse(response);

      const deleted = await Product.findById(product._id);
      expect(deleted).toBeNull();
    });

    test('should not delete another merchant\'s product', async () => {
      const otherMerchant = await Merchant.create({
        ...testData.merchant,
        email: 'another@example.com',
        businessName: 'Another Merchant'
      });

      const otherProduct = await Product.create({
        ...testData.product,
        merchant: otherMerchant._id,
        name: 'Protected Product'
      });

      const response = await merchantAgent
        .delete(`/api/merchants/dashboard/products/${otherProduct._id}`);

      expectErrorResponse(response, 403);
    });
  });
});
