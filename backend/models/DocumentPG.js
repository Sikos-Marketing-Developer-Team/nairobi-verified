const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const DocumentPG = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  merchantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'merchant_id',
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'document_type'
  },
  documentName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'document_name'
  },
  originalFilename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_filename'
  },
  filePath: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_path'
  },
  fileSize: {
    type: DataTypes.BIGINT,
    field: 'file_size'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    field: 'mime_type'
  },
  fileData: {
    type: DataTypes.BLOB,
    field: 'file_data'
  },
  fileUrl: {
    type: DataTypes.TEXT,
    field: 'file_url'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    field: 'admin_notes'
  },
  uploadedBy: {
    type: DataTypes.UUID,
    field: 'uploaded_by',
    references: {
      model: 'merchants',
      key: 'id'
    }
  },
  reviewedBy: {
    type: DataTypes.UUID,
    field: 'reviewed_by',
    references: {
      model: 'admin_users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  metadata: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DocumentPG;