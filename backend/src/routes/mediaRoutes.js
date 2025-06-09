const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticate } = require('../middleware/auth');

// Upload image
router.post('/upload', authenticate, mediaController.upload.single('file'), mediaController.uploadImage);

// Delete image
router.delete('/:publicId', authenticate, mediaController.deleteImage);

// Get image
router.get('/:publicId', mediaController.getImage);

module.exports = router; 