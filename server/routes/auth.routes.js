/**
 * Auth Routes — Phase 2
 */

const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const router = express.Router();

const {
  signup, login, verifyEmail, resendOtp,
  forgotPassword, verifyResetOtp, resetPassword,
  googleCallback, getMe, updateProfile, changePassword, logout,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinary');
const validate = require('../middleware/validate');
require('../config/passport'); // Initialize passport strategies

// ─── Validation rules ─────────────────────────────────────────────────────────
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
];

const loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotRules = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
];

const resetRules = [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ─── Public routes ────────────────────────────────────────────────────────────
router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/forgot-password', forgotRules, validate, forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-otp', protect, resendOtp);
router.post('/reset-password', protect, resetRules, validate, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback
);

module.exports = router;
