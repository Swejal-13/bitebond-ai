/**
 * Gift Model
 * Covers: Cakes, Flowers, Chocolates, Personalized Gifts, Greeting Cards, Hampers
 */

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  label:  { type: String, required: true }, // e.g. "500g", "1kg", "Small", "Large"
  price:  { type: Number, required: true },
  image:  { type: String, default: '' },
  inStock:{ type: Boolean, default: true },
}, { _id: true });

const giftSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['cake', 'flowers', 'chocolates', 'personalized', 'greeting_card', 'hamper'],
    },
    subcategory: { type: String, default: '' }, // e.g. "photo cake", "rose bouquet"
    images:      [{ type: String }],            // Cloudinary URLs
    basePrice:   { type: Number, required: true },
    variants:    [variantSchema],

    // Occasion tags for filtering
    occasions: [{
      type: String,
      enum: ['birthday', 'anniversary', 'festival', 'congratulations', 'thank_you', 'get_well_soon', 'romantic', 'general'],
    }],

    // Personalization options
    isPersonalizable: { type: Boolean, default: false },
    personalizationOptions: {
      allowText:   { type: Boolean, default: false },
      allowPhoto:  { type: Boolean, default: false },
      textLabel:   { type: String, default: 'Custom message' }, // e.g. "Name on cake"
      maxTextLen:  { type: Number, default: 50 },
    },

    rating:       { type: Number, default: 0, min: 0, max: 5 },
    ratingCount:  { type: Number, default: 0 },
    isFeatured:   { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    deliveryTime: { type: Number, default: 120 }, // minutes for gift delivery
    tags:         [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

giftSchema.index({ category: 1 });
giftSchema.index({ occasions: 1 });
giftSchema.index({ isFeatured: 1 });
giftSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Gift', giftSchema);
