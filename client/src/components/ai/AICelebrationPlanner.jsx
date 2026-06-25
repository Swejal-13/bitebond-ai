/**
 * AICelebrationPlanner
 * Takes occasion + budget, returns a generated food + gift + schedule plan
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiClock, FiGift, FiShoppingBag, FiRefreshCw } from 'react-icons/fi';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';

const AICelebrationPlanner = ({ occasion }) => {
  const [budget, setBudget] = useState(1500);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const data = await aiService.planCelebration({ occasion, budget });
      setPlan(data.plan);
    } catch {
      toast.error('Could not generate plan. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
        <FiZap className="text-purple-500" size={16} /> AI Celebration Planner
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Tell us your budget — we'll plan the food, gift, and schedule for you.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Total Budget (₹)</label>
          <input type="number" min={200} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))}
            className="input text-sm" />
        </div>
        <button onClick={handlePlan} disabled={loading}
          className="btn-primary py-2.5 px-5 mt-5 flex items-center gap-2 whitespace-nowrap">
          {loading ? <><FiRefreshCw size={14} className="animate-spin" /> Planning…</> : <><FiZap size={14} /> Plan It</>}
        </button>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">

            {plan.food && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30">
                <FiShoppingBag className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Food: {plan.food.suggestion}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated cost: ₹{plan.food.estimatedCost}</p>
                </div>
              </div>
            )}

            {plan.gift && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30">
                <FiGift className="text-pink-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Gift: {plan.gift.suggestion}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated cost: ₹{plan.gift.estimatedCost}</p>
                </div>
              </div>
            )}

            {plan.schedule?.length > 0 && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <FiClock size={12} /> Suggested Schedule
                </p>
                <div className="space-y-1.5">
                  {plan.schedule.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="badge badge-primary text-xs">{s.time}</span>
                      <span className="text-gray-600 dark:text-gray-400">{s.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Estimated Cost</span>
              <span className="text-lg font-bold text-primary-500">₹{plan.totalEstimatedCost}</span>
            </div>

            {plan.tip && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">💡 {plan.tip}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICelebrationPlanner;
