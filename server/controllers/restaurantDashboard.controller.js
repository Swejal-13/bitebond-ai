/**
 * Restaurant Dashboard Controller (for role: restaurant_owner)
 * Note: Restaurant model doesn't yet have an `owner` field tying it to a User —
 * for this MVP, restaurant_owner accounts manage via a restaurantId they're assigned
 * (stored on the user as `managedRestaurantId` would be ideal; for now we accept
 * restaurantId via route param and trust the role-based middleware. In production,
 * add an `owner` ref field to Restaurant and verify ownership per-request.)
 */

const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { createSuccess, createError, createPaginatedSuccess } = require('../utils/response');

// ─── GET /api/restaurant-dashboard/:restaurantId/overview ────────────────────
const getOverview = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId, '-menu').lean();
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    const [totalOrders, ordersToday, pendingOrders, revenueResult, avgRatingResult] = await Promise.all([
      Order.countDocuments({ restaurant: restaurantId }),
      Order.countDocuments({ restaurant: restaurantId, createdAt: { $gte: todayStart } }),
      Order.countDocuments({ restaurant: restaurantId, status: { $in: ['placed', 'accepted', 'preparing'] } }),
      Order.aggregate([
        { $match: { restaurant: restaurant._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { restaurant: restaurant._id, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    res.status(200).json(createSuccess('Overview fetched', {
      restaurant,
      stats: {
        totalOrders,
        ordersToday,
        pendingOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        revenueToday: avgRatingResult[0]?.total || 0,
        rating: restaurant.rating,
        ratingCount: restaurant.ratingCount,
      },
    }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurant-dashboard/:restaurantId/orders ──────────────────────
const getOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 15, status } = req.query;

    const filter = { restaurant: restaurantId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name phone').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, ...createPaginatedSuccess(orders, page, limit, total) });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/restaurant-dashboard/:restaurantId/orders/:orderId/status ──────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(createError(`Invalid status: ${status}`, 400));
    }

    const order = await Order.findOne({ _id: req.params.orderId, restaurant: req.params.restaurantId });
    if (!order) return res.status(404).json(createError('Order not found.', 404));

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    res.status(200).json(createSuccess('Order status updated', { order }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurant-dashboard/:restaurantId/menu ─────────────────────────
const getMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId, 'name menu').lean();
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));
    res.status(200).json(createSuccess('Menu fetched', { menu: restaurant.menu, restaurantName: restaurant.name }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/restaurant-dashboard/:restaurantId/menu ───────────────────────
const addMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, image, category, isVeg } = req.body;
    if (!name || !price) return res.status(400).json(createError('name and price are required.', 400));

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    restaurant.menu.push({ name, description, price, image, category, isVeg: !!isVeg });
    await restaurant.save();

    res.status(201).json(createSuccess('Menu item added', { menu: restaurant.menu }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/restaurant-dashboard/:restaurantId/menu/:itemId ────────────────
const updateMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    const item = restaurant.menu.id(req.params.itemId);
    if (!item) return res.status(404).json(createError('Menu item not found.', 404));

    const { name, description, price, image, category, isVeg, isAvailable } = req.body;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (isVeg !== undefined) item.isVeg = isVeg;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await restaurant.save();
    res.status(200).json(createSuccess('Menu item updated', { menu: restaurant.menu }));
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/restaurant-dashboard/:restaurantId/menu/:itemId ─────────────
const deleteMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    restaurant.menu = restaurant.menu.filter((item) => item._id.toString() !== req.params.itemId);
    await restaurant.save();

    res.status(200).json(createSuccess('Menu item removed', { menu: restaurant.menu }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/restaurant-dashboard/:restaurantId/toggle-open ─────────────────
const toggleOpenStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    res.status(200).json(createSuccess(`Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`, { restaurant }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurant-dashboard/:restaurantId/analytics ───────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const days = 14;
    const startDate = new Date(); startDate.setDate(startDate.getDate() - days + 1); startDate.setHours(0, 0, 0, 0);

    const [revenueTrend, topItems, statusBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json(createSuccess('Analytics fetched', { revenueTrend, topItems, statusBreakdown }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview, getOrders, updateOrderStatus,
  getMenu, addMenuItem, updateMenuItem, deleteMenuItem,
  toggleOpenStatus, getAnalytics,
};
