/**
 * Restaurant Dashboard Routes — for role: restaurant_owner (and admin)
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOverview, getOrders, updateOrderStatus,
  getMenu, addMenuItem, updateMenuItem, deleteMenuItem,
  toggleOpenStatus, getAnalytics,
} = require('../controllers/restaurantDashboard.controller');

router.use(protect, authorize('restaurant_owner', 'admin'));

router.get('/:restaurantId/overview', getOverview);
router.get('/:restaurantId/analytics', getAnalytics);

router.get('/:restaurantId/orders', getOrders);
router.put('/:restaurantId/orders/:orderId/status', updateOrderStatus);

router.get('/:restaurantId/menu', getMenu);
router.post('/:restaurantId/menu', addMenuItem);
router.put('/:restaurantId/menu/:itemId', updateMenuItem);
router.delete('/:restaurantId/menu/:itemId', deleteMenuItem);

router.put('/:restaurantId/toggle-open', toggleOpenStatus);

module.exports = router;
