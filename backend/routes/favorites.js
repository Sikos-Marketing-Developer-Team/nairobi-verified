const express = require('express');
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favorites');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getFavorites);

router.route('/:merchantId')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite);

module.exports = router;