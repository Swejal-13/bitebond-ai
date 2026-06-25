/**
 * Passport Configuration — Google OAuth 2.0
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const googleId = profile.id;

        // 1. Already linked via googleId
        let user = await User.findOne({ googleId });
        if (user) {
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 2. Existing account with same email — link Google to it
        user = await User.findOne({ email });
        if (user) {
          user.googleId = googleId;
          user.authProvider = 'google';
          user.isVerified = true;
          if (!user.avatar && avatar) user.avatar = avatar;
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 3. Brand new user via Google
        user = await User.create({
          name,
          email,
          avatar,
          googleId,
          authProvider: 'google',
          isVerified: true, // Google accounts are pre-verified
          lastLogin: new Date(),
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Minimal serialization — we use JWT, not sessions
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
