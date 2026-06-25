/**
 * Auth Controller — Phase 2
 * signup, login, verifyEmail, resendOtp,
 * forgotPassword, verifyResetOtp, resetPassword,
 * googleCallback, getMe, updateProfile, changePassword, logout
 */

const User = require('../models/User');
const { createSuccess, createError } = require('../utils/response');
const { generateOtp, verifyOtp } = require('../utils/otp');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../services/email.service');

// ─── Helper ───────────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ ...createSuccess(message, { user: userObj, token }) });
};

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json(createError('An account with this email already exists.', 409));
    }

    const { otp, hashedOtp, otpExpiry } = generateOtp();

    const user = await User.create({
      name,
      email,
      password,
      phone,
      verificationOtp: hashedOtp,
      verificationOtpExpiry: otpExpiry,
      isVerified: false,
    });

    // Send verification email (non-blocking — don't fail signup if email fails)
    try {
      await sendVerificationEmail(user, otp);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    const token = user.generateToken();
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json(
      createSuccess(
        'Account created! Please verify your email — check your inbox for the OTP.',
        { user: userObj, token, requiresVerification: true }
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/verify-email ──────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json(createError('OTP is required.', 400));

    const user = await User.findById(req.user._id).select(
      '+verificationOtp +verificationOtpExpiry'
    );

    if (user.isVerified) {
      return res.status(400).json(createError('Email is already verified.', 400));
    }

    if (!user.verificationOtp || !user.verificationOtpExpiry) {
      return res.status(400).json(createError('No OTP found. Please request a new one.', 400));
    }

    if (new Date() > user.verificationOtpExpiry) {
      return res.status(400).json(createError('OTP has expired. Please request a new one.', 400));
    }

    if (!verifyOtp(otp, user.verificationOtp)) {
      return res.status(400).json(createError('Invalid OTP. Please try again.', 400));
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    try { await sendWelcomeEmail(user); } catch {}

    res.status(200).json(createSuccess('Email verified successfully! Welcome to BiteBond ❤️'));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────
const resendOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+verificationOtpExpiry');

    if (user.isVerified) {
      return res.status(400).json(createError('Email is already verified.', 400));
    }

    // Throttle — don't resend if last OTP was sent < 1 min ago
    if (user.verificationOtpExpiry) {
      const sentAt = new Date(user.verificationOtpExpiry.getTime() - 10 * 60 * 1000);
      if (new Date() - sentAt < 60 * 1000) {
        return res.status(429).json(createError('Please wait 1 minute before requesting a new OTP.', 429));
      }
    }

    const { otp, hashedOtp, otpExpiry } = generateOtp();
    user.verificationOtp = hashedOtp;
    user.verificationOtpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, otp);

    res.status(200).json(createSuccess('OTP resent. Please check your email.'));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json(createError('Invalid email or password.', 401));
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json(
        createError('This account uses Google sign-in. Please log in with Google.', 400)
      );
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json(createError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return res.status(403).json(createError('Your account has been deactivated. Contact support.', 403));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const requiresVerification = !user.isVerified;
    const token = user.generateToken();
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json(
      createSuccess('Welcome back! ❤️', { user: userObj, token, requiresVerification })
    );
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json(createError('Email is required.', 400));

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json(
        createSuccess('If an account exists with that email, a reset OTP has been sent.')
      );
    }

    const { otp, hashedOtp, otpExpiry } = generateOtp();
    user.passwordResetOtp = hashedOtp;
    user.passwordResetOtpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, otp);
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr.message);
    }

    res.status(200).json(
      createSuccess('If an account exists with that email, a reset OTP has been sent.')
    );
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/verify-reset-otp ─────────────────────────────────────────
const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordResetOtp +passwordResetOtpExpiry'
    );

    if (!user || !user.passwordResetOtp) {
      return res.status(400).json(createError('Invalid or expired OTP.', 400));
    }

    if (new Date() > user.passwordResetOtpExpiry) {
      return res.status(400).json(createError('OTP has expired. Please request a new one.', 400));
    }

    if (!verifyOtp(otp, user.passwordResetOtp)) {
      return res.status(400).json(createError('Invalid OTP.', 400));
    }

    // Issue a short-lived reset token (5 min) to authorize the reset step
    const resetToken = user.generateToken();

    res.status(200).json(createSuccess('OTP verified.', { resetToken }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json(createError('Password must be at least 6 characters.', 400));
    }

    const user = await User.findById(req.user._id).select(
      '+passwordResetOtp +passwordResetOtpExpiry'
    );

    user.password = newPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpiry = undefined;
    await user.save();

    res.status(200).json(createSuccess('Password reset successfully. Please log in.'));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/auth/google/callback ───────────────────────────────────────────
const googleCallback = async (req, res) => {
  try {
    const user = req.user; // Set by Passport
    const token = user.generateToken();
    // Redirect to frontend with token in query (frontend stores it)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'favoriteRestaurants',
      'name image cuisine rating'
    );
    res.status(200).json(createSuccess('Profile fetched', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'preferences'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.file?.path) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.status(200).json(createSuccess('Profile updated', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json(createError('Both fields required.', 400));
    }
    if (newPassword.length < 6) {
      return res.status(400).json(createError('New password must be at least 6 characters.', 400));
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json(createError('Current password is incorrect.', 401));
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: '' });
    res.status(200).json(createSuccess('Logged out successfully.'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup, login, verifyEmail, resendOtp,
  forgotPassword, verifyResetOtp, resetPassword,
  googleCallback, getMe, updateProfile, changePassword, logout,
};
