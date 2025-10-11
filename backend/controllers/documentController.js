const documentService = require('../services/documentService');
const asyncHandler = require('express-async-handler');

// @desc    Upload document for merchant
// @route   POST /api/merchants/:merchantId/documents
// @access  Private
const uploadDocument = asyncHandler(async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { documentType, documentName } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const documentData = {
      documentType,
      documentName: documentName || documentType.replace('_', ' ').toUpperCase()
    };

    const document = await documentService.uploadDocument(
      merchantId,
      documentData,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get documents for a merchant
// @route   GET /api/merchants/:merchantId/documents
// @access  Private
const getMerchantDocuments = asyncHandler(async (req, res) => {
  try {
    const { merchantId } = req.params;
    const documents = await documentService.getMerchantDocuments(merchantId);

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all documents (admin)
// @route   GET /api/admin/documents
// @access  Private (Admin)
const getAllDocuments = asyncHandler(async (req, res) => {
  try {
    const { status, documentType } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (documentType) filters.documentType = documentType;

    const documents = await documentService.getAllDocuments(filters);

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id);

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Review document (approve/reject)
// @route   PUT /api/admin/documents/:id/review
// @access  Private (Admin)
const reviewDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id; // Assuming admin ID is in req.user

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const document = await documentService.reviewDocument(id, adminId, status, adminNotes);

    res.json({
      success: true,
      message: `Document ${status} successfully`,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    View/Download document
// @route   GET /api/documents/:id/view
// @access  Private
const viewDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { download } = req.query;

    const fileData = await documentService.viewDocument(id);

    if (download === 'true') {
      // Force download
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    } else {
      // View inline
      res.setHeader('Content-Disposition', `inline; filename="${fileData.filename}"`);
    }

    res.setHeader('Content-Type', fileData.mimetype);
    res.setHeader('Content-Length', fileData.fileData.length);
    
    res.send(fileData.fileData);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const result = await documentService.deleteDocument(id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get document statistics
// @route   GET /api/admin/documents/stats
// @access  Private (Admin)
const getDocumentStats = asyncHandler(async (req, res) => {
  try {
    const stats = await documentService.getDocumentStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = {
  uploadDocument,
  getMerchantDocuments,
  getAllDocuments,
  getDocumentById,
  reviewDocument,
  viewDocument,
  deleteDocument,
  getDocumentStats
};