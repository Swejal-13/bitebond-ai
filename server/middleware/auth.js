/**
 * Auth Middleware
 * JWT verification & role-based access control
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/response');

/**
 * protect - Verifies JWT and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json(
        createError('Access denied. No token provided.', 401)
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json(
        createError('User not found. Token is invalid.', 401)
      );
    }

    if (!user.isActive) {
      return res.status(403).json(
        createError('Your account has been deactivated. Contact support.', 403)
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(createError('Invalid token.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(createError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * authorize - Role-based access control
 * Usage: authorize('admin', 'restaurant_owner')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        createError(`Role '${req.user.role}' is not authorized for this action.`, 403)
      );
    }
    next();
  };
};

/**
 * optionalAuth - Attaches user if token is present, does not fail if missing
 * Useful for public routes that behave differently for logged-in users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
    next();
  } catch {
    // Token invalid or expired — continue without user
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
