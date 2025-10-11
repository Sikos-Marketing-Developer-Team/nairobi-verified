const { DocumentPG, MerchantPG, AdminUserPG } = require('../models/indexPG');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

class DocumentService {
  constructor() {
    // Configure multer for file uploads
    this.upload = multer({
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow only PDF, images, and common document formats
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'), false);
        }
      }
    });
  }

  // Upload document for merchant
  async uploadDocument(merchantId, documentData, fileBuffer, originalFilename, mimetype) {
    try {
      const { documentType, documentName } = documentData;
      
      // Validate merchant exists
      const merchant = await MerchantPG.findByPk(merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../uploads/documents');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(originalFilename);
      const fileName = `${merchantId}_${documentType}_${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Save file to disk
      await fs.writeFile(filePath, fileBuffer);

      // Create document record
      const document = await DocumentPG.create({
        merchantId,
        documentType,
        documentName,
        originalFilename,
        filePath: `/uploads/documents/${fileName}`,
        fileSize: fileBuffer.length,
        mimeType: mimetype,
        fileData: fileBuffer, // Store in database as well
        status: 'pending',
        uploadedBy: merchantId,
        isActive: true,
        metadata: {
          uploadedAt: new Date(),
          userAgent: 'API Upload'
        }
      });

      return document;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  // Get documents for a merchant
  async getMerchantDocuments(merchantId) {
    try {
      const documents = await DocumentPG.findAll({
        where: {
          merchantId,
          isActive: true
        },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: MerchantPG,
            as: 'merchant',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: AdminUserPG,
            as: 'reviewer',
            attributes: ['id', 'username', 'email'],
            required: false
          }
        ]
      });

      return documents;
    } catch (error) {
      throw new Error(`Failed to fetch merchant documents: ${error.message}`);
    }
  }

  // Get all documents for admin review
  async getAllDocuments(filters = {}) {
    try {
      const where = { isActive: true };
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.documentType) {
        where.documentType = filters.documentType;
      }

      const documents = await DocumentPG.findAll({
        where,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: MerchantPG,
            as: 'merchant',
            attributes: ['id', 'businessName', 'ownerName', 'email', 'phone']
          },
          {
            model: AdminUserPG,
            as: 'reviewer',
            attributes: ['id', 'username', 'email'],
            required: false
          }
        ]
      });

      return documents;
    } catch (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

  // Get document by ID
  async getDocumentById(documentId) {
    try {
      const document = await DocumentPG.findOne({
        where: {
          id: documentId,
          isActive: true
        },
        include: [
          {
            model: MerchantPG,
            as: 'merchant',
            attributes: ['id', 'businessName', 'ownerName', 'email', 'phone']
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
        throw new Error('Document not found');
      }

      return document;
    } catch (error) {
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }

  // Review document (approve/reject)
  async reviewDocument(documentId, adminId, status, adminNotes = '') {
    try {
      const document = await DocumentPG.findByPk(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Validate admin exists
      const admin = await AdminUserPG.findByPk(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Update document
      await document.update({
        status,
        adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date()
      });

      return document;
    } catch (error) {
      throw new Error(`Failed to review document: ${error.message}`);
    }
  }

  // Download document
  async downloadDocument(documentId) {
    try {
      const document = await DocumentPG.findByPk(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Return file data from database
      return {
        fileData: document.fileData,
        filename: document.originalFilename,
        mimetype: document.mimeType
      };
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  // Get document file for viewing
  async viewDocument(documentId) {
    try {
      const document = await DocumentPG.findByPk(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Check if file exists on disk
      const fullPath = path.join(__dirname, '..', document.filePath);
      try {
        await fs.access(fullPath);
        // File exists on disk, read it
        const fileData = await fs.readFile(fullPath);
        return {
          fileData,
          filename: document.originalFilename,
          mimetype: document.mimeType
        };
      } catch (fileError) {
        // File doesn't exist on disk, use database data
        if (document.fileData) {
          return {
            fileData: document.fileData,
            filename: document.originalFilename,
            mimetype: document.mimeType
          };
        } else {
          throw new Error('Document file not found');
        }
      }
    } catch (error) {
      throw new Error(`Failed to view document: ${error.message}`);
    }
  }

  // Delete document
  async deleteDocument(documentId) {
    try {
      const document = await DocumentPG.findByPk(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Soft delete - mark as inactive
      await document.update({ isActive: false });

      return { message: 'Document deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // Get document statistics
  async getDocumentStats() {
    try {
      const stats = await DocumentPG.findAll({
        attributes: [
          'status',
          [DocumentPG.sequelize.fn('COUNT', DocumentPG.sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['status'],
        raw: true
      });

      const typeStats = await DocumentPG.findAll({
        attributes: [
          'documentType',
          [DocumentPG.sequelize.fn('COUNT', DocumentPG.sequelize.col('id')), 'count']
        ],
        where: { isActive: true },
        group: ['documentType'],
        raw: true
      });

      return {
        byStatus: stats,
        byType: typeStats
      };
    } catch (error) {
      throw new Error(`Failed to get document statistics: ${error.message}`);
    }
  }
}

module.exports = new DocumentService();