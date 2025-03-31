const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'));
    }
  }
});

// Upload merchant documents
const uploadDocuments = async (req, res) => {
  try {
    const { businessRegistration, taxCertificate, idDocument } = req.files;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'merchant') {
      return res.status(403).json({ message: 'Only merchants can upload documents' });
    }

    // Update document URLs
    if (businessRegistration) {
      user.documents.businessRegistration = {
        url: businessRegistration[0].path,
        uploadedAt: new Date()
      };
    }

    if (taxCertificate) {
      user.documents.taxCertificate = {
        url: taxCertificate[0].path,
        uploadedAt: new Date()
      };
    }

    if (idDocument) {
      user.documents.idDocument = {
        url: idDocument[0].path,
        uploadedAt: new Date()
      };
    }

    await user.save();

    res.status(200).json({
      message: 'Documents uploaded successfully',
      documents: user.documents
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error uploading documents' });
  }
};

// Get merchant profile
const getMerchantProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'merchant') {
      return res.status(403).json({ message: 'Only merchants can access this profile' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get merchant profile error:', error);
    res.status(500).json({ message: 'Error getting merchant profile' });
  }
};

// Update merchant profile
const updateMerchantProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { companyName, location, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'merchant') {
      return res.status(403).json({ message: 'Only merchants can update this profile' });
    }

    // Update fields
    if (companyName) user.companyName = companyName;
    if (location) user.location = location;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        location: user.location,
        phone: user.phone,
        isVerified: user.isVerified,
        documents: user.documents
      }
    });
  } catch (error) {
    console.error('Update merchant profile error:', error);
    res.status(500).json({ message: 'Error updating merchant profile' });
  }
};

module.exports = {
  upload,
  uploadDocuments,
  getMerchantProfile,
  updateMerchantProfile
}; 