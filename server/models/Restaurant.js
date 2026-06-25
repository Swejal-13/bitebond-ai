/**
 * Restaurant Model
 * Stores cached data fetched from external restaurant APIs.
 * TTL index auto-expires stale cache so it gets refreshed.
 */

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  category: { type: String, default: 'Main Course' },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  customizations: [
    {
      name: String,          // e.g. "Size"
      options: [{ label: String, extraPrice: Number }],
      required: { type: Boolean, default: false },
    },
  ],
}, { _id: true });

const restaurantSchema = new mongoose.Schema(
  {
    // ─── External API identifiers ───────────────────────────────────────────
    externalId: { type: String, unique: true, sparse: true }, // ID from the external API
    source: { type: String, enum: ['yelp', 'rapidapi', 'zomato', 'mock'], default: 'rapidapi' },

    // ─── Core info ──────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    banner: { type: String, default: '' },
    cuisine: [{ type: String }],
    categories: [{ type: String }],

    // ─── Location ───────────────────────────────────────────────────────────
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    // ─── Ratings & delivery ──────────────────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    deliveryTime: { type: Number, default: 30 }, // minutes
    deliveryFee: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    priceRange: { type: String, enum: ['$', '$$', '$$$', '$$$$'], default: '$$' },

    // ─── Status ─────────────────────────────────────────────────────────────
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // ─── Menu ───────────────────────────────────────────────────────────────
    menu: [menuItemSchema],

    // ─── Cache control ──────────────────────────────────────────────────────
    cachedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ isFeatured: 1 });
restaurantSchema.index({ name: 'text', 'address.city': 'text', cuisine: 'text' });

// ─── Virtual: isCacheStale ────────────────────────────────────────────────────
restaurantSchema.virtual('isCacheStale').get(function () {
  const ttl = parseInt(process.env.RESTAURANT_CACHE_TTL || 3600) * 1000;
  return Date.now() - this.cachedAt.getTime() > ttl;
});

// ─── Static: upsert from API data ────────────────────────────────────────────
restaurantSchema.statics.upsertFromApi = async function (apiData) {
  return this.findOneAndUpdate(
    { externalId: apiData.externalId },
    { ...apiData, cachedAt: new Date() },
    { upsert: true, new: true, runValidators: false }
  );
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
