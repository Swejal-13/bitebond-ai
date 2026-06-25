/**
 * OTP Utility
 * Generate secure 6-digit OTPs, hash for storage, verify against hash
 */

const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {{ otp: string, hashedOtp: string, otpExpiry: Date }}
 */
const generateOtp = () => {
  // Generate 6-digit OTP using crypto for better randomness
  const otp = crypto.randomInt(100000, 999999).toString();

  // Hash for safe DB storage (SHA-256 — OTPs are short-lived, SHA-256 is fine)
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // Expires in 10 minutes
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  return { otp, hashedOtp, otpExpiry };
};

/**
 * Verify a plain OTP against a stored hash
 * @param {string} plainOtp - OTP entered by user
 * @param {string} hashedOtp - Stored hash from DB
 * @returns {boolean}
 */
const verifyOtp = (plainOtp, hashedOtp) => {
  const hash = crypto.createHash('sha256').update(plainOtp).digest('hex');
  return hash === hashedOtp;
};

module.exports = { generateOtp, verifyOtp };
