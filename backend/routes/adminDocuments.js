const express = require('express');
const router = express.Router();
const {
  getAllDocuments,
  getDocumentById,
  reviewDocument,
  viewDocument,
  deleteDocument,
  getDocumentStats
} = require('../controllers/documentController');

// Admin Document Management Routes
// These routes should be protected with admin authentication middleware

// @desc    Get all documents for admin review
// @route   GET /api/admin/dashboard/documents
// @access  Private (Admin)
router.get('/documents', async (req, res) => {
  try {
    const { 
      status = '', 
      documentType = '', 
      page = 1, 
      limit = 20,
      merchantName = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (documentType) filters.documentType = documentType;

    const { DocumentPG, MerchantPG, AdminUserPG } = require('../models/indexPG');
    
    // Build where clause for merchant search
    const merchantWhere = {};
    if (merchantName) {
      merchantWhere.businessName = {
        [require('sequelize').Op.iLike]: `%${merchantName}%`
      };
    }

    const documents = await DocumentPG.findAndCountAll({
      where: { 
        isActive: true,
        ...filters 
      },
      include: [
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: ['id', 'businessName', 'ownerName', 'email', 'phone'],
          where: Object.keys(merchantWhere).length > 0 ? merchantWhere : undefined
        },
        {
          model: AdminUserPG,
          as: 'reviewer',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });

    res.json({
      success: true,
      data: {
        documents: documents.rows.map(doc => ({
          id: doc.id,
          documentType: doc.documentType,
          documentName: doc.documentName,
          originalFilename: doc.originalFilename,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          status: doc.status,
          adminNotes: doc.adminNotes,
          createdAt: doc.created_at,
          reviewedAt: doc.reviewedAt,
          merchant: {
            id: doc.merchant.id,
            businessName: doc.merchant.businessName,
            ownerName: doc.merchant.ownerName,
            email: doc.merchant.email
          },
          reviewer: doc.reviewer ? {
            id: doc.reviewer.id,
            username: doc.reviewer.username
          } : null
        })),
        pagination: {
          total: documents.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(documents.count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get document statistics for dashboard
// @route   GET /api/admin/dashboard/documents/stats
// @access  Private (Admin)
router.get('/documents/stats', async (req, res) => {
  try {
    const { DocumentPG } = require('../models/indexPG');
    
    // Get status statistics
    const statusStats = await DocumentPG.findAll({
      attributes: [
        'status',
        [DocumentPG.sequelize.fn('COUNT', DocumentPG.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['status'],
      raw: true
    });

    // Get document type statistics
    const typeStats = await DocumentPG.findAll({
      attributes: [
        'documentType',
        [DocumentPG.sequelize.fn('COUNT', DocumentPG.sequelize.col('id')), 'count']
      ],
      where: { isActive: true },
      group: ['documentType'],
      raw: true
    });

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploads = await DocumentPG.count({
      where: {
        isActive: true,
        created_at: {
          [require('sequelize').Op.gte]: sevenDaysAgo
        }
      }
    });

    // Get pending reviews count
    const pendingReviews = await DocumentPG.count({
      where: {
        isActive: true,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: {
        statusBreakdown: statusStats.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        typeBreakdown: typeStats.reduce((acc, item) => {
          acc[item.documentType] = parseInt(item.count);
          return acc;
        }, {}),
        recentUploads,
        pendingReviews,
        totalDocuments: statusStats.reduce((sum, item) => sum + parseInt(item.count), 0)
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Review document (approve/reject)
// @route   PUT /api/admin/dashboard/documents/:id/review
// @access  Private (Admin)
router.put('/documents/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes = '' } = req.body;
    const adminId = req.user?.id || req.body.adminId; // From auth middleware or manual

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    const { DocumentPG } = require('../models/indexPG');
    
    const document = await DocumentPG.findByPk(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    await document.update({
      status,
      adminNotes,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    res.json({
      success: true,
      message: `Document ${status} successfully`,
      data: {
        id: document.id,
        status: document.status,
        adminNotes: document.adminNotes,
        reviewedAt: document.reviewedAt
      }
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get document details with full information
// @route   GET /api/admin/dashboard/documents/:id
// @access  Private (Admin)
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { DocumentPG, MerchantPG, AdminUserPG } = require('../models/indexPG');
    
    const document = await DocumentPG.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: MerchantPG,
          as: 'merchant',
          attributes: [
            'id', 'businessName', 'ownerName', 'email', 'phone',
            'businessAddress', 'businessDescription', 'businessCategory',
            'verificationStatus', 'status'
          ]
        },
        {
          model: AdminUserPG,
          as: 'reviewer',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: document.id,
        documentType: document.documentType,
        documentName: document.documentName,
        originalFilename: document.originalFilename,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        status: document.status,
        adminNotes: document.adminNotes,
        createdAt: document.created_at,
        reviewedAt: document.reviewedAt,
        metadata: document.metadata,
        merchant: {
          id: document.merchant.id,
          businessName: document.merchant.businessName,
          ownerName: document.merchant.ownerName,
          email: document.merchant.email,
          phone: document.merchant.phone,
          businessAddress: document.merchant.businessAddress,
          businessDescription: document.merchant.businessDescription,
          businessCategory: document.merchant.businessCategory,
          verificationStatus: document.merchant.verificationStatus,
          status: document.merchant.status
        },
        reviewer: document.reviewer ? {
          id: document.reviewer.id,
          username: document.reviewer.username,
          email: document.reviewer.email
        } : null,
        viewUrl: `/api/documents/${document.id}/view`,
        downloadUrl: `/api/documents/${document.id}/view?download=true`
      }
    });
  } catch (error) {
    console.error('Get document details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Bulk review documents
// @route   POST /api/admin/dashboard/documents/bulk-review
// @access  Private (Admin)
router.post('/documents/bulk-review', async (req, res) => {
  try {
    const { documentIds, status, adminNotes = '' } = req.body;
    const adminId = req.user?.id || req.body.adminId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document IDs array is required'
      });
    }

    const { DocumentPG } = require('../models/indexPG');
    
    const updated = await DocumentPG.update({
      status,
      adminNotes,
      reviewedBy: adminId,
      reviewedAt: new Date()
    }, {
      where: {
        id: documentIds,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: `${updated[0]} documents ${status} successfully`,
      data: {
        updatedCount: updated[0],
        status,
        adminNotes
      }
    });
  } catch (error) {
    console.error('Bulk review documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;