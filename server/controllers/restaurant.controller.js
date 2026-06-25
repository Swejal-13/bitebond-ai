/**
 * Restaurant Controller
 * GET  /api/restaurants          — list with filters + pagination
 * GET  /api/restaurants/search   — text search
 * GET  /api/restaurants/:id      — restaurant detail
 * GET  /api/restaurants/:id/menu — full menu
 * POST /api/restaurants/seed     — seed/refresh cache from external API
 */

const Restaurant = require('../models/Restaurant');
const { fetchFromApi } = require('../services/restaurant.service');
const { createSuccess, createError, createPaginatedSuccess } = require('../utils/response');
const NodeCache = require('node-cache');

// In-memory cache for hot endpoints (30-min TTL)
const memCache = new NodeCache({ stdTTL: 1800 });

// ─── Seed / refresh cache from external API ───────────────────────────────────
const seedRestaurants = async (req, res, next) => {
  try {
    const { location = 'Pune', query = '' } = req.body;
    const apiData = await fetchFromApi(query, location);

    let upserted = 0;
    for (const data of apiData) {
      await Restaurant.upsertFromApi(data);
      upserted++;
    }

    // Clear mem-cache after seed
    memCache.flushAll();

    res.status(200).json(
      createSuccess(`Seeded/refreshed ${upserted} restaurants from external API`, { count: upserted })
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurants ─────────────────────────────────────────────────────
const getRestaurants = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      city = 'Pune',
      cuisine,
      sortBy = 'rating',
      minRating,
      maxDeliveryTime,
      isVeg,
      priceRange,
      featured,
    } = req.query;

    // Build cache key from query params
    const cacheKey = `restaurants:${JSON.stringify(req.query)}`;
    const cached = memCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Auto-seed if DB is empty for this city
    const existingCount = await Restaurant.countDocuments({ 'address.city': new RegExp(city, 'i'), isActive: true });
    if (existingCount === 0) {
      const apiData = await fetchFromApi('', city);
      for (const data of apiData) {
        await Restaurant.upsertFromApi(data);
      }
    }

    // Build filter
    const filter = {
      isActive: true,
      'address.city': new RegExp(city, 'i'),
    };

    if (cuisine) filter.cuisine = { $in: cuisine.split(',') };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (maxDeliveryTime) filter.deliveryTime = { $lte: parseInt(maxDeliveryTime) };
    if (priceRange) filter.priceRange = { $in: priceRange.split(',') };
    if (featured === 'true') filter.isFeatured = true;
    if (isVeg === 'true') filter['menu.isVeg'] = true;

    // Sort options
    const sortMap = {
      rating: { rating: -1 },
      deliveryTime: { deliveryTime: 1 },
      deliveryFee: { deliveryFee: 1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.rating;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter, '-menu') // Exclude menu for list view
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Restaurant.countDocuments(filter),
    ]);

    const response = {
      success: true,
      ...createPaginatedSuccess(restaurants, page, limit, total),
    };

    memCache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurants/search ─────────────────────────────────────────────
const searchRestaurants = async (req, res, next) => {
  try {
    const { q, city = 'Pune', page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json(createError('Search query must be at least 2 characters.', 400));
    }

    const cacheKey = `search:${q}:${city}:${page}`;
    const cached = memCache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Try text index search first, then regex fallback
    let restaurants = await Restaurant.find(
      {
        $text: { $search: q },
        'address.city': new RegExp(city, 'i'),
        isActive: true,
      },
      { score: { $meta: 'textScore' }, menu: 0 }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Fallback: regex search if text index returns nothing
    if (restaurants.length === 0) {
      restaurants = await Restaurant.find(
        {
          isActive: true,
          'address.city': new RegExp(city, 'i'),
          $or: [
            { name: new RegExp(q, 'i') },
            { cuisine: { $in: [new RegExp(q, 'i')] } },
            { description: new RegExp(q, 'i') },
          ],
        },
        '-menu'
      )
        .limit(parseInt(limit))
        .lean();
    }

    const response = createSuccess(`Found ${restaurants.length} results for "${q}"`, {
      restaurants,
      query: q,
      count: restaurants.length,
    });

    memCache.set(cacheKey, response, 300); // 5-min cache for search

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurants/:id ─────────────────────────────────────────────────
const getRestaurantById = async (req, res, next) => {
  try {
    const cacheKey = `restaurant:${req.params.id}`;
    const cached = memCache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const restaurant = await Restaurant.findById(req.params.id, '-menu').lean();

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json(createError('Restaurant not found.', 404));
    }

    // Check if cache is stale and refresh in background
    const ttl = parseInt(process.env.RESTAURANT_CACHE_TTL || 3600) * 1000;
    if (Date.now() - new Date(restaurant.cachedAt).getTime() > ttl) {
      // Trigger background refresh (fire-and-forget)
      setImmediate(async () => {
        try {
          const { fetchFromApi } = require('../services/restaurant.service');
          const data = await fetchFromApi(restaurant.name, restaurant.address.city);
          if (data.length > 0) {
            await Restaurant.upsertFromApi(data[0]);
            memCache.del(cacheKey);
          }
        } catch {}
      });
    }

    const response = createSuccess('Restaurant fetched', { restaurant });
    memCache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurants/:id/menu ───────────────────────────────────────────
const getRestaurantMenu = async (req, res, next) => {
  try {
    const cacheKey = `menu:${req.params.id}`;
    const cached = memCache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const restaurant = await Restaurant.findById(req.params.id, 'name menu cuisine').lean();

    if (!restaurant) {
      return res.status(404).json(createError('Restaurant not found.', 404));
    }

    // Group menu items by category
    const grouped = restaurant.menu.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    const categories = Object.entries(grouped).map(([name, items]) => ({ name, items }));

    const response = createSuccess('Menu fetched', {
      restaurantName: restaurant.name,
      categories,
      totalItems: restaurant.menu.length,
    });

    memCache.set(cacheKey, response, 3600);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/restaurants/cuisines ───────────────────────────────────────────
const getCuisines = async (req, res, next) => {
  try {
    const cached = memCache.get('cuisines');
    if (cached) return res.status(200).json(cached);

    const cuisines = await Restaurant.distinct('cuisine', { isActive: true });
    const sorted = cuisines.filter(Boolean).sort();

    const response = createSuccess('Cuisines fetched', { cuisines: sorted });
    memCache.set('cuisines', response, 3600);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getCuisines,
  seedRestaurants,
};
