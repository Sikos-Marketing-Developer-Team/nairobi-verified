const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const crypto = require('crypto');

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('⚠️ Missing Google OAuth environment variables');
}

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google Strategy: Processing OAuth for', profile.emails[0].value);
        
        // Check for existing merchant
        const merchant = await Merchant.findOne({ email: profile.emails[0].value });
        if (merchant) {
          if (!merchant.verified) {
            console.log('⚠️ Unverified merchant attempted Google Sign-In:', merchant._id);
            return done(null, false, { message: 'Merchant account is not verified. Please complete registration.' });
          }
          // Verified merchant: update googleId and avatar if needed
          if (!merchant.googleId) {
            merchant.googleId = profile.id;
            merchant.logo = merchant.logo || profile.photos[0]?.value || '';
            await merchant.save({ validateBeforeSave: false });
            console.log('✅ Updated verified merchant with Google ID:', merchant._id);
          }
          return done(null, merchant);
        }

        // Check for existing user or create new user
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          console.log('🆕 Creating new user from Google Strategy');
          
          const randomPassword = 
            'Google' +
            'oauth' +  
            Math.random().toString(36).substring(2, 10) +
            '@' +
            Date.now().toString().substring(8);
          
          user = await User.create({
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            email: profile.emails[0].value,
            password: randomPassword,
            phone: '',
            profilePicture: profile.photos[0]?.value || '',
            googleId: profile.id,
            isVerified: true
          });
          console.log('✅ Created new user from Google OAuth:', user._id);
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.profilePicture = user.profilePicture || profile.photos[0]?.value || '';
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          console.log('✅ Updated existing user with Google ID:', user._id);
        }

        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth Strategy Error:', error.message);
        return done(error, null);
      }
    }
  )
);

// ✅ CRITICAL FIX: Serialize user - store type information
passport.serializeUser((user, done) => {
  const userId = user._id || user.id;
  
  // Determine if merchant by checking multiple signals
  const isMerchant = user.constructor.modelName === 'Merchant' || 
                     user.collection?.collectionName === 'merchants' ||
                     !!user.businessName;
  
  const role = isMerchant ? 'merchant' : (user.role || 'user');
  
  console.log('🔐 Serializing user:', {
    id: String(userId),
    isMerchant,
    role,
    email: user.email,
    modelName: user.constructor?.modelName
  });
  
  done(null, { 
    id: String(userId), 
    isMerchant,
    role,
    email: user.email
  });
});

// ✅ CRITICAL FIX: Deserialize user - properly attach role
passport.deserializeUser(async (sessionData, done) => {
  try {
    console.log('🔓 Deserializing user:', sessionData);
    
    let user;
    
    if (sessionData.isMerchant) {
      // Fetch merchant
      user = await Merchant.findById(sessionData.id).select('-password');
      
      if (user) {
        // ✅ CRITICAL FIX: Convert to plain object and add role
        const merchantObj = user.toObject ? user.toObject() : user;
        merchantObj.role = 'merchant';
        merchantObj.isMerchant = true;
        
        console.log('📦 Found merchant:', {
          id: merchantObj._id,
          email: merchantObj.email,
          businessName: merchantObj.businessName,
          role: merchantObj.role
        });
        
        return done(null, merchantObj);
      }
    } else {
      // Fetch user
      user = await User.findById(sessionData.id).select('-password');
      
      if (user) {
        // ✅ CRITICAL FIX: Convert to plain object and ensure role
        const userObj = user.toObject ? user.toObject() : user;
        userObj.role = userObj.role || sessionData.role || 'user';
        userObj.isMerchant = false;
        
        console.log('👤 Found user:', {
          id: userObj._id,
          email: userObj.email,
          name: `${userObj.firstName} ${userObj.lastName}`,
          role: userObj.role
        });
        
        return done(null, userObj);
      }
    }

    if (!user) {
      console.error('❌ No user/merchant found for session:', sessionData);
      return done(null, false);
    }
  } catch (error) {
    console.error('❌ Deserialization error:', error.message);
    done(error, null);
  }
});

module.exports = passport;