const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      phone: '0000000000', // Default phone number, can be updated later
      password: Math.random().toString(36).slice(-8), // Random password for OAuth users
      userType: 'user',
      approvalStatus: 'approved',
      profileImage: profile.photos[0]?.value || '',
      isEmailVerified: true // Google emails are pre-verified
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name', 'picture.type(large)']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook ID
    let user = await User.findOne({ 
      $or: [
        { facebookId: profile.id },
        { email: profile.emails?.[0]?.value }
      ]
    });

    if (user) {
      // User exists, update Facebook ID if not set
      if (!user.facebookId) {
        user.facebookId = profile.id;
        await user.save();
      }
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      facebookId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
      phone: '0000000000', // Default phone number, can be updated later
      password: Math.random().toString(36).slice(-8), // Random password for OAuth users
      userType: 'user',
      approvalStatus: 'approved',
      profileImage: profile.photos?.[0]?.value || '',
      isEmailVerified: true // Facebook emails are pre-verified
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
