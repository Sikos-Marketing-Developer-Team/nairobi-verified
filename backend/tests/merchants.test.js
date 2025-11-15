/**
 * Merchant Features Tests
 * Tests merchant-specific functionality including:
 * - Merchant verification
 * - Featured merchant sorting
 * - Dashboard analytics
 * - File uploads (logo, banner, gallery)
 */

const {
  setupDatabase,
  cleanupDatabase,
  closeDatabase,
  createAuthenticatedAgent,
  createAdminUser,
  testData,
  expectSuccessResponse,
  expectErrorResponse
} = require('./setup');

const Merchant = require('../models/Merchant');
const Product = require('../models/Product');

let app;

describe('Merchant Features', () => {
  let merchantAgent;
  let merchantId;
  let adminAgent;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_SESSION = 'false';
    
    await setupDatabase();
    app = require('../server');
    await cleanupDatabase();
    
    const merchantAuth = await createAuthenticatedAgent(app, 'merchant');
    merchantAgent = merchantAuth.agent;
    merchantId = merchantAuth.merchantId;
    
    await createAdminUser();
    const adminAuth = await createAuthenticatedAgent(app, 'user');
    adminAgent = adminAuth.agent;
  });

  afterAll(async () => {
    await cleanupDatabase();
    await closeDatabase();
  });

  describe('Featured Merchant Functionality', () => {
    beforeAll(async () => {
      await Merchant.deleteMany({});
      
      // Create featured and non-featured merchants
      await Merchant.create([
        {
          ...testData.merchant,
          email: 'featured1@example.com',
          businessName: 'Featured Store 1',
          featured: true,
          verified: true
        },
        {
          ...testData.merchant,
          email: 'featured2@example.com',
          businessName: 'Featured Store 2',
          featured: true,
          verified: true
        },
        {
          ...testData.merchant,
          email: 'regular1@example.com',
          businessName: 'Regular Store 1',
          featured: false,
          verified: true
        },
        {
          ...testData.merchant,
          email: 'regular2@example.com',
          businessName: 'Regular Store 2',
          featured: false,
          verified: false
        }
      ]);
    });

    test('featured merchants should appear first in listing', async () => {
      const response = await merchantAgent
        .get('/api/merchants');

      expectSuccessResponse(response);
      
      const merchants = response.body.data;
      expect(merchants.length).toBeGreaterThan(0);
      
      // First merchants should be featured
      const firstTwo = merchants.slice(0, 2);
      firstTwo.forEach(merchant => {
        expect(merchant.featured).toBe(true);
      });
    });

    test('should filter only featured merchants', async () => {
      const response = await merchantAgent
        .get('/api/merchants')
        .query({ featured: true });

      expectSuccessResponse(response);
      
      response.body.data.forEach(merchant => {
        expect(merchant.featured).toBe(true);
      });
    });
  });

  describe('Merchant Verification', () => {
    test('should submit verification request', async () => {
      const response = await merchantAgent
        .post('/api/merchants/dashboard/verification/request');

      expectSuccessResponse(response, 201);
      expect(response.body.data.documentStatus).toBe('pending_review');
    });

    test('should get verification status', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/verification/status');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('documentStatus');
    });

    test('should upload verification documents', async () => {
      const response = await merchantAgent
        .post('/api/merchants/dashboard/verification/documents')
        .attach('businessLicense', Buffer.from('fake-license'), 'license.pdf')
        .attach('idDocument', Buffer.from('fake-id'), 'id.pdf');

      expectSuccessResponse(response);
    });
  });

  describe('Dashboard Analytics', () => {
    test('should get dashboard overview', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/overview');

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty('totalProducts');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalRevenue');
    });

    test('should get analytics with different periods', async () => {
      const periods = ['7', '30', '90'];
      
      for (const period of periods) {
        const response = await merchantAgent
          .get(`/api/merchants/dashboard/analytics?period=${period}`);

        expectSuccessResponse(response);
        expect(response.body.data).toBeDefined();
      }
    });

    test('should get activity log', async () => {
      const response = await merchantAgent
        .get('/api/merchants/dashboard/activity');

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('File Uploads', () => {
    test('should upload merchant logo', async () => {
      const response = await merchantAgent
        .put('/api/merchants/me/logo')
        .attach('logo', Buffer.from('fake-logo'), 'logo.jpg');

      expectSuccessResponse(response);
      expect(response.body.data.logo).toBeDefined();
    });

    test('should upload merchant banner', async () => {
      const response = await merchantAgent
        .put('/api/merchants/me/banner')
        .attach('banner', Buffer.from('fake-banner'), 'banner.jpg');

      expectSuccessResponse(response);
      expect(response.body.data.coverPhoto).toBeDefined();
    });

    test('should upload gallery images', async () => {
      const response = await merchantAgent
        .put('/api/merchants/me/gallery')
        .attach('gallery', Buffer.from('fake-gallery-1'), 'gallery1.jpg')
        .attach('gallery', Buffer.from('fake-gallery-2'), 'gallery2.jpg');

      expectSuccessResponse(response);
      expect(response.body.data.gallery).toBeDefined();
      expect(Array.isArray(response.body.data.gallery)).toBe(true);
    });

    test('should accept multiple image formats', async () => {
      const formats = [
        { ext: 'jpg', mime: 'image/jpeg' },
        { ext: 'png', mime: 'image/png' },
        { ext: 'webp', mime: 'image/webp' }
      ];

      for (const format of formats) {
        const response = await merchantAgent
          .put('/api/merchants/me/logo')
          .attach('logo', Buffer.from('fake-image'), `logo.${format.ext}`);

        expectSuccessResponse(response);
      }
    });

    test('should delete gallery image', async () => {
      // First upload an image
      await merchantAgent
        .put('/api/merchants/me/gallery')
        .attach('gallery', Buffer.from('fake-gallery'), 'to-delete.jpg');

      // Then delete it
      const response = await merchantAgent
        .delete('/api/merchants/me/gallery/0');

      expectSuccessResponse(response);
    });
  });

  describe('Business Information Updates', () => {
    test('should update business hours', async () => {
      const businessHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { closed: true }
      };

      const response = await merchantAgent
        .put('/api/merchants/me/hours')
        .send({ businessHours });

      expectSuccessResponse(response);
      expect(response.body.data.businessHours).toBeDefined();
    });

    test('should update social links', async () => {
      const socialLinks = {
        facebook: 'https://facebook.com/testmerchant',
        instagram: 'https://instagram.com/testmerchant',
        twitter: 'https://twitter.com/testmerchant'
      };

      const response = await merchantAgent
        .put('/api/merchants/me/social')
        .send({ socialLinks });

      expectSuccessResponse(response);
      expect(response.body.data.socialLinks).toBeDefined();
    });
  });

  describe('Admin Merchant Management', () => {
    test('admin should toggle featured status', async () => {
      const merchant = await Merchant.findOne({ email: 'regular1@example.com' });
      
      const response = await adminAgent
        .put(`/api/admin/merchants/${merchant._id}`)
        .send({ featured: true });

      expectSuccessResponse(response);
      expect(response.body.data.featured).toBe(true);
    });

    test('admin should bulk update featured status', async () => {
      const merchants = await Merchant.find({ featured: false }).limit(2);
      const merchantIds = merchants.map(m => m._id);

      const response = await adminAgent
        .post('/api/admin/merchants/bulk-featured')
        .send({
          merchantIds,
          featured: true
        });

      expectSuccessResponse(response);
    });

    test('admin should verify merchant', async () => {
      const merchant = await Merchant.findOne({ verified: false });
      
      const response = await adminAgent
        .post(`/api/admin/merchants/${merchant._id}/verify`)
        .send({ notes: 'Verification approved' });

      expectSuccessResponse(response);
      
      const updated = await Merchant.findById(merchant._id);
      expect(updated.verified).toBe(true);
    });
  });
});
