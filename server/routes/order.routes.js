/**
 * Order Routes
 */
const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  placeOrder, getMyOrders, getOrderById,
  cancelOrder, rescheduleOrder, updateOrderStatus,
} = require('../controllers/order.controller');

router.use(protect); // all order routes require auth

router.route('/')
  .post(placeOrder)
  .get(getMyOrders);

router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/reschedule', rescheduleOrder);
router.put('/:id/status', authorize('admin', 'restaurant_owner'), updateOrderStatus);

module.exports = router;
