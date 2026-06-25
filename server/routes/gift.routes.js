const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getGifts, getFeaturedGifts, getCategories, getGiftById, seedGifts,
} = require('../controllers/gift.controller');

router.get('/', getGifts);
router.get('/featured', getFeaturedGifts);
router.get('/categories', getCategories);
router.get('/:id', getGiftById);
router.post('/seed', protect, authorize('admin'), seedGifts);

module.exports = router;
