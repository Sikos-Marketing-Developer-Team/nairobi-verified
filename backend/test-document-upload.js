const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testDocumentUpload() {
  try {
    console.log('Testing document upload...');

    // Create a simple test PDF content
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n174\n%%EOF');

    // Create form data
    const form = new FormData();
    form.append('document', testPdfContent, {
      filename: 'test-business-license.pdf',
      contentType: 'application/pdf'
    });
    form.append('documentType', 'business_license');
    form.append('documentName', 'Test Business License');

    // First get a merchant ID from our sample data
    const response = await axios.get('http://localhost:5000/api/test/postgres');
    console.log('Database status:', response.data);

    // Get merchant ID from database
    const { sequelize, MerchantPG } = require('./models/indexPG');
    const merchant = await MerchantPG.findOne();
    
    if (!merchant) {
      throw new Error('No merchant found in database');
    }

    console.log('Found merchant:', merchant.businessName, 'ID:', merchant.id);

    // Upload document
    const uploadResponse = await axios.post(
      `http://localhost:5000/api/merchants/${merchant.id}/documents`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    console.log('Upload successful:', uploadResponse.data);

    // Test getting documents
    const documentsResponse = await axios.get(
      `http://localhost:5000/api/merchants/${merchant.id}/documents`
    );

    console.log('Documents retrieved:', documentsResponse.data);

    await sequelize.close();

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDocumentUpload();
}

module.exports = testDocumentUpload;