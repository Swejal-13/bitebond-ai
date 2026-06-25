/**
 * Admin Routes — all require role 'admin'
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOverview, getUsers, updateUser,
  getAllOrders, getAllRestaurants, updateRestaurant,
  getRevenueTrend, getAnalytics,
} = require('../controllers/admin.controller');

router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/revenue', getRevenueTrend);
router.get('/analytics', getAnalytics);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);

router.get('/orders', getAllOrders);

router.get('/restaurants', getAllRestaurants);
router.put('/restaurants/:id', updateRestaurant);

module.exports = router;
