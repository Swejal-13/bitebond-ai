/**
 * AI Controller — Gemini-powered features
 * All endpoints gracefully fall back to curated mock responses when GEMINI_API_KEY is not set,
 * so the app remains fully demoable without a key.
 */

const { callGemini, parseJsonResponse, GeminiNotConfiguredError } = require('../services/gemini.service');
const Restaurant = require('../models/Restaurant');
const Gift = require('../models/Gift');
const Order = require('../models/Order');
const { createSuccess, createError } = require('../utils/response');

// ════════════════════════════════════════════════════════════════════════════
// 1. AI FOOD RECOMMENDATION
// ════════════════════════════════════════════════════════════════════════════
const recommendFood = async (req, res, next) => {
  const { budget, occasion = 'general', preferences = '' } = req.body;

  const fallback = async () => {
    const restaurants = await Restaurant.find({ isActive: true }).limit(3).lean();
    const recs = restaurants.flatMap((r) =>
      (r.menu || []).slice(0, 1).map((item) => ({
        restaurantName: r.name,
        restaurantId: r._id,
        itemName: item.name,
        price: item.price,
        reason: `Popular pick at ${r.name}, great for ${occasion} occasions.`,
      }))
    );
    res.status(200).json(createSuccess('Recommendations generated (offline mode)', { recommendations: recs.slice(0, 5), source: 'fallback' }));
  };

  try {
    const recentOrders = await Order.find({ user: req.user._id, orderType: { $in: ['food', 'combo'] } })
      .sort({ createdAt: -1 }).limit(5).lean();
    const historySummary = recentOrders.flatMap((o) => o.items.map((i) => i.name)).join(', ') || 'no previous orders';

    const restaurants = await Restaurant.find({ isActive: true }).limit(10).lean();
    const menuCatalog = restaurants.map((r) => ({
      restaurantId: r._id.toString(),
      restaurantName: r.name,
      cuisine: r.cuisine,
      items: (r.menu || []).map((m) => ({ name: m.name, price: m.price, isVeg: m.isVeg })),
    }));

    const prompt = `You are a food recommendation engine for an Indian food delivery app called BiteBond AI.

User context:
- Budget: ₹${budget || 'flexible'}
- Occasion: ${occasion}
- Preferences: ${preferences || 'none specified'}
- Order history: ${historySummary}

Available restaurants and menu items (JSON):
${JSON.stringify(menuCatalog).slice(0, 6000)}

Recommend exactly 5 food items from the catalog above that best fit the user's budget, occasion, and preferences.
Respond with ONLY a JSON array, no markdown, in this exact format:
[{"restaurantId": "...", "restaurantName": "...", "itemName": "...", "price": 0, "reason": "short reason under 15 words"}]`;

    const text = await callGemini(prompt, { temperature: 0.8, jsonMode: true });
    const recommendations = parseJsonResponse(text);

    res.status(200).json(createSuccess('Recommendations generated', { recommendations, source: 'gemini' }));
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) return fallback();
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 2. AI GIFT RECOMMENDATION
// ════════════════════════════════════════════════════════════════════════════
const recommendGift = async (req, res, next) => {
  const { relationship, budget, age, occasion } = req.body;

  if (!relationship || !occasion) {
    return res.status(400).json(createError('relationship and occasion are required.', 400));
  }

  const fallback = async () => {
    const gifts = await Gift.find({
      isActive: true,
      occasions: occasion,
      ...(budget && { basePrice: { $lte: parseInt(budget) } }),
    }).sort({ isFeatured: -1, rating: -1 }).limit(5).lean();

    const recommendations = gifts.map((g) => ({
      giftId: g._id, name: g.name, price: g.basePrice, image: g.images?.[0] || '',
      reason: `Highly rated ${g.category.replace('_', ' ')} perfect for ${occasion.replace('_', ' ')}.`,
    }));
    res.status(200).json(createSuccess('Gift recommendations generated (offline mode)', { recommendations, source: 'fallback' }));
  };

  try {
    const gifts = await Gift.find({ isActive: true }).limit(20).lean();
    const catalog = gifts.map((g) => ({
      giftId: g._id.toString(), name: g.name, category: g.category,
      basePrice: g.basePrice, occasions: g.occasions, isPersonalizable: g.isPersonalizable,
    }));

    const prompt = `You are a gift recommendation engine for BiteBond AI, a food & gifting platform.

Request:
- Relationship to recipient: ${relationship}
- Recipient age: ${age || 'unspecified'}
- Budget: ₹${budget || 'flexible'}
- Occasion: ${occasion}

Available gift catalog (JSON):
${JSON.stringify(catalog).slice(0, 5000)}

Recommend exactly 5 gifts from the catalog above that best fit this relationship, age, budget, and occasion.
Respond with ONLY a JSON array, no markdown:
[{"giftId": "...", "name": "...", "price": 0, "reason": "short reason under 15 words"}]`;

    const text = await callGemini(prompt, { temperature: 0.8, jsonMode: true });
    const aiRecs = parseJsonResponse(text);

    const giftMap = new Map(gifts.map((g) => [g._id.toString(), g]));
    const recommendations = aiRecs.map((r) => ({
      ...r, image: giftMap.get(r.giftId)?.images?.[0] || '',
    }));

    res.status(200).json(createSuccess('Gift recommendations generated', { recommendations, source: 'gemini' }));
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) return fallback();
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 3. AI CELEBRATION PLANNER
// ════════════════════════════════════════════════════════════════════════════
const planCelebration = async (req, res, next) => {
  const { occasion, budget } = req.body;

  if (!occasion || !budget) {
    return res.status(400).json(createError('occasion and budget are required.', 400));
  }

  const fallback = async () => {
    const foodBudget = Math.round(budget * 0.5);
    const giftBudget = Math.round(budget * 0.4);
    const [restaurant, gift] = await Promise.all([
      Restaurant.findOne({ isActive: true }).lean(),
      Gift.findOne({ isActive: true, occasions: occasion }).lean(),
    ]);
    const plan = {
      food: restaurant ? { suggestion: `${restaurant.menu?.[0]?.name || "Chef's special"} from ${restaurant.name}`, estimatedCost: foodBudget } : null,
      gift: gift ? { suggestion: gift.name, estimatedCost: gift.basePrice } : null,
      schedule: [
        { time: 'Morning', activity: 'Order gift for afternoon delivery' },
        { time: 'Evening', activity: 'Order food delivery for dinner celebration' },
      ],
      totalEstimatedCost: foodBudget + giftBudget,
      tip: 'Schedule both deliveries in advance for a stress-free celebration.',
    };
    res.status(200).json(createSuccess('Celebration plan generated (offline mode)', { plan, source: 'fallback' }));
  };

  try {
    const prompt = `You are a celebration planning assistant for BiteBond AI, an Indian food & gifting platform.

Plan a complete celebration for:
- Occasion: ${occasion}
- Total budget: ₹${budget}

Create a thoughtful plan allocating the budget across food and a gift, plus a simple timeline for the day.
Respond with ONLY this JSON structure, no markdown:
{
  "food": {"suggestion": "dish/cuisine idea", "estimatedCost": 0},
  "gift": {"suggestion": "gift idea", "estimatedCost": 0},
  "schedule": [{"time": "Morning/Afternoon/Evening", "activity": "what to do"}],
  "totalEstimatedCost": 0,
  "tip": "one helpful tip under 20 words"
}`;

    const text = await callGemini(prompt, { temperature: 0.85, jsonMode: true });
    const plan = parseJsonResponse(text);

    res.status(200).json(createSuccess('Celebration plan generated', { plan, source: 'gemini' }));
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) return fallback();
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 4. AI WISH GENERATOR
// ════════════════════════════════════════════════════════════════════════════
const FALLBACK_WISHES = {
  birthday: [
    'Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!',
    'Another year older, another year more amazing. Have a fantastic birthday!',
  ],
  romantic: [
    'Every moment with you feels like a beautiful story I never want to end. I love you.',
    'You are my today and all of my tomorrows. Happy to celebrate you.',
  ],
  funny: [
    'Congrats on being one year closer to getting senior citizen discounts!',
    'Happy Birthday! May your day be as fabulous as you think you are.',
  ],
  emotional: [
    'Thank you for always being there. Your presence in my life means more than words can say.',
    "Some people make the world more beautiful just by being in it. You're one of them.",
  ],
};

const generateWish = async (req, res, next) => {
  const { recipientName = '', tone = 'birthday', context = '' } = req.body;

  const validTypes = ['birthday', 'romantic', 'funny', 'emotional'];
  const wishType = validTypes.includes(tone) ? tone : 'birthday';

  const fallback = () => {
    const options = FALLBACK_WISHES[wishType] || FALLBACK_WISHES.birthday;
    const wish = options[Math.floor(Math.random() * options.length)];
    const personalized = recipientName ? `${recipientName}, ${wish.charAt(0).toLowerCase()}${wish.slice(1)}` : wish;
    res.status(200).json(createSuccess('Wish generated (offline mode)', { wish: personalized, source: 'fallback' }));
  };

  try {
    const toneDescription = {
      birthday: 'cheerful and celebratory',
      romantic: 'heartfelt and romantic',
      funny: 'humorous and light-hearted',
      emotional: 'deeply sincere and touching',
    }[wishType];

    const prompt = `Write a single ${wishType} wish message for "${recipientName || 'someone special'}".
${context ? `Additional context: ${context}` : ''}
The message should be warm and ${toneDescription}.
Keep it under 40 words. Respond with ONLY the message text, no quotes, no preamble, no markdown.`;

    const text = await callGemini(prompt, { temperature: 0.9, maxOutputTokens: 150 });
    const wish = text.trim().replace(/^["']|["']$/g, '');

    res.status(200).json(createSuccess('Wish generated', { wish, source: 'gemini' }));
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) return fallback();
    next(error);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 5. AI CUSTOMER SUPPORT CHATBOT
// ════════════════════════════════════════════════════════════════════════════
const FAQ_CONTEXT = `
BiteBond AI FAQs:
- Orders can be cancelled only when status is "scheduled", "placed" or "accepted". Once "preparing" begins, cancellation isn't possible.
- Refunds for cancelled orders are processed within 3-5 business days back to the original payment method; loyalty points used are refunded immediately.
- Delivery times: food orders 25-45 min, gift orders 1-24 hours depending on item, scheduled orders deliver at the chosen time.
- Loyalty points: earn 1 point per ₹10 spent, redeemable at 1 point = ₹1, up to 10% of order value.
- Remote orders let users send food/gifts to others; surprise mode hides order details from the receiver until delivery; anonymous mode hides the sender's name.
- Support email: support@bitebond.app. Minimum order value varies per restaurant (shown on restaurant page).
`;

const chatSupport = async (req, res, next) => {
  const { message, orderId } = req.body;

  if (!message?.trim()) {
    return res.status(400).json(createError('message is required.', 400));
  }

  const fallback = () => {
    const lower = message.toLowerCase();
    let reply = "I'm here to help! For order tracking, check the Orders page. For refunds, they process in 3-5 business days. For anything else, reach out to support@bitebond.app.";
    if (lower.includes('cancel')) reply = "You can cancel orders that are still 'Placed' or 'Accepted' from the Order Details page. Once preparation starts, cancellation isn't available.";
    if (lower.includes('refund')) reply = 'Refunds for cancelled orders are processed within 3-5 business days to your original payment method.';
    if (lower.includes('track') || lower.includes('where')) reply = "You can track your order's live status from the Orders page — tap any order to see the delivery timeline.";
    if (lower.includes('point') || lower.includes('loyalty')) reply = 'You earn 1 loyalty point per ₹10 spent. Points can be redeemed for up to 10% off your order total!';
    res.status(200).json(createSuccess('Response generated (offline mode)', { reply, source: 'fallback' }));
  };

  try {
    let orderContext = '';
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id }).lean();
      if (order) {
        orderContext = `\nThe user is asking about order #${order._id.toString().slice(-6).toUpperCase()}: status is "${order.status}", total ₹${order.total}, placed on ${new Date(order.createdAt).toLocaleDateString()}.`;
      }
    }

    const prompt = `You are BiteBond AI's friendly customer support assistant for a food delivery & gifting app.

${FAQ_CONTEXT}
${orderContext}

User message: "${message}"

Reply helpfully and concisely (under 60 words) in a warm, friendly tone. If you don't have enough information, suggest they contact support@bitebond.app.
Respond with ONLY the reply text, no markdown, no preamble.`;

    const text = await callGemini(prompt, { temperature: 0.6, maxOutputTokens: 200 });

    res.status(200).json(createSuccess('Response generated', { reply: text.trim(), source: 'gemini' }));
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) return fallback();
    next(error);
  }
};

module.exports = { recommendFood, recommendGift, planCelebration, generateWish, chatSupport };
