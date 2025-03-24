const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) =>{
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if(!user) {
                    user = await new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.username,
                    }).save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

module.exports = passport;