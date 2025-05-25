const User = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const { uploadImage } = require('../config/cloudinary');

// Configure multer for temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadDocuments = async (req, res) => {
  try {
    const { businessRegistration, taxCertificate, idDocument } = req.files;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Upload documents to Cloudinary
    const documents = { ...user.documents };

    // Upload business registration if provided
    if (businessRegistration) {
      try {
        const result = await uploadImage(businessRegistration[0].path, 'nairobi-verified/documents/business');
        documents.businessRegistration = { 
          url: result.secure_url,
          publicId: result.public_id,
          uploadedAt: new Date(),
          status: 'pending'
        };
        
        // Clean up temp file
        if (fs.existsSync(businessRegistration[0].path)) {
          fs.unlinkSync(businessRegistration[0].path);
        }
      } catch (uploadError) {
        console.error('Error uploading business registration:', uploadError);
        return res.status(500).json({ message: 'Error uploading business registration document' });
      }
    }

    // Upload tax certificate if provided
    if (taxCertificate) {
      try {
        const result = await uploadImage(taxCertificate[0].path, 'nairobi-verified/documents/tax');
        documents.taxCertificate = { 
          url: result.secure_url,
          publicId: result.public_id,
          uploadedAt: new Date(),
          status: 'pending'
        };
        
        // Clean up temp file
        if (fs.existsSync(taxCertificate[0].path)) {
          fs.unlinkSync(taxCertificate[0].path);
        }
      } catch (uploadError) {
        console.error('Error uploading tax certificate:', uploadError);
        return res.status(500).json({ message: 'Error uploading tax certificate document' });
      }
    }

    // Upload ID document if provided
    if (idDocument) {
      try {
        const result = await uploadImage(idDocument[0].path, 'nairobi-verified/documents/id');
        documents.idDocument = { 
          url: result.secure_url,
          publicId: result.public_id,
          uploadedAt: new Date(),
          status: 'pending'
        };
        
        // Clean up temp file
        if (fs.existsSync(idDocument[0].path)) {
          fs.unlinkSync(idDocument[0].path);
        }
      } catch (uploadError) {
        console.error('Error uploading ID document:', uploadError);
        return res.status(500).json({ message: 'Error uploading ID document' });
      }
    }

    user.documents = documents;
    await user.save();

    res.json({ 
      success: true,
      message: 'Documents uploaded successfully, pending verification',
      documents: user.documents
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

const getMerchantProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ profile: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateMerchantProfile = async (req, res) => {
  try {
    const { companyName, location, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.companyName = companyName || user.companyName;
    user.location = location || user.location;
    user.phone = phone || user.phone;
    await user.save();

    res.json({ message: 'Profile updated successfully', profile: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = {
  upload,
  uploadDocuments,
  getMerchantProfile,
  updateMerchantProfile
};