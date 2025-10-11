const express = require('express');
const router = express.Router();
const { sequelize, UserPG, MerchantPG, DocumentPG } = require('../models/indexPG');

// @desc    Test PostgreSQL connection
// @route   GET /api/test/postgres
// @access  Public
router.get('/postgres', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get some basic stats
    const userCount = await UserPG.count();
    const merchantCount = await MerchantPG.count();
    const documentCount = await DocumentPG.count();

    res.json({
      success: true,
      message: 'PostgreSQL connection successful',
      data: {
        connected: true,
        database: 'neondb',
        stats: {
          users: userCount,
          merchants: merchantCount,
          documents: documentCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PostgreSQL connection failed',
      error: error.message
    });
  }
});

// @desc    Test document upload simulation
// @route   GET /api/test/documents
// @access  Public
router.get('/documents', async (req, res) => {
  try {
    // Get all documents with merchant info
    const documents = await DocumentPG.findAll({
      include: [
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['id', 'businessName', 'email']
        }
      ],
      limit: 10
    });

    res.json({
      success: true,
      message: 'Documents retrieved successfully',
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents',
      error: error.message
    });
  }
});

module.exports = router;