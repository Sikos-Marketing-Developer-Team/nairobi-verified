const request = require('supertest');
const app = require('../server');

describe('Health Check Tests', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
  });

  test('GET /api/health should return status UP', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.body.data).toHaveProperty('status');
    expect(response.body.data.status).toBe('UP');
  });

  test('GET /api/health should return database status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.body.data).toHaveProperty('database');
  });
});