const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const crypto = require('crypto');

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing Google OAuth environment variables');
  process.exit(1);
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check for existing merchant
        const merchant = await Merchant.findOne({ where: { email: profile.emails[0].value } });
        if (merchant) {
          if (!merchant.isVerified) {
            console.log('Unverified merchant attempted Google Sign-In:', merchant.id);
            return done(null, false, { message: 'Merchant account is not verified. Please complete registration.' });
          }
          // Verified merchant: update googleId and avatar if needed
          if (!merchant.googleId) {
            merchant.googleId = profile.id;
            merchant.avatar = merchant.avatar || profile.photos[0]?.value || '';
            await merchant.save();
            console.log('Updated verified merchant with Google ID:', merchant.id);
          }
          return done(null, merchant);
        }

        // Check for existing user or create new user
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            password: crypto.randomBytes(16).toString('hex'), // Secure random password
            phone: '',
            avatar: profile.photos[0]?.value || '',
            googleId: profile.id,
            isMerchant: false
          });
          console.log('Created new user from Google OAuth:', user.id);
        } else if (!user.googleId) {
          // Existing user: update googleId and avatar
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value || '';
          await user.save();
          console.log('Updated existing user with Google ID:', user.id);
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Strategy Error:', error.message);
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, { id: user.id, isMerchant: user.isMerchant || !!user.isVerified });
});

// Deserialize user from the session
passport.deserializeUser(async (obj, done) => {
  try {
    console.log('Deserializing user:', obj);
    let user;
    if (obj.isMerchant) {
      user = await Merchant.findByPk(obj.id);
    } else {
      user = await User.findByPk(obj.id);
    }

    if (!user) {
      console.log('User not found during deserialization:', obj.id);
      return done(null, false);
    }

    console.log('Successfully deserialized user:', user.id);
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error.message);
    done(error, null);
  }
});

module.exports = passport;