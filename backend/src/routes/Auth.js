const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
require('dotenv').config();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: true }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

router.get('/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
      id: req.user._id,
      email: req.user.email,
      displayName: req.user.displayName,
      photo: req.user.photo,
    });
  });