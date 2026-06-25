/**
 * Restaurant Routes
 * GET  /api/restaurants
 * GET  /api/restaurants/search
 * GET  /api/restaurants/cuisines
 * GET  /api/restaurants/:id
 * GET  /api/restaurants/:id/menu
 * POST /api/restaurants/seed   (admin only)
 */

const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getCuisines,
  seedRestaurants,
} = require('../controllers/restaurant.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRestaurants);
router.get('/search', searchRestaurants);
router.get('/cuisines', getCuisines);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

// Admin-only seed route
router.post('/seed', protect, authorize('admin'), seedRestaurants);

module.exports = router;
