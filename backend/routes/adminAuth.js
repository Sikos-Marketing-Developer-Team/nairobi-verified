const express = require('express');
const {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
  updatePassword,
  updateProfile,
  getAdminActivityLog,
  updateAdminSettings
} = require('../controllers/adminAuth');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/me', protectAdmin, getCurrentAdmin);
router.post('/logout', protectAdmin, logoutAdmin);
router.put('/updatepassword', protectAdmin, updatePassword);
router.put('/updateprofile', protectAdmin, updateProfile);
router.get('/activity', protectAdmin, getAdminActivityLog);
router.put('/settings', protectAdmin, updateAdminSettings);

module.exports = router;