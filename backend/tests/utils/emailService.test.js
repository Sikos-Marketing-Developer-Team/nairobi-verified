// tests/utils/emailService.test.js
require('dotenv').config({ path: '.env.test' });
const nodemailer = require('nodemailer');
const sinon = require('sinon');
const { EmailService } = require('../../utils/emailService');
const { EMAIL_CONFIG } = require('../../config/constants');

describe('EmailService', () => {
  let emailService;
  let mockTransport;
  let createTransportStub;

  beforeEach(() => {
    // Create a fresh mock transport for each test
    mockTransport = {
      sendMail: sinon.stub(),
    };
    
    // Stub nodemailer.createTransport to return our mock
    createTransportStub = sinon.stub(nodemailer, 'createTransport').returns(mockTransport);
    
    // Create a new EmailService instance
    emailService = new EmailService();
  });

  afterEach(() => {
    // Restore all stubs after each test
    sinon.restore();
  });

  describe('createTransporter', () => {
    it('should create a transporter with production settings', () => {
      // Clean up the stub from beforeEach to test fresh
      createTransportStub.restore();
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const createTransportSpy = sinon.spy(nodemailer, 'createTransport');
      const service = new EmailService();
      
      expect(createTransportSpy.calledWith({
        service: EMAIL_CONFIG.SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })).toBe(true);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      createTransportSpy.restore();
    });

    it('should create a transporter with development settings', () => {
      // Clean up the stub from beforeEach to test fresh
      createTransportStub.restore();
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const createTransportSpy = sinon.spy(nodemailer, 'createTransport');
      const service = new EmailService();
      
      expect(createTransportSpy.calledWith({
        host: EMAIL_CONFIG.DEV_HOST,
        port: EMAIL_CONFIG.DEV_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })).toBe(true);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      createTransportSpy.restore();
    });
  });

  describe('sendEmail', () => {
    it('should send an email with correct options and return success', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      };
      const mockResponse = { messageId: '12345', envelope: { to: emailOptions.to } };
      mockTransport.sendMail.resolves(mockResponse);

      const result = await emailService.sendEmail(emailOptions);

      expect(mockTransport.sendMail.calledOnce).toBe(true);
      expect(mockTransport.sendMail.calledWith({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text,
      })).toBe(true);
      expect(result).toEqual({
        success: true,
        messageId: '12345',
        previewUrl: null,
      });
    });

    it('should throw an error on email sending failure', async () => {
      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      };
      mockTransport.sendMail.rejects(new Error('SMTP error'));

      await expect(emailService.sendEmail(emailOptions)).rejects.toThrow('Failed to send email: SMTP error');
    });
  });

  describe('getMerchantWelcomeTemplate', () => {
    it('should generate correct welcome email template', () => {
      const merchantData = { businessName: 'Test Business', email: 'merchant@example.com' };
      const credentials = { email: 'user@example.com', tempPassword: 'temp123' };
      const setupUrl = 'https://example.com/setup';
      
      const template = emailService.getMerchantWelcomeTemplate(merchantData, credentials, setupUrl);

      expect(template).toContain('Welcome to Nairobi CBD!');
      expect(template).toContain('Test Business');
      expect(template).toContain('user@example.com');
      expect(template).toContain('temp123');
      expect(template).toContain('https://example.com/setup');
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails in parallel and return results', async () => {
      const emailOptionsArray = [
        { to: 'recipient1@example.com', subject: 'Test 1', html: '<p>Test 1</p>' },
        { to: 'recipient2@example.com', subject: 'Test 2', html: '<p>Test 2</p>' },
      ];
      const mockResponses = [
        { messageId: '12345', envelope: { to: emailOptionsArray[0].to } },
        { messageId: '67890', envelope: { to: emailOptionsArray[1].to } },
      ];
      mockTransport.sendMail
        .onFirstCall().resolves(mockResponses[0])
        .onSecondCall().resolves(mockResponses[1]);

      const results = await emailService.sendBulkEmails(emailOptionsArray);

      expect(mockTransport.sendMail.calledTwice).toBe(true);
      expect(mockTransport.sendMail.firstCall.args[0]).toMatchObject({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: emailOptionsArray[0].to,
        subject: emailOptionsArray[0].subject,
        html: emailOptionsArray[0].html,
      });
      expect(results).toEqual([
        { success: true, messageId: '12345', previewUrl: null },
        { success: true, messageId: '67890', previewUrl: null },
      ]);
    });

    it('should handle errors in bulk email sending', async () => {
      const emailOptionsArray = [
        { to: 'recipient1@example.com', subject: 'Test 1', html: '<p>Test 1</p>' },
        { to: 'recipient2@example.com', subject: 'Test 2', html: '<p>Test 2</p>' },
      ];
      mockTransport.sendMail
        .onFirstCall().resolves({ messageId: '12345', envelope: { to: emailOptionsArray[0].to } })
        .onSecondCall().rejects(new Error('SMTP error'));

      await expect(emailService.sendBulkEmails(emailOptionsArray)).rejects.toThrow('Failed to send email: SMTP error');
    });
  });

  describe('sendMerchantWelcome', () => {
    it('should send a welcome email with correct options', async () => {
      const merchantData = { businessName: 'Test Business', email: 'merchant@example.com' };
      const credentials = { email: 'user@example.com', tempPassword: 'temp123' };
      const setupUrl = 'https://example.com/setup';
      const mockResponse = { messageId: '12345', envelope: { to: merchantData.email } };
      mockTransport.sendMail.resolves(mockResponse);

      const result = await emailService.sendMerchantWelcome(merchantData, credentials, setupUrl);

      expect(mockTransport.sendMail.calledOnce).toBe(true);
      expect(mockTransport.sendMail.firstCall.args[0]).toMatchObject({
        from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: merchantData.email,
        subject: EMAIL_CONFIG.SUBJECTS.WELCOME,
        html: expect.stringContaining('Welcome to Nairobi CBD!'),
      });
      expect(result).toEqual({
        success: true,
        messageId: '12345',
        previewUrl: null,
      });
    });
  });
});