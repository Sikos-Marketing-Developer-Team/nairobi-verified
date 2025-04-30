const User = require('../models/User');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
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

    user.documents = {
      businessRegistration: businessRegistration ? { 
        url: `/Uploads/${businessRegistration[0].filename}`, 
        uploadedAt: new Date(),
        status: 'pending'
      } : user.documents?.businessRegistration,
      taxCertificate: taxCertificate ? { 
        url: `/Uploads/${taxCertificate[0].filename}`, 
        uploadedAt: new Date(),
        status: 'pending'
      } : user.documents?.taxCertificate,
      idDocument: idDocument ? { 
        url: `/Uploads/${idDocument[0].filename}`, 
        uploadedAt: new Date(),
        status: 'pending'
      } : user.documents?.idDocument
    };
    await user.save();

    res.json({ message: 'Documents uploaded successfully, pending verification' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
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