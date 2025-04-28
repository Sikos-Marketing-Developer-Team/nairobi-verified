const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './src/.env' }); // Fix path from '../.env'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://nairobi-verified-backend.onrender.com/api/auth/google/callback', // Match frontend redirect
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ 'google.id': profile.id });
        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            fullName: profile.displayName || 'Unknown', // Fallback for fullName
            google: {
              id: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0]?.value,
            },
            isEmailVerified: true, // Google users are pre-verified
            role: 'client', // Default role
          });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        user.token = token; // Attach token for callback
        done(null, user);
      } catch (err) {
        console.error('Passport Google error:', err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;