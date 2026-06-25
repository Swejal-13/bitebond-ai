/**
 * Restaurant API Service
 * Fetches real restaurant data from RapidAPI (Yelp Fusion or similar).
 * Falls back to rich mock data in development/when API key is missing.
 *
 * API used: "Restaurants" on RapidAPI — swap to any compatible endpoint.
 * Set RESTAURANT_API_KEY and RESTAURANT_API_HOST in .env
 */

const axios = require('axios');

// ─── Mock data ────────────────────────────────────────────────────────────────
// Rich mock restaurants used when no API key is set or in development
const MOCK_RESTAURANTS = [
  {
    externalId: 'mock-1',
    source: 'mock',
    name: 'Spice Garden',
    description: 'Authentic North Indian curries, biryanis, and tandoor dishes made with hand-ground spices.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=80',
    cuisine: ['North Indian', 'Mughlai', 'Biryani'],
    address: { street: '42 MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    location: { type: 'Point', coordinates: [73.8567, 18.5204] },
    rating: 4.5,
    ratingCount: 1240,
    deliveryTime: 35,
    deliveryFee: 30,
    minOrder: 150,
    priceRange: '$$',
    isOpen: true,
    isFeatured: true,
    menu: [
      { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 280, category: 'Main Course', isVeg: false, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter and cream', price: 220, category: 'Main Course', isVeg: true, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80' },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 320, category: 'Biryani', isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80' },
      { name: 'Garlic Naan', description: 'Soft leavened bread with garlic butter', price: 60, category: 'Breads', isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
      { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 80, category: 'Desserts', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
    ],
  },
  {
    externalId: 'mock-2',
    source: 'mock',
    name: 'Pizza Royale',
    description: 'Wood-fired Italian pizzas with premium toppings and house-made sauces.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    address: { street: '8 FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411004' },
    location: { type: 'Point', coordinates: [73.8474, 18.5314] },
    rating: 4.3,
    ratingCount: 876,
    deliveryTime: 28,
    deliveryFee: 40,
    minOrder: 200,
    priceRange: '$$',
    isOpen: true,
    isFeatured: false,
    menu: [
      { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil', price: 299, category: 'Pizza', isVeg: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
      { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, onions', price: 349, category: 'Pizza', isVeg: false, image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80' },
      { name: 'Penne Arrabbiata', description: 'Spicy tomato sauce with garlic and chili', price: 249, category: 'Pasta', isVeg: true, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80' },
      { name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 180, category: 'Desserts', isVeg: true, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80' },
    ],
  },
  {
    externalId: 'mock-3',
    source: 'mock',
    name: 'Sushi Zen',
    description: 'Premium Japanese sushi, ramen, and bento boxes crafted by master chefs.',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80',
    cuisine: ['Japanese', 'Sushi', 'Ramen'],
    address: { street: '15 Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    location: { type: 'Point', coordinates: [73.8933, 18.5362] },
    rating: 4.7,
    ratingCount: 543,
    deliveryTime: 45,
    deliveryFee: 60,
    minOrder: 400,
    priceRange: '$$$',
    isOpen: true,
    isFeatured: true,
    menu: [
      { name: 'Salmon Nigiri (4pc)', description: 'Fresh Atlantic salmon on seasoned rice', price: 420, category: 'Sushi', isVeg: false, image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80' },
      { name: 'Veggie Roll (8pc)', description: 'Cucumber, avocado, carrot, sesame', price: 280, category: 'Sushi', isVeg: true, image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80' },
      { name: 'Tonkotsu Ramen', description: 'Rich pork bone broth, chashu, soft egg', price: 380, category: 'Ramen', isVeg: false, image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80' },
      { name: 'Mochi Ice Cream', description: 'Japanese rice cake with ice cream', price: 160, category: 'Desserts', isVeg: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    ],
  },
  {
    externalId: 'mock-4',
    source: 'mock',
    name: 'The Burger Lab',
    description: 'Gourmet smash burgers, loaded fries, and craft milkshakes.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=1200&q=80',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    address: { street: '7 Baner Road', city: 'Pune', state: 'Maharashtra', pincode: '411045' },
    location: { type: 'Point', coordinates: [73.7898, 18.5590] },
    rating: 4.2,
    ratingCount: 1890,
    deliveryTime: 25,
    deliveryFee: 25,
    minOrder: 100,
    priceRange: '$',
    isOpen: true,
    isFeatured: false,
    menu: [
      { name: 'Classic Smash Burger', description: 'Double smash patty, cheddar, pickles, special sauce', price: 249, category: 'Burgers', isVeg: false, image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&q=80' },
      { name: 'Crispy Chicken Burger', description: 'Fried chicken, slaw, sriracha mayo', price: 229, category: 'Burgers', isVeg: false, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80' },
      { name: 'Veg Smash Burger', description: 'Black bean patty, lettuce, tomato, vegan sauce', price: 199, category: 'Burgers', isVeg: true, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80' },
      { name: 'Loaded Cheese Fries', description: 'Crispy fries, nacho cheese, jalapeños', price: 149, category: 'Sides', isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
      { name: 'Oreo Milkshake', description: 'Thick Oreo shake with whipped cream', price: 149, category: 'Drinks', isVeg: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    ],
  },
  {
    externalId: 'mock-5',
    source: 'mock',
    name: 'South Spice Kitchen',
    description: 'Authentic South Indian dosas, idlis, and Chettinad curries.',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&q=80',
    cuisine: ['South Indian', 'Dosa', 'Tamil'],
    address: { street: '3 Camp Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    location: { type: 'Point', coordinates: [73.8777, 18.5174] },
    rating: 4.4,
    ratingCount: 2100,
    deliveryTime: 30,
    deliveryFee: 20,
    minOrder: 100,
    priceRange: '$',
    isOpen: true,
    isFeatured: false,
    menu: [
      { name: 'Masala Dosa', description: 'Crispy rice crepe with spiced potato filling', price: 120, category: 'Dosas', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
      { name: 'Idli Sambar (4pc)', description: 'Steamed rice cakes with lentil soup and chutneys', price: 80, category: 'Breakfast', isVeg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80' },
      { name: 'Chettinad Chicken Curry', description: 'Fiery Tamil Nadu chicken curry with freshly ground spices', price: 280, category: 'Curries', isVeg: false, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
      { name: 'Filter Coffee', description: 'South Indian decoction coffee with full cream milk', price: 60, category: 'Drinks', isVeg: true, image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&q=80' },
    ],
  },
  {
    externalId: 'mock-6',
    source: 'mock',
    name: 'Green Bowl Co.',
    description: 'Healthy grain bowls, salads, smoothies, and plant-based meals.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    cuisine: ['Healthy', 'Salads', 'Vegan'],
    address: { street: '22 Aundh Road', city: 'Pune', state: 'Maharashtra', pincode: '411007' },
    location: { type: 'Point', coordinates: [73.8069, 18.5590] },
    rating: 4.6,
    ratingCount: 765,
    deliveryTime: 20,
    deliveryFee: 35,
    minOrder: 200,
    priceRange: '$$',
    isOpen: true,
    isFeatured: true,
    menu: [
      { name: 'Buddha Bowl', description: 'Quinoa, roasted veggies, chickpeas, tahini', price: 280, category: 'Bowls', isVeg: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
      { name: 'Grilled Chicken Power Bowl', description: 'Brown rice, grilled chicken, avocado, greens', price: 320, category: 'Bowls', isVeg: false, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
      { name: 'Green Detox Smoothie', description: 'Spinach, cucumber, ginger, lemon, apple', price: 160, category: 'Drinks', isVeg: true, image: 'https://images.unsplash.com/photo-1638176066959-e654d9917b18?w=400&q=80' },
      { name: 'Acai Bowl', description: 'Frozen acai, granola, fresh fruits, honey', price: 240, category: 'Bowls', isVeg: true, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' },
    ],
  },
];

/**
 * Fetch restaurants from RapidAPI
 * Falls back to mock data if API key is missing
 */
const fetchFromApi = async (query = '', location = 'Pune') => {
  const apiKey = process.env.RESTAURANT_API_KEY;
  const apiHost = process.env.RESTAURANT_API_HOST;

  if (!apiKey || apiKey === 'your_rapidapi_key') {
    console.log('ℹ️  No API key set — using mock restaurant data');
    return transformMockData(MOCK_RESTAURANTS);
  }

  try {
    const response = await axios.get(`https://${apiHost}/search`, {
      params: { term: query || 'restaurants', location, limit: 20, sort_by: 'rating' },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
      timeout: 8000,
    });

    return transformApiData(response.data.businesses || []);
  } catch (error) {
    console.error('Restaurant API error — falling back to mock data:', error.message);
    return transformMockData(MOCK_RESTAURANTS);
  }
};

/**
 * Transform Yelp API response → our Restaurant schema
 */
const transformApiData = (businesses) =>
  businesses.map((b) => ({
    externalId: b.id,
    source: 'yelp',
    name: b.name,
    description: b.categories?.map((c) => c.title).join(', ') || '',
    image: b.image_url || '',
    banner: b.image_url || '',
    cuisine: b.categories?.map((c) => c.title) || [],
    address: {
      street: b.location?.address1 || '',
      city: b.location?.city || 'Pune',
      state: b.location?.state || '',
      pincode: b.location?.zip_code || '',
    },
    location: {
      type: 'Point',
      coordinates: [b.coordinates?.longitude || 0, b.coordinates?.latitude || 0],
    },
    rating: b.rating || 0,
    ratingCount: b.review_count || 0,
    deliveryTime: Math.floor(Math.random() * 20) + 20, // Yelp doesn't provide delivery time
    deliveryFee: Math.floor(Math.random() * 4) * 10 + 20,
    minOrder: 100,
    priceRange: b.price || '$$',
    isOpen: !b.is_closed,
    isFeatured: b.rating >= 4.5,
    menu: [],
  }));

/**
 * Transform mock data (already in correct shape)
 */
const transformMockData = (restaurants) => restaurants;

module.exports = { fetchFromApi, MOCK_RESTAURANTS };
