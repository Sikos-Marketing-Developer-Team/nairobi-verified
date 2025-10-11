const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { UserPG, MerchantPG } = require('../models/indexPG');
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
        const merchant = await MerchantPG.findOne({ where: { email: profile.emails[0].value } });
        if (merchant) {
          if (!merchant.verified) {
            console.log('Unverified merchant attempted Google Sign-In:', merchant.id);
            return done(null, false, { message: 'Merchant account is not verified. Please complete registration.' });
          }
          // Verified merchant: update googleId and avatar if needed
          if (!merchant.googleId) {
            merchant.googleId = profile.id;
            merchant.logo = merchant.logo || profile.photos[0]?.value || '';
            await merchant.save();
            console.log('Updated verified merchant with Google ID:', merchant.id);
          }
          return done(null, merchant);
        }

        // Check for existing user or create new user
        let user = await UserPG.findOne({ where: { email: profile.emails[0].value } });
        if (!user) {
          user = await UserPG.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            password: crypto.randomBytes(16).toString('hex'), // Secure random password
            phone: '',
            profilePicture: profile.photos[0]?.value || '',
            googleId: profile.id
          });
          console.log('Created new user from Google OAuth:', user.id);
        } else if (!user.googleId) {
          // Existing user: update googleId and avatar
          user.googleId = profile.id;
          user.profilePicture = user.profilePicture || profile.photos[0]?.value || '';
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

// Serialize user into the session - use id for PostgreSQL
passport.serializeUser((user, done) => {
  const userId = user.id; // PostgreSQL uses id
  const isMerchant = !!user.businessName; // Merchants have businessName field
  
  console.log('🔐 Serializing user:', {
    id: userId,
    isMerchant,
    email: user.email
  });
  
  done(null, { id: String(userId), isMerchant });
});

// Deserialize user from the session
passport.deserializeUser(async (obj, done) => {
  try {
    console.log('🔓 Deserializing user:', obj);
    
    let user;
    if (obj.isMerchant) {
      user = await MerchantPG.findByPk(obj.id, {
        attributes: { exclude: ['password'] }
      });
      console.log('📦 Found merchant:', user ? user.id : 'NOT FOUND');
    } else {
      user = await UserPG.findByPk(obj.id, {
        attributes: { exclude: ['password'] }
      });
      console.log('👤 Found user:', user ? user.id : 'NOT FOUND');
    }

    if (!user) {
      console.error('❌ User not found during deserialization:', obj.id);
      return done(null, false);
    }

    console.log('✅ Successfully deserialized:', {
      id: user.id,
      email: user.email,
      isMerchant: obj.isMerchant
    });
    
    done(null, user);
  } catch (error) {
    console.error('❌ Deserialization error:', error.message);
    done(error, null);
  }
});

module.exports = passport;