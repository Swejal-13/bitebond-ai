/**
 * Gift Controller
 * GET  /api/gifts               — list with category/occasion filters
 * GET  /api/gifts/featured      — featured gifts
 * GET  /api/gifts/:id           — gift detail
 * POST /api/gifts/seed          — seed catalogue (admin)
 */

const Gift = require('../models/Gift');
const GIFTS_SEED = require('../data/gifts.seed');
const { createSuccess, createError, createPaginatedSuccess } = require('../utils/response');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 });

// ─── Seed ────────────────────────────────────────────────────────────────────
const seedGifts = async (req, res, next) => {
  try {
    const existing = await Gift.countDocuments();
    if (existing > 0 && !req.body.force) {
      return res.status(200).json(
        createSuccess(`Gift catalogue already has ${existing} items. Pass force:true to reseed.`)
      );
    }
    if (req.body.force) await Gift.deleteMany({});
    await Gift.insertMany(GIFTS_SEED);
    cache.flushAll();
    res.status(201).json(createSuccess(`Seeded ${GIFTS_SEED.length} gifts`, { count: GIFTS_SEED.length }));
  } catch (error) {
    next(error);
  }
};

// ─── Auto-seed helper ─────────────────────────────────────────────────────────
const autoSeedIfEmpty = async () => {
  const count = await Gift.countDocuments();
  if (count === 0) {
    await Gift.insertMany(GIFTS_SEED);
    console.log('✅ Gift catalogue auto-seeded');
  }
};

// ─── GET /api/gifts ───────────────────────────────────────────────────────────
const getGifts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      category, occasion, q,
      minPrice, maxPrice,
      sortBy = 'featured',
    } = req.query;

    const cacheKey = `gifts:${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    await autoSeedIfEmpty();

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (occasion) filter.occasions = occasion;
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseInt(maxPrice);
    }
    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const sortMap = {
      featured:   { isFeatured: -1, rating: -1 },
      popular:    { ratingCount: -1 },
      priceLow:   { basePrice: 1 },
      priceHigh:  { basePrice: -1 },
      rating:     { rating: -1 },
      newest:     { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.featured;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [gifts, total] = await Promise.all([
      Gift.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Gift.countDocuments(filter),
    ]);

    const response = { success: true, ...createPaginatedSuccess(gifts, page, limit, total) };
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/gifts/featured ──────────────────────────────────────────────────
const getFeaturedGifts = async (req, res, next) => {
  try {
    const cached = cache.get('gifts:featured');
    if (cached) return res.status(200).json(cached);

    await autoSeedIfEmpty();

    const gifts = await Gift.find({ isFeatured: true, isActive: true })
      .sort({ rating: -1 })
      .limit(8)
      .lean();

    const response = createSuccess('Featured gifts fetched', { gifts });
    cache.set('gifts:featured', response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/gifts/categories ────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const CATEGORIES = [
      { key: 'cake',          label: 'Cakes',            emoji: '🎂', description: 'Custom & photo cakes' },
      { key: 'flowers',       label: 'Flowers',          emoji: '🌹', description: 'Fresh bouquets & arrangements' },
      { key: 'chocolates',    label: 'Chocolates',       emoji: '🍫', description: 'Premium & artisan chocolates' },
      { key: 'personalized',  label: 'Personalized',     emoji: '🎨', description: 'Custom mugs, frames & more' },
      { key: 'greeting_card', label: 'Greeting Cards',   emoji: '💌', description: 'Handmade & printed cards' },
      { key: 'hamper',        label: 'Hampers',          emoji: '🧺', description: 'Curated gift bundles' },
    ];
    res.status(200).json(createSuccess('Categories fetched', { categories: CATEGORIES }));
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/gifts/:id ───────────────────────────────────────────────────────
const getGiftById = async (req, res, next) => {
  try {
    const cacheKey = `gift:${req.params.id}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const gift = await Gift.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!gift) return res.status(404).json(createError('Gift not found.', 404));

    // Related gifts (same category, exclude self)
    const related = await Gift.find({
      category: gift.category, _id: { $ne: gift._id }, isActive: true,
    }).limit(4).lean();

    const response = createSuccess('Gift fetched', { gift, related });
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getGifts, getFeaturedGifts, getCategories, getGiftById, seedGifts };
