/**
 * Gift Marketplace — category browse, occasion filter, search
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiGift } from 'react-icons/fi';
import GiftCard from '../components/gift/GiftCard';
import { GiftGridSkeleton } from '../components/gift/GiftCardSkeleton';
import giftService from '../services/giftService';
import AIGiftRecommendations from '../components/ai/AIGiftRecommendations';
import toast from 'react-hot-toast';

const OCCASIONS = [
  { val: '', label: 'All Occasions', emoji: '🎁' },
  { val: 'birthday', label: 'Birthday', emoji: '🎂' },
  { val: 'anniversary', label: 'Anniversary', emoji: '💑' },
  { val: 'festival', label: 'Festival', emoji: '🎊' },
  { val: 'congratulations', label: 'Congratulations', emoji: '🎉' },
  { val: 'thank_you', label: 'Thank You', emoji: '🙏' },
  { val: 'get_well_soon', label: 'Get Well Soon', emoji: '💙' },
];

const SORT_OPTIONS = [
  { val: 'featured', label: 'Featured' },
  { val: 'popular', label: 'Most Popular' },
  { val: 'priceLow', label: 'Price: Low to High' },
  { val: 'priceHigh', label: 'Price: High to Low' },
  { val: 'rating', label: 'Top Rated' },
];

const GiftPage = () => {
  const [categories, setCategories] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeOccasion, setActiveOccasion] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    giftService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadGifts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 24, sortBy };
      if (activeCategory) params.category = activeCategory;
      if (activeOccasion) params.occasion = activeOccasion;
      if (debouncedSearch) params.q = debouncedSearch;
      const data = await giftService.getGifts(params);
      setGifts(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch { toast.error('Failed to load gifts'); }
    finally { setLoading(false); }
  }, [activeCategory, activeOccasion, sortBy, debouncedSearch]);

  useEffect(() => { loadGifts(); }, [loadGifts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="section-title mb-2 flex items-center justify-center gap-3">
          <FiGift className="text-primary-500" /> Gift Marketplace
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Cakes, flowers, chocolates, and personalized surprises for every occasion ❤️
        </p>
      </motion.div>

      <AIGiftRecommendations />

      {/* Category strip */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 mb-6">
        <button onClick={() => setActiveCategory('')}
          className={`flex flex-col items-center gap-2 min-w-[88px] p-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
            !activeCategory ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
          <span className="text-2xl">🎁</span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">All</span>
        </button>
        {categories.map((c) => (
          <button key={c.key} onClick={() => setActiveCategory(c.key)}
            className={`flex flex-col items-center gap-2 min-w-[88px] p-3 rounded-2xl border-2 transition-all flex-shrink-0 ${
              activeCategory === c.key ? 'border-primary-400 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Search + occasion + sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gifts…" className="input pl-11 pr-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>
        <select value={activeOccasion} onChange={(e) => setActiveOccasion(e.target.value)} className="input min-w-[170px] cursor-pointer">
          {OCCASIONS.map((o) => <option key={o.val} value={o.val}>{o.emoji} {o.label}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input min-w-[160px] cursor-pointer">
          {SORT_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} gift{total !== 1 ? 's' : ''} found</p>
      )}

      {/* Grid */}
      {loading ? <GiftGridSkeleton count={8} /> : gifts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <span className="text-6xl mb-4 block">🎁</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No gifts found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Try a different category or search term</p>
          <button onClick={() => { setActiveCategory(''); setActiveOccasion(''); setSearch(''); }} className="btn-primary">
            Clear filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {gifts.map((g, i) => <GiftCard key={g._id} gift={g} index={i % 8} />)}
        </div>
      )}
    </div>
  );
};

export default GiftPage;
