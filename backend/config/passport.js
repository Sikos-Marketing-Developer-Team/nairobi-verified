const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Merchant = require('../models/Merchant');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://nairobi-cbd-backend.onrender.com/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' '),
            email: profile.emails[0].value,
            password: process.env.JWT_SECRET + profile.id, // Generate a secure password
            phone: '', // Google doesn't provide phone number
            avatar: profile.photos[0].value,
            googleId: profile.id
          });
        } else if (!user.googleId) {
          // If user exists but doesn't have googleId, update it
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0].value;
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, { id: user.id, isMerchant: !!user.businessName });
});

// Deserialize user from the session
passport.deserializeUser(async (obj, done) => {
  try {
    let user;
    if (obj.isMerchant) {
      user = await Merchant.findById(obj.id);
    } else {
      user = await User.findById(obj.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;