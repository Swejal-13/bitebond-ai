/**
 * Occasion Planner — entry point for remote celebrations
 * Step 1: Pick occasion → Step 2: Pick what to send (food/gift/both) → routes to relevant pages
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiHeart } from 'react-icons/fi';
import { OCCASIONS } from '../utils/occasions';
import AICelebrationPlanner from '../components/ai/AICelebrationPlanner';

const SEND_OPTIONS = [
  { key: 'food',  emoji: '🍕', label: 'Order Food', desc: 'Surprise them with their favourite meal', path: '/restaurants' },
  { key: 'gift',  emoji: '🎁', label: 'Send a Gift', desc: 'Cakes, flowers, chocolates & more', path: '/gifts' },
  { key: 'combo', emoji: '✨', label: 'Food + Gift Combo', desc: 'The ultimate celebration package', path: '/gifts' },
];

const OccasionPlannerPage = () => {
  const navigate = useNavigate();
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  const handleSendOption = (option) => {
    // Store occasion context in sessionStorage so downstream pages (cart/checkout) can read it
    sessionStorage.setItem('bb_occasion', selectedOccasion?.key || 'none');
    sessionStorage.setItem('bb_remote_intent', 'true');
    sessionStorage.setItem('bb_send_mode', option.key);
    navigate(option.path);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          <FiHeart size={13} /> Remote Celebration Planner
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
          What are we celebrating? 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Pick an occasion and we'll help you send the perfect food, gift, or both — anywhere in the world.
        </p>
      </motion.div>

      {/* Occasion grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {OCCASIONS.map((o, i) => (
          <motion.button
            key={o.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelectedOccasion(o)}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden group ${
              selectedOccasion?.key === o.key
                ? 'border-primary-400 shadow-glow-primary'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {selectedOccasion?.key === o.key && (
              <div className={`absolute inset-0 bg-gradient-to-br ${o.color} opacity-10`} />
            )}
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform duration-200">{o.emoji}</span>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{o.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{o.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Send options — appear after occasion selected */}
      {selectedOccasion && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">{selectedOccasion.emoji}</span>
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
              Great choice! How would you like to celebrate {selectedOccasion.label.toLowerCase()}?
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {SEND_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSendOption(opt)}
                className="card-hover p-6 text-left group"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-200">{opt.emoji}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{opt.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{opt.desc}</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-primary-500 group-hover:gap-2 transition-all">
                  Get started <FiArrowRight size={14} />
                </span>
              </motion.button>
            ))}
          </div>

          {/* AI Celebration Planner */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AICelebrationPlanner occasion={selectedOccasion.key} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OccasionPlannerPage;
