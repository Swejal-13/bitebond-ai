/**
 * User Model — Phase 2 updated with OTP + OAuth fields
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  fullAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: {
    type: String,
    enum: ['Parent', 'Sibling', 'Spouse', 'Friend', 'Child', 'Other'],
    default: 'Friend',
  },
  address: { type: String },
  city: { type: String },
  avatar: { type: String },
}, { _id: true, timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'admin', 'restaurant_owner'],
      default: 'user',
    },
    addresses: [addressSchema],
    contacts: [contactSchema],
    favoriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
    loyaltyPoints: { type: Number, default: 0 },

    // ─── Verification & Auth ──────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    verificationOtp: { type: String, select: false },
    verificationOtpExpiry: { type: Date, select: false },

    passwordResetOtp: { type: String, select: false },
    passwordResetOtpExpiry: { type: Date, select: false },

    // ─── OAuth ────────────────────────────────────────────────────────────
    googleId: { type: String, unique: true, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

    // ─── Misc ─────────────────────────────────────────────────────────────
    fcmToken: { type: String, default: '' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true },
      dietaryPreferences: [String],
    },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.addLoyaltyPoints = async function (points) {
  this.loyaltyPoints += points;
  await this.save();
};

userSchema.virtual('defaultAddress').get(function () {
  return this.addresses.find((a) => a.isDefault) || this.addresses[0] || null;
});

module.exports = mongoose.model('User', userSchema);
