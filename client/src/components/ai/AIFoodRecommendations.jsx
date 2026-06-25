/**
 * AIFoodRecommendations
 * Compact card that asks for budget/occasion/preferences and shows AI-picked dishes
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import aiService from '../../services/aiService';
import { OCCASIONS } from '../../utils/occasions';
import toast from 'react-hot-toast';

const AIFoodRecommendations = () => {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(300);
  const [occasion, setOccasion] = useState('general');
  const [preferences, setPreferences] = useState('');
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await aiService.recommendFood({ budget, occasion, preferences });
      setRecs(data.recommendations || []);
    } catch {
      toast.error('Could not get recommendations. Try again.');
    } finally { setLoading(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full card-hover p-4 flex items-center gap-3 mb-6 border-2 border-purple-100 dark:border-purple-900 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
          <FiZap className="text-white" size={18} />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Not sure what to order?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Get AI-powered food recommendations</p>
        </div>
        <FiArrowRight className="text-purple-400" size={16} />
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      className="card p-5 mb-6 border-2 border-purple-100 dark:border-purple-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiZap className="text-purple-500" size={16} /> AI Food Recommendations
        </h3>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Budget (₹)</label>
          <input type="number" min={50} step={50} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Occasion</label>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input text-sm cursor-pointer">
            <option value="general">Just craving</option>
            {OCCASIONS.map((o) => <option key={o.key} value={o.key}>{o.emoji} {o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Preferences</label>
          <input value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="e.g. spicy, vegetarian" className="input text-sm" />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mb-4">
        {loading ? <><FiRefreshCw size={14} className="animate-spin" /> Finding dishes…</> : <><FiZap size={14} /> Get Recommendations</>}
      </button>

      <AnimatePresence>
        {recs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {recs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No matches found — try a different budget.</p>
            ) : recs.map((r, i) => (
              <Link key={i} to={r.restaurantId ? `/restaurants/${r.restaurantId}` : '/restaurants'}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.itemName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.restaurantName} · {r.reason}</p>
                </div>
                <span className="text-sm font-bold text-primary-500 flex-shrink-0">₹{r.price}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIFoodRecommendations;
