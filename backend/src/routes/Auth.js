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