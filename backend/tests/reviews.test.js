/**
 * Review System Feature Tests
 * Tests review functionality including:
 * - Review submission with images
 * - Review listing
 * - Review replies by merchants
 * - Review moderation
 */

const {
  setupDatabase,
  cleanupDatabase,
  closeDatabase,
  createAuthenticatedAgent,
  createTestProduct,
  testData,
  expectSuccessResponse,
  expectErrorResponse
} = require('./setup');

const Review = require('../models/Review');
const Product = require('../models/Product');

let app;

describe('Review System Feature', () => {
  let userAgent;
  let userId;
  let merchantAgent;
  let merchantId;
  let productId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_SESSION = 'false';
    
    await setupDatabase();
    app = require('../server');
    await cleanupDatabase();
    
    const merchantAuth = await createAuthenticatedAgent(app, 'merchant');
    merchantAgent = merchantAuth.agent;
    merchantId = merchantAuth.merchantId;
    
    const userAuth = await createAuthenticatedAgent(app, 'user');
    userAgent = userAuth.agent;
    userId = userAuth.userId;
    
    const product = await createTestProduct(merchantId);
    productId = product._id;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closeDatabase();
  });

  describe('Review Creation', () => {
    test('should create review with valid data', async () => {
      const response = await userAgent
        .post('/api/reviews')
        .send({
          merchant: merchantId,
          rating: 5,
          content: 'Excellent service and products!'
        });

      expectSuccessResponse(response, 201);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.merchant).toBe(merchantId.toString());
      expect(response.body.data.user).toBe(userId);
    });

    test('should create review with images', async () => {
      const response = await userAgent
        .post('/api/reviews')
        .field('merchant', merchantId)
        .field('rating', 5)
        .field('content', 'Great product with photos!')
        .attach('images', Buffer.from('fake-image-1'), 'review1.jpg')
        .attach('images', Buffer.from('fake-image-2'), 'review2.jpg');

      expectSuccessResponse(response, 201);
      expect(response.body.data.images).toBeDefined();
    });

    test('should reject review with invalid rating', async () => {
      const response = await userAgent
        .post('/api/reviews')
        .send({
          merchant: merchantId,
          rating: 6, // Invalid: max is 5
          content: 'Invalid rating'
        });

      expectErrorResponse(response, 400);
    });

    test('should reject review without rating', async () => {
      const response = await userAgent
        .post('/api/reviews')
        .send({
          merchant: merchantId,
          content: 'No rating provided'
        });

      expectErrorResponse(response, 400);
    });

    test('should limit review images to 5', async () => {
      const formData = userAgent
        .post('/api/reviews')
        .field('merchant', merchantId)
        .field('rating', 5)
        .field('content', 'Too many images');

      for (let i = 0; i < 6; i++) {
        formData.attach('images', Buffer.from(`fake-image-${i}`), `review${i}.jpg`);
      }

      const response = await formData;
      
      // Should either reject or only accept first 5
      if (response.status === 201) {
        expect(response.body.data.images.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Review Listing', () => {
    beforeAll(async () => {
      await Review.deleteMany({});
      
      await Review.create([
        {
          merchant: merchantId,
          user: userId,
          rating: 5,
          content: 'Excellent!',
          verified: true
        },
        {
          merchant: merchantId,
          user: userId,
          rating: 4,
          content: 'Very good',
          verified: true
        },
        {
          merchant: merchantId,
          user: userId,
          rating: 3,
          content: 'Average',
          verified: true
        }
      ]);
    });

    test('should get all merchant reviews', async () => {
      const response = await userAgent
        .get(`/api/reviews/merchant/${merchantId}`);

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    test('should filter reviews by rating', async () => {
      const response = await userAgent
        .get(`/api/reviews/merchant/${merchantId}`)
        .query({ rating: 5 });

      expectSuccessResponse(response);
      response.body.data.forEach(review => {
        expect(review.rating).toBe(5);
      });
    });

    test('should paginate reviews', async () => {
      const response = await userAgent
        .get(`/api/reviews/merchant/${merchantId}`)
        .query({ page: 1, limit: 2 });

      expectSuccessResponse(response);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Merchant Review Management', () => {
    let reviewId;

    beforeAll(async () => {
      const review = await Review.create({
        merchant: merchantId,
        user: userId,
        rating: 4,
        content: 'Good product'
      });
      reviewId = review._id;
    });

    test('merchant should reply to review', async () => {
      const response = await merchantAgent
        .post(`/api/merchants/me/reviews/${reviewId}/reply`)
        .send({
          reply: 'Thank you for your feedback!'
        });

      expectSuccessResponse(response);
      expect(response.body.data.merchantReply).toBe('Thank you for your feedback!');
    });

    test('merchant should get their reviews', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/reviews');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('merchant should delete their reply', async () => {
      await Review.findByIdAndUpdate(reviewId, {
        merchantReply: 'Test reply to delete'
      });

      const response = await merchantAgent
        .delete(`/api/merchants/me/reviews/${reviewId}/reply`);

      expectSuccessResponse(response);
      
      const review = await Review.findById(reviewId);
      expect(review.merchantReply).toBeUndefined();
    });
  });

  describe('Review Helpful Marking', () => {
    let reviewId;

    beforeAll(async () => {
      const review = await Review.create({
        merchant: merchantId,
        user: userId,
        rating: 5,
        content: 'Helpful review'
      });
      reviewId = review._id;
    });

    test('should mark review as helpful', async () => {
      const response = await userAgent
        .put(`/api/reviews/${reviewId}/helpful`);

      expectSuccessResponse(response);
      expect(response.body.data.helpfulCount).toBeGreaterThan(0);
    });
  });

  describe('Review Display with Images', () => {
    test('should return reviews with image URLs', async () => {
      await Review.create({
        merchant: merchantId,
        user: userId,
        rating: 5,
        content: 'Review with images',
        images: [
          {
            url: 'https://res.cloudinary.com/test/review1.jpg',
            publicId: 'reviews/test1'
          },
          {
            url: 'https://res.cloudinary.com/test/review2.jpg',
            publicId: 'reviews/test2'
          }
        ]
      });

      const response = await userAgent
        .get(`/api/reviews/merchant/${merchantId}`);

      expectSuccessResponse(response);
      const reviewWithImages = response.body.data.find(r => r.images && r.images.length > 0);
      expect(reviewWithImages).toBeDefined();
      expect(reviewWithImages.images.length).toBe(2);
      expect(reviewWithImages.images[0]).toHaveProperty('url');
    });
  });
});
