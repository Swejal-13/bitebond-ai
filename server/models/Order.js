/**
 * Order Model
 * Handles both self-orders and remote (gift) orders
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  image:       { type: String, default: '' },
  isVeg:       { type: Boolean, default: false },
  customizations: [{ name: String, option: String, extraPrice: Number }],
}, { _id: true });

const addressSnapshot = new mongoose.Schema({
  name:        { type: String, required: true },
  phone:       { type: String, required: true },
  fullAddress: { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, default: '' },
  pincode:     { type: String, default: '' },
  landmark:    { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    // ─── Relationships ────────────────────────────────────────────────────
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false },
    restaurantName: { type: String, default: '' },

    // ─── Order type ───────────────────────────────────────────────────────
    orderType: { type: String, enum: ['food', 'gift', 'combo'], default: 'food' },
    occasion: {
      type: String,
      enum: ['birthday', 'anniversary', 'festival', 'congratulations', 'thank_you', 'get_well_soon', 'none'],
      default: 'none',
    },

    // ─── Gift items (when orderType is 'gift' or 'combo') ───────────────────
    giftItems: [{
      giftId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
      name:         String,
      image:        String,
      variantLabel: String,
      price:        Number,
      quantity:     Number,
      personalization: {
        message:  { type: String, default: '' },
        photoUrl: { type: String, default: '' },
      },
    }],

    // ─── Items ────────────────────────────────────────────────────────────
    items: { type: [orderItemSchema], default: [] },

    // ─── Delivery ─────────────────────────────────────────────────────────
    deliveryAddress: { type: addressSnapshot, required: true },
    isRemoteOrder:   { type: Boolean, default: false },   // ordering for someone else
    isSurpriseMode:  { type: Boolean, default: false },   // receiver doesn't see sender name
    isAnonymous:     { type: Boolean, default: false },
    scheduledFor:    { type: Date, default: null },        // scheduled delivery time

    // ─── Personalization ──────────────────────────────────────────────────
    senderName:      { type: String, default: '' },  // shown to receiver unless anonymous
    personalMessage: { type: String, default: '' },
    mediaUrl:        { type: String, default: '' },        // Cloudinary voice/video/photo
    mediaType:       { type: String, enum: ['none','photo','voice','video'], default: 'none' },

    // ─── Pricing ──────────────────────────────────────────────────────────
    subtotal:    { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    taxes:       { type: Number, default: 0 },
    total:       { type: Number, required: true },
    couponCode:  { type: String, default: '' },

    // ─── Payment ──────────────────────────────────────────────────────────
    paymentMethod:  { type: String, enum: ['cod', 'online', 'wallet'], default: 'cod' },
    paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentId:      { type: String, default: '' },

    // ─── Status ───────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['scheduled', 'placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusHistory: [
      {
        status:    String,
        timestamp: { type: Date, default: Date.now },
        note:      { type: String, default: '' },
      },
    ],
    estimatedDelivery: { type: Date },
    deliveredAt:       { type: Date },
    cancelledAt:       { type: Date },
    cancellationReason:{ type: String, default: '' },

    // ─── Loyalty ──────────────────────────────────────────────────────────
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyPointsUsed:   { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// ─── Virtual: display status label ───────────────────────────────────────────
const STATUS_LABELS = {
  scheduled:        '📅 Scheduled',
  placed:           '🕐 Order Placed',
  accepted:         '✅ Accepted',
  preparing:        '👨‍🍳 Preparing',
  out_for_delivery: '🛵 Out for Delivery',
  delivered:        '🎉 Delivered',
  cancelled:        '❌ Cancelled',
};
orderSchema.virtual('statusLabel').get(function () {
  return STATUS_LABELS[this.status] || this.status;
});

// ─── Pre-save: push to statusHistory ─────────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
