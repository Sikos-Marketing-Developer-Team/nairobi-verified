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
      callbackURL: 'https://nairobi-cbd-backend.onrender.com/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile:', {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails
        });

        // Check if user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            password: process.env.JWT_SECRET + profile.id, // Generate a secure password
            phone: '', // Google doesn't provide phone number
            avatar: profile.photos[0]?.value || '',
            googleId: profile.id
          });
          console.log('Created new user from Google OAuth:', user.email);
        } else if (!user.googleId) {
          // If user exists but doesn't have googleId, update it
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value || '';
          await user.save();
          console.log('Updated existing user with Google ID:', user.email);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, { id: user.id, isMerchant: !!user.businessName });
});

// Deserialize user from the session
passport.deserializeUser(async (obj, done) => {
  try {
    console.log('Deserializing user:', obj);
    let user;
    if (obj.isMerchant) {
      user = await Merchant.findById(obj.id);
    } else {
      user = await User.findById(obj.id);
    }
    
    if (!user) {
      console.log('User not found during deserialization:', obj.id);
      return done(new Error('User not found'), null);
    }
    
    console.log('Successfully deserialized user:', user.email);
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});

module.exports = passport;