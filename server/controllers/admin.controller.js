/**
 * Admin Controller — KPIs, user/order/restaurant management, revenue & analytics
 */

const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { createSuccess, createError, createPaginatedSuccess } = require('../utils/response');

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
const getOverview = async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers, newUsersToday,
      totalOrders, ordersToday,
      totalRestaurants, activeRestaurants,
      revenueResult, monthRevenueResult,
      pendingOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: { $in: ['placed', 'accepted', 'preparing'] } }),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const monthRevenue = monthRevenueResult[0]?.total || 0;

    res.status(200).json(createSuccess('Overview fetched', {
      users:       { total: totalUsers, newToday: newUsersToday },
      orders:      { total: totalOrders, today: ordersToday, pending: pendingOrders },
      restaurants: { total: totalRestaurants, active: activeRestaurants },
      revenue:     { total: totalRevenue, thisMonth: monthRevenue },
    }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search = '', role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter, '-password -verificationOtp -passwordResetOtp')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, ...createPaginatedSuccess(users, page, limit, total) });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────────
const updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .select('-password');
    if (!user) return res.status(404).json(createError('User not found.', 404));

    res.status(200).json(createSuccess('User updated', { user }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/orders ────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, orderType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, ...createPaginatedSuccess(orders, page, limit, total) });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/restaurants ───────────────────────────────────────────────
const getAllRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, search = '' } = req.query;
    const filter = search ? { name: new RegExp(search, 'i') } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter, '-menu').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Restaurant.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, ...createPaginatedSuccess(restaurants, page, limit, total) });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/admin/restaurants/:id ───────────────────────────────────────────
const updateRestaurant = async (req, res, next) => {
  try {
    const { isActive, isFeatured } = req.body;
    const updates = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (typeof isFeatured === 'boolean') updates.isFeatured = isFeatured;

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-menu');
    if (!restaurant) return res.status(404).json(createError('Restaurant not found.', 404));

    res.status(200).json(createSuccess('Restaurant updated', { restaurant }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/revenue ────────────────────────────────────────────────────
const getRevenueTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const trend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendMap = new Map(trend.map((t) => [t._id, t]));
    const filled = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const entry = trendMap.get(key);
      filled.push({ date: key, revenue: entry?.revenue || 0, orders: entry?.orders || 0 });
    }

    res.status(200).json(createSuccess('Revenue trend fetched', { trend: filled }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/admin/analytics ──────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const [orderTypeBreakdown, topRestaurants, statusBreakdown, occasionBreakdown] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$orderType', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { restaurant: { $ne: null } } },
        { $group: { _id: '$restaurant', orderCount: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { orderCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
        { $unwind: '$restaurant' },
        { $project: { name: '$restaurant.name', orderCount: 1, revenue: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { occasion: { $ne: 'none' } } },
        { $group: { _id: '$occasion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json(createSuccess('Analytics fetched', {
      orderTypeBreakdown, topRestaurants, statusBreakdown, occasionBreakdown,
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview, getUsers, updateUser,
  getAllOrders, getAllRestaurants, updateRestaurant,
  getRevenueTrend, getAnalytics,
};
