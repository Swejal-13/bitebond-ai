/**
 * Order Controller — Phase 6: supports food, gift, and combo (remote celebration) orders
 */

const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Gift = require('../models/Gift');
const User = require('../models/User');
const { createSuccess, createError, createPaginatedSuccess } = require('../utils/response');

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Unified endpoint: handles food-only, gift-only, and combo orders
const placeOrder = async (req, res, next) => {
  try {
    const {
      orderType = 'food',          // 'food' | 'gift' | 'combo'
      restaurantId,
      items = [],                  // food items
      giftItems = [],              // gift items
      deliveryAddress,
      isRemoteOrder = false,
      isSurpriseMode = false,
      isAnonymous = false,
      senderName = '',
      occasion = 'none',
      scheduledFor,
      personalMessage = '',
      mediaUrl = '',
      mediaType = 'none',
      paymentMethod = 'cod',
      couponCode = '',
      loyaltyPointsToUse = 0,
    } = req.body;

    if (!deliveryAddress?.name || !deliveryAddress?.phone || !deliveryAddress?.fullAddress) {
      return res.status(400).json(createError('Delivery address is incomplete.', 400));
    }

    let restaurant = null;
    let validatedFoodItems = [];
    let foodSubtotal = 0;
    let restaurantDeliveryFee = 0;

    // ── Validate food items (if any) ──────────────────────────────────────
    if ((orderType === 'food' || orderType === 'combo') && items.length > 0) {
      if (!restaurantId) return res.status(400).json(createError('Restaurant is required for food items.', 400));
      restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant || !restaurant.isActive) {
        return res.status(404).json(createError('Restaurant not found.', 404));
      }
      for (const cartItem of items) {
        const menuItem = restaurant.menu.id(cartItem.foodId);
        if (!menuItem) {
          return res.status(400).json(createError(`Item "${cartItem.name}" is no longer available.`, 400));
        }
        foodSubtotal += menuItem.price * cartItem.quantity;
        validatedFoodItems.push({
          foodId: menuItem._id, name: menuItem.name, price: menuItem.price,
          quantity: cartItem.quantity, image: menuItem.image, isVeg: menuItem.isVeg,
          customizations: cartItem.customizations || [],
        });
      }
      if (foodSubtotal < restaurant.minOrder) {
        return res.status(400).json(
          createError(`Minimum order amount is ₹${restaurant.minOrder}. Current: ₹${foodSubtotal}`, 400)
        );
      }
      restaurantDeliveryFee = restaurant.deliveryFee || 0;
    }

    // ── Validate gift items (if any) ──────────────────────────────────────
    let validatedGiftItems = [];
    let giftSubtotal = 0;

    if ((orderType === 'gift' || orderType === 'combo') && giftItems.length > 0) {
      for (const cartGift of giftItems) {
        const gift = await Gift.findById(cartGift.giftId);
        if (!gift || !gift.isActive) {
          return res.status(400).json(createError(`Gift "${cartGift.name}" is no longer available.`, 400));
        }
        const variant = gift.variants?.find((v) => v.label === cartGift.variantLabel) || null;
        const price = variant?.price ?? gift.basePrice;
        giftSubtotal += price * cartGift.quantity;
        validatedGiftItems.push({
          giftId: gift._id, name: gift.name, image: gift.images?.[0] || '',
          variantLabel: cartGift.variantLabel || 'Standard', price, quantity: cartGift.quantity,
          personalization: cartGift.personalization || { message: '', photoUrl: '' },
        });
      }
    }

    if (validatedFoodItems.length === 0 && validatedGiftItems.length === 0) {
      return res.status(400).json(createError('Order must contain at least one item.', 400));
    }

    // ── Pricing ──────────────────────────────────────────────────────────
    const subtotal = foodSubtotal + giftSubtotal;
    const deliveryFee = orderType === 'gift'
      ? (giftSubtotal >= 1000 ? 0 : 60)
      : restaurantDeliveryFee;
    const taxRate = 0.05;
    const taxes = Math.round(subtotal * taxRate);

    const user = await User.findById(req.user._id);
    let loyaltyDiscount = 0, pointsUsed = 0;
    if (loyaltyPointsToUse > 0 && user.loyaltyPoints >= loyaltyPointsToUse) {
      loyaltyDiscount = loyaltyPointsToUse;
      pointsUsed = loyaltyPointsToUse;
    }
    const discount = loyaltyDiscount;
    const total = Math.max(0, subtotal + deliveryFee + taxes - discount);
    const pointsEarned = Math.floor(total / 10);

    // ── Scheduling ───────────────────────────────────────────────────────
    const isScheduled = !!scheduledFor && new Date(scheduledFor) > new Date();
    const baseDeliveryMinutes = restaurant?.deliveryTime || (orderType === 'gift' ? 120 : 60);
    const estimatedDelivery = isScheduled
      ? new Date(scheduledFor)
      : new Date(Date.now() + baseDeliveryMinutes * 60 * 1000);

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant?._id || undefined,
      restaurantName: restaurant?.name || '',
      orderType,
      occasion,
      items: validatedFoodItems,
      giftItems: validatedGiftItems,
      deliveryAddress,
      isRemoteOrder,
      isSurpriseMode,
      isAnonymous,
      senderName: isAnonymous ? '' : (senderName || user.name),
      scheduledFor: isScheduled ? scheduledFor : null,
      personalMessage,
      mediaUrl,
      mediaType,
      subtotal,
      deliveryFee,
      discount,
      taxes,
      total,
      couponCode,
      paymentMethod,
      paymentStatus: 'pending',
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsUsed: pointsUsed,
      estimatedDelivery,
      status: isScheduled ? 'scheduled' : 'placed',
    });

    if (pointsUsed > 0) user.loyaltyPoints -= pointsUsed;
    user.loyaltyPoints += pointsEarned;
    await user.save({ validateBeforeSave: false });

    const message = isScheduled
      ? `Order scheduled for ${new Date(scheduledFor).toLocaleString('en-IN')} 📅`
      : isRemoteOrder
      ? 'Your surprise is on its way! 🎉❤️'
      : 'Order placed successfully! 🎉';

    res.status(201).json(createSuccess(message, { order }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, orderType } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, ...createPaginatedSuccess(orders, page, limit, total) });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json(createError('Order not found.', 404));
    res.status(200).json(createSuccess('Order fetched', { order }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/orders/:id/cancel ───────────────────────────────────────────────
const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json(createError('Order not found.', 404));

    const cancellableStatuses = ['scheduled', 'placed', 'accepted'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json(createError(`Order cannot be cancelled once it is "${order.status}".`, 400));
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    if (order.loyaltyPointsUsed > 0) {
      await User.findByIdAndUpdate(order.user, { $inc: { loyaltyPoints: order.loyaltyPointsUsed } });
    }
    await order.save();

    res.status(200).json(createSuccess('Order cancelled.', { order }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/orders/:id/reschedule ──────────────────────────────────────────
const rescheduleOrder = async (req, res, next) => {
  try {
    const { scheduledFor } = req.body;
    if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
      return res.status(400).json(createError('Please provide a valid future date/time.', 400));
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json(createError('Order not found.', 404));
    if (!['scheduled', 'placed'].includes(order.status)) {
      return res.status(400).json(createError('This order can no longer be rescheduled.', 400));
    }
    order.scheduledFor = scheduledFor;
    order.estimatedDelivery = new Date(scheduledFor);
    order.status = 'scheduled';
    await order.save();
    res.status(200).json(createSuccess('Order rescheduled.', { order }));
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/orders/:id/status (admin / restaurant) ─────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    const validStatuses = ['accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(createError(`Invalid status: ${status}`, 400));
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json(createError('Order not found.', 404));

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    await order.save();

    res.status(200).json(createSuccess('Order status updated.', { order }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder, getMyOrders, getOrderById,
  cancelOrder, rescheduleOrder, updateOrderStatus,
};
