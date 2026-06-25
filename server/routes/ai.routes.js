/**
 * AI Routes — all Gemini-powered features
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const {
  recommendFood, recommendGift, planCelebration, generateWish, chatSupport,
} = require('../controllers/ai.controller');

// AI calls are more expensive — apply a tighter rate limit
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many AI requests. Please wait a few minutes.' },
});

router.use(protect, aiLimiter);

router.post('/recommend-food', recommendFood);
router.post('/recommend-gift', recommendGift);
router.post('/plan-celebration', planCelebration);
router.post('/generate-wish', generateWish);
router.post('/chat-support', chatSupport);

module.exports = router;
