/**
 * Restaurants Page — search, cuisine filters, sort, infinite scroll
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { RestaurantGridSkeleton } from '../components/restaurant/RestaurantCardSkeleton';
import restaurantService from '../services/restaurantService';
import AIFoodRecommendations from '../components/ai/AIFoodRecommendations';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'deliveryTime', label: '⚡ Fastest' },
  { value: 'deliveryFee', label: '🚚 Low Delivery Fee' },
  { value: 'newest', label: '🆕 Newest' },
];

const CUISINE_ICONS = {
  'North Indian':'🍛',Italian:'🍕',Japanese:'🍣',American:'🍔',
  'South Indian':'🥘',Healthy:'🥗',Biryani:'🍚',Sushi:'🍱',
  Burgers:'🍔',Vegan:'🌱',Chinese:'🥡',Ramen:'🍜',
};

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const observerRef = useRef(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { restaurantService.getCuisines().then(setCuisines).catch(() => {}); }, []);

  const loadRestaurants = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      if (debouncedSearch) {
        setIsSearchMode(true);
        const data = await restaurantService.search(debouncedSearch, 'Pune', pageNum);
        const items = data.data?.restaurants || [];
        setRestaurants((prev) => reset ? items : [...prev, ...items]);
        setHasMore(false); setTotal(items.length);
      } else {
        setIsSearchMode(false);
        const params = { page: pageNum, limit: 12, city: 'Pune', sortBy,
          ...(selectedCuisines.length > 0 && { cuisine: selectedCuisines.join(',') }) };
        const data = await restaurantService.getRestaurants(params);
        const items = data.data || [];
        setRestaurants((prev) => reset ? items : [...prev, ...items]);
        setHasMore(data.pagination?.hasNext || false);
        setTotal(data.pagination?.total || 0);
      }
    } catch { toast.error('Failed to load restaurants. Please try again.'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [debouncedSearch, selectedCuisines, sortBy]);

  useEffect(() => {
    setPage(1); setRestaurants([]); setHasMore(true);
    loadRestaurants(1, true);
  }, [debouncedSearch, selectedCuisines, sortBy]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && !isSearchMode) {
        const next = page + 1; setPage(next); loadRestaurants(next, false);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observerRef.current.observe(loaderRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, isSearchMode, loadRestaurants]);

  const toggleCuisine = (c) => setSelectedCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const clearFilters = () => { setSelectedCuisines([]); setSortBy('rating'); setSearchQuery(''); };
  const hasActiveFilters = selectedCuisines.length > 0 || sortBy !== 'rating';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title mb-1">Restaurants 🍽️</h1>
        <p className="text-gray-500 dark:text-gray-400">{total > 0 ? `${total} restaurants in Pune` : 'Discover amazing food near you'}</p>
      </motion.div>

      <AIFoodRecommendations />

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, cuisines…" className="input pl-11 pr-10" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="input pr-8 appearance-none cursor-pointer min-w-[160px]">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
            hasActiveFilters ? 'border-primary-400 bg-primary-50 dark:bg-primary-950 text-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
          <FiFilter size={15} /> Filters
          {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">{selectedCuisines.length + (sortBy !== 'rating' ? 1 : 0)}</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filter by Cuisine</h3>
            {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Clear all</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button key={c} onClick={() => toggleCuisine(c)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCuisines.includes(c) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
                <span>{CUISINE_ICONS[c] || '🍴'}</span>{c}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Active chips */}
      {selectedCuisines.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCuisines.map((c) => (
            <span key={c} className="flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm px-3 py-1 rounded-full">
              {CUISINE_ICONS[c] || '🍴'} {c}
              <button onClick={() => toggleCuisine(c)} className="hover:text-primary-900"><FiX size={13} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? <RestaurantGridSkeleton count={12} /> : restaurants.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No restaurants found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{debouncedSearch ? `No results for "${debouncedSearch}"` : 'Try adjusting your filters'}</p>
          <button onClick={clearFilters} className="btn-primary">Clear filters</button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i % 12} />)}
          </div>
          <div ref={loaderRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-sm">Loading more…</span>
              </div>
            )}
            {!hasMore && restaurants.length > 0 && !isSearchMode && (
              <p className="text-sm text-gray-400">You've seen all {total} restaurants 🎉</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantsPage;
