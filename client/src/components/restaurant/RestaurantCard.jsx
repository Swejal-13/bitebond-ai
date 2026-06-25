/**
 * RestaurantCard Component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiTruck } from 'react-icons/fi';

const RestaurantCard = ({ restaurant, index = 0 }) => {
  const {
    _id, name, image, banner, cuisine, rating, ratingCount,
    deliveryTime, deliveryFee, priceRange, isOpen, isFeatured, address,
  } = restaurant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/restaurants/${_id}`} className="block group">
        <div className="card-hover overflow-hidden">
          {/* Image */}
          <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700">
                🍽️
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {isFeatured && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  ⭐ Featured
                </span>
              )}
              {!isOpen && (
                <span className="bg-gray-800/80 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Closed
                </span>
              )}
            </div>

            {/* Price range */}
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 dark:bg-black/70 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">
                {priceRange}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Name + Rating */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug group-hover:text-primary-500 transition-colors line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-lg">
                <FiStar className="text-green-600 dark:text-green-400" size={12} fill="currentColor" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">{rating?.toFixed(1)}</span>
                {ratingCount > 0 && (
                  <span className="text-xs text-gray-400">({ratingCount > 999 ? `${(ratingCount / 1000).toFixed(1)}k` : ratingCount})</span>
                )}
              </div>
            </div>

            {/* Cuisine tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {cuisine?.slice(0, 3).map((c) => (
                <span key={c} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  {c}
                </span>
              ))}
            </div>

            {/* Delivery info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="flex items-center gap-1">
                <FiClock size={12} />
                <span>{deliveryTime} min</span>
              </div>
              <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-1">
                <FiTruck size={12} />
                <span>{deliveryFee === 0 ? 'Free delivery' : `₹${deliveryFee} delivery`}</span>
              </div>
              {address?.city && (
                <>
                  <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 ml-auto" />
                  <span className="ml-auto truncate">{address.city}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;
