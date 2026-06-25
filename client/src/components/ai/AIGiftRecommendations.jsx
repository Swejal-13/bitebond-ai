/**
 * AIGiftRecommendations
 * Asks for relationship/budget/age/occasion and shows AI-picked gifts
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import aiService from '../../services/aiService';
import { OCCASIONS } from '../../utils/occasions';
import toast from 'react-hot-toast';

const RELATIONSHIPS = ['Partner', 'Parent', 'Sibling', 'Friend', 'Colleague', 'Child'];

const AIGiftRecommendations = () => {
  const [open, setOpen] = useState(false);
  const [relationship, setRelationship] = useState('Partner');
  const [occasion, setOccasion] = useState('birthday');
  const [budget, setBudget] = useState(1000);
  const [age, setAge] = useState('');
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await aiService.recommendGift({ relationship, occasion, budget, age });
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
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Not sure what gift to send?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Let AI suggest the perfect gift</p>
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
          <FiZap className="text-purple-500" size={16} /> AI Gift Recommendations
        </h3>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Relationship</label>
          <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="input text-sm cursor-pointer">
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Occasion</label>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input text-sm cursor-pointer">
            {OCCASIONS.map((o) => <option key={o.key} value={o.key}>{o.emoji} {o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Budget (₹)</label>
          <input type="number" min={100} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Their Age (optional)</label>
          <input type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" className="input text-sm" />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mb-4">
        {loading ? <><FiRefreshCw size={14} className="animate-spin" /> Finding gifts…</> : <><FiZap size={14} /> Get Recommendations</>}
      </button>

      <AnimatePresence>
        {recs && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-2">
            {recs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 sm:col-span-2">No matches found — try a different budget.</p>
            ) : recs.map((r, i) => (
              <Link key={i} to={r.giftId ? `/gifts/${r.giftId}` : '/gifts'}
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors">
                {r.image && <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{r.reason}</p>
                  <p className="text-sm font-bold text-primary-500">₹{r.price}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIGiftRecommendations;
