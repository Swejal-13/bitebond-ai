/**
 * Response Utility Helpers
 * Standardizes all API responses across the application
 */

/**
 * Success response
 * @param {string} message - Human-readable message
 * @param {*} data - Response payload
 * @param {number} statusCode - HTTP status code
 */
const createSuccess = (message, data = null, statusCode = 200) => ({
  success: true,
  message,
  ...(data !== null && { data }),
  statusCode,
});

/**
 * Error response
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Validation errors or extra context
 */
const createError = (message, statusCode = 500, errors = null) => ({
  success: false,
  message,
  statusCode,
  ...(errors && { errors }),
});

/**
 * Paginated response
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total count of items
 */
const createPaginatedSuccess = (data, page, limit, total) => ({
  success: true,
  data,
  pagination: {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

module.exports = { createSuccess, createError, createPaginatedSuccess };
