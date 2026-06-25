import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiEdit3 } from 'react-icons/fi';

const CAT_COLORS = {
  cake:          'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  flowers:       'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  chocolates:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  personalized:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  greeting_card: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  hamper:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const CAT_LABELS = {
  cake: 'Cake', flowers: 'Flowers', chocolates: 'Chocolates',
  personalized: 'Personalized', greeting_card: 'Card', hamper: 'Hamper',
};

const GiftCard = ({ gift, index = 0 }) => {
  const { _id, name, images, category, basePrice, variants, rating, ratingCount, isBestseller, isPersonalizable } = gift;
  const image = images?.[0] || '';
  const minPrice = variants?.length > 0 ? Math.min(...variants.map((v) => v.price)) : basePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/gifts/${_id}`} className="block group">
        <div className="card-hover overflow-hidden">
          {/* Image */}
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
            {image ? (
              <img src={image} alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-700">
                🎁
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isBestseller && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  🔥 Bestseller
                </span>
              )}
            </div>

            {/* Personalisable badge */}
            {isPersonalizable && (
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 dark:bg-black/70 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                  <FiEdit3 size={10} /> Custom
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category + Rating */}
            <div className="flex items-center justify-between mb-2">
              <span className={`badge text-xs ${CAT_COLORS[category] || 'bg-gray-100 text-gray-600'}`}>
                {CAT_LABELS[category] || category}
              </span>
              {rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <FiStar size={11} className="text-amber-400" fill="currentColor" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{rating.toFixed(1)}</span>
                  {ratingCount > 0 && <span>({ratingCount > 999 ? `${(ratingCount/1000).toFixed(1)}k` : ratingCount})</span>}
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors">
              {name}
            </h3>

            {/* Price + Variants */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">₹{minPrice}</span>
                {variants?.length > 1 && (
                  <span className="text-xs text-gray-400 ml-1">onwards</span>
                )}
              </div>
              <button className="btn-primary text-xs py-1.5 px-3">
                View Gift
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default GiftCard;
